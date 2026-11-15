// della wirfel — home page: the page keeps going. past the selected work (and the footer), a last stretch of scroll
// shows the first selected project coming up; scroll to the very end and it opens, with the usual page wipe.
(function () {
  const first = document.querySelector(".plist li a");
  if (!first) return;
  const name = (first.querySelector(".name") || first).textContent.trim();
  const css = document.createElement("style");
  css.textContent = `
    .pull { height: 180vh; position: relative; border-top: 1px solid var(--line, #000); margin: 0 var(--pad, 24px); }
    .pull-in { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; }
    .pull .label { font-size: 13px; color: var(--muted, #8a8a8a); }
    .pull-link { display: block; font-size: 12vw; font-weight: 300; letter-spacing: -0.045em; line-height: .9; margin: 10px 0 22px;
      opacity: calc(.15 + var(--p, 0) * .85); transform: translateY(calc((1 - var(--p, 0)) * 60px)); }
    .pull-bar { height: 2px; background: #e6e6e6; position: relative; overflow: hidden; }
    .pull-bar i { position: absolute; inset: 0; background: var(--accent, #ff3b00); transform-origin: 0 0; transform: scaleX(var(--p, 0)); }
    .pull-hint { margin-top: 10px; font-size: 13px; color: var(--muted, #8a8a8a); display: flex; justify-content: space-between; }
    @media (max-width: 760px) { .pull-link { font-size: 18vw; } }`;
  document.head.appendChild(css);
  const zone = document.createElement("section");
  zone.className = "pull"; zone.setAttribute("aria-label", "next project");
  zone.innerHTML = `<div class="pull-in"><p class="label">keep going: selected work 01</p>
    <a class="pull-link" href="${first.getAttribute("href")}">${name}</a>
    <div class="pull-bar"><i></i></div><p class="pull-hint"><span>keep scrolling to open it</span><span>&darr;</span></p></div>`;
  document.body.appendChild(zone);                                               // after the footer: the footer stays reachable
  const link = zone.querySelector(".pull-link");
  let fired = false;
  function onScroll() {
    const r = zone.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * .6 - r.top) / (r.height - innerHeight * .4), 0), 1);   // 0 as it comes up, 1 at the very end
    zone.style.setProperty("--p", p.toFixed(3));
    if (!fired && r.bottom <= innerHeight + 2 && r.top < innerHeight * .2) { fired = true; link.click(); }   // reached the very end
  }
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener("pageshow", e => { if (e.persisted) { fired = false; scrollBy(0, -innerHeight * .5); } });   // came back: step off the edge
  onScroll();
})();
