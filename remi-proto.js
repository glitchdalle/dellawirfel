// della wirfel — remi, the clickable prototype (remi page only).
// a full-screen takeover with an iphone-sized remi inside. every screen is rebuilt from della's nine design screens:
// positions are in the design's 600 × 1299 artboard pixels, and the app is scaled to fit the window.
// motion follows della's motion plan: large photographs move, small thumbnails stay still unless tapped.
(function () {
  const launch = document.querySelector(".rp-launch");
  if (!launch) return;
  const ROOT = new URL(".", document.currentScript.src).href;
  const A = ROOT + "images/remi-proto/";
  // the launcher only appears once the prototype's images are on the site
  fetch(A + "name-bg.jpg", { method: "HEAD" }).then(r => { if (r.ok) launch.hidden = false; }).catch(() => {});

  const STEPS = [
    { id: "name",    t: "what should we call you?", hint: "this is remi, an app I designed. it works like the real thing: type your name, then press return." },
    { id: "perm",    t: "access your photos",       hint: "tap “allow access”. next, iOS asks for permission, like it would on your phone." },
    { id: "load",    t: "organizing your photos",   hint: "remi sorts your library into seasons. this takes a few seconds." },
    { id: "home",    t: "your library",             hint: "scroll through your seasons, then tap fall 2024." },
    { id: "season",  t: "fall 2024",                hint: "tap “clean this for me”." },
    { id: "clean",   t: "cleaning",                 hint: "remi fades what it suggests removing. tap a faded photo to keep it, or tap anywhere else to review." },
    { id: "review",  t: "review suggestions",       hint: "tap faded photos to keep them, or tap any photo to remove it. scroll down and tap continue." },
    { id: "confirm", t: "ready to clean up",        hint: "tap “clean my library”. anything removed goes to recently deleted first." },
    { id: "done",    t: "that’s better.",      hint: "tap continue to go back to your lighter library." },
  ];
  const LIGHT = new Set(["home", "clean", "review", "confirm", "done"]);   // screens with a light top: dark status bar
  const COLS = [28, 138, 247, 357, 466];
  const fmt = n => n.toLocaleString("en-US");

  let rp, phone, viewport, app, side, chip, screens = [], idx = -1, hist = [], timers = [], small = false, built = false, isOpen = false;
  const st = { name: "claire", removed: 1849, cleaned: false };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const th = (n, x, y, cls = "", w = 107, h = 125) =>
    `<div class="rp-th ${cls}" data-n="${n}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background-image:url(${A}t-${n}.jpg)"></div>`;
  const bg = (file, cls = "", style = "") => `<div class="rp-bg ${cls}" style="background-image:url(${A}${file});${style}"></div>`;

  // review grid: six rows of five, * = suggested for removal (faded), as in della's review screen
  const REVIEW = [
    ["flowers", "room*", "rose", "palm*", "bowl"],
    ["road*", "roots", "rock", "dress", "roseclose"],
    ["fern", "laptop*", "sign", "palmdark", "ground"],
    ["road", "grass*", "rocksand", "girl*", "laptop"],
    ["flowers", "room", "roseclose*", "palm*", "bowl"],
    ["road", "roots", "rock", "palmdark*", "rose"],
  ];
  const REV_ROWS = [569, 697, 825, 952, 1081, 1209];

  function screensHTML() {
    return `
    <section class="rp-s" data-i="0">
      ${bg("name-bg.jpg", "rp-amb-drift")}
      <div class="rp-abs rp-name-in rp-fade"><input type="text" maxlength="18" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="what should we call you?" enterkeyhint="go" aria-label="your name"></div>
      <div class="rp-abs rp-greet rp-fade rp-d2">nice to meet you, <u class="rp-nm">_____</u>.</div>
    </section>

    <section class="rp-s" data-i="1">
      ${bg("perm-bg.jpg", "rp-amb-drift", "animation-duration:30s")}
      <div class="rp-abs rp-perm-t b rp-fade">access<br>your photos</div>
      <div class="rp-abs rp-perm-i i rp-fade rp-d1">your items<br><b style="font-weight:700">never</b> leave<br>your device</div>
      <div class="rp-abs rp-perm-sig l rp-fade rp-d1">-della</div>
      <div class="rp-abs rp-btn rp-allow b rp-tap rp-fade rp-d2" role="button">allow access</div>
      <div class="rp-abs rp-btn rp-notnow l rp-tap rp-fade rp-d3" role="button">not now</div>
      <div class="rp-alert-dim"></div>
      <div class="rp-alert" role="alertdialog">
        <h4>“remi” would like full access to your photo library</h4>
        <p>your photos stay on this device. remi uses them to find what you can clean up.</p>
        <div data-a="limit">limit access…</div><div data-a="allow">allow full access</div><div data-a="deny">don’t allow</div>
      </div>
    </section>

    <section class="rp-s" data-i="2">
      ${bg("load-bg.jpg", "rp-lbg")}
      <div class="rp-abs rp-load-t b rp-fade">organizing your photos</div>
      <div class="rp-rects"></div>
    </section>

    <section class="rp-s" data-i="3">
      <div class="rp-scroll rp-home-sc"><div class="rp-home-in">
        <div class="rp-abs rp-hello b rp-fade">welcome, <span class="rp-nm2">claire</span></div>
        <div class="rp-abs rp-hello2 i rp-fade rp-d1">lets de-clutter</div>
        <div class="rp-abs rp-count rp-fade rp-d1"><span class="rp-items">67,209</span> items</div>
        <div class="rp-card" data-card="spring" style="top:380px"><div class="rp-par">${bg("spring.jpg", "rp-kb-a")}</div><div class="rp-lab">spring 2024</div><div class="rp-plus">+</div></div>
        <div class="rp-card" data-card="winter" style="top:787px"><div class="rp-par">${bg("winter.jpg", "rp-kb-b")}</div><div class="rp-lab">winter 2024</div><div class="rp-plus">+</div></div>
        <div class="rp-card" data-card="fall" style="top:1195px"><div class="rp-par">${bg("fall-card.jpg", "rp-kb-c")}</div><div class="rp-lab">fall 2024</div><div class="rp-plus">+</div></div>
      </div></div>
    </section>

    <section class="rp-s" data-i="4">
      <div class="rp-scroll rp-sec-sc"><div class="rp-sec-in">
        <div class="rp-hero"><div class="rp-par">${bg("fall-hero.jpg", "rp-kb-a", "animation-duration:18s")}</div></div>
        <div class="rp-abs rp-sec-t b rp-fade rp-d1">fall 2024</div>
        <div class="rp-abs rp-sec-m rp-fade rp-d2">5,203 images<br>421 videos</div>
        <div class="rp-panel"></div>
        <div class="rp-abs rp-cleanme i rp-tap rp-fade rp-d3" role="button">clean this for me</div>
        ${["road", "grass", "rocksand", "girl", "laptop"].map((n, c) => th(n, COLS[c] + 2, 968)).join("")}
        ${["flowers", "room", "rose", "palm", "bowl"].map((n, c) => th(n, COLS[c] + 2, 1097)).join("")}
      </div></div>
    </section>

    <section class="rp-s rp-s6" data-i="5">
      <div class="rp-abs rp-clean-t b rp-fade">fall 2024</div>
      <div class="rp-abs rp-clean-t2 i rp-fade rp-d1">5,624 items // 3.2 GB</div>
      <div class="rp-abs rp-clean-n rp-fade rp-d1"><span class="rp-cn">0</span> items ready to clean up</div>
      ${th("rocksand", 237, 392, "s", 94, 124)}${th("palm", 337, 443, "s", 106, 124)}
      ${th("road", 30, 608)}${th("grass", 139, 608)}${th("girl", 357, 608)}${th("laptop", 466, 608)}
      ${th("room", 139, 737)}${th("rose", 248, 737)}${th("bowl", 466, 737)}
      ${th("flowers", 48, 907, "s", 104, 124)}
    </section>

    <section class="rp-s rp-s7" data-i="6">
      <div class="rp-scroll rp-rev-sc"><div class="rp-rev-in">
        <div class="rp-abs rp-rev-a i rp-fade">fall 2024</div>
        <div class="rp-abs rp-rev-b b rp-fade rp-d1">review suggestions</div>
        <div class="rp-abs rp-rev-n rp-fade rp-d1"><span class="rp-rn">1,849</span> items to remove</div>
        <div class="rp-abs rp-rev-h i rp-fade rp-d2">tap faded images to keep what you want</div>
        ${REVIEW.map((row, r) => row.map((n, c) => th(n.replace("*", ""), COLS[c], REV_ROWS[r], n.endsWith("*") ? "s" : "")).join("")).join("")}
        <div class="rp-abs rp-btn rp-cont rp-tap rp-go-confirm" role="button" style="top:1370px">continue</div>
      </div></div>
      <div class="rp-rev-fade"></div>
    </section>

    <section class="rp-s" data-i="7">
      ${bg("confirm-bg.jpg", "rp-amb-drift", "animation-duration:15s")}
      <div class="rp-abs rp-conf-t b rp-fade">ready to clean up, <span class="rp-nm3">claire</span>?</div>
      <div class="rp-abs rp-btn rp-clean b rp-tap rp-fade rp-d2" role="button">clean my library</div>
      <div class="rp-abs rp-btn rp-notnow2 l rp-tap rp-fade rp-d3" role="button">not now</div>
      <div class="rp-abs rp-conf-b b rp-fade rp-d2">you can restore anything<br>from recently deleted</div>
    </section>

    <section class="rp-s rp-s9" data-i="8">
      <div class="rp-road">${bg("road-bg.jpg")}</div>
      <div class="rp-abs rp-better rp-fade">that’s better.</div>
      <div class="rp-abs rp-btn rp-cont rp-tap rp-fade rp-go-home" role="button">continue</div>
    </section>`;
  }

  const ICONS = `<span>9:41</span><span style="display:flex;align-items:center">
    <svg viewBox="0 0 34 20"><rect x="0" y="13" width="6" height="7" rx="1.5"/><rect x="9" y="9" width="6" height="11" rx="1.5"/><rect x="18" y="5" width="6" height="15" rx="1.5"/><rect x="27" y="0" width="6" height="20" rx="1.5"/></svg>
    <svg viewBox="0 0 28 20"><path d="M14 4.5c3.8 0 7.2 1.5 9.8 3.9l2-2.1C22.6 3.2 18.5 1.4 14 1.4S5.4 3.2 2.2 6.3l2 2.1C6.8 6 10.2 4.5 14 4.5zm0 6.2c2.1 0 4 .8 5.5 2.2l2-2.1C19.5 8.8 16.9 7.6 14 7.6s-5.5 1.2-7.5 3.2l2 2.1c1.5-1.4 3.4-2.2 5.5-2.2zM14 16.9l3.3-3.4c-.9-.8-2-1.3-3.3-1.3s-2.4.5-3.3 1.3z"/></svg>
    <svg viewBox="0 0 46 22" style="height:21px"><rect x="1" y="1" width="39" height="20" rx="6" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45"/><rect x="4" y="4" width="31" height="14" rx="3.5"/><path d="M42.5 8v6c1.4-.5 2.3-1.7 2.3-3s-.9-2.5-2.3-3z" opacity=".45"/></svg></span>`;

  function build() {
    if (built) return; built = true;
    rp = document.createElement("div"); rp.className = "rp"; rp.setAttribute("role", "dialog"); rp.setAttribute("aria-modal", "true"); rp.setAttribute("aria-label", "remi prototype");
    rp.innerHTML = `<div class="rp-backdrop"></div>
      <button class="rp-close" type="button">close &times;</button>
      <aside class="rp-side">
        <p class="k">remi &middot; clickable prototype</p>
        <h3><span class="rp-sn">01 / 09</span><em class="rp-st" style="font-style:normal"></em></h3>
        <p class="rp-hint"></p>
        <ol class="rp-steps">${STEPS.map((s, i) => `<li data-j="${i}"><b>${String(i + 1).padStart(2, "0")}</b>${s.t}</li>`).join("")}</ol>
        <div class="rp-ctrl"><button type="button" class="rp-back">&larr; back</button><button type="button" class="rp-restart">restart</button></div>
        <p class="rp-foot">every screen is rebuilt from my design files, with the motion I planned for each one. type, tap and scroll like a real app. esc closes it.</p>
      </aside>
      <div class="rp-phone"><div class="rp-viewport"><div class="rp-app">
        <div class="rp-status">${ICONS}</div><div class="rp-island"></div><div class="rp-homebar"></div>
        ${screensHTML()}
      </div></div></div>
      <div class="rp-chip"></div>`;
    document.body.appendChild(rp);
    phone = rp.querySelector(".rp-phone"); viewport = rp.querySelector(".rp-viewport"); app = rp.querySelector(".rp-app");
    side = rp.querySelector(".rp-side"); chip = rp.querySelector(".rp-chip");
    screens = [...app.querySelectorAll(".rp-s")];
    wire();
  }

  // ---------- layout: fit the phone (and the guide beside it) to the window ----------
  let geo = {};
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    small = vw < 760 || vh < 560;
    rp.classList.toggle("small", small);
    let s, bez, W, H, x, y;
    if (small) {
      bez = 0; s = Math.min(vw / 600, vh / 1299); W = 600 * s; H = 1299 * s; x = (vw - W) / 2; y = (vh - H) / 2;
      phone.style.setProperty("--rp-r", "0px"); viewport.style.setProperty("--rp-ir", "0px");
    } else {
      bez = 13; s = Math.min((vh - 70 - 2 * bez) / 1299, .74); W = 600 * s + 2 * bez; H = 1299 * s + 2 * bez;
      const sideW = Math.min(300, vw - W - 140), gap = 64, total = sideW + gap + W;
      const left = Math.max(28, (vw - total) / 2);
      x = left + sideW + gap; y = (vh - H) / 2;
      side.style.left = left + "px"; side.style.width = sideW + "px"; side.style.top = Math.max(40, y + 40) + "px";
      phone.style.setProperty("--rp-r", (54 * s / .65 + bez) + "px"); viewport.style.setProperty("--rp-ir", (54 * s / .65) + "px");
    }
    phone.style.left = x + "px"; phone.style.top = y + "px"; phone.style.width = W + "px"; phone.style.height = H + "px";
    viewport.style.left = bez + "px"; viewport.style.top = bez + "px"; viewport.style.width = 600 * s + "px"; viewport.style.height = 1299 * s + "px";
    app.style.transform = `scale(${s})`;
    app.querySelectorAll(".rp-status, .rp-island, .rp-homebar").forEach(e => e.style.display = small ? "none" : "");
    geo = { x, y, W, H };
  }

  // ---------- navigation ----------
  function go(i, push = true) {
    if (i === idx) return;
    clearTimers();
    if (idx >= 0) { screens[idx].classList.remove("on", "shown"); if (push) hist.push(idx); }
    const prev = idx; idx = i;
    const scr = screens[i], id = STEPS[i].id;
    scr.classList.add("on");
    later(() => scr.classList.add("shown"), prev < 0 ? 450 : 260);
    app.classList.toggle("light", LIGHT.has(id));
    enter(id, scr);
    // guide
    rp.querySelector(".rp-sn").textContent = `${String(i + 1).padStart(2, "0")} / 09`;
    rp.querySelector(".rp-st").textContent = STEPS[i].t;
    hint(STEPS[i].hint);
    rp.querySelectorAll(".rp-steps li").forEach((li, j) => li.classList.toggle("on", j === i));
  }
  function hint(text, flash) {
    const h = rp.querySelector(".rp-hint"); h.textContent = text; h.classList.toggle("flash", !!flash);
    if (flash) setTimeout(() => h.classList.remove("flash"), 1600);
    chip.textContent = text; chip.classList.add("on");
    clearTimeout(chip._t); chip._t = setTimeout(() => chip.classList.remove("on"), flash ? 3200 : 5000);
  }
  const back = () => { if (hist.length) go(hist.pop(), false); };
  function restart() {
    hist = []; st.name = "claire"; st.removed = 1849; st.cleaned = false;
    const inp = app.querySelector(".rp-name-in input"); inp.value = ""; app.querySelector(".rp-nm").textContent = "_____";
    const cur = idx; if (cur >= 0) screens[cur].classList.remove("on", "shown"); idx = -1; go(0, false);
  }

  // ---------- each screen's behaviour ----------
  function enter(id, scr) {
    if (id === "name") {
      if (!small) later(() => app.querySelector(".rp-name-in input").focus({ preventScroll: true }), 900);
    }
    if (id === "perm") { closeAlert(); }
    if (id === "load") runLoading(scr);
    if (id === "home") {
      app.querySelector(".rp-nm2").textContent = st.name;
      app.querySelector(".rp-items").textContent = fmt(67209 - (st.cleaned ? st.removed : 0));
      const sc = scr.querySelector(".rp-home-sc"); sc.scrollTop = 0; parallaxHome(sc);
    }
    if (id === "season") { const sc = scr.querySelector(".rp-sec-sc"); sc.scrollTop = 0; scr.querySelector(".rp-hero .rp-par").style.transform = ""; }
    if (id === "clean") runCleaning(scr);
    if (id === "review") {
      scr.querySelector(".rp-rev-sc").scrollTop = 0;
      scr.querySelectorAll(".rp-th").forEach(t => t.classList.toggle("sug", t.classList.contains("s")));
      app.querySelector(".rp-rn").textContent = fmt(st.removed);
    }
    if (id === "confirm") app.querySelector(".rp-nm3").textContent = st.name;
  }

  function runLoading(scr) {
    const lbg = scr.querySelector(".rp-lbg"); lbg.classList.remove("rp-amb-zoom"); void lbg.offsetWidth; lbg.classList.add("rp-amb-zoom");
    const box = scr.querySelector(".rp-rects");
    // della's composition (where the rectangles sit in her loading screen), then a looser, organized grid
    const design = [[298, 436, 78, 92, "#f4ece4", 1], [360, 540, 78, 95, "rgba(225,210,196,.45)", 1], [302, 595, 108, 125, "#d4c5b9", .95],
                    [183, 590, 79, 100, "rgba(225,210,196,.4)", 1], [212, 693, 80, 93, "rgba(225,210,196,.5)", 1], [275, 806, 62, 72, "#d6c7bb", .9],
                    [420, 700, 70, 82, "#efe5da", 0]];
    const start = [[-70, -90], [110, -60], [80, 120], [-120, 40], [-60, 140], [90, 90], [120, 40]];
    const grid = [[218, 452], [306, 452], [218, 552], [306, 552], [218, 652], [262, 900], [306, 652]];
    const gridOp = [1, .9, .95, .7, .85, 0, .8];
    box.innerHTML = design.map(() => `<div class="rp-rect"></div>`).join("");
    const els = [...box.children];
    els.forEach((e, k) => { const [x, y, w, h, c] = design[k]; Object.assign(e.style, { transition: "none", left: x + start[k][0] + "px", top: y + start[k][1] + "px", width: w + "px", height: h + "px", background: c, opacity: k === 6 ? 0 : (k % 2 ? .2 : .5) }); });
    void box.offsetWidth;
    later(() => els.forEach((e, k) => { const [x, y, , , , o] = design[k]; Object.assign(e.style, { transition: "", left: x + "px", top: y + "px", opacity: o }); }), 80);
    later(() => els.forEach((e, k) => { const [x, y] = grid[k]; Object.assign(e.style, { left: x + "px", top: y + "px", width: "76px", height: "88px", opacity: gridOp[k], background: "#efe5da" }); }), 2600);
    later(() => go(3), 5400);
  }

  function parallaxHome(sc) {
    const top = sc.scrollTop, mid = top + 649;
    sc.querySelectorAll(".rp-card").forEach(c => { const cy = c.offsetTop + 184; c.querySelector(".rp-par").style.transform = `translateY(${((cy - mid) * -0.07).toFixed(1)}px)`; });
  }

  function runCleaning(scr) {
    const ths = [...scr.querySelectorAll(".rp-th")], cn = scr.querySelector(".rp-cn");
    ths.forEach(t => t.classList.remove("in", "sug")); cn.textContent = "0";
    scr._ready = false; scr._touched = false;
    ths.forEach((t, k) => later(() => t.classList.add("in"), 380 + k * 70));
    later(() => {
      ths.filter(t => t.classList.contains("s")).forEach(t => t.classList.add("sug"));
      const t0 = performance.now(), target = st.removed = 1849;
      (function tick(now) { const p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
        cn.textContent = fmt(Math.round(target * e)); if (p < 1 && idx === 5) requestAnimationFrame(tick); })(t0);
    }, 1350);
    later(() => { scr._ready = true; }, 1700);
    later(() => { if (!scr._touched && idx === 5) go(6); }, 7000);
  }

  function openAlert() { app.querySelector(".rp-alert-dim").classList.add("on"); app.querySelector(".rp-alert").classList.add("on"); }
  function closeAlert() { app.querySelector(".rp-alert-dim").classList.remove("on"); app.querySelector(".rp-alert").classList.remove("on"); }

  function wire() {
    rp.querySelector(".rp-close").addEventListener("click", close);
    rp.querySelector(".rp-backdrop").addEventListener("click", close);
    rp.querySelector(".rp-back").addEventListener("click", back);
    rp.querySelector(".rp-restart").addEventListener("click", restart);
    rp.querySelectorAll(".rp-steps li").forEach(li => li.addEventListener("click", () => go(+li.dataset.j)));

    // 01 name
    const inp = app.querySelector(".rp-name-in input"), nm = app.querySelector(".rp-nm");
    inp.addEventListener("input", () => { const v = inp.value.trim().toLowerCase(); nm.textContent = v || "_____"; });
    inp.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") {
        const v = inp.value.trim().toLowerCase();
        if (!v) { hint("type a name first, then press return.", true); return; }
        st.name = v; inp.blur(); later(() => go(1), 350);
      }
      if (e.key === "Escape") inp.blur();
    });
    // 02 permission
    const allow = app.querySelector(".rp-allow");
    allow.addEventListener("click", () => setTimeout(openAlert, 180));
    app.querySelector(".rp-notnow").addEventListener("click", () => hint("remi only works with your photos, and they never leave your phone. tap “allow access”.", true));
    app.querySelectorAll(".rp-alert div").forEach(d => d.addEventListener("click", () => {
      closeAlert();
      if (d.dataset.a === "deny") hint("without access remi can’t help. tap “allow access” to keep going.", true);
      else setTimeout(() => go(2), 250);
    }));
    // 04 home
    const hsc = app.querySelector(".rp-home-sc");
    hsc.addEventListener("scroll", () => requestAnimationFrame(() => parallaxHome(hsc)), { passive: true });
    app.querySelectorAll(".rp-card").forEach(c => c.addEventListener("click", () => {
      if (c.dataset.card === "fall") { go(4); return; }
      c.classList.remove("nudge"); void c.offsetWidth; c.classList.add("nudge");
      hint(`${c.dataset.card} 2024 is just for show here. fall 2024 is the season this prototype opens.`, true);
      hsc.scrollTo({ top: 1100, behavior: "smooth" });
    }));
    // 05 season
    const ssc = app.querySelector(".rp-sec-sc"), hero = app.querySelector(".rp-hero .rp-par");
    ssc.addEventListener("scroll", () => { hero.style.transform = `translateY(${(ssc.scrollTop * .3).toFixed(1)}px)`; }, { passive: true });
    app.querySelector(".rp-cleanme").addEventListener("click", () => go(5));
    // 06 cleaning: tap a faded photo to keep it, tap anywhere else to review
    const s6 = screens[5], cn = s6.querySelector(".rp-cn");
    s6.querySelectorAll(".rp-th").forEach(t => t.addEventListener("click", e => {
      e.stopPropagation(); if (!t.classList.contains("in")) return; s6._touched = true;
      const was = t.classList.toggle("sug"); st.removed += was ? 1 : -1; cn.textContent = fmt(st.removed);
    }));
    s6.addEventListener("click", () => { if (s6._ready) go(6); });
    // 07 review
    const s7 = screens[6], rn = s7.querySelector(".rp-rn");
    s7.querySelectorAll(".rp-th").forEach(t => t.addEventListener("click", () => {
      const was = t.classList.toggle("sug"); st.removed += was ? 1 : -1; rn.textContent = fmt(st.removed);
    }));
    s7.querySelector(".rp-go-confirm").addEventListener("click", () => go(7));
    // 08 confirm
    app.querySelector(".rp-clean").addEventListener("click", () => go(8));
    app.querySelector(".rp-notnow2").addEventListener("click", () => go(6));
    // 09 done
    app.querySelector(".rp-go-home").addEventListener("click", () => { st.cleaned = true; hist = []; go(3, false); hint("your library, a little lighter. tap restart to go again, or close to keep exploring the page."); });

    addEventListener("resize", () => { if (!isOpen) return; if (small && document.activeElement === inp) return; layout(); });
    addEventListener("keydown", e => { if (!isOpen) return; if (e.key === "Escape") { if (app.querySelector(".rp-alert.on")) closeAlert(); else close(); } });
    addEventListener("popstate", () => { if (isOpen) close(true); });
  }

  // ---------- open / close: the phone grows out of the button and settles in the middle of the screen ----------
  function fromButton() {
    const r = launch.getBoundingClientRect(), { x, y, W, H } = geo;
    const sc = Math.max(.12, Math.min(r.height / H, .3));
    return `translate(${(r.left + r.width / 2 - (x + W / 2)).toFixed(0)}px, ${(r.top + r.height / 2 - (y + H / 2)).toFixed(0)}px) scale(${sc.toFixed(3)})`;
  }
  function open() {
    build(); rp.style.display = ""; layout(); isOpen = true;
    document.documentElement.style.overflow = "hidden";
    phone.style.transformOrigin = "50% 50%";
    phone.style.transition = "none"; phone.style.transform = fromButton(); phone.style.opacity = "0";
    void phone.offsetWidth;
    rp.classList.add("open");
    phone.style.transition = "transform .9s cubic-bezier(.2,.85,.2,1), opacity .45s ease";
    phone.style.transform = "none"; phone.style.opacity = "1";
    if (idx < 0) setTimeout(() => go(0, false), 420);
    else hint(STEPS[idx].hint);
    try { history.pushState({ rp: 1 }, "", "#prototype"); } catch (e) {}
  }
  function close(fromPop) {
    if (!isOpen) return; isOpen = false;
    const inp = app.querySelector(".rp-name-in input"); inp.blur();
    rp.classList.remove("open");
    phone.style.transition = "transform .6s cubic-bezier(.5,0,.75,0), opacity .5s ease .1s";
    phone.style.transform = fromButton(); phone.style.opacity = "0";
    setTimeout(() => { rp.style.display = "none"; document.documentElement.style.overflow = ""; }, 620);
    if (!fromPop && location.hash === "#prototype") { try { history.back(); } catch (e) {} }
  }
  launch.addEventListener("click", open);
  if (location.hash === "#prototype") { try { history.replaceState(null, "", location.pathname); } catch (e) {} }
})();
