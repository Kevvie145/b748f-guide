/* 747-8F Tech Guide — interactive panels for Chapter 1.
   Panels are drawn with the panel kit (panelkit.js) after the AOM illustrations; aircraft views use the
   WebGL model (gl3d.js), with the earlier 2D drawings kept as a fallback when WebGL is unavailable. */
(function () {
  "use strict";
  const B = (window.B748 = window.B748 || { chapters: {} });
  const W = (B.W = B.W || {});
  const K = B.K;

  /* ── shared helpers ── */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function frame(el, title, o) {
    el.innerHTML = `<div class="wg-cap"><span class="wg-tag">Interactive</span><span class="wg-t">${title}</span><div class="wg-tools">${o.tools || ""}</div></div>
      <div class="wg-body">${o.body}</div>${o.foot ? `<p class="wg-foot">${o.foot}</p>` : ""}`;
    return el;
  }
  const seg = (key, opts, label) => `<div class="cond">${label ? `<span>${label}</span>` : ""}<div class="seg" role="group" aria-label="${esc(label || key)}">${opts.map((o) => {
    const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
    return `<button data-seg="${key}" data-v="${esc(v)}" aria-pressed="false">${esc(l)}</button>`;
  }).join("")}</div></div>`;
  function setSeg(root, key, val) { root.querySelectorAll(`[data-seg="${key}"]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === String(val)))); }
  const holdMode = (id) => `<label class="hold-mode"><input type="checkbox" id="${id}" checked> Tap to latch spring-loaded switches (untick to press and hold, two-handed on iPad)</label>`;
  const eicasList = (msgs) => msgs.length ? msgs.map((m) => `<div class="${m[1]}">${esc(m[0])}</div>`).join("") : `<div class="none">NO MESSAGES</div>`;
  const orderMsgs = (list) => ["W", "C", "A", "M"].flatMap((l) => list.filter((m) => m[1] === l));
  const fmtAlt = (n) => n.toLocaleString("en-US");
  const item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
  const LS = { get(k, d) { try { const v = localStorage.getItem("b748." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem("b748." + k, JSON.stringify(v)); } catch (e) {} } };
  const TAILS = ["JA11KZ", "JA12KZ", "JA13KZ", "JA14KZ", "JA15KZ", "JA16KZ", "JA17KZ", "JA18KZ"];
  const getReg = () => LS.get("reg", "JA15KZ");
  const regSel = () => `<label class="tailsel"><span>Tail</span><select data-reg aria-label="Registration">${TAILS.map((t) => `<option${t === getReg() ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
  function view3d(host, el, o) {
    const G = B.G3;
    if (!G || !G.ok) return null;
    let v = null;
    try { v = G.viewer(host, { reg: getReg(), ...o }); } catch (e) { console.error(e); v = null; }
    if (!v) return null;
    const sel = el.querySelector("[data-reg]");
    const onReg = (e) => { v.set({ reg: e.detail }); if (sel && sel.value !== e.detail) sel.value = e.detail; };
    document.addEventListener("b748-reg", onReg);
    if (sel) sel.addEventListener("change", () => { LS.set("reg", sel.value); document.dispatchEvent(new CustomEvent("b748-reg", { detail: sel.value })); });
    const destroy = v.destroy;
    v.destroy = () => { document.removeEventListener("b748-reg", onReg); destroy(); };
    return v;
  }
  const no3d = `<div class="no3d">The 3D view needs WebGL, which this browser has turned off.</div>`;

  /* ── 2D geometry (dimension overlays and no-WebGL fallback) ── */
  const TOP = {
    fus: "M0,0 C1.9,0 3.25,2.8 3.25,8 L3.25,60 C3.25,68 1.6,74 0.45,76.3 L-0.45,76.3 C-1.6,74 -3.25,68 -3.25,60 L-3.25,8 C-3.25,2.8 -1.9,0 0,0 Z",
    wing: "M3.25,25.5 L31.5,49.2 L34.2,54.6 L33.6,55.6 L12,43.2 L3.25,41.5 Z", stab: "M2.7,63.5 L11,71.6 L11,74.2 L1.6,73.8 Z",
    fin: "M-0.35,61 L0.35,61 L0.3,76.3 L-0.3,76.3 Z", eng: [[11.9, 27.5, 3.3, 7], [21.1, 35.3, 3.1, 6.7]]
  };
  function topPlane(cls) {
    const half = `<path d="${TOP.wing}"/><path d="${TOP.stab}"/>${TOP.eng.map((e) => `<rect x="${e[0] - e[2] / 2}" y="${e[1]}" width="${e[2]}" height="${e[3]}" rx="1.1"/>`).join("")}`;
    return `<g class="${cls}">${half}<g transform="scale(-1,1)">${half}</g><path d="${TOP.fus}"/><path d="${TOP.fin}"/></g>`;
  }
  const SIDEP = "M0,4.8 C0,6.9 1.7,8.7 4.6,9.45 L8,9.89 L22,9.89 C26,9.89 28.5,8.6 32,8.5 L66,8.5 C71,8.4 74.5,7.6 76.3,6.7 L75.6,6.0 C72,4.9 66,3.5 58,2.6 L44,2.1 L14,2.1 C6,2.1 1.6,3.0 0,4.8 Z";
  const sidePlane = (cls) => `<g class="${cls}"><path d="M60,8.5 L72.6,19.4 L76.2,19.4 L75.2,7.4 Z"/><path d="${SIDEP}"/><rect x="27.5" y="1.5" width="7" height="3.1" rx="1.2"/><rect x="35.3" y="2.6" width="6.7" height="2.9" rx="1.1"/></g>`;
  const frontPlane = (cls) => `<g class="${cls}"><path d="M-0.3,8.6 L0.3,8.6 L0.22,19.4 L-0.22,19.4 Z"/><path d="M3,4.2 L34.2,6.65 L34.2,7.05 L3,4.95 Z"/><path d="M-3,4.2 L-34.2,6.65 L-34.2,7.05 L-3,4.95 Z"/><circle cx="11.9" cy="3" r="1.6"/><circle cx="-11.9" cy="3" r="1.6"/><circle cx="21.1" cy="3.9" r="1.5"/><circle cx="-21.1" cy="3.9" r="1.5"/><ellipse cx="0" cy="5.6" rx="3.25" ry="3.55"/></g>`;
  const arrowDefs = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>`;
  function hdim(x1, x2, y, label, e1, e2, mk, lx, anchor) {
    const s = y > (e1 + e2) / 2 ? 0.6 : -0.6;
    return `<path class="ex" d="M${x1},${e1} V${y + s} M${x2},${e2} V${y + s}"/><path class="dl" d="M${x1},${y} H${x2}" marker-start="url(#${mk})" marker-end="url(#${mk})"/>
      <text class="dt" x="${lx != null ? lx : (x1 + x2) / 2}" y="${y - 0.75}" text-anchor="${anchor || "middle"}">${label}</text>`;
  }
  function vdim(y1, y2, x, label, e1, e2, mk, ly, anchor, tx) {
    const s = x > (e1 + e2) / 2 ? 0.6 : -0.6;
    return `<path class="ex" d="M${e1},${y1} H${x + s} M${e2},${y2} H${x + s}"/><path class="dl" d="M${x},${y1} V${y2}" marker-start="url(#${mk})" marker-end="url(#${mk})"/>
      <text class="dt" x="${tx != null ? tx : x + 1.2}" y="${ly != null ? ly : (y1 + y2) / 2 + 0.7}" text-anchor="${anchor || "start"}">${label}</text>`;
  }

  /* ════════ DIMENSIONS ════════ */
  W.dims = function (el) {
    const D = {
      span: ["224′ 5″", "68.4 m", "Wingspan"], len: ["250′ 2″", "76.3 m", "Overall length"], stabtip: ["243′ 6″", "74.2 m", "Nose to horizontal stabilizer tip"],
      stab: ["72′ 2″", "22.0 m", "Horizontal stabilizer span"], tail: ["63′ 6″", "19.4 m", "Tail height (fully loaded)"], fd: ["32′ 5.5″", "9.89 m", "Height, top of fuselage at flight deck"],
      ng: ["25′ 5″", "7.7 m", "Nose to nose gear"], wb: ["97′ 4″", "29.7 m", "Nose gear to main gear"], nm: ["122′ 9″", "37.4 m", "Nose to main gear"],
      bt: ["12′ 7″", "3.8 m", "Body gear track"], wt: ["41′ 9″", "12.73 m", "Wing gear track"]
    };
    const VIEWS = { plan: ["span", "len", "stabtip", "stab"], side: ["tail", "fd", "ng", "wb", "nm"], front: ["span", "bt", "wt"], "3d": ["span", "len", "tail", "nm", "wt", "bt"] };
    const VB = { plan: [-7, -42, 101, 92], side: [-17, -23, 110, 33], front: [-40, -25, 80, 37] };
    const st = { view: "plan", u: "ft" };
    frame(el, "Principal dimensions", {
      tools: seg("view", [["plan", "Plan"], ["side", "Side"], ["front", "Front"], ["3d", "3D"]]) + seg("u", [["ft", "ft"], ["m", "m"]]) + regSel(),
      body: `<div class="fig-scroll"><div class="g3wrap" data-wrap><svg class="ov fig" data-ov preserveAspectRatio="xMidYMid meet"></svg><span class="g3hint" data-hint hidden>Drag to turn · pinch to zoom</span></div></div>
        <div class="tbl-wrap" style="margin-top:12px"><table class="num"><tbody data-list></tbody></table></div>`,
      foot: "Dimensions from AOM 1.10.1, fully loaded condition. 3D model built to these figures; detail simplified."
    });
    const wrap = el.querySelector("[data-wrap]"), ov = el.querySelector("[data-ov]");
    const v = view3d(wrap, el, { mode: "ortho", view: "plan", vb: VB.plan, ground: false });
    const L = (k) => D[k][st.u === "ft" ? 0 : 1];
    function overlay() {
      if (st.view === "plan") return `${arrowDefs("am")}${v ? "" : `<g transform="rotate(-90)">${topPlane("ac")}</g>`}
        ${vdim(-34.2, 34.2, 60, L("span"), 55.2, 55.2, "am", -18)}${vdim(-11, 11, 81, L("stab"), 74.6, 74.6, "am", 0.7)}
        ${hdim(0, 74.2, 38, L("stabtip"), 0.5, 11.5, "am")}${hdim(0, 76.3, 45, L("len"), 0.5, 0.5, "am")}`;
      if (st.view === "side") return `${arrowDefs("am")}<line class="gnd" x1="-14" y1="0" x2="90" y2="0"/>${v ? "" : `<g transform="scale(1,-1)">${sidePlane("ac")}</g>`}
        ${vdim(0, -19.4, 82, L("tail"), 0, -19.4, "am", -9.2)}${vdim(0, -9.89, -5, L("fd"), 0, -9.89, "am", -4.4, "end", -6.4)}<path class="ex" d="M7.6,-9.89 H-4.4"/>
        ${hdim(0, 7.7, 3.4, L("ng"), -4.4, 0.2, "am", -1, "end")}${hdim(7.7, 37.4, 3.4, L("wb"), 0.2, 0.2, "am")}${hdim(0, 37.4, 7.6, L("nm"), -4.4, 0.2, "am")}`;
      return `${arrowDefs("am")}<line class="gnd" x1="-38" y1="0" x2="38" y2="0"/>${v ? "" : `<g transform="scale(1,-1)">${frontPlane("ac")}</g>`}
        ${hdim(-34.2, 34.2, -22, L("span"), -7.2, -7.2, "am")}${hdim(-6.365, 6.365, 3.6, L("wt"), 0.2, 0.2, "am", 7.6, "start")}${hdim(-1.9, 1.9, 7.8, L("bt"), 0.2, 0.2, "am", 3, "start")}`;
    }
    function draw() {
      setSeg(el, "view", st.view); setSeg(el, "u", st.u);
      const is3d = st.view === "3d";
      el.querySelector("[data-hint]").hidden = !is3d || !v;
      wrap.classList.toggle("ortho", !is3d);
      if (is3d) {
        wrap.style.aspectRatio = "16 / 10"; ov.innerHTML = ""; ov.style.display = "none";
        if (v) v.set({ mode: "orbit", ground: true, yaw: -2.3, pitch: 0.3, dist: 108, target: [38, 0, 5] });
        else if (!wrap.querySelector(".no3d")) wrap.insertAdjacentHTML("beforeend", no3d);
      } else {
        const vb = VB[st.view];
        wrap.style.aspectRatio = `${vb[2]} / ${vb[3]}`; ov.style.display = "";
        ov.setAttribute("viewBox", vb.join(" ")); ov.innerHTML = overlay();
        if (v) v.set({ mode: "ortho", view: st.view, vb, ground: false });
      }
      el.querySelector("[data-list]").innerHTML = VIEWS[st.view].map((k) => `<tr><td>${D[k][2]}</td><td>${D[k][0]} · ${D[k][1]}</td></tr>`).join("");
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-seg]"); if (!b) return; st[b.dataset.seg] = b.dataset.v; draw(); });
    draw();
    return () => v && v.destroy();
  };

  /* ════════ TURNING RADIUS ════════ */
  W.turn = function (el) {
    const C = [14.05, 35.74], R = { nose: 38.4, tail: 45.7, tip: 51.8 };
    const vb = [C[0] - 60, C[1] - 56, 120, 112];
    frame(el, "Minimum turning radius", {
      tools: regSel(),
      body: `<div class="fig-scroll"><div class="g3wrap ortho" data-wrap style="aspect-ratio:120 / 112"><svg class="ov fig turnfig" data-ov viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid meet">
        ${Object.values(R).map((r) => `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" class="arc"/>`).join("")}
        <g data-fb></g>
        <g transform="translate(0,7.7) rotate(70)"><rect x="-.5" y="-1.2" width="1" height="2.4" rx=".3" class="wheel"/></g><text class="dt" x="4.2" y="8.6">70°</text>
        <path d="M${C[0] - 1.4},${C[1]} H${C[0] + 1.4} M${C[0]},${C[1] - 1.4} V${C[1] + 1.4}" class="ctr"/><text class="dt" x="${C[0] + 2}" y="${C[1] + 3.4}">Centre of turn</text>
        <text class="dt big" x="${C[0] + 3}" y="${C[1] - 40.2}">Nose · 126 ft · 38.4 m</text>
        <text class="dt big" x="${C[0] + 12.5}" y="${C[1] + 47.5}">Tail · 150 ft · 45.7 m</text>
        <text class="dt big" x="${C[0] - 57}" y="${C[1] + 44}">Wingtip · 170 ft · 51.8 m</text></svg></div></div>`,
      foot: "Schematic. Right turn shown, steering angle 70°, body gear steering operating. Minimum pavement width for a 180° turn: 172 ft (52.4 m)."
    });
    const wrap = el.querySelector("[data-wrap]");
    const v = view3d(wrap, el, { mode: "ortho", view: "top", vb, ground: false });
    if (!v) el.querySelector("[data-fb]").innerHTML = topPlane("ac");
    return () => v && v.destroy();
  };

  /* ════════ PANEL MAP ════════ */
  W.panelMap = function (el, ctx) {
    const P = {
      ovm: ["Overhead maintenance", "1.21.2", [["Flight deck access lights, GND TESTS", 1], ["Flight control hydraulic power shutoffs (tail, wing)", 9], ["Generator field manual reset, split system breaker, towing power", 6], ["APU start source, EEC maintenance power", 7], ["Window heat anti-fog power", 3], ["Lower lobe aft cargo heat", 2], ["Squib and cargo fire tests", 8], ["Cockpit voice recorder", 5], ["IRS on battery light", 11]]],
      ovh: ["Overhead panel", "1.21.1", [["Lighting controls, EMER LIGHTS, ELT, SUPRNMRY OXY", 1], ["Packs, trim air, bleeds, equipment cooling, cabin altitude, cargo temperature", 2], ["Engine and wing anti-ice, window heat, wipers", 3], ["Audio systems, interphone", 5], ["Generators, bus ties, battery, standby power, external power", 6], ["Electronic engine control, engine start, APU", 7], ["Engine, APU and cargo fire controls", 8], ["Yaw dampers", 9], ["Hydraulic engine, demand and AUX pumps", 13], ["Fuel pumps, crossfeed, transfer, jettison", 12], ["IRS mode selectors", 11]]],
      cb: ["Overhead circuit breakers", "1.20.1", [["Circuit breaker panel; lighting on CKT BKR / OVHD PANEL control", 1]]],
      gs: ["Glareshield", "1.22.2", [["Mode control panel", 4], ["EFIS control panels", 10], ["Display select panel (ENG, STAT, synoptics, CHKL, NAV, INFO)", 10], ["Master WARNING and CAUTION lights", 15], ["Panel, flood and map light controls", 1]]],
      lf: ["Left forward panel", "1.22.1", [["PFD and ND, inboard display selector", 10], ["Source selectors: flight director, NAV, EIU, IRS, air data", 10], ["SELCAL", 5], ["Brake source light, hydraulic brake pressure", 14]]],
      cf: ["Centre forward panel", "1.22.3", [["Standby flight display", 10], ["Upper EICAS display, EIU selector, event record", 15], ["Heading reference NORM / TRUE", 10], ["FMC selector", 11], ["Flap limit placard, alternate flaps", 9], ["Gear lever, lock override, alternate gear extend", 14], ["Autobrake selector", 14]]],
      rf: ["Right forward panel", "1.22.2", [["PFD and ND, inboard display selector, source selectors", 10], ["Ground proximity: G/S inhibit, flap, gear and terrain override", 15]]],
      lsw: ["Left sidewall", "1.23.3", [["Chart, map and panel light controls", 1], ["Oxygen mask stowage box", 1], ["Side window and foot / shoulder heaters", 2], ["Boom mic, headset and handmic jacks", 5], ["Side display", 10]]],
      rsw: ["Right sidewall and observers", "1.23.3", [["First officer's lighting and oxygen mask (as left)", 1], ["First observer map and panel lights, oxygen mask", 1], ["Observer audio panels", 5], ["Maintenance access terminal, data load selector", 10]]],
      fas: ["Forward aisle stand", "1.22.4", [["Left and right CDUs", 11], ["Multifunction display: secondary engine", 7], ["MFD status page and synoptics", 15]]],
      cs: ["Control stand", "1.23.1", [["Speedbrake lever, flap lever, stabilizer trim cutout", 9], ["Thrust levers", 4], ["Fuel control switches", 7], ["Parking brake", 14], ["Cursor control devices", 10]]],
      aas: ["Aft aisle stand", "1.23.2", [["MAIN DECK ALERT switch, SEATBELTS selector", 1], ["Radio tuning and audio control panels, crew call", 5], ["Weather radar, centre CDU, transponder", 11], ["Aileron and rudder trim", 9]]]
    };
    const LBL = { ovm: "Ovhd maint", ovh: "Overhead", cb: "CB panel", gs: "Glareshield", lf: "Left fwd", cf: "Centre fwd", rf: "Right fwd", lsw: "L side", rsw: "R side", fas: "Fwd aisle stand", cs: "Control stand", aas: "Aft aisle stand" };
    let cur = "ovh";
    frame(el, "Flight deck panel map", {
      body: `<div class="wg-grid l"><div class="pmap" role="group" aria-label="Panels">${Object.keys(LBL).map((k) => `<button data-p="${k}" style="grid-area:${k}" aria-pressed="false">${LBL[k]}</button>`).join("")}</div>
        <div class="pdet" data-det aria-live="polite"></div></div>`,
      foot: "Chapter numbers follow the AOM's circled references. Tap a chapter that is loaded to open it."
    });
    function draw() {
      el.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === cur)));
      const p = P[cur];
      el.querySelector("[data-det]").innerHTML = `<div class="ref">AOM ${p[1]}</div><h4>${p[0]}</h4><ul>${p[2].map((i) => {
        const n = i[1], loaded = !!B.chapters[n];
        const lab = (B.library.find((c) => c.num === n) || {}).short || "";
        return `<li><span>${esc(i[0])}</span>${loaded && n !== ctx.ch ? `<a class="chch" href="#c${n}">Ch ${n}</a>` : `<span class="chch" title="${esc(lab)}">Ch ${n}${n === ctx.ch ? " · here" : ""}</span>`}</li>`;
      }).join("")}</ul>`;
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) { cur = b.dataset.p; draw(); } });
    draw();
  };

  /* ════════ EXTERIOR LIGHTS ════════ */
  W.extLights = function (el) {
    const st = { lo_l: "OFF", lo_r: "OFF", li_l: "OFF", li_r: "OFF", rt_l: "OFF", rt_r: "OFF", taxi: "OFF", beacon: "BOTH", nav: "ON", strobe: "OFF", wing: "OFF", logo: "ON", gear: "DOWN", ag: "GROUND" };
    const OO = ["OFF", "ON"], BC = ["LWR", "OFF", "BOTH"];
    const SWK = { lo_l: OO, lo_r: OO, li_l: OO, li_r: OO, rt_l: OO, rt_r: OO, taxi: OO, beacon: BC, nav: OO, strobe: OO, wing: OO, logo: OO };
    const T = K.t;
    const panel = K.svg(520, 244, K.tan(4, 4, 512, 236) +
      T(150, 28, "LANDING") + T(95, 44, "OUTBD") + T(215, 44, "INBD") + [70, 120, 190, 240].map((x, i) => T(x, 60, i % 2 ? "R" : "L")).join("") + T(155, 90, "OFF") +
      K.tog("lo_l", 70, 86, 2, "lock", "Landing outboard left") + K.tog("lo_r", 120, 86, 2, "lock", "Landing outboard right") + K.tog("li_l", 190, 86, 2, "lock", "Landing inboard left") + K.tog("li_r", 240, 86, 2, "lock", "Landing inboard right") +
      [70, 120, 190, 240].map((x) => T(x, 124, "ON")).join("") +
      T(345, 44, "RWY TURNOFF") + T(318, 60, "L") + T(372, 60, "R") + T(345, 90, "OFF") + K.tog("rt_l", 318, 86, 2, "bat", "Runway turnoff left") + K.tog("rt_r", 372, 86, 2, "bat", "Runway turnoff right") + T(318, 124, "ON") + T(372, 124, "ON") +
      T(455, 44, "TAXI") + T(455, 60, "OFF") + K.tog("taxi", 455, 86, 2, "bat", "Taxi") + T(455, 124, "ON") +
      `<path d="M18,138 H502" stroke="#7a5638" stroke-width="1.2"/>` +
      T(70, 158, "BEACON") + T(70, 172, "LWR") + T(42, 202, "OFF", { a: "end" }) + K.tog("beacon", 70, 198, 3, "cream", "Beacon") + T(70, 234, "BOTH") +
      [["nav", 165, "NAV", "paddle"], ["strobe", 260, "STROBE", "dark"], ["wing", 355, "WING", "paddle"], ["logo", 450, "LOGO", "logo"]].map(([id, x, l, ty]) => T(x, 158, l) + T(x, 172, "OFF") + K.tog(id, x, 200, 2, ty, l) + T(x, 236, "ON")).join(""), "Overhead panel, exterior lights");
    frame(el, "Exterior lights", {
      tools: regSel(),
      body: `<div class="wg-stack"><div class="pk-wide">${panel}</div>
          <div class="conds">${seg("gear", [["UP", "Up"], ["DOWN", "Down"]], "Landing gear lever")}${seg("ag", [["GROUND", "Ground"], ["AIR", "Air"]], "Air/ground sensing")}</div>
        <div class="wg-grid wide3d"><div style="display:grid;gap:10px"><div class="g3wrap night" data-wrap style="aspect-ratio:4 / 3"><span class="g3hint">Drag to turn · pinch to zoom</span></div>
            <div class="presets">${[["front", "Front"], ["left", "Left"], ["top", "Top"], ["rear", "Rear"]].map(([k, l]) => `<button class="btn sm" data-view="${k}">${l}</button>`).join("")}</div></div>
          <ul class="status" data-status></ul></div></div>`,
      foot: "Panel after AOM 1.30.13–15; light positions after AOM 1.40.3. Beams are illustrative. Tap the top or bottom half of a switch to move it."
    });
    const wrap = el.querySelector("[data-wrap]");
    const v = view3d(wrap, el, { mode: "orbit", night: true, yaw: -2.55, pitch: 0.34, dist: 112, target: [36, 0, 4], lights: {} });
    if (!v) wrap.insertAdjacentHTML("beforeend", no3d);
    const PRE = { front: [-3.05, 0.22, 100], left: [-1.75, 0.3, 112], top: [-2.6, 1.35, 125], rear: [0.55, 0.32, 112] };
    function draw() {
      Object.keys(SWK).forEach((k) => K.setTog(el, k, SWK[k].indexOf(st[k])));
      setSeg(el, "gear", st.gear); setSeg(el, "ag", st.ag);
      const gnd = st.ag === "GROUND", lt = {};
      ["lo_l", "lo_r", "li_l", "li_r"].forEach((k) => (lt[k] = st[k] === "ON" ? (st.gear === "DOWN" ? "on" : "dim") : null));
      ["rt_l", "rt_r", "taxi"].forEach((k) => (lt[k] = st[k] === "ON" && gnd ? "on" : null));
      lt.bcn_u = st.beacon === "BOTH" ? "on" : null; lt.bcn_l = st.beacon !== "OFF" ? "on" : null;
      ["nav", "strobe", "wing", "logo"].forEach((k) => (lt[k] = st[k] === "ON" ? "on" : null));
      if (v) v.set({ lights: lt, gear: gnd || st.gear === "DOWN", ground: gnd });
      const land = ["lo_l", "lo_r", "li_l", "li_r"].filter((k) => st[k] === "ON").length;
      const sideState = (l, r) => (l && r ? "L + R" : l ? "L only" : r ? "R only" : "");
      const rtOn = st.rt_l === "ON" || st.rt_r === "ON";
      el.querySelector("[data-status]").innerHTML = [
        item("Landing lights", land ? (st.gear === "DOWN" ? `${land}/4 bright` : `${land}/4 dim`) : "Off", land ? (st.gear === "DOWN" ? "on" : "dim") : "off", land && st.gear !== "DOWN" ? "Dimmed: landing gear lever not DOWN." : ""),
        item("Runway turnoff", rtOn ? (gnd ? sideState(st.rt_l === "ON", st.rt_r === "ON") : "Inhibited") : "Off", rtOn ? (gnd ? "on" : "inh") : "off", rtOn && !gnd ? "Air mode: turnoff lights extinguish." : ""),
        item("Taxi", st.taxi === "ON" ? (gnd ? "On" : "Inhibited") : "Off", st.taxi === "ON" ? (gnd ? "on" : "inh") : "off", st.taxi === "ON" && !gnd ? "Air mode: taxi lights extinguish." : ""),
        item("Beacon (red)", st.beacon === "BOTH" ? "Upper + lower" : st.beacon === "LWR" ? "Lower only" : "Off", st.beacon === "OFF" ? "off" : "on"),
        item("Navigation + wingtip markers", st.nav === "ON" ? "On" : "Off", st.nav === "ON" ? "on" : "off"),
        item("Strobes (white)", st.strobe === "ON" ? "On" : "Off", st.strobe === "ON" ? "on" : "off"),
        item("Wing illumination", st.wing === "ON" ? "On" : "Off", st.wing === "ON" ? "on" : "off"),
        item("Logo", st.logo === "ON" ? "On" : "Off", st.logo === "ON" ? "on" : "off")
      ].join("");
    }
    K.bind(el, Object.fromEntries(Object.keys(SWK).map((k) => [k, { kind: "tog", pos: SWK[k], get: () => st[k], set: (x) => (st[k] = x) }])), draw);
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), pv = e.target.closest("[data-view]");
      if (sg) { st[sg.dataset.seg] = sg.dataset.v; draw(); }
      if (pv && v) { const p = PRE[pv.dataset.view]; v.tween({ yaw: p[0], pitch: p[1], dist: p[2] }, 700); }
    });
    draw();
    return () => v && v.destroy();
  };

  /* ════════ EMERGENCY LIGHTS ════════ */
  W.emerLights = function (el) {
    const st = { fd: "ARMED", cabin: false, pwr: "NORMAL", csm: {} };
    const POS = ["OFF", "ARMED", "ON"];
    const T = K.t;
    const ovhd = K.svg(160, 134, K.tan(3, 3, 154, 128) + T(80, 24, "EMER LIGHTS") + T(72, 52, "OFF", { a: "end" }) + T(72, 78, "ARMED", { a: "end" }) + T(72, 104, "ON", { a: "end" }) + K.guard("fd", 100, 75, false, "Emergency lights switch"), "Overhead, emergency lights");
    const L = [["sul", "SIDEWALL LTS", "UPPER DECK"], ["cul", "CEILING LTS", "UPPER DECK"], ["sml", "SIDEWALL LTS", "MAIN DECK"], ["cml", "CEILING LTS", "MAIN DECK"], ["emer", "EMERGENCY", "LIGHTS"], ["fda", "FLIGHT DECK", "ACCESS LTS"], ["dome", "DOME LIGHTS", ""]];
    const csm = K.svg(232, 160, K.tan(3, 3, 226, 154) + T(22, 24, "LIGHTS", { a: "start" }) + L.map((l, i) => K.lsq(l[0], 42 + (i % 4) * 49, i < 4 ? 50 : 112, l[1], l[2])).join(""), "Upper deck cabin services module");
    frame(el, "Emergency lights logic", {
      body: `<div class="wg-stack"><div class="pnl-pair">${ovhd}${csm}</div>
        <div class="wg-grid two"><div style="display:grid;gap:12px">
          <div class="conds">${seg("pwr", [["NORMAL", "Normal"], ["FAILED", "Failed / off"]], "Airplane electrical power")}</div>
          <p class="hint">Try: leave the guard closed (ARMED) and fail the power. Then restore power and push EMERGENCY LIGHTS on the services module.</p>
          <div class="disp" data-disp><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs></div></div></div>
        <ul class="status" data-status></ul></div></div>`,
      foot: "Panels after AOM 1.30.12 and 1.30.15–16; logic from 1.40.5 and 1.60.2. With power failed the EICAS display is shown unpowered."
    });
    function draw() {
      K.setGuard(el, "fd", POS.indexOf(st.fd) - 1);
      L.forEach((l) => K.setLsq(el, l[0], l[0] === "emer" ? st.cabin : !!st.csm[l[0]], l[0] === "emer"));
      setSeg(el, "pwr", st.pwr);
      const failed = st.pwr === "FAILED";
      const on = st.cabin || st.fd === "ON" || (st.fd === "ARMED" && failed);
      const why = st.cabin ? "Cabin switch pushed: bypasses the flight deck switch." : st.fd === "ON" ? "Flight deck switch ON." : st.fd === "ARMED" && failed ? "Armed and DC power failed or turned off." : st.fd === "OFF" && failed ? "Switch OFF prevents operation when power fails." : "Armed: waiting for a power failure.";
      el.querySelector("[data-status]").innerHTML = [
        item("Emergency lights", on ? "On" : "Off", on ? "on" : st.fd === "OFF" && failed ? "warn" : "off", why),
        item("Interior: door, aisle, exit lights", on ? "On" : "Off", on ? "on" : "off"),
        item("Exterior: slide light, inertia reel zone", on ? "On" : "Off", on ? "on" : "off"),
        item("Door 1L threshold lights", on ? "On" : "Off", on ? "on" : "off"),
        item("Remote batteries", failed ? (on ? "Discharging" : "Not charging") : "Charging", failed ? (on ? "dim" : "off") : "on", failed ? (on ? "At least 15 minutes from a full charge." : "DC bus 4 not available to charge.") : "Charge maintained by DC bus 4.")
      ].join("");
      el.querySelector("[data-disp]").classList.toggle("dead", failed);
      el.querySelector("[data-msgs]").innerHTML = eicasList((st.fd === "ARMED" && on) || st.fd !== "ARMED" ? [["EMER LIGHTS", "A"]] : []);
    }
    K.bind(el, { fd: { kind: "guard", pos: POS, get: () => st.fd, set: (x) => (st.fd = x) } }, draw);
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), q = e.target.closest("[data-lsq]");
      if (sg) st.pwr = sg.dataset.v; else if (q) { if (q.dataset.lsq === "emer") st.cabin = !st.cabin; else st.csm[q.dataset.lsq] = !st.csm[q.dataset.lsq]; } else return;
      draw();
    });
    el.addEventListener("keydown", (e) => { const q = e.target.closest("[data-lsq]"); if (q && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); q.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    draw();
  };

  /* ════════ SIGNS, MAIN DECK ALERT, SUPERNUMERARY OXYGEN ════════ */
  W.cabinAlt = function (el) {
    const st = { belts: "AUTO", oxySw: "NORM", ag: "AIR", gear: "UP", flap: "UP", smoke: "NO", tail: "15", acAlt: 35000, cabAlt: 6500, oxyActive: false, masks: false };
    const SB = ["OFF", "AUTO", "ON"], OX = ["RESET", "NORM", "ON"], ANG = { OFF: -55, AUTO: 0, ON: 55 };
    const timers = new Set();
    const Tm = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    let anim = null, alertUntil = 0, lightsUntil = 0, mdaUntil = 0, toneUntil = 0, crewUntil = 0, crewSteady = false, log = [];
    const T = K.t;
    const aisle = K.svg(260, 132, K.tan(3, 3, 254, 126) + T(72, 26, "MAIN DECK ALERT") + K.pbtn("mda", 72, 72, "ON", "—", "Main deck alert") + T(188, 26, "SEATBELTS") +
      K.rot("belts", 188, 78, [{ v: "OFF", a: -55, l: "OFF" }, { v: "AUTO", a: 0, l: "AUTO" }, { v: "ON", a: 55, l: "ON" }], "Seatbelts selector"), "Aft aisle stand");
    const ovhd = K.svg(168, 134, K.tan(3, 3, 162, 128) + T(84, 24, "SUPRNMRY OXY") + T(80, 52, "RESET", { a: "end" }) + T(80, 78, "NORM", { a: "end" }) + T(80, 104, "ON", { a: "end" }) + K.guard("oxySw", 108, 75, false, "Supernumerary oxygen switch"), "Overhead, supernumerary oxygen");
    frame(el, "Signs, main deck alert and supernumerary oxygen", {
      tools: seg("tail", [["11", "JA11–14KZ"], ["15", "JA15–18KZ"]]),
      body: `<div class="wg-stack"><div class="pnl-pair">${aisle}${ovhd}</div><div class="wg-grid two"><div style="display:grid;gap:12px">
          <div class="range"><label for="ca-cab">Cabin altitude <b data-cabv></b></label><input type="range" id="ca-cab" min="0" max="25000" step="100"></div>
          <div class="range"><label for="ca-ac">Airplane altitude <b data-acv></b></label><input type="range" id="ca-ac" min="0" max="43000" step="100"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-a="depress">Rapid depressurization</button><button class="btn" data-a="descend">Cabin back to 8,000 ft</button></div>
          <div class="conds">${seg("ag", [["GROUND", "Ground"], ["AIR", "Air"]], "Air/ground")}${seg("gear", [["UP", "Up & locked"], ["DN", "Not up"]], "Landing gear")}${seg("flap", [["UP", "Up"], ["DN", "Not up"]], "Flap lever")}${seg("smoke", [["NO", "No"], ["YES", "Yes"]], "Main deck smoke")}</div>
        </div>
        <div style="display:grid;gap:12px;align-content:start">
          <div class="signs"><div class="sign" data-sign="fsb">FASTEN SEAT BELTS</div><div class="sign" data-sign="rts">RETURN TO SEAT</div></div>
          <div class="deck" data-deck><div class="row"><span>Main deck ceiling lights</span><span class="horn" data-horn>HORNS</span></div><div class="ceil">${"<i></i>".repeat(10)}</div>
            <div class="row"><span data-pa>PA: –</span><span data-crew>Crew rest: –</span></div></div>
          <ul class="status" data-status></ul>
          <div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS · MEMOS</span></div><div class="msgs" data-msgs></div></div>
          <div><p class="lbl-sm">Event log</p><ul class="log" data-log></ul></div>
        </div></div></div>`,
      foot: "Panels after AOM 1.30.2–3, 1.30.16–17; logic from 1.40.4, 1.40.13 and 1.45.1. RESET and ON are spring-loaded; the guard closes back to NORM. Alerts last “several seconds” (shown as 4 s)."
    });
    const cab = el.querySelector("#ca-cab"), ac = el.querySelector("#ca-ac");
    const now = () => Date.now();
    function addLog(t) { log.unshift({ t, at: new Date() }); log = log.slice(0, 6); }
    function fsb() {
      if (st.oxyActive || st.belts === "ON") return true;
      if (st.belts === "OFF") return false;
      return st.gear !== "UP" || st.flap !== "UP" || st.acAlt < 10300 || st.cabAlt > 10000;
    }
    function mainAlert(why) { alertUntil = now() + 4000; addLog(why + " → main deck lights flash, horns sound"); Tm(draw, 4050); }
    function deploy(why) {
      if (st.oxyActive) return;
      st.oxyActive = true; st.masks = true;
      addLog(why + " → supernumerary masks drop");
      if (st.tail === "15") { crewUntil = now() + 4000; crewSteady = false; addLog("JA15–18KZ: crew rest ceiling lights flash and a tone sounds"); }
      else { lightsUntil = Math.max(lightsUntil, now() + 4000); crewSteady = true; addLog("JA11–14KZ: main deck ceiling lights flash, crew rest ceiling lights on"); }
      Tm(draw, 4050);
    }
    let lastFsb = null;
    function step(prev) {
      if (prev.cabAlt < 10000 && st.cabAlt >= 10000) mainAlert("Cabin altitude reached 10,000 ft");
      if (st.cabAlt >= 14000 && prev.cabAlt < 14000 && st.oxySw === "NORM") deploy("Cabin altitude reached ~14,000 ft");
      if (prev.smoke === "NO" && st.smoke === "YES") mainAlert("Smoke detected in main deck");
      const f = fsb();
      if (lastFsb !== null && f !== lastFsb) { toneUntil = now() + 1500; addLog(`FASTEN SEAT BELTS ${f ? "on" : "off"} → low tone over PA`); Tm(draw, 1550); }
      lastFsb = f;
    }
    function change(fn) { const prev = { ...st }; fn(); step(prev); draw(); }
    function draw() {
      const t = now();
      K.setRot(el, "belts", ANG[st.belts]); K.setGuard(el, "oxySw", OX.indexOf(st.oxySw) - 1);
      K.setPb(el, "mda", t < mdaUntil ? "a" : null, null);
      ["ag", "gear", "flap", "smoke", "tail"].forEach((k) => setSeg(el, k, st[k]));
      cab.value = st.cabAlt; ac.value = st.acAlt;
      el.querySelector("[data-cabv]").textContent = fmtAlt(st.cabAlt) + " ft";
      el.querySelector("[data-acv]").textContent = fmtAlt(st.acAlt) + " ft";
      const f = fsb(), r = f && !st.oxyActive;
      el.querySelector('[data-sign="fsb"]').classList.toggle("on", f);
      el.querySelector('[data-sign="rts"]').classList.toggle("on", r);
      el.querySelector("[data-deck]").classList.toggle("flash", t < alertUntil || t < lightsUntil);
      el.querySelector("[data-horn]").classList.toggle("on", t < alertUntil);
      el.querySelector("[data-pa]").textContent = t < toneUntil ? "PA: low tone ♪" : "PA: –";
      el.querySelector("[data-crew]").textContent = t < crewUntil ? "Crew rest: lights flashing, tone" : crewSteady && st.masks ? "Crew rest: ceiling lights on" : "Crew rest: –";
      const why = st.oxyActive ? "Oxygen deployed: on regardless of selector." : st.belts !== "AUTO" ? `Selector ${st.belts}.` :
        [st.gear !== "UP" && "gear not up and locked", st.flap !== "UP" && "flap lever not up", st.acAlt < 10300 && "airplane below 10,300 ft", st.cabAlt > 10000 && "cabin above 10,000 ft"].filter(Boolean).join(", ") || "No AUTO condition met.";
      el.querySelector("[data-status]").innerHTML = [
        item("Seat belt signs", f ? (r ? "Both on" : "Belts only") : "Off", f ? "on" : "off", why),
        item("Supernumerary masks", st.masks ? "Presented" : "Stowed", st.masks ? "dim" : "off", st.masks ? (st.oxyActive ? "Flow starts when a mask or streamer is pulled down." : "Flow control unit closed by RESET.") : st.oxySw === "NORM" ? "Auto drop at about 14,000 ft cabin altitude." : ""),
        item("Flow control unit", st.oxyActive ? "Open" : "Closed", st.oxyActive ? "on" : "off")
      ].join("");
      const msgs = [];
      if (st.oxyActive) msgs.push(["SUPRNMRY OXY ON", "A"]);
      if (st.belts === "ON") msgs.push(["SEATBELTS ON", "M"]);
      if (st.belts === "OFF" && st.ag === "AIR") msgs.push(["SEATBELTS OFF", "M"]);
      el.querySelector("[data-msgs]").innerHTML = eicasList(orderMsgs(msgs));
      el.querySelector("[data-log]").innerHTML = log.length ? log.map((l, i) => `<li class="${i === 0 && t - l.at < 4000 ? "fresh" : ""}"><span class="mono">${l.at.toTimeString().slice(0, 8)}</span><span>${esc(l.t)}</span></li>`).join("") : `<li><span class="mono">–</span><span>Nothing yet. Drag the cabin altitude up.</span></li>`;
    }
    function stopAnim() { if (anim) { clearInterval(anim); anim = null; } }
    function animateTo(target, rate) {
      stopAnim();
      anim = setInterval(() => {
        change(() => { const d = target - st.cabAlt; st.cabAlt = Math.abs(d) <= rate ? target : st.cabAlt + Math.sign(d) * rate; });
        if (st.cabAlt === target) stopAnim();
      }, 100);
    }
    K.bind(el, {
      belts: { kind: "rot", pos: SB, get: () => st.belts, set: (v) => change(() => { if (v === "ON" && st.belts !== "ON") { lightsUntil = now() + 4000; addLog("SEATBELTS selected ON → main deck ceiling lights flash (no horns)"); Tm(draw, 4050); } st.belts = v; }) },
      oxySw: { kind: "guard", pos: OX, get: () => st.oxySw, set: (v) => {
        if (v === "NORM") { st.oxySw = "NORM"; return; }
        st.oxySw = v;
        if (v === "ON") change(() => { mainAlert("SUPRNMRY OXY switch ON"); deploy("SUPRNMRY OXY switch ON"); });
        if (v === "RESET") change(() => { if (st.cabAlt < 12000) { addLog(st.oxyActive ? "RESET below 12,000 ft → flow control unit closed" : "RESET: system not active"); st.oxyActive = false; } else addLog("RESET has no effect at or above 12,000 ft cabin altitude"); });
        Tm(() => { st.oxySw = "NORM"; draw(); }, 700);
      } }
    }, draw);
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), p = e.target.closest("[data-pb]"), a = e.target.closest("[data-a]");
      if (sg) change(() => { st[sg.dataset.seg] = sg.dataset.v; if (sg.dataset.seg === "ag" && sg.dataset.v === "GROUND") st.acAlt = 0; });
      else if (p) change(() => { mdaUntil = now() + 4000; mainAlert("MAIN DECK ALERT pushed"); Tm(draw, 4050); });
      else if (a) { if (a.dataset.a === "depress") animateTo(25000, 700); else animateTo(8000, 400); }
    });
    el.addEventListener("keydown", (e) => { const p = e.target.closest("[data-pb]"); if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); p.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    cab.addEventListener("input", () => { stopAnim(); change(() => (st.cabAlt = +cab.value)); });
    ac.addEventListener("input", () => change(() => { st.acAlt = +ac.value; if (st.acAlt > 0 && st.ag === "GROUND") st.ag = "AIR"; }));
    lastFsb = fsb();
    draw();
    return () => { stopAnim(); timers.forEach(clearTimeout); };
  };

  /* ════════ CREW OXYGEN MASK ════════ */
  W.crewOxy = function (el) {
    const st = { out: false, doors: false, oxy: false, mic: "boom", mode: "100", emer: false, harness: false, flow: false, msg: "Mask stowed, doors closed, OXY ON flag not in view." };
    let ft = null;
    const flowBlip = (ms = 1400) => { st.flow = true; clearTimeout(ft); ft = setTimeout(() => { st.flow = false; draw(); }, ms); };
    const T = K.t;
    const box = `<svg class="pk" viewBox="0 0 330 214" style="--w:330" role="group" aria-label="Oxygen mask stowage box">${K.defs()}
      ${K.tan(4, 4, 58, 58, false)}<circle cx="33" cy="33" r="16" fill="#14171a" stroke="url(#pk-metal)" stroke-width="3"/><g data-flowx><path d="M24,24 L42,42 M42,24 L24,42" stroke="#ffd400" stroke-width="5" stroke-linecap="round"/></g>
      ${K.tan(70, 4, 256, 206)}<rect x="86" y="20" width="224" height="174" rx="8" fill="#5e432d"/>
      <g data-hose><path d="M198,186 C150,190 140,170 175,166 C215,162 230,180 198,186 C160,192 150,176 180,172" fill="none" stroke="#2c8a3d" stroke-width="6"/></g>
      <g data-reg><rect x="150" y="30" width="96" height="128" rx="10" fill="url(#pk-red)" stroke="#5a0b05"/>
        <rect data-a="pull" class="lever" x="140" y="40" width="14" height="40" rx="4" fill="#c4231a" stroke="#5a0b05"/><rect data-a="pull" class="lever" x="242" y="40" width="14" height="40" rx="4" fill="#c4231a" stroke="#5a0b05"/>
        <rect x="160" y="40" width="30" height="46" rx="4" fill="#e8392c" stroke="#7a1209"/><text x="175" y="56" class="pk-t" font-size="10" text-anchor="middle">N</text><text x="175" y="70" class="pk-t" font-size="7" text-anchor="middle">100%</text><text x="175" y="79" class="pk-t" font-size="6" text-anchor="middle">PUSH</text>
        <circle cx="220" cy="118" r="17" fill="url(#pk-red)" stroke="#5a0b05"/><text x="220" y="96" class="pk-t" font-size="6.5" text-anchor="middle">EMERGENCY</text>
        <circle cx="172" cy="122" r="7" fill="url(#pk-metal)" stroke="#333"/><text x="172" y="142" class="pk-t" font-size="5.5" text-anchor="middle">PRESS TO TEST</text>
        <path d="M198,158 V186" stroke="#2c8a3d" stroke-width="8"/></g>
      <g data-ldoor><rect x="88" y="22" width="60" height="170" rx="4" fill="url(#pk-tan)" stroke="#7a5638" stroke-width="1.5"/></g>
      <rect x="104" y="44" width="28" height="44" rx="3" fill="#24282b" stroke="#111"/><g data-flag><path d="M118,50 L127,62 L122,62 L122,82 L114,82 L114,62 L109,62 Z" fill="#fff"/></g><text x="118" y="100" class="pk-t" font-size="7" text-anchor="middle">OXY ON</text>
      <g data-pb="reset" class="pk-pb" tabindex="0" role="button" aria-label="Press to test and reset"><circle cx="118" cy="136" r="12" fill="url(#pk-metal)" stroke="#333"/><circle cx="118" cy="136" r="7" fill="#1b1e21"/><path d="M114,136 H122" stroke="#9aa0a5" stroke-width="1.6"/><rect class="hit" x="104" y="122" width="28" height="28"/></g>
      ${["PRESS", "TO TEST", "AND", "RESET"].map((s, i) => T(118, 162 + i * 8, s, { fs: 6 })).join("")}
      <g data-rdoor><rect x="248" y="22" width="60" height="170" rx="4" fill="url(#pk-tan)" stroke="#7a5638" stroke-width="1.5"/><text x="278" y="96" class="pk-t" font-size="8" text-anchor="middle">OXYGEN</text><text x="278" y="108" class="pk-t" font-size="8" text-anchor="middle">MASK</text><path d="M290,118 H266 M266,118 L272,113 M266,118 L272,123" stroke="#efe8dc" stroke-width="1.6" fill="none"/></g>
    </svg>`;
    const reg = `<svg class="pk" viewBox="0 0 200 214" style="--w:200" role="group" aria-label="Mask regulator">${K.defs()}
      <rect x="0" y="0" width="200" height="214" rx="10" fill="#4f5458"/>
      <path d="M52,18 Q100,6 148,18 L156,168 Q100,184 44,168 Z" fill="url(#pk-red)" stroke="#5a0b05" stroke-width="1.5"/>
      <g data-tab class="pk-pb" tabindex="0" role="button" aria-label="Normal / 100% switch"><rect data-tabr x="64" y="30" width="44" height="66" rx="6" stroke="#7a1209"/><text data-tn x="86" y="52" class="pk-t" font-size="14" text-anchor="middle">N</text><text data-t1 x="86" y="72" class="pk-t" font-size="10" text-anchor="middle">100%</text><text x="86" y="86" class="pk-t" font-size="8" text-anchor="middle">PUSH</text><rect class="hit" x="64" y="30" width="44" height="66"/></g>
      <text x="128" y="112" class="pk-t" font-size="8" text-anchor="middle">EMERGENCY</text>
      <g data-knob class="pk-pb" tabindex="0" role="button" aria-label="Emergency selector" transform="translate(128,138)"><circle r="22" fill="url(#pk-red)" stroke="#5a0b05" stroke-width="1.5"/><g data-kp><rect x="-4" y="-21" width="8" height="42" rx="4" fill="#9e1a10"/><path d="M0,-18 L-5,-9 L5,-9 Z" fill="#fff"/></g><circle class="hit" r="24"/></g>
      <g data-pb="ptt" class="pk-pb" tabindex="0" role="button" aria-label="Press to test"><circle cx="70" cy="132" r="10" fill="url(#pk-metal)" stroke="#333"/><circle cx="70" cy="132" r="5" fill="#1b1e21"/><rect class="hit" x="58" y="120" width="24" height="24"/></g>
      ${T(70, 156, "PRESS", { fs: 7 })}${T(70, 165, "TO TEST", { fs: 7 })}
      <path d="M100,176 V214" stroke="#2c8a3d" stroke-width="10"/></svg>`;
    frame(el, "Crew oxygen mask and stowage box", {
      body: `<div class="wg-stack"><div class="pnl-pair oxy">${box}${reg}</div>
        <div class="wg-grid two"><div style="display:grid;gap:10px;align-content:start">
          <p class="lbl-sm">Actions</p>
          <div style="display:grid;gap:6px">
            <button class="btn" data-a="pull">Squeeze the red levers and pull the mask out</button>
            <button class="btn" data-a="release">Release levers (harness snugs onto head)</button>
            <button class="btn" data-a="inflate">Squeeze right lever (inflate harness)</button>
            <button class="btn" data-a="stow">Stow the mask and close the doors</button>
            <button class="btn" data-a="open">Open the left door</button>
          </div></div>
          <div style="display:grid;gap:10px;align-content:start"><ul class="status" data-status></ul>
          <p data-msg class="hint" aria-live="polite"></p></div>
        </div></div>`,
      foot: "Drawn after AOM 1.30.18–20; logic from 1.40.7–11. Tap the red levers, RESET/TEST, the N/100% tab, the EMERGENCY knob or PRESS TO TEST directly."
    });
    function draw() {
      el.querySelector("[data-flowx]").style.display = st.flow ? "" : "none";
      el.querySelector("[data-flag]").style.display = st.oxy ? "" : "none";
      el.querySelector("[data-reg]").style.display = st.out ? "none" : "";
      el.querySelector("[data-hose]").style.display = st.out ? "" : "none";
      el.querySelector("[data-ldoor]").setAttribute("transform", st.doors ? "translate(88,0) scale(.18,1) translate(-88,0)" : "");
      el.querySelector("[data-rdoor]").setAttribute("transform", st.doors ? "translate(308,0) scale(.18,1) translate(-308,0)" : "");
      el.querySelector("[data-rdoor]").style.opacity = st.doors ? ".7" : "1"; el.querySelector("[data-ldoor]").style.opacity = st.doors ? ".7" : "1";
      el.querySelector("[data-tabr]").setAttribute("fill", st.mode === "100" ? "#a8180e" : "#ee4a3c");
      el.querySelector("[data-tn]").setAttribute("opacity", st.mode === "N" ? "1" : ".45");
      el.querySelector("[data-t1]").setAttribute("opacity", st.mode === "100" ? "1" : ".45");
      el.querySelector("[data-kp]").setAttribute("transform", st.emer ? "rotate(70)" : "");
      const deliv = !st.oxy ? ["None", "off", "Supply valve closed."] : st.emer ? ["100% positive pressure", "warn", "Protects against smoke and vapours; purges and defogs the mask. Depletes oxygen faster; communication may be difficult."] : st.mode === "100" ? ["100% on demand", "on", "No air mixed in."] : ["Diluted on demand", "on", "Air/oxygen mixture; ratio depends on cabin altitude."];
      el.querySelector("[data-status]").innerHTML = [
        item("Mask", st.out ? (st.harness ? "Out · harness inflated" : "Out") : "Stowed", st.out ? "on" : "off"),
        item("Oxygen to mask", deliv[0], deliv[1], deliv[2]),
        item("Microphone", st.mic === "mask" ? "Mask mic" : "Boom mic", st.mic === "mask" ? "dim" : "off")
      ].join("");
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    const act = {
      pull() { if (st.out) st.msg = "The mask is already out."; else { Object.assign(st, { out: true, doors: true, oxy: true, mic: "mask", harness: true }); flowBlip(); st.msg = "Doors unlock, oxygen on, OXY ON in view, mask mic live. Yellow cross shows as the harness inflates."; } },
      release() { if (!st.out) st.msg = "Pull the mask out first."; else { st.harness = false; st.msg = "Harness deflates onto the head and face."; } },
      inflate() { if (!st.out) st.msg = "Pull the mask out first."; else { st.harness = true; flowBlip(); st.msg = "Right lever inflates the harness; flow indicator blips."; } },
      stow() { if (!st.out) st.msg = "Already stowed."; else { Object.assign(st, { out: false, doors: false, harness: false, mode: "100", emer: false }); st.msg = "Stowed at 100% with EMERGENCY off. Oxygen is still on (flag in view) until you push RESET/TEST."; } },
      open() { if (st.doors) st.msg = "The left door is already open."; else { Object.assign(st, { doors: true, oxy: true, mic: "mask" }); st.msg = "Opening the left door reactivates oxygen and the mask mic."; } },
      reset() { if (st.doors) st.msg = "RESET/TEST works with the left door closed."; else if (st.oxy) { Object.assign(st, { oxy: false, mic: "boom" }); st.msg = "Oxygen off, flag stowed, mask mic off, boom mic on."; } else { flowBlip(1000); st.msg = "Regulator test: oxygen on momentarily (yellow cross)."; } },
      ptt() { flowBlip(900); st.msg = "Tests the positive pressure supply to the regulator."; },
      tab() { st.mode = st.mode === "N" ? "100" : "N"; st.msg = st.mode === "N" ? "N: air/oxygen mix on demand." : "100%: pure oxygen on demand."; },
      knob() { st.emer = !st.emer; st.msg = st.emer ? "EMERGENCY: 100% under positive pressure. Use only as conditions require." : "EMERGENCY off."; }
    };
    el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]"), p = e.target.closest("[data-pb]"), tb = e.target.closest("[data-tab]"), kn = e.target.closest("[data-knob]");
      if (a) act[a.dataset.a](); else if (tb) act.tab(); else if (kn) act.knob(); else if (p) act[p.dataset.pb](); else return;
      draw();
    });
    el.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const g = e.target.closest("[data-pb],[data-tab],[data-knob]"); if (!g) return; e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
    draw();
    return () => clearTimeout(ft);
  };

  /* ════════ DOORS SYNOPTIC ════════ */
  W.doorsSynoptic = function (el) {
    const DOORS = [
      { id: "nose", n: "NOSE CARGO", msg: "DOOR NOSE CARGO", lv: "C", shape: `<polygon points="190,50 210,50 217,66 210,82 190,82 183,66"/>`, lab: [40, 66, "start"], tip: [183, 66] },
      { id: "fd", n: "F/D OVHD", msg: "DOOR F/D OVHD", lv: "A", shape: `<rect x="196" y="94" width="9" height="9"/>`, lab: [40, 102, "start"], tip: [196, 98] },
      { id: "mel", n: "MAIN ELEC", msg: "DOOR ELEC MAIN", lv: "A", shape: `<rect x="181" y="111" width="9" height="7"/>`, lab: [40, 118, "start"], tip: [181, 114] },
      { id: "entry", n: "ENTRY 1", msg: "DOOR ENTRY L1", lv: "A", shape: `<rect x="176" y="126" width="11" height="8"/>`, lab: [40, 134, "start"], tip: [176, 130] },
      { id: "upper", n: "UPPER DECK", msg: "DOOR R UPPER DK", lv: "A", shape: `<rect x="208" y="111" width="12" height="7"/>`, lab: [360, 118, "end"], tip: [220, 114] },
      { id: "fwd", n: "FWD CARGO", msg: "DOOR FWD CARGO", lv: "C", shape: `<rect x="206" y="142" width="16" height="16"/>`, lab: [360, 154, "end"], tip: [222, 150] },
      { id: "cel", n: "CTR ELEC", msg: "DOOR ELEC CTR", lv: "A", shape: `<rect x="195" y="222" width="10" height="10"/>`, lab: [360, 230, "end"], tip: [205, 227] },
      { id: "side", n: "SIDE CARGO", msg: "DOOR SIDE CARGO", lv: "C", shape: `<rect x="176" y="326" width="16" height="16"/>`, lab: [40, 338, "start"], tip: [176, 334] },
      { id: "aft", n: "AFT CARGO", msg: "DOOR AFT CARGO", lv: "C", shape: `<rect x="207" y="326" width="16" height="16"/>`, lab: [360, 338, "end"], tip: [223, 334] },
      { id: "bulk", n: "BULK CARGO", msg: "DOOR BULK CARGO", lv: "A", shape: `<rect x="210" y="350" width="10" height="10"/>`, lab: [360, 360, "end"], tip: [220, 355] }
    ];
    const open = new Set(), order = [];
    let mc = false, beepT = null;
    const lines = DOORS.map((d) => {
      const x2 = d.lab[2] === "start" ? d.lab[0] + d.n.length * 7.6 + 6 : d.lab[0] - d.n.length * 7.6 - 6;
      return `<path d="M${x2},${d.lab[1] - 4} H${d.lab[2] === "start" ? Math.min(d.tip[0] - 4, 168) : Math.max(d.tip[0] + 4, 232)} L${d.tip[0]},${d.tip[1]}" class="ld"/>
        <text x="${d.lab[0]}" y="${d.lab[1]}" text-anchor="${d.lab[2]}" class="lb">${d.n}</text>`;
    }).join("");
    const svg = `<svg viewBox="20 18 360 410" role="img" aria-label="Doors synoptic">
      <path class="ol" d="M200,28 C214,28 226,52 228,82 L228,372 C228,398 216,414 200,414 C184,414 172,398 172,372 L172,82 C174,52 186,28 200,28 Z"/>
      <path class="ol" d="M172,196 L58,298 M172,246 L104,272 M228,196 L342,298 M228,246 L296,272 M174,386 L140,410 M226,386 L260,410"/>
      ${lines}${DOORS.map((d) => `<g class="door" data-door="${d.id}" role="button" tabindex="0" aria-label="${d.n}">${d.shape}</g>`).join("")}</svg>`;
    frame(el, "Doors synoptic and EICAS", {
      body: `<div class="wg-grid two"><div class="disp syn" style="padding:6px"><div class="disp-t" style="padding:4px 6px 0"><span>MFD · DRS</span><span>TAP A DOOR</span></div>${svg}</div>
        <div style="display:grid;gap:12px;align-content:start">
          <div class="mc"><button class="mcaution" data-mc aria-label="Master caution, push to reset">CAUTION</button><span class="beep" data-beep>♪ BEEPER</span></div>
          <div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs style="min-height:8em"></div></div>
          <div class="doorlist">${DOORS.map((d) => `<button data-door="${d.id}" aria-pressed="false">${d.n}<i>${d.lv === "C" ? "CAUTION" : "ADVISORY"}</i></button>`).join("")}</div>
          <button class="btn" data-a="close" style="justify-self:start">Close all doors</button>
        </div></div>`,
      foot: "Amber outline = door open; blank = closed; labels always cyan (AOM 1.30.22). Message levels from AOM 1.60.1. Shown with DOORS ELEC replacing the two single E/E messages when both are open; the AOM gives the message logic only."
    });
    function msgs() {
      const both = open.has("mel") && open.has("cel"), list = [];
      order.slice().reverse().forEach((id) => {
        if (!open.has(id)) return;
        if (both && (id === "mel" || id === "cel")) { if (!list.find((m) => m[0] === "DOORS ELEC")) list.push(["DOORS ELEC", "A"]); return; }
        const d = DOORS.find((x) => x.id === id); list.push([d.msg, d.lv]);
      });
      return orderMsgs(list);
    }
    function draw() {
      el.querySelectorAll("[data-door]").forEach((n) => { const o = open.has(n.dataset.door); n.classList.toggle("open", o); if (n.tagName === "BUTTON") n.setAttribute("aria-pressed", String(o)); });
      el.querySelector("[data-msgs]").innerHTML = eicasList(msgs());
      el.querySelector("[data-mc]").classList.toggle("on", mc);
    }
    function toggle(id) {
      if (open.has(id)) { open.delete(id); order.splice(order.indexOf(id), 1); }
      else {
        open.add(id); order.push(id);
        if (DOORS.find((x) => x.id === id).lv === "C") { mc = true; const b = el.querySelector("[data-beep]"); b.classList.add("on"); clearTimeout(beepT); beepT = setTimeout(() => b.classList.remove("on"), 1200); }
      }
      draw();
    }
    el.addEventListener("click", (e) => {
      const d = e.target.closest("[data-door]"); if (d) return toggle(d.dataset.door);
      if (e.target.closest("[data-mc]")) { mc = false; draw(); }
      if (e.target.closest('[data-a="close"]')) { open.clear(); order.length = 0; draw(); }
    });
    el.addEventListener("keydown", (e) => { const d = e.target.closest("g[data-door]"); if (d && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(d.dataset.door); } });
    draw();
    return () => clearTimeout(beepT);
  };

  /* ════════ SIDE CARGO DOOR ════════ */
  W.sideDoor = function (el) {
    const st = { view: "ext", bus: "ON", ret: "CLOSED", handle: false, p: 0, latched: true, unl: 0, ramp: "OFF", msg: "Door closed, latched and locked. Open the interior retainer to begin." };
    const held = { dc: null };
    const T = K.t, D = { dark: true };
    const handleG = (x, y) => `<g data-a="handle" class="pk-handle" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="Latch lock handle"><g data-hdl></g><rect class="hit" x="-20" y="-50" width="40" height="100"/></g>`;
    const ext = K.svg(330, 206, `<rect x="2" y="2" width="326" height="202" rx="8" fill="#dfe2e4" stroke="#9aa0a5"/>` + handleG(44, 100) + T(44, 172, "LATCH LOCK", { dark: 1, fs: 7 }) + T(44, 181, "HANDLE", { dark: 1, fs: 7 }) +
      `<rect x="86" y="22" width="232" height="164" rx="10" fill="#c3c7ca" stroke="#5b6267" stroke-width="3"/>` +
      T(134, 44, "DOOR UP", D) + K.lamp("up", 134, 72, "green") + K.holdTog("dc", 192, 104, "bat", "open", "close", "Door control switch") + K.lamp("lc", 134, 136, "green") + T(134, 172, "LATCHED CLOSED", D) +
      T(262, 44, "INTERPHONE", D) + K.jack(262, 72) + T(262, 110, "POWER ON", D) + K.lamp("pw", 262, 138, "green"), "Side cargo door exterior panel");
    const intp = K.svg(450, 196, K.grey(4, 4, 442, 188) + handleG(42, 96) + `<g data-ret></g>` + T(42, 168, "LATCH LOCK", { dark: 1, fs: 7 }) + T(42, 177, "HANDLE", { dark: 1, fs: 7 }) +
      [["RAMP", "LIGHTS", 112], ["POWER", "ON", 172], ["INPH", "JACK", 226], ["LATCHES", "CLOSED", 280], ["DOOR", "UP", 334], ["DOOR", "CONTROL", 396]].map(([a, b, x]) => T(x, 32, a, D) + T(x, 43, b, D)).join("") +
      K.tog("ramp", 112, 100, 2, "bat", "Ramp lights") + T(88, 82, "ON", { dark: 1, a: "end", fs: 9 }) + T(88, 124, "OFF", { dark: 1, a: "end", fs: 9 }) +
      K.lamp("pw2", 172, 100, "green") + K.jack(226, 100) + K.lamp("lc2", 280, 100, "green") + K.lamp("up2", 334, 100, "green") +
      K.rocker("dc", 396, 104, "Door control rocker") + T(396, 64, "OPEN", { dark: 1, fs: 8 }) + T(396, 150, "CLOSE", { dark: 1, fs: 8 }) + T(230, 178, "SIDE DOOR CONTROL", { dark: 1, fs: 11 }), "Side door control, interior");
    frame(el, "Side cargo door", {
      tools: seg("view", [["ext", "Exterior panel"], ["int", "Interior panel"]]) + regSel(),
      body: `<div style="display:grid;gap:12px">
        <div class="conds">${seg("bus", [["ON", "Powered"], ["OFF", "Unpowered"]], "Main deck cargo handling bus")}${seg("ret", [["CLOSED", "Closed"], ["OPEN", "Open"]], "Interior latch lock handle retainer")}</div>
        <div class="pk-wide sd"><div data-panel="ext">${ext}</div><div data-panel="int" hidden>${intp}</div></div>${holdMode("sd-latch")}
        <div class="wg-grid wide3d"><div style="display:grid;gap:10px"><div class="g3wrap" data-wrap style="aspect-ratio:16 / 11"><span class="g3hint">Drag to turn · pinch to zoom</span></div>
          <div class="prog"><i data-prog></i></div></div>
          <div style="display:grid;gap:10px;align-content:start"><div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs style="min-height:2em"></div></div>
          <p data-msg class="hint" aria-live="polite"></p><ul class="status" data-status></ul></div></div></div>`,
      foot: "Panels after AOM 1.30.29–32; sequence from 1.50.7. Door travel time is compressed."
    });
    const wrap = el.querySelector("[data-wrap]");
    const v = view3d(wrap, el, { mode: "orbit", yaw: -1.3, pitch: 0.2, dist: 44, target: [51.3, 0, 6], doors: { side: 0 } });
    if (!v) wrap.insertAdjacentHTML("beforeend", no3d);
    const latch = () => el.querySelector("#sd-latch").checked;
    const powered = () => st.bus === "ON";
    const ctlLive = () => powered() && st.handle;
    const H = K.holds(el, held, latch, () => draw());
    el.querySelector("#sd-latch").addEventListener("change", () => H.release());
    const tick = setInterval(() => {
      let moved = false;
      if (held.dc && !ctlLive()) st.msg = !powered() ? "No power: POWER ON is out." : "Extend the latch lock handle to power the door control switch.";
      if (held.dc === "open" && ctlLive()) {
        if (st.latched) { st.unl += 1; if (st.unl >= 8) { st.latched = false; st.unl = 0; } moved = true; }
        else if (st.p < 100) { st.p = Math.min(100, st.p + 1.6); moved = true; st.msg = "Opening. LATCHED CLOSED went out as the door moved."; }
        else st.msg = "Fully open: DOOR UP is lit.";
      } else if (held.dc === "close" && ctlLive()) {
        if (st.p > 0) { st.p = Math.max(0, st.p - 1.6); moved = true; st.msg = "Closing."; }
        else if (!st.latched) { st.unl += 1; if (st.unl >= 8) { st.latched = true; st.unl = 0; st.msg = "Closed and latched: LATCHED CLOSED lit. Stow the handle to lock."; } moved = true; }
      }
      if (moved || held.dc) draw();
    }, 60);
    function draw() {
      setSeg(el, "view", st.view); setSeg(el, "bus", st.bus); setSeg(el, "ret", st.ret);
      el.querySelector('[data-panel="ext"]').hidden = st.view !== "ext";
      el.querySelector('[data-panel="int"]').hidden = st.view !== "int";
      K.setTog(el, "ramp", st.ramp === "ON" ? 0 : 1);
      K.leverAt(el, "dc", held.dc === "open" ? -1 : held.dc === "close" ? 1 : 0);
      K.setRocker(el, "dc", held.dc);
      const pw = powered(), lc = st.handle && st.p === 0 && st.latched, up = st.p >= 100;
      ["pw", "pw2"].forEach((r) => K.setLamp(el, r, pw)); ["lc", "lc2"].forEach((r) => K.setLamp(el, r, lc && pw)); ["up", "up2"].forEach((r) => K.setLamp(el, r, up && pw));
      el.querySelectorAll("[data-hdl]").forEach((g) => { g.innerHTML = st.handle
        ? `<rect x="-14" y="-44" width="28" height="88" rx="5" fill="#4a5055"/><g transform="rotate(-28 0 40)"><rect x="-11" y="-40" width="22" height="80" rx="5" fill="#f3f5f6" stroke="#6b7277" stroke-width="1.5"/><rect x="-7" y="-36" width="14" height="10" rx="2" fill="#aab0b5"/></g>`
        : `<rect x="-12" y="-42" width="24" height="84" rx="5" fill="#f0f2f3" stroke="#6b7277" stroke-width="1.5"/><rect x="-7" y="-37" width="14" height="10" rx="2" fill="#aab0b5" stroke="#6b7277"/>`; });
      el.querySelector("[data-ret]").innerHTML = st.ret === "CLOSED" ? `<rect x="24" y="50" width="36" height="92" rx="4" fill="#9aa1a6" stroke="#5b6267" opacity=".92"/><text x="42" y="98" class="pk-t d" font-size="6.5" text-anchor="middle" transform="rotate(-90 42 96)">RETAINER</text>` : "";
      if (v) v.set({ doors: { side: st.p / 100 } });
      el.querySelector("[data-prog]").style.width = st.p + "%";
      const locked = st.p === 0 && st.latched && !st.handle;
      el.querySelector("[data-status]").innerHTML = [
        item("Door", st.p === 0 ? "Closed" : up ? "Full open" : "Moving / partly open", st.p === 0 ? "off" : up ? "on" : "dim"),
        item("Latches", st.latched ? "Engaged" : "Disengaged", st.latched ? "on" : "dim"),
        item("Latch lock handle", st.handle ? "Extended" : "Stowed (locked)", st.handle ? "dim" : "on"),
        item("Ramp lights", st.ramp === "ON" ? "On" : "Off", st.ramp === "ON" ? "on" : "off", "Lights in the upper part of the door.")
      ].join("");
      el.querySelector("[data-msgs]").innerHTML = eicasList(locked ? [] : [["DOOR SIDE CARGO", "C"]]);
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    K.bind(el, { ramp: { kind: "tog", pos: ["ON", "OFF"], get: () => st.ramp, set: (x) => (st.ramp = x) } }, draw);
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), a = e.target.closest('[data-a="handle"]');
      if (sg) {
        if (sg.dataset.seg === "ret" && sg.dataset.v === "CLOSED" && st.handle) st.msg = "Stow the latch lock handle before closing the retainer.";
        else { st[sg.dataset.seg] = sg.dataset.v; if (sg.dataset.seg === "view") H.release(); }
      } else if (a) {
        if (st.handle) { if (st.p === 0 && st.latched) { st.handle = false; H.release(); st.msg = "Handle stowed: door locked. DOOR SIDE CARGO clears."; } else st.msg = "Close and latch the door before stowing the handle."; }
        else if (st.ret !== "OPEN") st.msg = "The interior retainer must be open to operate the door from either side.";
        else { st.handle = true; st.msg = (st.view === "ext" ? "Upper release pressed (frees both handles), handle pulled down. " : "Handle extended. ") + "Door control powered." + (powered() ? " LATCHED CLOSED lit." : ""); }
      } else return;
      draw();
    });
    el.addEventListener("keydown", (e) => { const a = e.target.closest('[data-a="handle"]'); if (a && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); a.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    draw();
    return () => { clearInterval(tick); if (v) v.destroy(); };
  };

  /* ════════ NOSE CARGO DOOR ════════ */
  W.noseDoor = function (el) {
    const LAT = ["1L", "2L", "3L", "4L", "5L", "6L", "7L", "8L", "1R", "2R", "3R", "4R", "5R", "6R", "7R", "8R"];
    const st = { bus: "ON", p: 0, lat: Object.fromEntries(LAT.map((k) => [k, true])), lockout: true, lamp: false, sel: "1L", tClosed: false, tOpen: false, tLamp: false, cTest: false,
      lights: { th: "OFF", sw: "OFF", ce: "OFF", sp: "OFF" }, msg: "Door closed and latched, lock-out engaged. Hold SYSTEM POWER ON to begin." };
    const held = { sys: null, dc: null };
    const T = K.t, D = { dark: true };
    const ctl = K.svg(400, 284, K.grey(4, 4, 392, 276) + T(200, 28, "NOSE CARGO DOOR CONTROLS", { dark: 1, fs: 12 }) +
      `<path d="M208,44 V182" stroke="#7d8489" stroke-width="1"/>` +
      K.lamp("pw", 92, 66, "white") + K.lamp("lo", 164, 66, "green") + K.lamp("lc", 252, 66, "green") + K.lamp("up", 324, 66, "blue") +
      T(92, 98, "POWER", D) + T(92, 108, "ON", D) + T(164, 98, "LOCK-OUT", D) + T(164, 108, "ENGAGED", D) + T(252, 98, "LATCHES", D) + T(252, 108, "CLOSED", D) + T(324, 98, "DOOR", D) + T(324, 108, "UP", D) +
      K.holdTog("sys", 92, 142, "red", "lock", "on", "System power switch") + T(62, 132, "OFF/", { dark: 1, fs: 8, a: "end" }) + T(122, 132, "ON", { dark: 1, fs: 8, a: "start" }) + T(92, 166, "LOCK TEST", { dark: 1, fs: 8 }) + T(92, 177, "SYSTEM POWER", { dark: 1, fs: 8.5 }) +
      K.hexb("lamp", 164, 142, "Lamp test") + T(164, 166, "LAMP", { dark: 1, fs: 8 }) + T(164, 176, "TEST", { dark: 1, fs: 8 }) +
      K.holdTog("dc", 290, 142, "red", "close", "open", "Door control switch") + T(260, 132, "CLOSE", { dark: 1, fs: 8, a: "end" }) + T(320, 132, "OPEN", { dark: 1, fs: 8, a: "start" }) + T(290, 168, "DOOR", { dark: 1, fs: 8.5 }) + T(290, 178, "CONTROL", { dark: 1, fs: 8.5 }) +
      `<path d="M18,196 H382" stroke="#7d8489" stroke-width="1.2"/>` + T(46, 218, "OFF", { dark: 1, fs: 8 }) + T(92, 218, "ON", { dark: 1, fs: 8 }) +
      [["th", 70, "THRESHOLD"], ["sw", 160, "SIDEWALL"], ["ce", 245, "CEILING"], ["sp", 330, "NOSE SPOT LIGHT"]].map(([id, x, l]) => K.tog(id, x, 236, 2, "red", l) + T(x, 258, l, { dark: 1, fs: 8 })).join("") +
      T(200, 274, "LIGHT CONTROLS", { dark: 1, fs: 9 }), "Nose cargo door control panel");
    const LPOS = { "7L": [44, 62], "8L": [92, 62], "8R": [332, 62], "7R": [380, 62], "6L": [44, 102], "6R": [380, 102], "5L": [44, 142], "5R": [380, 142], "4L": [44, 188], "3L": [92, 188], "2L": [140, 188], "1L": [188, 188], "1R": [236, 188], "2R": [284, 188], "3R": [332, 188], "4R": [380, 188] };
    const ann = K.svg(424, 300, K.grey(4, 4, 416, 292, false) + T(212, 26, "NOSE CARGO DOOR LATCH ANNUNCIATOR", { dark: 1, fs: 10 }) +
      `<path d="M168,62 C168,42 256,42 256,62 L256,140 C256,158 168,158 168,140 Z" fill="none" stroke="#5b6267" stroke-width="2"/><text x="212" y="96" class="pk-t d" font-size="6.5" text-anchor="middle">REAR VIEW</text><text x="212" y="105" class="pk-t d" font-size="6.5" text-anchor="middle">NOSE DOOR</text>` +
      T(118, 118, "DOOR CLOSED", { dark: 1, fs: 6.5 }) + T(118, 126, "ALL LIGHTS GREEN", { dark: 1, fs: 6.5 }) + T(306, 118, "DOOR OPEN", { dark: 1, fs: 6.5 }) + T(306, 126, "ALL LIGHTS AMBER", { dark: 1, fs: 6.5 }) +
      `<g data-lats></g><path d="M18,222 H406" stroke="#7d8489"/>` + T(212, 240, "NOSE CARGO DOOR CLOSED ANNUNCIATOR", { dark: 1, fs: 9 }) +
      [["L", 150, "LEFT"], ["R", 274, "RIGHT"]].map(([s, x, l]) => `<g data-a="ctest" class="pk-pb" transform="translate(${x},264)" tabindex="0" role="button" aria-label="Door closed annunciator ${l}, push to test"><rect x="-24" y="-16" width="48" height="30" rx="2" fill="#24282b"/><rect data-cl="${s}1" x="-21" y="-13" width="42" height="11" rx="1"/><rect data-cl="${s}2" x="-21" y="0" width="42" height="11" rx="1"/><text x="0" y="-5" font-size="6" class="lgt" text-anchor="middle">CLOSED</text><text x="0" y="8" font-size="5.5" class="lgt" text-anchor="middle">NOT CLOSED</text><text x="0" y="25" class="pk-t d" font-size="6.5" text-anchor="middle">${l}</text><rect class="hit" x="-24" y="-16" width="48" height="30"/></g>`).join(""), "Latch and door closed annunciators");
    const latAng = (k) => { const n = +k[0], R = k[1] === "R"; return (R ? 1 : -1) * (180 - (n - 0.5) * 22.5); };
    const testp = K.svg(300, 244, K.grey(4, 4, 292, 236) + T(150, 24, "LATCH ACTUATOR TEST", { dark: 1, fs: 10 }) +
      T(46, 44, "LATCH CLOSED", { dark: 1, fs: 7 }) + K.lamp("tc", 46, 66, "green", 11) + T(254, 44, "LATCH OPEN", { dark: 1, fs: 7 }) + K.lamp("to", 254, 66, "green", 11) +
      T(150, 50, "LATCH SELECT", { dark: 1, fs: 7 }) + `<g class="dk">${K.rot("sel", 150, 110, LAT.map((k) => ({ v: k, a: latAng(k), l: k, fs: 7.5 })), "Latch select", false, 38)}</g>` +
      T(46, 104, "TEST", { dark: 1, fs: 7 }) + K.hexb("tclosed", 46, 124, "Latch closed test") + T(254, 104, "TEST", { dark: 1, fs: 7 }) + K.hexb("topen", 254, 124, "Latch open test") +
      T(254, 170, "LAMP TEST", { dark: 1, fs: 7 }) + K.hexb("tlamp", 254, 190, "Lamp test") +
      `<rect x="16" y="168" width="186" height="64" rx="3" fill="#e8eaec" stroke="#5b6267"/>` + T(109, 180, "TEST INSTRUCTIONS", { dark: 1, fs: 6.5 }) +
      ["1 OPEN OR CLOSE LATCHES WITH", "  NOSE CARGO DOOR CONTROL", "2 SELECT LATCH TO BE TESTED", "3 DEPRESS APPROPRIATE TEST SWITCH"].map((s, i) => T(22, 192 + i * 10, s, { dark: 1, fs: 6, a: "start" })).join(""), "Latch actuator test panel");
    frame(el, "Nose cargo door", {
      tools: seg("bus", [["ON", "Bus powered"], ["OFF", "Bus unpowered"]]) + regSel(),
      body: `<div style="display:grid;gap:14px">
        <div class="pk-wide">${ctl}</div>${holdMode("nd-latch")}
        <div class="wg-grid wide3d"><div style="display:grid;gap:10px"><div class="g3wrap" data-wrap style="aspect-ratio:16 / 11"><span class="g3hint">Drag to turn · pinch to zoom</span></div>
          <div class="prog"><i data-prog></i></div></div>
          <div style="display:grid;gap:10px;align-content:start"><div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs style="min-height:2em"></div></div>
          <p data-msg class="hint" aria-live="polite"></p><ul class="status" data-status></ul></div></div>
        <div class="wg-grid two">${ann}${testp}</div></div>`,
      foot: "Panels after AOM 1.30.33–38; logic from 1.50.7–8. Modelled with the control system staying powered after SYSTEM POWER ON is released until OFF/LOCK TEST is selected, which is why the doors message stays until lock-out is engaged. Travel time compressed."
    });
    const wrap = el.querySelector("[data-wrap]");
    const v = view3d(wrap, el, { mode: "orbit", yaw: -2.35, pitch: 0.2, dist: 54, target: [10, 0, 5.6], doors: { nose: 0 } });
    if (!v) wrap.insertAdjacentHTML("beforeend", no3d);
    const latch = () => el.querySelector("#nd-latch").checked;
    const bus = () => st.bus === "ON";
    const allLatched = () => LAT.every((k) => st.lat[k]);
    const anyLatched = () => LAT.some((k) => st.lat[k]);
    let prevSys = null;
    function onHold() {
      const sysChanged = held.sys !== prevSys; prevSys = held.sys;
      if (held.dc && held.sys !== "on") st.msg = !bus() ? "No cargo handling bus power." : "Door control needs SYSTEM POWER held ON at the same time.";
      if (held.sys === "on" && bus()) { if (st.lockout) st.msg = "Control system powered, lock-out released. POWER ON lit."; st.lockout = false; }
      if (held.sys === "lock" && bus()) { st.lockout = true; st.msg = "OFF/LOCK TEST: control system unpowered, lock-out engaged. LOCK-OUT ENGAGED lit while held."; }
      if (sysChanged && held.sys === null && st.lockout && bus()) st.msg = st.p === 0 && allLatched() ? "Released: LOCK-OUT ENGAGED out. Power removed, lock-out engaged." : st.msg;
      draw();
    }
    const H = K.holds(el, held, latch, onHold);
    el.querySelector("#nd-latch").addEventListener("change", () => H.release());
    const tick = setInterval(() => {
      let moved = false;
      const drive = bus() && held.sys === "on" && !st.lockout;
      if (held.dc && !drive) st.msg = !bus() ? "No cargo handling bus power. (A mechanical system operates the door without electrical power.)" : "Hold SYSTEM POWER ON together with DOOR CONTROL.";
      if (drive && held.dc === "open") {
        if (anyLatched()) { st.lat[LAT.find((x) => st.lat[x])] = false; moved = true; st.msg = "Latches opening…"; }
        else if (st.p < 100) { st.p = Math.min(100, st.p + 1.2); moved = true; st.msg = "Opening. Release either switch to stop."; }
        else st.msg = "Full up: DOOR UP (blue) lit.";
      } else if (drive && held.dc === "close") {
        if (st.p > 0) { st.p = Math.max(0, st.p - 1.2); moved = true; st.msg = "Closing. Release either switch to stop."; }
        else if (!allLatched()) { st.lat[LAT.slice().reverse().find((x) => !st.lat[x])] = true; moved = true; st.msg = allLatched() ? "All latch pins latched: LATCHES CLOSED lit. Now select OFF/LOCK TEST." : "Latches closing…"; }
      }
      if (moved) draw();
    }, 55);
    function draw() {
      setSeg(el, "bus", st.bus);
      const ctlOn = bus() && !st.lockout, lampT = st.lamp && ctlOn;
      K.setLamp(el, "pw", ctlOn || lampT); K.setLamp(el, "lo", (bus() && held.sys === "lock") || lampT);
      K.setLamp(el, "lc", (ctlOn && st.p === 0 && allLatched()) || lampT); K.setLamp(el, "up", (ctlOn && st.p >= 100) || lampT);
      K.setHex(el, "lamp", st.lamp); K.setHex(el, "tclosed", st.tClosed); K.setHex(el, "topen", st.tOpen); K.setHex(el, "tlamp", st.tLamp);
      K.leverAt(el, "sys", held.sys === "lock" ? -1 : held.sys === "on" ? 1 : 0);
      K.leverAt(el, "dc", held.dc === "close" ? -1 : held.dc === "open" ? 1 : 0);
      ["th", "sw", "ce", "sp"].forEach((k) => K.setTog(el, k, st.lights[k] === "ON" ? 1 : 0));
      if (v) v.set({ doors: { nose: st.p / 100 } });
      el.querySelector("[data-prog]").style.width = st.p + "%";
      el.querySelector("[data-lats]").innerHTML = LAT.map((k) => { const [x, y] = LPOS[k], on = st.lat[k], test = st.cTest, n = +k[0];
        const lx = n >= 5 ? (k[1] === "L" ? -30 : 30) : 0, ly = n >= 5 ? 3 : 24;
        return `<g transform="translate(${x},${y})"><rect x="-21" y="-14" width="42" height="28" rx="2" fill="#24282b"/><rect x="-19" y="-12" width="38" height="11" rx="1" fill="${on || test ? "#35e06e" : "#2c3a31"}"/><rect x="-19" y="1" width="38" height="11" rx="1" fill="${!on || test ? "#ffb21f" : "#3d3522"}"/>
          <text y="-4" font-size="5.6" text-anchor="middle" class="lgt">LATCHED</text><text y="9" font-size="5.4" text-anchor="middle" class="lgt">NOT LCHD</text><text x="${lx}" y="${ly}" font-size="7" text-anchor="middle" class="pk-t d">${k}</text></g>`; }).join("");
      const closed = st.p === 0;
      ["L", "R"].forEach((s) => { el.querySelector(`[data-cl="${s}1"]`).setAttribute("fill", closed || st.cTest ? "#35e06e" : "#2c3a31"); el.querySelector(`[data-cl="${s}2"]`).setAttribute("fill", !closed || st.cTest ? "#ffb21f" : "#3d3522"); });
      K.setRot(el, "sel", latAng(st.sel));
      K.setLamp(el, "tc", bus() && ((st.tClosed && st.lat[st.sel]) || st.tLamp));
      K.setLamp(el, "to", bus() && ((st.tOpen && !st.lat[st.sel]) || st.tLamp));
      const Lt = st.lights, nLat = LAT.filter((k) => st.lat[k]).length;
      el.querySelector("[data-status]").innerHTML = [
        item("Door", closed ? "Closed" : st.p >= 100 ? "Full up" : "Partly open", closed ? "off" : st.p >= 100 ? "on" : "dim"),
        item("Latches", `${nLat}/16 latched`, nLat === 16 ? "on" : nLat ? "dim" : "off"),
        item("Electrical lock-out", st.lockout ? "Engaged" : "Released", st.lockout ? "on" : "dim", st.lockout ? "" : "Control system powered. Select OFF/LOCK TEST when done."),
        item("Threshold (ramp) lights", Lt.th === "ON" ? (st.p >= 100 ? "On" : "Stowed") : "Off", Lt.th === "ON" ? (st.p >= 100 ? "on" : "inh") : "off", Lt.th === "ON" && st.p < 100 ? "Only illuminate with the door full open." : ""),
        item("Nose spot light", Lt.sp === "ON" ? (closed ? "On" : "Not useful") : "Off", Lt.sp === "ON" ? (closed ? "on" : "inh") : "off", Lt.sp === "ON" ? (closed ? "Lights the forward main deck; use with the mirror to check end locks." : "Lights the forward main deck with the door closed.") : ""),
        item("Main deck sidewall / ceiling", `${Lt.sw === "ON" ? "Sidewall" : ""}${Lt.sw === "ON" && Lt.ce === "ON" ? " + " : ""}${Lt.ce === "ON" ? "Ceiling" : ""}` || "Off", Lt.sw === "ON" || Lt.ce === "ON" ? "on" : "off")
      ].join("");
      el.querySelector("[data-msgs]").innerHTML = eicasList(closed && allLatched() && st.lockout ? [] : [["DOOR NOSE CARGO", "C"]]);
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    const press = (key, ms) => { st[key] = true; draw(); setTimeout(() => { st[key] = false; draw(); }, ms); };
    K.bind(el, {
      ...Object.fromEntries(["th", "sw", "ce", "sp"].map((k) => [k, { kind: "tog", pos: ["OFF", "ON"], get: () => st.lights[k], set: (x) => (st.lights[k] = x) }])),
      sel: { kind: "rot", pos: LAT, get: () => st.sel, set: (x) => (st.sel = x) }
    }, draw);
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), hx = e.target.closest("[data-hexb]"), a = e.target.closest('[data-a="ctest"]');
      if (sg) { st.bus = sg.dataset.v; if (!bus()) st.msg = "Bus unpowered: control panel dark. Annunciator panels still show closed and latched state."; draw(); }
      else if (hx) {
        const k = hx.dataset.hexb;
        if (k === "lamp") { if (bus() && !st.lockout) { st.msg = "Lamp test: all four lights."; press("lamp", 1500); } else { st.msg = "Lamp test is available with SYSTEM POWER ON."; draw(); } }
        if (k === "tclosed") press("tClosed", 1500); if (k === "topen") press("tOpen", 1500); if (k === "tlamp") press("tLamp", 1500);
      } else if (a) press("cTest", 1200);
    });
    el.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const g = e.target.closest("[data-hexb],[data-a='ctest']"); if (!g) return; e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
    draw();
    return () => { clearInterval(tick); if (v) v.destroy(); };
  };
})();
