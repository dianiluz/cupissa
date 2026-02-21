let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function actualizarContadorCarrito() {
  const contador = document.getElementById("cartCount");
  if (contador) {
    contador.textContent = carrito.length;
  }
}

actualizarContadorCarrito();

// Cargar Header
fetch("/components/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;
  });

// Cargar Footer
fetch("/components/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

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

  carrito.forEach((item, index) => {
    container.innerHTML += `
      <div class="item-carrito">
        <strong>${item.nombre}</strong><br>
        Ref: ${item.ref}<br>
        Talla: ${item.talla}<br>
        Cantidad: ${item.cantidad}<br>
        <button onclick="eliminarItem(${index})">Eliminar</button>
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

  carrito.forEach((item, i) => {
    mensaje += `${i+1}. ${item.nombre}%0A`;
    mensaje += `Ref: ${item.ref}%0A`;
    mensaje += `Talla: ${item.talla}%0A`;
    mensaje += `Cantidad: ${item.cantidad}%0A`;
    mensaje += `Imagen: https://cupissa.com/assets/img/${item.imagen}%0A%0A`;
  });

  window.open(`https://wa.me/573147671380?text=${mensaje}`, "_blank");
}