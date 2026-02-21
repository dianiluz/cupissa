// js/catalogo.js
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

const productosContainer = document.getElementById("productos");
const inputGlobal = document.getElementById("globalSearch");

let productosGlobal = []; // guardamos todos los productos para filtros y buscador

// Cargar productos desde Google Sheet
async function cargarProductos() {
  const res = await fetch(sheetURL);
  const csvText = await res.text();

  // Parsear CSV usando PapaParse
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  // Mapear productos activos
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

// Renderizar productos en el grid
function renderProductos(lista) {
  productosContainer.innerHTML = "";

  lista.forEach(p => {
    let tallaHTML = "";
    if (p.talla.length > 0) {
      tallaHTML = `<select>${p.talla.map(t => `<option>${t}</option>`).join("")}</select>`;
    }

    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${p.imagenurl}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      ${tallaHTML}
      <button class="btn-carrito">Agregar</button>
    `;
    productosContainer.appendChild(div);
  });
}

// Generar filtros dinámicos (Mundo, Categoría, Subcategoría)
function generarFiltros(productos) {
  const selects = document.querySelectorAll(".filtros select");

  const mundos = [...new Set(productos.map(p => p.mundo).filter(Boolean))];
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const subcategorias = [...new Set(productos.map(p => p.subcategoria).filter(Boolean))];

  mundos.forEach(m => selects[0].appendChild(new Option(m, m)));
  categorias.forEach(c => selects[1].appendChild(new Option(c, c)));
  subcategorias.forEach(s => selects[2].appendChild(new Option(s, s)));
}

// Buscador global
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

// Iniciar carga al abrir la página
cargarProductos();