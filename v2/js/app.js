import taxonomy from "../data/taxonomy.json" with { type: "json" };

const $ = (selector) => document.querySelector(selector);
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

function fillSelect(select, items, firstLabel) {
  if (!select) return;
  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = ""; first.textContent = firstLabel; select.append(first);
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id; option.textContent = item.name; select.append(option);
  });
}

function renderWorlds() {
  const grid = $("#worldGrid");
  if (!grid) return;
  grid.replaceChildren();
  taxonomy.worlds.filter((world) => world.active).forEach((world) => {
    const card = document.createElement("a");
    card.className = "world-card";
    card.href = "#catalogo";
    card.style.setProperty("--world", world.color);
    const icon = document.createElement("span");
    icon.className = "world-icon"; icon.textContent = world.icon;
    const title = document.createElement("strong"); title.textContent = world.name;
    const description = document.createElement("span"); description.textContent = world.description;
    card.append(icon,title,description);
    card.addEventListener("click", () => {
      $("#filterWorld").value = world.id;
      updateCategories();
    });
    grid.append(card);
  });
}

function updateCategories() {
  const worldId = $("#filterWorld").value;
  const categories = taxonomy.categories.filter((category) => !worldId || category.worldId === worldId);
  fillSelect($("#filterCategory"), categories, "Todas las categorías");
  updateSubcategories();
}

function updateSubcategories() {
  const categoryId = $("#filterCategory").value;
  const subcategories = taxonomy.subcategories.filter((item) => !categoryId || item.categoryId === categoryId);
  fillSelect($("#filterSubcategory"), subcategories, "Todas");
}

function fuzzyScore(query, candidate) {
  const q = normalize(query), c = normalize(candidate);
  if (!q || !c) return 0;
  if (c.includes(q)) return 1;
  const tokens = q.split(/\s+/);
  const matches = tokens.filter((token) => c.includes(token) || [...c].some((letter,index) => {
    const part = c.slice(index,index+token.length+1);
    return levenshtein(token,part) <= 1;
  }));
  return matches.length / tokens.length;
}

function levenshtein(a,b) {
  const row = Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let previous=row[0]; row[0]=i;
    for(let j=1;j<=b.length;j++){
      const old=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));
      previous=old;
    }
  }
  return row[b.length];
}

function applyFilters() {
  // El motor de consulta de productos se conectará a Supabase en la fase de catálogo.
  // Esta función centraliza los criterios para reutilizarlos sin duplicar lógica.
  const criteria = {
    query: $("#catalogSearch").value,
    world: $("#filterWorld").value,
    category: $("#filterCategory").value,
    subcategory: $("#filterSubcategory").value,
    audience: $("#filterAudience").value,
    season: $("#filterSeason").value,
    customizable: $("#filterCustom").value
  };
  document.dispatchEvent(new CustomEvent("cupissa:catalog-filters",{detail:criteria}));
}

function setupTheme() {
  const saved = localStorage.getItem("cupissa-theme");
  if (saved === "dark" || saved === "light") document.documentElement.dataset.theme = saved;
  $("#themeToggle")?.addEventListener("click",()=>{
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("cupissa-theme",next);
  });
}

function setupVoiceSearch() {
  const button = $("#voiceSearch");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { button.disabled = true; button.title = "Búsqueda por voz no disponible en este navegador"; return; }
  button.addEventListener("click",()=>{
    const recognition = new SpeechRecognition();
    recognition.lang = "es-CO"; recognition.interimResults = false;
    recognition.onresult = (event)=>{ $("#catalogSearch").value = event.results[0][0].transcript; applyFilters(); };
    recognition.start();
  });
}

function init() {
  $("#year").textContent = new Date().getFullYear();
  renderWorlds();
  fillSelect($("#filterWorld"),taxonomy.worlds.filter((x)=>x.active),"Todos los mundos");
  fillSelect($("#filterAudience"),taxonomy.audiences,"Todos");
  fillSelect($("#filterSeason"),taxonomy.seasons,"Todas");
  updateCategories();
  ["#catalogSearch","#filterWorld","#filterCategory","#filterSubcategory","#filterAudience","#filterSeason","#filterCustom"].forEach((selector)=>{
    $(selector)?.addEventListener("input",()=>{ if(selector==="#filterWorld") updateCategories(); if(selector==="#filterCategory") updateSubcategories(); applyFilters(); });
    $(selector)?.addEventListener("change",()=>{ if(selector==="#filterWorld") updateCategories(); if(selector==="#filterCategory") updateSubcategories(); applyFilters(); });
  });
  setupTheme(); setupVoiceSearch();
}
init();