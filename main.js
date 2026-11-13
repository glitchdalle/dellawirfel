// della wirfel — site motion. no libraries.
// 1. home page: the name is already there, scrolling types out the intro (ends in the data / design links)
// 2. anything with class="reveal" fades up when it scrolls into view
// 3. project list: filter buttons + an image that follows your cursor
// 4+. embeds, title letters, page wipe, locator, parallax, filmstrip, scroll-scrubbed frames

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. typed intro (home): the name is already there, scrolling types the rest ----------
   the practice / based in / currently line hides while it types and comes back at the top and at the end. */
const typeHero = document.querySelector(".type-hero");
if (typeHero) {
  const segs = [...typeHero.querySelectorAll(".type-msg .seg")];
  const full = segs.map(el => el.textContent);
  const total = full.reduce((n, t) => n + t.length, 0);
  const caret = document.createElement("span"); caret.className = "caret";
  const START = 0.04, END = 0.8;                       // share of the section's scroll where typing happens
  let shown = -1;
  function typeTo(n) {
    if (n === shown) return; shown = n;
    let left = n, caretAfter = null;
    segs.forEach((el, k) => {
      const take = Math.max(0, Math.min(full[k].length, left));
      el.textContent = full[k].slice(0, take);
      el.classList.toggle("ready", take === full[k].length);   // links only work once fully typed
      if (take > 0) caretAfter = el;
      left -= take;
    });
    if (caretAfter) caretAfter.after(caret); else segs[0].before(caret);
    caret.classList.toggle("done", n >= total);
  }
  function onScroll() {
    const r = typeHero.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
    const t = reduceMotion ? 1 : Math.min(Math.max((p - START) / (END - START), 0), 1);
    typeTo(Math.round(t * total));
    typeHero.classList.toggle("typing", t > 0 && t < 1);      // hides practice / based in / currently
    typeHero.classList.toggle("started", t > 0);
    document.body.classList.toggle("past-hero", r.bottom < 90);  // small name returns to the header after the intro
  }
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
}

/* ---------- 2. scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (el.dataset.delay || 0) + "s";
  io.observe(el);
});

/* ---------- 3. project list ---------- */
const buttons = document.querySelectorAll(".filters button");
const items = document.querySelectorAll(".plist li");
buttons.forEach(btn => btn.addEventListener("click", () => {
  buttons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const f = btn.dataset.filter;
  let n = 0;
  items.forEach(li => {
    const show = f === "all" || li.dataset.tags.split(" ").includes(f);
    li.classList.toggle("hidden", !show);
    if (show) li.querySelector(".num").textContent = String(++n).padStart(2, "0");
  });
}));

// image follows the cursor (set data-img="images/your-file.jpg" on each <li> to use real images)
const follower = document.querySelector(".cursor-img");
if (follower && items.length) {
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
  (function loop() {
    cx += (x - cx) * 0.15; cy += (y - cy) * 0.15;
    follower.style.left = cx + "px"; follower.style.top = cy + "px";
    requestAnimationFrame(loop);
  })();
  items.forEach(li => {
    li.addEventListener("mouseenter", () => {
      const img = li.dataset.img;
      follower.style.backgroundImage = img ? `url(${img})` : "none";
      follower.textContent = img ? "" : li.querySelector(".name").textContent;
      follower.classList.add("show");
    });
    li.addEventListener("mouseleave", () => follower.classList.remove("show"));
  });
}

/* ---------- embeds: <div class="embed" data-src="..." data-w="1200" data-h="850"> ----------
   the frame is exactly the dashboard's size (data-w x data-h, from tableau), so there's no grey gap.
   on narrower screens the whole dashboard is scaled down to fit, keeping its shape. */
const embedFits = [];
document.querySelectorAll(".embed").forEach(box => {
  let src = (box.dataset.src || "").trim();
  if (!src) { box.textContent = "paste a tableau public link into data-src"; return; }
  // turn a normal tableau public link into its embeddable version
  if (src.includes("public.tableau.com")) {
    const m = src.match(/viz\/([^/?#]+)\/([^/?#]+)/) || src.match(/views\/([^/?#]+)\/([^/?#]+)/);
    if (m) src = `https://public.tableau.com/views/${m[1]}/${m[2]}?:showVizHome=no&:embed=true&:toolbar=no&:device=desktop`;
  }
  const w = +box.dataset.w || 1200, h = +box.dataset.h || 800;
  const f = document.createElement("iframe");
  f.src = src; f.loading = "lazy"; f.allowFullscreen = true;
  f.width = w; f.height = h; f.style.width = w + "px"; f.style.height = h + "px";
  box.innerHTML = ""; box.appendChild(f);
  function fit() {
    const avail = box.parentElement.clientWidth - (parseFloat(getComputedStyle(box.parentElement).paddingLeft) || 0) - (parseFloat(getComputedStyle(box.parentElement).paddingRight) || 0);
    const s = Math.min(1, avail / w);
    f.style.transform = s < 1 ? `scale(${s})` : "";
    box.style.width = w * s + "px"; box.style.height = h * s + "px";
  }
  embedFits.push(fit); fit();
});
addEventListener("resize", () => embedFits.forEach(fn => fn()));

/* ---------- embed toggle: buttons in .embed-switch show one .embed at a time ---------- */
document.querySelectorAll(".embed-switch").forEach(sw => {
  const boxes = sw.parentElement.querySelectorAll(".embed-group .embed");
  sw.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    sw.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    boxes.forEach((b, k) => b.classList.toggle("hidden", k !== +btn.dataset.i));
  }));
});

