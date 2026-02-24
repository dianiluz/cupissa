/* ===================================================== */
/* UNIVERSO CUPISSA — FAVORITOS ESTABLE FINAL */
/* ===================================================== */

let favoritos = [];

document.addEventListener("DOMContentLoaded", () => {
  sincronizarFavoritos();
});

function sincronizarFavoritos() {
  favoritos = obtenerLocal("cupissa_favoritos") || [];
  actualizarContadorFavoritos();
}

function toggleFavorito(producto) {

  const ref = String(producto.ref || "").trim();
  favoritos = obtenerLocal("cupissa_favoritos") || [];

  const existe = favoritos.find(p => p.ref === ref);

  if (existe) {
    favoritos = favoritos.filter(p => p.ref !== ref);
  } else {
    favoritos.push({
      ref: ref,
      nombre: producto.nombre,
      imagenurl: producto.imagenurl
    });
  }

  guardarLocal("cupissa_favoritos", favoritos);
  sincronizarFavoritos();

  if (typeof actualizarIconosFavoritos === "function") {
    actualizarIconosFavoritos();
  }
}

function actualizarContadorFavoritos() {
  const contador = document.getElementById("favCount");
  if (contador) contador.textContent = favoritos.length;
}

function eliminarFavorito(ref) {
  favoritos = obtenerLocal("cupissa_favoritos") || [];
  favoritos = favoritos.filter(p => p.ref !== ref);
  guardarLocal("cupissa_favoritos", favoritos);
  sincronizarFavoritos();
}

document.addEventListener("DOMContentLoaded", () => {

  const btnFavoritos = document.getElementById("favIcon");
  const panel = document.getElementById("favoritosPanel");
  const cerrar = document.getElementById("cerrarFavoritos");
  const lista = document.getElementById("favoritosLista");
  const vaciar = document.getElementById("vaciarFavoritos");
  const agregarTodo = document.getElementById("agregarTodoFav");

  if (!panel) return;

  function abrirPanel() {
    panel.classList.add("activo");
    document.body.style.overflow = "hidden";
    renderizarFavoritosPanel();
  }

  function cerrarPanel() {
    panel.classList.remove("activo");
    document.body.style.overflow = "";
  }

  btnFavoritos?.addEventListener("click", abrirPanel);
  cerrar?.addEventListener("click", cerrarPanel);

  vaciar?.addEventListener("click", () => {
    guardarLocal("cupissa_favoritos", []);
    sincronizarFavoritos();
    renderizarFavoritosPanel();
    actualizarIconosFavoritos?.();
  });

  agregarTodo?.addEventListener("click", () => {

    if (!window.productosGlobal) return;

    favoritos.forEach(fav => {

      const producto = window.productosGlobal.find(p =>
        String(p.ref).trim() === String(fav.ref).trim()
      );

      if (producto) {
        agregarAlCarrito(producto, {}, 1);
      }

    });

    guardarLocal("cupissa_favoritos", []);
    sincronizarFavoritos();
    renderizarFavoritosPanel();
    actualizarIconosFavoritos?.();
  });

  window.renderizarFavoritosPanel = function () {

    favoritos = obtenerLocal("cupissa_favoritos") || [];
    lista.innerHTML = "";

    if (favoritos.length === 0) {
      lista.innerHTML = "<p style='color:#777;'>No tienes favoritos aún.</p>";
      return;
    }

    favoritos.forEach(prod => {

      const div = document.createElement("div");
      div.className = "favorito-item";

      div.innerHTML = `
        <img src="${prod.imagenurl}" alt="${prod.nombre}">
        <div class="favorito-info">
          <h4>${prod.nombre}</h4>
        </div>
        <div class="favorito-actions">
          <button data-id="${prod.ref}" class="agregar-fav">Agregar</button>
          <button data-id="${prod.ref}" class="eliminar-fav">Eliminar</button>
        </div>
      `;

      lista.appendChild(div);
    });

    lista.querySelectorAll(".eliminar-fav").forEach(btn => {
      btn.addEventListener("click", (e) => {
        eliminarFavorito(e.target.dataset.id);
        renderizarFavoritosPanel();
        actualizarIconosFavoritos?.();
      });
    });

    lista.querySelectorAll(".agregar-fav").forEach(btn => {
      btn.addEventListener("click", (e) => {

        const ref = e.target.dataset.id;

        const producto = window.productosGlobal?.find(p =>
          String(p.ref).trim() === String(ref).trim()
        );

        if (!producto) return;

        agregarAlCarrito(producto, {}, 1);

        eliminarFavorito(ref);
        renderizarFavoritosPanel();
        actualizarIconosFavoritos?.();
      });
    });

  };

});