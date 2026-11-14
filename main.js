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
// image blocks: big files can take a few seconds. the box keeps its exact size and shows a soft grey pulse
// until the picture has actually arrived, then the picture fades in (if the file fails, the pulse just stops).
document.querySelectorAll(".media img, .img-box img").forEach(img => {
  if (img.complete && img.naturalWidth) return;
  const box = img.closest(".media, .img-box"); box.classList.add("wait");
  const done = () => box.classList.remove("wait");
  img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true });
});
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (el.dataset.delay || 0) + "s";
  io.observe(el);
});
// safety net: a fast flick or a jump (back button, anchor) can carry a block past the screen without the
// observer ever catching it. anything whose top is already above the bottom of the screen gets revealed.
let revealQueued = false;
function revealPassed() {
  revealQueued = false;
  document.querySelectorAll(".reveal:not(.in)").forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight * 0.9) { el.classList.add("in"); io.unobserve(el); }
  });
}
addEventListener("scroll", () => { if (!revealQueued) { revealQueued = true; requestAnimationFrame(revealPassed); } }, { passive: true });
addEventListener("load", revealPassed);

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

/* ---------- 8. page transitions: panel wipes between pages ----------
   going to a project with a cover, the panel shows only that image (and shows it again as the new page opens).
   otherwise the panel is black with the page's title, set exactly like that page's own title (same size, weight
   and place), so the title seems to stay put as the page appears underneath. */
const SITE_ROOT = document.currentScript ? new URL(".", document.currentScript.src) : new URL("./", location.href);
const COVERS = {                                        // slug: [image, "cover" (full bleed) | "contain" (on white) | "blank"]
  "remi": ["remi-mockup.jpg", "cover"],
  "timeless": ["images/web/timeless-9.png", "contain"],
  "joanna-vargas-brand": ["images/web/Feed_IDEAL.JV.jpg", "cover"],
  "youth-aging": ["images/web/mockuptryptic.jpg", "cover"],
  "cuny-dissertations": ["images/cuny-wipe.svg", "contain"],
  "global-city-clusters": ["images/kmeans-thumb.svg", "contain"],
  "health-app": ["", "blank"],                          // plain black, no title, for now
};
const slugOf = url => { const m = new URL(url, location.href).pathname.match(/\/projects\/([^/]+)\.html$/); return m ? m[1] : ""; };
const coverURL = slug => COVERS[slug] && COVERS[slug][0] ? new URL(COVERS[slug][0], SITE_ROOT).href : "";
// which title style the destination page uses: project pages and the projects list (big, bold),
// about / contact (smaller, light), home (the name)
function titleKind(url) {
  const p = new URL(url, location.href).pathname;
  if (FIRST[slugOf(url)]) return FIRST[slugOf(url)][1];
  if (/\/about\.html$/.test(p)) return "t-info";
  if (/\/contact\.html$/.test(p)) return "t-contact";
  if (/\/(index\.html)?$/.test(p)) return "t-home";
  return "t-page";
}
// pages that open on a scroll story: their first heading is the story's opening line, not the page title
const FIRST = { "nyc-311-housing": ["a city of complaints.", "t-sky"] };
// a link's visible title, without list numbers or "next project" labels
function titleOf(a) {
  if (a.querySelector(".name")) return a.querySelector(".name").textContent.trim();
  const c = a.cloneNode(true);
  c.querySelectorAll(".label").forEach(n => n.remove());
  c.querySelectorAll("span").forEach(n => { if (/^\s*\d+\s*$/.test(n.textContent)) n.remove(); });
  return c.textContent.replace(/\s+/g, " ").trim();
}
const warmed = new Set();
function warm(slug) {                                   // fetch a cover before it's needed (hover, touch, focus)
  const u = coverURL(slug); if (!u || warmed.has(u)) return; warmed.add(u); new Image().src = u;
}
if (!reduceMotion) {
  const wipe = document.createElement("div"); wipe.className = "wipe";
  wipe.innerHTML = `<div class="wipe-img"></div><span class="wipe-label"></span>`;
  const wImg = wipe.querySelector(".wipe-img"), wLabel = wipe.querySelector(".wipe-label");
  function dress(label, url) {
    const slug = slugOf(url), cv = COVERS[slug], u = coverURL(slug);
    const first = FIRST[slug];
    wLabel.textContent = cv ? "" : first ? first[0] : (titleKind(url) === "t-home" ? "della wirfel" : label);   // covers carry no text
    wLabel.className = "wipe-label " + titleKind(url);
    wipe.classList.toggle("has-img", !!u);
    wipe.classList.toggle("light", !!u && cv[1] === "contain");
    wImg.classList.remove("ready"); wImg.style.backgroundImage = "";
    if (!u) return;
    wImg.style.backgroundImage = `url("${u}")`;
    const im = new Image(); im.onload = () => wImg.classList.add("ready"); im.src = u;   // fades in once it's there
    if (im.complete) wImg.classList.add("ready");
  }
  const h1 = document.querySelector(".page-title");
  dress(h1 ? h1.textContent.trim() : pageName, location.href);
  document.body.appendChild(wipe);
  requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add("out")));   // reveal this page
  // warm a project's cover as soon as someone points at (or touches) a link to it
  ["pointerenter", "focusin", "touchstart"].forEach(ev => document.addEventListener(ev, e => {
    const a = e.target.closest && e.target.closest("a[href]"); if (a) warm(slugOf(a.href));
  }, { passive: true, capture: true }));
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) return;
    e.preventDefault();
    const label = titleOf(a);
    dress(label.length < 60 ? label : "", url.href);
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

