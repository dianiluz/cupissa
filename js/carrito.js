/* ===================================================== */
/* CUPISSA — CARRITO AGRUPADO ESTABLE DEFINITIVO */
/* ===================================================== */

let carrito = obtenerLocal("cupissa_carrito") || [];

document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
  inicializarPanelCarrito();
});

function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?]/g, "")
    .trim();
}

/* ========================= */
/* AGREGAR */
/* ========================= */

function agregarAlCarrito(producto, variantes = {}, cantidad = 1) {

  cantidad = parseInt(cantidad);
  if (!producto || !producto.ref) return;

  const ref = producto.ref.trim();

  let item = carrito.find(p => p.ref === ref);

  if (!item) {
    item = {
      ref,
      nombre: producto.nombre,
      imagenurl: producto.imagenurl,
      precio_base: Number(producto["*precio_base"]) || 0,
      productoOriginal: producto,
      combinaciones: [],
      total_cantidad: 0,
      subtotal: 0
    };
    carrito.push(item);
  }

  // buscar combinación exacta
  let combo = item.combinaciones.find(c =>
    JSON.stringify(c.variantes) === JSON.stringify(variantes)
  );

  if (!combo) {
    combo = {
      variantes: { ...variantes },
      cantidad: 0
    };
    item.combinaciones.push(combo);
  }

  combo.cantidad += cantidad;

  recalcularTotalesCarrito();
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
  animarCarrito();
}

window.agregarAlCarrito = agregarAlCarrito;

/* ========================= */
/* MOTOR VARIACIONES */
/* ========================= */

function calcularIncremento(productoOriginal, variantesSeleccionadas) {

  if (!variacionesGlobal || !variacionesGlobal.length) return 0;

  let incrementoTotal = 0;

  variacionesGlobal.forEach(regla => {

    const refRegla = normalizarTexto(regla.ref || "");
    const filtroRaw = normalizarTexto(regla.filtro || "");
    const valorRaw = normalizarTexto(regla.valor_filtro || "");
    const incremento = Number(regla.incremento || 0);

    if (refRegla && refRegla === normalizarTexto(productoOriginal.ref)) {
      incrementoTotal += incremento;
      return;
    }

    if (!filtroRaw || !valorRaw) return;

    const filtros = filtroRaw.split("|");
    const valores = valorRaw.split("|");

    if (filtros.length !== valores.length) return;

    let coincide = true;

    for (let i = 0; i < filtros.length; i++) {

      const columna = filtros[i];
      const valorEsperado = valores[i];

      let valorReal = null;

      // 1️⃣ buscar en variantes seleccionadas
      Object.keys(variantesSeleccionadas).forEach(key => {
  if (normalizarTexto(key) === columna) {
    valorReal = normalizarTexto(variantesSeleccionadas[key]);
  }
});

      // 2️⃣ buscar en producto original
      if (!valorReal) {
        Object.keys(productoOriginal).forEach(key => {
          const keyNormal = normalizarTexto(key.replace("*",""));
          if (keyNormal === columna) {
            valorReal = normalizarTexto(productoOriginal[key]);
          }
        });
      }

      if (valorReal !== valorEsperado) {
        coincide = false;
        break;
      }

    }

    if (coincide) incrementoTotal += incremento;

  });

  return incrementoTotal;
}

/* ========================= */
/* RECALCULAR */
/* ========================= */

function recalcularTotalesCarrito() {

  carrito.forEach(item => {

    let subtotal = 0;
    let totalCantidad = 0;

    item.combinaciones.forEach(combo => {

      const incremento = calcularIncremento(
        item.productoOriginal,
        combo.variantes
      );

      subtotal += (item.precio_base + incremento) * combo.cantidad;
      totalCantidad += combo.cantidad;

    });

    item.subtotal = subtotal;
    item.total_cantidad = totalCantidad;

  });

}

/* ========================= */
/* CONTADOR */
/* ========================= */

function actualizarContadorCarrito() {

  let total = 0;
  carrito.forEach(item => total += item.total_cantidad || 0);

  const contador = document.getElementById("cartCount");
  if (contador) contador.textContent = total;
}

/* ========================= */
/* RENDER */
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

    let variantesHTML = "";

    item.combinaciones.forEach(combo => {

      Object.keys(combo.variantes).forEach(key => {
        variantesHTML += `${capitalizar(key)} ${combo.variantes[key]}: ${combo.cantidad}<br>`;
      });

    });

    const div = document.createElement("div");
    div.className = "carrito-item";

    div.innerHTML = `
      <div style="display:flex; gap:12px;">
        <img src="${item.imagenurl}"
             style="width:55px;height:55px;object-fit:cover;border-radius:8px;">
        <div>
          <strong>${item.nombre}</strong><br>
          $ ${item.subtotal.toLocaleString()}<br>
          ${variantesHTML}
          <button onclick="eliminarProducto(${index})">
            Eliminar
          </button>
        </div>
      </div>
    `;

    body.appendChild(div);
  });
}

/* ========================= */
/* ELIMINAR */
/* ========================= */

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
}

/* ========================= */
/* VACIAR */
/* ========================= */

function vaciarCarrito() {
  carrito = [];
  guardarLocal("cupissa_carrito", carrito);
  actualizarContadorCarrito();
  renderCarrito();
}

/* ========================= */
/* PANEL */
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
/* ANIMACIÓN */
/* ========================= */

function animarCarrito() {
  const icon = document.getElementById("cartIcon");
  if (!icon) return;
  icon.classList.add("cart-animate");
  setTimeout(() => icon.classList.remove("cart-animate"), 500);
}