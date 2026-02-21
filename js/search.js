document.addEventListener("DOMContentLoaded",()=>{

  const input=document.getElementById("buscadorGlobal");
  if(!input) return;

  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      const texto=input.value.trim();
      if(texto.length>1){
        window.location.href=`/catalogo/?buscar=${texto}`;
      }
    }
  });

});