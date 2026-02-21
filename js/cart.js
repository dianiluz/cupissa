let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

function agregarCarrito(prod){
  let existe = carrito.find(p=>p.ref===prod.ref && p.talla===prod.talla);

  if(existe) existe.cantidad += prod.cantidad;
  else carrito.push(prod);

  localStorage.setItem("carrito", JSON.stringify(carrito));
}