/* ===================================================== */
/* CARRITO.JS - Versión profesional CUPISSA            */
/* ===================================================== */

/* ========================= */
/* STORAGE */
/* ========================= */

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(data) {
  localStorage.setItem("carrito", JSON.stringify(data));
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderizarCarrito() {

  const container = document.getElementById("carritoItems");
  if (!container) return;

  const carrito = obtenerCarrito();
  container.innerHTML = "";

  if (carrito.length === 0) {
    container.innerHTML = `
      <p class="carrito-vacio">Tu carrito está vacío.</p>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  carrito.forEach((item, index) => {

    const card = document.createElement("div");
    card.className = "item-carrito";

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "eliminar-item";
    btnEliminar.textContent = "✖";
    btnEliminar.setAttribute("aria-label", "Eliminar producto");
    btnEliminar.addEventListener("click", () => eliminarItem(index));

    const contenido = document.createElement("div");
    contenido.className = "item-carrito-contenido";

    const img = document.createElement("img");
    img.className = "miniatura-carrito";
    img.src = `/assets/img/${item.imagen}`;
    img.alt = item.nombre;

    const info = document.createElement("div");

    const nombre = document.createElement("strong");
    nombre.textContent = item.nombre;

    info.appendChild(nombre);
    info.appendChild(document.createElement("br"));

    for (let talla in item.tallas) {
      const linea = document.createElement("div");
      linea.textContent = `${talla}: ${item.tallas[talla]}`;
      info.appendChild(linea);
    }

    contenido.appendChild(img);
    contenido.appendChild(info);

    card.appendChild(btnEliminar);
    card.appendChild(contenido);

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/* ========================= */
/* ELIMINAR */
/* ========================= */

function eliminarItem(index) {

  const carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);

  renderizarCarrito();
  actualizarContadores();
}

/* ========================= */
/* VACIAR */
/* ========================= */

function vaciarCarrito() {

  guardarCarrito([]);
  renderizarCarrito();
  actualizarContadores();
}

/* ========================= */
/* WHATSAPP COTIZACIÓN */
/* ========================= */

function solicitarCotizacion() {

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    mostrarNotificacion("Tu carrito está vacío.");
    return;
  }

  let mensaje = "Hola, quiero cotizar los siguientes productos:\n\n";

  carrito.forEach(item => {

    mensaje += `Producto: ${item.nombre}\n`;

    for (let talla in item.tallas) {
      mensaje += `- ${talla}: ${item.tallas[talla]}\n`;
    }

    mensaje += `Imagen: https://cupissa.com/assets/img/${item.imagen}\n\n`;
  });

  const link = `https://wa.me/573147671380?text=${encodeURIComponent(mensaje)}`;
  window.open(link, "_blank");
}

/* ========================= */
/* EVENTOS INICIALES */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  const btnVaciar = document.getElementById("btnVaciarCarrito");
  const btnCotizar = document.getElementById("btnSolicitarCotizacion");

  if (btnVaciar) {
    btnVaciar.addEventListener("click", vaciarCarrito);
  }

  if (btnCotizar) {
    btnCotizar.addEventListener("click", solicitarCotizacion);
  }

  renderizarCarrito();
});

/* ========================= */
/* NOTIFICACIÓN SIMPLE */
/* ========================= */

function mostrarNotificacion(texto) {

  const toast = document.createElement("div");
  toast.className = "toast-notificacion";
  toast.textContent = texto;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}