console.log("Panel cargado");

document.addEventListener("DOMContentLoaded", async () => {

  const userData = localStorage.getItem("cupissa_user");

  if (!userData) {
    window.location.href = "/";
    return;
  }

  const user = JSON.parse(userData);

  if (user.tipo_usuario === "CLIENTE") {
    renderPanelCliente(user);
    await cargarPedidosUsuario();
    renderResumen();
  }

  if (user.tipo_usuario === "VENDEDOR") {
    renderPanelVendedor(user);
  }

  if (user.tipo_usuario === "ADMIN") {
    renderPanelAdmin(user);
  }

});


/* ========================= */
/* PANEL CLIENTE */
/* ========================= */

function renderPanelCliente(user) {

  const topbar = document.getElementById("panelTopbar");
  const content = document.getElementById("panelContent");

  topbar.innerHTML = `
  <div class="panel-tab active" data-tab="resumen">Resumen</div>
  <div class="panel-tab" data-tab="pedidos">Mis pedidos</div>
  <div class="panel-tab" data-tab="promos">Promociones</div>
  <div class="panel-tab" data-tab="perfil">Mi perfil</div>
  `;

  activarTabs();

  content.innerHTML = `
  <h2 class="panel-section-title">Hola, ${user.nombre}</h2>
  <div class="panel-card">
    Este será tu resumen general.
  </div>
`;

  console.log("Render CLIENTE");
}



/* ========================= */
/* PANEL VENDEDOR */
/* ========================= */

function renderPanelCliente(user) {

  const topbar = document.getElementById("panelTopbar");

  topbar.innerHTML = `
    <div class="panel-tab active" data-tab="resumen">Resumen</div>
    <div class="panel-tab" data-tab="pedidos">Mis pedidos</div>
    <div class="panel-tab" data-tab="promos">Promociones</div>
    <div class="panel-tab" data-tab="perfil">Mi perfil</div>
  `;

  activarTabs();

  console.log("Render CLIENTE");

}



/* ========================= */
/* PANEL ADMIN */
/* ========================= */

function renderPanelAdmin(user) {

  const topbar = document.getElementById("panelTopbar");
  const content = document.getElementById("panelContent");

  topbar.innerHTML = `
    <div class="panel-tab active">Admin</div>
  `;

  content.innerHTML = `
    <h2>Panel Administrador</h2>
  `;
}



/* ========================= */
/* TABS */
/* ========================= */

function activarTabs() {

  const tabs = document.querySelectorAll(".panel-tab");

  tabs.forEach(tab => {

    tab.addEventListener("click", async () => {

      document.querySelectorAll(".panel-tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const content = document.getElementById("panelContent");
      const user = JSON.parse(localStorage.getItem("cupissa_user"));

      /* ========================= */
      /* MIS PEDIDOS */
      /* ========================= */

      if (tab.dataset.tab === "pedidos") {

        content.innerHTML = "Cargando pedidos...";

        try {

          const response = await fetch(CONFIG.backendURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              action: "obtenerPedidosCliente",
              email: user.email
            })
          });

          const data = await response.json();
          window.cupissaPedidos = data.pedidos;

          if (!data.success || !data.pedidos || data.pedidos.length === 0) {
            content.innerHTML = `
              <div class="panel-card">
                No tienes pedidos registrados.
              </div>
            `;
            return;
          }

          content.innerHTML = `
            <h2 class="panel-section-title">Mis pedidos</h2>
          `;

          data.pedidos.forEach(p => {

            content.innerHTML += `
              <div class="panel-card pedido-layout">

                <div class="pedido-left">
                  <div class="pedido-grid" id="grid-${p.id}">
                    Cargando productos...
                  </div>
                </div>

                <div class="pedido-right">

                  <div class="pedido-info">
                    <strong>Pedido:</strong> ${p.id}<br>
                    <strong>Total:</strong> $${p.total}
                  </div>

                  ${renderBarraEstado(p.estado)}

                  ${p.guia ? `
                    <button onclick="window.open('${p.transportadora}', '_blank')" 
                            class="btn-secondary pedido-btn">
                      Consultar envío
                    </button>
                  ` : ""}

                </div>

              </div>
            `;

            cargarProductosPedido(p.id);

          });

        } catch (err) {

          content.innerHTML = `
            <div class="panel-card">
              Error al cargar pedidos.
            </div>
          `;

        }

        return;
      }

      /* ========================= */
/* RESUMEN */
/* ========================= */

  if (tab.dataset.tab === "resumen") {

  content.innerHTML = "Cargando resumen...";
  await cargarPedidosUsuario();
  renderResumen();

  return;
}

      /* ========================= */
      /* PERFIL */
      /* ========================= */

      if (tab.dataset.tab === "perfil") {

        content.innerHTML = "Cargando perfil...";

        try {

          const response = await fetch(CONFIG.backendURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              action: "obtenerPerfilUsuario",
              email: user.email
            })
          });

          const data = await response.json();

          if (!data.success) {
            content.innerHTML = "Error cargando perfil.";
            return;
          }

          const u = data.usuario;

          content.innerHTML = `
            <h2 class="panel-section-title">Mi perfil</h2>

            <div class="panel-card perfil-form">

              <label>Nombre</label>
              <input id="perfilNombre" value="${u.nombre}" />

              <label>Email</label>
              <input value="${u.email}" disabled />

              <label>Teléfono</label>
              <input id="perfilTelefono" value="${u.telefono || ""}" />

              <label>Dirección</label>
              <input id="perfilDireccion" value="${u.direccion || ""}" />

              <label>Ciudad</label>
              <input id="perfilCiudad" value="${u.ciudad || ""}" />

              <button class="btn-primary" onclick="guardarPerfil()">
                Guardar cambios
              </button>

              <hr style="margin:20px 0; border-color: var(--border-color);">

              <label>Nueva contraseña</label>
              <input type="password" id="perfilPassword" />

              <button class="btn-secondary" onclick="guardarPassword()">
                Cambiar contraseña
              </button>

            </div>
          `;

        } catch (err) {
          content.innerHTML = "Error cargando perfil.";
        }

        return;
      }

      /* ========================= */
