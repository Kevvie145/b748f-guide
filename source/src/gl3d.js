/* 747-8F Tech Guide — self-contained WebGL renderer and procedural 747-8F model.
   World units are metres: x aft from the nose, y to the right wing, z up from the ground. */
(function () {
  "use strict";
  const B = (window.B748 = window.B748 || { chapters: {} });
  const G = (B.G3 = {});

  /* ───────── math (column-major mat4) ───────── */
  const I4 = () => { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; };
  function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function persp(fovy, asp, n, f) { const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16); m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = (2 * f * n) / (n - f); return m; }
  function ortho(l, r, b, t, n, f) { const m = I4(); m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n); m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); return m; }
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  function lookAt(e, t, up) {
    const z = norm(sub(e, t)), x = norm(cross(up, z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
  }
  const T = (x, y, z) => { const m = I4(); m[12] = x; m[13] = y; m[14] = z; return m; };
  const RY = (a) => { const c = Math.cos(a), s = Math.sin(a), m = I4(); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; };
  const RX = (a) => { const c = Math.cos(a), s = Math.sin(a), m = I4(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; };
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  G.math = { mul, lookAt, persp, ortho };

  /* ───────── fuselage definition ───────── */
  const LEN = 76.3;
  const hw = (x) => x < 11 ? 3.25 * Math.sqrt(Math.max(0, 1 - (1 - x / 11) ** 2)) : x <= 56 ? 3.25 : 3.25 - 2.8 * ((x - 56) / (LEN - 56)) ** 1.7;
  const zb = (x) => x < 14 ? 2.1 + 2.7 * (1 - x / 14) ** 2.2 : x <= 44 ? 2.1 : 2.1 + 3.9 * ((x - 44) / (LEN - 44)) ** 1.9;
  const zt = (x) => x < 5.2 ? 4.8 + 2.95 * Math.sqrt(Math.max(0, 1 - (1 - x / 5.2) ** 2)) : x < 10 ? 7.75 + 0.75 * smooth((x - 5.2) / 4.8) : x <= 64 ? 8.5 : 8.5 - 1.8 * ((x - 64) / (LEN - 64)) ** 1.5;
  const crown = (x) => x < 5.2 ? zt(x) : x < 8.8 ? 7.75 + 2.14 * Math.sin((Math.PI / 2) * ((x - 5.2) / 3.6)) : x <= 20 ? 9.89 : x < 30 ? 9.89 - (9.89 - 8.5) * smooth((x - 20) / 10) : zt(x);
  function ring(x, th) {
    const c = Math.cos(th), s = Math.sin(th);
    const b = zb(x), t = zt(x), zc = (b + t) / 2, hz = (t - b) / 2;
    const H = Math.max(0, crown(x) - t), up = Math.max(0, -c);
    const k = Math.min(1, H / 1.4);
    return [x, hw(x) * s * (1 - 0.2 * k * up * up), zc - hz * c + H * up ** 1.5];
  }
  G.ring = ring;
  function thetaAt(x, z, side) {
    let lo = side === "R" ? 0 : Math.PI * 2, hi = Math.PI;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ring(x, m)[2] < z) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  G.thetaAt = thetaAt;

  /* ───────── mesh helpers ───────── */
  function grid(rows, opt = {}) {
    const p = [], uv = [], col = [], idx = [];
    const R = rows.length, K = rows[0].length;
    rows.forEach((row, j) => row.forEach((v, k) => { p.push(v[0], v[1], v[2]); uv.push(v[3] || 0, v[4] || 0); col.push(...(v[5] || [1, 1, 1])); }));
    for (let j = 0; j < R - 1; j++) for (let k = 0; k < K - 1; k++) { const a = j * K + k, b = a + K; idx.push(a, b, b + 1, a, b + 1, a + 1); }
    return finish({ p, uv, col, idx }, opt.flat);
  }
  function fan(center, pts, colr) {
    const p = [...center], uv = [0, 0], col = [...colr], idx = [];
    pts.forEach((v, i) => { p.push(v[0], v[1], v[2]); uv.push(0, 0); col.push(...colr); if (i) idx.push(0, i, i + 1); });
    return finish({ p, uv, col, idx });
  }
  function finish(m) {
    const n = new Float32Array(m.p.length);
    for (let i = 0; i < m.idx.length; i += 3) {
      const a = m.idx[i] * 3, b = m.idx[i + 1] * 3, c = m.idx[i + 2] * 3;
      const e1 = [m.p[b] - m.p[a], m.p[b + 1] - m.p[a + 1], m.p[b + 2] - m.p[a + 2]], e2 = [m.p[c] - m.p[a], m.p[c + 1] - m.p[a + 1], m.p[c + 2] - m.p[a + 2]];
      const f = cross(e1, e2);
      for (const v of [a, b, c]) { n[v] += f[0]; n[v + 1] += f[1]; n[v + 2] += f[2]; }
    }
    for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
    return { p: new Float32Array(m.p), n, uv: new Float32Array(m.uv), col: new Float32Array(m.col), idx: m.idx.length > 65000 ? new Uint32Array(m.idx) : new Uint16Array(m.idx) };
  }
  function mirror(m) {
    const p = m.p.slice(); for (let i = 1; i < p.length; i += 3) p[i] = -p[i];
    const n = m.n.slice(); for (let i = 1; i < n.length; i += 3) n[i] = -n[i];
    const idx = m.idx.slice(); for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    return { ...m, p, n, idx };
  }
  function airfoil(K, t) {
    const pts = [];
    for (let k = 0; k <= K; k++) { const xc = (1 - Math.cos((Math.PI * k) / K)) / 2; pts.push(xc); }
    const yt = (x) => 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    const cam = (x) => 0.02 * 4 * x * (1 - x) * 0.6;
    const out = [];
    for (let k = K; k >= 0; k--) out.push([pts[k], cam(pts[k]) + yt(pts[k])]);
    for (let k = 1; k <= K; k++) out.push([pts[k], cam(pts[k]) - yt(pts[k])]);
    return out;
  }
  function loftWing(secs, K, axis) {
    // secs: [{s (span coord), le, c, t, h (height or lateral offset)}]
    const rows = secs.map((S) => airfoil(K, S.t).map(([xc, yc]) => axis === "z"
      ? [S.le + xc * S.c, S.s, S.h + yc * S.c]
      : [S.le + xc * S.c, yc * S.c * 0.9, S.s]));
    return { rows, mesh: grid(rows) };
  }
  function lathe(prof, seg, cx, cy, cz) {
    const rows = prof.map(([s, r]) => { const row = []; for (let k = 0; k <= seg; k++) { const a = (k / seg) * Math.PI * 2; row.push([cx + s, cy + r * Math.cos(a), cz + r * Math.sin(a)]); } return row; });
    return grid(rows);
  }
  function box(x0, x1, y0, y1, z0, z1) {
    const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    const F = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]];
    const p = [], idx = [], uv = [], col = [];
    F.forEach((f) => { const b = p.length / 3; f.forEach((i) => { p.push(...P[i]); uv.push(0, 0); col.push(1, 1, 1); }); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); });
    return finish({ p, uv, col, idx });
  }
  function cyl(x, y, z, r, w, seg, axis) {
    const rows = [];
    for (const [d, rr] of [[-w / 2, 0], [-w / 2, r], [w / 2, r], [w / 2, 0]]) {
      const row = []; for (let k = 0; k <= seg; k++) { const a = (k / seg) * Math.PI * 2, c = Math.cos(a) * rr, s = Math.sin(a) * rr;
        row.push(axis === "y" ? [x + c, y + d, z + s] : [x + c, y + s, z + d]); } rows.push(row);
    }
    return grid(rows);
  }

  /* ───────── the airplane ───────── */
  const XCUT = 5.6, ZCUT = 7.75, HINGE = [5.6, 0, 7.8];
  const SIDE = { x0: 49.6, x1: 53.0, z0: 4.7, z1: 7.8 };
  const DARK = [0.22, 0.24, 0.27];
  function buildModel() {
    const parts = [];
    const N = 56;
    const xs = [0, 0.04, 0.12, 0.25, 0.45, 0.7, 1.0, 1.4, 1.9, 2.5, 3.2, 4.0, 4.8, XCUT];
    for (let x = 6.2; x < 12; x += 0.6) xs.push(+x.toFixed(2));
    for (let x = 12; x <= 70; x += 1.5) xs.push(x);
    xs.push(71.5, 72.8, 74, 75, 75.7, 76.1, LEN);
    const rowAt = (x, clamp) => {
      const row = [], yc = crown(x) > ZCUT ? Math.abs(ring(x, thetaAt(x, ZCUT, "R"))[1]) : 0;
      for (let k = 0; k <= N; k++) {
        const th = (k / N) * Math.PI * 2; let v = ring(x, th);
        if (clamp === "lo" && v[2] > ZCUT) v = [v[0], v[1], ZCUT];
        if (clamp === "hi" && v[2] < ZCUT) v = [v[0], Math.max(-yc, Math.min(yc, v[1])), ZCUT];
        row.push([v[0], v[1], v[2], x / LEN, k / N]);
      }
      return row;
    };
    const fwd = xs.filter((x) => x <= XCUT), aft = xs.filter((x) => x >= XCUT);
    parts.push({ id: "fus", mesh: grid(aft.map((x) => rowAt(x))), tex: "skin", spec: 0.55 });
    parts.push({ id: "chin", mesh: grid(fwd.map((x) => rowAt(x, "hi"))), tex: "skin", spec: 0.55 });
    parts.push({ id: "nose", mesh: grid(fwd.map((x) => rowAt(x, "lo"))), tex: "skin", spec: 0.55, hinge: "nose" });
    // door aft face and the cargo opening behind it
    const lowRing = (x, dx) => { const r = []; for (let k = 0; k <= N; k++) { const v = ring(x, (k / N) * Math.PI * 2); r.push([x + dx, v[1] * 0.995, Math.min(v[2], ZCUT)]); } return r; };
    parts.push({ id: "noseCap", mesh: fan([XCUT - 0.03, 0, 5.4], lowRing(XCUT, -0.03), DARK), color: [1, 1, 1], hinge: "nose" });
    parts.push({ id: "hold", mesh: fan([9.5, 0, 5.4], lowRing(9.5, 0), [0.16, 0.17, 0.19]), color: [1, 1, 1] });
    parts.push({ id: "floor", mesh: box(XCUT, 9.5, -2.9, 2.9, 4.45, 4.55), color: [0.42, 0.44, 0.46] });
    // side cargo door panel (left), offset just outside the skin
    const drows = [];
    for (let i = 0; i <= 8; i++) {
      const x = SIDE.x0 + ((SIDE.x1 - SIDE.x0) * i) / 8, a0 = thetaAt(x, SIDE.z1, "L"), a1 = thetaAt(x, SIDE.z0, "L"), row = [];
      for (let j = 0; j <= 8; j++) { const th = a0 + ((a1 - a0) * j) / 8; const v = ring(x, th); row.push([v[0], v[1] - 0.035, v[2], x / LEN, th / (Math.PI * 2)]); }
      drows.push(row);
    }
    const hingePt = ring((SIDE.x0 + SIDE.x1) / 2, thetaAt((SIDE.x0 + SIDE.x1) / 2, SIDE.z1, "L"));
    parts.push({ id: "sideDoor", mesh: grid(drows), color: [0.957, 0.961, 0.953], spec: 0.55, hinge: "side", hingePt });
    // wings
    const wsec = [
      { s: 2.6, le: 25.0, c: 16.6, t: 0.135, h: 3.55 }, { s: 12, le: 32.8, c: 10.4, t: 0.105, h: 4.55 },
      { s: 31.5, le: 49.2, c: 5.8, t: 0.085, h: 6.6 }, { s: 34.2, le: 54.3, c: 1.35, t: 0.08, h: 6.95 }
    ];
    const W = loftWing(wsec, 14, "z");
    const tipRow = W.rows[W.rows.length - 1], tc = tipRow.reduce((a, v) => [a[0] + v[0] / tipRow.length, a[1] + v[1] / tipRow.length, a[2] + v[2] / tipRow.length], [0, 0, 0]);
    const wingTip = fan(tc, tipRow, [1, 1, 1]);
    for (const m of [W.mesh, wingTip]) { parts.push({ id: "wing", mesh: m, color: [0.86, 0.88, 0.9], spec: 0.35 }); parts.push({ id: "wing", mesh: mirror(m), color: [0.86, 0.88, 0.9], spec: 0.35 }); }
    // flap track fairings
    for (const [y, x0, z] of [[7.5, 38.5, 3.85], [15.5, 41.5, 4.55], [22.5, 45.2, 5.2]]) {
      const f = lathe([[0, 0.02], [0.8, 0.28], [3.0, 0.36], [5.6, 0.22], [6.6, 0.02]], 10, x0, y, z - 0.25);
      parts.push({ id: "ftf", mesh: f, color: [0.82, 0.84, 0.86], spec: 0.3 }); parts.push({ id: "ftf", mesh: mirror(f), color: [0.82, 0.84, 0.86], spec: 0.3 });
    }
    // horizontal stabilizer and fin
    const Hs = loftWing([{ s: 1.0, le: 63.0, c: 10.8, t: 0.1, h: 7.15 }, { s: 11, le: 71.6, c: 2.6, t: 0.08, h: 8.35 }], 10, "z");
    for (const m of [Hs.mesh]) { parts.push({ id: "stab", mesh: m, color: [0.93, 0.94, 0.94], spec: 0.4 }); parts.push({ id: "stab", mesh: mirror(m), color: [0.93, 0.94, 0.94], spec: 0.4 }); }
    const Fn = loftWing([{ s: 7.6, le: 59.4, c: 15.8, t: 0.11 }, { s: 19.4, le: 72.6, c: 3.6, t: 0.09 }], 12, "y");
    parts.push({ id: "fin", mesh: Fn.mesh, color: [0.95, 0.96, 0.96], spec: 0.45 });
    // engines
    const nac = [[0, 1.36], [0.12, 1.52], [0.6, 1.62], [2.2, 1.64], [3.6, 1.56], [4.5, 1.34]];
    const core = [[4.4, 1.12], [5.3, 1.02], [6.3, 0.82], [6.9, 0.64]];
    const plug = [[6.8, 0.5], [7.3, 0.34], [7.75, 0.04]];
    const ENG = [[27.4, 11.9, 2.55, 4.55], [35.2, 21.1, 3.65, 5.55]];
    for (const [x, y, z, wz] of ENG) {
      const parts1 = [
        { mesh: lathe(nac, 28, x, y, z), color: [0.95, 0.96, 0.96], spec: 0.6 },
        { mesh: lathe([[0.02, 1.36], [0.3, 1.32], [0.55, 0.05]], 28, x, y, z), color: [0.16, 0.17, 0.19], spec: 0.2 },
        { mesh: lathe([[0.25, 0.42], [0.75, 0.3], [1.15, 0.02]], 16, x, y, z), color: [0.75, 0.77, 0.8], spec: 0.9 },
        { mesh: lathe(core, 24, x, y, z), color: [0.66, 0.68, 0.71], spec: 0.7 },
        { mesh: lathe(plug, 16, x, y, z), color: [0.45, 0.46, 0.48], spec: 0.5 },
        { mesh: box(x + 1.4, x + 7.6, y - 0.28, y + 0.28, z + 1.2, wz - 0.1), color: [0.86, 0.88, 0.9], spec: 0.3 }
      ];
      parts1.forEach((q) => { parts.push({ id: "eng", ...q }); parts.push({ id: "eng", ...q, mesh: mirror(q.mesh) }); });
    }
    // landing gear (down)
    const tire = [0.12, 0.12, 0.13], strut = [0.55, 0.57, 0.6];
    const gearL = [];
    gearL.push({ mesh: cyl(7.7, 0.32, 0.62, 0.62, 0.36, 18, "y"), color: tire }, { mesh: cyl(7.7, -0.32, 0.62, 0.62, 0.36, 18, "y"), color: tire }, { mesh: box(7.6, 7.8, -0.08, 0.08, 0.6, 2.6), color: strut });
    for (const [x, y, top] of [[36.9, 6.365, 3.9], [38.7, 1.9, 2.4]]) for (const s of [1, -1]) {
      for (const dx of [-0.7, 0.7]) for (const dy of [-0.48, 0.48]) gearL.push({ mesh: cyl(x + dx, s * y + dy, 0.62, 0.62, 0.38, 18, "y"), color: tire });
      gearL.push({ mesh: box(x - 0.9, x + 0.9, s * y - 0.08, s * y + 0.08, 0.55, 0.7), color: strut }, { mesh: box(x - 0.12, x + 0.12, s * y - 0.12, s * y + 0.12, 0.6, top), color: strut });
    }
    gearL.forEach((g) => parts.push({ id: "gear", spec: 0.3, ...g }));
    return parts;
  }

  /* ───────── skin texture ───────── */
  function skinCanvas(reg) {
    const W = 4096, H = 1024, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    c.fillStyle = "#f4f5f3"; c.fillRect(0, 0, W, H);
    const U = (x) => (x / LEN) * W, V = (th) => (th / (Math.PI * 2)) * H;
    const pt = (x, z, side) => [U(x), V(thetaAt(x, z, side))];
    const poly = (pts, fill, stroke, lw) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } };
    const rect = (x0, x1, z0, z1, side, fill, stroke, lw) => {
      const pts = []; const n = 6;
      for (let i = 0; i <= n; i++) pts.push(pt(x0 + ((x1 - x0) * i) / n, z0, side));
      for (let i = 0; i <= n; i++) pts.push(pt(x1, z0 + ((z1 - z0) * i) / n, side));
      for (let i = n; i >= 0; i--) pts.push(pt(x0 + ((x1 - x0) * i) / n, z1, side));
      for (let i = n; i >= 0; i--) pts.push(pt(x0, z0 + ((z1 - z0) * i) / n, side));
      poly(pts, fill, stroke, lw);
    };
    const seam = "#a9b0b5", glass = "#1d2733";
    // windshield and flight deck side windows (painted by angle from the crown)
    const win = (x0, x1, a0, a1, b0, b1) => { for (const sgn of [1, -1]) poly([[U(x0), V(Math.PI + sgn * a0)], [U(x1), V(Math.PI + sgn * b0)], [U(x1), V(Math.PI + sgn * b1)], [U(x0), V(Math.PI + sgn * a1)]], glass, "#0d1218", 2); };
    win(5.55, 6.55, 0.06, 0.36, 0.09, 0.38);
    win(6.7, 7.75, 0.44, 0.66, 0.5, 0.68);
    win(7.9, 8.6, 0.56, 0.7, 0.6, 0.71);
    // upper deck windows
    for (const x of [11.2, 12.2]) for (const s of ["L", "R"]) rect(x, x + 0.32, 8.75, 9.2, s, glass, null);
    // nose door seam
    for (const s of ["L", "R"]) { c.strokeStyle = seam; c.lineWidth = 2; c.beginPath(); const a = pt(XCUT, 2.3, s), b = pt(XCUT, ZCUT, s); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.beginPath(); for (let x = 0.4; x <= XCUT; x += 0.2) { const p = pt(x, ZCUT - 0.01, "L"); x === 0.4 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1]); } c.stroke();
    c.beginPath(); for (let x = 0.4; x <= XCUT; x += 0.2) { const p = pt(x, ZCUT - 0.01, "R"); x === 0.4 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1]); } c.stroke();
    // doors: left side
    rect(13.3, 14.4, 4.75, 6.65, "L", null, seam, 2.5);
    rect(SIDE.x0, SIDE.x1, SIDE.z0, SIDE.z1, "L", "#20262c", seam, 2.5);
    // right side: upper deck door, lower cargo doors
    rect(12.6, 13.6, 7.95, 9.45, "R", null, seam, 2.5);
    rect(15.3, 18.6, 2.55, 4.25, "R", null, seam, 2.5);
    rect(46.6, 49.9, 2.75, 4.45, "R", null, seam, 2.5);
    rect(53.6, 54.8, 3.1, 4.25, "R", null, seam, 2.5);
    // registration, both sides of the aft fuselage
    if (reg) {
      const xL = 61.2, zc = 6.35, h = V(thetaAt(64, zc + 0.4, "L")) - V(thetaAt(64, zc - 0.4, "L"));
      c.fillStyle = "#1a1e22"; c.font = `700 ${Math.abs(h) | 0}px "Arial Narrow", Arial, sans-serif`; c.textBaseline = "middle";
      const yl = V(thetaAt(64, zc, "L")); c.textAlign = "left"; c.fillText(reg, U(xL), yl);
      const yr = V(thetaAt(64, zc, "R"));
      c.save(); c.translate(U(xL + 4.6), yr); c.rotate(Math.PI); c.textAlign = "left"; c.fillText(reg, 0, 0); c.restore();
    }
    return cv;
  }

  /* ───────── shaders ───────── */
  const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;attribute vec3 aC;
