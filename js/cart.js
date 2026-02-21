let carrito=JSON.parse(localStorage.getItem("carrito")||"[]");
let favoritos=JSON.parse(localStorage.getItem("favoritos")||"[]");

function actualizarContadores(){
  document.getElementById("cartCount").textContent=
    carrito.reduce((a,b)=>a+b.cantidad,0);

  document.getElementById("favCount").textContent=
    favoritos.length;
}

function guardar(){
  localStorage.setItem("carrito",JSON.stringify(carrito));
  localStorage.setItem("favoritos",JSON.stringify(favoritos));
  actualizarContadores();
}

function agregarCarrito(prod){
  let existe=carrito.find(p=>p.ref===prod.ref && p.talla===prod.talla);
  if(existe) existe.cantidad+=prod.cantidad;
  else carrito.push(prod);
  guardar();
}

function agregarFavorito(prod){
  if(!favoritos.find(p=>p.ref===prod.ref)){
    favoritos.push(prod);
    guardar();
  }
}

function abrirCarrito(){
  alert("Carrito próximamente — conectado a WhatsApp");
}

function abrirFavoritos(){
  alert("Favoritos próximamente");
}

document.addEventListener("DOMContentLoaded",actualizarContadores);