/* PROMOCIONES */
/* ========================= */

if (tab.dataset.tab === "promos") {

  content.innerHTML = "Cargando promociones...";

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "obtenerPromociones",
        email: user.email
      })
    });

    const data = await response.json();

    if (!data.success) {
      content.innerHTML = `<div class="panel-card">Error cargando promociones.</div>`;
      return;
    }

    const banners = data.promociones.filter(p => p.tipo === "BANNER");
    const cupones = data.promociones.filter(p => p.tipo === "CUPON");

    content.innerHTML = `
    
      <h2 class="panel-section-title">Promociones para ti</h2>

      <div class="promo-wrapper">
        <button class="promo-arrow left" id="promoLeft">❮</button>
        <div class="promo-carousel" id="promoCarousel"></div>
        <button class="promo-arrow right" id="promoRight">❯</button>
      </div>

      <div class="promo-cupones">
        <h3 class="panel-subtitle">Tus cupones disponibles</h3>
        <div id="cuponContainer" class="cupon-grid"></div>
      </div>
    `;

    

    const carousel = document.getElementById("promoCarousel");

    

    banners.forEach(promo => {
      carousel.innerHTML += `
        <div class="promo-card"
     onclick="abrirModalPromo('${promo.imagen}','${promo.titulo}')">
  <img src="${promo.imagen}">
</div>
      `;
    });

    // Flechas funcionales reales
    document.getElementById("promoLeft").addEventListener("click", () => {
      carousel.scrollLeft -= carousel.offsetWidth * 0.8;
    });

    document.getElementById("promoRight").addEventListener("click", () => {
      carousel.scrollLeft += carousel.offsetWidth * 0.8;
    });

    // CUPONES
    const cuponContainer = document.getElementById("cuponContainer");

    if (!cupones.length) {
      cuponContainer.innerHTML = `
        <div class="panel-card">No tienes cupones activos.</div>
      `;
    } else {

      cupones.forEach(cupon => {

        cuponContainer.innerHTML += `
          <div class="cupon-card">
            <div class="cupon-codigo">${cupon.codigo}</div>
            <div class="cupon-desc">${cupon.descripcion || ""}</div>
            <button class="btn-primary"
              onclick="copiarCupon('${cupon.codigo}')">
              Copiar código
            </button>
          </div>
        `;
      });

    }

  } catch (err) {
    content.innerHTML = `<div class="panel-card">Error cargando promociones.</div>`;
  }

  return;
}



      /* ========================= */
      /* OTROS TABS */
      /* ========================= */

      content.innerHTML = `
        <h2 class="panel-section-title">${tab.dataset.tab}</h2>
        <div class="panel-card">
          Sin información.
        </div>
      `;

    });

  });

}
                

function estadoTexto(estado) {

  const estados = {
    1: "Agendado",
    2: "En fabricación",
    3: "Listo para envío",
    4: "En camino",
    5: "Entregado",
    6: "Cancelado"
  };

  return estados[estado] || "Desconocido";
}

