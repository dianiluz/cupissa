/* ===================================================== */
/* CUPISSA — HEADER + FOOTER RENDER */
/* ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderMundos();
  renderFooter();
});

/* ========================= */
/* HEADER */
/* ========================= */

function renderHeader() {

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  headerContainer.innerHTML = `
    <header class="header">

      <div class="header-mobile-left">
        <div class="hamburger" id="hamburgerBtn">☰</div>
      </div>

      <div class="header-logo">
        <a href="/">
          <img src="/assets/logo.png" class="logo-dark" alt="CUPISSA">
          <img src="/assets/logoclaro.png" class="logo-light" alt="CUPISSA">
        </a>
      </div>

      <div class="header-search">
        <div class="desktop-search-wrapper">
          <input type="text" id="globalSearch" placeholder="¿Qué estás buscando?">
          <span class="clear-search" id="clearDesktopSearch">✕</span>
        </div>
      </div>

      <div class="header-nav">
        <a href="/" class="nav-link">INICIO</a>
        <a href="/catalogo" class="nav-link">CATÁLOGO</a>
        <a href="/rastreo" class="nav-link">SEGUIMIENTO DE PEDIDO</a>
      </div>

      <div class="header-icons">

        <div class="header-icon" id="cartIcon">
          🛒
          <span class="count" id="cartCount">0</span>
        </div>

        <div class="header-icon" id="userIcon"></div>

        <div class="header-icon" id="themeToggle">
          🌙
        </div>

      </div>

    </header>

    <!-- PANEL CARRITO -->
    <div class="carrito-panel" id="carritoPanel">
      <div class="carrito-header">
        <span>Tu carrito</span>
        <span id="cerrarCarrito" style="cursor:pointer;">✕</span>
      </div>

      <div class="carrito-body" id="carritoBody">
        <p>Tu lista está vacía.</p>
      </div>
    </div>

    <!-- LOGIN MODAL -->
    <div class="auth-overlay" id="authOverlay">
      <div class="auth-modal">
        <div class="auth-close" id="cerrarAuth">✕</div>
        <h2>Iniciar sesión</h2>

        <div class="auth-roles">
          <label>
            <input type="radio" name="rol" value="CLIENTE" checked>
            Cliente
          </label>
          <label>
            <input type="radio" name="rol" value="VENDEDOR">
            Vendedor
          </label>
        </div>

        <input type="email" id="authEmail" placeholder="Correo electrónico">
        <input type="password" id="authPassword" placeholder="Contraseña">

        <button id="btnLogin" class="btn-primary" style="width:100%; margin-top:15px;">
          Ingresar
        </button>

        <p style="margin-top:15px; font-size:13px;">
          ¿Quieres registrarte?
          <a href="/registro/" style="color:var(--color-pink);">Crear cuenta</a>
        </p>

        <p id="authError" style="color:red; font-size:13px; display:none;"></p>
      </div>
    </div>

    <div class="mobile-menu" id="mobileMenu">
      <a href="/">INICIO</a>
      <a href="/catalogo">CATÁLOGO</a>
      <a href="/rastreo">SEGUIMIENTO DE PEDIDO</a>
    </div>
  `;

  configurarUserIcon();
configurarHamburger();
configurarTema();

if (typeof inicializarPanelCarrito === "function") {
  inicializarPanelCarrito();
  actualizarContadorCarrito();
}
}

/* ========================= */
/* CARRITO */
/* ========================= */

function configurarCarrito() {

  const icon = document.getElementById("cartIcon");
  const panel = document.getElementById("carritoPanel");
  const cerrar = document.getElementById("cerrarCarrito");

  if (!icon || !panel) return;

  icon.addEventListener("click", () => {
    panel.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      panel.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }
}

/* ========================= */
/* TEMA */
/* ========================= */

function configurarTema() {

  const themeBtn = document.getElementById("themeToggle");
  if (!themeBtn) return;

  if (typeof alternarTema === "function") {
    alternarTema();
}
}

/* ========================= */
/* USER ICON */
/* ========================= */

function configurarUserIcon() {

  const userIcon = document.getElementById("userIcon");
  const userData = localStorage.getItem("cupissa_user");

  if (!userIcon) return;

  if (userData) {

    const user = JSON.parse(userData);

    userIcon.innerHTML = `
      <span class="user-name">${user.nombre.split(" ")[0]}</span>
    `;

    userIcon.onclick = () => {
      window.location.href = "/panel/";
    };

  } else {

    userIcon.innerHTML = "👤";

    userIcon.onclick = () => {
      const overlay = document.getElementById("authOverlay");
      if (overlay) overlay.classList.add("active");
    };
  }
}

/* ========================= */
/* HAMBURGER */
/* ========================= */

function configurarHamburger() {

  const hamburger = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "auto";
  });
}

