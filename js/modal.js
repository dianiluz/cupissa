/* ===================================================== */
/* CUPISSA — MODAL PRODUCTO DEFINITIVO */
/* ===================================================== */

function abrirModal(producto) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  /* ========================= */
  /* IMAGEN */
  /* ========================= */

  const imgDiv = document.createElement("div");
  imgDiv.className = "modal-img";

  const img = document.createElement("img");
  img.src = producto.imagenurl || "";
  img.alt = producto.nombre || "";

  imgDiv.appendChild(img);

  /* ========================= */
  /* CONTENIDO */
  /* ========================= */

  const content = document.createElement("div");
  content.className = "modal-content";

  const closeBtn = document.createElement("div");
  closeBtn.className = "modal-close";
  closeBtn.textContent = "✕";
  closeBtn.onclick = () => overlay.remove();

  const titulo = document.createElement("h2");
  titulo.textContent = producto.nombre || "";

  content.appendChild(closeBtn);
  content.appendChild(titulo);

  /* ========================= */
  /* PRECIO */
  /* ========================= */

  const precioBase = Number(producto["*precio_base"]) || 0;

  const precioDiv = document.createElement("div");
  precioDiv.className = "producto-precio";
  precioDiv.textContent = formatearCOP(precioBase);

  content.appendChild(precioDiv);

  /* ========================= */
  /* VARIABLES (#) */
  /* ========================= */

  const selects = [];

  Object.keys(producto).forEach(key => {

    const valor = producto[key];

    if (typeof valor === "string" && valor.startsWith("#")) {

      const opciones = valor.substring(1).split("|");

      const select = document.createElement("select");
      select.className = "modal-select";
      select.dataset.columna = key.replace("*","").trim();

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Selecciona " + capitalizar(select.dataset.columna);
      select.appendChild(defaultOption);

      opciones.forEach(op => {
        const option = document.createElement("option");
        option.value = op.trim();
        option.textContent = op.trim();
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        actualizarPrecioModal(producto, selects, precioDiv);
      });

      selects.push(select);
      content.appendChild(select);
    }

  });

  /* ========================= */
  /* CANTIDAD */
  /* ========================= */

  const qty = document.createElement("input");
  qty.type = "number";
  qty.min = "1";
  qty.value = "1";
  qty.className = "modal-qty";

  content.appendChild(qty);

  /* ========================= */
  /* BOTÓN AGREGAR */
  /* ========================= */

  const btn = document.createElement("button");
  btn.className = "btn-agregar";
  btn.textContent = "Agregar";

  btn.onclick = () => {

    const variantes = {};

    for (let select of selects) {
      if (!select.value) {
        alert("Debes seleccionar " + select.dataset.columna);
        return;
      }
      variantes[select.dataset.columna] = select.value;
    }

    agregarAlCarrito(producto, variantes, qty.value);
    overlay.remove();
  };

  content.appendChild(btn);

  /* ========================= */
  /* ENSAMBLAR */
  /* ========================= */

  modal.appendChild(imgDiv);
  modal.appendChild(content);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

/* ========================= */
/* PRECIO DINÁMICO MODAL */
/* ========================= */

function actualizarPrecioModal(producto, selects, precioDiv) {

  const variantes = {};

  selects.forEach(select => {
    if (select.value) {
      variantes[select.dataset.columna] = select.value;
    }
  });

  const incremento = calcularIncremento(producto, variantes);
  const precioBase = Number(producto["*precio_base"]) || 0;
  const nuevoPrecio = precioBase + incremento;

  precioDiv.textContent = formatearCOP(nuevoPrecio);
}