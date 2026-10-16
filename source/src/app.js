/* 747-8F Tech Guide — app shell: routing, chapter rendering, search, quiz, progress, theme. */
(function () {
  "use strict";
  const B = window.B748;
  const W = B.W || {};
  const app = document.getElementById("app");

  /* ── storage (never required for the page to work) ── */
  const mem = {};
  const S = {
    get(k, d) { try { const v = localStorage.getItem("b748." + k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem("b748." + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ── helpers ── */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (s) => String(s)
    .replace(/\[\[(.+?)\]\]/g, '<span class="nm">$1</span>')
    .replace(/\{\{(.+?)\}\}/g, '<span class="ei">$1</span>');
  const strip = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/\[\[|\]\]|\{\{|\}\}/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  const pad2 = (n) => String(n).padStart(2, "0");
  const ICON = {
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    quiz: '<svg viewBox="0 0 24 24"><path d="M9.2 9a3 3 0 1 1 4.2 2.8c-.9.4-1.4 1.1-1.4 2v.7"/><circle cx="12" cy="18" r=".6" fill="currentColor"/><rect x="3.5" y="3.5" width="17" height="17" rx="3"/></svg>'
  };

  let cleanups = [];
  function unmount() { cleanups.forEach((f) => { try { f(); } catch (e) {} }); cleanups = []; }

  /* ── theme ── */
  const THEMES = ["system", "light", "dark"];
  function applyTheme(t) {
    const r = document.documentElement;
    if (t === "light" || t === "dark") r.setAttribute("data-theme", t); else r.removeAttribute("data-theme");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#16212b");
  }
  applyTheme(S.get("theme", "system"));

  /* ── progress ── */
  const reviewed = () => S.get("reviewed", {});
  function isReviewed(ch, sec) { const r = reviewed(); return !!(r["c" + ch] && r["c" + ch][sec]); }
  function setReviewed(ch, sec, v) { const r = reviewed(); r["c" + ch] = r["c" + ch] || {}; if (v) r["c" + ch][sec] = 1; else delete r["c" + ch][sec]; S.set("reviewed", r); }
  const qstats = () => S.get("q", {});
  function chapterStats(ch) {
    const c = B.chapters[ch]; if (!c) return null;
    const r = reviewed()["c" + ch] || {};
    const qs = qstats();
    let seen = 0, right = 0, missed = 0;
    c.quiz.forEach((q) => { const s = qs[q.id]; if (s) { seen++; if (s.last) right++; else missed++; } });
    return { secs: c.sections.length, done: c.sections.filter((s) => r[s.id]).length, q: c.quiz.length, seen, right, missed };
  }

  /* ── routing ── */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ""));
    let m;
    if ((m = h.match(/^quiz-c(\d+)$/))) return { v: "quiz", ch: +m[1] };
    if ((m = h.match(/^c(\d+)(?:-([\w]+))?$/))) return { v: "sec", ch: +m[1], sec: m[2] };
    return { v: "home" };
  }
  function go(h) { if (location.hash === "#" + h) render(); else location.hash = h; }

  /* ── chrome bar ── */
  function bar(r) {
    const t = S.get("theme", "system");
    const ti = t === "light" ? ICON.sun : t === "dark" ? ICON.moon : ICON.auto;
    const tl = t === "light" ? "Light" : t === "dark" ? "Dark" : "Auto";
    let crumb = "";
    if (r.v !== "home" && B.chapters[r.ch]) crumb = `<span class="crumb"><b>Ch ${r.ch}</b> · ${esc(B.chapters[r.ch].short)}${r.v === "quiz" ? " · Quiz" : ""}</span>`;
    return `<header class="bar">
      ${r.v === "sec" ? `<button class="ib only-narrow" data-act="drawer" aria-label="Sections">${ICON.menu}</button>` : ""}
      <a class="brand" href="#" aria-label="Home"><b>747-8F</b><span>Tech Guide</span></a>
      ${crumb}
      <span class="grow"></span>
      <button class="ib" data-act="search" aria-label="Search">${ICON.search}<span class="lbl">Search</span></button>
      ${r.v === "sec" ? `<a class="ib" href="#quiz-c${r.ch}" aria-label="Quiz">${ICON.quiz}<span class="lbl">Quiz</span></a>` : ""}
      <button class="ib" data-act="theme" aria-label="Theme: ${tl}" title="Theme: ${tl}">${ti}</button>
    </header>`;
  }

  /* ── home ── */
  function viewHome() {
    let secs = 0, done = 0, seen = 0, right = 0, missed = 0;
    Object.keys(B.chapters).forEach((n) => { const s = chapterStats(+n); secs += s.secs; done += s.done; seen += s.seen; right += s.right; missed += s.missed; });
    const loaded = Object.keys(B.chapters).length;
    const last = S.get("last", null);
    const lastSec = last && B.chapters[last.ch] && B.chapters[last.ch].sections.find((s) => s.id === last.sec);
    const cards = B.library.map((c) => {
      const ch = B.chapters[c.num];
      if (!ch) return `<div class="chap locked"><span class="n">${pad2(c.num)}</span><span class="t">${esc(c.title)}</span><span class="s">Waiting for source chapter</span></div>`;
      const s = chapterStats(c.num);
      return `<a class="chap" href="#c${c.num}"><span class="n">${pad2(c.num)}</span><span class="t">${esc(ch.title)}</span>
        <span class="s">${s.secs} sections · ${s.q} questions · ${s.done}/${s.secs} reviewed</span>
        <span class="meter"><i style="width:${Math.round((s.done / s.secs) * 100)}%"></i></span></a>`;
    }).join("");
    return `<main><section class="home-hero">
        <div><div class="eyebrow">Boeing 747-8 Freighter</div>
        <h1>Systems,<br><em>in depth.</em></h1>
        <p>A study guide built from your AOM, one chapter at a time. Interactive panels, the freighter-specific detail, and a question bank that brings back what you miss.</p></div>
        <div class="stats">
          <div class="stat"><b>${done}/${secs}</b><span>Sections reviewed</span></div>
          <div class="stat"><b>${seen ? Math.round((right / seen) * 100) + "%" : "–"}</b><span>Quiz accuracy, last attempt</span></div>
          <div class="stat"><b>${missed}</b><span>Questions to revisit</span></div>
        </div>
      </section>
      <div class="home-actions">
        ${lastSec ? `<a class="btn primary" href="#c${last.ch}-${last.sec}">Continue · ${esc(lastSec.title)}</a>` : `<a class="btn primary" href="#c1">Start Chapter 1</a>`}
        ${missed ? `<button class="btn" data-act="quiz-missed">Revisit ${missed} missed question${missed > 1 ? "s" : ""}</button>` : `<a class="btn" href="#quiz-c1">Take the Chapter 1 quiz</a>`}
      </div>
      <div class="grid-h"><h2>Chapters</h2><span>${loaded} of ${B.library.length} loaded</span></div>
      <div class="chapters">${cards}</div>
      <p class="disclaimer">Personal study aid, not approved data. The AOM and company procedures govern. Chapter 1 source: ${esc(B.chapters[1] ? B.chapters[1].source : "")}.</p>
    </main>`;
  }

  /* ── section rail ── */
  function rail(ch, cur) {
    const c = B.chapters[ch];
    const s = chapterStats(ch);
    const items = c.sections.map((x) => `<li><a href="#c${ch}-${x.id}" ${x.id === cur ? 'aria-current="page"' : ""}>
      <span class="nav-t">${esc(x.title)}</span><span class="tick ${isReviewed(ch, x.id) ? "done" : ""}" aria-label="${isReviewed(ch, x.id) ? "Reviewed" : "Not reviewed"}"></span>
      <span class="nav-r">${esc(x.ref)}</span></a></li>`).join("");
    return `<nav class="rail" aria-label="Sections"><h2>Chapter ${ch}</h2><div class="chap-t">${esc(c.title)}</div>
      <ul class="nav">${items}</ul>
      <a class="quiz-link" href="#quiz-c${ch}"><span>Chapter quiz</span><small>${s.seen}/${s.q} seen${s.missed ? " · " + s.missed + " to revisit" : ""}</small></a></nav>`;
  }

  /* ── blocks ── */
  function block(b, ctx) {
    switch (b.t) {
      case "p": return `<p>${fmt(b.html)}</p>`;
      case "h": return `<h3>${esc(b.text)}</h3>`;
      case "ul": return `<ul>${b.items.map((i) => `<li>${fmt(i)}</li>`).join("")}</ul>`;
      case "steps": return `<ol class="steps">${b.items.map((i) => `<li><span>${fmt(i)}</span></li>`).join("")}</ol>`;
      case "facts": return `<div class="facts">${b.items.map((f) => `<div class="fact"><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join("")}</div>`;
      case "note": {
        const lab = { warning: "WARNING", caution: "CAUTION", note: "NOTE", fr: "FREIGHTER", eff: "EFFECTIVITY" }[b.k] || "NOTE";
        return `<div class="note ${b.k}"><span class="tag">${lab}</span><div class="txt">${fmt(b.html)}</div></div>`;
      }
      case "ctrl": {
        const single = b.pos.length === 1 && !b.pos[0][0];
        return `<div class="ctrl"><div class="ctrl-h"><span class="ctrl-n">${esc(b.name)}</span><span class="ctrl-w">${esc(b.where)}${b.ref ? ` · <span class="mono">${esc(b.ref)}</span>` : ""}</span></div>
          <dl class="pos ${single ? "single" : ""}">${b.pos.map((p) => (p[0] ? `<dt><span class="key">${esc(p[0])}</span></dt>` : "") + `<dd>${fmt(p[1])}</dd>`).join("")}</dl></div>`;
      }
      case "table": return `<div class="tbl-wrap"><table class="${b.cls || ""}"><thead><tr>${b.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((x) => `<td>${fmt(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "eicas": {
        const L = { Caution: "C", Advisory: "A", Warning: "W", Memo: "M" };
        const rows = b.rows.map((r) => `<div class="eicas-row" data-msg="${esc((r[0] + " " + r[1] + " " + r[3]).toLowerCase())}"><div class="eicas-m ${L[r[1]]}">${esc(r[0])}</div>
          <div class="eicas-l"><span class="lv">${esc(r[1])}${r[2] ? " · " + esc(r[2]) : ""}</span>${esc(r[3])}</div></div>`).join("");
        return `<div class="eicas"><div class="eicas-h"><span>EICAS MESSAGES</span>${b.filter ? `<input type="search" id="eicas-filter" placeholder="Filter" aria-label="Filter messages">` : ""}</div>${rows}</div>`;
      }
      case "widget": return `<figure class="wg" data-widget="${b.id}"></figure>`;
      default: return "";
    }
  }

  function viewSection(r) {
    const c = B.chapters[r.ch];
    const i = Math.max(0, c.sections.findIndex((s) => s.id === r.sec));
    const s = c.sections[i];
    S.set("last", { ch: r.ch, sec: s.id });
    const prev = c.sections[i - 1], next = c.sections[i + 1];
    const done = isReviewed(r.ch, s.id);
    return `<div class="shell has-rail">${rail(r.ch, s.id)}<main><article class="col">
      <header class="sec-head"><div class="ref">AOM ${esc(s.ref)} · Chapter ${r.ch}</div><h1>${esc(s.title)}</h1><p>${esc(s.summary)}</p></header>
      <div class="body">${s.blocks.map((b) => block(b, { ch: r.ch })).join("")}</div>
      <footer class="sec-foot">
        <div class="reviewed"><p>${done ? "Marked as reviewed." : "Finished this section?"}</p>
          <button class="btn ${done ? "" : "primary"}" data-act="review" data-sec="${s.id}">${done ? "Mark as not reviewed" : "Mark as reviewed"}</button></div>
        <div class="pn">${prev ? `<a class="prev" href="#c${r.ch}-${prev.id}"><small>Previous</small><b>${esc(prev.title)}</b></a>` : ""}
          ${next ? `<a class="next" href="#c${r.ch}-${next.id}"><small>Next</small><b>${esc(next.title)}</b></a>` : `<a class="next" href="#quiz-c${r.ch}"><small>Next</small><b>Chapter quiz</b></a>`}</div>
      </footer></article></main></div>`;
  }

  function mountWidgets(ch) {
    document.querySelectorAll("[data-widget]").forEach((el) => {
      const id = el.getAttribute("data-widget");
      const fn = W[id];
      if (!fn) { el.innerHTML = `<div class="wg-body">Interactive panel “${esc(id)}” is not available.</div>`; return; }
      try { const c = fn(el, { ch, go }); if (typeof c === "function") cleanups.push(c); }
      catch (e) { console.error(e); el.innerHTML = `<div class="wg-body">This interactive panel failed to load.</div>`; }
    });
    const f = document.getElementById("eicas-filter");
    if (f) f.addEventListener("input", () => {
      const q = f.value.trim().toLowerCase();
      f.closest(".eicas").querySelectorAll(".eicas-row").forEach((row) => { row.hidden = q && !row.dataset.msg.includes(q); });
    });
  }

  /* ── search ── */
  let index = null;
  function buildIndex() {
    index = [];
    Object.values(B.chapters).forEach((c) => c.sections.forEach((s) => {
      const parts = [s.title, s.summary];
      s.blocks.forEach((b) => {
        if (b.html) parts.push(b.html);
        if (b.text) parts.push(b.text);
        if (b.items) b.items.forEach((x) => parts.push(Array.isArray(x) ? x.join(" ") : x));
        if (b.name) parts.push(b.name, b.where || "");
        if (b.pos) b.pos.forEach((p) => parts.push(p[0] + " " + p[1]));
        if (b.rows) b.rows.forEach((r) => parts.push(r.join(" ")));
        if (b.head) parts.push(b.head.join(" "));
      });
      index.push({ ch: c.num, sec: s.id, title: s.title, ref: s.ref, text: strip(parts.join(" · ")) });
    }));
  }
  let pendingHit = null;
  function openSearch() {
    if (!index) buildIndex();
    const bg = document.createElement("div");
    bg.className = "search-bg";
    bg.innerHTML = `<div class="search" role="dialog" aria-label="Search"><div class="search-in">${ICON.search}
      <input id="q-input" type="search" placeholder="Search switches, lights, messages…" autocomplete="off" aria-label="Search"><button data-x>Close</button></div>
      <div class="results" id="q-res"><div class="res-empty">Try “lock-out”, “14,000”, “taxi”, “EMER LIGHTS”.</div></div></div>`;
    document.body.appendChild(bg);
    const inp = bg.querySelector("input"), res = bg.querySelector("#q-res");
    const close = () => { bg.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest("[data-x]")) close(); });
    inp.addEventListener("input", () => {
      const q = inp.value.trim();
      if (q.length < 2) { res.innerHTML = `<div class="res-empty">Type at least two characters.</div>`; return; }
      const ql = q.toLowerCase();
      const words = ql.split(/\s+/).filter(Boolean);
      const hits = index.map((e) => {
        const tl = e.text.toLowerCase();
        if (!words.every((w) => tl.includes(w))) return null;
        let n = 0, p = -1; while ((p = tl.indexOf(words[0], p + 1)) !== -1) n++;
        if (e.title.toLowerCase().includes(ql)) n += 10;
        return { e, n, at: tl.indexOf(words[0]) };
      }).filter(Boolean).sort((a, b) => b.n - a.n);
      if (!hits.length) { res.innerHTML = `<div class="res-empty">No matches for “${esc(q)}”.</div>`; return; }
      res.innerHTML = hits.slice(0, 30).map(({ e, at }) => {
        const st = Math.max(0, at - 60);
        let snip = (st > 0 ? "…" : "") + e.text.slice(st, at + 110) + "…";
        snip = esc(snip).replace(new RegExp("(" + words[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
        return `<a class="res" href="#c${e.ch}-${e.sec}" data-q="${esc(words[0])}"><small>Ch ${e.ch} · ${esc(e.ref)}</small><b>${esc(e.title)}</b><span>${snip}</span></a>`;
      }).join("");
    });
    res.addEventListener("click", (e) => { const a = e.target.closest("a.res"); if (a) { pendingHit = a.dataset.q; close(); if (a.getAttribute("href") === location.hash) { e.preventDefault(); render(); } } });
    setTimeout(() => inp.focus(), 30);
  }
  function highlight(q) {
    const root = document.querySelector("main .body"); if (!root || !q) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement.closest("[data-widget],script,style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let node, first = null, count = 0;
    const ql = q.toLowerCase();
    const targets = [];
    while ((node = walker.nextNode())) if (node.nodeValue.toLowerCase().includes(ql)) targets.push(node);
    targets.forEach((n) => {
      if (count > 40) return;
      const i = n.nodeValue.toLowerCase().indexOf(ql);
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + q.length);
      const m = document.createElement("mark"); m.className = "hit"; r.surroundContents(m); count++;
      if (!first) first = m;
    });
    if (first) setTimeout(() => first.scrollIntoView({ block: "center" }), 60);
  }

  /* ── quiz ── */
  let QZ = null;
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function startQuiz(ch, mode, sec) {
    const c = B.chapters[ch]; const qs = qstats();
    let pool = c.quiz.slice();
    if (mode === "missed") pool = pool.filter((q) => qs[q.id] && !qs[q.id].last);
    if (mode === "sec") pool = pool.filter((q) => q.sec === sec);
    if (mode === "quick") {
      const w = (q) => { const s = qs[q.id]; return !s ? 2 : !s.last ? 3 : 1; };
      pool = shuffle(pool).sort((a, b) => w(b) - w(a)).slice(0, 10);
    }
    pool = shuffle(pool);
    QZ = { ch, mode, list: pool.map((q) => ({ q, order: shuffle(q.o.map((_, i) => i)) })), i: 0, picked: null, results: [] };
  }
  function viewQuiz(r) {
    const c = B.chapters[r.ch];
    if (!QZ || QZ.ch !== r.ch) return quizSetup(r.ch);
    if (QZ.i >= QZ.list.length) return quizResults();
    const it = QZ.list[QZ.i], q = it.q;
    const sec = c.sections.find((s) => s.id === q.sec);
    const answered = QZ.picked != null;
    const opts = it.order.map((oi, k) => {
      let cls = "";
      if (answered) { if (oi === q.a) cls = "right"; else if (oi === QZ.picked) cls = "wrong"; }
      return `<button class="opt ${cls}" data-act="answer" data-o="${oi}" ${answered ? "disabled" : ""}><span class="l">${"ABCD"[k]}</span><span>${esc(q.o[oi])}</span></button>`;
    }).join("");
    const ok = QZ.picked === q.a;
    return `<main><div class="qz">
      <div class="qz-top"><span class="mono">${QZ.i + 1} / ${QZ.list.length}</span><div class="prog"><i style="width:${(QZ.i / QZ.list.length) * 100}%"></i></div>
      <button class="btn" data-act="quiz-quit">End</button></div>
      <div class="qcard"><div class="qref">AOM ${esc(q.ref)} · ${esc(sec ? sec.title : "")}</div><h2>${esc(q.q)}</h2><div class="opts">${opts}</div>
      ${answered ? `<div class="why"><b style="color:var(${ok ? "--green" : "--red"})">${ok ? "Correct." : "Not quite."}</b><p>${esc(q.why)}</p>
        <div class="row"><a href="#c${r.ch}-${q.sec}" data-act="quiz-read">Read the section</a><button class="btn primary" data-act="next" id="qnext">${QZ.i + 1 < QZ.list.length ? "Next question" : "See results"}</button></div></div>` : ""}
      </div></div></main>`;
  }
  function quizSetup(ch) {
    const c = B.chapters[ch]; const s = chapterStats(ch);
    const opts = c.sections.map((x) => { const n = c.quiz.filter((q) => q.sec === x.id).length; return n ? `<option value="${x.id}">${esc(x.title)} (${n})</option>` : ""; }).join("");
    return `<main><div class="qz"><div class="eyebrow">Chapter ${ch} · Question bank</div>
      <h1 style="font-family:var(--f-display);font-size:var(--t-2xl);font-weight:800;margin-top:6px">${esc(c.short)} quiz</h1>
      <p style="color:var(--ink-2)">${c.quiz.length} questions, each tied to its AOM page. Questions you miss stay in the revisit pile until you get them right.</p>
      <div class="modes">
        <button class="mode" data-act="qstart" data-mode="quick"><b>Quick 10</b><span>Missed and unseen questions first</span></button>
        <button class="mode" data-act="qstart" data-mode="missed" ${s.missed ? "" : "disabled"}><b>Revisit missed</b><span>${s.missed ? s.missed + " waiting" : "Nothing to revisit yet"}</span></button>
        <button class="mode" data-act="qstart" data-mode="all"><b>Full bank</b><span>All ${c.quiz.length}, shuffled</span></button>
      </div>
      <div class="qsec"><p class="lbl-sm">One section</p><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="qsec" aria-label="Section" style="flex:1;min-width:220px">${opts}</select>
        <button class="btn" data-act="qstart" data-mode="sec">Start</button></div></div>
      <p style="color:var(--ink-3);font-size:var(--t-sm);margin-top:26px">Seen ${s.seen} of ${s.q} · ${s.right} correct on last attempt. <button class="btn" data-act="qreset" style="min-height:34px;padding:4px 10px;margin-left:6px">Reset quiz history</button></p>
    </div></main>`;
  }
  function quizResults() {
    const n = QZ.results.length, ok = QZ.results.filter((x) => x.ok).length;
    const miss = QZ.results.filter((x) => !x.ok);
    return `<main><div class="qz"><div class="eyebrow">Result</div><div class="score" style="margin-top:8px">${ok}<span style="color:var(--ink-3);font-size:.5em">/${n}</span></div>
      <p style="color:var(--ink-2)">${n ? Math.round((ok / n) * 100) : 0}% correct.${miss.length ? " These are now in your revisit pile:" : " Clean sheet."}</p>
      ${miss.length ? `<ul class="missed">${miss.map((m) => `<li><b>${esc(m.q.q)}</b><small>${esc(m.q.o[m.q.a])} · <a href="#c${QZ.ch}-${m.q.sec}">AOM ${esc(m.q.ref)}</a></small></li>`).join("")}</ul>` : ""}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><button class="btn primary" data-act="qagain">Another round</button><a class="btn" href="#c${QZ.ch}">Back to chapter</a></div></div></main>`;
  }
  function answer(oi) {
    if (!QZ || QZ.picked != null) return;
    const q = QZ.list[QZ.i].q; QZ.picked = oi;
    const ok = oi === q.a;
    QZ.results.push({ q, ok });
    const qs = qstats(); const s = qs[q.id] || { n: 0, c: 0 }; s.n++; if (ok) s.c++; s.last = ok ? 1 : 0; qs[q.id] = s; S.set("q", qs);
    render(true);
    const nb = document.getElementById("qnext"); if (nb) nb.focus({ preventScroll: true });
  }

  /* ── drawer ── */
  function openDrawer() {
    const r = route(); if (r.v !== "sec") return;
    const bg = document.createElement("div"); bg.className = "drawer-bg";
    const d = document.createElement("div"); d.className = "drawer";
    const c = B.chapters[r.ch];
    d.innerHTML = rail(r.ch, r.sec || c.sections[0].id);
    document.body.append(bg, d);
    const close = () => { bg.remove(); d.remove(); };
    bg.addEventListener("click", close);
    d.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  }

  /* ── render ── */
  function render(keepScroll) {
    unmount();
    const r = route();
    if ((r.v === "sec" || r.v === "quiz") && !B.chapters[r.ch]) { location.hash = ""; return; }
    let html = bar(r);
    if (r.v === "home") html += viewHome();
    else if (r.v === "sec") html += viewSection(r);
    else html += viewQuiz(r);
    app.innerHTML = html;
    document.title = r.v === "home" ? "747-8F Tech Guide" : r.v === "quiz" ? "Quiz · Ch " + r.ch + " · 747-8F Tech Guide" : (B.chapters[r.ch].sections.find((s) => s.id === r.sec) || B.chapters[r.ch].sections[0]).title + " · 747-8F Tech Guide";
    if (r.v === "sec") mountWidgets(r.ch);
    if (!keepScroll) window.scrollTo(0, 0);
    if (pendingHit && r.v === "sec") { const q = pendingHit; pendingHit = null; highlight(q); }
  }

  /* ── events ── */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]"); if (!t) return;
    const act = t.dataset.act, r = route();
    if (act === "theme") { const cur = S.get("theme", "system"); const nx = THEMES[(THEMES.indexOf(cur) + 1) % 3]; S.set("theme", nx); applyTheme(nx); render(true); }
    else if (act === "search") openSearch();
    else if (act === "drawer") openDrawer();
    else if (act === "review") { setReviewed(r.ch, t.dataset.sec, !isReviewed(r.ch, t.dataset.sec)); render(true); }
    else if (act === "qstart") { const sel = document.getElementById("qsec"); startQuiz(r.ch, t.dataset.mode, sel && sel.value); render(); }
    else if (act === "answer") answer(+t.dataset.o);
    else if (act === "next") { QZ.i++; QZ.picked = null; render(); }
    else if (act === "quiz-quit") { if (QZ && QZ.results.length) { QZ.i = QZ.list.length; } else QZ = null; render(); }
    else if (act === "qagain") { QZ = null; render(); }
    else if (act === "qreset") { const c = B.chapters[r.ch]; const qs = qstats(); c.quiz.forEach((q) => delete qs[q.id]); S.set("q", qs); render(true); }
    else if (act === "quiz-missed") { startQuiz(1, "missed"); go("quiz-c1"); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input,select,textarea")) return;
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !document.querySelector(".search-bg")) { e.preventDefault(); openSearch(); return; }
    const r = route();
    if (r.v === "quiz" && QZ && QZ.i < QZ.list.length) {
      if (QZ.picked == null && /^[1-4]$/.test(e.key)) { const it = QZ.list[QZ.i]; const oi = it.order[+e.key - 1]; if (oi != null) answer(oi); }
    }
  });
  window.addEventListener("hashchange", () => render());

  /* ── offline install (only in the hosted build) ── */
  if (window.B748_PWA && "serviceWorker" in navigator) {
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloading) location.reload(); });
    navigator.serviceWorker.register("sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            const t = document.createElement("div"); t.className = "toast";
            t.innerHTML = `<span>A new version is ready.</span><button>Reload</button>`;
            t.querySelector("button").onclick = () => { reloading = true; (reg.waiting || nw).postMessage("skip"); };
            document.body.appendChild(t);
          }
        });
      });
    }).catch(() => {});
  }

  render();
})();
