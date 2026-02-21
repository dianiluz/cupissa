let productosGlobal = [];

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

async function cargarProductos(){

const res = await fetch(sheetURL);
const texto = await res.text();

const filas = texto.split("\n").slice(1);

productosGlobal = filas.map(fila=>{

const c = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

return{
ref:c[0]?.trim(),
nombre:c[1]?.trim(),
imagenurl:c[2]?.trim(),
mundo:c[3]?.trim(),
categoria:c[4]?.trim(),
subcategoria:c[5]?.trim(),
tipo:c[6]?.trim(),
talla:c[7]?.trim() ? c[7].split("|") : [],
tematica:c[8]?.trim(),
genero:c[9]?.trim(),
ocasion:c[10]?.trim(),
personalizable:c[11]?.trim(),
palabras_clave:c[12]?.trim(),
activo:c[13]?.trim()
};

}).filter(p => p.activo?.toLowerCase() === "si");

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