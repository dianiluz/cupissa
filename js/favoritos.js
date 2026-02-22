function abrirFavoritos() {
  const panel = document.getElementById("favoritosPanel");
  const overlay = document.getElementById("overlayCarrito");

  panel.classList.add("activo");
  overlay.classList.add("activo");
  document.body.style.overflow = "hidden";

  renderizarFavoritos();
}

function cerrarFavoritos() {
  document.getElementById("favoritosPanel").classList.remove("activo");
  document.getElementById("overlayCarrito").classList.remove("activo");
  document.body.style.overflow = "auto";
}

function renderizarFavoritos() {

  const container = document.getElementById("favoritosItems");
  if (!container) return;

  container.innerHTML = "";

  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  favoritos.forEach((item, index) => {

    container.innerHTML += `
      <div class="item-carrito">
        <span class="eliminar-item" onclick="eliminarFavorito(${index})">✖</span>
        <div class="item-carrito-contenido">
          <img src="/assets/img/${item.imagen}" class="miniatura-carrito">
          <div>
            <strong>${item.nombre}</strong>
          </div>
        </div>
        <button class="btn-enviar" onclick="agregarFavoritoAlCarrito(${index})">
          Pasar al carrito
        </button>
      </div>
    `;
  });
}

function eliminarFavorito(index) {
  favoritos.splice(index, 1);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  renderizarFavoritos();
  actualizarContadorFavoritos();
}

function agregarFavoritoAlCarrito(index) {

  const item = favoritos[index];

  carrito.push({
    nombre: item.nombre,
    ref: item.ref,
    imagen: item.imagen,
    tallas: { "No aplica": 1 }
  });

  favoritos.splice(index, 1);

  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  renderizarFavoritos();
  actualizarContadorCarrito();
  actualizarContadorFavoritos();
}

function esFavorito(ref) {
  const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
  return favs.some(f => f.ref === ref);
}

function toggleFavorito(ref, nombre, imagen, elemento) {

  let favs = JSON.parse(localStorage.getItem("favoritos")) || [];

  const index = favs.findIndex(f => f.ref === ref);

  if (index > -1) {
    favs.splice(index, 1);
    elemento.classList.remove("activo");
  } else {
    favs.push({ ref, nombre, imagen });
    elemento.classList.add("activo");
  }

  localStorage.setItem("favoritos", JSON.stringify(favs));
  actualizarContadorFavoritos();
}

function agregarTodosFavoritos() {

  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  favoritos.forEach(item => {
    carrito.push({
      nombre: item.nombre,
      ref: item.ref,
      imagen: item.imagen,
      tallas: { "No aplica": 1 }
    });
  });

  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("favoritos", JSON.stringify([]));

  actualizarContadorCarrito();
  actualizarContadorFavoritos();
  renderizarFavoritos();
}