/* ---------- 14. design-choice experiment (reframing the same body) ----------
   the same nine numbers, with four design choices applied one at a time as you scroll:
   01 missing months labeled -> dropped, 02 calendar order -> ascending, 03 warning color -> reward color,
   04 emphasis on the low -> the peak. the values themselves never change. */
document.querySelectorAll(".reorder").forEach(box => {
  const D = JSON.parse(box.dataset.reorder);
  const chart = box.querySelector(".ro-chart");
  const levers = [...box.querySelectorAll(".ro-levers li:not(.ro-reads):not(.ro-zero)")];
  const wordA = box.querySelector(".ro-a"), wordB = box.querySelector(".ro-b");
  const items = D.months.map((m, i) => ({ m, v: D.steps[i], cal: i }));
  const valid = items.filter(it => it.v != null);
  valid.forEach((it, k) => it.cal9 = k);                                          // calendar position once gaps are dropped
  [...valid].sort((a, b) => a.v - b.v).forEach((it, k) => it.rank = k);           // position in ascending order
  const max = Math.max(...valid.map(it => it.v));
  const low = valid.reduce((a, b) => (b.v < a.v ? b : a)), high = valid.reduce((a, b) => (b.v > a.v ? b : a));
  const WARN = [184, 92, 80], REWARD = [58, 128, 90], NEUTRAL = [150, 150, 150];
  const rgb = (A, B, t) => `rgb(${A.map((c, i) => Math.round(c + (B[i] - c) * t)).join(",")})`;
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const STAGES = [[.06, .26], [.26, .5], [.5, .68], [.68, .86]];                  // scroll ranges for choices 01-04
  items.forEach(it => {
    const el = document.createElement("div"); el.className = "ro-bar" + (it.v == null ? " missing" : "");
    el.innerHTML = `<span class="ro-val"></span><span class="ro-fill"></span><span class="ro-m">${it.m}</span>`;
    chart.appendChild(el); it.el = el; it.fill = el.querySelector(".ro-fill"); it.val = el.querySelector(".ro-val");
  });
  function draw() {
    const r = box.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const st = STAGES.map(([a, b]) => ease(clamp((p - a) / (b - a))));           // progress of each choice, 0 -> 1
    const [sMiss, sOrder, sColor, sEmph] = st;
    const W = chart.clientWidth, H = chart.clientHeight - 26;
    const compact = W / 11 < 64;
    const slot = n => W / n, gap = n => Math.max(6, W / n * .34);              // slim bars, generous gaps
    items.forEach(it => {
      if (it.v == null) {                                                         // 01: labeled gap, then dropped
        const h = H * .2, x = it.cal * slot(11);
        it.el.style.transform = `translateX(${x}px)`; it.el.style.width = slot(11) - gap(11) + "px";
        it.fill.style.height = h + "px"; it.val.style.bottom = h + 6 + "px"; it.val.textContent = compact ? "n/a" : "no data";
        it.el.style.opacity = 1 - sMiss;
        return;
      }
      const x11 = it.cal * slot(11), x9 = it.cal9 * slot(9), xs = it.rank * slot(9);
      const xCal = x11 + (x9 - x11) * sMiss;                                      // gaps close as the missing months drop
      const x = xCal + (xs - xCal) * sOrder;                                      // 02: calendar -> ascending
      const w = (slot(11) - gap(11)) + ((slot(9) - gap(9)) - (slot(11) - gap(11))) * sMiss;
      const h = Math.max(2, H * .9 * it.v / max);
      it.el.style.transform = `translateX(${x}px)`; it.el.style.width = w + "px";
      it.fill.style.height = h + "px";
      // 03: color. before: neutral grey with the warning color on the low; after: every bar in the reward color
      const base = it === low ? rgb(NEUTRAL, WARN, 1) : rgb(NEUTRAL, NEUTRAL, 0);
      it.fill.style.background = sColor > 0 ? (it === low ? rgb(WARN, REWARD, sColor) : rgb(NEUTRAL, REWARD, sColor)) : base;
      // 04: emphasis moves from the lowest month to the highest
      const focus = sEmph < .5 ? low : high;
      it.val.style.bottom = h + 6 + "px";
      it.val.textContent = compact ? Math.round(it.v / 1000) + "k" : it.v.toLocaleString("en-US");
      it.el.classList.toggle("hl", it === focus);
      it.el.classList.toggle("dim", sEmph > 0 && sEmph < 1 ? false : it !== focus);
    });
    levers.forEach((li, k) => { li.style.setProperty("--p", st[k]); li.classList.toggle("on", st[k] > .5); });
    const tw = ease(clamp((p - .5) / .36));                                       // the reading flips as the choices stack up
    wordA.style.transform = `translateY(${-tw * 110}%)`;
    wordB.style.transform = `translateY(${(1 - tw) * 110}%)`;
  }
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", draw);
  draw();
});