/* ---------- 5. split page titles into letters that rise in ---------- */
document.querySelectorAll(".page-title").forEach(t => {
  const words = t.textContent.trim().split(" ");
  t.classList.add("split"); t.classList.remove("reveal"); t.innerHTML = "";
  let k = 0;
  words.forEach((w, wi) => {
    const word = document.createElement("span"); word.style.whiteSpace = "nowrap"; word.style.display = "inline-block";
    [...w].forEach(ch => {
      const m = document.createElement("span"); m.className = "mask";
      const c = document.createElement("span"); c.className = "char"; c.textContent = ch;
      c.style.transitionDelay = (0.25 + k++ * 0.035) + "s";
      m.appendChild(c); word.appendChild(m);
    });
    t.appendChild(word);
    if (wi < words.length - 1) t.appendChild(document.createTextNode(" "));
  });
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("go")));
});

/* ---------- 6. project list rows slide in one by one ---------- */
const listIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); listIO.unobserve(e.target); }
}), { threshold: 0.1 });
document.querySelectorAll(".plist li").forEach((li, i) => {
  li.style.transitionDelay = Math.min(i * 0.06, 0.6) + "s";
  listIO.observe(li);
});

/* ---------- 7. progress line + "you are here" locator ---------- */
const bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
const loc = document.createElement("div"); loc.className = "locator";
const pageName = (document.querySelector(".site-header nav a.active") || {}).textContent || "index";
const projectName = document.querySelector(".page-title") && location.pathname.includes("/projects/")
  ? " / " + document.querySelector(".page-title").textContent : "";
loc.innerHTML = `<span class="loc-page">${pageName}${projectName}</span><span class="loc-sec"></span><span class="loc-pct">00%</span>`;
document.body.appendChild(loc);
const secEl = loc.querySelector(".loc-sec"), pctEl = loc.querySelector(".loc-pct");

// every section that starts with a grey label becomes a named stop
const stops = [...document.querySelectorAll("section, .row")].map(s => {
  const l = s.querySelector(":scope > .label, :scope .c1-3.label, :scope > div > .label, :scope .when");
  return l && s.matches("section") ? { el: s, name: l.textContent.trim() } : null;
}).filter(Boolean);
let current = "";
function updateLocator() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
  bar.style.transform = `scaleX(${p})`;
  pctEl.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
  let name = "";
  stops.forEach(s => { if (s.el.getBoundingClientRect().top < innerHeight * 0.45) name = s.name; });
  if (name !== current) {
    current = name; secEl.classList.add("swap");
    setTimeout(() => { secEl.textContent = name ? "— " + name : ""; secEl.classList.remove("swap"); }, 150);
  }
}
addEventListener("scroll", () => requestAnimationFrame(updateLocator), { passive: true });
updateLocator();

/* ---------- 8. page transitions: panel wipes between pages ---------- */
if (!reduceMotion) {
  const wipe = document.createElement("div"); wipe.className = "wipe";
  wipe.textContent = pageName;
  document.body.appendChild(wipe);
  requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add("out")));   // reveal this page
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) return;
    e.preventDefault();
    const label = (a.querySelector(".name") || a).textContent.replace(/next project →/, "").trim().split("\n")[0];
    wipe.textContent = label.length < 40 ? label : "";
    wipe.classList.remove("out"); wipe.classList.add("in-from-below");
    requestAnimationFrame(() => requestAnimationFrame(() => { wipe.classList.remove("in-from-below"); }));
    setTimeout(() => { location.href = a.href; }, 650);
  });
  addEventListener("pageshow", e => { if (e.persisted) wipe.classList.add("out"); });   // back button
}

