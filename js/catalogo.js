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

  productos.forEach(producto => {

    const mensaje = `Hola, quiero cotizar el producto ${producto.nombre} Ref: ${producto.ref}`;
    const link = `https://wa.me/573147671380?text=${encodeURIComponent(mensaje)}`;

    container.innerHTML += `
      <div style="background:#111;padding:15px;border-radius:15px;">
        <img src="${producto.imagenurl}" style="width:100%;border-radius:10px;">
        <h3>${producto.nombre}</h3>
        <a href="${link}" target="_blank">
          <button style="padding:10px;border-radius:20px;">Cotizar por WhatsApp</button>
        </a>
      </div>
    `;
  });
}