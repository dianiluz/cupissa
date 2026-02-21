/* =========================
   CARGAR HEADER Y FOOTER
========================= */

fetch("/components/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    cargarCarritoDesdeStorage();
    actualizarContadorCarrito();
  });

fetch("/components/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

/* =========================
   CARRITO
========================= */

let carrito = [];

function cargarCarritoDesdeStorage() {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("cartCount");
  if (contador) {
    contador.textContent = carrito.length;
  }
}

function abrirCarrito() {
  document.getElementById("carritoPanel").classList.add("activo");
  renderizarCarrito();
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").classList.remove("activo");
}

function renderizarCarrito() {
  const container = document.getElementById("carritoItems");
  container.innerHTML = "";

  if (carrito.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

 carrito.forEach(function(item, index) {

  let detalleTallas = "";

  for (let talla in item.tallas) {
    detalleTallas += talla + ": " + item.tallas[talla] + "<br>";
  }

  container.innerHTML += `
    <div class="item-carrito">
      <span class="eliminar-item" onclick="eliminarItem(${index})">✖</span>
      <strong>${item.nombre}</strong><br>
      Ref: ${item.ref}<br>
      ${detalleTallas}
    </div>
  `;
});
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarContadorCarrito();
  renderizarCarrito();
}

function enviarCarritoWhatsApp() {

  if (carrito.length === 0) return;

  let mensaje = "Hola, quiero cotizar:%0A%0A";

  carrito.forEach(function(item, i) {

    mensaje += (i + 1) + ". " + item.nombre + "%0A";
    mensaje += "Ref: " + item.ref + "%0A";

    for (let talla in item.tallas) {
      mensaje += "Talla " + talla + ": " + item.tallas[talla] + "%0A";
    }

    mensaje += "Imagen: " + window.location.origin + "/assets/img/" + item.imagen + "%0A%0A";

  });

  window.open("https://wa.me/573147671380?text=" + mensaje, "_blank");
}