// della wirfel — projects menu. loaded by main.js on every page.
// clicking "projects" in the header drops down a panel: selected work (large, emphasized) beside all projects.
// the lists are read from the site's own index.html (selected work) and projects.html (all projects),
// so they always match those pages; nothing to keep in sync here.
(function () {
  const link = [...document.querySelectorAll(".site-header nav a")].find(a => a.textContent.trim() === "projects");
  if (!link) return;
  const root = new URL(".", link.href);                                           // site root, from the projects link
  const css = document.createElement("style");
  css.textContent = `
    .pmenu { position: fixed; z-index: 49; left: 0; right: 0; top: 0; padding: 78px var(--pad, 24px) 36px; background: var(--bg, #fff);
      border-bottom: 1px solid var(--line, #000); transform: translateY(-104%); transition: transform .6s cubic-bezier(.2,.7,.1,1);
      display: grid; grid-template-columns: repeat(12, 1fr); column-gap: var(--gap, 24px); max-height: 100vh; overflow-y: auto; }
    .pmenu.open { transform: none; }
    .pmenu-scrim { position: fixed; inset: 0; z-index: 48; background: rgba(0,0,0,.18); opacity: 0; pointer-events: none; transition: opacity .5s; }
    .pmenu-scrim.open { opacity: 1; pointer-events: auto; }
    .pmenu h3 { font-size: 13px; font-weight: 400; color: var(--muted, #8a8a8a); margin: 0 0 12px; }
    .pm-sel { grid-column: 1 / 8; }
    .pm-all { grid-column: 9 / 13; }
    .pm-sel a { display: grid; grid-template-columns: 44px 1fr; align-items: baseline; padding: 6px 0 8px; border-top: 1px solid var(--line, #000);
      font-size: clamp(24px, 2.6vw, 38px); font-weight: 300; letter-spacing: -0.03em; line-height: 1.1; transition: color .2s, padding .35s cubic-bezier(.2,.7,.1,1); }
    .pm-sel a:last-child { border-bottom: 1px solid var(--line, #000); }
    .pm-sel a span { font-size: 13px; color: var(--muted, #8a8a8a); letter-spacing: 0; }
    .pm-sel a:hover { color: var(--accent, #ff3b00); padding-left: 10px; }
    .pm-all a { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; font-size: 15px; color: var(--muted, #8a8a8a); transition: color .2s; }
    .pm-all a.sel { color: var(--text, #000); }
    .pm-all a.sel::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #ff3b00); flex: none; transform: translateY(-2px); }
    .pm-all a:not(.sel) { padding-left: 14px; }
    .pm-all a:hover { color: var(--accent, #ff3b00); }
    .pm-all .pm-more { margin-top: 14px; padding-left: 0; color: var(--text, #000); }
    .pm-all .pm-key { font-size: 12px; color: var(--muted, #8a8a8a); margin-top: 18px; display: flex; align-items: center; gap: 8px; }
    .pm-all .pm-key i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #ff3b00); }
    html.pm-is-open .vsound-ask, html.pm-is-open .locator { opacity: 0 !important; pointer-events: none; }   /* nothing floats over the open menu */
    .site-header nav a.pm-open { color: var(--accent, #ff3b00); }
    .site-header nav a.pm-link::after { content: " \\25BE"; font-size: .7em; vertical-align: .1em; }
    @media (max-width: 760px) {
      .pmenu { padding-top: 92px; row-gap: 26px; }
      .pm-sel, .pm-all { grid-column: 1 / 13; }
      .pm-sel a { grid-template-columns: 32px 1fr; font-size: 24px; }
    }`;
  document.head.appendChild(css);

  const menu = document.createElement("nav"); menu.className = "pmenu"; menu.setAttribute("aria-label", "projects");
  const scrim = document.createElement("div"); scrim.className = "pmenu-scrim";
  document.body.append(scrim, menu);
  link.classList.add("pm-link"); link.setAttribute("aria-haspopup", "true"); link.setAttribute("aria-expanded", "false");

  // read both lists from the site's own pages
  const read = async (page, sel) => {
    const res = await fetch(new URL(page, root)); const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    return [...doc.querySelectorAll(sel)].map(a => ({ href: new URL(a.getAttribute("href"), new URL(page, root)).href, name: (a.querySelector(".name") || a).textContent.trim() }));
  };
  let built = false;
  async function build() {
    if (built) return; built = true;
    try {
      const [selected, all] = await Promise.all([read("index.html", ".plist li a"), read("projects.html", ".plist li a")]);
      const isSel = new Set(selected.map(p => p.href));
      menu.innerHTML =
        `<div class="pm-sel"><h3>selected work</h3>${selected.map((p, i) => `<a href="${p.href}"><span>${String(i + 1).padStart(2, "0")}</span>${p.name}</a>`).join("")}</div>` +
        `<div class="pm-all"><h3>all projects</h3>${all.map(p => `<a href="${p.href}"${isSel.has(p.href) ? ' class="sel"' : ""}>${p.name}</a>`).join("")}` +
        `<a class="pm-more" href="${new URL("projects.html", root).href}">view all projects &rarr;</a><p class="pm-key"><i></i>selected work</p></div>`;
    } catch (e) { built = false; location.href = link.href; }                     // if the lists can't load, just go to the page
  }
  const open = async () => { await build(); menu.classList.add("open"); scrim.classList.add("open"); link.classList.add("pm-open"); link.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("pm-is-open"); };
  const close = () => { menu.classList.remove("open"); scrim.classList.remove("open"); link.classList.remove("pm-open"); link.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("pm-is-open"); };
  link.addEventListener("click", e => {
    if (e.metaKey || e.ctrlKey) return;                                          // cmd/ctrl-click still opens the projects page
    e.preventDefault(); e.stopImmediatePropagation();
    menu.classList.contains("open") ? close() : open();
  }, true);
  scrim.addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  menu.addEventListener("click", e => { if (e.target.closest("a")) close(); });  // the page wipe takes it from here
})();
