/* ===================================================== */
/* UNIVERSO CUPISSA — CONEXIÓN GOOGLE SHEET ESTABLE */
/* ===================================================== */

let productosGlobal = [];
let headersGlobal = [];

let filtrosActivos = {};
let mundoActivo = null;
let busquedaActiva = "";

let searchTimeout = null;

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
    resultado = resultado.filter(p =>
      String(p.mundo).toLowerCase() === String(mundoActivo).toLowerCase()
    );
  }

  Object.keys(filtrosActivos).forEach(col => {
    resultado = resultado.filter(p =>
      String(p[col]).toLowerCase() === String(filtrosActivos[col]).toLowerCase()
    );
  });

  if (busquedaActiva) {
    const termino = busquedaActiva.toLowerCase();

    resultado = resultado.filter(p =>
      [p.nombre, p.mundo]
        .filter(Boolean)
        .some(valor =>
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
    img.loading = "lazy";

    imgWrapper.appendChild(img);
    imgWrapper.addEventListener("click", () => {
      if (typeof abrirModal === "function") {
        abrirModal(producto);
      }
    });

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
      if (typeof agregarAlCarrito === "function") {
        agregarAlCarrito(producto, {}, qty.value);
      }
    };

    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);

  });
}

/* ========================= */
/* BUSCADOR */
/* ========================= */

function inicializarBuscador() {

  const searchInput = document.getElementById("globalSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

      if (!window.location.pathname.includes("catalogo")) {

        if (this.value.trim().length > 2) {
          window.location.href = `/catalogo/?q=${encodeURIComponent(this.value.trim())}`;
        }

        return;
      }

      busquedaActiva = this.value.trim();
      aplicarTodo();

    }, 300);

  });
}