function porcentajeEstado(estado) {

  const mapa = {
    1: 10,
    2: 30,
    3: 55,
    4: 80,
    5: 100,
    6: 100
  };

  return mapa[estado] || 0;
}

function renderBarraEstado(estado) {

  return `
    <div class="estado-container">
      <div class="estado-linea">
        <div class="estado-fill" style="width:${porcentajeEstado(estado)}%"></div>
      </div>
      <div class="estado-pasos">
        <span class="${estado >= 1 ? 'estado-paso activo' : ''}">Agendado</span>
        <span class="${estado >= 2 ? 'estado-paso activo' : ''}">Fabricación</span>
        <span class="${estado >= 3 ? 'estado-paso activo' : ''}">Listo</span>
        <span class="${estado >= 4 ? 'estado-paso activo' : ''}">En camino</span>
        <span class="${estado >= 5 ? 'estado-paso activo' : ''}">Entregado</span>
      </div>
    </div>
  `;
}

async function cargarPedidosUsuario() {

  const user = JSON.parse(localStorage.getItem("cupissa_user"));
  if (!user) return [];

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "obtenerPedidosCliente",
        email: user.email
      })
    });

    const data = await response.json();

    if (data.success && data.pedidos) {
      window.cupissaPedidos = data.pedidos;
      return data.pedidos;
    }

    window.cupissaPedidos = [];
    return [];

  } catch (err) {
    window.cupissaPedidos = [];
    return [];
  }

}

async function renderResumen() {

  const content = document.getElementById("panelContent");
  const pedidos = window.cupissaPedidos || [];
  const puntos = await obtenerPuntosUsuario();

  if (!pedidos.length) {
    content.innerHTML = `
      <div class="panel-card">
        No tienes actividad aún.
      </div>
    `;
    return;
  }

  const totalPedidos = pedidos.length;
  const entregados = pedidos.filter(p => Number(p.estado) === 5).length;
  const cancelados = pedidos.filter(p => Number(p.estado) === 6).length;
  const activos = pedidos.filter(p => Number(p.estado) >= 1 && Number(p.estado) <= 4).length;

  const totalGastado = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
  const ultimoPedido = pedidos[0];

  content.innerHTML = `
    <h2 class="panel-section-title">Resumen</h2>

    <div class="resumen-grid">

      <div class="resumen-card">
        <span>Total pedidos</span>
        <strong>${totalPedidos}</strong>
      </div>

      <div class="resumen-card">
        <span>Activos</span>
        <strong>${activos}</strong>
      </div>

      <div class="resumen-card">
        <span>Entregados</span>
        <strong>${entregados}</strong>
      </div>

      <div class="resumen-card">
        <span>Cancelados</span>
        <strong>${cancelados}</strong>
      </div>

      <div class="panel-card resumen-puntos">
  <span>Puntos acumulados</span>
  <strong>${puntos} ⭐</strong>
</div>

    </div>

    <div class="panel-card resumen-chart">
      <canvas id="graficoPedidos" width="220" height="220"></canvas>
    </div>

    <div class="panel-card resumen-total">
      <span>Total invertido</span>
      <strong>$${totalGastado.toLocaleString()}</strong>
    </div>

    <div class="panel-card resumen-ultimo">
      <span>Último pedido</span>
      <strong>${ultimoPedido.id}</strong>
      ${renderBarraEstado(ultimoPedido.estado)}
    </div>
  `;

  setTimeout(() => {
    dibujarGraficoPedidos(activos, entregados, cancelados);
  }, 100);

}


async function cargarProductosPedido(idPedido) {

  const grid = document.getElementById(`grid-${idPedido}`);

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "obtenerProductosPedido",
        id: idPedido
      })
    });

    const data = await response.json();

    if (!data.success || !data.productos || data.productos.length === 0) {
      grid.innerHTML = "Sin productos.";
      return;
    }

    const productos = data.productos;
    const maxVisible = 4;

    let html = `<div class="pedido-imagenes">`;

    productos.slice(0, maxVisible).forEach((prod, index) => {

      // Si es la última visible Y hay más productos
      if (index === maxVisible - 1 && productos.length > maxVisible) {

        const restantes = productos.length - maxVisible;

        html += `
          <div class="pedido-img overlay"
               onclick="abrirModalProductos('${idPedido}')">
            <img src="${prod.imagen}" />
            <div class="overlay-dark"></div>
            <div class="overlay-text">+${restantes}</div>
          </div>
        `;

      } else {

        html += `
          <div class="pedido-img"
               onclick="abrirModalProductos('${idPedido}')">
            <img src="${prod.imagen}" />
          </div>
        `;

      }

    });

    html += `</div>`;

    grid.innerHTML = html;

  } catch (err) {

    grid.innerHTML = "Error cargando productos.";

  }

}

