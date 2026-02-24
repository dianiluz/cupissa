/* ===================================================== */
/* UNIVERSO CUPISSA — RASTREO TRANSPORTADORA */
/* ===================================================== */

const sheetRastreoURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?gid=1721653611&single=true&output=tsv";

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btnBuscarPedido");
  const input = document.getElementById("inputPedido");
  const resultado = document.getElementById("resultadoRastreo");

  if (!btn) return;

  btn.addEventListener("click", async () => {

    const idPedido = input.value.trim();
    if (!idPedido) return;

    resultado.innerHTML = "Buscando pedido...";

    try {

      const response = await fetch(sheetRastreoURL);
      const text = await response.text();

      const filas = text.split("\n").map(f => f.split("\t"));
      const headers = filas[0].map(h => h.trim().toLowerCase());
      const data = filas.slice(1);

      const colID = headers.findIndex(h => h.includes("idpedido"));
      const colEstado = headers.findIndex(h => h.includes("estado"));
      const colNombre = headers.findIndex(h => h.includes("nombrecliente"));
      const colContacto = headers.findIndex(h => h.includes("telefonoycorreo"));
      const colDireccion = headers.findIndex(h => h.includes("dire"));
      const colTransportadora = headers.findIndex(h => h.includes("transportadora"));
      const colGuia = headers.findIndex(h => h.includes("guia"));

      const pedido = data.find(row =>
        String(row[colID]).trim().toLowerCase() === idPedido.toLowerCase()
      );

      if (!pedido) {
        resultado.innerHTML = "<p>No se encontró el pedido.</p>";
        return;
      }

      const estado = String(pedido[colEstado]).trim();

      const cliente = {
        nombre: colNombre !== -1 ? pedido[colNombre] : "",
        contacto: colContacto !== -1 ? pedido[colContacto] : "",
        direccion: colDireccion !== -1 ? pedido[colDireccion] : ""
      };

      const transportadora = colTransportadora !== -1 ? pedido[colTransportadora] : "";
      const guia = colGuia !== -1 ? pedido[colGuia] : "";

      resultado.innerHTML = generarVistaRastreo(
        idPedido,
        estado,
        transportadora,
        guia,
        cliente
      );

      setTimeout(() => {
        document.querySelector(".progreso-fill").style.width =
          calcularProgreso(estado) + "%";
      }, 100);

    } catch (error) {
      resultado.innerHTML = "<p>Error consultando el pedido.</p>";
    }

  });

});

/* ========================= */
/* PROGRESO */
/* ========================= */

function calcularProgreso(estado) {
  const total = 5;
  const actual = parseInt(estado);
  return ((actual - 1) / (total - 1)) * 100;
}

/* ========================= */
/* VISTA */
/* ========================= */

function generarVistaRastreo(id, estado, transportadora, guia, cliente) {

  const pasos = [
    { id: 1, nombre: "Agendado" },
    { id: 2, nombre: "En fabricación" },
    { id: 3, nombre: "Listo para envío" },
    { id: 4, nombre: "En camino" },
    { id: 5, nombre: "Entregado" }
  ];

  const actual = parseInt(estado);

  const pasosHTML = pasos.map(p => {

    const activo = actual >= p.id;

    return `
      <div class="paso ${activo ? "activo" : ""}">
        <div class="circulo">${activo ? "✔" : ""}</div>
        <span>${p.nombre}</span>
      </div>
    `;

  }).join("");

  return `
    <div class="rastreo-card">

      <div class="rastreo-id">
        Pedido #${id}
      </div>

      <div class="linea-progreso">
        <div class="progreso-fill" style="width:0%"></div>
        ${pasosHTML}
      </div>

      <div class="datos-cliente">
        ${cliente.nombre ? `<p><strong>Cliente:</strong> ${cliente.nombre}</p>` : ""}
        ${cliente.contacto ? `<p><strong>Contacto:</strong> ${cliente.contacto}</p>` : ""}
        ${cliente.direccion ? `<p><strong>Dirección:</strong> ${cliente.direccion}</p>` : ""}
      </div>

      ${transportadora ? `
        <div class="datos-envio">
          <p><strong>Transportadora:</strong> ${transportadora}</p>
          ${guia ? `<p><strong>Guía:</strong> ${guia}</p>` : ""}
        </div>
      ` : ""}

      <button class="btn-principal" onclick="window.open('https://wa.me/573147671380')">
        ¿Algo está mal? Haz click aquí para corregir datos.
      </button>

    </div>
  `;
}