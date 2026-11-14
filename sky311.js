// della wirfel — "the other skyline" (NYC 311 page only). loaded after main.js.
//
// a line drawing of the five boroughs, then a spike rises from each zip code, sized by its complaints.
// scrolling morphs the skyline through the four complaint types: heat, unsanitary, rodent, mold.
// mold is shown first on rodent's scale (it barely registers), then rescaled to its own tallest spike,
// so the scale change is part of the story. at the end the skyline can be explored.
// every number comes from the MAP-ALL sheet of the tableau workbook (data-zips on the page). nothing is summed.
// borough outlines: nyc department of city planning borough boundaries (public data), simplified;
// stored as x = (lon + 74.26) * 1000 * cos(40.7°), y = (40.92 - lat) * 1000. they're context, not data.
const SKY_BORO = {"Bronx": "M281 121l13 8 0 4 -5 2 -8 -2 -3 -6 3 -6ZM356 61l8 12 -3 3 3 0 -3 0 3 0 -2 2 2 0 -2 6 -3 -1 -4 -10 2 -4 -3 -1 2 -1 -2 1 2 -1 -2 0 2 -1 -2 -2 2 -3ZM373 66l-1 9 -3 -7 1 -8 5 5 -2 1ZM293 16l11 3 3 -8 3 -1 -2 2 9 4 3 10 34 11 -3 8 -4 4 -1 -2 0 4 -4 -2 4 5 7 -7 1 -6 3 -2 0 2 4 1 -3 5 2 -1 0 2 1 -2 0 3 -1 3 -2 -2 -3 2 0 7 -2 4 -3 2 -1 7 -3 -5 -1 -9 -2 3 -3 -3 -3 -1 -1 2 3 2 0 5 -3 0 0 3 1 5 1 -1 -1 2 3 -2 -2 4 -3 -1 3 3 -1 10 4 3 -3 1 0 3 5 -1 2 6 6 3 -5 4 -3 -5 2 4 2 3 9 3 0 3 -20 -10 -10 3 -1 6 -5 -1 -2 -7 1 -9 -2 -7 2 -5 0 -6 0 6 -3 4 2 10 -4 9 -4 -3 -3 0 4 2 1 7 -6 0 -2 -1 0 -4 0 2 -7 -3 -2 -3 -4 -2 4 4 2 5 -3 7 -5 -3 -5 1 -3 -4 -4 -1 -6 2 -7 8 -12 -6 -4 -5 0 -28 8 -17 8 -11 4 -12 -3 -3 -6 3 -5 -3 10 -35 1 -2 28 12Z", "Manhattan": "M184 227l4 0 0 4 -8 6 -3 -3 5 -7 2 0ZM241 151l-15 20 13 -21 3 -3 -1 4ZM257 119l5 5 -1 4 -7 10 -2 1 -6 -2 2 -7 6 -2 -3 0 1 -8 2 -2 3 1ZM253 42l3 1 1 4 0 -2 8 4 -7 12 -1 -1 0 2 -11 23 1 25 4 9 0 5 -11 13 0 8 -21 31 -1 8 -2 0 3 9 -4 15 -16 3 -6 5 1 1 -4 1 1 1 -5 1 -4 -6 2 -13 3 0 1 -7 -2 0 2 0 -2 -2 3 -5 -2 0 2 0 -1 -8 2 0 -2 -1 2 -1 -2 -1 2 0 -2 -2 2 0 -2 -1 2 0 -2 -1 2 0 -1 -1 1 -4 3 -5 -1 -1 2 -1 1 -2 -1 -1 2 0 -2 -1 2 1 -1 -2 2 1 -2 -2 3 0 -2 -1 3 1 -2 -2 2 1 -2 -3 2 1 -1 -1 3 -1 -1 -3 2 2 -2 -2 3 -1 3 -5 -2 0 2 0 23 -42 -1 -2 6 -8 4 -12 -1 -6 4 -4 12 -24Z", "Queens": "M321 325l3 3 -1 3 -8 -4 4 -3 2 1ZM353 312l-2 4 -6 -1 0 -2 3 -3 5 2ZM374 306l5 3 -1 2 1 -2 11 -1 6 9 0 5 -3 1 3 0 0 3 -58 11 -43 19 -27 8 -26 14 1 -13 10 -7 11 -4 4 3 4 0 7 -6 11 0 20 -13 9 0 13 -5 9 -7 3 3 2 -1 -3 -1 0 -2 4 2 -2 -5 10 -2 3 -3 -2 6 1 2 8 -15 3 1 0 5 -5 6 5 -4 1 4 4 0 -2 -1 1 -10 -4 -3 1 -2 5 0ZM350 293l2 1 -3 2 5 -1 -4 2 -1 4 -2 -1 1 4 -3 3 -2 -11 7 -3ZM339 291l1 13 -4 -10 2 0 -2 -5 3 2ZM331 281l2 9 4 5 -3 2 3 2 -2 3 1 4 2 -1 -2 2 2 5 -5 13 -9 0 -2 -1 2 -2 8 -2 -2 -1 4 -9 -1 -2 -1 4 -3 -6 -6 0 2 -19 -2 -6 6 3 2 -3ZM333 119l5 4 13 1 3 7 9 -2 0 -3 -2 -1 5 -1 5 8 -3 1 -1 -1 7 8 1 6 16 17 -8 -11 1 -5 -2 -5 4 -5 38 32 1 12 -6 11 -17 6 2 12 1 30 -2 17 2 11 -12 5 1 12 -2 0 1 -2 -2 -2 -2 2 0 -6 -6 -5 6 7 -1 6 -13 6 -4 9 -1 -4 -2 5 2 -5 -6 -3 -4 7 3 6 -8 6 -7 -4 5 -11 4 0 5 -7 -5 -4 -7 3 6 -3 -1 -2 -22 -13 -1 -10 8 -2 -5 -1 -4 2 0 12 -6 -4 1 -8 1 3 -2 2 0 -3 -2 0 2 9 -2 1 -4 -14 3 17 -11 1 -2 -3 2 -4 -5 0 -4 -5 2 -2 -1 1 -2 -1 4 -2 -1 -3 3 -1 -2 -8 -2 1 -2 -8 -2 -3 -3 -13 -3 1 -12 10 -2 1 -2 -2 -1 3 -4 -9 -3 -3 1 -2 -14 -13 -1 -6 2 -1 -3 -6 3 -2 -13 -7 -3 -5 -3 -2 6 -5 -7 5 -5 -2 -7 1 5 -10 3 1 -3 -2 10 -14 6 -6 -2 -4 1 -3 6 0 14 -14 8 2 3 3 -5 6 6 -4 -1 2 3 0 0 5 0 2 1 -3 1 4 4 0 -1 -6 5 -1 -1 -2 4 1 5 -5 -3 6 13 9 -2 2 1 1 -5 2 3 5 2 -2 0 2 -2 0 6 3 9 -7 -7 -1 -2 -5 2 -6 -3 -1 2 -3 -4 0 -3 -4 5 -2 -2 -1 1 -5 4 1 0 -2 4 0 0 -2 1 2 3 -4 -2 1 2 9 4 0 4 -4 -2 -4 7 -4Z", "Brooklyn": "M298 338l-2 -1 -1 -4 3 -5 4 4 -4 6ZM309 323l-6 1 -2 -4 1 -3 5 1 3 3 -1 2ZM307 304l0 3 4 -2 0 5 -4 4 -3 -5 2 -2 -2 -4 3 1ZM316 302l-1 3 5 1 -2 8 -5 2 -4 -3 4 -2 1 -9 2 0ZM295 303l-6 2 3 -9 6 -4 1 10 -4 1ZM313 291l-2 3 5 3 -16 5 2 -6 -1 1 0 -3 2 1 3 -4 2 1 5 -1ZM313 288l-1 2 -8 0 2 -5 7 -4 3 2 -3 5ZM232 181l6 2 -1 3 1 -3 3 2 3 5 7 3 3 8 -5 4 -1 4 2 2 0 -6 5 -2 1 8 14 13 -1 2 3 3 4 9 1 -3 2 2 6 -4 8 -7 4 -1 2 13 2 3 2 8 2 -1 2 8 -6 7 5 6 -1 7 -4 1 -2 4 -10 -16 8 17 -5 1 -12 -12 10 13 -5 5 0 3 -3 0 -6 5 -16 -8 11 7 1 2 4 1 0 6 4 2 -2 2 3 0 -3 4 -5 1 -1 -6 -6 -5 5 7 1 4 -6 -1 1 3 -4 0 -3 -5 2 -6 -4 7 4 5 4 1 19 -4 6 21 -3 5 -12 3 -2 -11 -10 2 -3 -13 -4 -3 -3 2 -4 -4 -1 2 13 13 -4 3 -4 0 -2 -2 3 -3 -4 2 -1 -5 -2 -1 1 8 5 2 9 -1 0 3 -3 0 4 1 -32 -1 16 2 1 5 -39 4 0 2 -1 -1 -13 1 -1 -2 -7 -3 0 -5 5 -2 13 3 2 -3 -2 2 -3 -1 1 -4 -3 3 -4 -1 0 -3 5 -3 -5 3 2 -2 0 -4 -2 1 1 -3 -2 1 -7 -8 -15 -4 -4 -4 -4 -12 0 -9 3 -9 -1 -1 1 1 2 -5 5 0 1 -2 -2 -3 3 2 -1 -4 3 0 -2 -2 3 2 -1 -3 4 0 -2 -2 2 1 -1 -2 3 0 -2 -2 1 -2 3 2 0 -3 3 2 -1 -3 4 1 -3 -3 3 2 -1 -2 3 2 1 -1 -2 -2 3 -2 0 -4 -3 5 -2 -1 -1 2 1 -5 -2 4 1 -2 -2 0 -2 4 -4 0 -2 -7 3 7 3 -1 1 -3 -3 -1 2 -1 -2 0 0 -1 -1 1 2 -2 -2 0 1 -2 -3 3 -1 -8 5 -4 0 4 3 -3 -2 -1 8 -6 5 -14 13 -2 2 4 0 2 1 -1 1 1 -1 -2 2 2 -1 -3 2 2 -4 -7 3 2 -1 -3 4 6 -2 -7 2 -7 4 -8 3 0 -3 -1 0 -8 6 -5Z", "Staten Island": "M135 272l8 3 1 2 -2 1 2 0 -2 1 2 0 -2 0 -1 4 3 0 -3 0 1 7 4 1 -4 -1 0 5 14 19 2 6 -18 21 1 1 -1 -1 -12 12 -10 14 -2 -1 -4 6 -8 3 -11 16 -2 -6 5 -1 5 -6 -3 -4 -5 0 -4 4 1 5 -28 18 -2 -2 -3 2 -8 9 -3 -3 -6 1 -8 9 -24 6 -3 -3 -2 -8 4 -8 1 1 1 -2 1 1 5 -4 -3 -5 2 -9 -5 -9 13 -13 9 1 5 -3 6 -31 5 -8 -4 -11 2 -22 5 -7 11 -8 0 3 4 -3 2 2 -1 3 1 -3 4 1 2 2 2 -1 -1 2 2 -1 0 2 2 -1 1 1 1 -1 1 2 1 -2 2 2 11 -5 6 3 0 -2 7 -1 6 -3 8 0 13 -3Z"};

