let productosBusqueda = [];

async function cargarBusqueda(){

  const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv");
  const texto = await res.text();

  const filas = texto.split("\n").slice(1);

  productosBusqueda = filas.map(f=>{
    const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    return {
      nombre:c[1]?.replace(/"/g,"").trim(),
      mundo:c[3]?.replace(/"/g,"").trim(),
      categoria:c[4]?.replace(/"/g,"").trim(),
      subcategoria:c[5]?.replace(/"/g,"").trim(),
      tipo:c[6]?.replace(/"/g,"").trim(),
      tematica:c[8]?.replace(/"/g,"").trim(),
      ocasion:c[10]?.replace(/"/g,"").trim(),
      palabras:c[12]?.replace(/"/g,"").trim(),
      activo:c[13]?.replace(/"/g,"").trim()
    };

  }).filter(p=>p.activo?.toLowerCase().includes("si"));

}

document.addEventListener("DOMContentLoaded", ()=>{

  cargarBusqueda();

  const input = document.getElementById("buscadorGlobal");
  if(!input) return;

  input.addEventListener("input", e=>{

    const texto = e.target.value.toLowerCase();
    if(texto.length < 2) return;

    const resultados = productosBusqueda.filter(p=>
      p.nombre?.toLowerCase().includes(texto) ||
      p.tematica?.toLowerCase().includes(texto) ||
      p.ocasion?.toLowerCase().includes(texto) ||
      p.palabras?.toLowerCase().includes(texto)
    );

    // Redirige automáticamente al catálogo con query
    window.location.href = `/catalogo/?buscar=${texto}`;

  });

});