const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

let productosGlobal = [];

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n");
    const encabezados = filas[0].split(",");

    productosGlobal = filas.slice(1).map(fila => {
      const valores = fila.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

      if (!valores) return null;

      return {
        ref: valores[0]?.replace(/"/g, ""),
        nombre: valores[1]?.replace(/"/g, ""),
        imagenurl: valores[2]?.replace(/"/g, ""),
        categoria: valores[4]?.replace(/"/g, ""),
         talla: valores[7]?.replace(/"/g, ""),
        palabras_clave: valores[12]?.replace(/"/g, ""),
        activo: valores[13]?.replace(/"/g, "").trim().toLowerCase()
      };
    })
    .filter(p => p && (p.activo === "true" || p.activo === "si"));

    mostrarProductos(productosGlobal);
  });

function mostrarProductos(productos) {
  const container = document.getElementById("productos-container");
  container.innerHTML = "";

  productos.forEach((producto, index) => {

    const tieneTalla = producto.talla && producto.talla !== "";

    const tallas = tieneTalla ? producto.talla.split("|") : [];

    container.innerHTML += `
      <div class="card-producto">

       <img src="/assets/img/${producto.imagenurl}"

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

        <button class="btn-cotizar" onclick="cotizarProducto(${index})">
          Cotizar por WhatsApp
        </button>

      </div>
    `;
  });
}

function cambiarCantidad(index, cambio) {
  const span = document.getElementById(`cantidad-${index}`);
  let valor = parseInt(span.textContent);

  valor += cambio;

  if (valor < 1) valor = 1;

  span.textContent = valor;
}

function cotizarProducto(index) {
  const producto = productosGlobal[index];
  const cantidad = document.getElementById(`cantidad-${index}`).textContent;

  const selectTalla = document.getElementById(`talla-${index}`);
  const talla = selectTalla ? selectTalla.value : "No aplica";

  const mensaje = `Hola, quiero cotizar:
Producto: ${producto.nombre}
Ref: ${producto.ref}
Talla: ${talla}
Cantidad: ${cantidad}`;

  const link = `https://wa.me/573147671380?text=${encodeURIComponent(mensaje)}`;

  window.open(link, "_blank");
}