/* ===================================================== */
/* CORE.JS - Arquitectura limpia y escalable CUPISSA   */
/* ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".side-panel");
  panels.forEach(panel => panel.classList.remove("active"));
});
/* ========================= */
/* INICIALIZACIÓN GENERAL */
/* ========================= */

async function initApp() {
  try {
    await cargarComponentes();
    inicializarStorage();
    actualizarContadores();
    activarBuscador();
    calcularAlturasLayout();
    activarEventosGlobales();
  } catch (error) {
    console.error("Error iniciando la aplicación:", error);
  }
}

/* ========================= */
/* CARGA DE COMPONENTES */
/* ========================= */

async function cargarComponente(id, ruta) {
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${ruta}`);
  }

  const html = await respuesta.text();
  contenedor.innerHTML = html;
}

async function cargarComponentes() {
  await cargarComponente("header", window.location.origin + "/components/header.html");
    await cargarComponente("footer", window.location.origin + "/components/footer.html");

  // Año dinámico
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

/* ========================= */
/* STORAGE CENTRALIZADO */
/* ========================= */

let carrito = [];
let favoritos = [];

function inicializarStorage() {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
}

/* ========================= */
/* CONTADORES */
/* ========================= */

function actualizarContadores() {
  actualizarContadorCarrito();
  actualizarContadorFavoritos();
}

function actualizarContadorCarrito() {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const contador = document.getElementById("cartCount");
  if (!contador) return;

  let total = 0;

  carrito.forEach(item => {
    if (item.tallas) {
      for (let talla in item.tallas) {
        total += item.tallas[talla];
      }
    }
  });

  contador.textContent = total;
}

function actualizarContadorFavoritos() {
  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  const contador = document.getElementById("favCount");
  if (!contador) return;

  contador.textContent = favoritos.length;
}

/* ========================= */
/* BUSCADOR GLOBAL */
/* ========================= */

function activarBuscador() {
  const input = document.getElementById("buscadorGlobal");
  if (!input) return;

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const texto = input.value.trim().toLowerCase();
      if (!texto) return;

      localStorage.setItem("busquedaGlobal", texto);
      window.location.href = "/catalogo/";
    }
  });
}

/* ========================= */
/* ALTURAS DINÁMICAS */
/* ========================= */

function calcularAlturasLayout() {
  const header = document.querySelector("header");
  const mundos = document.querySelector(".mundos-container");

  if (!header || !mundos) return;

  const alturaHeader = header.offsetHeight;
  const alturaMundos = mundos.offsetHeight;

  document.documentElement.style.setProperty("--altura-header", `${alturaHeader}px`);
  document.documentElement.style.setProperty("--altura-mundos", `${alturaMundos}px`);
}

window.addEventListener("load", calcularAlturasLayout);
window.addEventListener("resize", calcularAlturasLayout);

/* ========================= */
/* EVENTOS GLOBALES */
/* ========================= */

function activarEventosGlobales() {

  const btnCarrito = document.getElementById("btnCarrito");
  const btnFavoritos = document.getElementById("btnFavoritos");
  const overlay = document.getElementById("overlayPanel");
  const carritoPanel = document.getElementById("carritoPanel");
  const favoritosPanel = document.getElementById("favoritosPanel");

  if (btnCarrito) {
    btnCarrito.addEventListener("click", () => abrirPanel(carritoPanel));
  }

  if (btnFavoritos) {
    btnFavoritos.addEventListener("click", () => abrirPanel(favoritosPanel));
  }

  if (overlay) {
    overlay.addEventListener("click", cerrarPanel);
  }

  document.querySelectorAll(".cerrar-panel").forEach(btn => {
    btn.addEventListener("click", cerrarPanel);
  });
}

/* ========================= */
/* SISTEMA DE PANELES */
/* ========================= */

function abrirPanel(panel) {
  if (!panel) return;

  cerrarPanel();

  panel.classList.add("activo");
  panel.setAttribute("aria-hidden", "false");

  const overlay = document.getElementById("overlayPanel");
  if (overlay) overlay.classList.add("activo");
}

function cerrarPanel() {
  document.querySelectorAll(".side-panel").forEach(panel => {
    panel.classList.remove("activo");
    panel.setAttribute("aria-hidden", "true");
  });

  const overlay = document.getElementById("overlayPanel");
  if (overlay) overlay.classList.remove("activo");
}

document.addEventListener("DOMContentLoaded", async () => {

  await cargarComponentes();

  // Cerrar carrito al iniciar
  const carrito = document.querySelector(".carrito-panel");
  const overlay = document.querySelector(".overlay-carrito");

  if (carrito) carrito.classList.remove("activo");
  if (overlay) overlay.classList.remove("activo");

});