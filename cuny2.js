// della wirfel — CUNY dissertations, part two (loaded after main.js; part one is untouched).
//
// part one (main.js, section 12): the hand tosses six circles, and scrolling steps them through 2000 -> 2023.
// part two picks up the exact frame where part one ends (2023 sizes, same spots on screen), then:
//   1  the circles shrink to points and drop to their 2000 value on a chart
//   2  scrolling walks them year by year to 2023, each one drawing its line behind it
//   3  the lines settle and each is labeled with its change (pp) from the workbook
// every value is the annual average topic weight from the tableau workbook (the same data-bubbles part one uses).
// the lines are the raw annual values, not smoothed.

document.querySelectorAll(".bub2").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const src = document.querySelector(".bubbles");
  if (!src) return;
  const data = JSON.parse(src.dataset.bubbles);
  const topics = [...data.topics.filter(t => t.pp > 0), ...data.topics.filter(t => t.pp < 0)];   // same order as part one
  const N = data.end - data.start;                                                                // 23 steps
  const sticky = box.querySelector(".bub2-sticky"), stage = box.querySelector(".bub2-stage"), svg = stage.querySelector("svg");
  const yearEl = box.querySelector(".bub2-year"), ledes = [...box.querySelectorAll(".bub2-lede")];
  const maxAll = Math.max(...data.topics.flatMap(t => t.w));                                       // part one's size scale
  const yMax = Math.ceil(maxAll / 2) * 2;                                                          // chart top: next even %

  // the first caption repeats part one's, so the hand-off reads as one continuous scene
  const srcLede = src.querySelector(".bub-lede");
  if (srcLede) ledes[0].innerHTML = srcLede.innerHTML;
  const ledeBox = box.querySelector(".bub2-ledes");

  // typed narration beside the lines while they draw, like the home page intro: it types as you scroll.
  // each beat starts at a year (index into the data) and every number in it is a value from the workbook
  const fmtW = v => v.toFixed(2) + "%";
  const byT = n => data.topics.find(t => t.t === n);
  const BEATS = [
    { at: 0, text: "each point is one topic. scroll and it walks forward a year at a time, drawing its line." },
    { at: 3, text: `2003: literary, music & cultural works peaks at ${fmtW(byT(2).w[3])}, the heaviest of the six.` },
    { at: 17, text: "2017: education & schools and politics, state & policy both reach their highest point." },
    { at: 21, text: "2021: social, race & community overtakes literary, music & cultural works." },
    { at: 22, text: `2022–23: chemical & material processes hits its low (${fmtW(byT(10).w[22])}) while social, race & community climbs to ${fmtW(byT(21).w[23])}, about three times its 2000 share.` },
  ];
  const say = document.createElement("p"); say.className = "b2-say"; stage.appendChild(say);
  const sayText = document.createElement("span"), caret = document.createElement("span"); caret.className = "caret";
  say.append(sayText, caret);
  let shownBeat = -1, shownLen = -1;
  function narrate(yi, on) {
    let b = 0; BEATS.forEach((x, k) => { if (yi >= x.at) b = k; });
    const next = BEATS[b + 1] ? BEATS[b + 1].at : N + 1.5, len = BEATS[b].text.length;
    const n = Math.round(len * clamp((yi - BEATS[b].at) / Math.max(.6, (next - BEATS[b].at) * .6)));
    if (b !== shownBeat || n !== shownLen) { shownBeat = b; shownLen = n; sayText.textContent = BEATS[b].text.slice(0, n); }
    caret.classList.toggle("done", n >= len);
    say.style.opacity = on.toFixed(3);
  }

  // ---------- svg pieces ----------
  const grid = document.createElementNS(NS, "g"); grid.setAttribute("class", "b2-grid"); svg.appendChild(grid);
  const T = topics.map(t => {
    const line = document.createElementNS(NS, "polyline"); line.setAttribute("class", "b2-line"); line.style.stroke = t.color;
    const dot = document.createElementNS(NS, "circle"); dot.style.fill = t.color;
    const lab = document.createElementNS(NS, "text"); lab.setAttribute("class", "b2-lab");
    lab.innerHTML = `<tspan class="b2-n" style="fill:${t.color}">${t.name}</tspan><tspan class="b2-pp" dx="6">${t.pp > 0 ? "+" : "&minus;"}${Math.abs(t.pp).toFixed(2)} pp</tspan>`;
    svg.append(line); return { t, line, dot, lab };
  });
  T.forEach(o => svg.append(o.dot));
  // copies of part one's labels (topic number + % inside each circle, name + change underneath), faded out as the circles drop
  T.forEach(o => {
    o.inner = document.createElementNS(NS, "text"); o.inner.setAttribute("class", "b2-inner"); o.inner.setAttribute("text-anchor", "middle");
    o.inner.innerHTML = `<tspan class="b2-t">T${o.t.t}</tspan><tspan dy="1.15em">${o.t.w[N].toFixed(2)}%</tspan>`;
    o.under = document.createElementNS(NS, "text"); o.under.setAttribute("class", "b2-under"); o.under.setAttribute("text-anchor", "middle");
    o.ppText = `${o.t.pp > 0 ? "+" : "&minus;"}${Math.abs(o.t.pp).toFixed(2)} pp`;
    svg.append(o.inner, o.under);
  });
  T.forEach(o => svg.append(o.lab));

  const rowLabs = [...src.querySelectorAll(".bub-rowlabel")].map(el => {
    const t = document.createElementNS(NS, "text"); t.setAttribute("class", "b2-row"); t.textContent = el.textContent; svg.append(t); return { el, t };
  });

  // ---------- where part one leaves each circle (positions relative to the screen, sizes from the data) ----------
  let from = null;
  function snapshot() {
    const stages = [...src.querySelectorAll(".bub-stage")];
    if (stages.length !== T.length) return;
    const sr = stage.getBoundingClientRect();
    const st0 = stages[0].getBoundingClientRect();
    const rMax = Math.max(20, Math.min(st0.height, st0.width) / 2 - 4);                           // same rule as part one
    const names = [...src.querySelectorAll(".bub-name")];
    // the name under each circle wraps the way part one's does (one line per row of text there)
    T.forEach((o, i) => {
      const el = names[i], lines = [];
      if (el) {                                                                         // read part one's line breaks
        const rg = document.createRange(), words = el.textContent.split(" "); let cur = "", lastTop = null;
        const tn = el.firstChild; let pos = 0;
        words.forEach((w, k) => {
          rg.setStart(tn, pos); rg.setEnd(tn, pos + w.length); const top = rg.getBoundingClientRect().top;
          if (lastTop !== null && Math.abs(top - lastTop) > 2) { lines.push(cur.trim()); cur = ""; }
          cur += w + " "; lastTop = top; pos += w.length + 1;
        });
        lines.push(cur.trim());
      }
      o.under.innerHTML = (lines.length ? lines : [o.t.name]).map((l, k) => `<tspan dy="${k ? "1.25em" : 0}">${l.replace(/&/g, "&amp;")}</tspan>`).join("")
        + `<tspan class="b2-upp" dy="1.25em" style="fill:${o.t.color}">${o.ppText}</tspan>`;
    });
    rowLabs.forEach(({ el, t }) => { const q = el.getBoundingClientRect(); t.setAttribute("x", q.left - sr.left); t.setAttribute("y", q.top - sr.top + 12); });
    from = stages.map((s, i) => {
      const r = s.getBoundingClientRect(), n = names[i] && names[i].getBoundingClientRect();
      return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top, r: rMax * Math.sqrt(T[i].t.w[N] / maxAll),
               ny: n ? n.top - sr.top + 12 : r.bottom - sr.top + 14 };
    });
  }

  // ---------- chart layout ----------
  let W, H, X, Y, padL, padR, padT, padB;
  function layout() {
    if (srcLede) ledeBox.style.minHeight = srcLede.offsetHeight + "px";         // same header height as part one
    W = stage.clientWidth; H = stage.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const narrow = W < 700;
    padL = narrow ? 30 : 46; padR = narrow ? 64 : Math.min(330, W * .3); padT = narrow ? 64 : 24; padB = 40;
    say.style.width = narrow ? "" : (padR - 40) + "px";
    X = i => padL + (W - padL - padR) * i / N;
    Y = v => padT + (H - padT - padB) * (1 - v / yMax);
    grid.innerHTML = "";
    for (let v = 0; v <= yMax; v += 2) {
      grid.insertAdjacentHTML("beforeend", `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end">${v}%</text>`);
    }
    [0, 5, 10, 15, 20, 23].forEach(i => grid.insertAdjacentHTML("beforeend", `<text x="${X(i)}" y="${H - padB + 20}" text-anchor="middle">${data.start + i}</text>`));
    T.forEach(o => o.pts = o.t.w.map((v, i) => [X(i), Y(v)]));
    placeLabels(narrow);
  }
  function placeLabels(narrow) {
    // labels sit to the right of each line's 2023 end; nudge apart so they don't overlap
    const ends = T.map(o => ({ o, y: o.pts[N][1] })).sort((a, b) => a.y - b.y);
    const gap = narrow ? 13 : 17;
    ends.forEach((e, k) => { if (k && e.y - ends[k - 1].y < gap) e.y = ends[k - 1].y + gap; });
    ends.forEach(e => {
      e.o.lab.setAttribute("x", X(N) + (narrow ? 8 : 12)); e.o.lab.setAttribute("y", e.y + 4);
      e.o.lab.querySelector(".b2-n").style.display = narrow ? "none" : "";
    });
  }

  // ---------- scroll ----------
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const DROP = [.04, .24], WALK = [.3, .82], SETTLE = [.84, .94];
  const DOT = 3.5;                                                                  // point radius; lines are 2 x DOT wide (see cuny2.css)
  const span = ([a, b], p) => clamp((p - a) / (b - a));
  let lastLede = -1;
  function draw() {
    const r = box.getBoundingClientRect();
    const pinned = r.top <= 0;
    if (!pinned) snapshot();                                                        // keep the hand-off frame up to date
    sticky.classList.toggle("on", pinned);
    const p = clamp(-r.top / (r.height - innerHeight));
    if (!from) return;
    const d = ease(span(DROP, p)), wk = span(WALK, p), s = ease(span(SETTLE, p));
    const yi = wk * N, i0 = Math.floor(yi), fr = yi - i0;                              // where along the years each dot is
    yearEl.textContent = p < DROP[1] ? data.end : data.start + Math.min(N, Math.round(yi));
    T.forEach((o, k) => {
      const f = from[k], a = o.pts[0];
      let x, y;
      if (wk <= 0) { x = f.x + (a[0] - f.x) * d; y = f.y + (a[1] - f.y) * d; }
      else {
        const A = o.pts[Math.min(i0, N)], B = o.pts[Math.min(i0 + 1, N)];
        x = A[0] + (B[0] - A[0]) * fr; y = A[1] + (B[1] - A[1]) * fr;
      }
      const rad = f.r + (DOT - f.r) * d;                                            // big circle -> the line's own width
      o.dot.setAttribute("cx", x.toFixed(1)); o.dot.setAttribute("cy", y.toFixed(1)); o.dot.setAttribute("r", rad.toFixed(1));
      const drawn = wk > 0 ? o.pts.slice(0, Math.min(i0, N) + 1).concat([[x, y]]) : [];
      o.line.setAttribute("points", drawn.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "));
      o.lab.style.opacity = s.toFixed(3);
      const fade = (1 - clamp(span(DROP, p) * 4)).toFixed(3);                       // part one's labels leave first
      o.inner.setAttribute("x", f.x); o.inner.setAttribute("y", f.y - 2); o.inner.querySelectorAll("tspan").forEach(t => t.setAttribute("x", f.x));
      o.under.setAttribute("x", f.x); o.under.setAttribute("y", f.ny); o.under.querySelectorAll("tspan").forEach(t => t.setAttribute("x", f.x));
      o.inner.style.opacity = o.under.style.opacity = fade;
      rowLabs.forEach(({ t }) => t.style.opacity = fade);
    });
    grid.style.opacity = d.toFixed(3);
    narrate(yi, clamp((p - WALK[0] + .02) / .04) * (1 - s));                         // types while walking, steps aside for the labels
    const lede = p < DROP[1] * .6 ? 0 : p < SETTLE[0] ? 1 : 2;
    if (lede !== lastLede) { lastLede = lede; ledes.forEach((el, k) => el.classList.toggle("on", k === lede)); }
  }
  layout(); snapshot();
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); snapshot(); draw(); }, 150); });
  draw();
});
