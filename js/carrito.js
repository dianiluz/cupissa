/* ===================================================== */
/* CUPISSA — CARRITO PROFESIONAL */
/* ===================================================== */

let carrito = obtenerLocal("cupissa_carrito") || [];

document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
  inicializarPanelCarrito();
});

/* ========================= */
/* AGREGAR AL CARRITO */
/* ========================= */

function agregarAlCarrito(producto, variantes = {}, cantidad = 1) {

  cantidad = parseInt(cantidad);
  const ref = (producto.ref || "").trim();

  if (!ref) return;

  let item = carrito.find(p => p.ref === ref);

  if (!item) {
    item = {
      ref: ref,
      nombre: producto.nombre,
      imagenurl: producto.imagenurl,
      variantes: {}
    };
    carrito.push(item);
  }

  Object.keys(variantes).forEach(key => {

    const valor = variantes[key];
    if (!valor) return;

    if (!item.variantes[key]) {
      item.variantes[key] = {};
    }

    if (!item.variantes[key][valor]) {
      item.variantes[key][valor] = 0;
    }

    item.variantes[key][valor] += cantidad;
  });

  guardarLocal("cupissa_carrito", carrito);

  actualizarContadorCarrito();
  renderCarrito();
  animarCarrito();
}

/* ========================= */
/* CONTADOR */
/* ========================= */

function actualizarContadorCarrito() {

  let total = 0;

  carrito.forEach(item => {
    Object.values(item.variantes).forEach(grupo => {
      Object.values(grupo).forEach(qty => {
        if (qty > 0) total += qty;
      });
    });
  });

  const contador = document.getElementById("cartCount");
  if (contador) contador.textContent = total;
}

/* ========================= */
/* RENDER CARRITO */
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

    let variantesHTML = "";

    Object.keys(item.variantes).forEach(key => {
      Object.keys(item.variantes[key]).forEach(valor => {

        const qty = item.variantes[key][valor];

        if (qty > 0) {
          variantesHTML += `
            ${capitalizar(key)} ${valor}: ${qty}<br>
          `;
        }
      });
    });

    div.innerHTML = `
      <div style="display:flex; gap:12px; align-items:flex-start;">
        <img src="${item.imagenurl}" 
             style="width:55px;height:55px;object-fit:cover;border-radius:8px;">
        <div>
          <strong>${item.nombre}</strong><br>
          ${variantesHTML}
          <button onclick="eliminarProducto(${index})" 
                  style="margin-top:6px;font-size:12px;">
            Eliminar
          </button>
        </div>
      </div>
    `;

    body.appendChild(div);
  });
}

/* ========================= */
/* ELIMINAR PRODUCTO */
/* ========================= */

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
}

/* ========================= */
/* VACIAR CARRITO */
/* ========================= */

function vaciarCarrito() {
  carrito = [];
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
}

/* ========================= */
/* MENSAJE WHATSAPP */
/* ========================= */

function generarMensajeWhatsApp() {

  if (!carrito.length) return "Hola, quiero cotizar:";

  let mensaje = "Hola, quiero cotizar:%0A%0A";

  carrito.forEach(item => {

    mensaje += "• " + item.nombre + "%0A";

    Object.keys(item.variantes).forEach(key => {
      Object.keys(item.variantes[key]).forEach(valor => {

        const qty = item.variantes[key][valor];

        if (qty > 0) {
          mensaje += "   - " + capitalizar(key) + " " + valor +
                     " (" + qty + ")%0A";
        }
      });
    });

    const imagenCompleta = item.imagenurl.startsWith("http")
      ? item.imagenurl
      : CONFIG.baseURL + item.imagenurl;

    mensaje += "   Imagen: " + imagenCompleta + "%0A%0A";
  });

  return mensaje;
}

function enviarCarritoWhatsApp() {
  const mensaje = generarMensajeWhatsApp();
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${mensaje}`;
  window.open(url, "_blank");
}

/* ========================= */
/* PANEL CARRITO */
/* ========================= */

function inicializarPanelCarrito() {

  const icon = document.getElementById("cartIcon");
  const panel = document.getElementById("carritoPanel");
  const cerrar = document.getElementById("cerrarCarrito");

  if (icon && panel) {
    icon.addEventListener("click", () => {
      panel.classList.add("active");
      renderCarrito();
      document.body.style.overflow = "hidden";
    });
  }

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      panel.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }
}

/* ========================= */
/* ANIMACIÓN ICONO */
/* ========================= */

function animarCarrito() {
  const icon = document.getElementById("cartIcon");
  if (!icon) return;

  icon.classList.add("cart-animate");

  setTimeout(() => {
    icon.classList.remove("cart-animate");
  }, 500);
}