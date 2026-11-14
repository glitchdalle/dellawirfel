// della wirfel — k-means world map (global cities page only). loaded after main.js.

/* ---------- 16. k-means world map (global cities page) ----------
   every city sits at tableau's own latitude/longitude, colored by tableau's cluster. nothing is recalculated:
   scroll lights up one cluster at a time, then all five together. */
document.querySelectorAll(".kmap").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = box.querySelector("svg"), mapEl = box.querySelector(".kmap-map"), tip = box.querySelector(".km-tip");
  const D = JSON.parse(box.dataset.cities), MED = JSON.parse(box.dataset.med);
  const CL = [   // tableau's cluster colors; notes are my reading of each cluster
    { k: 1, name: "east, mid-size", color: "#4E79A7", obs: "roughly 3.1 million people, low elevation, longitude around 111.5. mostly eastern and asian cities of moderate population." },
    { k: 2, name: "near the equator", color: "#F28E2B", obs: "roughly 2.5 million people, latitude near the equator, longitude near 0°. lower-latitude cities spread across africa, south america and beyond." },
    { k: 3, name: "megacities", color: "#E15759", obs: "11.1 million median population, low elevation. the megacities, heavily represented by asian cities." },
    { k: 4, name: "west &amp; north", color: "#76B7B2", obs: "about 2.3 million people, longitude around 21°. more western and northern cities, including NYC, london and cairo." },
    { k: 5, name: "high ground", color: "#59A14F", obs: "1,660 m median elevation. the high-elevation cities, from bogotá and mexico city to nairobi, tehran and kunming." },
  ];
  const cities = D.r.map(r => ({ name: r[0], k: r[1], country: D.c[r[2]], lat: r[3], lon: r[4], elev: r[5], pop: r[6] }))
    .sort((a, b) => b.pop - a.pop);                                                  // big circles underneath small ones
  const maxPop = cities[0].pop;
  cities.forEach(c => {
    const el = document.createElementNS(NS, "circle"); svg.appendChild(el); c.el = el;
    el.addEventListener("mouseenter", () => {
      tip.innerHTML = `<b>${c.name}</b> &middot; ${c.country}<br>cluster ${c.k} &middot; ${c.pop.toLocaleString("en-US")} people &middot; ${c.elev.toLocaleString("en-US")} m`;
      tip.style.left = el.getAttribute("cx") + "px"; tip.style.top = el.getAttribute("cy") - c.r + "px"; tip.classList.add("show");
    });
    el.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });
  // side panel
  const list = box.querySelector(".km-list"), detail = box.querySelector(".km-detail");
  CL.forEach(C => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="lv-n">0${C.k}</span><span class="lv-name"><i style="background:${C.color}"></i>${C.name}</span>`;
    list.appendChild(li); C.li = li;
  });
  const fmt = n => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  const bars = (label, key, unit, cur) => {
    const max = Math.max(...CL.map(C => MED[key][C.k]));
    return `<p class="km-k">${label}</p>` + CL.map(C => `<div class="km-row${cur === 0 || cur === C.k ? " hl" : ""}"><span>0${C.k}</span><span class="km-bar"><i style="width:${MED[key][C.k] / max * 100}%;background:${C.color}"></i></span><span>${fmt(MED[key][C.k])}${unit}</span></div>`).join("");
  };
  let shown = null;
  function showDetail(cur) {                                                         // cur: -1 none, 1-5 one cluster, 0 all
    if (cur === shown) return; shown = cur;
    if (cur < 0) { detail.innerHTML = `<p class="km-obs">354 cities, before the algorithm has had its say.</p>`; return; }
    const obs = cur ? CL[cur - 1].obs : "all five together: two regional clusters, one near the equator, the megacities and the high ground.";
    detail.innerHTML = `<p class="km-obs">${obs}</p>` + bars("median population", "pop", "", cur) + bars("median elevation", "elev", " m", cur);
  }
  // projection: tableau's latitude/longitude onto the box (plain equirectangular, like a flat world map)
  function layout() {
    const W = mapEl.clientWidth, H = mapEl.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const lo0 = -125, lo1 = 160, la0 = -45, la1 = 65, pad = 16;                       // frames every city in the sheet
    const s = Math.min((W - pad * 2) / (lo1 - lo0), (H - pad * 2) / (la1 - la0));
    const ox = (W - (lo1 - lo0) * s) / 2, oy = (H - (la1 - la0) * s) / 2;
    const rMax = Math.max(9, Math.min(W, H) * .045);
    cities.forEach(c => {
      c.el.setAttribute("cx", (ox + (c.lon - lo0) * s).toFixed(1)); c.el.setAttribute("cy", (oy + (la1 - c.lat) * s).toFixed(1));
      c.r = Math.max(1.6, rMax * Math.sqrt(c.pop / maxPop)); c.el.setAttribute("r", c.r.toFixed(2));   // circle area follows population
    });
  }
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const STAGES = [[.08, .22], [.22, .36], [.36, .5], [.5, .64], [.64, .78]];         // one per cluster; after .82 all five
  let lastKey = "";
  function draw() {
    const r = box.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const all = p >= .82;
    let cur = -1;
    STAGES.forEach(([a, b], i) => { if (p >= a && p < b) cur = i + 1; });
    if (all) cur = 0;
    CL.forEach((C, i) => {
      const t = all ? 1 : clamp((p - STAGES[i][0]) / (STAGES[i][1] - STAGES[i][0]));
      C.li.style.setProperty("--p", t); C.li.classList.toggle("on", all || cur === C.k); C.li.classList.toggle("cur", cur === C.k);
    });
    const key = cur + "";
    if (key !== lastKey) {
      lastKey = key;
      cities.forEach(c => {
        const lit = cur === 0 || cur === c.k;
        c.el.style.fill = lit ? CL[c.k - 1].color : "#c9c9c9";
        c.el.style.fillOpacity = lit ? .85 : cur < 0 ? .7 : .35;
      });
    }
    showDetail(cur);
  }
  layout();
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", () => { layout(); draw(); });
  draw();
});
