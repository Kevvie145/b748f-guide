/* 747-8F Tech Guide — interactive panels for Chapter 1.
   Each widget builds its DOM once, then updates classes/text on state change. */
(function () {
  "use strict";
  const B = (window.B748 = window.B748 || { chapters: {} });
  const W = (B.W = B.W || {});

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
  const PH = 28;
  const sw = (key, label, pos, o = {}) => `<div class="sw ${o.guard ? "guard" : ""}" data-sw="${key}"><div class="sw-l">${label}</div>
    <div class="sw-b"><button class="sw-track" data-cycle="${key}" aria-label="${esc(label.replace(/<[^>]+>/g, " "))}, next position" style="height:${pos.length * PH - 2}px"><span class="sw-bat"></span></button>
    <div class="sw-pos">${pos.map((p) => `<button data-set="${key}" data-v="${esc(p)}" aria-pressed="false">${esc(p)}</button>`).join("")}</div></div></div>`;
  function setSw(root, key, val, pos) {
    const s = root.querySelector(`[data-sw="${key}"]`); if (!s) return;
    const i = Math.max(0, pos.indexOf(val));
    s.querySelector(".sw-bat").style.top = i * PH + 1 + "px";
    s.querySelectorAll("[data-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === val)));
    const g = s.classList.contains("guard");
    if (g) s.querySelector(".sw-track").style.outlineColor = val === s.dataset.guardpos ? "#d9433a" : "#d9433a55";
  }
  const lamp = (ref, label, c) => `<div class="lamp" data-lamp="${ref}" data-c="${c}"><i></i><span>${label}</span></div>`;
  function setLamp(root, ref, on) { const l = root.querySelector(`[data-lamp="${ref}"]`); if (l) l.classList.toggle("on", !!on); }
  const pb = (act, face, label, c) => `<button class="pb" data-pb="${act}" data-c="${c || "white"}"><span class="face">${face}</span>${label ? `<span>${label}</span>` : ""}</button>`;
  function setPb(root, act, on) { const b = root.querySelector(`[data-pb="${act}"]`); if (b) { b.classList.toggle("on", !!on); b.setAttribute("aria-pressed", String(!!on)); } }
  const holdSw = (key, label, pos) => `<div class="hold"><span class="hl">${label}</span><div class="hold-b">${pos.map((p) => `<button data-hold="${key}" data-v="${p[0]}" aria-pressed="false">${p[1]}</button>`).join("")}</div></div>`;
  function bindHolds(root, held, latch, onChange) {
    const set = (k, v) => { if (held[k] === v) return; held[k] = v; paint(); onChange(); };
    const paint = () => root.querySelectorAll("[data-hold]").forEach((b) => { const on = held[b.dataset.hold] === b.dataset.v; b.classList.toggle("held", on); b.setAttribute("aria-pressed", String(on)); });
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
      const b = e.target.closest("[data-hold]"); if (!b || (e.key !== " " && e.key !== "Enter") || e.repeat) return;
      e.preventDefault(); const k = b.dataset.hold, v = b.dataset.v;
      if (latch()) set(k, held[k] === v ? null : v); else set(k, v);
    });
    root.addEventListener("keyup", (e) => { const b = e.target.closest("[data-hold]"); if (!b || latch()) return; if (e.key === " " || e.key === "Enter") set(b.dataset.hold, null); });
    root.addEventListener("click", (e) => { if (e.target.closest("[data-hold]")) e.preventDefault(); });
    return { paint, release() { Object.keys(held).forEach((k) => (held[k] = null)); paint(); } };
  }
  const holdMode = (id) => `<label class="hold-mode"><input type="checkbox" id="${id}" checked> Tap to latch switches (untick to press and hold, two-handed on iPad)</label>`;
  const eicasList = (msgs) => msgs.length ? msgs.map((m) => `<div class="${m[1]}">${esc(m[0])}</div>`).join("") : `<div class="none">NO MESSAGES</div>`;
  const orderMsgs = (list) => ["W", "C", "A", "M"].flatMap((l) => list.filter((m) => m[1] === l));
  const fmtAlt = (n) => n.toLocaleString("en-US");

  /* ── aircraft geometry (metres; nose at y=0, aft positive, x right) ── */
  const TOP = {
    fus: "M0,0 C1.9,0 3.25,2.8 3.25,8 L3.25,60 C3.25,68 1.6,74 0.45,76.3 L-0.45,76.3 C-1.6,74 -3.25,68 -3.25,60 L-3.25,8 C-3.25,2.8 -1.9,0 0,0 Z",
    wing: "M3.25,25.5 L31.5,49.2 L34.2,54.6 L33.6,55.6 L12,43.2 L3.25,41.5 Z",
    stab: "M2.7,63.5 L11,71.6 L11,74.2 L1.6,73.8 Z",
    fin: "M-0.35,61 L0.35,61 L0.3,76.3 L-0.3,76.3 Z",
    eng: [[11.9, 27.5, 3.3, 7], [21.1, 35.3, 3.1, 6.7]]
  };
  function topPlane(cls) {
    const half = `<path d="${TOP.wing}"/><path d="${TOP.stab}"/>${TOP.eng.map((e) => `<rect x="${e[0] - e[2] / 2}" y="${e[1]}" width="${e[2]}" height="${e[3]}" rx="1.1"/>`).join("")}`;
    return `<g class="${cls}">${half}<g transform="scale(-1,1)">${half}</g><path d="${TOP.fus}"/><path d="${TOP.fin}"/></g>`;
  }
  const SIDE = {
    body: "M0,4.8 C0,6.9 1.7,8.7 4.6,9.45 L8,9.89 L22,9.89 C26,9.89 28.5,8.6 32,8.5 L66,8.5 C71,8.4 74.5,7.6 76.3,6.7 L75.6,6.0 C72,4.9 66,3.5 58,2.6 L44,2.1 L14,2.1 C6,2.1 1.6,3.0 0,4.8 Z",
    fin: "M60,8.5 L72.6,19.4 L76.2,19.4 L75.2,7.4 Z",
    stab: "M64,7.1 L74.6,7.7 L74.4,8.1 L64,7.6 Z",
    wing: "M25.5,4.0 L56,6.2 L56.4,5.7 L41,3.4 L25.5,3.4 Z",
    win: "M3.3,8.2 L6.4,8.75 L6.4,9.25 L3.8,8.85 Z"
  };
  function sidePlane(cls) {
    return `<g class="${cls}"><path d="${SIDE.wing}" class="far"/><path d="${SIDE.fin}"/><path d="${SIDE.body}"/><path d="${SIDE.stab}"/>
      <rect x="27.5" y="1.5" width="7" height="3.1" rx="1.2"/><rect x="35.3" y="2.6" width="6.7" height="2.9" rx="1.1"/>
      <path d="${SIDE.win}" class="win"/>
      <path d="M7.7,2.3 V1.1 M36.6,2.2 V1.1 M38.4,2.2 V1.1" class="strut"/>
      <circle cx="7.7" cy=".62" r=".62"/><circle cx="35.9" cy=".62" r=".62"/><circle cx="37.3" cy=".62" r=".62"/><circle cx="38.7" cy=".62" r=".62"/></g>`;
  }
  function frontPlane(cls) {
    const half = `<path d="M3,4.2 L34.2,6.65 L34.2,7.05 L3,4.95 Z"/><path d="M0,7.0 L11,7.9 L11,8.25 L0,7.5 Z"/>
      <path d="M11.9,4.6 V5.3 M21.1,5.4 V6.1" class="strut"/><circle cx="11.9" cy="3.0" r="1.6"/><circle cx="21.1" cy="3.9" r="1.5"/>
      <rect x="1.35" y="0" width="1.1" height="1.25" rx=".3"/><rect x="5.815" y="0" width="1.1" height="1.25" rx=".3"/><path d="M1.9,1.25 V2.6 M6.365,1.25 V3.6" class="strut"/>`;
    return `<g class="${cls}"><path d="M-0.3,8.6 L0.3,8.6 L0.22,19.4 L-0.22,19.4 Z"/>${half}<g transform="scale(-1,1)">${half}</g>
      <ellipse cx="0" cy="8.6" rx="2.25" ry="1.5"/><ellipse cx="0" cy="5.6" rx="3.25" ry="3.55"/>
      <rect x="-0.75" y="0" width=".6" height="1.2" rx=".2"/><rect x="0.15" y="0" width=".6" height="1.2" rx=".2"/></g>`;
  }
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
    const VIEWS = { plan: ["span", "len", "stabtip", "stab"], side: ["tail", "fd", "ng", "wb", "nm"], front: ["span", "bt", "wt"] };
    const st = { view: "plan", u: "ft" };
    frame(el, "Principal dimensions", {
      tools: seg("view", [["plan", "Plan"], ["side", "Side"], ["front", "Front"]]) + seg("u", [["ft", "ft"], ["m", "m"]]),
      body: `<div class="fig-scroll fig" data-fig></div><div class="tbl-wrap" style="margin-top:12px"><table class="num"><tbody data-list></tbody></table></div>`,
      foot: "Drawn from AOM 1.10.1, fully loaded condition. Outline simplified; dimensions as published."
    });
    const L = (k) => D[k][st.u === "ft" ? 0 : 1];
    function draw() {
      setSeg(el, "view", st.view); setSeg(el, "u", st.u);
      let svg = "";
      if (st.view === "plan") {
        svg = `<svg viewBox="-7 -42 101 92" role="img" aria-label="Plan view with dimensions">${arrowDefs("am")}
          <g transform="rotate(-90)">${topPlane("ac")}</g>
          ${vdim(-34.2, 34.2, 60, L("span"), 55.2, 55.2, "am", -18)}
          ${vdim(-11, 11, 81, L("stab"), 74.6, 74.6, "am", 0.7)}
          ${hdim(0, 74.2, 38, L("stabtip"), 0.5, 11.5, "am")}
          ${hdim(0, 76.3, 45, L("len"), 0.5, 0.5, "am")}</svg>`;
      } else if (st.view === "side") {
        svg = `<svg viewBox="-17 -23 110 33" role="img" aria-label="Side view with dimensions">${arrowDefs("am")}
          <line class="gnd" x1="-14" y1="0" x2="90" y2="0"/>
          <g transform="scale(1,-1)">${sidePlane("ac")}</g>
          ${vdim(0, -19.4, 82, L("tail"), 0, -19.4, "am", -9.2)}
          ${vdim(0, -9.89, -5, L("fd"), 0, -9.89, "am", -4.4, "end", -6.4)}
          <path class="ex" d="M7.6,-9.89 H-4.4"/>
          ${hdim(0, 7.7, 3.4, L("ng"), -4.4, 0.2, "am", -1, "end")}
          ${hdim(7.7, 37.4, 3.4, L("wb"), 0.2, 0.2, "am")}
          ${hdim(0, 37.4, 7.6, L("nm"), -4.4, 0.2, "am")}</svg>`;
      } else {
        svg = `<svg viewBox="-40 -25 80 37" role="img" aria-label="Front view with dimensions">${arrowDefs("am")}
          <line class="gnd" x1="-38" y1="0" x2="38" y2="0"/>
          <g transform="scale(1,-1)">${frontPlane("ac")}</g>
          ${hdim(-34.2, 34.2, -22, L("span"), -7.2, -7.2, "am")}
          ${hdim(-6.365, 6.365, 3.6, L("wt"), 0.2, 0.2, "am", 7.6, "start")}
          ${hdim(-1.9, 1.9, 7.8, L("bt"), 0.2, 0.2, "am", 3, "start")}</svg>`;
      }
      el.querySelector("[data-fig]").innerHTML = svg;
      el.querySelector("[data-list]").innerHTML = VIEWS[st.view].map((k) => `<tr><td>${D[k][2]}</td><td>${D[k][0]} · ${D[k][1]}</td></tr>`).join("");
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-seg]"); if (!b) return; st[b.dataset.seg] = b.dataset.v; draw(); });
    draw();
  };

  /* ════════ TURNING RADIUS ════════ */
  W.turn = function (el) {
    const C = [14.05, 35.74];
    const R = { nose: 38.4, tail: 45.7, tip: 51.8 };
    const arcs = Object.values(R).map((r) => `<circle cx="0" cy="0" r="${r}" class="arc"/>`).join("");
    const ngx = -C[0], ngy = 7.7 - C[1];
    frame(el, "Minimum turning radius", {
      body: `<div class="fig-scroll fig turnfig"><svg viewBox="-60 -56 120 112" role="img" aria-label="Turning radius schematic">
        ${arcs}
        <g transform="translate(${-C[0]},${-C[1]})">${topPlane("ac")}</g>
        <g transform="translate(${ngx},${ngy}) rotate(70)"><rect x="-.5" y="-1.2" width="1" height="2.4" rx=".3" class="wheel"/></g>
        <text class="dt" x="${ngx + 2.2}" y="${ngy + 0.6}">70°</text>
        <path d="M-1.4,0 H1.4 M0,-1.4 V1.4" class="ctr"/><text class="dt" x="2" y="3.4">Centre of turn</text>
        <text class="dt big" x="3" y="-40.2">Nose · 126 ft · 38.4 m</text>
        <text class="dt big" x="12.5" y="47.5">Tail · 150 ft · 45.7 m</text>
        <text class="dt big" x="-57" y="44">Wingtip · 170 ft · 51.8 m</text>
      </svg></div>`,
      foot: "Schematic, not to scale. Right turn shown, steering angle 70°, body gear steering operating. Minimum pavement width for a 180° turn: 172 ft (52.4 m)."
    });
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
    const OO = ["OFF", "ON"], BC = ["OFF", "LWR", "BOTH"];
    const SW = { lo_l: OO, lo_r: OO, li_l: OO, li_r: OO, rt_l: OO, rt_r: OO, taxi: OO, beacon: BC, nav: OO, strobe: OO, wing: OO, logo: OO };
    const beam = (x, y, dx, dy, len, spread, cls) => {
      const a = Math.atan2(dy, dx), s = (spread * Math.PI) / 180;
      const p1 = [x + Math.cos(a - s) * len, y + Math.sin(a - s) * len], p2 = [x + Math.cos(a + s) * len, y + Math.sin(a + s) * len];
      return `<polygon class="${cls}" points="${x},${y} ${p1.join(",")} ${p2.join(",")}"/>`;
    };
    const dot = (x, y, c, r = 0.9) => `<circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="${c}" opacity=".35" filter="url(#xl-blur)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    const t65 = [Math.sin((65 * Math.PI) / 180), -Math.cos((65 * Math.PI) / 180)];
    const L = {
      lo_l: `${beam(-6.6, 28.3, 0, -1, 16, 7, "bm")}${dot(-6.6, 28.3, "#fff6dc")}`,
      lo_r: `${beam(6.6, 28.3, 0, -1, 16, 7, "bm")}${dot(6.6, 28.3, "#fff6dc")}`,
      li_l: `${beam(-4.6, 26.6, 0, -1, 16, 7, "bm")}${dot(-4.6, 26.6, "#fff6dc")}`,
      li_r: `${beam(4.6, 26.6, 0, -1, 16, 7, "bm")}${dot(4.6, 26.6, "#fff6dc")}`,
      rt_l: `${beam(-0.5, 7.7, -t65[0], t65[1], 13, 12, "bm")}${dot(-0.5, 7.7, "#fff6dc", 0.6)}`,
      rt_r: `${beam(0.5, 7.7, t65[0], t65[1], 13, 12, "bm")}${dot(0.5, 7.7, "#fff6dc", 0.6)}`,
      taxi: `${beam(0, 7.2, 0, -1, 20, 13, "bm")}${dot(0, 7.2, "#fff6dc", 0.7)}`,
      bcn_u: dot(0, 22, "#ff3b30", 1),
      bcn_l: `<circle cx="0" cy="40" r="1.6" fill="none" stroke="#ff3b30" stroke-width=".25" stroke-dasharray=".6 .5"/>${dot(0, 40, "#ff3b30", 1)}`,
      nav: `${dot(-32.4, 51, "#ff3b30")}${dot(32.4, 51, "#34ff7a")}${dot(0, 76.6, "#ffffff", 0.7)}${dot(-33.6, 55.6, "#ffffff", 0.55)}${dot(33.6, 55.6, "#ffffff", 0.55)}`,
      strobe: `${dot(-33.4, 53.2, "#ffffff", 1.1)}${dot(33.4, 53.2, "#ffffff", 1.1)}${dot(0, 75.6, "#ffffff", 1)}`,
      wing: `${beam(-3.3, 21.5, -0.8, 0.6, 22, 14, "bm2")}${beam(3.3, 21.5, 0.8, 0.6, 22, 14, "bm2")}${dot(-3.3, 21.5, "#fff6dc", 0.6)}${dot(3.3, 21.5, "#fff6dc", 0.6)}`,
      logo: `${beam(-3.6, 67, 1, -0.25, 4, 22, "bm2")}${beam(3.6, 67, -1, -0.25, 4, 22, "bm2")}${dot(-3.6, 67, "#fff6dc", 0.5)}${dot(3.6, 67, "#fff6dc", 0.5)}`
    };
    const svg = `<svg viewBox="-40 -16 80 98" role="img" aria-label="Airplane plan view showing lit exterior lights">
      <defs><filter id="xl-blur" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="1.2"/></filter>
      <linearGradient id="xl-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6dc" stop-opacity=".55"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient></defs>
      ${topPlane("ac-night")}
      ${Object.keys(L).map((k) => `<g data-l="${k}" class="lt">${L[k]}</g>`).join("")}
    </svg>`;
    const g = (lab, keys) => `<div class="pnl-grp"><span class="gl">${lab}</span><div class="pnl-row">${keys}</div></div>`;
    frame(el, "Exterior lights", {
      body: `<div class="wg-grid two"><div style="display:grid;gap:12px">
          <div class="pnl"><p class="pnl-t">Overhead panel · exterior lights</p>
            <div class="pnl-row">${g("Landing", sw("lo_l", "Outbd<br>L", OO) + sw("lo_r", "Outbd<br>R", OO) + sw("li_l", "Inbd<br>L", OO) + sw("li_r", "Inbd<br>R", OO))}
            ${g("Rwy turnoff", sw("rt_l", "L", OO) + sw("rt_r", "R", OO))}${g("&nbsp;", sw("taxi", "Taxi", OO))}</div>
            <div class="pnl-sep"></div>
            <div class="pnl-row">${sw("beacon", "Beacon", BC)}${sw("nav", "Nav", OO)}${sw("strobe", "Strobe", OO)}${sw("wing", "Wing", OO)}${sw("logo", "Logo", OO)}</div></div>
          <div class="conds">${seg("gear", [["UP", "Up"], ["DOWN", "Down"]], "Landing gear lever")}${seg("ag", [["GROUND", "Ground"], ["AIR", "Air"]], "Air/ground sensing")}</div>
        </div>
        <div style="display:grid;gap:12px;align-content:start"><div class="night">${svg}</div><ul class="status" data-status></ul></div></div>`,
      foot: "Positions follow AOM 1.40.3. Beams are illustrative. The dashed ring marks the lower beacon on the underside of the fuselage."
    });
    function draw() {
      Object.keys(SW).forEach((k) => setSw(el, k, st[k], SW[k]));
      setSeg(el, "gear", st.gear); setSeg(el, "ag", st.ag);
      const gnd = st.ag === "GROUND";
      const vis = {};
      ["lo_l", "lo_r", "li_l", "li_r"].forEach((k) => (vis[k] = st[k] === "ON" ? (st.gear === "DOWN" ? "on" : "dim") : "off"));
      ["rt_l", "rt_r", "taxi"].forEach((k) => (vis[k] = st[k] === "ON" ? (gnd ? "on" : "inh") : "off"));
      vis.bcn_u = st.beacon === "BOTH" ? "on" : "off"; vis.bcn_l = st.beacon !== "OFF" ? "on" : "off";
      ["nav", "strobe", "wing", "logo"].forEach((k) => (vis[k] = st[k] === "ON" ? "on" : "off"));
      el.querySelectorAll("[data-l]").forEach((n) => {
        const v = vis[n.dataset.l];
        n.style.opacity = v === "on" ? 1 : v === "dim" ? 0.38 : 0;
        n.classList.toggle("fl-strobe", n.dataset.l === "strobe" && v === "on");
        n.classList.toggle("fl-beacon", n.dataset.l.startsWith("bcn") && v === "on");
      });
      const land = ["lo_l", "lo_r", "li_l", "li_r"].filter((k) => st[k] === "ON").length;
      const item = (name, chip, cls, why) => `<li><span>${name}</span><span class="chip ${cls}">${chip}</span>${why ? `<small>${why}</small>` : ""}</li>`;
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
    el.addEventListener("click", (e) => {
      const s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]"), sg = e.target.closest("[data-seg]");
      if (s) st[s.dataset.set] = s.dataset.v;
      else if (c) { const k = c.dataset.cycle, p = SW[k]; st[k] = p[(p.indexOf(st[k]) + 1) % p.length]; }
      else if (sg) st[sg.dataset.seg] = sg.dataset.v;
      else return;
      draw();
    });
    draw();
  };

  /* ════════ EMERGENCY LIGHTS ════════ */
  W.emerLights = function (el) {
    const st = { fd: "ARMED", cabin: false, pwr: "NORMAL" };
    const POS = ["OFF", "ARMED", "ON"];
    frame(el, "Emergency lights logic", {
      body: `<div class="wg-grid two"><div style="display:grid;gap:12px;align-content:start">
          <div class="pnl-row" style="justify-content:flex-start;gap:12px">
            <div class="pnl"><p class="pnl-t">Overhead</p>${sw("fd", "Emer lights", POS, { guard: true })}</div>
            <div class="pnl"><p class="pnl-t">Upper deck services module</p>${pb("cabin", "Emer<br>lights", "Emergency lights", "red")}</div>
          </div>
          <div class="conds">${seg("pwr", [["NORMAL", "Normal"], ["FAILED", "Failed / off"]], "Airplane electrical power")}</div>
          <p style="margin:0;font-size:var(--t-sm);color:var(--ink-2)">Try: ARMED, then fail the power. Then restore power and push the cabin switch.</p>
        </div>
        <div style="display:grid;gap:12px;align-content:start"><ul class="status" data-status></ul>
          <div class="disp" data-disp><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs></div></div></div></div>`,
      foot: "Logic from AOM 1.30.15–16, 1.40.5 and 1.60.2. With power failed the EICAS display is shown unpowered."
    });
    el.querySelector('[data-sw="fd"]').dataset.guardpos = "ARMED";
    function draw() {
      setSw(el, "fd", st.fd, POS); setPb(el, "cabin", st.cabin); setSeg(el, "pwr", st.pwr);
      const failed = st.pwr === "FAILED";
      const on = st.cabin || st.fd === "ON" || (st.fd === "ARMED" && failed);
      const why = st.cabin ? "Cabin switch pushed: bypasses the flight deck switch." : st.fd === "ON" ? "Flight deck switch ON." : st.fd === "ARMED" && failed ? "Armed and DC power failed or turned off." : st.fd === "OFF" && failed ? "Switch OFF prevents operation when power fails." : "Armed: waiting for a power failure.";
      const item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
      el.querySelector("[data-status]").innerHTML = [
        item("Emergency lights", on ? "On" : "Off", on ? "on" : st.fd === "OFF" && failed ? "warn" : "off", why),
        item("Interior: door, aisle, exit lights", on ? "On" : "Off", on ? "on" : "off"),
        item("Exterior: slide light, inertia reel zone", on ? "On" : "Off", on ? "on" : "off"),
        item("Door 1L threshold lights", on ? "On" : "Off", on ? "on" : "off"),
        item("Remote batteries", failed ? (on ? "Discharging" : "Not charging") : "Charging", failed ? (on ? "dim" : "off") : "on", failed ? (on ? "At least 15 minutes from a full charge." : "DC bus 4 not available to charge.") : "Charge maintained by DC bus 4.")
      ].join("");
      const disp = el.querySelector("[data-disp]");
      disp.classList.toggle("dead", failed);
      const adv = (st.fd === "ARMED" && on) || st.fd !== "ARMED";
      el.querySelector("[data-msgs]").innerHTML = eicasList(adv ? [["EMER LIGHTS", "A"]] : []);
    }
    el.addEventListener("click", (e) => {
      const s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]"), sg = e.target.closest("[data-seg]"), p = e.target.closest("[data-pb]");
      if (s) st.fd = s.dataset.v; else if (c) st.fd = POS[(POS.indexOf(st.fd) + 1) % 3];
      else if (sg) st.pwr = sg.dataset.v; else if (p) st.cabin = !st.cabin; else return;
      draw();
    });
    draw();
  };

  /* ════════ SIGNS, MAIN DECK ALERT, SUPERNUMERARY OXYGEN ════════ */
  W.cabinAlt = function (el) {
    const st = { belts: "AUTO", oxySw: "NORM", ag: "AIR", gear: "UP", flap: "UP", smoke: "NO", tail: "15", acAlt: 35000, cabAlt: 6500, oxyActive: false, masks: false };
    const SB = ["OFF", "AUTO", "ON"], OX = ["RESET", "NORM", "ON"];
    const timers = new Set();
    const T = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    let anim = null, alertUntil = 0, lightsUntil = 0, mdaUntil = 0, toneUntil = 0, crewUntil = 0, crewSteady = false, log = [];
    frame(el, "Signs, main deck alert and supernumerary oxygen", {
      tools: seg("tail", [["11", "JA11–14KZ"], ["15", "JA15–18KZ"]]),
      body: `<div class="wg-grid two"><div style="display:grid;gap:12px;align-content:start">
          <div class="pnl-row" style="justify-content:flex-start;gap:12px">
            <div class="pnl"><p class="pnl-t">Aft aisle stand</p><div class="pnl-row">${pb("mda", "ON", "Main deck alert", "amber")}${sw("belts", "Seatbelts", SB)}</div></div>
            <div class="pnl"><p class="pnl-t">Overhead</p>${sw("oxySw", "Suprnmry<br>oxy", OX, { guard: true })}</div>
          </div>
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
        </div></div>`,
      foot: "Logic from AOM 1.30.3, 1.30.16–17, 1.40.4, 1.40.13 and 1.45.1. Alerts last “several seconds”; shown here as 4 s. Masks stay presented after a reset until restowed."
    });
    el.querySelector('[data-sw="oxySw"]').dataset.guardpos = "NORM";
    const cab = el.querySelector("#ca-cab"), ac = el.querySelector("#ca-ac");
    const now = () => Date.now();
    function addLog(t) { log.unshift({ t, at: new Date() }); log = log.slice(0, 6); }
    function fsb() {
      if (st.oxyActive) return true;
      if (st.belts === "ON") return true;
      if (st.belts === "OFF") return false;
      return st.gear !== "UP" || st.flap !== "UP" || st.acAlt < 10300 || st.cabAlt > 10000;
    }
    function mainAlert(why) { alertUntil = now() + 4000; addLog(why + " → main deck lights flash, horns sound"); T(draw, 4050); }
    function deploy(why) {
      if (st.oxyActive) return;
      st.oxyActive = true; st.masks = true;
      addLog(why + " → supernumerary masks drop");
      if (st.tail === "15") { crewUntil = now() + 4000; crewSteady = false; addLog("JA15–18KZ: crew rest ceiling lights flash and a tone sounds"); T(draw, 4050); }
      else { lightsUntil = Math.max(lightsUntil, now() + 4000); crewSteady = true; addLog("JA11–14KZ: main deck ceiling lights flash, crew rest ceiling lights on"); T(draw, 4050); }
    }
    let lastFsb = null;
    function step(prev) {
      if (prev.cabAlt < 10000 && st.cabAlt >= 10000) mainAlert("Cabin altitude reached 10,000 ft");
      if (st.cabAlt >= 14000 && prev.cabAlt < 14000 && st.oxySw === "NORM") deploy("Cabin altitude reached ~14,000 ft");
      if (prev.smoke === "NO" && st.smoke === "YES") mainAlert("Smoke detected in main deck");
      const f = fsb();
      if (lastFsb !== null && f !== lastFsb) { toneUntil = now() + 1500; addLog(`FASTEN SEAT BELTS ${f ? "on" : "off"} → low tone over PA`); T(draw, 1550); }
      lastFsb = f;
    }
    function change(fn) { const prev = { ...st }; fn(); step(prev); draw(); }
    function draw() {
      const t = now();
      setSw(el, "belts", st.belts, SB); setSw(el, "oxySw", st.oxySw, OX);
      ["ag", "gear", "flap", "smoke", "tail"].forEach((k) => setSeg(el, k, st[k]));
      cab.value = st.cabAlt; ac.value = st.acAlt;
      el.querySelector("[data-cabv]").textContent = fmtAlt(st.cabAlt) + " ft";
      el.querySelector("[data-acv]").textContent = fmtAlt(st.acAlt) + " ft";
      const f = fsb(), r = f && !st.oxyActive;
      el.querySelector('[data-sign="fsb"]').classList.toggle("on", f);
      el.querySelector('[data-sign="rts"]').classList.toggle("on", r);
      const flashing = t < alertUntil || t < lightsUntil;
      el.querySelector("[data-deck]").classList.toggle("flash", flashing);
      el.querySelector("[data-horn]").classList.toggle("on", t < alertUntil);
      setPb(el, "mda", t < mdaUntil);
      el.querySelector("[data-pa]").textContent = t < toneUntil ? "PA: low tone ♪" : "PA: –";
      el.querySelector("[data-crew]").textContent = t < crewUntil ? "Crew rest: lights flashing, tone" : crewSteady && st.masks ? "Crew rest: ceiling lights on" : "Crew rest: –";
      const why = st.oxyActive ? "Oxygen deployed: on regardless of selector." : st.belts !== "AUTO" ? `Selector ${st.belts}.` :
        [st.gear !== "UP" && "gear not up and locked", st.flap !== "UP" && "flap lever not up", st.acAlt < 10300 && "airplane below 10,300 ft", st.cabAlt > 10000 && "cabin above 10,000 ft"].filter(Boolean).join(", ") || "No AUTO condition met.";
      const item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
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
    el.addEventListener("click", (e) => {
      const s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]"), sg = e.target.closest("[data-seg]"), p = e.target.closest("[data-pb]"), a = e.target.closest("[data-a]");
      if (s || c) {
        const k = (s || c).dataset.set || (s || c).dataset.cycle;
        if (k === "belts") change(() => { const v = s ? s.dataset.v : SB[(SB.indexOf(st.belts) + 1) % 3]; if (v === "ON" && st.belts !== "ON") { lightsUntil = now() + 4000; addLog("SEATBELTS selected ON → main deck ceiling lights flash (no horns)"); T(draw, 4050); } st.belts = v; });
        if (k === "oxySw") {
          const v = s ? s.dataset.v : "ON";
          if (v === "NORM") return;
          st.oxySw = v; draw();
          if (v === "ON") change(() => { mainAlert("SUPRNMRY OXY switch ON"); deploy("SUPRNMRY OXY switch ON"); });
          if (v === "RESET") change(() => { if (st.cabAlt < 12000) { if (st.oxyActive) addLog("RESET below 12,000 ft → flow control unit closed"); else addLog("RESET: system not active"); st.oxyActive = false; } else addLog("RESET has no effect at or above 12,000 ft cabin altitude"); });
          T(() => { st.oxySw = "NORM"; draw(); }, 650);
        }
      } else if (sg) change(() => { st[sg.dataset.seg] = sg.dataset.v; if (sg.dataset.seg === "ag" && sg.dataset.v === "GROUND") { st.acAlt = 0; } });
      else if (p) change(() => { mdaUntil = now() + 4000; mainAlert("MAIN DECK ALERT pushed"); T(draw, 4050); });
      else if (a) { if (a.dataset.a === "depress") animateTo(25000, 700); else animateTo(8000, 400); }
    });
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
    frame(el, "Crew oxygen mask and stowage box", {
      body: `<div class="wg-grid two"><div style="display:grid;gap:12px;align-content:start">
          <div class="pnl"><p class="pnl-t">Stowage box</p>
            <div class="oxbox" data-box><div class="oxdoor"><span class="flag" data-flag>OXY ON</span><div class="flow" data-flow title="Flow indicator"></div>${pb("reset", "Press<br>to test<br>&amp; reset", "Reset / test")}</div>
            <div class="oxdoor r"><span style="font-family:var(--f-display);font-size:.72rem;letter-spacing:.12em">OXYGEN MASK</span></div></div></div>
          <div class="pnl"><p class="pnl-t">Mask regulator</p><div class="pnl-row">${sw("mode", "N / 100%", ["N", "100"])}${sw("emer", "Emergency", ["NORM", "EMER"])}${pb("ptt", "Press<br>to test", "Press to test")}</div></div>
        </div>
        <div style="display:grid;gap:10px;align-content:start">
          <p class="lbl-sm">Actions</p>
          <div style="display:grid;gap:6px">
            <button class="btn" data-a="pull">Squeeze red levers and pull mask out</button>
            <button class="btn" data-a="release">Release levers (harness snugs onto head)</button>
            <button class="btn" data-a="inflate">Squeeze right lever (inflate harness)</button>
            <button class="btn" data-a="stow">Stow mask and close doors</button>
            <button class="btn" data-a="open">Open left door</button>
          </div>
          <ul class="status" data-status></ul>
          <p data-msg style="margin:0;font-size:var(--t-sm);color:var(--ink-2)" aria-live="polite"></p>
        </div></div>`,
      foot: "From AOM 1.30.18–20 and 1.40.7–11. Regulator positions are labelled N / 100 and NORM / EMER here for clarity."
    });
    function draw() {
      el.querySelector("[data-box]").classList.toggle("open", st.doors);
      el.querySelector("[data-flag]").classList.toggle("on", st.oxy);
      el.querySelector("[data-flow]").classList.toggle("on", st.flow);
      setSw(el, "mode", st.mode === "N" ? "N" : "100", ["N", "100"]); setSw(el, "emer", st.emer ? "EMER" : "NORM", ["NORM", "EMER"]);
      const deliv = !st.oxy ? ["None", "off", "Supply valve closed."] : st.emer ? ["100% positive pressure", "warn", "Protects against smoke and vapours; purges and defogs the mask. Depletes oxygen faster; communication may be difficult."] : st.mode === "100" ? ["100% on demand", "on", "No air mixed in."] : ["Diluted on demand", "on", "Air/oxygen mixture; ratio depends on cabin altitude."];
      const item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
      el.querySelector("[data-status]").innerHTML = [
        item("Mask", st.out ? (st.harness ? "Out · harness inflated" : "Out") : "Stowed", st.out ? "on" : "off"),
        item("Oxygen to mask", deliv[0], deliv[1], deliv[2]),
        item("Microphone", st.mic === "mask" ? "Mask mic" : "Boom mic", st.mic === "mask" ? "dim" : "off")
      ].join("");
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]"), p = e.target.closest("[data-pb]"), s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]");
      if (a) {
        const k = a.dataset.a;
        if (k === "pull") { if (st.out) st.msg = "The mask is already out."; else { Object.assign(st, { out: true, doors: true, oxy: true, mic: "mask", harness: true }); flowBlip(); st.msg = "Doors unlock, oxygen on, OXY ON in view, mask mic live. Yellow cross shows as the harness inflates."; } }
        if (k === "release") { if (!st.out) st.msg = "Pull the mask out first."; else { st.harness = false; st.msg = "Harness deflates onto the head and face."; } }
        if (k === "inflate") { if (!st.out) st.msg = "Pull the mask out first."; else { st.harness = true; flowBlip(); st.msg = "Right lever inflates the harness; flow indicator blips."; } }
        if (k === "stow") { if (!st.out) st.msg = "Already stowed."; else { Object.assign(st, { out: false, doors: false, harness: false, mode: "100", emer: false }); st.msg = "Stowed at 100% with EMERGENCY off. Oxygen is still on (flag in view) until you push RESET/TEST."; } }
        if (k === "open") { if (st.doors) st.msg = "The left door is already open."; else { Object.assign(st, { doors: true, oxy: true, mic: "mask" }); st.msg = "Opening the left door reactivates oxygen and the mask mic."; } }
      } else if (p) {
        if (p.dataset.pb === "reset") {
          if (st.doors) st.msg = "RESET/TEST works with the left door closed.";
          else if (st.oxy) { Object.assign(st, { oxy: false, mic: "boom" }); st.msg = "Oxygen off, flag stowed, mask mic off, boom mic on."; }
          else { flowBlip(1000); st.msg = "Regulator test: oxygen on momentarily (yellow cross)."; }
        } else { flowBlip(900); st.msg = "Tests the positive pressure supply to the regulator."; }
      } else if (s || c) {
        const k = (s || c).dataset.set || (s || c).dataset.cycle;
        if (k === "mode") st.mode = s ? (s.dataset.v === "N" ? "N" : "100") : st.mode === "N" ? "100" : "N";
        if (k === "emer") st.emer = s ? s.dataset.v === "EMER" : !st.emer;
        st.msg = st.emer ? "EMERGENCY: 100% under positive pressure. Use only as conditions require." : st.mode === "N" ? "N: air/oxygen mix on demand." : "100%: pure oxygen on demand.";
      } else return;
      draw();
    });
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
      ${lines}
      ${DOORS.map((d) => `<g class="door" data-door="${d.id}" role="button" tabindex="0" aria-label="${d.n}">${d.shape}</g>`).join("")}
    </svg>`;
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
      const both = open.has("mel") && open.has("cel");
      const list = [];
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
        const d = DOORS.find((x) => x.id === id);
        if (d.lv === "C") { mc = true; const b = el.querySelector("[data-beep]"); b.classList.add("on"); clearTimeout(beepT); beepT = setTimeout(() => b.classList.remove("on"), 1200); }
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
    frame(el, "Side cargo door", {
      tools: seg("view", [["ext", "Exterior panel"], ["int", "Interior panel"]]),
      body: `<div style="display:grid;gap:12px">
        <div class="conds">${seg("bus", [["ON", "Powered"], ["OFF", "Unpowered"]], "Main deck cargo handling bus")}${seg("ret", [["CLOSED", "Closed"], ["OPEN", "Open"]], "Interior latch lock handle retainer")}</div>
        <div class="wg-grid two"><div style="display:grid;gap:10px;align-content:start">
          <div class="pnl" data-panel="ext"><p class="pnl-t">Side cargo door · exterior</p>
            <div class="pnl-row">${lamp("up", "Door up", "green")}${lamp("lc", "Latched closed", "green")}${lamp("pw", "Power on", "green")}</div><div class="pnl-sep"></div>
            <div class="pnl-row">${holdSw("dc", "Door control", [["open", "Door up"], ["close", "Latched closed"]])}
              <div class="hold"><span class="hl">Latch lock handle</span><div class="hold-b"><button data-a="handle" class="hbtn"></button></div></div></div></div>
          <div class="pnl" data-panel="int" hidden><p class="pnl-t">Side door control · interior</p>
            <div class="pnl-row">${sw("ramp", "Ramp<br>lights", ["ON", "OFF"])}${lamp("pw2", "Power on", "green")}${lamp("lc2", "Latches closed", "green")}${lamp("up2", "Door up", "green")}</div><div class="pnl-sep"></div>
            <div class="pnl-row">${holdSw("dc", "Door control", [["open", "Open"], ["close", "Close"]])}
              <div class="hold"><span class="hl">Latch lock handle</span><div class="hold-b"><button data-a="handle" class="hbtn"></button></div></div></div></div>
          ${holdMode("sd-latch")}
        </div>
        <div style="display:grid;gap:10px;align-content:start">
          <div class="mech night" style="padding:8px"><svg viewBox="-86 -62 136 112" role="img" aria-label="Fuselage cross-section, side cargo door">
            <circle cx="0" cy="0" r="40" class="fx"/><line x1="-38" y1="12" x2="38" y2="12" class="fl"/>
            <g data-sdoor><path d="M-38.97,-9 A40,40 0 0 0 -38.16,12" class="dr"/></g>
            <circle cx="-38.97" cy="-9" r="1.6" class="hg"/><text x="-18" y="-48" text-anchor="middle" class="ml">LOOKING FORWARD · LEFT SIDE DOOR</text><text x="0" y="20" text-anchor="middle" class="ml">MAIN DECK</text></svg>
            <div class="prog" style="margin:4px 8px 8px"><i data-prog></i></div></div>
          <ul class="status" data-status></ul>
          <div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs style="min-height:2em"></div></div>
          <p data-msg style="margin:0;font-size:var(--t-sm);color:var(--ink-2)" aria-live="polite"></p>
        </div></div></div>`,
      foot: "Sequence from AOM 1.50.7; controls from 1.30.29–32. Door travel time is compressed."
    });
    const latch = () => el.querySelector("#sd-latch").checked;
    const H = bindHolds(el, held, latch, () => {});
    el.querySelector("#sd-latch").addEventListener("change", () => H.release());
    const powered = () => st.bus === "ON";
    const ctlLive = () => powered() && st.handle;
    const tick = setInterval(() => {
      let moved = false;
      if (held.dc && !ctlLive()) { st.msg = !powered() ? "No power: POWER ON is out." : "Extend the latch lock handle to power the door control switch."; }
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
      setSw(el, "ramp", st.ramp, ["ON", "OFF"]);
      const pw = powered(), lc = st.handle && st.p === 0 && st.latched, up = st.p >= 100;
      ["pw", "pw2"].forEach((r) => setLamp(el, r, pw));
      ["lc", "lc2"].forEach((r) => setLamp(el, r, lc && pw));
      ["up", "up2"].forEach((r) => setLamp(el, r, up && pw));
      el.querySelectorAll(".hbtn").forEach((b) => { b.textContent = st.handle ? "Extended · stow" : st.view === "ext" ? "Press release, pull down" : "Pull to extend"; b.classList.toggle("held", st.handle); });
      el.querySelector("[data-sdoor]").setAttribute("transform", `rotate(${(st.p / 100) * 120} -38.97 -9)`);
      el.querySelector("[data-prog]").style.width = st.p + "%";
      const locked = st.p === 0 && st.latched && !st.handle;
      const item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
      el.querySelector("[data-status]").innerHTML = [
        item("Door", st.p === 0 ? "Closed" : up ? "Full open" : "Moving / partly open", st.p === 0 ? "off" : up ? "on" : "dim"),
        item("Latches", st.latched ? "Engaged" : "Disengaged", st.latched ? "on" : "dim"),
        item("Latch lock handle", st.handle ? "Extended" : "Stowed (locked)", st.handle ? "dim" : "on"),
        item("Ramp lights", st.ramp === "ON" ? "On" : "Off", st.ramp === "ON" ? "on" : "off", "Lights in the upper part of the door.")
      ].join("");
      el.querySelector("[data-msgs]").innerHTML = eicasList(locked ? [] : [["DOOR SIDE CARGO", "C"]]);
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), a = e.target.closest("[data-a]"), s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]");
      if (sg) {
        if (sg.dataset.seg === "ret" && sg.dataset.v === "CLOSED" && st.handle) st.msg = "Stow the latch lock handle before closing the retainer.";
        else { st[sg.dataset.seg] = sg.dataset.v; if (sg.dataset.seg === "view") H.release(); }
      }
      else if (a && a.dataset.a === "handle") {
        if (st.handle) { if (st.p === 0 && st.latched) { st.handle = false; H.release(); st.msg = "Handle stowed: door locked. DOOR SIDE CARGO clears."; } else st.msg = "Close and latch the door before stowing the handle."; }
        else if (st.ret !== "OPEN") st.msg = "The interior retainer must be open to operate the door from either side.";
        else { st.handle = true; st.msg = st.view === "ext" ? "Upper release pressed (frees both handles), handle pulled down. Door control powered." + (powered() ? " LATCHED CLOSED lit." : "") : "Handle extended. Door control powered." + (powered() ? " LATCHES CLOSED lit." : ""); }
      } else if (s || c) st.ramp = s ? s.dataset.v : st.ramp === "ON" ? "OFF" : "ON";
      else return;
      draw();
    });
    draw();
    return () => clearInterval(tick);
  };

  /* ════════ NOSE CARGO DOOR ════════ */
  W.noseDoor = function (el) {
    const LAT = ["1L", "2L", "3L", "4L", "5L", "6L", "7L", "8L", "1R", "2R", "3R", "4R", "5R", "6R", "7R", "8R"];
    const st = { bus: "ON", p: 0, lat: Object.fromEntries(LAT.map((k) => [k, true])), lockout: true, lamp: false, sel: "1L", tClosed: false, tOpen: false, tLamp: false, cTest: false,
      lights: { th: "OFF", sw: "OFF", ce: "OFF", sp: "OFF" }, msg: "Door closed and latched, lock-out engaged. Hold SYSTEM POWER ON to begin." };
    const held = { sys: null, dc: null };
    frame(el, "Nose cargo door", {
      tools: seg("bus", [["ON", "Bus powered"], ["OFF", "Bus unpowered"]]),
      body: `<div style="display:grid;gap:14px">
        <div class="wg-grid two"><div style="display:grid;gap:10px;align-content:start">
          <div class="pnl"><p class="pnl-t">Nose cargo door controls</p>
            <div class="pnl-row">${lamp("pw", "Power on", "white")}${lamp("lo", "Lock-out engaged", "green")}${lamp("lc", "Latches closed", "green")}${lamp("up", "Door up", "blue")}</div><div class="pnl-sep"></div>
            <div class="pnl-row">${holdSw("sys", "System power", [["lock", "Off / lock test"], ["on", "On"]])}${pb("lamp", "Lamp<br>test", "Lamp test")}${holdSw("dc", "Door control", [["close", "Close"], ["open", "Open"]])}</div>
            <div class="pnl-sep"></div><p class="pnl-t" style="margin-bottom:8px">Light controls</p>
            <div class="pnl-row">${sw("th", "Threshold", ["OFF", "ON"])}${sw("sw", "Sidewall", ["OFF", "ON"])}${sw("ce", "Ceiling", ["OFF", "ON"])}${sw("sp", "Nose spot", ["OFF", "ON"])}</div></div>
          ${holdMode("nd-latch")}
        </div>
        <div style="display:grid;gap:10px;align-content:start">
          <div class="mech night" style="padding:8px"><svg viewBox="-4 -6 46 26" role="img" aria-label="Nose section side view, nose cargo door">
            <line x1="-4" y1="17.5" x2="42" y2="17.5" class="gl2"/>
            <path d="M8,1.6 L40,1.6 L40,15.2 L8,15.2 Z" class="fx2"/>
            <path d="M4.6,2.4 C6,1.8 7,1.6 8,1.6 L22,1.6" class="fx2"/>
            <path d="M3.3,3.2 L6.4,2.6 L6.4,2.1 L3.8,2.6 Z" class="win2"/>
            <g data-ndoor><path d="M8,4.8 C4.5,4.8 0.4,7.6 0,10.4 C0.4,13.2 4,15.2 8,15.2 Z" class="dr2"/></g>
            <circle cx="8" cy="4.8" r=".5" class="hg"/>
            <path d="M8,15.2 V17" class="fx2"/><circle cx="9.5" cy="16.9" r=".6" class="hg"/>
            <text x="22" y="-2" text-anchor="middle" class="ml2">NOSE DOOR HINGES UP, ABOVE THE MAIN DECK</text></svg>
            <div class="prog" style="margin:4px 8px 8px"><i data-prog></i></div></div>
          <ul class="status" data-status></ul>
          <div class="disp"><div class="disp-t"><span>UPPER EICAS</span><span>ALERTS</span></div><div class="msgs" data-msgs style="min-height:2em"></div></div>
          <p data-msg style="margin:0;font-size:var(--t-sm);color:var(--ink-2)" aria-live="polite"></p>
        </div></div>
        <div class="wg-grid two">
          <div class="annun"><p class="pnl-t">Latch annunciator · rear view · works unpowered</p>
            <div class="lgrid" data-lgrid></div>
            <div class="cl"><button data-a="ctest" aria-label="Door closed annunciator left, push to test"><span data-cl="L1">CLOSED</span><span data-cl="L2">NOT CLOSED</span><em>LEFT</em></button>
              <button data-a="ctest" aria-label="Door closed annunciator right, push to test"><span data-cl="R1">CLOSED</span><span data-cl="R2">NOT CLOSED</span><em>RIGHT</em></button></div></div>
          <div class="pnl"><p class="pnl-t">Latch actuator test</p><div class="lsel" data-lsel>${LAT.map((k) => `<button data-lat="${k}" aria-pressed="false">${k}</button>`).join("")}</div>
            <div class="pnl-row" style="margin-top:12px">${lamp("tc", "Latch closed", "green")}${pb("tclosed", "Test", "Closed test")}${pb("topen", "Test", "Open test")}${lamp("to", "Latch open", "green")}${pb("tlamp", "Lamp<br>test", "Lamp test")}</div></div>
        </div></div>`,
      foot: "Logic from AOM 1.30.33–38 and 1.50.7–8. Modelled with the control system staying powered after SYSTEM POWER ON is released until OFF/LOCK TEST is selected, which is why the doors message stays until lock-out is engaged. Travel time compressed."
    });
    const latch = () => el.querySelector("#nd-latch").checked;
    const H = bindHolds(el, held, latch, () => onHold());
    el.querySelector("#nd-latch").addEventListener("change", () => H.release());
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
    const tick = setInterval(() => {
      let moved = false;
      const drive = bus() && held.sys === "on" && !st.lockout;
      if (held.dc && !drive) st.msg = !bus() ? "No cargo handling bus power. (A mechanical system operates the door without electrical power.)" : "Hold SYSTEM POWER ON together with DOOR CONTROL.";
      if (drive && held.dc === "open") {
        if (anyLatched()) { const k = LAT.find((x) => st.lat[x]); st.lat[k] = false; moved = true; st.msg = "Latches opening…"; }
        else if (st.p < 100) { st.p = Math.min(100, st.p + 1.2); moved = true; st.msg = "Opening. Release either switch to stop."; }
        else st.msg = "Full up: DOOR UP (blue) lit.";
      } else if (drive && held.dc === "close") {
        if (st.p > 0) { st.p = Math.max(0, st.p - 1.2); moved = true; st.msg = "Closing. Release either switch to stop."; }
        else if (!allLatched()) { const k = LAT.slice().reverse().find((x) => !st.lat[x]); st.lat[k] = true; moved = true; st.msg = allLatched() ? "All latch pins latched: LATCHES CLOSED lit. Now select OFF/LOCK TEST." : "Latches closing…"; }
      }
      if (moved) draw();
    }, 55);
    function draw() {
      setSeg(el, "bus", st.bus);
      const ctl = bus() && !st.lockout;
      const lampT = st.lamp && ctl;
      setLamp(el, "pw", ctl || lampT);
      setLamp(el, "lo", (bus() && held.sys === "lock") || lampT);
      setLamp(el, "lc", (ctl && st.p === 0 && allLatched()) || lampT);
      setLamp(el, "up", (ctl && st.p >= 100) || lampT);
      setPb(el, "lamp", st.lamp);
      ["th", "sw", "ce", "sp"].forEach((k) => setSw(el, k, st.lights[k], ["OFF", "ON"]));
      el.querySelector("[data-ndoor]").setAttribute("transform", `rotate(${(st.p / 100) * 62} 8 4.8)`);
      el.querySelector("[data-prog]").style.width = st.p + "%";
      const order = [["7L", "8L", "", "", "", "", "8R", "7R"], ["6L", "", "", "", "", "", "", "6R"], ["5L", "", "", "", "", "", "", "5R"], ["4L", "3L", "2L", "1L", "1R", "2R", "3R", "4R"]];
      el.querySelector("[data-lgrid]").innerHTML = order.map((row) => row.map((k) => k ? `<div class="lat"><i class="${st.lat[k] ? "g" : ""}">LATCHED</i><i class="${st.lat[k] ? "" : "a"}">NOT LCHD</i><b>${k}</b></div>` : "<div></div>").join("")).join("");
      const closed = st.p === 0;
      ["L", "R"].forEach((s) => { el.querySelector(`[data-cl="${s}1"]`).className = closed || st.cTest ? "g" : ""; el.querySelector(`[data-cl="${s}2"]`).className = !closed || st.cTest ? "a" : ""; });
      el.querySelectorAll("[data-lat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lat === st.sel)));
      setLamp(el, "tc", bus() && ((st.tClosed && st.lat[st.sel]) || st.tLamp));
      setLamp(el, "to", bus() && ((st.tOpen && !st.lat[st.sel]) || st.tLamp));
      const L = st.lights, item = (n, c, cls, w) => `<li><span>${n}</span><span class="chip ${cls}">${c}</span>${w ? `<small>${w}</small>` : ""}</li>`;
      const nLat = LAT.filter((k) => st.lat[k]).length;
      el.querySelector("[data-status]").innerHTML = [
        item("Door", closed ? "Closed" : st.p >= 100 ? "Full up" : "Partly open", closed ? "off" : st.p >= 100 ? "on" : "dim"),
        item("Latches", `${nLat}/16 latched`, nLat === 16 ? "on" : nLat ? "dim" : "off"),
        item("Electrical lock-out", st.lockout ? "Engaged" : "Released", st.lockout ? "on" : "dim", st.lockout ? "" : "Control system powered. Select OFF/LOCK TEST when done."),
        item("Threshold (ramp) lights", L.th === "ON" ? (st.p >= 100 ? "On" : "Stowed") : "Off", L.th === "ON" ? (st.p >= 100 ? "on" : "inh") : "off", L.th === "ON" && st.p < 100 ? "Only illuminate with the door full open." : ""),
        item("Nose spot light", L.sp === "ON" ? (closed ? "On" : "Not useful") : "Off", L.sp === "ON" ? (closed ? "on" : "inh") : "off", L.sp === "ON" ? (closed ? "Lights the forward main deck; use with the mirror to check end locks." : "Lights the forward main deck with the door closed.") : ""),
        item("Main deck sidewall / ceiling", `${L.sw === "ON" ? "Sidewall" : ""}${L.sw === "ON" && L.ce === "ON" ? " + " : ""}${L.ce === "ON" ? "Ceiling" : ""}` || "Off", L.sw === "ON" || L.ce === "ON" ? "on" : "off")
      ].join("");
      const secure = closed && allLatched() && st.lockout;
      el.querySelector("[data-msgs]").innerHTML = eicasList(secure ? [] : [["DOOR NOSE CARGO", "C"]]);
      el.querySelector("[data-msg]").textContent = st.msg;
    }
    const press = (key, ms, fn) => { st[key] = true; draw(); setTimeout(() => { st[key] = false; draw(); }, ms); if (fn) fn(); };
    el.addEventListener("click", (e) => {
      const sg = e.target.closest("[data-seg]"), p = e.target.closest("[data-pb]"), s = e.target.closest("[data-set]"), c = e.target.closest("[data-cycle]"), lt = e.target.closest("[data-lat]"), a = e.target.closest("[data-a]");
      if (sg) { st.bus = sg.dataset.v; if (!bus()) st.msg = "Bus unpowered: control panel dark. Annunciator panels still show closed and latched state."; }
      else if (p) {
        const k = p.dataset.pb;
        if (k === "lamp") { if (bus() && !st.lockout) { press("lamp", 1500); st.msg = "Lamp test: all four lights."; } else st.msg = "Lamp test is available with SYSTEM POWER ON."; }
        if (k === "tclosed") press("tClosed", 1500);
        if (k === "topen") press("tOpen", 1500);
        if (k === "tlamp") press("tLamp", 1500);
      } else if (s || c) { const k = (s || c).dataset.set || (s || c).dataset.cycle; st.lights[k] = s ? s.dataset.v : st.lights[k] === "ON" ? "OFF" : "ON"; }
      else if (lt) st.sel = lt.dataset.lat;
      else if (a && a.dataset.a === "ctest") press("cTest", 1200);
      else return;
      draw();
    });
    draw();
    return () => clearInterval(tick);
  };
})();
