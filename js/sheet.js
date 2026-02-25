/* ===================================================== */
/* UNIVERSO CUPISSA — SHEET*/
/* ===================================================== */

let productosGlobal = [];
let headersGlobal = [];

let filtrosActivos = {};
let mundoActivo = null;
let busquedaActiva = "";

/* ========================= */
/* FUNCIONES BÚSQUEDA INTELIGENTE */
/* ========================= */

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function distanciaLevenshtein(a, b) {
  const matriz = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenB; i++) matriz[i] = [i];
  for (let j = 0; j <= lenA; j++) matriz[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j - 1] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j] + 1
        );
      }
    }
  }

  return matriz[lenB][lenA];
}

function similitud(a, b) {
  const distancia = distanciaLevenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distancia / maxLen;
}

/* ========================= */
/* INIT */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  if (!CONFIG || !CONFIG.sheetURL) return;

  cargarProductos();
  inicializarBuscador();
  inicializarFiltrosMobile();
});

/* ========================= */
/* CARGAR PRODUCTOS */
/* ========================= */

async function cargarProductos() {

  try {

    mostrarSkeleton();

    const response = await fetch(CONFIG.sheetURL);
    const tsv = await response.text();
    const data = parseTSV(tsv);

    if (!data || !data.length) {
      productosGlobal = [];
      renderProductos([]);
      return;
    }

    headersGlobal = Object.keys(data[0]);

    // FILTRAR ACTIVOS
    const activos = data.filter(p => {
      const activo = String(p["*activo"] || p["activo"] || "")
        .toLowerCase()
        .trim();
      return activo === "si" || activo === "sí" || activo === "true";
    });

    /* ========================= */
    /* AGRUPAR PRODUCTOS POR *grupo */
    /* ========================= */

    const mapaGrupos = {};
    const productosFinales = [];

    activos.forEach(producto => {

  const claveGrupo = Object.keys(producto).find(k =>
    k.toLowerCase().replace(/\*/g, "").trim() === "grupo"
  );

  const grupo = claveGrupo
    ? String(producto[claveGrupo] || "").trim()
    : "";

  // Si no hay grupo → normal
  if (!grupo) {
    productosFinales.push({
      ...producto,
      imagenes: producto.imagenurl ? [producto.imagenurl] : []
    });
    return;
  }

  if (!mapaGrupos[grupo]) {

    mapaGrupos[grupo] = {
      ...producto,
      imagenes: producto.imagenurl ? [producto.imagenurl] : []
    };

  } else {

    // Agregar imagen
    if (
      producto.imagenurl &&
      !mapaGrupos[grupo].imagenes.includes(producto.imagenurl)
    ) {
      mapaGrupos[grupo].imagenes.push(producto.imagenurl);
    }

    // 🔥 CONSOLIDAR VARIANTES (#...)
    Object.keys(producto).forEach(key => {
      const valor = producto[key];
      if (typeof valor === "string" && valor.startsWith("#")) {
        mapaGrupos[grupo][key] = valor;
      }
    });
  }

});

    // Agregar grupos consolidados
    Object.values(mapaGrupos).forEach(p => {
      productosFinales.push(p);
    });

    // SI POR ALGUNA RAZÓN NO HAY GRUPOS, NO ROMPE
    productosGlobal = productosFinales.length
      ? productosFinales
      : activos.map(p => ({
          ...p,
          imagenes: p.imagenurl ? [p.imagenurl] : []
        }));

    generarMundos();
    generarFiltros();

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && query.trim()) {
      busquedaActiva = query.trim();
    }

    aplicarTodo();

  } catch (error) {
    console.error("Error cargando Sheet:", error);
    productosGlobal = [];
    renderProductos([]);
  }
}

/* ========================= */
/* SKELETON */
/* ========================= */

function mostrarSkeleton() {
  const container = document.getElementById("productosContainer");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton skeleton-card";
    container.appendChild(skeleton);
  }
}

/* ========================= */
/* FUNCIÓN CENTRAL */
/* ========================= */

