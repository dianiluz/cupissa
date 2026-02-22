/* =========================
   CONFIG GOOGLE SHEETS
========================= */

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

let productosGlobal = [];
let mundoActivo = null;

let filtrosActivos = {
  categoria: null,
  genero: null,
  ocasion: null
};

/* =========================
   CARGA PRINCIPAL
========================= */

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n");

    productosGlobal = filas.slice(1).map(fila => {

      const valores = fila.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      if (!valores) return null;

      return {
        ref: valores[0]?.replace(/"/g, ""),
        nombre: valores[1]?.replace(/"/g, ""),
        imagenurl: valores[2]?.replace(/"/g, ""),
        mundo: valores[3]?.replace(/"/g, ""),
        categoria: valores[4]?.replace(/"/g, ""),
        talla: valores[7]?.replace(/"/g, ""),
        genero: valores[9]?.replace(/"/g, ""),
        ocasion: valores[10]?.replace(/"/g, ""),
        palabras_clave: valores[12]?.replace(/"/g, ""),
        activo: valores[13]?.replace(/"/g, "").trim().toLowerCase()
      };

    }).filter(p => p && (p.activo === "true" || p.activo === "si"));

    mostrarProductos(productosGlobal);
    cargarMundos();
    cargarFiltrosLaterales();
  });

/* =========================
   MOSTRAR PRODUCTOS
========================= */

function mostrarProductos(productos) {

  const container = document.getElementById("productos-container");
  if (!container) return;

  container.innerHTML = "";

  productos.forEach((producto, index) => {

    const tieneTalla = producto.talla && producto.talla !== "";
    const tallas = tieneTalla ? producto.talla.split("|") : [];

    container.innerHTML += `
      <div class="card-producto">

        <div class="img-container">
          <img src="/assets/img/${producto.imagenurl}" 
               alt="${producto.nombre}" 
               onclick="abrirModal('/assets/img/${producto.imagenurl}')">

          <span class="btn-favorito ${esFavorito(producto.ref) ? 'activo' : ''}"
            onclick="toggleFavorito('${producto.ref}','${producto.nombre}','${producto.imagenurl}', this)">
            ♥
          </span>
        </div>

        <h3>${producto.nombre}</h3>

        ${tieneTalla ? `
          <select id="talla-${index}">
            ${tallas.map(t => `<option value="${t}">${t}</option>`).join("")}
          </select>
        ` : ""}

        <div class="cantidad-box">
          <button onclick="cambiarCantidad(${index}, -1)">-</button>
          <span id="cantidad-${index}">1</span>
          <button onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>

        <button class="btn-cotizar" onclick="agregarAlCarrito(${index})">
          Agregar al carrito
        </button>

      </div>
    `;
  });
}

/* =========================
   AGREGAR AL CARRITO
========================= */

function agregarAlCarrito(index) {

  const producto = productosGlobal[index];

  const cantidadSpan = document.getElementById(`cantidad-${index}`);
  const cantidad = parseInt(cantidadSpan.textContent);

  const selectTalla = document.getElementById(`talla-${index}`);
  const tallaSeleccionada = selectTalla ? selectTalla.value : "No aplica";

  const itemExistente = carrito.find(item => item.ref === producto.ref);

  if (itemExistente) {

    if (itemExistente.tallas[tallaSeleccionada]) {
      itemExistente.tallas[tallaSeleccionada] += cantidad;
    } else {
      itemExistente.tallas[tallaSeleccionada] = cantidad;
    }

  } else {

    carrito.push({
      ref: producto.ref,
      nombre: producto.nombre,
      imagen: producto.imagenurl,
      tallas: {
        [tallaSeleccionada]: cantidad
      }
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

/* =========================
   CANTIDAD
========================= */

function cambiarCantidad(index, cambio) {

  const span = document.getElementById(`cantidad-${index}`);
  let valor = parseInt(span.textContent);

  valor += cambio;
  if (valor < 1) valor = 1;

  span.textContent = valor;
}

/* =========================
   FILTROS
========================= */

function cargarMundos() {

  const container = document.getElementById("mundos-container");
  if (!container) return;

  container.innerHTML = "";

  const mundosUnicos = [...new Set(productosGlobal.map(p => p.mundo))];

  mundosUnicos.forEach(mundo => {

    const card = document.createElement("div");
    card.className = "mundo-card";
    card.textContent = mundo;

    card.onclick = function() {
      mundoActivo = mundo;
      filtrarProductos();
    };

    container.appendChild(card);
  });
}

function cargarFiltrosLaterales() {

  const aside = document.getElementById("filtros-lateral");
  if (!aside) return;

  aside.innerHTML = "";

  function crearGrupo(titulo, campo) {

    const valores = [...new Set(productosGlobal.map(p => p[campo]).filter(Boolean))];

    const grupo = document.createElement("div");
    grupo.innerHTML = `<h4>${titulo}</h4>`;

    valores.forEach(valor => {

      const item = document.createElement("div");
      item.className = "filtro-item";
      item.textContent = valor;

      item.onclick = function() {
        filtrosActivos[campo] = valor;
        filtrarProductos();
      };

      grupo.appendChild(item);
    });

    aside.appendChild(grupo);
  }

  crearGrupo("Categorías", "categoria");
  crearGrupo("Género", "genero");
  crearGrupo("Ocasión", "ocasion");
}

function filtrarProductos() {

  let resultado = productosGlobal;

  if (mundoActivo) {
    resultado = resultado.filter(p => p.mundo === mundoActivo);
  }

  Object.keys(filtrosActivos).forEach(campo => {
    if (filtrosActivos[campo]) {
      resultado = resultado.filter(p => p[campo] === filtrosActivos[campo]);
    }
  });

  mostrarProductos(resultado);
}

/* =========================
   MODAL ZOOM
========================= */

function abrirModal(src) {

  const modal = document.getElementById("modalImagen");
  const img = document.getElementById("imagenZoom");

  modal.style.display = "flex";
  img.src = src;
}

function cerrarModal() {
  document.getElementById("modalImagen").style.display = "none";
}