/* ===================================================== */
/* CUPISSA — LÓGICA DEL MODAL DE PRODUCTO Y VARIACIONES */
/* ===================================================== */

const ModalProducto = {
    variacionesDB: [],
    productoActual: null,
    cantidadActual: 1,

    init: async () => {
        try {
            ModalProducto.variacionesDB = await Utils.fetchSheetData(CONFIG.gids.VARIACIONES);
        } catch (error) {
            console.error("Error cargando variaciones", error);
        }

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
                            <div class="modal-price-container">
                                <span class="modal-price" id="modalPrice"></span>
                            </div>
                            <div class="modal-variations" id="modalVariationsArea"></div>
                            <div class="modal-actions">
                                <div class="modal-qty">
                                    <button onclick="ModalProducto.changeQty(-1)">-</button>
                                    <input type="text" id="modalQtyInput" value="1" readonly>
                                    <button onclick="ModalProducto.changeQty(1)">+</button>
                                </div>
                                <button class="btn-add-cart" onclick="ModalProducto.addToCart()">Agregar al Carrito</button>
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
        document.getElementById('modalRef').innerText = `REF: ${producto.ref}`;
        document.getElementById('modalQtyInput').value = 1;

        ModalProducto.renderSelects();
        ModalProducto.calculatePrice();

        document.getElementById('productModal').classList.add('active');
    },

    close: () => {
        document.getElementById('productModal').classList.remove('active');
        ModalProducto.productoActual = null;
    },

    changeQty: (change) => {
        let newQty = ModalProducto.cantidadActual + change;
        if (newQty < 1) newQty = 1;
        ModalProducto.cantidadActual = newQty;
        document.getElementById('modalQtyInput').value = ModalProducto.cantidadActual;
    },

    renderSelects: () => {
        const area = document.getElementById('modalVariationsArea');
        area.innerHTML = '';
        const producto = ModalProducto.productoActual;

        Object.keys(producto).forEach(key => {
            const val = producto[key];
            
            // Usamos la MISMA regla infalible que en catalogo.js: 
            // Si el valor tiene '#', o tiene '|', o la columna es de tallas.
            if (typeof val === 'string' && (val.includes('#') || val.includes('|') || key.toLowerCase().includes('tallas'))) {
                const cleanVal = val.replace('#', '');
                if(!cleanVal) return;
                
                const opciones = cleanVal.split('|').map(o => o.trim());
                const nombreLimpio = key.replace('*', '').replace('#', '');
                
                // Ignoramos el campo 'personalizable'
                if (nombreLimpio.toLowerCase() !== 'personalizable') {
                    const group = document.createElement('div');
                    group.className = 'variation-group';
                    group.innerHTML = `
                        <label>${nombreLimpio.toUpperCase()}</label>
                        <select class="var-select" data-columna="${key}" onchange="ModalProducto.calculatePrice()">
                            ${opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    `;
                    area.appendChild(group);
                }
            }
        });
    },

    calculatePrice: () => {
        if (!ModalProducto.productoActual) return;
        
        let precioBase = Utils.safeNumber(ModalProducto.productoActual['*precio_base']);
        let incrementoTotal = 0;

        const seleccionActual = {};
        
        // 1. CARGAR ATRIBUTOS FIJOS DEL PRODUCTO
        Object.keys(ModalProducto.productoActual).forEach(key => {
            const claveLimpia = key.replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(ModalProducto.productoActual[key]);
        });

        // 2. SOBREESCRIBIR CON LOS SELECTS DEL MODAL
        const selects = document.querySelectorAll('.var-select');
        selects.forEach(sel => {
            const claveLimpia = sel.getAttribute('data-columna');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(sel.value);
        });

        // 3. BUSCAR Y APLICAR REGLAS
        let reglasEspecificas = ModalProducto.variacionesDB.filter(v => {
            if (!v.producto) return false;
            const refs = v.producto.split('|').map(r => Utils.normalizeStr(r));
            return refs.includes(Utils.normalizeStr(ModalProducto.productoActual.ref));
        });

        let reglasAUsar = reglasEspecificas.length > 0 
            ? reglasEspecificas 
            : ModalProducto.variacionesDB.filter(v => !v.producto || v.producto.trim() === "");

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
        document.getElementById('modalPrice').innerText = Utils.formatCurrency(precioFinal);
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