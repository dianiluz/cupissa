/* ===================================================== */
/* HOME.JS — CUPISSA */
/* ===================================================== */

function esperarProductos(callback) {
  const intervalo = setInterval(() => {
    if (productosGlobal && productosGlobal.length > 0) {
      clearInterval(intervalo);
      callback();
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {

  esperarProductos(() => {
    renderMundosHome();
    renderCategoriasHome();
    renderTemporadaHome();
  });

});

/* ========================= */
/* GENERADOR ESTRELLAS DINÁMICO */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.querySelector(".global-stars");
  if (!container) return;

  const cantidad = 35; // número elegante, no exagerado

  for (let i = 0; i < cantidad; i++) {

    const star = document.createElement("div");
    star.classList.add("star");

    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";

    star.style.animationDelay = (Math.random() * 3) + "s";
    star.style.animationDuration = (2 + Math.random() * 3) + "s";

    container.appendChild(star);
  }

});

/* ========================= */
/* MUNDOS */
/* ========================= */

function renderMundosHome() {

  const container = document.getElementById("homeMundos");
  if (!container) return;

  const mundos = [...new Set(productosGlobal.map(p => p.mundo).filter(Boolean))];

  mundos.forEach(mundo => {

    const card = document.createElement("div");
    card.className = "home-mundo-card fade-in";
    card.textContent = capitalizar(mundo);

    card.onclick = () => {
      localStorage.setItem("mundoSeleccionado", mundo);
      window.location.href = "/catalogo";
    };

    container.appendChild(card);
  });
}

/* ========================= */
/* CATEGORÍAS */
/* ========================= */

function renderCategoriasHome() {

  const container = document.getElementById("homeCategorias");
  if (!container) return;

  const categorias = [...new Set(productosGlobal.map(p => p.categoria).filter(Boolean))];

  categorias.forEach(cat => {

    const item = document.createElement("div");
    item.className = "home-categoria-circle fade-in";
    item.textContent = capitalizar(cat);

    item.onclick = () => {
      localStorage.setItem("categoriaSeleccionada", cat);
      window.location.href = "/catalogo";
    };

    container.appendChild(item);
  });
}

/* ========================= */
/* TEMPORADA */
/* ========================= */

function renderTemporadaHome() {

  const container = document.getElementById("homeTemporada");
  const titulo = document.getElementById("temporadaTitulo");

  if (!container || !titulo) return;

  container.innerHTML = "";

  const destacados = productosGlobal.filter(p =>
    p["*x_temp"] &&
    p["*x_temp"].trim().toUpperCase() === "X"
  );

  if (!destacados.length) {
    titulo.textContent = "";
    return;
  }

  const temporadaActiva = destacados[0]["*temporada"] || "";
  titulo.textContent = `DESTACADOS DE LA TEMPORADA: ${temporadaActiva}`;

  destacados.forEach(p => {

    const card = document.createElement("div");
    card.className = "producto-card fade-in";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "producto-img-wrapper";

    const img = document.createElement("img");
    img.src = p.imagenurl;
    img.alt = p.nombre;

    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "producto-info";

    const nombre = document.createElement("div");
    nombre.className = "producto-nombre";
    nombre.textContent = p.nombre;

    info.appendChild(nombre);

    /* Variables dinámicas (#) igual que catálogo */
    headersGlobal.forEach(header => {

      if (!header.startsWith("*")) return;

      const valor = p[header];
      if (!valor) return;

      if (valor.startsWith("#")) {

        const select = document.createElement("select");
        select.className = "modal-select";

        const opciones = valor.substring(1).split("|");

        opciones.forEach(op => {
          const option = document.createElement("option");
          option.value = op.trim();
          option.textContent = op.trim();
          select.appendChild(option);
        });

        info.appendChild(select);
      }

    });

    const qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.value = "1";
    qty.className = "modal-qty";

    const btn = document.createElement("button");
    btn.className = "btn-agregar";
    btn.textContent = "Agregar";

    btn.onclick = () => {

      const variantesSeleccionadas = {};

      info.querySelectorAll("select").forEach(select => {
        variantesSeleccionadas["Variante"] = select.value;
      });

      agregarAlCarrito(p, variantesSeleccionadas, qty.value);
    };

    info.appendChild(qty);
    info.appendChild(btn);

    card.appendChild(imgWrapper);
    card.appendChild(info);

    container.appendChild(card);

  });
}

/* ===================================================== */
/* ROTACIÓN 3D MOCKUPS HERO — VERSIÓN LIMPIA */
/* ===================================================== */

const heroMockups = [
  "/assets/mockups/camiseta.png",
  "/assets/mockups/buzo.png",
  "/assets/mockups/mameluco.png",
  "/assets/mockups/almohada.png",
  "/assets/mockups/taza.png",
  "/assets/mockups/bolsa.png",
  "/assets/mockups/bolso.png",
  "/assets/mockups/tula.png",
  "/assets/mockups/bandera.png"
];

let heroIndex = 0;

function iniciarRotacionMockups() {

  const rotator = document.getElementById("mockupRotator");
  const front = document.getElementById("mockupFront");
  const back = document.getElementById("mockupBack");

  if (!rotator || !front || !back) return;

  setInterval(() => {

    heroIndex = (heroIndex + 1) % heroMockups.length;

    if (!rotator.classList.contains("rotate")) {

      back.src = heroMockups[heroIndex];
      rotator.classList.add("rotate");

    } else {

      front.src = heroMockups[heroIndex];
      rotator.classList.remove("rotate");

    }

  }, 4000);
}

document.addEventListener("DOMContentLoaded", iniciarRotacionMockups);