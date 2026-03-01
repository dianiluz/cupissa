/* ===================================================== */
/* CUPISSA — MOTOR CATÁLOGO ESTABLE DEFINITIVO */
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
    console.warn("⚠️ Configura sheetURL en config.js");
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

  const container = document.getElementById("productosContainer");
  if (container) container.innerHTML = "<p>Cargando productos...</p>";

  try {

    const response = await fetch(CONFIG.sheetURL);
    const tsv = await response.text();
    const data = parseTSV(tsv);

    if (!data.length) return;

    headersGlobal = Object.keys(data[0]);

    productosGlobal = data.filter(p =>
      p["*activo"]?.toLowerCase() === "si"
    );

    generarMundos();
    generarFiltros();
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
      String(p.mundo).trim().toLowerCase() ===
      String(mundoActivo).trim().toLowerCase()
    );
  }

  Object.entries(filtrosActivos).forEach(([col, valor]) => {
    resultado = resultado.filter(p =>
      String(p[col]).trim().toLowerCase() ===
      String(valor).trim().toLowerCase()
    );
  });

  if (busquedaActiva) {
    const termino = busquedaActiva.toLowerCase().trim();
    resultado = resultado.filter(p =>
      Object.values(p)
        .join(" ")
        .toLowerCase()
        .includes(termino)
    );
  }

  renderProductos(resultado);
  mostrarFiltrosActivos();
  actualizarVisualFiltros();
}

/* ========================= */
/* MUNDOS */
/* ========================= */

function generarMundos() {

  const bar = document.getElementById("mundosBar");
  if (!bar) return;

  const mundos = [...new Set(productosGlobal.map(p => p.mundo).filter(Boolean))];

  bar.innerHTML = "";

  mundos.forEach(m => {

    const btn = document.createElement("button");
    btn.className = "mundo-item";
    btn.textContent = capitalizar(m);

    btn.onclick = () => {

      document.querySelectorAll(".mundo-item")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      mundoActivo = m;
      aplicarTodo();
    };

    bar.appendChild(btn);
  });
}

/* ========================= */
/* GENERAR FILTROS */
/* ========================= */

function generarFiltros() {

  const filtrosContainer = document.getElementById("filtrosContainer");
  if (!filtrosContainer) return;

  const scrollContainer = document.querySelector(".filtros-contenido-scroll");
  const target = scrollContainer || filtrosContainer;

  target.innerHTML = "";

  headersGlobal.forEach(headerOriginal => {

    const header = headerOriginal.trim();

    if (header.startsWith("*")) return;
    if (["imagenurl", "ref", "nombre", "mundo"].includes(header)) return;

    const valoresUnicos = [...new Set(
      productosGlobal
        .map(p => p[header])
        .filter(v => v)
    )];

    if (!valoresUnicos.length) return;

    const grupo = document.createElement("div");
    grupo.className = "filtro-grupo";

    const titulo = document.createElement("div");
    titulo.className = "filtro-titulo";
    titulo.textContent = capitalizar(header);

    const contenido = document.createElement("div");
    contenido.className = "filtro-contenido";

    valoresUnicos.forEach(valorOriginal => {

  const headerKey = header; // 🔒 variable fija
  const valor = String(valorOriginal).trim();

  const btn = document.createElement("button");
  btn.className = "filtro-opcion";
  btn.textContent = capitalizar(valor);

  btn.addEventListener("click", () => {

    if (filtrosActivos[headerKey] === valor) {
      delete filtrosActivos[headerKey];
    } else {
      filtrosActivos[headerKey] = valor;
    }

    console.log("Ahora filtrosActivos:", filtrosActivos); // debug

    aplicarTodo();
  });

  contenido.appendChild(btn);
});

    titulo.addEventListener("click", () => {
      contenido.classList.toggle("active");
    });

    grupo.appendChild(titulo);
    grupo.appendChild(contenido);
    target.appendChild(grupo);

  });
}

