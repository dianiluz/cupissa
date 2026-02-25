/* ===================================================== */
/* UNIVERSO CUPISSA — HEADER + FOOTER RENDER */
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

      <div class="header-left">
        <div class="menu-toggle" id="menuToggle">☰</div>

        <div class="header-logo">
          <a href="/">
            <img src="/assets/logo.png" alt="Universo CUPISSA">
          </a>
        </div>
      </div>

      <div class="header-search">
        <input type="text" id="globalSearch" placeholder="Buscar...">
      </div>

      <div class="header-explora">
        <a href="/">INICIO</a>
      </div>
      <div class="header-explora">
        <a href="/catalogo/">CATÁLOGO</a>
      </div>
      <div class="header-explora">
        <a href="/rastreo/">SEGUIMIENTO DE PEDIDO</a>
      </div>

      <div class="header-icons">
        <div class="header-icon" id="cartIcon">
          🛒
          <span class="count" id="cartCount">0</span>
        </div>

        <div class="header-icon" id="themeToggle">
          🌙
        </div>
      </div>

    </header>

    <div class="mobile-menu" id="mobileMenu">
      <a href="/">Inicio</a>
      <a href="/catalogo/">Catálogo</a>
      <a href="/rastreo/">Seguimiento</a>
      <button class="menu-filtros" id="menuFiltrosBtn">Filtros</button>
    </div>
  `;

  /* ===== MENU TOGGLE ===== */

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }

  /* ===== BOTÓN FILTROS EN MENÚ ===== */

  const menuFiltrosBtn = document.getElementById("menuFiltrosBtn");

  if (menuFiltrosBtn) {
    menuFiltrosBtn.addEventListener("click", () => {

      const panel = document.getElementById("filtrosContainer");
      if (panel) {
        panel.classList.add("active");
        document.body.style.overflow = "hidden";
      }

      mobileMenu.classList.remove("active");
    });
  }

  /* ===== TEMA ===== */

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", alternarTema);
  }
}

/* ========================= */
/* MUNDOS */
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
          <p>${CONFIG.city}</p>
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
            Para envíos nacionales se requiere pago anticipado del flete.
            Algunos productos y servicios requieren anticipos para agendarse.
          </p>
        </div>

      </div>

      <div class="footer-bottom">
        © ${year} Universo CUPISSA — Desarrollado por Diani Gonzalez
      </div>

    </footer>
  `;
}