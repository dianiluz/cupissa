/* ===================================================== */
/* CUPISSA — CARRITO GLOBAL Y RECOMPENSAS */
/* ===================================================== */

const Carrito = {
    items: [],

    init: () => {
        Carrito.load();
        Carrito.renderUI();
        Carrito.updateBadge();
        Carrito.bindEvents();
    },

    load: () => {
        const saved = localStorage.getItem('cupissa_cart');
        if (saved) {
            Carrito.items = JSON.parse(saved);
        }
    },

    save: () => {
        localStorage.setItem('cupissa_cart', JSON.stringify(Carrito.items));
        Carrito.updateBadge();
        Carrito.renderItems();
    },

    add: (producto, variacionesSeleccionadas, incrementoTotal, cantidad = 1) => {
        const precioFinal = Utils.safeNumber(producto['*precio_base']) + Utils.safeNumber(incrementoTotal);
        
        const sortedVars = {};
        Object.keys(variacionesSeleccionadas).sort().forEach(k => {
            sortedVars[k] = variacionesSeleccionadas[k];
        });
        
        const varsString = JSON.stringify(sortedVars);
        const uniqueId = `${producto.ref}_${btoa(varsString)}`;

        const exist = Carrito.items.find(item => item.uniqueId === uniqueId);

        if (exist) {
            exist.cantidad += Number(cantidad);
        } else {
            Carrito.items.push({
                uniqueId: uniqueId,
                ref: producto.ref,
                nombre: producto.nombre,
                imagenurl: producto.imagenurl,
                precio_unitario: precioFinal,
                variaciones: sortedVars,
                cantidad: Number(cantidad)
            });
        }
        Carrito.save();
        Carrito.openDrawer();
    },

    remove: (uniqueId) => {
        Carrito.items = Carrito.items.filter(item => item.uniqueId !== uniqueId);
        Carrito.save();
    },

    updateQty: (uniqueId, change) => {
        const item = Carrito.items.find(i => i.uniqueId === uniqueId);
        if (item) {
            item.cantidad += change;
            if (item.cantidad <= 0) {
                Carrito.remove(uniqueId);
            } else {
                Carrito.save();
            }
        }
    },

    clear: () => {
        if(confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
            Carrito.items = [];
            Carrito.save();
        }
    },

    getTotal: () => {
        return Carrito.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    },

    updateBadge: () => {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const count = Carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    renderUI: () => {
        if (!document.querySelector('link[href*="carrito.css"]')) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = '/css/carrito.css';
            document.head.appendChild(css);
        }

        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'cartOverlay';

        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'cartDrawer';

        drawer.innerHTML = `
            <div class="cart-header">
                <h2>Tu Carrito</h2>
                <button class="close-cart" id="closeCartBtn">&times;</button>
            </div>
            <div class="cart-body" id="cartItemsContainer"></div>
            <div class="cart-footer">
                <div class="cart-cupicoins" style="background:#fff0f6; color:var(--color-pink); padding:10px; border-radius:5px; margin-bottom:15px; text-align:center; font-weight:bold; font-size:0.9rem;">
                    🪙 Con esta compra ganarás: <span id="cartCupiCoinsUI">0</span> CupiCoins
                </div>
                <div class="cart-total">
                    <span>Subtotal general</span>
                    <span id="cartTotalUI">$0</span>
                </div>
                <div class="cart-anticipo">
                    <span>Anticipo estimado (20%)</span>
                    <span id="cartAnticipoUI">$0</span>
                </div>
                <div class="cart-warning">
                    ⚠️ Algunos medios de pago pueden generar un incremento en el valor total debido a costos de transacción. El valor final se mostrará antes de confirmar el pago.
                </div>
                <div class="cart-footer-actions">
                    <button class="btn-clear-cart" onclick="Carrito.clear()">Vaciar lista</button>
                    <a href="/pago/" class="btn-checkout">Ver opciones de pago</a>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
        Carrito.renderItems();
    },

    renderItems: () => {
        const container = document.getElementById('cartItemsContainer');
        const totalUI = document.getElementById('cartTotalUI');
        const anticipoUI = document.getElementById('cartAnticipoUI');
        const cupiCoinsUI = document.getElementById('cartCupiCoinsUI');
        
        if (!container || !totalUI || !anticipoUI || !cupiCoinsUI) return;

        container.innerHTML = '';

        if (Carrito.items.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">Tu carrito está vacío.</p>';
            totalUI.innerText = '$0';
            anticipoUI.innerText = '$0';
            cupiCoinsUI.innerText = '0';
            return;
        }

        Carrito.items.forEach(item => {
            let varsHtml = '';
            for (const [key, val] of Object.entries(item.variaciones)) {
                varsHtml += `${key}: ${val} | `;
            }
            varsHtml = varsHtml.slice(0, -3);

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.imagenurl}" alt="${item.nombre}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-vars">${varsHtml}</div>
                    <div class="cart-item-price">${Utils.formatCurrency(item.precio_unitario)}</div>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="Carrito.updateQty('${item.uniqueId}', -1)">-</button>
                            <span>${item.cantidad}</span>
                            <button class="qty-btn" onclick="Carrito.updateQty('${item.uniqueId}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="Carrito.remove('${item.uniqueId}')">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        const totalGeneral = Carrito.getTotal();
        const anticipo = totalGeneral * 0.20;
        const cupiCoinsEarned = Math.floor(totalGeneral / 1000) * 5;

        totalUI.innerText = Utils.formatCurrency(totalGeneral);
        anticipoUI.innerText = Utils.formatCurrency(anticipo);
        cupiCoinsUI.innerText = cupiCoinsEarned;
    },

    openDrawer: () => {
        document.getElementById('cartDrawer').classList.add('open');
        document.getElementById('cartOverlay').classList.add('active');
    },

    closeDrawer: () => {
        document.getElementById('cartDrawer').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
    },

    bindEvents: () => {
        document.addEventListener('click', (e) => {
            const openBtn = e.target.closest('#openCartBtn');
            if (openBtn) Carrito.openDrawer();

            if (e.target.id === 'closeCartBtn' || e.target.id === 'cartOverlay') {
                Carrito.closeDrawer();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Carrito.init);