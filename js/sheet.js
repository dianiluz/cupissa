/* ===================================================== */
/* CUPISSA — MOTOR CATÁLOGO COMPLETO + PRECIO DINÁMICO */
/* FIX VISUALIZACIÓN MUNDOS */
/* ===================================================== */

let productosGlobal = [];
let headersGlobal = [];
let variacionesGlobal = [];

let filtrosActivos = {};
let mundoActivo = null;
let busquedaActiva = "";

/* ========================= */
/* INIT */
/* ========================= */

document.addEventListener("DOMContentLoaded", async () => {

  if (!CONFIG.sheetURL || CONFIG.sheetURL.includes("PEGA_AQUI")) {
    return;
  }

  await cargarVariaciones();
  await cargarProductos();
  inicializarBuscador();

  if (typeof inicializarDrawerMobile === "function") {
    inicializarDrawerMobile();
  }

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
      String(p["*activo"]).trim().toLowerCase() === "si"
    );

    generarMundos();
    generarFiltros();
    aplicarTodo();

  } catch (error) {
    console.error(error);
  }
}

/* ========================= */
/* CARGAR VARIACIONES */
/* ========================= */

async function cargarVariaciones() {

  try {
    const response = await fetch(getSheetURL(CONFIG.gids.VARIACIONES));
    const tsv = await response.text();
    variacionesGlobal = parseTSV(tsv);
  } catch (error) {
    console.error(error);
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
    const termino = busquedaActiva.toLowerCase();
    resultado = resultado.filter(p =>
      Object.values(p).join(" ").toLowerCase().includes(termino)
    );
  }

  renderProductos(resultado);
  mostrarFiltrosActivos();
  actualizarVisualFiltros();
}

/* ========================= */
/* MUNDOS — FIX */
/* ========================= */

function generarMundos() {

  const contenedorPadre = document.getElementById("mundos");
  if (!contenedorPadre) return;

  // Crear barra interna si no existe
  let bar = document.getElementById("mundosBar");

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "mundosBar";
    bar.className = "mundos-bar";
    contenedorPadre.innerHTML = "";
    contenedorPadre.appendChild(bar);
  }

  const mundos = [...new Set(
    productosGlobal
      .map(p => p.mundo)
      .filter(Boolean)
      .map(m => String(m).trim())
  )];

  bar.innerHTML = "";

  if (!mundos.length) return;

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

  // Activar primero por defecto
  const primerBtn = bar.querySelector(".mundo-item");
  if (primerBtn) primerBtn.classList.add("active");
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
      productosGlobal.map(p => p[header]).filter(v => v)
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

      const valor = String(valorOriginal).trim();

      const btn = document.createElement("button");
      btn.className = "filtro-opcion";
      btn.textContent = capitalizar(valor);

      btn.addEventListener("click", () => {

        if (filtrosActivos[header] === valor) {
          delete filtrosActivos[header];
        } else {
          filtrosActivos[header] = valor;
        }

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

  Object.keys(filtrosActivos).forEach(col => {

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
    img.onclick = () => abrirModal(p);

    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = p.nombre;

    info.appendChild(nombre);

    const precioDiv = document.createElement("div");
    precioDiv.className = "producto-precio";

    const precioBase = Number(p["*precio_base"]) || 0;
    precioDiv.textContent = formatearCOP(precioBase);

    info.appendChild(precioDiv);

    /* VARIABLES # */
    const selects = [];

    Object.keys(p).forEach(key => {

      const valor = p[key];

      if (typeof valor === "string" && valor.startsWith("#")) {

        const opciones = valor.substring(1).split("|");

        const select = document.createElement("select");
        select.className = "modal-select";
        select.dataset.columna = key.replace("*","").trim();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona " + capitalizar(select.dataset.columna);
        select.appendChild(defaultOption);

        opciones.forEach(op => {
          const option = document.createElement("option");
          option.value = op.trim();
          option.textContent = op.trim();
          select.appendChild(option);
        });

        select.addEventListener("change", () => {
          actualizarPrecioTarjeta(p, selects, precioDiv);
        });

        selects.push(select);
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

      const variantes = {};

      for (let select of selects) {
        if (!select.value) {
          alert("Debes seleccionar " + select.dataset.columna);
          return;
        }
        variantes[select.dataset.columna] = select.value;
      }

      agregarAlCarrito(p, variantes, qty.value);
    };

    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);

  });
}


function actualizarPrecioTarjeta(producto, selects, precioDiv) {

  const variantes = {};

  selects.forEach(select => {
    if (select.value) {
      variantes[select.dataset.columna] = select.value;
    }
  });

  const incremento = calcularIncremento(producto, variantes);
  const precioBase = Number(producto["*precio_base"]) || 0;
  const nuevoPrecio = precioBase + incremento;

  precioDiv.textContent = formatearCOP(nuevoPrecio);
}

/* ========================= */
/* BUSCADOR */
/* ========================= */

function inicializarBuscador() {

  const desktopInput = document.getElementById("globalSearch");
  if (!desktopInput) return;

  desktopInput.addEventListener("input", function () {
    busquedaActiva = this.value.trim();
    aplicarTodo();
  });
}