uniform mat4 uPV,uM;varying vec3 vN,vW,vC;varying vec2 vU;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vU=aU;vC=aC;gl_Position=uPV*w;}`;
  const FS = `precision mediump float;varying vec3 vN,vW,vC;varying vec2 vU;
uniform vec3 uCol,uEye,uSun,uViewDir;uniform sampler2D uTex;uniform float uUseTex,uSpec,uNight,uOrtho;
void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;
vec3 base=uCol*vC;if(uUseTex>.5)base*=texture2D(uTex,vU).rgb;
vec3 V=uOrtho>.5?-uViewDir:normalize(uEye-vW);vec3 L=normalize(uSun);
float d=max(dot(n,L),0.);float h=.5+.5*n.z;
float s=pow(max(dot(n,normalize(L+V)),0.),48.)*uSpec;float rim=pow(1.-max(dot(n,V),0.),3.);
vec3 amb=mix(vec3(.50,.52,.56),vec3(.92,.95,1.),h);
vec3 day=base*(amb*.62+d*vec3(.78,.76,.72))+s*.55+rim*.06;
vec3 night=base*(mix(vec3(.025,.03,.045),vec3(.09,.11,.16),h)+d*vec3(.05,.06,.09))+s*.06+rim*.03;
gl_FragColor=vec4(mix(day,night,uNight),1.);}`;
  const GVS = `attribute vec3 aP;attribute vec2 aU;attribute vec3 aC;uniform mat4 uPV;uniform vec3 uEye;varying vec2 vU;varying vec3 vC;
