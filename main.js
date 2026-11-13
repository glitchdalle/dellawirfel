// della wirfel — site motion. no libraries.
// 1. giant name on the home page: letters rise in, then the name shrinks into the header as you scroll
// 2. anything with class="reveal" fades up when it scrolls into view
// 3. project list: filter buttons + an image that follows your cursor
// 4+. embeds, title letters, page wipe, locator, parallax, filmstrip, scroll-scrubbed frames

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. hero name ---------- */
const heroName = document.querySelector(".hero-name");
if (heroName) {
  // split the text into letters so each one can animate
  const text = heroName.textContent.trim();
  heroName.innerHTML = "";
  [...text].forEach((ch, i) => {
    const mask = document.createElement("span");
    mask.className = "mask";
    const c = document.createElement("span");
    c.className = "char";
    c.textContent = ch === " " ? " " : ch;
    c.style.animationDelay = (i * 0.045) + "s";
    mask.appendChild(c);
    heroName.appendChild(mask);
  });

  const logo = document.querySelector(".logo");
  const pad = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad"));
  const ease = t => 1 - Math.pow(1 - t, 3);

  function place() {
    const vh = window.innerHeight;
    const h = heroName.offsetHeight;
    const bigSize = parseFloat(getComputedStyle(heroName).fontSize);
    const smallSize = parseFloat(getComputedStyle(logo).fontSize) * 1.25;
    const endScale = smallSize / bigSize;

    const startY = vh - h - pad();          // sits at the bottom of the screen
    const r = logo.getBoundingClientRect();
    const endY = r.top + (r.height - h * endScale) / 2;   // lines up with the header logo
    const p = reduceMotion ? 1 : ease(Math.min(window.scrollY / (vh * 0.75), 1));

    const y = startY + (endY - startY) * p;
    const s = 1 + (endScale - 1) * p;
    heroName.style.transform = `translate3d(0, ${y}px, 0) scale(${s})`;
    // tighten the letter-spacing a touch as it shrinks
    heroName.style.letterSpacing = (-0.055 + 0.04 * p) + "em";
  }
  place();
  window.addEventListener("scroll", () => requestAnimationFrame(place), { passive: true });
  window.addEventListener("resize", place);
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

/* ---------- embeds: <div class="embed" data-src="..."> ---------- */
document.querySelectorAll(".embed").forEach(box => {
  let src = (box.dataset.src || "").trim();
  if (!src) { box.textContent = "paste a tableau public link into data-src"; return; }
  // turn a normal tableau public link into its embeddable version
  if (src.includes("public.tableau.com")) {
    const m = src.match(/viz\/([^/?#]+)\/([^/?#]+)/) || src.match(/views\/([^/?#]+)\/([^/?#]+)/);
    if (m) src = `https://public.tableau.com/views/${m[1]}/${m[2]}?:showVizHome=no&:embed=true&:toolbar=no`;
  }
  const f = document.createElement("iframe");
  f.src = src; f.loading = "lazy"; f.allowFullscreen = true;
  f.style.height = (box.dataset.height || 600) + "px";
  box.innerHTML = ""; box.appendChild(f);
});

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

/* ---------- 12. topic circles: area = annual topic weight, scrubbed year by year as you scroll ---------- */
document.querySelectorAll(".bubbles").forEach(box => {
  const data = JSON.parse(box.dataset.bubbles);
  const years = data.end - data.start;                       // 23 steps: 2000 -> 2023
  const yearEl = box.querySelector(".bub-year");
  const rows = box.querySelector(".bub-rows");
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
      balls.push({ t, b, stage, w: b.querySelector(".bw") });
    });
  });
  function draw() {
    const r = box.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
    const i = Math.min(years, Math.floor(p * (years + 1)));  // the year shown (each year gets an equal slice of the scroll)
    yearEl.textContent = data.start + i;
    const stageH = balls[0].stage.clientHeight, stageW = balls[0].stage.clientWidth;
    const rMax = Math.max(20, Math.min(stageH, stageW) / 2 - 4);
    balls.forEach(o => {
      const d = 2 * rMax * Math.sqrt(o.t.w[i] / maxW);       // area ∝ that year's real weight (CSS eases between years)
      o.b.style.width = o.b.style.height = d + "px";
      o.w.textContent = o.t.w[i].toFixed(2) + "%";           // label always shows the exact value for the displayed year
    });
  }
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", draw);
  draw();
});

/* ---------- footer year ---------- */
document.querySelectorAll(".year-now").forEach(el => el.textContent = new Date().getFullYear());
