// della wirfel — site motion. no libraries.
// 1. giant name on the home page: letters rise in, then the name shrinks into the header as you scroll
// 2. anything with class="reveal" fades up when it scrolls into view
// 3. project list: filter buttons + an image that follows your cursor
// 4. embeds: tableau (or any iframe link) via <div class="embed" data-src="...">

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
    c.textContent = ch === " " ? " " : ch;
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

/* ---------- 4. embeds: <div class="embed" data-src="..."> ---------- */
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

/* ---------- footer year ---------- */
document.querySelectorAll(".year-now").forEach(el => el.textContent = new Date().getFullYear());