async function abrirModalProductos(idPedido) {

  const response = await fetch(CONFIG.backendURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      action: "obtenerProductosPedido",
      id: idPedido
    })
  });

  const data = await response.json();

  if (!data.success) return;

  const productos = data.productos;

  let html = `
    <div class="modal-overlay" onclick="cerrarModalProductos()">
      <div class="modal-productos" onclick="event.stopPropagation()">
        <div class="modal-header">
          Productos del pedido
          <span class="modal-close" onclick="cerrarModalProductos()">✕</span>
        </div>
        <div class="modal-grid">
  `;

  productos.forEach(prod => {

    html += `
      <div class="modal-item">
        <img src="${prod.imagen}">
        <div class="modal-item-info">
          <div>${prod.nombre}</div>
          <div>Cantidad: ${prod.cantidad}</div>
          <div>$${prod.precio}</div>
        </div>
      </div>
    `;

  });

  html += `
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

}

function cerrarModalProductos() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

async function guardarPerfil() {

  const user = JSON.parse(localStorage.getItem("cupissa_user"));

  const nombre = document.getElementById("perfilNombre").value;
  const telefono = document.getElementById("perfilTelefono").value;
  const direccion = document.getElementById("perfilDireccion").value;
  const ciudad = document.getElementById("perfilCiudad").value;

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "actualizarPerfilUsuario",
        email: user.email,
        nombre,
        telefono,
        direccion,
        ciudad
      })
    });

    const data = await response.json();

    if (data.success) {
      mostrarToast("Perfil actualizado correctamente.");
    } else {
      mostrarToast("No se pudo actualizar el perfil.", true);
    }

  } catch (err) {
    mostrarToast("Error de conexión.", true);
  }

}

async function guardarPassword() {

  const user = JSON.parse(localStorage.getItem("cupissa_user"));
  const password = document.getElementById("perfilPassword").value;

  if (!password) {
    mostrarToast("Ingresa una contraseña.", true);
    return;
  }

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "cambiarPassword",
        email: user.email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("perfilPassword").value = "";
      mostrarToast("Contraseña actualizada correctamente.");
    } else {
      mostrarToast("No se pudo actualizar la contraseña.", true);
    }

  } catch (err) {
    mostrarToast("Error de conexión.", true);
  }

}

function mostrarToast(mensaje, error = false) {

  const toast = document.createElement("div");
  toast.className = "cupissa-toast";
  if (error) toast.classList.add("error");

  toast.innerText = mensaje;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);

}

function dibujarGraficoPedidos(activos, entregados, cancelados) {

  const canvas = document.getElementById("graficoPedidos");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const total = activos + entregados + cancelados;
  if (total === 0) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 90;

  let startAngle = -0.5 * Math.PI;

  const segmentos = [
    { valor: activos, color: "#db137a" },   // rosa CUPISSA
    { valor: entregados, color: "#2ecc71" }, // verde
    { valor: cancelados, color: "#c0392b" }  // rojo
  ];

  segmentos.forEach(seg => {

    const sliceAngle = (seg.valor / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();

    startAngle += sliceAngle;

  });

}

/* ========================= */
/* OBTENER PUNTOS USUARIO */
/* ========================= */

async function obtenerPuntosUsuario() {

  const userData = localStorage.getItem("cupissa_user");
  if (!userData) return 0;

  const user = JSON.parse(userData);

  try {

    const response = await fetch(CONFIG.backendURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "obtenerPuntos",
        email: user.email
      })
    });

    const data = await response.json();

    if (data.success) {
      return Number(data.puntos) || 0;
    }

    return 0;

  } catch (err) {
    return 0;
  }

}

function copiarCupon(codigo) {

  navigator.clipboard.writeText(codigo);

  mostrarToast("Cupón copiado: " + codigo);

}

function abrirModalPromo(imagen, titulo) {

  const html = `
    <div class="modal-overlay" onclick="cerrarModalPromo()">
      <div class="modal-promo" onclick="event.stopPropagation()">
        <div class="modal-header">
          ${titulo}
          <span class="modal-close" onclick="cerrarModalPromo()">✕</span>
        </div>
        <img src="${imagen}">
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

function cerrarModalPromo() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}