function aplicarTodo() {

  let resultado = productosGlobal.slice();

  if (mundoActivo) {
    resultado = resultado.filter(p => p.mundo === mundoActivo);
  }

  Object.keys(filtrosActivos).forEach(col => {
    resultado = resultado.filter(p => p[col] === filtrosActivos[col]);
  });

  if (busquedaActiva && busquedaActiva.trim()) {

    const termino = normalizarTexto(busquedaActiva);

    const coincidenciasExactas = [];
    const coincidenciasParciales = [];
    const coincidenciasFuzzy = [];

    resultado.forEach(producto => {

      const textoProducto = normalizarTexto(
        Object.values(producto).join(" ")
      );

      if (textoProducto.includes(termino)) {
        coincidenciasExactas.push(producto);
      } else {

        const palabrasProducto = textoProducto.split(" ");
        let mejorSimilitud = 0;

        palabrasProducto.forEach(palabra => {
          const score = similitud(termino, palabra);
          if (score > mejorSimilitud) mejorSimilitud = score;
        });

        if (mejorSimilitud >= 0.75) {
          coincidenciasFuzzy.push(producto);
        }
      }
    });

    resultado = [
      ...coincidenciasExactas,
      ...coincidenciasFuzzy
    ];
  }

  renderProductos(resultado);
  mostrarFiltrosActivos();
}

/* ========================= */
/* MUNDOS */
/* ========================= */

function generarMundos() {

  const mundosBar = document.getElementById("mundosBar");
  if (!mundosBar) return;

  mundosBar.innerHTML = "";

  const mundosUnicos = [...new Set(
    productosGlobal
      .map(p => p.mundo)
      .filter(v => v && v.trim())
  )];

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
  document.querySelectorAll(".mundo-item")
    .forEach(btn => btn.classList.remove("active"));
  btnActivo.classList.add("active");
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
    if (["imagenurl","ref","nombre","mundo"].includes(header)) return;

    const valoresUnicos = [...new Set(
      productosGlobal
        .map(p => p[header])
        .filter(v => v && !String(v).startsWith("#"))
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

  // Reset visual del grupo actual
  contenido.querySelectorAll(".filtro-opcion")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");

  // 🔥 Cerrar acordeón automáticamente
  contenido.classList.remove("active");

  aplicarTodo();

  // 🔥 Si es móvil → cerrar panel completo
  if (window.innerWidth <= 1024) {

    const panel = document.getElementById("filtrosContainer");

    if (panel) {
      panel.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }

});

      contenido.appendChild(btn);
    });

    titulo.addEventListener("click", () => {

  // Cerrar todos los demás
  document.querySelectorAll(".filtro-contenido")
    .forEach(c => {
      if (c !== contenido) {
        c.classList.remove("active");
      }
    });

  // Toggle actual
  contenido.classList.toggle("active");
});

    grupo.appendChild(titulo);
    grupo.appendChild(contenido);

    filtrosContainer.appendChild(grupo);
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
    container.innerHTML = "<p style='padding:20px;'>No se encontraron productos.</p>";
    return;
  }

  lista.forEach(producto => {

    const card = document.createElement("div");
    card.className = "producto-card fade-in";

    /* ========================= */
    /* IMAGEN / SLIDER */
    /* ========================= */

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "producto-img-wrapper";

    const imagenes = producto.imagenes && producto.imagenes.length
      ? producto.imagenes
      : (producto.imagenurl ? [producto.imagenurl] : []);

    let indiceActual = 0;

    const img = document.createElement("img");
    img.src = imagenes[0] || "";
    img.alt = producto.nombre;

    imgWrapper.appendChild(img);

    if (imagenes.length > 1) {

      const btnPrev = document.createElement("div");
      btnPrev.className = "slider-btn prev";
      btnPrev.innerHTML = "‹";

      const btnNext = document.createElement("div");
      btnNext.className = "slider-btn next";
      btnNext.innerHTML = "›";

      btnPrev.onclick = (e) => {
        e.stopPropagation();
        indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
        img.src = imagenes[indiceActual];
      };

      btnNext.onclick = (e) => {
        e.stopPropagation();
        indiceActual = (indiceActual + 1) % imagenes.length;
        img.src = imagenes[indiceActual];
      };

      imgWrapper.appendChild(btnPrev);
      imgWrapper.appendChild(btnNext);
    }

    imgWrapper.addEventListener("click", () => abrirModal(producto));

    /* ========================= */
    /* INFO */
    /* ========================= */

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre || "";

    info.appendChild(nombre);

    /* ========================= */
    /* VARIANTES EN TARJETA */
    /* ========================= */

    const variantesSeleccionadas = {};

    Object.keys(producto).forEach(key => {

      const valor = producto[key];

      if (typeof valor === "string" && valor.startsWith("#")) {

        const opciones = valor.substring(1).split("|");

        const select = document.createElement("select");
        select.className = "producto-select";
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

        select.addEventListener("change", function() {
          variantesSeleccionadas[key] = this.value;
        });

        info.appendChild(select);
      }

    });

    /* ========================= */
    /* BOTÓN AGREGAR */
    /* ========================= */

    const btn = document.createElement("button");
    btn.className = "btn-agregar";
    btn.textContent = "Agregar";

    btn.onclick = () => {

      const selects = info.querySelectorAll("select");

      for (let select of selects) {
        if (!select.value) {
          alert("Debes seleccionar " + select.dataset.columna);
          return;
        }
      }

      agregarAlCarrito(producto, variantesSeleccionadas, 1);
    };

    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);

  });
}

