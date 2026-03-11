/* js/wishlist.js */
/* ===================================================== */
/* CUPISSA — PANEL DE FAVORITOS (WISHLIST) */
/* ===================================================== */

const Wishlist = {
    items: [],

    init: () => {
        Wishlist.load();
        Wishlist.renderUI();
    },

    load: () => {
        const saved = localStorage.getItem('cupissa_wishlist');
        if (saved) {
            Wishlist.items = JSON.parse(saved);
        }
    },

    save: () => {
        localStorage.setItem('cupissa_wishlist', JSON.stringify(Wishlist.items));
        Wishlist.renderItems();
    },

    toggle: (ref) => {
        if (!Catalogo || !Catalogo.productos) return;
        
        const existIndex = Wishlist.items.findIndex(item => item.ref === ref);
        const btnIcon = document.getElementById(`wishlist-icon-${ref}`);
        
        if (existIndex > -1) {
            Wishlist.items.splice(existIndex, 1);
            if (btnIcon) btnIcon.style.color = 'var(--color-gray-dark)';
        } else {
            const producto = Catalogo.productos.find(p => p.ref === ref);
            if (producto) {
                Wishlist.items.push(producto);
                if (btnIcon) btnIcon.style.color = 'var(--color-pink)';
            }
        }
        Wishlist.save();
    },

    remove: (ref) => {
        Wishlist.items = Wishlist.items.filter(item => item.ref !== ref);
        const btnIcon = document.getElementById(`wishlist-icon-${ref}`);
        if (btnIcon) btnIcon.style.color = 'var(--color-gray-dark)';
        Wishlist.save();
    },

    clear: () => {
        if (confirm("¿Estás seguro de que quieres vaciar tus favoritos?")) {
            Wishlist.items = [];
            document.querySelectorAll('[id^="wishlist-icon-"]').forEach(icon => {
                icon.style.color = 'var(--color-gray-dark)';
            });
            Wishlist.save();
        }
    },

    addAllToCart: () => {
        if (typeof Carrito === 'undefined') return;
        
        let agregados = 0;
        Wishlist.items.forEach(item => {
            Carrito.add(item, {}, 0, 1);
            agregados++;
        });

        if (agregados > 0) {
            Wishlist.items = [];
            document.querySelectorAll('[id^="wishlist-icon-"]').forEach(icon => {
                icon.style.color = 'var(--color-gray-dark)';
            });
            Wishlist.save();
            Wishlist.closeDrawer();
            if(typeof Utils !== 'undefined' && Utils.toast) {
                Utils.toast(`${agregados} productos agregados al carrito`, 'success');
            }
        }
    },

    renderUI: () => {
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'wishlistOverlay';
        overlay.onclick = Wishlist.closeDrawer;

        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'wishlistDrawer';

        drawer.innerHTML = `
            <div class="cart-header">
                <h2>Mis Favoritos</h2>
                <button class="close-cart" onclick="Wishlist.closeDrawer()">&times;</button>
            </div>
            <div class="cart-body" id="wishlistItemsContainer"></div>
            <div class="cart-footer" style="padding: 20px; border-top: 1px solid var(--color-gray-light); background-color: var(--color-white); display: flex; flex-direction: column; gap: 15px;">
                <button onclick="Wishlist.addAllToCart()" style="background: var(--color-black); color: white; border: none; padding: 15px; border-radius: var(--radius-xl); cursor: pointer; font-weight: bold; width: 100%; transition: transform 0.2s;">Agregar todo al carrito</button>
                <button onclick="Wishlist.clear()" style="background: none; border: none; color: var(--color-gray-dark); cursor: pointer; text-decoration: underline; font-size: 0.9rem;">Vaciar favoritos</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
        Wishlist.renderItems();
    },

    renderItems: () => {
        const container = document.getElementById('wishlistItemsContainer');
        if (!container) return;
        container.innerHTML = '';

        if (Wishlist.items.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">No tienes productos favoritos aún.</p>';
            return;
        }

        Wishlist.items.forEach(item => {
            const precioBase = Utils.safeNumber(item['*precio_base']);
            
            let imgUrlFinal = '/assets/logo.png';
            if (item.imagenurl && String(item.imagenurl).trim() !== '') {
                imgUrlFinal = String(item.imagenurl).split('|')[0].trim();
                if (imgUrlFinal.includes('drive.google.com')) {
                    const match = imgUrlFinal.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
                }
            }

            const onClickAction = (typeof ModalProducto !== 'undefined' && typeof Catalogo !== 'undefined' && Catalogo.productos && Catalogo.productos.length > 0) 
                ? `Wishlist.closeDrawer(); ModalProducto.open('${item.ref}');` 
                : `window.location.href='/catalogo/?ref=${item.ref}';`;

            const onAddToCartAction = `Wishlist.closeDrawer(); Carrito.add(${JSON.stringify(item).replace(/"/g, '&quot;')}, {}, 0, 1);`;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${imgUrlFinal}" alt="${item.nombre}" style="cursor:pointer;" onclick="${onClickAction}">
                <div class="cart-item-info">
                    <div class="cart-item-title" style="cursor:pointer;" onclick="${onClickAction}">${item.nombre}</div>
                    <div class="cart-item-price">${Utils.formatCurrency(precioBase)}</div>
                    <div class="cart-item-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <button onclick="${onAddToCartAction}" style="background: var(--color-black); color: white; border: none; padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; font-weight: bold;"><i class="fas fa-shopping-cart"></i> Agregar</button>
                        <button class="remove-item" onclick="Wishlist.remove('${item.ref}')">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    openDrawer: () => {
        document.getElementById('wishlistDrawer').classList.add('open');
        document.getElementById('wishlistOverlay').classList.add('active');
    },

    closeDrawer: () => {
        document.getElementById('wishlistDrawer').classList.remove('open');
        document.getElementById('wishlistOverlay').classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', Wishlist.init);