/* ---------- 15. layered 311 map (NYC 311 page) ----------
   circles sit at tableau's own latitude/longitude for each zip; nothing is recalculated.
   scroll adds one complaint type at a time, each new layer drawn on top of the last. */
document.querySelectorAll(".map311").forEach(box => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = box.querySelector("svg"), mapEl = box.querySelector(".map311-map");
  const BORO = { X: "bronx", K: "brooklyn", M: "manhattan", Q: "queens", S: "staten island" };
  const LAYERS = [
    { k: "h", name: "heat / hot water", tab: "Heat / Hot Water", color: "#E8956A" },
    { k: "u", name: "unsanitary condition", tab: "Unsanitary Condition", color: "#DA5F9C" },
    { k: "r", name: "rodent", tab: "Rodent", color: "#6E6E6E" },
    { k: "m", name: "mold", tab: "Mold", color: "#4A78B5" },
  ];
  const bar = JSON.parse(box.dataset.bar);
  const zips = box.dataset.zips.split(";").map(z => {
    const [head, vals] = z.split(":"); const [zip, lat, lon] = head.split(",");
    return { zip, lat: +lat, lon: +lon, vals: vals.split(",").map(v => ({ b: v[0], t: v[1], n: +v.slice(2) })) };
  }).filter(z => z.lat > 40.4 && z.lat < 41 && z.lon > -74.3 && z.lon < -73.6);   // in the city (drops zip 12345)
  const pts = [];
  zips.forEach(z => z.vals.forEach(v => pts.push({ zip: z.zip, lat: z.lat, lon: z.lon, b: v.b, t: v.t, n: v.n })));
  LAYERS.forEach(L => {
    L.pts = pts.filter(p => p.t === L.k).sort((a, b) => b.n - a.n);                   // big circles underneath small ones
    L.top = L.pts[0];                                                                 // busiest zip for this complaint type
    L.boro = bar.filter(r => r[1] === L.tab).map(r => [r[0].toLowerCase(), r[2]]).sort((a, b) => b[1] - a[1]);
    L.g = document.createElementNS(NS, "g"); svg.appendChild(L.g);
    L.pts.forEach(p => { const c = document.createElementNS(NS, "circle"); c.setAttribute("fill", L.color); L.g.appendChild(c); p.c = c; });
  });
  // side panel
  const list = box.querySelector(".m3-layers"), detail = box.querySelector(".m3-detail");
  LAYERS.forEach((L, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="lv-n">0${i + 1}</span><span class="lv-name"><i style="background:${L.color}"></i>${L.name}</span>`;
    list.appendChild(li); L.li = li;
  });
  let shownDetail = -1;
  function showDetail(i) {
    if (i === shownDetail) return; shownDetail = i;
    if (i < 0) { detail.innerHTML = ""; return; }
    const L = LAYERS[i], max = L.boro[0][1];
    detail.innerHTML = `<p class="m3-k">${L.name}: complaints by borough</p>` +
      L.boro.map(([b, n]) => `<div class="m3-row"><span>${b}</span><span class="m3-bar"><i style="width:${n / max * 100}%;background:${L.color}"></i></span><span>${n.toLocaleString("en-US")}</span></div>`).join("") +
      `<p class="m3-k" style="margin-top:14px">busiest zip</p><p class="m3-top">${L.top.zip} <span>${BORO[L.top.b]} &middot; ${L.top.n.toLocaleString("en-US")}</span></p>`;
  }
  // projection: tableau's lat/lon onto the box, keeping the city's proportions
  let W = 0, H = 0, proj;
  function layout() {
    W = mapEl.clientWidth; H = mapEl.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    const lats = zips.map(z => z.lat), lons = zips.map(z => z.lon);
    const la0 = Math.min(...lats), la1 = Math.max(...lats), lo0 = Math.min(...lons), lo1 = Math.max(...lons);
    const k = Math.cos((la0 + la1) / 2 * Math.PI / 180), pad = 28;
    const s = Math.min((W - pad * 2) / ((lo1 - lo0) * k), (H - pad * 2) / (la1 - la0));
    const ox = (W - (lo1 - lo0) * k * s) / 2, oy = (H - (la1 - la0) * s) / 2;
    proj = (lat, lon) => [ox + (lon - lo0) * k * s, oy + (la1 - lat) * s];
    const rMax = Math.max(10, Math.min(W, H) * .055);
    LAYERS.forEach(L => L.pts.forEach(p => {
      const [x, y] = proj(p.lat, p.lon); p.c.setAttribute("cx", x); p.c.setAttribute("cy", y);
      p.r = rMax * Math.sqrt(p.n / L.top.n);                                             // circle area follows the count
      p.d = (x / W) * .5;                                                                 // sweep west -> east as a layer arrives
    }));
  }
  const clamp = v => Math.min(Math.max(v, 0), 1);
  const ease = t => 1 - Math.pow(1 - t, 3);
  const STAGES = [[.04, .2], [.24, .42], [.46, .64], [.68, .86]];
  function draw() {
    const r = box.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const st = STAGES.map(([a, b]) => clamp((p - a) / (b - a)));
    let active = -1;
    LAYERS.forEach((L, i) => {
      if (st[i] > 0) active = i;
      const later = st.slice(i + 1).reduce((m, v) => Math.max(m, v), 0);                 // dim once the next layer arrives
      L.g.setAttribute("opacity", (1 - later * .6).toFixed(3));
      L.pts.forEach(pt => { const t = ease(clamp((st[i] - pt.d) / .5)); pt.c.setAttribute("r", (pt.r * t).toFixed(2)); });
      L.li.classList.toggle("on", st[i] > 0); L.li.classList.toggle("cur", i === active);
      L.li.style.setProperty("--p", st[i]);
    });
    showDetail(active);
  }
  layout();
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", () => { layout(); draw(); });
  draw();
});

/* ---------- projects menu: loads menu.js (the drop-down under "projects" in the header) ---------- */
if (document.currentScript) {
  const m = document.createElement("script"); m.src = new URL("menu.js?v=1", document.currentScript.src).href; m.defer = true;
  document.head.appendChild(m);
}

/* ---------- global cities page: the five-cluster key under the map (kmkey.js) ---------- */
if (document.currentScript && document.querySelector(".kmap")) {
  const k = document.createElement("script"); k.src = new URL("kmkey.js?v=1", document.currentScript.src).href; k.defer = true;
  document.head.appendChild(k);
}

/* ---------- footer year ---------- */
document.querySelectorAll(".year-now").forEach(el => el.textContent = new Date().getFullYear());
