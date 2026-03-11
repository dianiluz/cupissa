/* js/modal.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DEL MODAL DE PRODUCTO Y VARIACIONES */
/* ===================================================== */

const ModalProducto = {
    productoActual: null,
    cantidadActual: 1,

    init: () => {
        const container = document.getElementById('modalContainer');
        if (container) {
            container.innerHTML = `
                <div class="modal-overlay" id="productModal">
                    <div class="modal-content">
                        <button class="btn-close-modal" onclick="ModalProducto.close()">&times;</button>
                        <div class="modal-image-container">
                            <img id="modalImg" src="" alt="Producto">
                        </div>
                        <div class="modal-details">
                            <h2 class="modal-title" id="modalTitle"></h2>
                            <p class="modal-ref" id="modalRef"></p>
                            
                            <div class="modal-price-container" style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
                                <span class="modal-price" id="modalPrice" style="color:var(--color-success); font-weight:bold; font-size: 1.5rem;"></span>
                                <span id="modalAnticipo" style="color:var(--color-gray-dark); font-size: 0.9rem; font-weight: 500;"></span>
                            </div>
                            
                            <div class="modal-variations" id="modalVariationsArea"></div>
                            
                            <div class="modal-actions">
                                <div class="modal-qty">
                                    <button onclick="ModalProducto.updateQty(-1)">-</button>
                                    <input type="number" id="modalQty" value="1" readonly>
                                    <button onclick="ModalProducto.updateQty(1)">+</button>
                                </div>
                                <button class="btn-add-cart" onclick="ModalProducto.addToCart()">
                                    <i class="fas fa-shopping-bag"></i> Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    open: (ref) => {
        const producto = Catalogo.productos.find(p => p.ref === ref);
        if (!producto) return;

        ModalProducto.productoActual = producto;
        ModalProducto.cantidadActual = 1;

        document.getElementById('modalImg').src = producto.imagenurl;
        document.getElementById('modalTitle').innerText = producto.nombre;
        document.getElementById('modalRef').innerText = `Ref: ${producto.ref}`;
        document.getElementById('modalQty').value = 1;

        const areaVar = document.getElementById('modalVariationsArea');
        areaVar.innerHTML = '';
        
        let hasVariations = false;

        Object.keys(producto).forEach(key => {
            let val = String(producto[key]);
            if (val.includes('#') || val.includes('|') || key.toLowerCase() === '*tallas') {
                const cleanVal = val.replace('#', '');
                if(!cleanVal) return;
                
                const opciones = cleanVal.split('|').map(o => o.trim());
                const nombreLimpio = key.replace('*', '').replace('#', '');
                hasVariations = true;
                
                if (nombreLimpio.toLowerCase() === 'personalizable') {
                    areaVar.innerHTML += `
                        <div class="variation-group">
                            <label>${nombreLimpio}</label>
                            <input type="text" class="var-select" data-columna="${nombreLimpio}" placeholder="Escribe el nombre o texto...">
                        </div>
                    `;
                } else {
                    areaVar.innerHTML += `
                        <div class="variation-group">
                            <label>${nombreLimpio}</label>
                            <select class="var-select" data-columna="${nombreLimpio}" onchange="ModalProducto.calculatePrice()">
                                ${opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        </div>
                    `;
                }
            }
        });

        if (!hasVariations) {
            areaVar.innerHTML = '<p style="color:var(--color-gray-dark); font-size:0.9rem;">Este producto no requiere configuración adicional.</p>';
        }

        ModalProducto.calculatePrice();

        document.getElementById('productModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close: () => {
        document.getElementById('productModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    },

    updateQty: (change) => {
        let current = parseInt(document.getElementById('modalQty').value);
        let newQty = current + change;
        if (newQty < 1) newQty = 1;
        document.getElementById('modalQty').value = newQty;
        ModalProducto.cantidadActual = newQty;
    },

    calculatePrice: () => {
        if (!ModalProducto.productoActual) return;

        let precioBase = Utils.safeNumber(ModalProducto.productoActual['*precio_base']);
        let incrementoTotal = 0;

        const seleccionActual = {};
        Object.keys(ModalProducto.productoActual).forEach(key => {
            const claveLimpia = key.replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(ModalProducto.productoActual[key]);
        });

        const selects = document.querySelectorAll('.var-select');
        selects.forEach(sel => {
            const claveLimpia = sel.getAttribute('data-columna');
            if (sel.tagName.toLowerCase() === 'select') {
                seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(sel.value);
            }
        });

        let reglasEspecificas = Catalogo.variacionesDB.filter(v => {
            if (!v.producto) return false;
            return v.producto.split('|').map(r => Utils.normalizeStr(r)).includes(Utils.normalizeStr(ModalProducto.productoActual.ref));
        });

        let reglasAUsar = reglasEspecificas.length > 0 ? reglasEspecificas : Catalogo.variacionesDB.filter(v => !v.producto || v.producto.trim() === "");

        reglasAUsar.forEach(regla => {
            if (!regla.columna || !regla.valor) return;
            
            const columnasRegla = regla.columna.split('|');
            const valoresRegla = regla.valor.split('|');

            if (columnasRegla.length === valoresRegla.length) {
                let cumpleTodas = true;
                
                for (let i = 0; i < columnasRegla.length; i++) {
                    const colReq = Utils.normalizeStr(columnasRegla[i].replace('*','').replace('#',''));
                    const valReq = Utils.normalizeStr(valoresRegla[i]);
                    
                    if (seleccionActual[colReq] !== valReq) {
                        cumpleTodas = false;
                        break;
                    }
                }

                if (cumpleTodas) {
                    incrementoTotal += Utils.safeNumber(regla.incremento);
                }
            }
        });

        const precioFinal = precioBase + incrementoTotal;
        document.getElementById('modalPrice').innerText = `Total: ${Utils.formatCurrency(precioFinal)}`;
        
        const anticipoElem = document.getElementById('modalAnticipo');
        if (anticipoElem) {
            anticipoElem.innerText = `Anticipo: ${Utils.formatCurrency(precioFinal * 0.20)}`;
        }

        ModalProducto.productoActual._incrementoActual = incrementoTotal;
    },

    addToCart: () => {
        const selects = document.querySelectorAll('.var-select');
        const variacionesSeleccionadas = {};
        
        selects.forEach(sel => {
            const nombreLimpio = sel.getAttribute('data-columna');
            variacionesSeleccionadas[nombreLimpio] = sel.value;
        });

        Carrito.add(
            ModalProducto.productoActual, 
            variacionesSeleccionadas, 
            ModalProducto.productoActual._incrementoActual || 0,
            ModalProducto.cantidadActual
        );

        ModalProducto.close();
    }
};

document.addEventListener('DOMContentLoaded', ModalProducto.init);