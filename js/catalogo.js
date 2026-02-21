let productosGlobal = [];

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

async function cargarProductos(){

const res = await fetch(sheetURL);
const texto = await res.text();

const filas = texto.split("\n").slice(1);

productosGlobal = filas.map(fila=>{

const c = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

return{
ref:c[0]?.replace(/"/g,"").trim(),
nombre:c[1]?.replace(/"/g,"").trim(),
imagenurl:c[2]?.replace(/"/g,"").trim(),
mundo:c[3]?.replace(/"/g,"").trim(),
categoria:c[4]?.replace(/"/g,"").trim(),
subcategoria:c[5]?.replace(/"/g,"").trim(),
tipo:c[6]?.replace(/"/g,"").trim(),
talla:c[7]?.replace(/"/g,"").trim() ? c[7].replace(/"/g,"").trim().split("|") : [],
tematica:c[8]?.replace(/"/g,"").trim(),
genero:c[9]?.replace(/"/g,"").trim(),
ocasion:c[10]?.replace(/"/g,"").trim(),
personalizable:c[11]?.replace(/"/g,"").trim(),
palabras_clave:c[12]?.replace(/"/g,"").trim(),
activo:c[13]?.replace(/"/g,"").trim()
};

}).filter(p => p.activo && p.activo.toLowerCase().includes("si"));

renderProductos(productosGlobal);
}

function renderProductos(lista){

const cont = document.getElementById("productos");
if(!cont) return;

cont.innerHTML = "";

lista.forEach(p=>{

const div = document.createElement("div");
div.className = "producto";

let tallaHTML = "";

if(p.talla.length > 0){
tallaHTML = `
<select>
${p.talla.map(t=>`<option>${t}</option>`).join("")}
</select>`;
}

div.innerHTML = `
<img src="${p.imagenurl}">
<h3>${p.nombre}</h3>
${tallaHTML}
<button class="btn-carrito">Agregar</button>
`;

cont.appendChild(div);

});
}

document.addEventListener("DOMContentLoaded", cargarProductos);