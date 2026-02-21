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

  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "Hola, quiero cotizar los siguientes productos:%0A%0A";

  carrito.forEach((item, i) => {
    mensaje += `${i + 1}. ${item.nombre}%0A`;
    mensaje += `Ref: ${item.ref}%0A`;
    mensaje += `Talla: ${item.talla}%0A`;
    mensaje += `Cantidad: ${item.cantidad}%0A`;
    mensaje += `Imagen: https://cupissa.com/assets/img/${item.imagen}%0A%0A`;
  });

  const link = `https://wa.me/573147671380?text=${mensaje}`;

  window.open(link, "_blank");
}