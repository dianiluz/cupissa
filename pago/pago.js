let pasoActual = 1;

const CIUDADES_LOCALES = [
  "BARRANQUILLA",
  "SOLEDAD",
  "GALAPA",
  "MALAMBO",
  "PUERTO COLOMBIA"
];

const DEPARTAMENTOS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda",
  "San Andrés y Providencia","Santander","Sucre","Tolima",
  "Valle del Cauca","Vaupés","Vichada"
];

document.addEventListener("DOMContentLoaded", () => {

  renderResumenCarrito();
  manejarNavegacion();
  inicializarCiudad();
  inicializarDepartamento();
  prellenarUsuario();
});

function manejarNavegacion() {
  document.querySelectorAll(".next-step").forEach(btn => {
    btn.addEventListener("click", () => cambiarPaso(pasoActual + 1));
  });

  document.querySelectorAll(".prev-step").forEach(btn => {
    btn.addEventListener("click", () => cambiarPaso(pasoActual - 1));
  });
}

function cambiarPaso(nuevoPaso) {
  if (nuevoPaso < 1 || nuevoPaso > 4) return;

  document.querySelector(`#paso-${pasoActual}`).classList.remove("active");
  document.querySelector(`.step[data-step="${pasoActual}"]`).classList.remove("active");

  pasoActual = nuevoPaso;

  document.querySelector(`#paso-${pasoActual}`).classList.add("active");
  document.querySelector(`.step[data-step="${pasoActual}"]`).classList.add("active");
}

function renderResumenCarrito() {
  const contenedor = document.getElementById("resumenCarrito");
  const carrito = obtenerLocal("cupissa_carrito") || [];

  if (!carrito.length) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  let total = 0;
  let html = "";

  carrito.forEach(item => {
    total += item.subtotal || 0;
    html += `<div><strong>${item.nombre}</strong><br>$ ${item.subtotal.toLocaleString()}</div>`;
  });

  html += `<hr><strong>Total: $ ${total.toLocaleString()}</strong>`;
  contenedor.innerHTML = html;
}

function prellenarUsuario() {
  const userData = localStorage.getItem("cupissa_user");
  if (!userData) return;

  const user = JSON.parse(userData);

  ["nombre","email","telefono","direccion","barrio","ciudad"].forEach(id => {
    if (user[id]) {
      const input = document.getElementById(id);
      if (input) input.value = user[id];
    }
  });

  if (user.departamento) {
    document.getElementById("departamentoBuscador").value = user.departamento;
  }

  verificarDocumento();
}

/* ================= DOCUMENTO ================= */

function esDireccionLocal() {
  const ciudad = document.getElementById("ciudad").value.trim().toUpperCase();
  return CIUDADES_LOCALES.includes(ciudad);
}

function verificarDocumento() {
  const contenedor = document.getElementById("documentoContainer");
  contenedor.style.display = esDireccionLocal() ? "none" : "block";
}

document.getElementById("ciudad").addEventListener("input", verificarDocumento);

/* ================= CIUDAD ================= */

function inicializarCiudad() {

  const input = document.getElementById("ciudad");
  const sugerencias = document.getElementById("ciudadSugerencias");

  input.addEventListener("input", async function() {

    const query = this.value.trim();
    if (query.length < 3) {
      sugerencias.style.display = "none";
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Colombia")}&addressdetails=1&limit=5`;

    const response = await fetch(url);
    const data = await response.json();

    sugerencias.innerHTML = "";

    data.forEach(lugar => {

      const ciudad =
        lugar.address.city ||
        lugar.address.town ||
        lugar.address.municipality;

      if (!ciudad) return;

      const div = document.createElement("div");
      div.className = "direccion-item";
      div.textContent = ciudad;

      div.onclick = () => {
        input.value = ciudad;
        sugerencias.style.display = "none";
        verificarDocumento();
      };

      sugerencias.appendChild(div);
    });

    sugerencias.style.display = "block";
  });
}

/* ================= DEPARTAMENTO ================= */

function inicializarDepartamento() {

  const input = document.getElementById("departamentoBuscador");
  const lista = document.getElementById("departamentoLista");

  input.addEventListener("input", function() {

    const valor = this.value.toLowerCase();
    lista.innerHTML = "";

    if (!valor) {
      lista.style.display = "none";
      return;
    }

    const filtrados = DEPARTAMENTOS.filter(dep =>
      dep.toLowerCase().includes(valor)
    );

    filtrados.forEach(dep => {

      const div = document.createElement("div");
      div.className = "direccion-item";
      div.textContent = dep;

      div.onclick = () => {
        input.value = dep;
        lista.style.display = "none";
      };

      lista.appendChild(div);
    });

    lista.style.display = "block";
  });
}