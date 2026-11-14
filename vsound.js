// della wirfel — sound toggle for videos with audio (timeless page).
// browsers only allow videos to autoplay muted, so each .media video with data-sound gets a small button to turn sound on/off,
// and a clickable note near the top of the page asks people to turn the sound on (it turns it on and scrolls to the video).
// the video also "holds" the page: it pins in place for a stretch of scrolling, eases up to full size as a dark stage
// fades in around it. nothing ever pulls the page back: there's no scroll snapping, the hold is short, a line along the
// bottom fills as you scroll through it, and a "scroll to keep going" button (or the esc key) skips straight past it.
(function () {
  const css = document.createElement("style");
  css.textContent = `
    .vsound { position: absolute; z-index: 3; right: 16px; bottom: 16px; display: flex; align-items: center; gap: 8px;
      font: inherit; font-size: 12px; text-transform: inherit; color: #fff; background: rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.35);
      border-radius: 999px; padding: 6px 12px 7px; cursor: pointer; backdrop-filter: blur(6px); transition: background .25s, border-color .25s; }
    .vsound:hover { background: rgba(0,0,0,.8); border-color: #fff; }
    .vsound i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.4); transition: background .25s; }
    .vsound.on i { background: #ff3b00; }
    .vsound-ask { position: fixed; z-index: 60; top: 70px; right: var(--pad, 24px); display: flex; align-items: center; gap: 10px;
      font: inherit; font-size: 13px; text-transform: inherit; color: var(--bg, #fff); background: var(--text, #000); border: 0;
      border-radius: 999px; padding: 8px 14px 9px; cursor: pointer; transition: opacity .4s, transform .4s; }
    .vsound-ask:hover { background: #ff3b00; }
    .vsound-ask .bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; }
    .vsound-ask .bars i { width: 2px; background: currentColor; animation: vs-eq 1s ease-in-out infinite; }
    .vsound-ask .bars i:nth-child(2) { animation-delay: -.3s; } .vsound-ask .bars i:nth-child(3) { animation-delay: -.6s; }
    @keyframes vs-eq { 0%, 100% { height: 3px; } 50% { height: 11px; } }
    .vsound-ask.gone { opacity: 0; transform: translateY(-8px); pointer-events: none; }
    .vhold { position: relative; height: 140vh; margin: 48px 0; }
    .vskip { position: absolute; z-index: 4; left: 50%; bottom: 18px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px;
      font: inherit; font-size: 13px; text-transform: inherit; color: #000; background: #fff; border: 0; border-radius: 999px;
      padding: 7px 14px 8px; cursor: pointer; opacity: var(--a,0); transition: background .25s, color .25s; }
    .vskip:hover { background: #ff3b00; color: #fff; }
    @keyframes vs-nudge { 50% { transform: translateY(3px); } }
    .vskip b { display: inline-block; font-weight: 400; font-size: 15px; line-height: 1; animation: vs-nudge 1.4s ease-in-out infinite; }   /* only the arrow bobs */
    /* a thin line along the bottom of the stage fills as you scroll through the hold, so it's clear you're moving */
    .vprog { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: #ff3b00; transform-origin: 0 0;
      transform: scaleX(var(--p,0)); opacity: var(--a,0); }
    .vhold-sticky { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 64px 0 24px; box-sizing: border-box; background: rgba(0,0,0,var(--a,0)); }   /* clears the fixed header */
    .vhold .media { margin: 0; width: 100%; transform: scale(var(--s,.86)); border-radius: var(--r,24px); will-change: transform; }
    .vhold .media video { max-height: calc(100vh - 88px); object-fit: contain; }
    @media (max-width: 760px) { .vsound-ask { top: 66px; font-size: 12px; padding: 6px 12px 7px; } }`;
  document.head.appendChild(css);
  const vids = [...document.querySelectorAll(".media video[data-sound]")];
  // the hold: wrap the first sound video in a tall section with a sticky stage
  let hold = null;
  if (vids.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const media = vids[0].closest(".media");
    hold = document.createElement("div"); hold.className = "vhold";
    const stick = document.createElement("div"); stick.className = "vhold-sticky";
    media.parentNode.insertBefore(hold, media); stick.appendChild(media); hold.append(stick);
    // a way out at any time: "continue" under the video, or the esc key, scrolls just past the hold
    const skip = document.createElement("button"); skip.type = "button"; skip.className = "vskip"; skip.innerHTML = "scroll to keep going <b>&darr;</b>";
    const prog = document.createElement("i"); prog.className = "vprog";
    stick.append(skip, prog);
    const leave = () => scrollTo({ top: hold.getBoundingClientRect().top + scrollY + hold.offsetHeight - innerHeight * .35, behavior: "smooth" });
    skip.addEventListener("click", leave);
    addEventListener("keydown", e => { const r = hold.getBoundingClientRect(); if (e.key === "Escape" && r.top <= 0 && r.bottom >= innerHeight) leave(); });
    const IN = .22, OUT = .8;                                                     // share of the hold spent arriving / leaving
    const smooth = t => t * t * (3 - 2 * t);
    let cur = 0, target = 0, raf = 0;
    const apply = () => {
      cur += (target - cur) * .2;                                                 // a little lag, so it eases rather than tracks
      const a = smooth(Math.min(1, cur / IN)), b = smooth(Math.max(0, (cur - OUT) / (1 - OUT)));
      stick.style.setProperty("--s", (.86 + .14 * a - .08 * b).toFixed(4));
      stick.style.setProperty("--r", (24 * (1 - a) + 16 * b).toFixed(1) + "px");
      stick.style.setProperty("--a", (a * (1 - b)).toFixed(3));
      stick.style.setProperty("--p", cur.toFixed(3));
      if (Math.abs(target - cur) > .0005) raf = requestAnimationFrame(apply); else raf = 0;
    };
    const measure = () => {
      const r = hold.getBoundingClientRect();
      target = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    addEventListener("scroll", measure, { passive: true }); addEventListener("resize", measure); measure();
  }
  let ask = null;
  if (vids.length) {
    ask = document.createElement("button");
    ask.type = "button"; ask.className = "vsound-ask";
    ask.innerHTML = `<span class="bars"><i></i><i></i><i></i></span>turn on sound for the video`;
    ask.addEventListener("click", () => {
      const v = vids[0];
      v.muted = false; v.play().catch(() => {});
      v.dispatchEvent(new Event("volumechange"));
      if (hold) scrollTo({ top: hold.getBoundingClientRect().top + scrollY + .3 * (hold.offsetHeight - innerHeight), behavior: "smooth" });
      else v.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.body.appendChild(ask);
  }
  vids.forEach(v => {
    const box = v.parentElement;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "vsound";
    const paint = () => { btn.classList.toggle("on", !v.muted); btn.innerHTML = `<i></i>${v.muted ? "sound on" : "sound off"}`; btn.setAttribute("aria-pressed", String(!v.muted)); };
    btn.addEventListener("click", () => {
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = v.currentTime; v.play().catch(() => {}); }
      paint();
    });
    v.addEventListener("volumechange", () => { paint(); if (ask && !v.muted) ask.classList.add("gone"); });   // keep button + note in sync
    paint(); box.appendChild(btn);
  });
})();