/* ---------- 9. gentle parallax on images and video ---------- */
const para = [...document.querySelectorAll(".img-box img, .media img, .media video")];
function parallax() {
  para.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;   // -1 … 1
    el.style.translate = `0 ${(-t * 30).toFixed(1)}px`;
  });
}
if (!reduceMotion) { addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true }); parallax(); }

/* ---------- 10. screen filmstrip: drag to scroll + counter ---------- */
document.querySelectorAll(".strip").forEach(strip => {
  const count = strip.parentElement.querySelector(".strip-count");
  const figs = strip.querySelectorAll("figure");
  let down = false, sx = 0, sl = 0;
  strip.addEventListener("pointerdown", e => { down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add("dragging"); });
  addEventListener("pointerup", () => { down = false; strip.classList.remove("dragging"); });
  strip.addEventListener("pointermove", e => { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
  strip.addEventListener("scroll", () => {
    const w = figs[0].getBoundingClientRect().width + 24;
    const i = Math.min(figs.length, Math.round(strip.scrollLeft / w) + 1);
    if (count) count.textContent = String(i).padStart(2, "0") + " / " + String(figs.length).padStart(2, "0");
  }, { passive: true });
});

/* ---------- 11. scroll-scrubbed frames: .scrub swaps its images as you scroll through it ---------- */
document.querySelectorAll(".scrub").forEach(sc => {
  const frames = [...sc.querySelectorAll(".scrub-frames img")];
  const count = sc.querySelector(".scrub-count");
  let shown = 0;
  function scrub() {
    const r = sc.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = Math.min(Math.max(-r.top / span, 0), 1);
    const i = Math.min(frames.length - 1, Math.floor(p * frames.length));
    if (i !== shown) {
      frames[shown].classList.remove("on"); frames[i].classList.add("on"); shown = i;
      if (count) count.textContent = String(i + 1).padStart(2, "0") + " / " + String(frames.length).padStart(2, "0");
    }
  }
  addEventListener("scroll", () => requestAnimationFrame(scrub), { passive: true });
  scrub();
});

/* ---------- 12. topic circles: area = annual topic weight ----------
   step 1: when the section pins to the screen, a hand slides in from the right, tosses the circles out of its
           palm like dice and slides back out (plays once, on its own, ~3 seconds). the circles keep their 2000
           sizes and values; only their position moves.
   step 2: only after every circle has landed and the hand is gone does scrolling step through 2000 -> 2023. */
document.querySelectorAll(".bubbles").forEach(box => {
  const data = JSON.parse(box.dataset.bubbles);
  const years = data.end - data.start;                       // 23 steps: 2000 -> 2023
  const yearEl = box.querySelector(".bub-year");
  const rows = box.querySelector(".bub-rows");
  const hand = box.querySelector(".hand");
  const closed = hand && hand.querySelector(".hand-closed"), open = hand && hand.querySelector(".hand-open");
  const TOSS_MS = 3000;                                      // length of the toss animation
  const HOLD = 0.6;                                          // screens of scroll that stay on 2000 before the years start
  const PALM = { x: 0.36, y: 0.64 };                         // where the circles leave the open hand (fraction of the hand box)
  const maxW = Math.max(...data.topics.flatMap(t => t.w));   // largest weight across all topics & years
  const groups = [["largest increases", data.topics.filter(t => t.pp > 0)], ["largest decreases", data.topics.filter(t => t.pp < 0)]];
  const balls = [];
  groups.forEach(([label, list]) => {
    const l = document.createElement("div"); l.className = "bub-rowlabel"; l.textContent = label; rows.appendChild(l);
    const row = document.createElement("div"); row.className = "bub-row"; rows.appendChild(row);
    list.forEach(t => {
      const cell = document.createElement("div"); cell.className = "bub-cell";
      const stage = document.createElement("div"); stage.className = "bub-stage";
      const b = document.createElement("div"); b.className = "bub"; b.style.background = t.color;
      b.innerHTML = `<span class="bt">T${t.t}</span><span class="bw"></span>`;
      stage.appendChild(b);
      const name = document.createElement("div"); name.className = "bub-name"; name.textContent = t.name.replace("&amp;", "&");
      const pp = document.createElement("div"); pp.className = "bub-pp"; pp.style.color = t.color;
      pp.textContent = (t.pp > 0 ? "+" : "") + t.pp.toFixed(2) + " pp";
      cell.append(stage, name, pp); row.appendChild(cell);
      balls.push({ t, b, stage, w: b.querySelector(".bw"), name, pp });
    });
  });

  const clamp = v => Math.min(Math.max(v, 0), 1);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const bounce = t => {                                       // lands, then two small hops, like a die settling
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  };

  // state: "waiting" (circles hidden) -> "tossing" -> "done" (hand removed, years follow the scroll)
  let state = hand && !reduceMotion ? "waiting" : "done";
  function finish() {
    state = "done";
    if (hand) hand.style.display = "none";
    balls.forEach(o => { o.b.style.transform = ""; o.b.style.opacity = 1; o.name.style.opacity = o.pp.style.opacity = 1; });
    draw();
  }

  function toss(q) {                                          // q: 0 -> 1 through the toss
    // hand: slide in (0-.25), wind up (.25-.35), open + flick (.35-.45), hold, slide out (.7-.95)
    const inX = 1 - easeInOut(clamp(q / .25)), outX = easeInOut(clamp((q - .7) / .25));
    const x = Math.max(inX, outX) * 115;                      // % of the hand's own width, pushed off the right edge
    const wind = clamp((q - .25) / .1), flick = clamp((q - .35) / .1);
    const rot = -7 * easeOut(wind) * (1 - flick) + 5 * easeOut(flick) * (1 - outX);
    const isOpen = q >= .35;
    [closed, open].forEach(img => { img.style.transform = `translateX(${x}%) rotate(${rot}deg)`; img.style.transformOrigin = "95% 15%"; });
    closed.style.opacity = isOpen ? 0 : 1; open.style.opacity = isOpen ? 1 : 0;

    // circles: each one leaves the palm a beat after the last, arcs out and bounces into its spot
    const hr = hand.getBoundingClientRect();
    const px = hr.left + hr.width * PALM.x, py = hr.top + hr.height * PALM.y;
    const order = [3, 0, 4, 1, 5, 2];                         // alternate rows so they scatter like a real throw
    balls.forEach((o, k) => {
      const start = .37 + order.indexOf(k) * .035, t = clamp((q - start) / .4);
      const sr = o.stage.getBoundingClientRect();
      const dx = px - (sr.left + sr.width / 2), dy = py - (sr.top + sr.height / 2);
      const lift = Math.min(innerHeight * .18, 160) * Math.sin(Math.PI * easeOut(t)) * (1 - t);
      o.b.style.transform = t < 1 ? `translate(${dx * (1 - easeOut(t))}px, ${dy * (1 - bounce(t)) - lift}px)` : "";
      o.b.style.opacity = t > 0 ? 1 : 0;
      o.name.style.opacity = o.pp.style.opacity = clamp((t - .7) / .3);
    });
  }

  function play() {
    state = "tossing";
    const t0 = performance.now();
    (function frame(now) {
      const q = clamp((now - t0) / TOSS_MS);
      toss(q);
      if (q < 1) requestAnimationFrame(frame); else finish();
    })(t0);
  }

  function draw() {
    const r = box.getBoundingClientRect();
    const hold = innerHeight * HOLD;
    const p = clamp((-r.top - hold) / (r.height - innerHeight - hold));   // 0 until the hold is scrolled past
    const i = state === "done" ? Math.min(years, Math.floor(p * (years + 1))) : 0;   // 2000 until the toss is finished
    yearEl.textContent = data.start + i;
    const stageH = balls[0].stage.clientHeight, stageW = balls[0].stage.clientWidth;
    const rMax = Math.max(20, Math.min(stageH, stageW) / 2 - 4);
    balls.forEach(o => {
      const d = 2 * rMax * Math.sqrt(o.t.w[i] / maxW);       // area ∝ that year's real weight (CSS eases between years)
      o.b.style.width = o.b.style.height = d + "px";
      o.w.textContent = o.t.w[i].toFixed(2) + "%";           // label always shows the exact value for the displayed year
    });
    if (state === "waiting") {
      if (r.top <= innerHeight * 0.05 && r.bottom > innerHeight) play();   // section is pinned: start the toss
      else if (r.bottom <= innerHeight) finish();             // already scrolled past it (e.g. page reloaded lower down)
    }
  }

  if (state === "waiting") {
    balls.forEach(o => { o.b.style.opacity = 0; o.name.style.opacity = o.pp.style.opacity = 0; });
  } else if (hand) hand.style.display = "none";
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", draw);
  draw();
});

/* ---------- 13. dashboards don't grab the scroll wheel: click to use, move the mouse away to release ---------- */
document.querySelectorAll(".embed").forEach(box => {
  if (!box.querySelector("iframe")) return;
  const shield = document.createElement("button");
  shield.className = "embed-shield"; shield.type = "button";
  shield.innerHTML = "<span>click to explore the dashboard</span>";
  box.appendChild(shield);
  shield.addEventListener("click", () => box.classList.add("live"));
  box.addEventListener("mouseleave", () => box.classList.remove("live"));
});

/* ---------- footer year ---------- */
document.querySelectorAll(".year-now").forEach(el => el.textContent = new Date().getFullYear());
