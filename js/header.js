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

      <div class="header-logo">
        <a href="/">
          <img src="/assets/logo.png" alt="Universo CUPISSA">
        </a>
      </div>

      <div class="header-search">
        <input type="text" id="globalSearch" placeholder="Buscar en Universo CUPISSA...">
      </div>

       <div class="header-explora">
        <a href="/">INICIO</a>
        </div>   
        <div class="header-explora">
        <a href="/catalogo">CATÁLOGO</a>
        </div>   
        <div class="header-explora">
        <a href="/rastreo">SEGUIMIENTO DE PEDIDO</a>
        </div>   

      <div class="header-icons">
        <div class="header-icon" id="cartIcon">
          🛒
          <span class="count" id="cartCount">0</span>
        </div>

        <div class="header-icon" id="userIcon">
          👤
        </div>

        <div class="header-icon" id="languageToggle">
        🌐
        </div>

        <div class="header-icon" id="themeToggle">
        🌙
        </div>
      </div>

    </header>
  `;

  const themeBtn = document.getElementById("themeToggle");
  themeBtn.addEventListener("click", alternarTema);
}

/* ========================= */
/* BARRA DE MUNDOS */
/* ========================= */

function renderMundos() {

  const mundosContainer = document.getElementById("mundos");
  if (!mundosContainer) return;

  mundosContainer.innerHTML = `
    <div class="mundos-bar" id="mundosBar">
      <!-- Mundos dinámicos se cargarán aquí -->
    </div>
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
          </p>
        </div>

      </div>

      <div class="footer-bottom">
        © ${year} Universo CUPISSA — Desarrollado por Diani Gonzalez
      </div>

    </footer>
  `;
}