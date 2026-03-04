/* ===================================================== */
/* CUPISSA — HEADER DINÁMICO — CORREGIDO */
/* ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header');
    if (!headerContainer) return;

    const user = Utils.getUserSession();
    
    // CAMBIO AQUÍ: Ruta limpia según si existe usuario o no
    const userLink = user ? '/panel/' : '/auth/'; 
    const userText = user ? 'Mi Cuenta' : 'Ingresar';

    // ... (Mantén el resto del código de FontAwesome y CSS igual)
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
                    <img src="/assets/logo.png" alt="${CONFIG.brandName}">
                </a>
                
                <nav class="header-nav">
                    <a href="/">Inicio</a>
                    <a href="/catalogo/">Catálogo</a>
                    <a href="/rastreo/">Rastrear Pedido</a>
                </nav>

                <div class="header-icons">
                    <a href="${userLink}" title="${userText}"><i class="fas fa-user"></i></a>
                    <div class="cart-icon-wrapper" id="openCartBtn">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="cart-badge" id="cartBadge">0</span>
                    </div>
                </div>
            </div>
        </header>
    `;
});