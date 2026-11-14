// della wirfel — the key under the finished k-means map (global cities page). loaded by main.js when the page has .kmap.
// one row per cluster: its tableau color, cluster number, what those cities share and a few you'll recognize.
// qualities are my cluster observations; medians are the tableau sheets "Median Population" and
// "Median Elevation by Clusters (1-5)"; every example city is in that cluster in the "Global City Clusters" sheet.
(function () {
  const map = document.querySelector(".kmap");
  if (!map || document.querySelector(".km-key")) return;
  const KEY = [
    ["blue", "#4E79A7", 1, "roughly 3.1 million people, low elevation, longitude around 111.5°. mostly eastern and asian cities of moderate population.", "3,113,361.5", "71", "Hong Kong, Bangkok, Chennai, Riyadh, Sydney"],
    ["orange", "#F28E2B", 2, "roughly 2.5 million people, latitude near the equator, longitude near 0°. lower-latitude cities spread across africa, south america and beyond.", "2,529,403", "154", "Lagos, São Paulo, Rio de Janeiro, Buenos Aires, Lima, Cape Town"],
    ["red", "#E15759", 3, "an 11.1 million median population at low elevation. the megacities, heavily represented by asian cities.", "11,130,738", "37.5", "Tokyo, Shanghai, Delhi, Mumbai, Istanbul, Moscow"],
    ["teal", "#76B7B2", 4, "about 2.3 million people, longitude around 21°. more western and northern cities.", "2,300,500", "76", "New York City, London, Cairo, Los Angeles, Berlin, Rome"],
    ["green", "#59A14F", 5, "a 1,660 m median elevation. the high-elevation cities.", "2,957,000", "1,660", "Mexico City, Bogotá, Nairobi, Addis Ababa, Tehran, Johannesburg"],
  ];
  const sec = document.createElement("section"); sec.className = "km-key";
  sec.innerHTML = `<p class="label">the five clusters</p><ol>` + KEY.map(([n, c, k, obs, mp, me, ex]) =>
    `<li><div class="kk-name"><i style="background:${c}"></i><span>${n}</span><small>cluster ${k}</small></div>` +
    `<p class="kk-obs">${obs}</p><p class="kk-med"><span>median population</span>${mp}<span>median elevation</span>${me} m</p>` +
    `<p class="kk-ex"><span>most recognizable</span>${ex}</p></li>`).join("") + `</ol>`;
  map.after(sec);
  // rows rise in one after another as they scroll into view
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .2 });
  sec.querySelectorAll("li, .label").forEach((el, i) => { el.style.transitionDelay = (i % 3) * .06 + "s"; io.observe(el); });
})();
