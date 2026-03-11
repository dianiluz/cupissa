/* js/header.js */
/* ===================================================== */
/* CUPISSA — HEADER DINÁMICO CON MODO OSCURO */
/* ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header');
    if (!headerContainer) return;

    const user = Utils.getUserSession ? Utils.getUserSession() : null;
    
    let userLink = '/auth/'; 
    if (user && user.tipo_usuario) {
        const rutas = {
            'ADMIN': '/admin/',
            'CLIENTE': '/cliente/',
            'ASESOR': '/asesor/',
            'FINANZAS': '/finanzas/',
            'PRODUCCION': '/equipo/' 
        };
        userLink = rutas[user.tipo_usuario.toUpperCase()] || '/cliente/';
    }

    const userText = user ? 'Mi Cuenta' : 'Ingresar';
    const isDark = document.body.classList.contains('dark-mode');

    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    const headerCSS = document.createElement('link');
    headerCSS.rel = 'stylesheet';
    headerCSS.href = '/css/header.css';
    document.head.appendChild(headerCSS);

    headerContainer.innerHTML = `
        <header class="main-header">
            <div class="header-container">
                <a href="/" class="header-logo">
                    <img src="/assets/logo.png" alt="${typeof CONFIG !== 'undefined' ? CONFIG.brandName : 'CUPISSA'}">
                </a>
                
                <nav class="header-nav">
                    <a href="/">Inicio</a>
                    <a href="/catalogo/">Catálogo</a>
                    <a href="/rastreo/">Rastrear Pedido</a>
                </nav>

                <div class="header-icons">
                    <button onclick="Utils.toggleDarkMode(); location.reload();" title="Cambiar Tema" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color:var(--color-black);">
                        <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
                    </button>
                    <a href="#" onclick="if(typeof Wishlist !== 'undefined') Wishlist.openDrawer(); return false;" title="Mis Favoritos" style="color:var(--color-black);"><i class="fas fa-heart"></i></a>
                    <a href="${userLink}" title="${userText}" style="color:var(--color-black);"><i class="fas fa-user"></i></a>
                    <div class="cart-icon-wrapper" id="openCartBtn" style="color:var(--color-black); cursor:pointer;">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="cart-badge" id="cartBadge" style="display:none;">0</span>
                    </div>
                </div>
            </div>
        </header>
    `;

    // Se inicializa el buscador explícitamente después de inyectar el DOM del header
    if (typeof Buscador !== 'undefined') {
        Buscador.init();
    }
});