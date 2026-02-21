document.addEventListener("DOMContentLoaded", ()=>{

setTimeout(()=>{

const input = document.getElementById("globalSearch");
if(!input) return;

input.addEventListener("input", ()=>{

const texto = input.value.toLowerCase();

if(texto.length < 2){
if(window.productosGlobal) renderProductos(productosGlobal);
return;
}

const resultados = productosGlobal.filter(p =>
(p.nombre && p.nombre.toLowerCase().includes(texto)) ||
(p.tematica && p.tematica.toLowerCase().includes(texto)) ||
(p.ocasion && p.ocasion.toLowerCase().includes(texto)) ||
(p.palabras_clave && p.palabras_clave.toLowerCase().includes(texto))
);

renderProductos(resultados);

});

},500);

});