/* ========================= */
/* FILTROS ACTIVOS */
/* ========================= */

function mostrarFiltrosActivos() {

  const container = document.getElementById("filtrosActivos");
  if (!container) return;

  container.innerHTML = "";

  const claves = Object.keys(filtrosActivos);

  if (claves.length === 0) return;

  claves.forEach(col => {

    const valor = filtrosActivos[col];

    const tag = document.createElement("div");
    tag.className = "filtro-tag";

    tag.innerHTML = `
      ${capitalizar(col)}: ${capitalizar(valor)}
      <span class="cerrar-tag">✕</span>
    `;

    tag.querySelector(".cerrar-tag").addEventListener("click", () => {
      delete filtrosActivos[col];
      aplicarTodo();
    });

    container.appendChild(tag);
  });

  const limpiar = document.createElement("div");
  limpiar.className = "filtro-tag limpiar-todos";
  limpiar.textContent = "Limpiar filtros";

  limpiar.addEventListener("click", () => {
    filtrosActivos = {};
    mundoActivo = null;
    busquedaActiva = "";
    aplicarTodo();
  });

  container.appendChild(limpiar);
}

/* ========================= */
/* VISUAL FILTROS */
/* ========================= */

function actualizarVisualFiltros() {

  document.querySelectorAll(".filtro-opcion").forEach(btn => {

    const texto = btn.textContent.trim().toLowerCase();

    let activo = false;

    Object.values(filtrosActivos).forEach(valor => {
      if (String(valor).trim().toLowerCase() === texto) {
        activo = true;
      }
    });

    btn.classList.toggle("active", activo);
  });
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

  lista.forEach(p => {

    const card = document.createElement("div");
    card.className = "producto-card";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "producto-img-wrapper";

    const img = document.createElement("img");
    img.src = p.imagenurl;
    img.alt = p.nombre;

    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = p.nombre;

    info.appendChild(nombre);

    /* Variables dinámicas (#) */
    headersGlobal.forEach(header => {

      if (!header.startsWith("*")) return;

      const valor = p[header];
      if (!valor) return;

      if (valor.startsWith("#")) {

        const select = document.createElement("select");
        select.className = "modal-select";

        const opciones = valor.substring(1).split("|");

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

    const btn = document.createElement("button");
    btn.className = "btn-agregar";
    btn.textContent = "Agregar";

    btn.onclick = () => {

  const variantesSeleccionadas = {};

  info.querySelectorAll("select").forEach(select => {
    const nombreVariable = select.previousSibling?.textContent || "Variante";
    variantesSeleccionadas[nombreVariable] = select.value;
  });

  agregarAlCarrito(p, variantesSeleccionadas, qty.value);
};

    info.appendChild(qty);
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

  const desktopInput = document.getElementById("globalSearch");
  const mobileInput = document.getElementById("mobileSearchInput");

  const clearMobile = document.getElementById("clearMobileSearch");
  const clearDesktop = document.getElementById("clearDesktopSearch");

  function actualizarBusqueda(valor) {
    busquedaActiva = valor.trim();
    aplicarTodo();
  }

  /* DESKTOP */
  if (desktopInput) {

    desktopInput.addEventListener("input", function () {

      actualizarBusqueda(this.value);

      if (clearDesktop) {
        clearDesktop.style.display = this.value.length ? "block" : "none";
      }

    });

    if (clearDesktop) {
      clearDesktop.addEventListener("click", function () {
        desktopInput.value = "";
        this.style.display = "none";
        actualizarBusqueda("");
      });
    }
  }

  /* MOBILE */
  if (mobileInput) {

    mobileInput.addEventListener("input", function () {

      actualizarBusqueda(this.value);

      if (clearMobile) {
        clearMobile.style.display = this.value.length ? "block" : "none";
      }

    });

    if (clearMobile) {
      clearMobile.addEventListener("click", function () {
        mobileInput.value = "";
        this.style.display = "none";
        actualizarBusqueda("");
      });
    }
  }

}
