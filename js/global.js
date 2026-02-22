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

  if (!contador) return;

  let totalUnidades = 0;

  carrito.forEach(function(item) {
    for (let talla in item.tallas) {
      totalUnidades += item.tallas[talla];
    }
  });

  contador.textContent = totalUnidades;
}

function abrirCarrito() {
  document.getElementById("carritoPanel").classList.add("activo");
  document.getElementById("overlayCarrito").classList.add("activo");
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

      <div class="item-carrito-contenido">

        <img src="/assets/img/${item.imagen}" class="miniatura-carrito">

        <div>
          <strong>${item.nombre}</strong><br>
          Ref: ${item.ref}<br>
          ${detalleTallas}
        </div>

      </div>

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

   mensaje += "Imagen: https://cupissa.com/assets/img/" + item.imagen + "%0A%0A";

  });

  window.open("https://wa.me/573147671380?text=" + mensaje, "_blank");
}

/* =========================
   BUSCADOR GLOBAL (ENTER)
========================= */

document.addEventListener("keydown", function(e) {

  if (e.target && e.target.id === "buscadorGlobal" && e.key === "Enter") {

    const texto = e.target.value.trim().toLowerCase();

    if (texto.length < 2) return;

    localStorage.setItem("busquedaGlobal", texto);

    window.location.href = "/catalogo/index.html";
  }

});