document.querySelectorAll(".sky311").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = box.querySelector("svg"), mapEl = box.querySelector(".sky-map"), tip = box.querySelector(".sky-tip");
  const acts = [...box.querySelectorAll(".sky-act")], key = box.querySelector(".sky-key"), picks = box.querySelector(".sky-picks");
  const BORO = { X: "bronx", K: "brooklyn", M: "manhattan", Q: "queens", S: "staten island" };
  const T = [   // the four complaint types, in story order
    { k: "h", name: "heat / hot water", color: [232, 149, 106] },
    { k: "u", name: "unsanitary condition", color: [218, 95, 156] },
    { k: "r", name: "rodent", color: [110, 110, 110] },
    { k: "m", name: "mold", color: [74, 120, 181] },
  ];
  // one spike per zip + borough, straight from the MAP-ALL sheet (a few zips straddle two boroughs)
  const spikes = [];
  box.dataset.zips.split(";").forEach(z => {
    const [head, vals] = z.split(":"), [zip, lat, lon] = head.split(",");
    if (!(+lat > 40.4 && +lat < 41 && +lon > -74.3 && +lon < -73.6)) return;   // in the city (drops zip 12345)
    const by = {};
    vals.split(",").forEach(v => { (by[v[0]] = by[v[0]] || { zip, b: v[0], lat: +lat, lon: +lon, n: {} }).n[v[1]] = +v.slice(2); });
    Object.values(by).forEach(s => spikes.push(s));
  });
  T.forEach(t => { t.top = spikes.reduce((a, s) => ((s.n[t.k] || 0) > (a.n[t.k] || 0) ? s : a)); t.max = t.top.n[t.k]; });   // tallest spike of each type
  spikes.sort((a, b) => b.lat - a.lat);                                          // north first, so southern spikes sit in front

  // line-art boroughs (nyc city planning boundaries, simplified)
  const boroG = document.createElementNS(NS, "g"); boroG.setAttribute("class", "sky-boros"); svg.appendChild(boroG);
  const boroPaths = Object.values(SKY_BORO).map(d => {
    const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("pathLength", "1"); boroG.appendChild(p); return p;
  });
  const spikeG = document.createElementNS(NS, "g"); svg.appendChild(spikeG);
  spikes.forEach(s => {
    s.el = document.createElementNS(NS, "path"); spikeG.appendChild(s.el);
    s.el.addEventListener("mouseenter", () => {
      if (!live) return;
      tip.innerHTML = `<b>${s.zip}</b> &middot; ${BORO[s.b]}<br>` + T.map(t => `<span${t === T[pick] ? ' class="on"' : ""}>${t.name}: ${(s.n[t.k] || 0).toLocaleString("en-US")}</span>`).join("<br>");
      tip.style.left = s.x + "px"; tip.style.top = s.y - s.h + "px"; tip.classList.add("show");
    });
    s.el.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });

  // ---------- layout: the same projection for the borough lines and every spike ----------
  // borough paths are stored as x = (lon + 74.26) * 1000 * cos(40.7°), y = (40.92 - lat) * 1000
  const K = Math.cos(40.7 * Math.PI / 180);
  let W, H, sc, ox, oy, hMax, half;
  function layout() {
    W = mapEl.clientWidth; H = mapEl.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const bw = 540, bh = 410, top = H * .32;                                      // leave headroom for the spikes
    sc = Math.min((W - 20) / bw, (H - top - 16) / bh);
    ox = (W - bw * sc) / 2; oy = top + (H - top - 16 - bh * sc) / 2;
    boroG.setAttribute("transform", `translate(${ox} ${oy}) scale(${sc})`);
    hMax = Math.min(H * .33, top + bh * sc * .5); half = Math.max(1.6, sc * 2.6);
    spikes.forEach(s => { s.x = ox + (s.lon + 74.26) * 1000 * K * sc; s.y = oy + (40.92 - s.lat) * 1000 * sc; });
  }

  // ---------- story ----------
  // scroll stops: draw the city, then heat, unsanitary, rodent, mold (at rodent's scale), mold (at its own scale), explore
  const STOPS = [
    { at: .03, to: .13 },                    // 0 the boroughs draw themselves
    { at: .16, to: .3, t: 0 },               // 1 heat rises
    { at: .36, to: .46, t: 1 },              // 2 unsanitary
    { at: .52, to: .62, t: 2 },              // 3 rodent
    { at: .66, to: .72, t: 3, scale: 2 },    // 4 mold, still on rodent's scale
    { at: .76, to: .82, t: 3 },              // 5 mold, rescaled to its own tallest spike
  ];
  const LIVE = .88;
  const ACT_AT = [0, .14, .34, .5, .64, .74, LIVE];
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const mix = (A, B, t) => A.map((v, i) => Math.round(v + (B[i] - v) * t));
  const fmt = n => n.toLocaleString("en-US");
  // what a stop looks like: which type, measured against which type's tallest spike
  const look = i => i <= 0 ? { t: 0, scale: 0, g: 0 } : { t: STOPS[i].t, scale: STOPS[i].scale ?? STOPS[i].t, g: 1 };
  let p = 0, live = false, pick = 0, lastAct = -1;
  function draw() {
    // where we are between two stops
    let i = 0; STOPS.forEach((s, k) => { if (p >= s.at) i = k; });
    const f = ease(clamp((p - STOPS[i].at) / (STOPS[i].to - STOPS[i].at)));
    const A = look(i - 1 < 0 ? 0 : i - 1), B = look(i);
    const from = i === 0 ? { t: 0, scale: 0, g: 0 } : A, to = i === 0 ? { t: 0, scale: 0, g: 0 } : B;
    const lineIn = i === 0 ? f : 1;
    boroPaths.forEach(b => b.style.strokeDashoffset = (1 - lineIn).toFixed(3));
    const L = live ? { t: pick, scale: pick, g: 1 } : null;
    spikes.forEach(s => {
      let h, col;
      if (L) { h = (s.n[T[L.t].k] || 0) / T[L.scale].max; col = T[L.t].color; }
      else {
        const h0 = from.g * (s.n[T[from.t].k] || 0) / T[from.scale].max, h1 = to.g * (s.n[T[to.t].k] || 0) / T[to.scale].max;
        const g = i === 1 ? f : 1;                                                  // heat grows out of the ground
        h = i === 1 ? h1 * g : h0 + (h1 - h0) * f;
        col = mix(T[from.t].color, T[to.t].color, i === 1 ? 1 : f);
      }
      s.h = Math.max(0, h * hMax);
      s.el.setAttribute("d", `M${(s.x - half).toFixed(1)} ${s.y.toFixed(1)}L${s.x.toFixed(1)} ${(s.y - s.h).toFixed(1)}L${(s.x + half).toFixed(1)} ${s.y.toFixed(1)}Z`);
      s.el.style.fill = `rgb(${col})`;
    });
    // scale key: what the tallest spike stands for right now
    const cur = L || (i === 0 ? null : (f > .5 ? to : from));
    if (cur && cur.g) {
      const t = T[cur.scale];
      key.innerHTML = `<i style="height:${hMax}px"></i><span>tallest possible spike = <b>${fmt(t.max)}</b> complaints<br>(${t.top.zip}, ${BORO[t.top.b]}, ${t.name})</span>`;
      key.classList.add("show");
    } else key.classList.remove("show");
  }
  function onScroll() {
    const r = box.getBoundingClientRect();
    p = clamp(-r.top / (r.height - innerHeight));
    const was = live; live = p >= LIVE;
    if (was && !live) { tip.classList.remove("show"); pick = 3; paintPicks(); }
    box.classList.toggle("is-live", live); box.classList.toggle("started", p > .02);
    const act = ACT_AT.reduce((a, at, k) => p >= at ? k : a, 0);
    if (act !== lastAct) { lastAct = act; acts.forEach((el, k) => el.classList.toggle("on", k === act)); }
    draw();
  }
  // explore: switch the skyline between the four complaint types
  picks.innerHTML = T.map((t, k) => `<button type="button" data-k="${k}"><i style="background:rgb(${t.color})"></i>${t.name}</button>`).join("");
  function paintPicks() { picks.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.k === pick)); }
  picks.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { pick = +b.dataset.k; paintPicks(); draw(); }));
  pick = 3; paintPicks();
  layout();
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); onScroll(); }, 150); });
  onScroll();
});
