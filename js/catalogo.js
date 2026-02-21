const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

let productosGlobal = [];

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {
    const filas = data.split("\n").slice(1);

    productosGlobal = filas.map(fila => {
      const col = fila.split(",");
      return {
        ref: col[0],
        nombre: col[1],
        imagenurl: col[2],
        categoria: col[4],
        palabras_clave: col[12],
       activo: col[13]?.trim().toLowerCase()
      };
    }).filter(p => p.activo === "true" || p.activo === "si");

    mostrarProductos(productosGlobal);
  });

function mostrarProductos(productos) {
  const container = document.getElementById("productos-container");
  container.innerHTML = "";

  productos.forEach(producto => {

    const mensaje = `Hola, quiero cotizar el producto ${producto.nombre} Ref: ${producto.ref}`;
    const link = `https://wa.me/573147671380?text=${encodeURIComponent(mensaje)}`;

    container.innerHTML += `
      <div>
        <img src="${producto.imagenurl}" width="100%">
        <h3>${producto.nombre}</h3>
        <a href="${link}" target="_blank">
          <button>Cotizar por WhatsApp</button>
        </a>
      </div>
    `;
  });
}