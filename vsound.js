// della wirfel — sound toggle for videos with audio (timeless page).
// browsers only allow videos to autoplay muted, so each .media video with data-sound gets a small button to turn sound on/off,
// and a clickable note near the top of the page asks people to turn the sound on (it turns it on and scrolls to the video).
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
    @media (max-width: 760px) { .vsound-ask { top: 66px; font-size: 12px; padding: 6px 12px 7px; } }`;
  document.head.appendChild(css);
  const vids = [...document.querySelectorAll(".media video[data-sound]")];
  let ask = null;
  if (vids.length) {
    ask = document.createElement("button");
    ask.type = "button"; ask.className = "vsound-ask";
    ask.innerHTML = `<span class="bars"><i></i><i></i><i></i></span>turn on sound for the video`;
    ask.addEventListener("click", () => {
      const v = vids[0];
      v.muted = false; v.play().catch(() => {});
      v.dispatchEvent(new Event("volumechange"));
      v.scrollIntoView({ behavior: "smooth", block: "center" });
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
