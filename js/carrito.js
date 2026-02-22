/* =========================
   PANEL CARRITO
========================= */

function abrirCarrito() {

  const panel = document.getElementById("carritoPanel");
  const overlay = document.getElementById("overlayCarrito");

  panel.classList.add("activo");
  overlay.classList.add("activo");
  document.body.style.overflow = "hidden";

  renderizarCarrito();
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").classList.remove("activo");
  document.getElementById("overlayCarrito").classList.remove("activo");
  document.body.style.overflow = "auto";
}

function renderizarCarrito() {

  const container = document.getElementById("carritoItems");
  if (!container) return;

  container.innerHTML = "";

  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  carrito.forEach((item, index) => {

    let tallasHTML = "";

    for (let talla in item.tallas) {
      tallasHTML += `${talla}: ${item.tallas[talla]}<br>`;
    }

    container.innerHTML += `
      <div class="item-carrito">
        <span class="eliminar-item" onclick="eliminarItem(${index})">✖</span>
        <div class="item-carrito-contenido">
          <img src="/assets/img/${item.imagen}" class="miniatura-carrito">
          <div>
            <strong>${item.nombre}</strong><br>
            ${tallasHTML}
          </div>
        </div>
      </div>
    `;
  });
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorCarrito();
}

function vaciarCarrito() {

  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderizarCarrito();
  actualizarContadorCarrito();
}

function solicitarCotizacion() {

  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = "Hola, quiero cotizar los siguientes productos:%0A%0A";

  carrito.forEach(item => {

    mensaje += `Producto: ${item.nombre}%0A`;

    for (let talla in item.tallas) {
      mensaje += `- ${talla}: ${item.tallas[talla]}%0A`;
    }

    mensaje += `Imagen: https://cupissa.com/assets/img/${item.imagen}%0A%0A`;
  });

  const link = `https://wa.me/573147671380?text=${mensaje}`;
  window.open(link, "_blank");
}