/* 747-8F Tech Guide — panel kit. SVG flight deck hardware drawn after the AOM panel illustrations:
   tan overhead/aisle panels with white lettering, bat and paddle toggles, guarded switches, push-buttons,
   light-plate switches, rotary selectors, and the grey cargo door panels with round lamps and red-tipped toggles. */
(function () {
  "use strict";
  const B = (window.B748 = window.B748 || { chapters: {} });
  const K = (B.K = {});
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  K.defs = () => `<defs>
    <linearGradient id="pk-tan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ad8460"/><stop offset="1" stop-color="#9f7551"/></linearGradient>
    <linearGradient id="pk-grey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3d6d8"/><stop offset="1" stop-color="#c2c6c9"/></linearGradient>
    <radialGradient id="pk-metal" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#e4e7e9"/><stop offset=".55" stop-color="#959ba0"/><stop offset="1" stop-color="#4e5459"/></radialGradient>
    <radialGradient id="pk-knob" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d3d7da"/><stop offset="1" stop-color="#737a80"/></radialGradient>
    <radialGradient id="pk-dknob" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#9aa0a5"/><stop offset=".5" stop-color="#555b60"/><stop offset="1" stop-color="#25292c"/></radialGradient>
    <radialGradient id="pk-cream" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#e6d9bd"/><stop offset="1" stop-color="#a28d66"/></radialGradient>
    <linearGradient id="pk-paddle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bdb093"/><stop offset=".45" stop-color="#f3ebd9"/><stop offset="1" stop-color="#b8aa8b"/></linearGradient>
    <radialGradient id="pk-red" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ffb3a8"/><stop offset=".5" stop-color="#d42a1c"/><stop offset="1" stop-color="#6e0d06"/></radialGradient>
    <linearGradient id="pk-rocker" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f160d"/><stop offset=".5" stop-color="#cf2a1d"/><stop offset="1" stop-color="#8f160d"/></linearGradient>
    <filter id="pk-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3.2"/></filter>
    <filter id="pk-txtglow" x="-.3" y="-.6" width="1.6" height="2.2"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
  K.svg = (w, h, inner, label) => `<svg class="pk" viewBox="0 0 ${w} ${h}" role="group" aria-label="${esc(label || "panel")}">${K.defs()}${inner}</svg>`;
  const screw = (x, y) => `<g transform="translate(${x},${y})"><circle r="3.4" fill="url(#pk-metal)" stroke="#5c4330" stroke-width=".6"/><path d="M-2.2,0 H2.2" stroke="#3d2c1f" stroke-width=".9"/></g>`;
  K.tan = (x, y, w, h, scr = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#pk-tan)" stroke="#7a5638" stroke-width="2"/>` + (scr ? screw(x + 8, y + 8) + screw(x + w - 8, y + 8) + screw(x + 8, y + h - 8) + screw(x + w - 8, y + h - 8) : "");
  K.grey = (x, y, w, h, scr = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#pk-grey)" stroke="#8e9499" stroke-width="2"/>` + (scr ? [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].map(([a, b]) => `<g transform="translate(${x + a},${y + b})"><circle r="3.2" fill="url(#pk-metal)" stroke="#6e757a" stroke-width=".6"/><path d="M-2,0 H2" stroke="#454b50" stroke-width=".8"/></g>`).join("") : "");
  K.t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" class="pk-t${o.dark ? " d" : ""}" text-anchor="${o.a || "middle"}" font-size="${o.fs || 10.5}"${o.ref ? ` data-ref="${o.ref}"` : ""}>${esc(s)}</text>`;
  K.line = (x1, y1, x2, y2, dark) => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${dark ? "#6b7277" : "#efe8dc"}" stroke-width="1" fill="none" opacity=".85"/>`;

  /* ── toggle switches ── */
  // type: bat | dark | cream | paddle | logo | lock | red (red = horizontal, red ball knob)
  function lever(type, d) {
    if (type === "red") {
      if (d === 0) return `<circle r="6.2" fill="url(#pk-red)" stroke="#4a0a05" stroke-width=".6"/>`;
      const x = d * 13;
      return `<path d="M0,-2.3 L${x},-2.8 L${x},2.8 L0,2.3 Z" fill="#b9bfc4" stroke="#41474b" stroke-width=".6"/><circle cx="${x}" cy="0" r="6.4" fill="url(#pk-red)" stroke="#4a0a05" stroke-width=".6"/>`;
    }
    if (type === "lock") {
      const knob = d === 0 ? "" : `<g transform="scale(1,${d})"><path d="M-4,4 L-6.5,17 Q0,23 6.5,17 L4,4 Z" fill="#141618" stroke="#000" stroke-width=".6"/><ellipse cx="0" cy="18.2" rx="7" ry="4.6" fill="#1d2023"/></g>`;
      return `${d < 0 ? knob : ""}<rect x="-23" y="-8" width="46" height="16" rx="8" fill="#8a9095" stroke="#3b4044" stroke-width="1"/>${[-13, 0, 13].map((x) => `<circle cx="${x}" cy="0" r="4.6" fill="url(#pk-knob)" stroke="#4a5055" stroke-width=".7"/>`).join("")}${d > 0 ? knob : ""}`;
    }
    if (type === "paddle" || type === "logo") {
      const W = type === "logo" ? 13 : 8.5, L = type === "logo" ? 25 : 19;
      if (d === 0) return `<rect x="${-W}" y="-4" width="${2 * W}" height="8" rx="2" fill="url(#pk-paddle)" stroke="#6e6450"/>`;
      return `<g transform="scale(1,${d})"><path d="M-4,1 L4,1 L${W},${-L} L${-W},${-L} Z" fill="url(#pk-paddle)" stroke="#6e6450" stroke-width=".8"/>
        <path d="M${-W},${-L} L${W},${-L} L${W - 1.5},${-L - 4.5} L${-W + 1.5},${-L - 4.5} Z" fill="#faf5ea" stroke="#6e6450" stroke-width=".8"/>
        <path d="M0,0 L0,${-L}" stroke="#a49779" stroke-width=".7"/></g>`;
    }
    const grad = type === "cream" ? "pk-cream" : type === "dark" ? "pk-dknob" : "pk-knob";
    if (d === 0) return `<circle r="6.4" fill="url(#${grad})" stroke="#3c4145" stroke-width=".7"/><circle cx="-1.8" cy="-1.8" r="1.6" fill="#fff" opacity=".6"/>`;
    return `<g transform="scale(1,${d})"><path d="M-2.2,0 L-3,-11 L3,-11 L2.2,0 Z" fill="#a3a9ae" stroke="#3c4145" stroke-width=".6"/>
      <ellipse cx="0" cy="-13" rx="6.6" ry="5.6" fill="url(#${grad})" stroke="#3c4145" stroke-width=".8"/></g>`;
  }
  K.tog = (id, x, y, n, type, aria) => {
    const horiz = type === "red";
    const bezel = type === "lock" ? "" : horiz
      ? `<polygon points="8,0 4,6.9 -4,6.9 -8,0 -4,-6.9 4,-6.9" fill="url(#pk-metal)" stroke="#3b4044" stroke-width=".8"/><circle r="4" fill="#2b2f33"/>`
      : `<circle r="17" fill="none" stroke="#efe8dc" stroke-width="1.3"/><circle r="14" fill="url(#pk-metal)" stroke="#3b4044" stroke-width=".8"/><circle r="7.5" fill="#2b2f33"/>`;
    const hits = horiz
      ? `<rect class="hit" data-dir="-1" x="-24" y="-14" width="24" height="28"/><rect class="hit" data-dir="1" x="0" y="-14" width="24" height="28"/>`
      : `<rect class="hit" data-dir="-1" x="-24" y="-34" width="48" height="34"/><rect class="hit" data-dir="1" x="-24" y="0" width="48" height="34"/>`;
    return `<g class="pk-tog" data-tog="${id}" data-n="${n}" data-type="${type}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}">${bezel}<g data-lever></g>${hits}</g>`;
  };
  K.setTog = (root, id, i) => {
    const g = root.querySelector(`[data-tog="${id}"]`); if (!g) return;
    const n = +g.dataset.n, d = n === 2 ? [-1, 1][i] : [-1, 0, 1][i];
    g.querySelector("[data-lever]").innerHTML = lever(g.dataset.type, d);
    g.dataset.pos = i;
  };
  K.leverAt = (root, id, d) => { const g = root.querySelector(`[data-tog="${id}"]`); if (g) g.querySelector("[data-lever]").innerHTML = lever(g.dataset.type, d); };

  /* spring-loaded toggle: hold one side, springs back to centre */
  K.holdTog = (id, x, y, type, a, b, aria) => {
    const horiz = type === "red";
    const bezel = horiz
      ? `<polygon points="8,0 4,6.9 -4,6.9 -8,0 -4,-6.9 4,-6.9" fill="url(#pk-metal)" stroke="#3b4044" stroke-width=".8"/><circle r="4" fill="#2b2f33"/>`
      : `<circle r="17" fill="none" stroke="#efe8dc" stroke-width="1.3"/><circle r="14" fill="url(#pk-metal)" stroke="#3b4044" stroke-width=".8"/><circle r="7.5" fill="#2b2f33"/>`;
    const hits = horiz
      ? `<rect class="hit" data-hold="${id}" data-v="${a}" x="-26" y="-15" width="26" height="30"/><rect class="hit" data-hold="${id}" data-v="${b}" x="0" y="-15" width="26" height="30"/>`
      : `<rect class="hit" data-hold="${id}" data-v="${a}" x="-24" y="-34" width="48" height="34"/><rect class="hit" data-hold="${id}" data-v="${b}" x="-24" y="0" width="48" height="34"/>`;
    const keys = horiz ? { ArrowLeft: a, ArrowRight: b } : { ArrowUp: a, ArrowDown: b };
    return `<g class="pk-tog" data-tog="${id}" data-n="3" data-type="${type}" data-holdk="${id}" data-holdg='${JSON.stringify(keys)}' transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}">${bezel}<g data-lever></g>${hits}</g>`;
  };

  /* ── guarded switch (closed guard = middle position) ── */
  K.guard = (id, x, y, horiz, aria) => {
    const hits = horiz
      ? `<rect class="hit" data-dir="-1" x="-30" y="-16" width="20" height="32"/><rect class="hit" data-dir="0" x="-10" y="-16" width="20" height="32"/><rect class="hit" data-dir="1" x="10" y="-16" width="20" height="32"/>`
      : `<rect class="hit" data-dir="-1" x="-16" y="-30" width="32" height="20"/><rect class="hit" data-dir="0" x="-16" y="-10" width="32" height="20"/><rect class="hit" data-dir="1" x="-16" y="10" width="32" height="20"/>`;
    return `<g class="pk-guard" data-guard="${id}" data-h="${horiz ? 1 : 0}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}"><g data-gi></g>${hits}</g>`;
  };
  K.setGuard = (root, id, d) => {
    const g = root.querySelector(`[data-guard="${id}"]`); if (!g) return;
    const h = g.dataset.h === "1";
    const rot = h ? "rotate(-90)" : "";
    let s = `<g transform="${rot}"><rect x="-13" y="-27" width="26" height="54" fill="none" stroke="#efe8dc" stroke-width="1.3"/>`;
    if (d === 0) s += `<rect x="-11" y="-25" width="22" height="50" rx="2" fill="#0d0f11" stroke="#000"/><circle cx="0" cy="-19" r="2.3" fill="none" stroke="#7d848a" stroke-width=".9"/><path d="M-9,1 H-5 M-2,1 H2 M5,1 H9" stroke="#596066" stroke-width=".8"/><path d="M-8,20 V25 M8,20 V25" stroke="#3b4145" stroke-width="1"/>`;
    else s += `<rect x="-11" y="-25" width="22" height="50" fill="#5f5246" opacity=".55"/><circle r="8.5" fill="url(#pk-metal)" stroke="#3b4044" stroke-width=".7"/><circle r="4" fill="#2b2f33"/>
      <g transform="scale(1,${d})"><path d="M-1.8,0 L-2.4,-12 L2.4,-12 L1.8,0 Z" fill="#a3a9ae" stroke="#3c4145" stroke-width=".5"/><ellipse cx="0" cy="-14" rx="5.6" ry="4.8" fill="url(#pk-knob)" stroke="#3c4145" stroke-width=".7"/></g>
      <path d="M-11,-27 L11,-27 L13,-40 L-13,-40 Z" fill="#0d0f11" stroke="#000"/><circle cx="0" cy="-35" r="1.8" fill="none" stroke="#7d848a" stroke-width=".8"/>`;
    s += "</g>";
    g.querySelector("[data-gi]").innerHTML = s; g.dataset.pos = d;
  };

  /* ── push-buttons ── */
  K.pbtn = (id, x, y, top, bot, aria) => `<g class="pk-pb" data-pb="${id}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}">
    <rect x="-18" y="-18" width="36" height="36" rx="3" fill="none" stroke="#efe8dc" stroke-width="1.3"/><rect x="-14.5" y="-14.5" width="29" height="29" rx="1.5" fill="#0b0d0f" stroke="#000"/>
    <text class="lg" data-lg="t" y="-2.5" text-anchor="middle" font-size="8">${esc(top)}</text>${bot === "—" ? `<path class="lgl" data-lg="b" d="M-8,8 H8" stroke-width="1.6"/>` : `<text class="lg" data-lg="b" y="9" text-anchor="middle" font-size="7">${esc(bot)}</text>`}
    <rect class="hit" x="-18" y="-18" width="36" height="36"/></g>`;
  K.setPb = (root, id, top, bot) => {
    const g = root.querySelector(`[data-pb="${id}"]`); if (!g) return;
    const t = g.querySelector('[data-lg="t"]'), b = g.querySelector('[data-lg="b"]');
    t.setAttribute("class", "lg" + (top ? " on-" + top : "")); if (b) b.setAttribute("class", (b.tagName === "path" ? "lgl" : "lg") + (bot ? " on-" + bot : ""));
  };
  K.lsq = (id, x, y, l1, l2, aria) => `<g class="pk-lsq" data-lsq="${id}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || l1)}">
    <rect x="-17" y="-17" width="34" height="34" rx="2" fill="#24282b" stroke="#111"/><rect data-face x="-13" y="-13" width="26" height="26" rx="1.5" fill="#c9cdd0"/>
    <text x="0" y="26" class="pk-t" font-size="5.6" text-anchor="middle">${esc(l1)}</text>${l2 ? `<text x="0" y="32.5" class="pk-t" font-size="5.6" text-anchor="middle">${esc(l2)}</text>` : ""}
    <rect class="hit" x="-17" y="-17" width="34" height="34"/></g>`;
  K.setLsq = (root, id, on, red) => {
    const f = root.querySelector(`[data-lsq="${id}"] [data-face]`); if (!f) return;
    f.setAttribute("fill", on ? (red ? "#e3271a" : "#ffffff") : red ? "#7a1d16" : "#c9cdd0");
    f.setAttribute("filter", on ? "url(#pk-txtglow)" : "");
  };

  /* ── rotary selector ── */
  K.rot = (id, x, y, opts, aria, big) => {
    const r = big ? 15 : 12;
    return `<g class="pk-rot" data-rot="${id}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}">
      ${opts.map((o) => { const a = ((o.a - 90) * Math.PI) / 180; return `<path d="M${Math.cos(a) * (r + 3)},${Math.sin(a) * (r + 3)} L${Math.cos(a) * (r + 6)},${Math.sin(a) * (r + 6)}" stroke="#efe8dc" stroke-width="1.2"/>
        <text class="pk-t" data-rv="${o.v}" x="${Math.cos(a) * (r + 15)}" y="${Math.sin(a) * (r + 15) + 3.5}" text-anchor="middle" font-size="${o.fs || 9.5}">${esc(o.l)}</text>`; }).join("")}
      <circle r="${r + 1.5}" fill="#3a3f43"/><circle r="${r}" fill="url(#pk-cream)" stroke="#6b5f48" stroke-width=".8"/>
      <g data-ptr><rect x="-3.4" y="${-r - 2}" width="6.8" height="${2 * r + 4}" rx="3" fill="url(#pk-paddle)" stroke="#6e6450" stroke-width=".8"/><path d="M0,${-r - 1} L0,${-r + 6}" stroke="#2b2f33" stroke-width="1.6"/></g>
      <circle class="hit" r="${r + 4}"/></g>`;
  };
  K.setRot = (root, id, deg) => { const g = root.querySelector(`[data-rot="${id}"] [data-ptr]`); if (g) g.setAttribute("transform", `rotate(${deg})`); };

  /* ── grey-panel hardware ── */
  const LC = { green: ["#3be873", "#203a28"], white: ["#ffffff", "#50565a"], blue: ["#4590ff", "#1c2b47"], amber: ["#ffb21f", "#4a3a18"], red: ["#ff4b3c", "#4a1612"] };
  K.lamp = (id, x, y, c, r = 13) => `<g class="pk-lamp" data-lamp="${id}" data-c="${c}" transform="translate(${x},${y})">
    <circle data-glow r="${r * 1.9}" fill="${LC[c][0]}" opacity="0" filter="url(#pk-glow)"/><circle r="${r + 4}" fill="url(#pk-metal)" stroke="#4d5358" stroke-width=".8"/>
    <circle data-lens r="${r}" fill="${LC[c][1]}" stroke="#25292c" stroke-width=".8"/><ellipse cx="${-r * 0.32}" cy="${-r * 0.38}" rx="${r * 0.36}" ry="${r * 0.22}" fill="#fff" opacity=".28"/></g>`;
  K.setLamp = (root, id, on) => {
    const g = root.querySelector(`[data-lamp="${id}"]`); if (!g) return;
    const c = LC[g.dataset.c];
    g.querySelector("[data-lens]").setAttribute("fill", on ? c[0] : c[1]);
    g.querySelector("[data-glow]").setAttribute("opacity", on ? ".75" : "0");
  };
  K.jack = (x, y) => `<g transform="translate(${x},${y})"><circle r="9" fill="url(#pk-metal)" stroke="#3b4044"/><circle r="5.5" fill="#3a3f43"/><circle r="2.6" fill="#0c0e10"/></g>`;
  K.hexb = (id, x, y, aria) => `<g class="pk-hex" data-hexb="${id}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(aria || id)}">
    <polygon points="11,0 5.5,9.5 -5.5,9.5 -11,0 -5.5,-9.5 5.5,-9.5" fill="url(#pk-metal)" stroke="#3b4044"/><circle data-cap r="6" fill="#16191b" stroke="#000"/><rect class="hit" x="-12" y="-12" width="24" height="24"/></g>`;
  K.setHex = (root, id, down) => { const c = root.querySelector(`[data-hexb="${id}"] [data-cap]`); if (c) c.setAttribute("r", down ? 5 : 6); };
  K.rocker = (id, x, y, aria) => `<g class="pk-rock" data-rock="${id}" transform="translate(${x},${y})" aria-label="${esc(aria || id)}">
    <rect x="-17" y="-32" width="34" height="64" rx="3" fill="#2b3034" stroke="#111"/><g data-rk></g>
    <rect class="hit" data-hold="${id}" data-v="open" x="-17" y="-32" width="34" height="32"/><rect class="hit" data-hold="${id}" data-v="close" x="-17" y="0" width="34" height="32"/></g>`;
  K.setRocker = (root, id, v) => {
    const g = root.querySelector(`[data-rock="${id}"] [data-rk]`); if (!g) return;
    const top = v === "open" ? "#7d1409" : "url(#pk-rocker)", bot = v === "close" ? "#7d1409" : "url(#pk-rocker)";
    g.innerHTML = `<rect x="-13" y="-28" width="26" height="28" rx="2" fill="${top}" stroke="#4a0a05"/><rect x="-13" y="0" width="26" height="28" rx="2" fill="${bot}" stroke="#4a0a05"/><path d="M-13,0 H13" stroke="#3a0703" stroke-width="1.5"/>`;
  };

  /* ── generic interaction: toggles, guards and rotaries ── */
  // spec: { [id]: { kind: "tog"|"guard"|"rot", pos: [labels top→bottom or rotary values], get(), set(v) } }
  K.bind = (root, spec, onChange) => {
    const move = (id, dir) => {
      const s = spec[id]; if (!s) return;
      const i = s.pos.indexOf(s.get());
      let ni;
      if (s.kind === "guard") ni = dir === 0 ? 1 : dir < 0 ? 0 : 2;
      else ni = Math.max(0, Math.min(s.pos.length - 1, i + dir));
      if (ni !== i) { s.set(s.pos[ni]); onChange(id); }
    };
    root.addEventListener("click", (e) => {
      const rv = e.target.closest("[data-rv]");
      if (rv) { const g = rv.closest("[data-rot]"), s = spec[g.dataset.rot]; if (s) { s.set(rv.dataset.rv); onChange(g.dataset.rot); } return; }
      const h = e.target.closest(".hit[data-dir]");
      const g = e.target.closest("[data-tog],[data-guard]");
      if (g && h) { move(g.dataset.tog || g.dataset.guard, +h.dataset.dir); return; }
      const r = e.target.closest("[data-rot]");
      if (r) { const s = spec[r.dataset.rot]; if (s) { const i = s.pos.indexOf(s.get()); s.set(s.pos[(i + 1) % s.pos.length]); onChange(r.dataset.rot); } }
    });
    root.addEventListener("keydown", (e) => {
      const g = e.target.closest("[data-tog],[data-guard],[data-rot]"); if (!g) return;
      const id = g.dataset.tog || g.dataset.guard || g.dataset.rot, s = spec[id]; if (!s) return;
      const horiz = g.dataset.type === "red" || g.dataset.h === "1";
      const k = e.key;
      let dir = null;
      if (k === (horiz ? "ArrowLeft" : "ArrowUp")) dir = -1;
      if (k === (horiz ? "ArrowRight" : "ArrowDown")) dir = 1;
      if (k === "Enter" || k === " ") { e.preventDefault(); const i = s.pos.indexOf(s.get()); s.set(s.pos[(i + 1) % s.pos.length]); onChange(id); return; }
      if (dir !== null) { e.preventDefault(); if (s.kind === "guard") { const i = s.pos.indexOf(s.get()); const ni = Math.max(0, Math.min(2, i + dir)); s.set(s.pos[ni]); onChange(id); } else move(id, dir); }
    });
  };

  /* ── spring-loaded holds (press and hold, or tap to latch) ── */
  K.holds = (root, held, latch, onChange) => {
    const set = (k, v) => { if (held[k] === v) return; held[k] = v; onChange(k); };
    root.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("[data-hold]"); if (!b) return;
      e.preventDefault();
      const k = b.dataset.hold, v = b.dataset.v;
      if (latch()) { set(k, held[k] === v ? null : v); return; }
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
      set(k, v);
      const up = () => { set(k, null); b.removeEventListener("pointerup", up); b.removeEventListener("pointercancel", up); b.removeEventListener("lostpointercapture", up); };
      b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
    });
    root.addEventListener("keydown", (e) => {
      const g = e.target.closest("[data-holdg]"); if (!g || e.repeat) return;
      const map = JSON.parse(g.dataset.holdg); const v = map[e.key]; if (!v) return;
      e.preventDefault(); const k = g.dataset.holdk;
      if (latch()) set(k, held[k] === v ? null : v); else set(k, v);
    });
    root.addEventListener("keyup", (e) => { const g = e.target.closest("[data-holdg]"); if (!g || latch()) return; const map = JSON.parse(g.dataset.holdg); if (map[e.key]) set(g.dataset.holdk, null); });
    return { release() { Object.keys(held).forEach((k) => (held[k] = null)); onChange(null); } };
  };
})();
