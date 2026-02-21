const sheetURL="https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

const productosContainer = document.getElementById("productos");

async function cargarProductos(){

const res = await fetch(sheetURL);
const data = await res.text();

const filas = data.split("\n").slice(1);

const productos = filas.map(fila=>{

const c = fila.split(",");

return{
ref:c[0],
nombre:c[1],
imagenurl:c[2],
talla:c[7]?c[7].split("|"):[],
activo:c[13]
};

}).filter(p=>p.activo==="si");

renderProductos(productos);

}

function renderProductos(lista){

productosContainer.innerHTML="";

lista.forEach(p=>{

const div=document.createElement("div");
div.className="producto";

let tallaHTML="";

if(p.talla.length>0){
tallaHTML=`
<select>
${p.talla.map(t=>`<option>${t}</option>`).join("")}
</select>`;
}

div.innerHTML=`
<img src="${p.imagenurl}">
<h3>${p.nombre}</h3>
${tallaHTML}
<button class="btn-carrito">Agregar</button>
`;

productosContainer.appendChild(div);

});

}

cargarProductos();