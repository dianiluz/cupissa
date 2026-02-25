/* ===================================================== */
/* UNIVERSO CUPISSA — MODAL PRODUCTO PREMIUM */
/* ===================================================== */

function abrirModal(producto) {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.remove();
    document.body.style.overflow = "auto";
  }
});

  const modal = document.createElement("div");
  modal.className = "modal";

  /* ========================= */
  /* IMÁGENES */
  /* ========================= */

  const imgDiv = document.createElement("div");
  imgDiv.className = "modal-img";

  const imagenes = producto.imagenes && producto.imagenes.length
    ? producto.imagenes
    : (producto.imagenurl ? [producto.imagenurl] : []);

  let indiceActual = 0;

  const img = document.createElement("img");
  img.src = imagenes[0] || "";
  img.alt = producto.nombre;

  imgDiv.appendChild(img);

  /* ========================= */
  /* SLIDER */
  /* ========================= */

  if (imagenes.length > 1) {

    const prev = document.createElement("div");
    prev.className = "modal-slider prev";
    prev.innerHTML = "‹";

    const next = document.createElement("div");
    next.className = "modal-slider next";
    next.innerHTML = "›";

    prev.onclick = (e) => {
      e.stopPropagation();
      indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
      img.src = imagenes[indiceActual];
      actualizarThumbs();
    };

    next.onclick = (e) => {
      e.stopPropagation();
      indiceActual = (indiceActual + 1) % imagenes.length;
      img.src = imagenes[indiceActual];
      actualizarThumbs();
    };

    imgDiv.appendChild(prev);
    imgDiv.appendChild(next);

    /* Miniaturas */

    const thumbs = document.createElement("div");
    thumbs.className = "modal-thumbs";

    imagenes.forEach((src, i) => {

      const t = document.createElement("img");
      t.src = src;
      t.className = "modal-thumb";

      if (i === 0) t.classList.add("active");

      t.onclick = () => {
        indiceActual = i;
        img.src = src;
        actualizarThumbs();
      };

      thumbs.appendChild(t);
    });

    function actualizarThumbs() {
      thumbs.querySelectorAll(".modal-thumb")
        .forEach((t, i) => {
          t.classList.toggle("active", i === indiceActual);
        });
    }

    imgDiv.appendChild(thumbs);

    /* Swipe móvil */

    let startX = 0;

    imgDiv.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    imgDiv.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          indiceActual = (indiceActual + 1) % imagenes.length;
        } else {
          indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
        }
        img.src = imagenes[indiceActual];
        actualizarThumbs();
      }
    });
  }

  /* ========================= */
  /* ZOOM */
  /* ========================= */

  if (window.innerWidth > 1024 && imagenes.length) {

    const lens = document.createElement("div");
    lens.className = "zoom-lens";
    imgDiv.appendChild(lens);

    const zoomFactor = 4;

    imgDiv.addEventListener("mousemove", (e) => {

      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      lens.style.display = "block";

      const lensSize = 150;

      let lx = x - lensSize / 2;
      let ly = y - lensSize / 2;

      if (lx < 0) lx = 0;
      if (ly < 0) ly = 0;
      if (lx > rect.width - lensSize) lx = rect.width - lensSize;
      if (ly > rect.height - lensSize) ly = rect.height - lensSize;

      lens.style.width = lensSize + "px";
      lens.style.height = lensSize + "px";
      lens.style.left = lx + "px";
      lens.style.top = ly + "px";

      img.style.transformOrigin =
        (x / rect.width) * 100 + "% " +
        (y / rect.height) * 100 + "%";

      img.style.transform = "scale(" + zoomFactor + ")";
    });

    imgDiv.addEventListener("mouseleave", () => {
      lens.style.display = "none";
      img.style.transform = "scale(1)";
    });
  }

  /* ========================= */
  /* CONTENIDO */
  /* ========================= */

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

    if (valor && typeof valor === "string" && valor.startsWith("#")) {

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