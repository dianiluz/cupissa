/* ===================================================== */
/* UNIVERSO CUPISSA — CONEXIÓN GOOGLE SHEET ESTABLE */
/* ===================================================== */

let productosGlobal = [];
let headersGlobal = [];

let filtrosActivos = {};
let mundoActivo = null;
let busquedaActiva = "";

/* ========================= */
/* INIT */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  if (!CONFIG.sheetURL || CONFIG.sheetURL.includes("PEGA_AQUI")) {
    console.warn("⚠️ Debes configurar la URL del Google Sheet en config.js");
    return;
  }

  cargarProductos();
  inicializarBuscador();
  inicializarDrawerMobile();

});

/* ========================= */
/* CARGAR PRODUCTOS */
/* ========================= */

async function cargarProductos() {

  try {

    const container = document.getElementById("productosContainer");
    if (container) {
      container.innerHTML = "<p>Cargando productos...</p>";
    }

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

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) busquedaActiva = query;

    aplicarTodo();

  } catch (error) {
    console.error("Error cargando Sheet:", error);
  }
}

/* ========================= */
/* FUNCIÓN CENTRAL */
/* ========================= */

function aplicarTodo() {

  let resultado = [...productosGlobal];

  if (mundoActivo) {
    resultado = resultado.filter(p => p.mundo === mundoActivo);
  }

  Object.keys(filtrosActivos).forEach(col => {
    resultado = resultado.filter(p => p[col] === filtrosActivos[col]);
  });

  if (busquedaActiva) {
    const termino = busquedaActiva.toLowerCase();
    resultado = resultado.filter(p =>
      Object.values(p).some(valor =>
        String(valor).toLowerCase().includes(termino)
      )
    );
  }

  renderProductos(resultado);
  mostrarFiltrosActivos();
}

/* ========================= */
/* RENDER PRODUCTOS */
/* ========================= */

function renderProductos(lista) {

  const container = document.getElementById("productosContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  lista.forEach(producto => {

    const card = document.createElement("div");
    card.className = "producto-card";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "producto-img-wrapper";

    const img = document.createElement("img");
    img.src = producto.imagenurl || "";
    img.alt = producto.nombre || "";

    imgWrapper.appendChild(img);
    imgWrapper.addEventListener("click", () => abrirModal(producto));

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre || "";
    info.appendChild(nombre);

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
      agregarAlCarrito(producto, {}, qty.value);
    };

    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);

  });
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
      mundoActivo = mundo;
      activarMundo(btn);
      aplicarTodo();
    });

    mundosBar.appendChild(btn);
  });
}

function activarMundo(btnActivo) {
  document.querySelectorAll(".mundo-item").forEach(btn =>
    btn.classList.remove("active")
  );
  btnActivo.classList.add("active");
}

/* ========================= */
/* FILTROS */
/* ========================= */

function generarFiltros() {

  const filtrosContainer = document.getElementById("filtrosContainer");
  if (!filtrosContainer) return;

  filtrosContainer.innerHTML = "";

  /* ===== X MOBILE ===== */

  const headerMobile = document.createElement("div");
  headerMobile.className = "filtros-header-mobile";

  const cerrar = document.createElement("span");
  cerrar.id = "cerrarFiltrosMobile";
  cerrar.textContent = "✕";

  cerrar.addEventListener("click", () => {
    filtrosContainer.classList.remove("active");
  });

  headerMobile.appendChild(cerrar);
  filtrosContainer.appendChild(headerMobile);

  /* ===== FILTROS ===== */

  headersGlobal.forEach(header => {

    if (header.startsWith("*")) return;
    if (["imagenurl","ref","nombre","mundo"].includes(header)) return;

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
        filtrosActivos[header] = valor;
        aplicarTodo();
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
/* FILTROS ACTIVOS */
/* ========================= */

function mostrarFiltrosActivos() {

  const container = document.getElementById("filtrosActivos");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(filtrosActivos).forEach(col => {

    const tag = document.createElement("div");
    tag.className = "filtro-tag";
    tag.textContent = capitalizar(col) + ": " + capitalizar(filtrosActivos[col]);

    tag.addEventListener("click", () => {
      delete filtrosActivos[col];
      aplicarTodo();
    });

    container.appendChild(tag);
  });

  if (container.children.length > 0) {

    const limpiar = document.createElement("div");
    limpiar.className = "filtro-tag";
    limpiar.textContent = "Limpiar filtros";

    limpiar.addEventListener("click", () => {
      filtrosActivos = {};
      mundoActivo = null;
      busquedaActiva = "";
      aplicarTodo();
    });

    container.appendChild(limpiar);
  }
}

/* ========================= */
/* DRAWER MOBILE */
/* ========================= */

function inicializarDrawerMobile() {

  const abrirBtn = document.getElementById("abrirFiltrosMobile");
  const panel = document.getElementById("filtrosContainer");

  if (abrirBtn && panel) {
    abrirBtn.addEventListener("click", () => {
      panel.classList.add("active");
    });
  }
}

/* ========================= */
/* BUSCADOR */
/* ========================= */

function inicializarBuscador() {

  const searchInput = document.getElementById("globalSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {

    if (!window.location.pathname.includes("catalogo")) {

      if (this.value.trim().length > 2) {
        window.location.href = `/catalogo/?q=${encodeURIComponent(this.value.trim())}`;
      }

      return;
    }

    busquedaActiva = this.value.trim();
    aplicarTodo();
  });
}