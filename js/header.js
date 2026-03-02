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

      <!-- MOBILE LEFT -->
      <div class="header-mobile-left">
        <div class="hamburger" id="hamburgerBtn">☰</div>
      </div>

      <!-- LOGO -->
      <div class="header-logo">
        <a href="/">
          <img src="/assets/logo.png" class="logo-dark" alt="CUPISSA">
          <img src="/assets/logoclaro.png" class="logo-light" alt="CUPISSA">
        </a>
      </div>

      <!-- DESKTOP SEARCH -->
      <div class="header-search">
        <div class="desktop-search-wrapper">
          <input type="text" id="globalSearch" placeholder="¿Qué estás buscando?">
          <span class="clear-search" id="clearDesktopSearch">✕</span>
        </div>
      </div>

      <!-- DESKTOP NAV -->
      <div class="header-nav">
        <a href="/" class="nav-link">INICIO</a>
        <a href="/catalogo" class="nav-link">CATÁLOGO</a>
        <a href="/rastreo" class="nav-link">SEGUIMIENTO DE PEDIDO</a>
      </div>

      <!-- RIGHT ICONS -->
      <div class="header-icons">

        <!-- CART -->
        <div class="header-icon" id="cartIcon">
          🛒
          <span class="count" id="cartCount">0</span>
        </div>

        <!-- USER ICON -->
        <div class="header-icon" id="userIcon">
          👤
        </div>

        <!-- THEME -->
        <div class="header-icon" id="themeToggle">
          🌙
        </div>

      </div>

    </header>

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

    <!-- MOBILE SEARCH BAR -->
    <div class="mobile-search-bar">
      <div class="mobile-search-wrapper">
        <input type="text" id="mobileSearchInput" placeholder="¿Qué estás buscando hoy?">
        <span class="clear-search" id="clearMobileSearch">✕</span>
      </div>
    </div>

    <!-- PANEL CARRITO -->
    <div class="carrito-panel" id="carritoPanel">
      <div class="carrito-header">
        <span>Tu carrito</span>
        <span id="cerrarCarrito" style="cursor:pointer;">✕</span>
      </div>

      <div class="carrito-body" id="carritoBody">
        <p>Tu lista está vacía.</p>
      </div>

      <div class="carrito-panel" id="carritoPanel">
  <div class="carrito-header">
    <span>Tu carrito</span>
    <span id="cerrarCarrito" style="cursor:pointer;">✕</span>
  </div>

  <div class="carrito-body" id="carritoBody">
    <p>Tu lista está vacía.</p>
  </div>
</div>

    <!-- MOBILE MENU -->
    <div class="mobile-menu" id="mobileMenu">
      <a href="/">INICIO</a>
      <a href="/catalogo">CATÁLOGO</a>
      <a href="/rastreo">SEGUIMIENTO DE PEDIDO</a>
    </div>
  `;

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", alternarTema);

  const hamburger = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "auto";
  });
}

/* ========================= */
/* BARRA DE MUNDOS */
/* ========================= */

function renderMundos() {

  const mundosContainer = document.getElementById("mundos");
  if (!mundosContainer) return;

  mundosContainer.innerHTML = `
    <div class="mundos-bar" id="mundosBar"></div>
  `;
}

/* ========================= */
/* FOOTER */
/* ========================= */

function renderFooter() {

  const footerContainer = document.getElementById("footer");
  if (!footerContainer) return;

  const year = new Date().getFullYear();

  footerContainer.innerHTML = `
    <footer class="footer">

      <div class="footer-grid">

        <div>
          <h4>Contacto</h4>
          <p>Barranquilla, Colombia</p>
          <p>+57 314 767 1380</p>
          <p>${CONFIG.contactEmail}</p>

          <div style="margin-top:10px; display:flex; gap:10px;">
            <a href="https://www.instagram.com/cupissa.co/" target="_blank">Instagram</a>
            <a href="https://www.tiktok.com/@cupissa.co" target="_blank">TikTok</a>
          </div>
        </div>

        <div>
          <h4>Explora</h4>
          <a href="/">Inicio</a>
          <a href="/catalogo/">Catálogo</a>
          <a href="/rastreo/">Rastrear pedido</a>
        </div>

        <div>
          <h4>Legales</h4>
          <a href="/legales/#tratamiento">Tratamiento de datos</a>
          <a href="/legales/#envios">Políticas de envío</a>
          <a href="/legales/#terminos">Términos y condiciones</a>
        </div>

        <div>
          <h4>Métodos de pago</h4>
          <div class="footer-payment-grid">
            <span>Efectivo</span>
            <span>Wompi</span>
            <span>Bancolombia</span>
            <span>Nequi</span>
            <span>Addi</span>
            <span>Davivienda</span>
            <span>Daviplata</span>
            <span>Mercado Pago</span>
            <span>BRE-B</span>
            <span>Grupo Aval</span>
          </div>

          <p style="margin-top:10px; font-size:12px;">
            Pago contraentrega disponible para Barranquilla y municipios cercanos.
            Algunos productos y servicios requieren anticipos para ser agendados.
            Para envíos nacionales se requiere pago anticipado del flete.
          </p>
        </div>

      </div>

      <div class="footer-bottom">
        © ${year} CUPISSA — Desarrollado por Diani Gonzalez
      </div>

    </footer>
  `;
}