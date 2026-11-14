// della wirfel — sound toggle for videos with audio (timeless page).
// browsers only allow videos to autoplay muted, so each .media video with data-sound gets a small button to turn sound on/off.
(function () {
  const css = document.createElement("style");
  css.textContent = `
    .vsound { position: absolute; z-index: 3; right: 16px; bottom: 16px; display: flex; align-items: center; gap: 8px;
      font: inherit; font-size: 12px; text-transform: inherit; color: #fff; background: rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.35);
      border-radius: 999px; padding: 6px 12px 7px; cursor: pointer; backdrop-filter: blur(6px); transition: background .25s, border-color .25s; }
    .vsound:hover { background: rgba(0,0,0,.8); border-color: #fff; }
    .vsound i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.4); transition: background .25s; }
    .vsound.on i { background: #ff3b00; }`;
  document.head.appendChild(css);
  document.querySelectorAll(".media video[data-sound]").forEach(v => {
    const box = v.parentElement;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "vsound";
    const paint = () => { btn.classList.toggle("on", !v.muted); btn.innerHTML = `<i></i>${v.muted ? "sound on" : "sound off"}`; btn.setAttribute("aria-pressed", String(!v.muted)); };
    btn.addEventListener("click", () => {
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = v.currentTime; v.play().catch(() => {}); }
      paint();
    });
    paint(); box.appendChild(btn);
  });
})();
