/* ===================================================== */
/* FAVORITOS.JS - Versión profesional CUPISSA           */
/* ===================================================== */

/* ========================= */
/* STORAGE */
/* ========================= */

function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function guardarFavoritos(data) {
  localStorage.setItem("favoritos", JSON.stringify(data));
}

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(data) {
  localStorage.setItem("carrito", JSON.stringify(data));
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderizarFavoritos() {

  const container = document.getElementById("favoritosItems");
  if (!container) return;

  const favoritos = obtenerFavoritos();
  container.innerHTML = "";

  if (favoritos.length === 0) {
    container.innerHTML = `
      <p class="carrito-vacio">No tienes favoritos aún.</p>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  favoritos.forEach((item, index) => {

    const card = document.createElement("div");
    card.className = "item-carrito";

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "eliminar-item";
    btnEliminar.textContent = "✖";
    btnEliminar.setAttribute("aria-label", "Eliminar favorito");
    btnEliminar.addEventListener("click", () => eliminarFavorito(index));

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

    const btnPasar = document.createElement("button");
    btnPasar.className = "btn-enviar";
    btnPasar.textContent = "Pasar al carrito";
    btnPasar.addEventListener("click", () => agregarFavoritoAlCarrito(index));

    contenido.appendChild(img);
    contenido.appendChild(info);

    card.appendChild(btnEliminar);
    card.appendChild(contenido);
    card.appendChild(btnPasar);

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/* ========================= */
/* ELIMINAR */
/* ========================= */

function eliminarFavorito(index) {

  const favoritos = obtenerFavoritos();
  favoritos.splice(index, 1);
  guardarFavoritos(favoritos);

  renderizarFavoritos();
  actualizarContadores();
}

/* ========================= */
/* PASAR AL CARRITO */
/* ========================= */

function agregarFavoritoAlCarrito(index) {

  const favoritos = obtenerFavoritos();
  const carrito = obtenerCarrito();

  const item = favoritos[index];

  const yaExiste = carrito.some(c => c.ref === item.ref);

  if (!yaExiste) {
    carrito.push({
      nombre: item.nombre,
      ref: item.ref,
      imagen: item.imagen,
      tallas: { "No aplica": 1 }
    });
  }

  favoritos.splice(index, 1);

  guardarCarrito(carrito);
  guardarFavoritos(favoritos);

  renderizarFavoritos();
  actualizarContadores();
}

/* ========================= */
/* AGREGAR TODOS */
/* ========================= */

function agregarTodosFavoritos() {

  const favoritos = obtenerFavoritos();
  const carrito = obtenerCarrito();

  favoritos.forEach(item => {

    const yaExiste = carrito.some(c => c.ref === item.ref);

    if (!yaExiste) {
      carrito.push({
        nombre: item.nombre,
        ref: item.ref,
        imagen: item.imagen,
        tallas: { "No aplica": 1 }
      });
    }
  });

  guardarCarrito(carrito);
  guardarFavoritos([]);

  renderizarFavoritos();
  actualizarContadores();
}

/* ========================= */
/* TOGGLE DESDE PRODUCTO */
/* ========================= */

function esFavorito(ref) {
  const favoritos = obtenerFavoritos();
  return favoritos.some(f => f.ref === ref);
}

function toggleFavorito(ref, nombre, imagen, elemento) {

  let favoritos = obtenerFavoritos();

  const index = favoritos.findIndex(f => f.ref === ref);

  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push({ ref, nombre, imagen });
  }

  guardarFavoritos(favoritos);
  actualizarContadores();

  // Sincronizar visual según storage real
  if (elemento) {
    elemento.classList.toggle("activo", esFavorito(ref));
  }
}

/* ========================= */
/* EVENTOS INICIALES */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  const btnAgregarTodos = document.getElementById("btnAgregarTodos");

  if (btnAgregarTodos) {
    btnAgregarTodos.addEventListener("click", agregarTodosFavoritos);
  }

  renderizarFavoritos();
});