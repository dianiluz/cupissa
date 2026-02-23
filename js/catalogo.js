/* ===================================================== */
/* CATALOGO.JS - Arquitectura profesional CUPISSA      */
/* ===================================================== */

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=tsv";

let productosGlobal = [];
let productosFiltrados = [];
let filtrosActivos = {};

/* ========================= */
/* INIT */
/* ========================= */

document.addEventListener("DOMContentLoaded", initCatalogo);

async function initCatalogo() {
  try {
    await cargarProductos();
    renderizarProductos(productosGlobal);
    inicializarEventosCatalogo();
    aplicarBusquedaInicial();
  } catch (error) {
    console.error("Error cargando catálogo:", error);
  }
}

/* ========================= */
/* CARGA GOOGLE SHEETS */
/* ========================= */

async function cargarProductos() {
  const res = await fetch(sheetURL);
  if (!res.ok) throw new Error("No se pudo cargar Google Sheets");

  const data = await res.text();

  const filas = data.split("\n");
  const headers = filas[0].split("\t");

  productosGlobal = filas
    .slice(1)
    .map(fila => {
      const valores = fila.split("\t");
      const producto = {};

      headers.forEach((h, i) => {
        producto[h.trim()] = valores[i]?.trim();
      });

      return producto;
    })
    .filter(p => p.activo?.toLowerCase() === "true" || p.activo?.toLowerCase() === "si");

  productosFiltrados = [...productosGlobal];
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderizarProductos(lista) {
  const container = document.getElementById("productos-container");
  if (!container) return;

  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  lista.forEach(producto => {

    const card = document.createElement("div");
    card.className = "card-producto";
    card.dataset.ref = producto.ref;

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";

    const img = document.createElement("img");
    img.src = `/assets/img/${producto.imagenurl}`;
    img.alt = producto.nombre;
    img.dataset.zoom = producto.imagenurl;

    const favBtn = document.createElement("span");
    favBtn.className = "btn-favorito";
    favBtn.dataset.fav = producto.ref;

    if (esFavorito(producto.ref)) {
      favBtn.classList.add("activo");
    }

    imgContainer.appendChild(img);
    imgContainer.appendChild(favBtn);

    const title = document.createElement("h3");
    title.textContent = producto.nombre;

    const cantidadBox = document.createElement("div");
    cantidadBox.className = "cantidad-box";

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "-";
    btnMenos.dataset.cantidad = "menos";

    const spanCantidad = document.createElement("span");
    spanCantidad.textContent = "1";

    const btnMas = document.createElement("button");
    btnMas.textContent = "+";
    btnMas.dataset.cantidad = "mas";

    cantidadBox.append(btnMenos, spanCantidad, btnMas);

    const btnAgregar = document.createElement("button");
    btnAgregar.className = "btn-cotizar";
    btnAgregar.textContent = "Agregar al carrito";
    btnAgregar.dataset.agregar = producto.ref;

    card.append(imgContainer, title, cantidadBox, btnAgregar);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/* ========================= */
/* EVENTOS (DELEGACIÓN) */
/* ========================= */

function inicializarEventosCatalogo() {

  const container = document.getElementById("productos-container");
  if (!container) return;

  container.addEventListener("click", e => {

    const ref = e.target.closest(".card-producto")?.dataset.ref;
    if (!ref) return;

    // Favorito
    if (e.target.dataset.fav !== undefined) {
      const producto = productosGlobal.find(p => p.ref === ref);
      toggleFavorito(ref, producto.nombre, producto.imagenurl, e.target);
      return;
    }

    // Cantidad +
    if (e.target.dataset.cantidad === "mas") {
      const span = e.target.previousElementSibling;
      span.textContent = parseInt(span.textContent) + 1;
      return;
    }

    // Cantidad -
    if (e.target.dataset.cantidad === "menos") {
      const span = e.target.nextElementSibling;
      let valor = parseInt(span.textContent);
      if (valor > 1) span.textContent = valor - 1;
      return;
    }

    // Agregar carrito
    if (e.target.dataset.agregar) {
      agregarProductoAlCarrito(ref, e.target.closest(".card-producto"));
      return;
    }

    // Zoom imagen
    if (e.target.dataset.zoom) {
      abrirModal(`/assets/img/${e.target.dataset.zoom}`);
    }

  });
}

/* ========================= */
/* AGREGAR AL CARRITO */
/* ========================= */

function agregarProductoAlCarrito(ref, card) {

  const producto = productosGlobal.find(p => p.ref === ref);
  if (!producto) return;

  const cantidad = parseInt(card.querySelector(".cantidad-box span").textContent);

  const carrito = obtenerCarrito();

  const existente = carrito.find(item => item.ref === ref);

  if (existente) {
    existente.tallas["No aplica"] =
      (existente.tallas["No aplica"] || 0) + cantidad;
  } else {
    carrito.push({
      ref: producto.ref,
      nombre: producto.nombre,
      imagen: producto.imagenurl,
      tallas: { "No aplica": cantidad }
    });
  }

  guardarCarrito(carrito);
  actualizarContadores();

  mostrarNotificacion("Producto agregado al carrito");
}

/* ========================= */
/* FILTROS */
/* ========================= */

function aplicarBusquedaInicial() {
  const texto = localStorage.getItem("busquedaGlobal");
  if (!texto) return;

  const t = texto.toLowerCase();

  productosFiltrados = productosGlobal.filter(p =>
    p.nombre?.toLowerCase().includes(t) ||
    p.categoria?.toLowerCase().includes(t) ||
    p.mundo?.toLowerCase().includes(t)
  );

  renderizarProductos(productosFiltrados);
  localStorage.removeItem("busquedaGlobal");
}