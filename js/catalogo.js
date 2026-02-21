let productosGlobal = [];

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=csv";

async function cargarProductos(){

  const res = await fetch(sheetURL);
  const texto = await res.text();

  const filas = texto.split("\n").slice(1);

  productosGlobal = filas.map(f=>{
    const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    return{
      ref:c[0]?.replace(/"/g,"").trim(),
      nombre:c[1]?.replace(/"/g,"").trim(),
      imagenurl:c[2]?.replace(/"/g,"").trim(),
      talla:c[7]?.replace(/"/g,"").trim() ? c[7].replace(/"/g,"").trim().split("|") : [],
      palabras:c[12]?.replace(/"/g,"").trim(),
      activo:c[13]?.replace(/"/g,"").trim()
    };

  }).filter(p=>p.activo?.toLowerCase().includes("si"));

  renderProductos(productosGlobal);
}

function renderProductos(lista){

  const cont = document.getElementById("productos");
  if(!cont) return;

  cont.innerHTML="";

  lista.forEach(p=>{

    const div=document.createElement("div");
    div.className="producto";

    let tallaHTML="";
    if(p.talla.length>0){
      tallaHTML=`
        <select class="talla-select">
        ${p.talla.map(t=>`<option>${t}</option>`).join("")}
        </select>`;
    }

    div.innerHTML=`
      <img src="${p.imagenurl}" class="producto-img">
      <h3>${p.nombre}</h3>
      ${tallaHTML}
      <button class="btn-carrito">Agregar</button>
    `;

    cont.appendChild(div);

    // animación entrada
    div.style.opacity="0";
    div.style.transform="translateY(20px)";
    setTimeout(()=>{
      div.style.transition="all .4s ease";
      div.style.opacity="1";
      div.style.transform="translateY(0)";
    },50);

    const btn=div.querySelector(".btn-carrito");

    btn.addEventListener("click",()=>{

      const select=div.querySelector(".talla-select");
      const talla=select?select.value:"";

      agregarCarrito({
        ref:p.ref,
        nombre:p.nombre,
        talla:talla,
        cantidad:1,
        imagenurl:p.imagenurl
      });

      btn.innerHTML="✔ Agregado";
      btn.style.background="#4caf50";

      setTimeout(()=>{
        btn.innerHTML="Agregar";
        btn.style.background="#f06596";
      },1000);

    });

  });
}

document.addEventListener("DOMContentLoaded", cargarProductos);