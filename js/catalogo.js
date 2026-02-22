/* =========================
   CONFIG
========================= */

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

let productosGlobal = [];

/* =========================
   CARGAR PRODUCTOS
========================= */

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n");

    productosGlobal = filas.slice(1).map(fila => {

      const valores = fila.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      if (!valores) return null;

      return {
        ref: valores[0]?.replace(/"/g, ""),
        nombre: valores[1]?.replace(/"/g, ""),
        imagenurl: valores[2]?.replace(/"/g, ""),
        mundo: valores[3]?.replace(/"/g, ""),
        categoria: valores[4]?.replace(/"/g, ""),
        talla: valores[7]?.replace(/"/g, ""),
        genero: valores[9]?.replace(/"/g, ""),
        ocasion: valores[10]?.replace(/"/g, ""),
        palabras_clave: valores[12]?.replace(/"/g, ""),
        activo: valores[13]?.replace(/"/g, "").trim().toLowerCase()
      };

    }).filter(p => p && (p.activo === "true" || p.activo === "si"));

    mostrarProductos(productosGlobal);
    cargarMundos();
    cargarFiltros();

    function cargarMundos() {

  const mundosUnicos = [...new Set(productosGlobal.map(p => p.mundo))];
  const container = document.getElementById("mundos-container");

  mundosUnicos.forEach(mundo => {

    const card = document.createElement("div");
    card.className = "mundo-card";
    card.textContent = mundo;

    card.onclick = function() {

      document.querySelectorAll(".mundo-card").forEach(c => c.classList.remove("activo"));
      card.classList.add("activo");

      const filtrados = productosGlobal.filter(p => p.mundo === mundo);
      mostrarProductos(filtrados);

    };

    container.appendChild(card);

  });
}

    document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-genero").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-ocasion").addEventListener("change", aplicarFiltros);

    // Aplicar búsqueda si existe
    const busqueda = localStorage.getItem("busquedaGlobal");

    if (busqueda) {

      const filtrados = productosGlobal.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.palabras_clave.toLowerCase().includes(busqueda)
      );

      mostrarProductos(filtrados);
      localStorage.removeItem("busquedaGlobal");
    }

  });

/* =========================
   MOSTRAR PRODUCTOS
========================= */

function mostrarProductos(productos) {

  const container = document.getElementById("productos-container");
  container.innerHTML = "";

  productos.forEach((producto, index) => {

    const tieneTalla = producto.talla && producto.talla !== "";
    const tallas = tieneTalla ? producto.talla.split("|") : [];

    container.innerHTML += `
      <div class="card-producto">

        <img src="/assets/img/${producto.imagenurl}" alt="${producto.nombre}">

        <h3>${producto.nombre}</h3>

        ${tieneTalla ? `
          <select id="talla-${index}">
            ${tallas.map(t => `<option value="${t}">${t}</option>`).join("")}
          </select>
        ` : ""}

        <div class="cantidad-box">
          <button onclick="cambiarCantidad(${index}, -1)">-</button>
          <span id="cantidad-${index}">1</span>
          <button onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>

        <button class="btn-cotizar" onclick="agregarAlCarrito(${index})">
          Agregar al carrito
        </button>

      </div>
    `;
  });

}

/* =========================
   FILTROS
========================= */

function cargarFiltros() {

  const categorias = [...new Set(productosGlobal.map(p => p.categoria))];
  const generos = [...new Set(productosGlobal.map(p => p.genero))];
  const ocasiones = [...new Set(productosGlobal.map(p => p.ocasion))];

  categorias.forEach(c => {
    document.getElementById("filtro-categoria").innerHTML += `<option value="${c}">${c}</option>`;
  });

  generos.forEach(g => {
    document.getElementById("filtro-genero").innerHTML += `<option value="${g}">${g}</option>`;
  });

  ocasiones.forEach(o => {
    document.getElementById("filtro-ocasion").innerHTML += `<option value="${o}">${o}</option>`;
  });

}

function aplicarFiltros() {

  const categoria = document.getElementById("filtro-categoria").value;
  const genero = document.getElementById("filtro-genero").value;
  const ocasion = document.getElementById("filtro-ocasion").value;

  const filtrados = productosGlobal.filter(function(p) {

    const cumpleCategoria = categoria === "todos" || p.categoria === categoria;
    const cumpleGenero = genero === "todos" || p.genero === genero;
    const cumpleOcasion = ocasion === "todos" || p.ocasion === ocasion;

    return cumpleCategoria && cumpleGenero && cumpleOcasion;

  });

  mostrarProductos(filtrados);
}

/* =========================
   CANTIDAD
========================= */

function cambiarCantidad(index, cambio) {

  const span = document.getElementById(`cantidad-${index}`);
  let valor = parseInt(span.textContent);

  valor += cambio;
  if (valor < 1) valor = 1;

  span.textContent = valor;
}

/* =========================
   AGREGAR AL CARRITO
========================= */

function agregarAlCarrito(index) {

  const producto = productosGlobal[index];
  const cantidad = parseInt(document.getElementById(`cantidad-${index}`).textContent);

  const selectTalla = document.getElementById(`talla-${index}`);
  const talla = selectTalla ? selectTalla.value : "No aplica";

  const productoExistente = carrito.find(item => item.ref === producto.ref);

  if (productoExistente) {

    if (!productoExistente.tallas) {
      productoExistente.tallas = {};
    }

    if (productoExistente.tallas[talla]) {
      productoExistente.tallas[talla] += cantidad;
    } else {
      productoExistente.tallas[talla] = cantidad;
    }

  } else {

    carrito.push({
      nombre: producto.nombre,
      ref: producto.ref,
      imagen: producto.imagenurl,
      tallas: {
        [talla]: cantidad
      }
    });

  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();

  // Animación carrito
  const iconoCarrito = document.querySelector(".icon-btn.glow:last-child");

  if (iconoCarrito) {
    iconoCarrito.classList.add("pulse-cart");

    setTimeout(function() {
      iconoCarrito.classList.remove("pulse-cart");
    }, 500);
  }

}