/* ===================================================== */
/* UNIVERSO CUPISSA — CARRITO */
/* ===================================================== */

let carrito = obtenerLocal("cupissa_carrito") || [];

actualizarContadorCarrito();

/* ========================= */
/* AGREGAR AL CARRITO */
/* ========================= */

function agregarAlCarrito(producto, variantes = {}, cantidad = 1) {

  const itemExistente = carrito.find(item =>
    item.ref === producto.ref &&
    JSON.stringify(item.variantes) === JSON.stringify(variantes)
  );

  if (itemExistente) {
    itemExistente.cantidad += parseInt(cantidad);
  } else {
    carrito.push({
      ref: producto.ref,
      nombre: producto.nombre,
      imagenurl: producto.imagenurl,
      variantes: variantes,
      cantidad: parseInt(cantidad)
    });
  }

  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  animarCarrito();
}

/* ========================= */
/* CONTADOR */
/* ========================= */

function actualizarContadorCarrito() {

  const count = carrito.reduce((total, item) => total + item.cantidad, 0);

  const contador = document.getElementById("cartCount");
  if (contador) {
    contador.textContent = count;
  }
}

/* ========================= */
/* ANIMACIÓN */
/* ========================= */

function animarCarrito() {

  const icon = document.getElementById("cartIcon");
  if (!icon) return;

  icon.classList.add("cart-animate");

  setTimeout(() => {
    icon.classList.remove("cart-animate");
  }, 500);
}

/* ========================= */
/* GENERAR MENSAJE WHATSAPP */
/* ========================= */

function generarMensajeWhatsApp() {

  if (!carrito.length) return "Hola, quiero cotizar:";

  let mensaje = "Hola, quiero cotizar:%0A%0A";

  carrito.forEach(item => {

    mensaje += "• " + item.nombre + "%0A";

    Object.keys(item.variantes).forEach(key => {
      mensaje += "   - " + key + ": " + item.variantes[key] + "%0A";
    });

    mensaje += "   - Cantidad: " + item.cantidad + "%0A";
    const imagenCompleta = item.imagenurl.startsWith("http")
    ? item.imagenurl
    : CONFIG.baseURL + item.imagenurl;

    mensaje += "   - Imagen: " + imagenCompleta + "%0A%0A";
    });

  return mensaje;
}

/* ========================= */
/* ENVIAR A WHATSAPP */
/* ========================= */

function enviarCarritoWhatsApp() {

  const mensaje = generarMensajeWhatsApp();
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${mensaje}`;

  window.open(url, "_blank");
}

/* ========================= */
/* RENDER PANEL */
/* ========================= */

function renderCarrito() {

  const body = document.getElementById("carritoBody");
  if (!body) return;

  body.innerHTML = "";

  if (!carrito.length) {
    body.innerHTML = "<p>Tu lista está vacía.</p>";
    return;
  }

  carrito.forEach((item, index) => {

    const div = document.createElement("div");
    div.className = "carrito-item";

    let html = `<strong>${item.nombre}</strong><br>`;

    Object.keys(item.variantes).forEach(key => {
      html += `- ${key}: ${item.variantes[key]}<br>`;
    });

    html += `Cantidad: ${item.cantidad}<br>`;
    html += `<button onclick="eliminarItem(${index})">Eliminar</button>`;

    div.innerHTML = html;

    body.appendChild(div);

  });

}

/* ========================= */
/* ELIMINAR */
/* ========================= */

function eliminarItem(index) {
  carrito.splice(index, 1);
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
}

/* ========================= */
/* ABRIR / CERRAR */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  const icon = document.getElementById("cartIcon");
  const panel = document.getElementById("carritoPanel");
  const cerrar = document.getElementById("cerrarCarrito");

  if (icon && panel) {
    icon.addEventListener("click", () => {
      panel.classList.add("active");
      renderCarrito();
    });
  }

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      panel.classList.remove("active");
    });
  }

});