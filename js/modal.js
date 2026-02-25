/* ===================================================== */
/* UNIVERSO CUPISSA — MODAL PRODUCTO */
/* ===================================================== */

function abrirModal(producto) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  const imgDiv = document.createElement("div");
  imgDiv.className = "modal-img";

  const img = document.createElement("img");
  img.src = producto.imagenurl;
  img.alt = producto.nombre;

  imgDiv.appendChild(img);

  const content = document.createElement("div");
  content.className = "modal-content";

  const closeBtn = document.createElement("div");
  closeBtn.className = "modal-close";
  closeBtn.textContent = "✕";
  closeBtn.onclick = () => {
    overlay.remove();
    document.body.style.overflow = "auto";
  };

  const titulo = document.createElement("h2");
  titulo.textContent = producto.nombre;

  content.appendChild(closeBtn);
  content.appendChild(titulo);

  Object.keys(producto).forEach(key => {

    const valor = producto[key];

    if (valor && valor.startsWith("#")) {

      const opciones = valor.substring(1).split("|");

      const select = document.createElement("select");
      select.className = "modal-select";
      select.dataset.columna = key;

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Selecciona " + capitalizar(key);
      select.appendChild(defaultOption);

      opciones.forEach(op => {
        const option = document.createElement("option");
        option.value = op.trim();
        option.textContent = op.trim();
        select.appendChild(option);
      });

      content.appendChild(select);
    }

  });

  const qty = document.createElement("input");
  qty.type = "number";
  qty.min = "1";
  qty.value = "1";
  qty.className = "modal-qty";

  content.appendChild(qty);

  const btn = document.createElement("button");
  btn.className = "btn-agregar";
  btn.textContent = "Agregar";

  btn.onclick = () => {

    const selects = content.querySelectorAll("select");
    let variantesSeleccionadas = {};

    for (let select of selects) {
      if (!select.value) {
        alert("Debes seleccionar " + select.dataset.columna);
        return;
      }
      variantesSeleccionadas[select.dataset.columna] = select.value;
    }

    agregarAlCarrito(producto, variantesSeleccionadas, qty.value);

    overlay.remove();
    document.body.style.overflow = "auto";
  };

  content.appendChild(btn);

  modal.appendChild(imgDiv);
  modal.appendChild(content);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

}