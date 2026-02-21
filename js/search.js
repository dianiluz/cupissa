// js/search.js
const inputGlobal = document.getElementById("globalSearch");

let productosGlobal = []; // guardamos todos los productos

// Modifica cargarProductos para guardar la lista global
async function cargarProductos() {
  const res = await fetch(sheetURL);
  const csvText = await res.text();
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  productosGlobal = parsed.data
    .filter(p => p.activo.toLowerCase() === "si")
    .map(p => ({
      ref: p.ref,
      nombre: p.nombre,
      imagenurl: p.imagenurl,
      mundo: p.mundo,
      categoria: p.categoria,
      subcategoria: p.subcategoria,
      tipo: p.tipo,
      talla: p.talla ? p.talla.split("|") : [],
      tematica: p.tematica,
      genero: p.genero,
      ocasion: p.ocasion,
      personalizable: p.personalizable,
      palabras_clave: p.palabras_clave
    }));

  renderProductos(productosGlobal);
  generarFiltros(productosGlobal);
}

// Función para filtrar según el buscador global
inputGlobal.addEventListener("input", () => {
  const term = inputGlobal.value.toLowerCase();
  const filtrados = productosGlobal.filter(p => {
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.mundo.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term) ||
      p.subcategoria.toLowerCase().includes(term) ||
      (p.palabras_clave && p.palabras_clave.toLowerCase().includes(term))
    );
  });
  renderProductos(filtrados);
});