void main(){vec3 p=aP+normalize(uEye-aP)*.5;vU=aU;vC=aC;gl_Position=uPV*vec4(p,1.);}`;
  const GFS = `precision mediump float;varying vec2 vU;varying vec3 vC;uniform float uMode;
void main(){float a;if(uMode<.5){a=exp(-dot(vU,vU)*4.);}else{a=pow(max(1.-vU.x,0.),1.6)*(1.-abs(vU.y));}gl_FragColor=vec4(vC*a,a);}`;

  function prog(gl, vs, fs) {
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); loc[u.name] = gl.getUniformLocation(p, u.name); }
    const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i = 0; i < na; i++) { const a = gl.getActiveAttrib(p, i); loc[a.name] = gl.getAttribLocation(p, a.name); }
    return { p, loc };
  }

  /* ───────── exterior light positions ───────── */
  const t65 = (65 * Math.PI) / 180;
  G.LIGHTS = {
    lo_l: { at: [28.3, -6.6, 3.95], c: [1, 0.95, 0.82], s: 1.3, beam: [-1, 0, -0.06], len: 30, spread: 0.11, pool: true },
    lo_r: { at: [28.3, 6.6, 3.95], c: [1, 0.95, 0.82], s: 1.3, beam: [-1, 0, -0.06], len: 30, spread: 0.11, pool: true },
    li_l: { at: [26.6, -4.6, 3.75], c: [1, 0.95, 0.82], s: 1.3, beam: [-1, 0, -0.06], len: 30, spread: 0.11, pool: true },
    li_r: { at: [26.6, 4.6, 3.75], c: [1, 0.95, 0.82], s: 1.3, beam: [-1, 0, -0.06], len: 30, spread: 0.11, pool: true },
    rt_l: { at: [7.2, -0.45, 2.0], c: [1, 0.95, 0.85], s: 0.9, beam: [-Math.cos(t65), -Math.sin(t65), -0.12], len: 18, spread: 0.2, pool: true },
    rt_r: { at: [7.2, 0.45, 2.0], c: [1, 0.95, 0.85], s: 0.9, beam: [-Math.cos(t65), Math.sin(t65), -0.12], len: 18, spread: 0.2, pool: true },
    taxi: { at: [7.1, 0, 1.75], c: [1, 0.95, 0.85], s: 1.0, beam: [-1, 0, -0.1], len: 24, spread: 0.22, pool: true },
    bcn_u: { at: [26, 0, 9.65], c: [1, 0.12, 0.08], s: 1.6, flash: "bcn" },
    bcn_l: { at: [40, 0, 2.05], c: [1, 0.12, 0.08], s: 1.6, flash: "bcn" },
    nav: [{ at: [51.6, -32.9, 6.75], c: [1, 0.1, 0.06], s: 1.1 }, { at: [51.6, 32.9, 6.75], c: [0.15, 1, 0.35], s: 1.1 }, { at: [76.35, 0, 6.55], c: [1, 1, 1], s: 0.9 },
      { at: [55.4, -33.7, 6.8], c: [1, 1, 1], s: 0.6 }, { at: [55.4, 33.7, 6.8], c: [1, 1, 1], s: 0.6 }],
    strobe: [{ at: [53.2, -33.6, 6.9], c: [1, 1, 1], s: 2.0, flash: "str" }, { at: [53.2, 33.6, 6.9], c: [1, 1, 1], s: 2.0, flash: "str" }, { at: [76.2, 0, 6.4], c: [1, 1, 1], s: 1.6, flash: "str" }],
    wing: [{ at: [21.5, -3.3, 6.4], c: [1, 0.95, 0.85], s: 0.7, beam: [0.45, -1, -0.32], len: 26, spread: 0.3 }, { at: [21.5, 3.3, 6.4], c: [1, 0.95, 0.85], s: 0.7, beam: [0.45, 1, -0.32], len: 26, spread: 0.3 }],
    logo: [{ at: [66, -3.2, 7.9], c: [1, 0.95, 0.85], s: 0.6, beam: [0.25, 1, 1.0], len: 7, spread: 0.35 }, { at: [66, 3.2, 7.9], c: [1, 0.95, 0.85], s: 0.6, beam: [0.25, -1, 1.0], len: 7, spread: 0.35 }]
  };

  /* ───────── viewer ───────── */
  G.ok = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; } })();

  G.viewer = function (host, opt) {
    opt = Object.assign({ mode: "orbit", view: "plan", vb: [0, 0, 100, 100], night: false, reg: "JA15KZ", yaw: -2.35, pitch: 0.32, dist: 120, target: [38, 0, 5], doors: { nose: 0, side: 0 }, lights: null, ground: true, interactive: true }, opt);
    const cv = document.createElement("canvas");
    cv.className = "g3";
    host.appendChild(cv);
    const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true }) || cv.getContext("experimental-webgl");
    if (!gl) { cv.remove(); return null; }
    gl.getExtension("OES_element_index_uint");
    const P = prog(gl, VS, FS), GP = prog(gl, GVS, GFS);
    const parts = buildModel().map((pt) => {
      const m = pt.mesh, buf = (d, t = gl.ARRAY_BUFFER) => { const b = gl.createBuffer(); gl.bindBuffer(t, b); gl.bufferData(t, d, gl.STATIC_DRAW); return b; };
      return { ...pt, bp: buf(m.p), bn: buf(m.n), bu: buf(m.uv), bc: buf(m.col), bi: buf(m.idx, gl.ELEMENT_ARRAY_BUFFER), cnt: m.idx.length, big: m.idx instanceof Uint32Array, color: pt.color || [1, 1, 1] };
    });
    const tex = gl.createTexture();
    function setReg(reg) {
      const c = skinCanvas(reg);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const ani = gl.getExtension("EXT_texture_filter_anisotropic"); if (ani) gl.texParameterf(gl.TEXTURE_2D, ani.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    }
    setReg(opt.reg);
    // ground shadow
    const shadow = (() => {
      const S = 512, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d");
      const k = S / 90, ox = S / 2 - 38 * k, oy = S / 2;
      x.translate(ox, oy); x.scale(k, k);
      x.shadowColor = "rgba(0,0,0,1)"; x.shadowBlur = 14; x.fillStyle = "rgba(0,0,0,.9)";
      const P2 = (pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); };
      const fus = []; for (let X = 0; X <= LEN; X += 1) fus.push([X, hw(X)]); for (let X = LEN; X >= 0; X -= 1) fus.push([X, -hw(X)]); P2(fus);
      for (const s of [1, -1]) { P2([[25, 3 * s], [49.2, 31.5 * s], [54.3, 34.2 * s], [55.6, 34.2 * s], [55, 31.5 * s], [43.2, 12 * s], [41.6, 3 * s]]); P2([[63, 1 * s], [71.6, 11 * s], [74.2, 11 * s], [73.8, 1 * s]]); }
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const h = 45, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([38 - h, -h, 0.02, 0, 0, 38 + h, -h, 0.02, 1, 0, 38 + h, h, 0.02, 1, 1, 38 - h, -h, 0.02, 0, 0, 38 + h, h, 0.02, 1, 1, 38 - h, h, 0.02, 0, 1]), gl.STATIC_DRAW);
      return { t, b };
    })();
    const SVS = `attribute vec3 aP;attribute vec2 aU;uniform mat4 uPV;varying vec2 vU;void main(){vU=aU;gl_Position=uPV*vec4(aP,1.);}`;
    const SFS = `precision mediump float;varying vec2 vU;uniform sampler2D uTex;uniform float uA;void main(){gl_FragColor=vec4(0.,0.,0.,texture2D(uTex,vec2(vU.x,1.-vU.y)).a*uA);}`;
    const SP = prog(gl, SVS, SFS);
    const gbuf = gl.createBuffer();

    let st = { ...opt }, dirty = true, raf = 0, visible = true, t0 = performance.now();
    const ro = new ResizeObserver(() => { dirty = true; kick(); }); ro.observe(host);
    const io = "IntersectionObserver" in window ? new IntersectionObserver((e) => { visible = e[0].isIntersecting; kick(); }) : null; if (io) io.observe(host);

    function camera(w, h) {
      if (st.mode === "ortho") {
        const [vx, vy, vw, vh] = st.vb, asp = w / h, vasp = vw / vh;
        let l = vx, r = vx + vw, b = -(vy + vh), t = -vy;
        if (asp > vasp) { const ex = (vh * asp - vw) / 2; l -= ex; r += ex; } else { const ey = (vw / asp - vh) / 2; b -= ey; t += ey; }
        const V = { plan: [[0, 0, 300], [0, 1, 0]], side: [[0, -300, 0], [0, 0, 1]], front: [[-300, 0, 0], [0, 0, 1]], top: [[0, 0, 300], [-1, 0, 0]] }[st.view];
        const view = lookAt(V[0], [0, 0, 0], V[1]);
        return { pv: mul(ortho(l, r, b, t, 1, 700), view), eye: V[0], dir: norm(sub([0, 0, 0], V[0])), view };
      }
      const e = [st.target[0] + st.dist * Math.cos(st.pitch) * Math.cos(st.yaw), st.target[1] + st.dist * Math.cos(st.pitch) * Math.sin(st.yaw), st.target[2] + st.dist * Math.sin(st.pitch)];
      const view = lookAt(e, st.target, [0, 0, 1]);
      return { pv: mul(persp(0.52, w / h, 2, 900), view), eye: e, dir: norm(sub(st.target, e)), view };
    }
    function partModel(p) {
      if (p.hinge === "nose") { const a = smooth(st.doors.nose) * 1.05; return mul(T(...HINGE), mul(RY(a), T(-HINGE[0], -HINGE[1], -HINGE[2]))); }
      if (p.hinge === "side") { const a = -smooth(st.doors.side) * 2.0, h = p.hingePt; return mul(T(0, h[1], h[2]), mul(RX(a), T(0, -h[1], -h[2]))); }
      return null;
    }
    const ID = I4();
    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
      const cam = camera(w, h);
      // shadow
      if (st.mode === "orbit" && st.ground) {
        gl.useProgram(SP.p); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        gl.uniformMatrix4fv(SP.loc.uPV, false, cam.pv); gl.uniform1f(SP.loc.uA, st.night ? 0.25 : 0.32);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shadow.t); gl.uniform1i(SP.loc.uTex, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, shadow.b); gl.enableVertexAttribArray(SP.loc.aP); gl.vertexAttribPointer(SP.loc.aP, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(SP.loc.aU); gl.vertexAttribPointer(SP.loc.aU, 2, gl.FLOAT, false, 20, 12);
        gl.drawArrays(gl.TRIANGLES, 0, 6); gl.depthMask(true); gl.disable(gl.BLEND);
        gl.disableVertexAttribArray(SP.loc.aU); gl.disableVertexAttribArray(SP.loc.aP);
      }
      gl.useProgram(P.p);
      const L = P.loc;
      gl.uniformMatrix4fv(L.uPV, false, cam.pv);
      gl.uniform3fv(L.uEye, cam.eye); gl.uniform3fv(L.uViewDir, cam.dir); gl.uniform1f(L.uOrtho, st.mode === "ortho" ? 1 : 0);
      gl.uniform3fv(L.uSun, norm(st.mode === "ortho" && st.view === "side" ? [0.35, -0.8, 0.55] : [-0.45, -0.55, 0.75]));
      gl.uniform1f(L.uNight, st.night ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(L.uTex, 0);
      for (const a of ["aP", "aN", "aU", "aC"]) gl.enableVertexAttribArray(L[a]);
      for (const p of parts) {
        if (p.id === "gear" && st.gear === false) continue;
        gl.uniformMatrix4fv(L.uM, false, partModel(p) || ID);
        gl.uniform3fv(L.uCol, p.color); gl.uniform1f(L.uUseTex, p.tex ? 1 : 0); gl.uniform1f(L.uSpec, p.spec || 0.3);
        gl.bindBuffer(gl.ARRAY_BUFFER, p.bp); gl.vertexAttribPointer(L.aP, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, p.bn); gl.vertexAttribPointer(L.aN, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, p.bu); gl.vertexAttribPointer(L.aU, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, p.bc); gl.vertexAttribPointer(L.aC, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.bi);
        gl.drawElements(gl.TRIANGLES, p.cnt, p.big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      }
      for (const a of ["aP", "aN", "aU", "aC"]) gl.disableVertexAttribArray(L[a]);
      if (st.lights) glows(cam);
    }
    function glows(cam) {
      const now = (performance.now() - t0) / 1000;
      const flashOn = (k) => k === "bcn" ? (now % 1.1) < 0.13 : k === "str" ? ((now % 1.3) < 0.08 || ((now % 1.3) > 0.18 && (now % 1.3) < 0.26)) : true;
      const v = cam.view, right = [v[0], v[4], v[8]], up = [v[1], v[5], v[9]];
      const quads = [], beams = [];
      const quad = (c, r, u, col) => { for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) quads.push(c[0] + r[0] * a + u[0] * b, c[1] + r[1] * a + u[1] * b, c[2] + r[2] * a + u[2] * b, a, b, ...col); };
      const add = (Ld, inten) => {
        if (Ld.flash && !flashOn(Ld.flash)) return;
        const s = Ld.s * (st.mode === "ortho" ? 1.6 : 1) * (0.7 + 0.3 * inten);
        quad(Ld.at, right.map((x) => x * s * 2.4), up.map((x) => x * s * 2.4), Ld.c.map((x) => x * 0.55 * inten));
        quad(Ld.at, right.map((x) => x * s * 0.6), up.map((x) => x * s * 0.6), [inten, inten, inten]);
        if (Ld.beam) {
          const d = norm(Ld.beam), L2 = Ld.len, a = Ld.spread, side = norm(cross(d, Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), up2 = cross(side, d);
          const seg = 14, col = Ld.c.map((x) => x * 0.16 * inten);
          for (let i = 0; i < seg; i++) {
            const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
            const e = (ang) => { const r = Math.tan(a) * L2; return [Ld.at[0] + d[0] * L2 + (side[0] * Math.cos(ang) + up2[0] * Math.sin(ang)) * r, Ld.at[1] + d[1] * L2 + (side[1] * Math.cos(ang) + up2[1] * Math.sin(ang)) * r, Math.max(0.05, Ld.at[2] + d[2] * L2 + (side[2] * Math.cos(ang) + up2[2] * Math.sin(ang)) * r)]; };
            const p0 = e(a0), p1 = e(a1);
            beams.push(...Ld.at, 0, 0, ...col, ...p0, 1, 0, ...col, ...p1, 1, 0, ...col);
          }
          if (Ld.pool && d[2] < 0) {
            const tH = Ld.at[2] / -d[2], gx = Ld.at[0] + d[0] * Math.min(tH, L2), gy = Ld.at[1] + d[1] * Math.min(tH, L2), r = Math.min(tH, L2) * Math.tan(a) * 2.2;
            const d2 = norm([d[0], d[1], 0]);
            quad([gx, gy, 0.03], [d2[0] * r * 1.7, d2[1] * r * 1.7, 0], [-d2[1] * r, d2[0] * r, 0], Ld.c.map((x) => x * 0.35 * inten));
          }
        }
      };
      for (const [k, val] of Object.entries(st.lights)) {
        if (!val) continue; const def = G.LIGHTS[k]; if (!def) continue;
        (Array.isArray(def) ? def : [def]).forEach((d) => add(d, val === "dim" ? 0.35 : 1));
      }
      gl.useProgram(GP.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
      gl.uniformMatrix4fv(GP.loc.uPV, false, cam.pv); gl.uniform3fv(GP.loc.uEye, st.mode === "ortho" ? cam.eye.map((x) => x * 3) : cam.eye);
      const run = (arr, mode) => {
        if (!arr.length) return;
        gl.uniform1f(GP.loc.uMode, mode);
        gl.bindBuffer(gl.ARRAY_BUFFER, gbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(GP.loc.aP); gl.vertexAttribPointer(GP.loc.aP, 3, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(GP.loc.aU); gl.vertexAttribPointer(GP.loc.aU, 2, gl.FLOAT, false, 32, 12);
        gl.enableVertexAttribArray(GP.loc.aC); gl.vertexAttribPointer(GP.loc.aC, 3, gl.FLOAT, false, 32, 20);
        gl.drawArrays(gl.TRIANGLES, 0, arr.length / 8);
        gl.disableVertexAttribArray(GP.loc.aP); gl.disableVertexAttribArray(GP.loc.aU); gl.disableVertexAttribArray(GP.loc.aC);
      };
      run(beams, 1); run(quads, 0);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    const animating = () => st.lights && Object.entries(st.lights).some(([k, v]) => v && (k.startsWith("bcn") || k === "strobe"));
    function frame() {
      raf = 0;
      if (!visible) return;
      if (dirty || animating()) { draw(); dirty = false; }
      if (animating()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    // orbit interaction
    if (opt.interactive) {
      const pts = new Map(); let pinch0 = 0, dist0 = 0;
      cv.addEventListener("pointerdown", (e) => { if (st.mode !== "orbit") return; cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = st.dist; } });
      cv.addEventListener("pointermove", (e) => {
        if (!pts.has(e.pointerId)) return;
        const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 1) { st.yaw -= (e.clientX - prev[0]) * 0.008; st.pitch = Math.max(0.02, Math.min(1.45, st.pitch + (e.clientY - prev[1]) * 0.006)); }
        else if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); st.dist = Math.max(30, Math.min(260, dist0 * (pinch0 / d))); }
        dirty = true; kick();
      });
      const up = (e) => pts.delete(e.pointerId);
      cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
      cv.addEventListener("wheel", (e) => { if (st.mode !== "orbit") return; e.preventDefault(); st.dist = Math.max(30, Math.min(260, st.dist * (1 + Math.sign(e.deltaY) * 0.08))); dirty = true; kick(); }, { passive: false });
      cv.style.touchAction = "none";
    }
    kick();
    let animT = null;
    return {
      canvas: cv,
      set(o) {
        if (o.reg && o.reg !== st.reg) setReg(o.reg);
        if (o.doors) o.doors = { ...st.doors, ...o.doors };
        st = { ...st, ...o }; cv.style.cursor = st.mode === "orbit" ? "grab" : "default"; cv.style.touchAction = st.mode === "orbit" ? "none" : "auto"; dirty = true; kick();
      },
      get: () => st,
      tween(o, ms) {
        const from = { ...st }, keys = Object.keys(o).filter((k) => typeof o[k] === "number"), t1 = performance.now();
        cancelAnimationFrame(animT);
        const step = () => { const f = smooth(Math.min(1, (performance.now() - t1) / ms)); keys.forEach((k) => (st[k] = from[k] + (o[k] - from[k]) * f)); dirty = true; draw(); if (f < 1) animT = requestAnimationFrame(step); };
        step();
      },
      destroy() { cancelAnimationFrame(raf); cancelAnimationFrame(animT); ro.disconnect(); if (io) io.disconnect(); const ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); cv.remove(); }
    };
  };
})();
