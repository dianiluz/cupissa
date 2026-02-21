document.addEventListener("DOMContentLoaded", () => {

  function cargar(id, ruta){
    const el = document.getElementById(id);
    if(!el) return;

    fetch(ruta)
      .then(res => res.text())
      .then(data => el.innerHTML = data);
  }

  cargar("header","/components/header.html");
  cargar("footer","/components/footer.html");

});