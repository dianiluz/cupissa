/* =========================
   HEADER Y FOOTER
========================= */

fetch("/components/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;
    actualizarContadorCarrito();
    actualizarContadorFavoritos();
  });

fetch("/components/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

/* =========================
   STORAGE BASE
========================= */

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

/* =========================
   CONTADORES
========================= */

function actualizarContadorCarrito() {

  const contador = document.getElementById("cartCount");
  if (!contador) return;

  let total = 0;

  carrito.forEach(item => {
    for (let talla in item.tallas) {
      total += item.tallas[talla];
    }
  });

  contador.textContent = total;
}

function actualizarContadorFavoritos() {

  const contador = document.getElementById("favCount");
  if (!contador) return;

  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  contador.textContent = favoritos.length;
}