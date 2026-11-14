// della wirfel — k-means story (global cities page only). loaded after main.js.
//
// one sticky scene, five scroll steps:
//   00 the original dataset      354 grey circles, scattered (sized by population)
//   01 k-means clustering        they converge into five groups
//   02 cluster assignments       the groups take on tableau's cluster colors
//   03 geographic distribution   every circle travels to its city's latitude/longitude
//   04 explore the results       hover a city, pick a cluster to isolate it
// every number (cluster, lat/lon, population, elevation, medians) comes from the tableau workbook.
// the scattered and grouped arrangements are just layouts for the animation; they carry no data.

document.querySelectorAll(".kmap").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = box.querySelector("svg"), mapEl = box.querySelector(".kmap-map"), tip = box.querySelector(".km-tip");
  const steps = box.querySelector(".km-list"), detail = box.querySelector(".km-detail");
  const D = JSON.parse(box.dataset.cities), MED = JSON.parse(box.dataset.med);
  const CL = [   // tableau's cluster colors; names and notes are my reading of each cluster
    { k: 1, name: "east, mid-size", color: "#4E79A7", obs: "roughly 3.1 million people, low elevation, longitude around 111.5. mostly eastern and asian cities of moderate population." },
    { k: 2, name: "near the equator", color: "#F28E2B", obs: "roughly 2.5 million people, latitude near the equator, longitude near 0°. lower-latitude cities spread across africa, south america and beyond." },
    { k: 3, name: "megacities", color: "#E15759", obs: "11.1 million median population, low elevation. the megacities, heavily represented by asian cities." },
    { k: 4, name: "west &amp; north", color: "#76B7B2", obs: "about 2.3 million people, longitude around 21°. more western and northern cities, including NYC, london and cairo." },
    { k: 5, name: "high ground", color: "#59A14F", obs: "1,660 m median elevation. the high-elevation cities, from bogotá and mexico city to nairobi, tehran and kunming." },
  ];
  CL.forEach(C => C.rgb = [1, 3, 5].map(i => parseInt(C.color.slice(i, i + 2), 16)));
  const GREY = [190, 190, 190];
  const STEPS = ["the original dataset", "k-means clustering", "cluster assignments", "geographic distribution", "explore the results"];
  // scroll ranges: [start, end] of each move. 00 holds until .07; 04 (interactive) holds from .8 to the end
  const S1 = [.07, .3], S2 = [.33, .46], S3 = [.5, .76], LIVE = .8;

  const cities = D.r.map(r => ({ name: r[0], k: r[1], country: D.c[r[2]], lat: r[3], lon: r[4], elev: r[5], pop: r[6] }))
    .sort((a, b) => b.pop - a.pop);                                       // big circles underneath small ones
  const maxPop = cities[0].pop;
  cities.forEach((c, i) => {
    const el = document.createElementNS(NS, "circle"); svg.appendChild(el); c.el = el; c.i = i;
    el.addEventListener("mouseenter", () => {
      if (!live) return;
      tip.innerHTML = `<b>${c.name}</b> &middot; ${c.country}<br>cluster ${c.k} &middot; ${c.pop.toLocaleString("en-US")} people &middot; ${c.elev.toLocaleString("en-US")} m`;
      tip.style.left = c.x + "px"; tip.style.top = c.y - c.r + "px"; tip.classList.add("show");
    });
    el.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });
  const labels = CL.map(C => {                                            // group labels for steps 01-02
    const t = document.createElementNS(NS, "text"); t.setAttribute("class", "km-glabel"); t.setAttribute("text-anchor", "middle");
    t.innerHTML = `<tspan class="km-gk">0${C.k}</tspan><tspan class="km-gn" dy="1.25em">${C.name}</tspan>`;
    svg.appendChild(t); return t;
  });

  // step list (left: number, right: name; a line fills as each step plays)
  STEPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="lv-n">0${i}</span><span class="lv-name">${s}</span>`;
    steps.appendChild(li);
  });
  const stepEls = [...steps.children];

  // ---------- layouts ----------
  let rng;
  const seed = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function relax(key, iters, pull, W, H) {                                // nudge circles apart (and toward a target if pull)
    const n = cities.length;
    for (let it = 0; it < iters; it++) {
      if (pull) cities.forEach(c => { c[key + "x"] += (c.tx - c[key + "x"]) * pull; c[key + "y"] += (c.ty - c[key + "y"]) * pull; });
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
        const A = cities[a], B = cities[b];
        let dx = B[key + "x"] - A[key + "x"], dy = B[key + "y"] - A[key + "y"];
        const min = A.r + B.r + 1.2, d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || .01, push = (min - d) / d * .5;
        dx *= push; dy *= push;
        A[key + "x"] -= dx; A[key + "y"] -= dy; B[key + "x"] += dx; B[key + "y"] += dy;
      }
      cities.forEach(c => {                                               // keep inside the box
        c[key + "x"] = Math.min(Math.max(c[key + "x"], c.r + 2), W - c.r - 2);
        c[key + "y"] = Math.min(Math.max(c[key + "y"], c.r + 2), H - c.r - 2);
      });
    }
  }
  let W = 0, H = 0, live = false;
  function layout() {
    W = mapEl.clientWidth; H = mapEl.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const rMax = Math.max(8, Math.min(W, H) * .04);
    cities.forEach(c => c.r = Math.max(1.6, rMax * Math.sqrt(c.pop / maxPop)));   // circle area follows population
    // 00 scattered
    rng = seed(354);
    cities.forEach(c => { c.sx = 20 + rng() * (W - 40); c.sy = 20 + rng() * (H - 40); });
    relax("s", 30, 0, W, H);
    // 01 five groups: a row of five on wide screens, three over two on narrow ones
    const row = W / H > 1.15;
    const centers = CL.map((C, i) => row ? [W * (i + .5) / 5, H * .44]
      : i < 3 ? [W * (i + .5) / 3, H * .28] : [W * (i - 3 + 1) / 3, H * .7]);
    cities.forEach(c => { [c.tx, c.ty] = centers[c.k - 1]; c.gx = c.sx; c.gy = c.sy; });
    relax("g", 160, .06, W, H);
    CL.forEach((C, i) => {                                                // label sits under each group
      const g = cities.filter(c => c.k === C.k);
      const bottom = Math.max(...g.map(c => c.gy + c.r));
      labels[i].setAttribute("x", centers[i][0]); labels[i].setAttribute("y", Math.min(bottom + 16, H - 18));
      labels[i].querySelector(".km-gn").setAttribute("x", centers[i][0]);
    });
    // 03 map: tableau's latitude/longitude, plain equirectangular
    const lo0 = -125, lo1 = 160, la0 = -45, la1 = 65, pad = 16;
    const s = Math.min((W - pad * 2) / (lo1 - lo0), (H - pad * 2) / (la1 - la0));
    const ox = (W - (lo1 - lo0) * s) / 2, oy = (H - (la1 - la0) * s) / 2;
    cities.forEach(c => {
      c.mx = ox + (c.lon - lo0) * s; c.my = oy + (la1 - c.lat) * s;
      c.d1 = rng() * .35;                                                 // each circle leaves a beat apart
      c.d3 = (c.mx / W) * .35;                                            // the map fills in west -> east
      c.el.setAttribute("r", c.r.toFixed(2));
    });
  }

  // ---------- panel ----------
  const fmt = n => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  const bars = (label, key, unit, pick) => {
    const max = Math.max(...CL.map(C => MED[key][C.k]));
    return `<p class="km-k">${label}</p>` + CL.map(C => `<div class="km-row${!pick || pick === C.k ? " hl" : ""}"><span>0${C.k}</span><span class="km-bar"><i style="width:${MED[key][C.k] / max * 100}%;background:${C.color}"></i></span><span>${fmt(MED[key][C.k])}${unit}</span></div>`).join("");
  };
  let pick = 0, shown = "";
  function panel(step) {
    const key = step + ":" + pick;
    if (key === shown) return; shown = key;
    if (step === 0) detail.innerHTML = `<p class="km-obs">354 cities, each sized by its population. no groups yet: this is the data before the algorithm.</p>`;
    if (step === 1) detail.innerHTML = `<p class="km-obs">k-means picks five centers and pulls every city toward the one it's closest to. closest in the data, not on the map.</p>`;
    if (step === 2) detail.innerHTML = `<p class="km-obs">five clusters, each given its own color.</p>` +
      CL.map(C => `<p class="km-chip"><i style="background:${C.color}"></i>0${C.k} &nbsp;${C.name}</p>`).join("");
    if (step === 3) detail.innerHTML = `<p class="km-obs">now every city goes back to its real latitude and longitude. some clusters turn out to be regions; others, like the high ground, are spread across continents.</p>`;
    if (step === 4) {
      detail.innerHTML = `<div class="km-picks">` + CL.map(C => `<button type="button" data-k="${C.k}" class="${pick === C.k ? "on" : ""}" style="--c:${C.color}"><i></i>0${C.k} ${C.name}</button>`).join("") + `</div>` +
        `<p class="km-obs">${pick ? CL[pick - 1].obs : "hover a city for its numbers, or pick a cluster to see it on its own."}</p>` +
        bars("median population", "pop", "", pick) + bars("median elevation", "elev", " m", pick);
      detail.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { pick = pick === +b.dataset.k ? 0 : +b.dataset.k; draw(); }));
    }
  }

  // ---------- draw ----------
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const span = ([a, b], p) => clamp((p - a) / (b - a));
  const mix = (A, B, t) => `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  function draw() {
    const r = box.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const s1 = span(S1, p), s2 = span(S2, p), s3 = span(S3, p);
    live = p >= LIVE;
    const step = live ? 4 : p >= S3[0] ? 3 : p >= S2[0] ? 2 : p >= S1[0] ? 1 : 0;
    if (!live) { pick = 0; tip.classList.remove("show"); }
    box.classList.toggle("is-live", live);
    cities.forEach(c => {
      const t1 = ease(clamp((s1 - c.d1) / .65)), t3 = ease(clamp((s3 - c.d3) / .65));
      const gx = c.sx + (c.gx - c.sx) * t1, gy = c.sy + (c.gy - c.sy) * t1;
      c.x = gx + (c.mx - gx) * t3; c.y = gy + (c.my - gy) * t3;
      c.el.setAttribute("cx", c.x.toFixed(1)); c.el.setAttribute("cy", c.y.toFixed(1));
      const tc = clamp(s2 * 1.6 - (c.k - 1) * .15);                        // clusters color in one after another
      const C = CL[c.k - 1];
      const dim = live && pick && pick !== c.k;
      c.el.style.fill = dim ? "#d6d6d6" : mix(GREY, C.rgb, tc);
      c.el.style.fillOpacity = dim ? .35 : .55 + .3 * tc;
    });
    labels.forEach((t, i) => {                                            // labels: in while grouped, out as they travel
      t.style.opacity = (clamp((s1 - .75) / .25) * (1 - clamp(s3 * 3))).toFixed(3);
      t.style.fill = mix([150, 150, 150], CL[i].rgb, clamp(s2 * 1.6 - i * .15));
    });
    const prog = [p >= S1[0] ? 1 : clamp(p / S1[0]), s1, s2, s3, live ? 1 : 0];
    stepEls.forEach((li, i) => { li.style.setProperty("--p", prog[i]); li.classList.toggle("on", i <= step); li.classList.toggle("cur", i === step); });
    panel(step);
  }
  layout();
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); draw(); }, 150); });
  draw();
});
