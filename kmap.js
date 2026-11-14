// della wirfel — k-means intro (global cities page only). loaded after main.js.
//
// one sticky scene, scrolled through in three acts:
//   act 1  a field of 354 charcoal circles, floating, in no particular order
//   act 2  they move toward five emerging centers and take on tableau's cluster colors (an illustration of
//          the idea of k-means, not a replay of the model's calculations), then pause as five clusters
//   act 3  the clusters dissolve and every circle travels to its city's real latitude/longitude, colors kept;
//          then the map can be explored (hover a city, pick a cluster)
// every number (cluster, lat/lon, population, elevation, medians) comes from the tableau workbook.
// the scattered field and the five groups are layouts for the animation only; they carry no data.

document.querySelectorAll(".kmap").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = box.querySelector("svg"), mapEl = box.querySelector(".kmap-map"), tip = box.querySelector(".km-tip");
  const acts = [...box.querySelectorAll(".km-act")], chips = box.querySelector(".km-chips"), live = box.querySelector(".km-live");
  const D = JSON.parse(box.dataset.cities), MED = JSON.parse(box.dataset.med);
  const CL = [   // tableau's cluster colors; names and notes are my reading of each cluster
    { k: 1, name: "east, mid-size", color: "#4E79A7", obs: "roughly 3.1 million people, low elevation, longitude around 111.5. mostly eastern and asian cities of moderate population." },
    { k: 2, name: "near the equator", color: "#F28E2B", obs: "roughly 2.5 million people, latitude near the equator, longitude near 0°. lower-latitude cities across africa, south america and beyond." },
    { k: 3, name: "megacities", color: "#E15759", obs: "11.1 million median population, low elevation. the megacities, heavily represented by asian cities." },
    { k: 4, name: "west &amp; north", color: "#76B7B2", obs: "about 2.3 million people, longitude around 21°. more western and northern cities, including NYC, london and cairo." },
    { k: 5, name: "high ground", color: "#59A14F", obs: "1,660 m median elevation. the high-elevation cities, from bogotá and mexico city to nairobi, tehran and kunming." },
  ];
  CL.forEach(C => C.rgb = [1, 3, 5].map(i => parseInt(C.color.slice(i, i + 2), 16)));
  const CHARCOAL = [88, 88, 88];
  // scroll timeline (share of the section): act 1 holds, act 2 gathers + colors, pause, act 3 travels, then explore
  const GATHER = [.09, .36], TRAVEL = [.5, .78], LIVE = .82;
  const ACT_AT = [0, GATHER[0], .37, TRAVEL[0], LIVE];                        // which caption shows when

  const cities = D.r.map(r => ({ name: r[0], k: r[1], country: D.c[r[2]], lat: r[3], lon: r[4], elev: r[5], pop: r[6] }));
  let isLive = false, pick = 0;
  cities.forEach(c => {
    const el = document.createElementNS(NS, "circle"); svg.appendChild(el); c.el = el;
    el.addEventListener("mouseenter", () => {
      if (!isLive) return;
      tip.innerHTML = `<b>${c.name}</b> &middot; ${c.country}<br>cluster ${c.k} &middot; ${c.pop.toLocaleString("en-US")} people &middot; ${c.elev.toLocaleString("en-US")} m`;
      tip.style.left = c.x + "px"; tip.style.top = c.y - c.r + "px"; tip.classList.add("show");
    });
    el.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });

  // cluster names along the bottom (clickable in the explore step)
  chips.innerHTML = CL.map(C => `<button type="button" data-k="${C.k}"><i style="background:${C.color}"></i>${C.name}</button>`).join("");
  const fmt = n => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  chips.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    if (!isLive) return;
    pick = pick === +b.dataset.k ? 0 : +b.dataset.k;
    paintPick();
  }));
  function paintPick() {
    chips.classList.toggle("picking", !!pick);
    chips.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.k === pick));
    live.innerHTML = pick
      ? `${CL[pick - 1].obs} <b>median population ${fmt(MED.pop[pick])} &middot; median elevation ${fmt(MED.elev[pick])} m.</b>`
      : "hover a city for its numbers, or pick a cluster to see it on its own.";
    lastColorKey = "";                                                        // force a recolor
    render();
  }

  // ---------- layouts ----------
  const seed = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  let W = 0, H = 0;
  function layout() {
    W = mapEl.clientWidth; H = mapEl.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const r = Math.max(2.4, Math.min(4, Math.min(W, H) / 130));
    const rng = seed(354);
    // act 1: an even-but-random field (a jittered grid, shuffled), so nothing looks grouped yet
    const cols = Math.ceil(Math.sqrt(cities.length * W / H)), rows = Math.ceil(cities.length / cols);
    const cells = [...Array(cols * rows).keys()].map(i => [i, rng()]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    cities.forEach((c, i) => {
      const cell = cells[i], cx = cell % cols, cy = Math.floor(cell / cols);
      c.r = r;
      c.sx = (cx + .05 + rng() * .9) / cols * W; c.sy = (cy + .05 + rng() * .9) / rows * H;
      c.ph = rng() * Math.PI * 2; c.fq = .35 + rng() * .4;                 // float phase + speed
    });
    // act 2: five groups, each packed like a sunflower head around its center
    const row = W / H > 1.3;
    const centers = CL.map((C, i) => row ? [W * (i + .5) / 5, H * .5]
      : i < 3 ? [W * (i + .5) / 3, H * .27] : [W * (i - 3 + 1) / 3, H * .73]);
    const step = r * 2.5 * .62, GOLD = Math.PI * (3 - Math.sqrt(5));
    CL.forEach((C, i) => {
      cities.filter(c => c.k === C.k).sort((a, b) => a.sx - b.sx).forEach((c, j) => {
        const rad = step * Math.sqrt(j + .5), ang = j * GOLD;
        c.gx = centers[i][0] + rad * Math.cos(ang); c.gy = centers[i][1] + rad * Math.sin(ang);
      });
    });
    // act 3: tableau's latitude/longitude, plain equirectangular, framed around every city in the sheet
    const lo0 = -125, lo1 = 160, la0 = -45, la1 = 65, pad = 10;
    const s = Math.min((W - pad * 2) / (lo1 - lo0), (H - pad * 2) / (la1 - la0));
    const ox = (W - (lo1 - lo0) * s) / 2, oy = (H - (la1 - la0) * s) / 2;
    cities.forEach(c => {
      c.mx = ox + (c.lon - lo0) * s; c.my = oy + (la1 - c.lat) * s;
      c.d1 = rng() * .4;                                                      // each circle sets off a beat apart
      c.d3 = (c.k - 1) * .07 + rng() * .12;                                   // clusters dissolve one after another
      c.el.setAttribute("r", r);
    });
  }

  // ---------- motion ----------
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const inOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const back = t => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };   // a small overshoot
  const span = ([a, b], q) => clamp((q - a) / (b - a));
  const mix = (A, B, t) => `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  let p = 0, lastColorKey = "", lastAct = -1;
  function render(now = performance.now()) {
    const g = span(GATHER, p), tr = span(TRAVEL, p);
    const float = reduce ? 0 : (1 - clamp(g * 1.4)) * 3.2 + (p > GATHER[1] && p < TRAVEL[0] ? .6 : 0);   // drift in act 1, a breath in the pause
    const time = now / 1000;
    cities.forEach(c => {
      const t1 = back(clamp((g - c.d1) / .6)), t3 = inOut(clamp((tr - c.d3) / .7));
      const fx = Math.sin(time * c.fq + c.ph) * float, fy = Math.cos(time * c.fq * .8 + c.ph) * float;
      const ax = c.sx + (c.gx - c.sx) * t1, ay = c.sy + (c.gy - c.sy) * t1;
      c.x = ax + (c.mx - ax) * t3 + fx * (1 - t3); c.y = ay + (c.my - ay) * t3 + fy * (1 - t3);
      c.el.setAttribute("cx", c.x.toFixed(1)); c.el.setAttribute("cy", c.y.toFixed(1));
      c.tc = clamp((g - c.d1 - .15) / .55);                                    // color arrives as the circle settles
    });
    const colorKey = cities.map(c => (c.tc * 20 | 0)).join("") + isLive + pick;
    if (colorKey !== lastColorKey) {
      lastColorKey = colorKey;
      cities.forEach(c => {
        const dim = isLive && pick && pick !== c.k;
        c.el.style.fill = dim ? "#dcdcdc" : mix(CHARCOAL, CL[c.k - 1].rgb, c.tc);
        c.el.style.fillOpacity = dim ? .5 : .75 + .2 * c.tc;
      });
    }
  }
  function onScroll() {
    const r = box.getBoundingClientRect();
    p = clamp(-r.top / (r.height - innerHeight));
    const wasLive = isLive;
    isLive = p >= LIVE;
    if (!isLive && wasLive) { pick = 0; tip.classList.remove("show"); paintPick(); }
    box.classList.toggle("is-live", isLive); box.classList.toggle("started", p > .02);
    chips.classList.toggle("show", p > GATHER[0] + .12);
    const act = ACT_AT.reduce((a, at, i) => p >= at ? i : a, 0);
    if (act !== lastAct) { lastAct = act; acts.forEach((el, i) => el.classList.toggle("on", i === act)); }
    render();
  }
  // the float runs only while the scene is on screen
  let visible = false, running = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !running) loop(); }).observe(box);
  function loop() { running = visible && !reduce; if (!running) return; render(); requestAnimationFrame(loop); }
  layout();
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); onScroll(); }, 150); });
  onScroll();
});
