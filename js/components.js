document.addEventListener("DOMContentLoaded", () => {

  function cargarComponente(id, ruta){
    const contenedor = document.getElementById(id);
    if(!contenedor) return;

    fetch(ruta)
      .then(res => res.text())
      .then(data => {
        contenedor.innerHTML = data;
      });
  }

  cargarComponente("header", "/components/header.html");
  cargarComponente("footer", "/components/footer.html");

});