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

  filtrosContainer.innerHTML = "";

  headersGlobal.forEach(header => {

    if (header.startsWith("*")) return;
    if (header === "imagenurl" || header === "ref" || header === "nombre") return;

    const valoresUnicos = [...new Set(productosGlobal.map(p => p[header]).filter(v => v && !v.startsWith("#")))];

    if (!valoresUnicos.length) return;

    const grupo = document.createElement("div");
    grupo.style.marginBottom = "20px";

    const titulo = document.createElement("h4");
    titulo.textContent = capitalizar(header);
    grupo.appendChild(titulo);

    valoresUnicos.forEach(valor => {

      const btn = document.createElement("button");
      btn.textContent = capitalizar(valor);
      btn.className = "mundo-item";
      btn.style.marginTop = "5px";

      btn.addEventListener("click", () => {
        activarFiltro(header, valor);
      });

      grupo.appendChild(btn);
    });

    filtrosContainer.appendChild(grupo);
  });
}

function activarFiltro(columna, valor) {
  filtrosActivos[columna] = valor;
  aplicarFiltros();
  mostrarFiltrosActivos();
}

function aplicarFiltros() {
  let filtrados = productosGlobal;

  Object.keys(filtrosActivos).forEach(col => {
    filtrados = filtrados.filter(p => p[col] === filtrosActivos[col]);
  });

  renderProductos(filtrados);
}

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
      aplicarFiltros();
      mostrarFiltrosActivos();
    });

    container.appendChild(tag);
  });

  if (Object.keys(filtrosActivos).length) {

    const limpiar = document.createElement("div");
    limpiar.className = "filtro-tag";
    limpiar.textContent = "Limpiar filtros";

    limpiar.addEventListener("click", () => {
      filtrosActivos = {};
      aplicarFiltros();
      mostrarFiltrosActivos();
    });

    container.appendChild(limpiar);
  }
}

/* ========================= */
/* ACTUALIZAR ICONOS FAVORITOS */
/* ========================= */

window.actualizarIconosFavoritos = function () {

  const favoritosActuales = obtenerLocal("cupissa_favoritos") || [];
  const corazones = document.querySelectorAll(".producto-fav");

  corazones.forEach(corazon => {

    const ref = corazon.dataset.ref;
    const existe = favoritosActuales.find(p => p.ref === ref);

    if (existe) {
      corazon.classList.add("active");
      corazon.innerHTML = "♥";
    } else {
      corazon.classList.remove("active");
      corazon.innerHTML = "♡";
    }

  });

};