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
        <select class="talla-select">
          ${p.talla.map(t=>`<option value="${t}">${t}</option>`).join("")}
        </select>`;
    }

    div.innerHTML = `
      <img src="${p.imagenurl}" class="producto-img">
      <h3>${p.nombre}</h3>
      ${tallaHTML}
      <button class="btn-carrito">Agregar</button>
    `;

    cont.appendChild(div);

    // ANIMACIÓN ENTRADA
    div.style.opacity = "0";
    div.style.transform = "translateY(20px)";
    setTimeout(()=>{
      div.style.transition = "all .4s ease";
      div.style.opacity = "1";
      div.style.transform = "translateY(0)";
    }, 50);

    // EVENTO BOTÓN
    const btn = div.querySelector(".btn-carrito");

    btn.addEventListener("click", ()=>{

      const select = div.querySelector(".talla-select");
      const talla = select ? select.value : "";

      agregarCarrito({
        ref:p.ref,
        nombre:p.nombre,
        talla:talla,
        cantidad:1,
        imagenurl:p.imagenurl
      });

      // Animación premium botón
      btn.innerHTML = "✔ Agregado";
      btn.style.background = "#4caf50";
      btn.style.transform = "scale(1.05)";

      setTimeout(()=>{
        btn.innerHTML = "Agregar";
        btn.style.background = "#f06596";
        btn.style.transform = "scale(1)";
      }, 1200);

    });

  });
}

div.innerHTML = `
  <img src="${p.imagenurl}" class="producto-img">
  <h3>${p.nombre}</h3>
  ${tallaHTML}
  <button class="btn-carrito">Agregar</button>
`;

cont.appendChild(div);

// EVENTO BOTÓN
const btn = div.querySelector(".btn-carrito");

btn.addEventListener("click", ()=>{

  const select = div.querySelector(".talla-select");
  const talla = select ? select.value : "";

  agregarCarrito({
    ref: p.ref,
    nombre: p.nombre,
    talla: talla,
    cantidad: 1,
    imagenurl: p.imagenurl
  });

  alert("Producto agregado al carrito");
});

document.addEventListener("DOMContentLoaded", cargarProductos);

document.addEventListener("DOMContentLoaded", ()=>{

  const params = new URLSearchParams(window.location.search);
  const buscar = params.get("buscar");

  if(buscar){
    setTimeout(()=>{
      const filtrados = productosGlobal.filter(p=>
        p.nombre.toLowerCase().includes(buscar) ||
        p.tematica.toLowerCase().includes(buscar) ||
        p.ocasion.toLowerCase().includes(buscar) ||
        (p.palabras_clave && p.palabras_clave.toLowerCase().includes(buscar))
      );
      renderProductos(filtrados);
    }, 800);
  }

});