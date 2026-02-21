let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

function guardarCarrito(){
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadores();
}

function actualizarContadores(){
  const cartEl = document.getElementById("cartCount");
  if(cartEl){
    cartEl.textContent = carrito.reduce((a,b)=>a+b.cantidad,0);
  }
}

function agregarCarrito(producto){

  let existente = carrito.find(p => 
    p.ref === producto.ref && p.talla === producto.talla
  );

  if(existente){
    existente.cantidad += producto.cantidad;
  }else{
    carrito.push(producto);
  }

  guardarCarrito();
}

function abrirCarrito(){

  if(carrito.length === 0){
    alert("Tu carrito está vacío.");
    return;
  }

  let nombre = prompt("¿Cuál es tu nombre?");
  if(!nombre) return;

  let mensaje = `Hola, soy ${nombre}, quiero cotizar los siguientes productos:%0A%0A`;

  carrito.forEach(p=>{
    mensaje += `• ${p.nombre}`;
    if(p.talla) mensaje += ` talla ${p.talla}`;
    mensaje += ` x ${p.cantidad} und.%0A`;
    mensaje += `Ref: ${window.location.origin}${p.imagenurl}%0A%0A`;
  });

  let url = `https://wa.me/573147671380?text=${mensaje}`;
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", actualizarContadores);