/* ========================= */
/* FILTROS ACTIVOS */
/* ========================= */

function mostrarFiltrosActivos() {

  const container = document.getElementById("filtrosActivos");
  if (!container) return;

  container.innerHTML = "";

  function crearTag(texto, onRemove) {

    const tag = document.createElement("div");
    tag.className = "filtro-tag";

    const spanTexto = document.createElement("span");
    spanTexto.textContent = texto;

    const btnCerrar = document.createElement("span");
    btnCerrar.className = "filtro-tag-close";
    btnCerrar.textContent = "✕";

    btnCerrar.addEventListener("click", (e) => {
      e.stopPropagation();
      onRemove();
    });

    tag.appendChild(spanTexto);
    tag.appendChild(btnCerrar);

    container.appendChild(tag);
  }

  // Filtros laterales
  Object.keys(filtrosActivos).forEach(col => {

    crearTag(
      capitalizar(col) + ": " + capitalizar(filtrosActivos[col]),
      () => {
        delete filtrosActivos[col];

        // reset visual del acordeón
        document.querySelectorAll(".filtro-opcion")
          .forEach(btn => {
            if (btn.textContent.trim().toLowerCase() === 
                filtrosActivos[col]?.toLowerCase()) {
              btn.classList.remove("active");
            }
          });

        aplicarTodo();
      }
    );

  });

  // Mundo
  if (mundoActivo) {
    crearTag("Mundo: " + capitalizar(mundoActivo), () => {
      mundoActivo = null;
      document.querySelectorAll(".mundo-item")
        .forEach(btn => btn.classList.remove("active"));
      aplicarTodo();
    });
  }

  // Búsqueda
  if (busquedaActiva) {
    crearTag("Búsqueda: " + busquedaActiva, () => {
      busquedaActiva = "";
      const input = document.getElementById("globalSearch");
      if (input) input.value = "";
      aplicarTodo();
    });
  }

  // Limpiar todo
  if (container.children.length > 0) {

    const limpiar = document.createElement("div");
    limpiar.className = "filtro-tag limpiar";
    limpiar.textContent = "Limpiar todo";

    limpiar.addEventListener("click", () => {

      filtrosActivos = {};
      mundoActivo = null;
      busquedaActiva = "";

      const input = document.getElementById("globalSearch");
      if (input) input.value = "";

      document.querySelectorAll(".filtro-opcion")
        .forEach(btn => btn.classList.remove("active"));

      document.querySelectorAll(".mundo-item")
        .forEach(btn => btn.classList.remove("active"));

      aplicarTodo();
    });

    container.appendChild(limpiar);
  }
}

/* ========================= */
/* BUSCADOR */
/* ========================= */

function inicializarBuscador() {

  const searchInput = document.getElementById("globalSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {

    const texto = this.value.trim();

    if (!window.location.pathname.includes("catalogo")) {
      if (texto.length > 2) {
        window.location.href = `/catalogo/?q=${encodeURIComponent(texto)}`;
      }
      return;
    }

    busquedaActiva = texto;
    aplicarTodo();
  });
}

/* ========================= */
/* FILTROS MOBILE */
/* ========================= */

function inicializarFiltrosMobile() {

  const btn = document.getElementById("btnFiltrosMobile");
  const panel = document.getElementById("filtrosContainer");

  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    panel.classList.add("active");
    document.body.style.overflow = "hidden";
  });
}