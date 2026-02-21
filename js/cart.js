let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

function actualizarContador(){
  const contador = document.getElementById("cartCount");
  if(!contador) return;

  const total = carrito.reduce((acc,item)=>acc+item.cantidad,0);
  contador.textContent = total;
}

function guardar(){
  localStorage.setItem("carrito",JSON.stringify(carrito));
  actualizarContador();
}

function agregarCarrito(producto){

  let existente = carrito.find(p=> 
    p.ref===producto.ref && p.talla===producto.talla
  );

  if(existente){
    existente.cantidad += producto.cantidad;
  } else {
    carrito.push(producto);
  }

  guardar();
}

function abrirCarrito(){

  if(carrito.length===0){
    alert("Tu carrito está vacío.");
    return;
  }

  let nombre = prompt("¿Cuál es tu nombre?");
  if(!nombre) return;

  let mensaje = `Hola, soy ${nombre}, quiero cotizar:%0A%0A`;

  carrito.forEach(p=>{
    mensaje += `• ${p.nombre}`;
    if(p.talla) mensaje += ` talla ${p.talla}`;
    mensaje += ` x ${p.cantidad} und.%0A`;
    mensaje += `Ref: ${window.location.origin}${p.imagenurl}%0A%0A`;
  });

  window.open(`https://wa.me/573147671380?text=${mensaje}`, "_blank");
}

document.addEventListener("DOMContentLoaded", actualizarContador);