const Site = (() => {
  const state = { data: null, lb: { open:false, series:null, idx:0 } };

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  async function loadContent(){
    if(state.data) return state.data;
    const res = await fetch("./content.json", { cache: "no-store" });
    state.data = await res.json();
    return state.data;
  }

  function setYear(){
    const y = qs("#year");
    if(y) y.textContent = String(new Date().getFullYear());
  }

  function setHero(url){
    const hero = qs("#hero");
    if(hero) hero.style.backgroundImage = `url('${url}')`;
  }

  function escapeHtml(str){
    return String(str ?? "").replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function cardHTML(item){
    return `
      <a class="card" href="series.html#${encodeURIComponent(item.slug)}" aria-label="${escapeHtml(item.title)}">
        <img class="card__img" src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(item.title)}</h3>
          <p class="card__sub">${escapeHtml(item.subtitle || "")}</p>
        </div>
      </a>
    `;
  }

  function seriesHTML(s){
    return `
      <button class="seriesItem" data-slug="${escapeHtml(s.slug)}" type="button" aria-label="Ouvrir ${escapeHtml(s.title)}">
        <img src="${(s.images && s.images[0]) ? s.images[0] : ""}" alt="${escapeHtml(s.title)}" loading="lazy">
        <div class="seriesItem__body">
          <h2 style="margin:0">${escapeHtml(s.title)}</h2>
          <div class="seriesItem__meta">${escapeHtml(s.year || "")}</div>
          <p class="seriesItem__desc">${escapeHtml(s.description || "")}</p>
          <div class="seriesItem__meta" style="margin-top:14px">Cliquer pour ouvrir</div>
        </div>
      </button>
    `;
  }

  // Lightbox
  function lbBind(){
    const lb = qs("#lightbox");
    if(!lb) return null;

    const close = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden","true"); state.lb.open=false; };
    const open = (series, idx=0) => {
      state.lb.series = series; state.lb.idx = idx; state.lb.open=true;
      lb.classList.add("is-open"); lb.setAttribute("aria-hidden","false");
      renderLB();
    };
    const next = () => { if(!state.lb.series) return; state.lb.idx = (state.lb.idx+1) % state.lb.series.images.length; renderLB(); };
    const prev = () => { if(!state.lb.series) return; state.lb.idx = (state.lb.idx-1 + state.lb.series.images.length) % state.lb.series.images.length; renderLB(); };

    function renderLB(){
      const img = qs("#lbImg");
      const title = qs("#lbTitle");
      const count = qs("#lbCount");
      const s = state.lb.series;
      if(!s || !img) return;
      img.src = s.images[state.lb.idx];
      img.alt = s.title;
      if(title) title.textContent = s.title;
      if(count) count.textContent = `${state.lb.idx+1} / ${s.images.length}`;
    }

    qs("#lbClose")?.addEventListener("click", close);
    qs("#lbNext")?.addEventListener("click", next);
    qs("#lbPrev")?.addEventListener("click", prev);

    lb.addEventListener("click", (e) => { if(e.target === lb) close(); });
    window.addEventListener("keydown", (e) => {
      if(!state.lb.open) return;
      if(e.key === "Escape") close();
      if(e.key === "ArrowRight") next();
      if(e.key === "ArrowLeft") prev();
    });

    return { open };
  }

  async function initHome(){
    setYear();
    const data = await loadContent();
    setHero(data.site?.heroImage || "images/cover/cover.jpg");
    const grid = qs("#featuredGrid");
    if(grid){
      grid.innerHTML = (data.featured || []).map(cardHTML).join("");
    }
  }

  async function initSeries(){
    setYear();
    const data = await loadContent();
    const list = qs("#seriesList");
    const lb = lbBind();

    if(list){
      list.innerHTML = (data.series || []).map(seriesHTML).join("");
      qsa(".seriesItem").forEach(btn => {
        btn.addEventListener("click", () => {
          const slug = btn.getAttribute("data-slug");
          const series = (data.series || []).find(s => s.slug === slug);
          if(series && lb) lb.open(series, 0);
        });
      });
    }

    const hash = decodeURIComponent((location.hash || "").replace("#",""));
    if(hash){
      const series = (data.series || []).find(s => s.slug === hash);
      if(series && lb) lb.open(series, 0);
    }
  }

  function initCommon(){ setYear(); }

  return { initHome, initSeries, initCommon };
})();

window.Site = Site;
