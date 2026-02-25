/* ===================================================== */
/* UNIVERSO CUPISSA — CONEXIÓN GOOGLE SHEET */
/* ===================================================== */

let productosGlobal = [];
let headersGlobal = [];
let filtrosActivos = {};

document.addEventListener("DOMContentLoaded", () => {
  if (CONFIG.sheetURL.includes("PEGA_AQUI")) {
    console.warn("⚠️ Debes configurar la URL del Google Sheet en config.js");
    return;
  }

  cargarProductos();
});

async function cargarProductos() {
  try {

    mostrarSkeleton();

    const response = await fetch(CONFIG.sheetURL);
    const tsv = await response.text();
    const data = parseTSV(tsv);

    if (!data.length) return;

    headersGlobal = Object.keys(data[0]);

    productosGlobal = data.filter(p => {
      const activo = p["*activo"]?.toLowerCase();
      return activo === "si" || activo === "sí" || activo === "true";
    });

    generarMundos();
    generarFiltros();
    renderProductos(productosGlobal);

  } catch (error) {
    console.error("Error cargando Sheet:", error);
  }
}

/* ========================= */
/* SKELETON */
/* ========================= */

function mostrarSkeleton() {
  const container = document.querySelector(".productos-container");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton skeleton-card";
    container.appendChild(skeleton);
  }
}

/* ========================= */
/* MUNDOS */
/* ========================= */

function generarMundos() {

  const mundosBar = document.getElementById("mundosBar");
  if (!mundosBar) return;

  const mundosUnicos = [...new Set(productosGlobal.map(p => p.mundo).filter(Boolean))];

  mundosBar.innerHTML = "";

  mundosUnicos.forEach(mundo => {

    const btn = document.createElement("button");
    btn.className = "mundo-item";
    btn.textContent = capitalizar(mundo);

    btn.addEventListener("click", () => {
      filtrarPorMundo(mundo);
      activarMundo(btn);
    });

    mundosBar.appendChild(btn);
  });
}

function activarMundo(btnActivo) {
  document.querySelectorAll(".mundo-item").forEach(btn => {
    btn.classList.remove("active");
  });
  btnActivo.classList.add("active");
}

function filtrarPorMundo(mundo) {
  const filtrados = productosGlobal.filter(p => p.mundo === mundo);
  renderProductos(filtrados);
}

/* ========================= */
/* RENDER PRODUCTOS */
/* ========================= */

function renderProductos(lista) {

  const container = document.getElementById("productosContainer");
  if (!container) return;

  container.innerHTML = "";

  lista.forEach(producto => {

    const card = document.createElement("div");
    card.className = "producto-card fade-in";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "producto-img-wrapper";

    const img = document.createElement("img");
    img.src = producto.imagenurl || "";
    img.alt = producto.nombre || "";

    imgWrapper.appendChild(img);
    imgWrapper.addEventListener("click", () => abrirModal(producto));

    /* Badge */
    if (producto["*personalizable"]?.toLowerCase() === "si") {
      const badge = document.createElement("div");
      badge.className = "producto-badge";
      badge.textContent = "Personalizable";
      imgWrapper.appendChild(badge);
    }

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre || "";
    info.appendChild(nombre);

    /* Variantes */
    Object.keys(producto).forEach(key => {

      const valor = producto[key];

      if (valor && typeof valor === "string" && valor.startsWith("#")) {

        const opciones = valor.substring(1).split("|");

        const select = document.createElement("select");
        select.className = "modal-select";
        select.dataset.columna = key;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona " + capitalizar(key);
        select.appendChild(defaultOption);

        opciones.forEach(op => {
          const option = document.createElement("option");
          option.value = op.trim();
          option.textContent = op.trim();
          select.appendChild(option);
        });

        info.appendChild(select);
      }
    });

    const qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.value = "1";
    qty.className = "modal-qty";
    info.appendChild(qty);

    const btn = document.createElement("button");
    btn.className = "btn-agregar";
    btn.textContent = "Agregar";

    btn.onclick = () => {

      const selects = info.querySelectorAll("select");
      let variantesSeleccionadas = {};

      for (let select of selects) {
        if (!select.value) {
          alert("Debes seleccionar " + select.dataset.columna);
          return;
        }
        variantesSeleccionadas[select.dataset.columna] = select.value;
      }

      agregarAlCarrito(producto, variantesSeleccionadas, qty.value);
    };

    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);

  });
}

/* ========================= */
/* FILTROS */
/* ========================= */

function generarFiltros() {

  const filtrosContainer = document.getElementById("filtrosContainer");
  if (!filtrosContainer) return;

  filtrosContainer.innerHTML = `
  <div class="filtros-header-mobile">
    <span>Filtros</span>
    <span id="cerrarFiltrosMobile" class="cerrar-filtros">✕</span>
  </div>
`;

const cerrarBtn = document.getElementById("cerrarFiltrosMobile");

if (cerrarBtn) {
  cerrarBtn.addEventListener("click", () => {
    filtrosContainer.classList.remove("active");
    document.body.style.overflow = "auto";
  });
}

  headersGlobal.forEach(header => {

    if (header.startsWith("*")) return;
    if (header === "imagenurl" || header === "ref" || header === "nombre") return;

    const valoresUnicos = [...new Set(
      productosGlobal
        .map(p => p[header])
        .filter(v => v && !v.startsWith("#"))
    )];

    if (!valoresUnicos.length) return;

    const grupo = document.createElement("div");
    grupo.className = "filtro-grupo";

    const titulo = document.createElement("div");
    titulo.className = "filtro-titulo";
    titulo.textContent = capitalizar(header);

    const contenido = document.createElement("div");
    contenido.className = "filtro-contenido";

    valoresUnicos.forEach(valor => {

      const btn = document.createElement("button");
      btn.textContent = capitalizar(valor);
      btn.className = "filtro-opcion";

      btn.addEventListener("click", () => {
        activarFiltro(header, valor);
      });

      contenido.appendChild(btn);
    });

    titulo.addEventListener("click", () => {
      contenido.classList.toggle("active");
    });

    grupo.appendChild(titulo);
    grupo.appendChild(contenido);

    filtrosContainer.appendChild(grupo);

  });
}

/* ========================= */
/* FILTROS MOBILE CONTROL */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btnFiltrosMobile");
  const panel = document.getElementById("filtrosContainer");
  const cerrar = document.getElementById("cerrarFiltrosMobile");

  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    panel.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      panel.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

});
