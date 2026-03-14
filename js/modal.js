/* js/modal.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DEL MODAL DE PRODUCTO Y VARIACIONES  */
/* ===================================================== */

const MAPA_COLORES = {
    "blanco": "#FFFFFF", "negro": "#000000", "rojo": "#FF3B30", "azul": "#3B82F6",
    "azul rey": "#2563EB", "azul marino": "#1E3A8A", "celeste": "#93C5FD",
    "rosa": "#F472B6", "rosa pastel": "#FBCFE8", "fucsia": "#DB2777",
    "verde": "#22C55E", "verde menta": "#86EFAC", "amarillo": "#EAB308",
    "morado": "#9333EA", "lila": "#D8B4E2", "naranja": "#F97316",
    "dorado": "#FBBF24", "plateado": "#9CA3AF", "gris": "#6B7280",
    "cafe": "#78350F", "beige": "#FDE68A", "vinotinto": "#831843"
};

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
                        <div class="modal-image-container"><img id="modalImg" src="" alt="Producto"></div>
                        <div class="modal-details">
                            <h2 class="modal-title" id="modalTitle"></h2>
                            <p class="modal-ref" id="modalRef"></p>
                            <div class="modal-price-container" style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
                                <span class="modal-price" id="modalPrice" style="color:var(--color-success); font-weight:bold; font-size: 1.5rem;"></span>
                                <span id="modalAnticipo" style="color:var(--color-gray-dark); font-size: 0.9rem;"></span>
                                <span id="modalCupicoins" style="color:var(--color-pink); font-size: 0.9rem; font-weight: bold; display: none;"></span>
                            </div>
                            <div class="modal-variations" id="modalVariationsArea"></div>
                            <div class="modal-actions">
                                <div class="modal-qty">
                                    <button onclick="ModalProducto.updateQty(-1)">-</button>
                                    <input type="number" id="modalQty" value="1" readonly>
                                    <button onclick="ModalProducto.updateQty(1)">+</button>
                                </div>
                                <button class="btn-add-cart" onclick="ModalProducto.addToCart()">Agregar al Carrito</button>
                            </div>
                        </div>
                    </div>
                </div>`;
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

        // 1. PERSONALIZACIÓN
        const persKey = Object.keys(producto).find(k => k.toLowerCase().includes('personalizable'));
        if (producto[persKey] === 'SI') {
            areaVar.innerHTML += `
                <div class="variation-group" style="margin-bottom:15px; background:#fdf2f8; padding:10px; border-radius:8px; border:1px dashed var(--color-pink);">
                    <label style="cursor:pointer; color:var(--color-pink); font-weight:600;">
                        <input type="checkbox" id="chkPersonalizar" onchange="document.getElementById('cajaPers').style.display=this.checked?'block':'none'"> ¿Deseas personalizar este artículo?
                    </label>
                    <div id="cajaPers" style="display:none; margin-top:10px;">
                        <textarea id="txtPers" placeholder="Nombre, edad..." maxlength="200" rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid #fbcfe8;"></textarea>
                    </div>
                </div>`;
        }

        let htmlColores = '', htmlComplementos = '', htmlOtros = '';

        Object.keys(producto).forEach(key => {
            const val = String(producto[key]);
            const keyLimpia = key.replace(/[*#]/g, '').trim();
            if (keyLimpia.toLowerCase() === 'personalizable') return;

            if (val.includes('|') || key.toLowerCase().includes('talla')) {
                const opciones = val.replace('#','').split('|').map(o => o.trim()).filter(o => o !== '');
                if (keyLimpia.toLowerCase().includes('color')) {
                    let swatches = opciones.map(opt => {
                        const hex = MAPA_COLORES[opt.toLowerCase()] || "#E5E7EB";
                        return `<label style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; margin-right:12px;">
                                    <input type="radio" name="modal_color" class="var-radio var-required" data-columna="${key}" value="${opt}" onchange="ModalProducto.updateVisuals()" style="display:none;">
                                    <div class="swatch-circle" style="width:30px; height:30px; border-radius:50%; background:${hex}; border:2px solid #E5E7EB;"></div>
                                    <span style="font-size:0.65rem;">${opt}</span>
                                </label>`;
                    }).join('');
                    htmlColores = `<div class="variation-group color-group" style="margin-bottom:15px;"><label style="font-weight:600; display:block; margin-bottom:8px;">COLOR *</label><div style="display:flex; flex-wrap:wrap;">${swatches}</div></div>`;
                } else if (keyLimpia.toLowerCase().includes('complemento')) {
                    let checks = opciones.map(opt => `<label style="display:flex; align-items:center; gap:8px; margin-bottom:5px; font-size:0.9rem;">
                        <input type="checkbox" class="var-checkbox" data-columna="${key}" value="${opt}" onchange="ModalProducto.updateVisuals()"> ${opt}
                    </label>`).join('');
                    htmlComplementos = `<div class="variation-group" style="margin-bottom:15px;"><label style="font-weight:600; display:block; margin-bottom:8px;">ADICIONALES</label>${checks}</div>`;
                } else {
                    const isReq = keyLimpia.toLowerCase().includes('talla') || keyLimpia.toLowerCase().includes('modalidad');
                    htmlOtros += `<div class="variation-group" style="margin-bottom:12px;"><label style="font-weight:600; display:block; margin-bottom:5px;">${keyLimpia.toUpperCase()} ${isReq?'*':''}</label>
                        <select class="var-select ${isReq?'var-required':''}" data-columna="${key}" onchange="ModalProducto.updateVisuals()" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">
                            <option value="" disabled selected>Selecciona...</option>${opciones.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select></div>`;
                }
            }
        });

        areaVar.innerHTML += htmlOtros + htmlColores + htmlComplementos;
        ModalProducto.updateVisuals();
        document.getElementById('productModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close: () => { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = 'auto'; },

    updateQty: (change) => {
        let q = parseInt(document.getElementById('modalQty').value);
        document.getElementById('modalQty').value = Math.max(1, q + change);
        ModalProducto.cantidadActual = parseInt(document.getElementById('modalQty').value);
        ModalProducto.calculatePrice();
    },

    updateVisuals: () => {
        ModalProducto.calculatePrice();
        const radios = document.querySelectorAll('.var-radio');
        let colorSel = null;
        radios.forEach(r => {
            const circ = r.nextElementSibling;
            if (r.checked) { circ.style.border = '2px solid var(--color-pink)'; circ.style.transform = 'scale(1.1)'; colorSel = r.value.trim().toLowerCase().replace(/\s+/g, '_'); }
            else { circ.style.border = '2px solid #E5E7EB'; circ.style.transform = 'scale(1)'; }
        });
        if (colorSel) {
            const img = document.getElementById('modalImg');
            const url = `/assets/productos/${ModalProducto.productoActual.ref.trim()}/${colorSel}.webp`;
            if (!img.src.endsWith(url)) { img.style.opacity = '0.5'; setTimeout(() => { img.src = url; img.style.opacity = '1'; }, 100); }
        }
    },

    calculatePrice: () => {
        if (!ModalProducto.productoActual) return;
        let precioBase = Utils.safeNumber(ModalProducto.productoActual['*precio_base']);
        let incrementoTotal = 0;

        // 1. MAPA DE ESTADO (Normalización total)
        const estado = {};
        // Metemos el producto base (limpiando nombres de columnas)
        Object.keys(ModalProducto.productoActual).forEach(k => {
            const n = Utils.normalizeStr(k.replace(/[*#]/g, ''));
            estado[n] = Utils.normalizeStr(String(ModalProducto.productoActual[k]));
        });
        // Metemos los Selects
        document.querySelectorAll('.var-select').forEach(s => {
            if (s.value) estado[Utils.normalizeStr(s.getAttribute('data-columna').replace(/[*#]/g, ''))] = Utils.normalizeStr(s.value);
        });
        // Metemos el Color
        const rColor = document.querySelector('.var-radio:checked');
        if (rColor) estado[Utils.normalizeStr(rColor.getAttribute('data-columna').replace(/[*#]/g, ''))] = Utils.normalizeStr(rColor.value);
        
        // Complementos
        const complementos = Array.from(document.querySelectorAll('.var-checkbox:checked')).map(c => Utils.normalizeStr(c.value));

        // 2. FILTRAR REGLAS POR IDS (Limpieza de brackets y comillas)
        const ids = String(ModalProducto.productoActual.variaciones_ids || "").replace(/[\[\]"']/g, '').split(/[|,]/).map(id => id.trim());
        const reglas = Catalogo.variacionesDB.filter(v => ids.includes(String(v.id)));

        // 3. MOTOR DE VALIDACIÓN
        reglas.forEach(regla => {
            const cols = String(regla.columna).split('|').map(c => Utils.normalizeStr(c.replace(/[*#]/g, '')));
            const vals = String(regla.valor).split('|').map(v => Utils.normalizeStr(v));

            if (cols.length === vals.length) {
                let cumple = true;
                for (let i = 0; i < cols.length; i++) {
                    const c = cols[i];
                    const v = vals[i];
                    if (c.includes('complemento')) {
                        if (!complementos.includes(v)) { cumple = false; break; }
                    } else {
                        // Comparación estricta de valores normalizados
                        if (estado[c] !== v) { cumple = false; break; }
                    }
                }
                if (cumple) incrementoTotal += Utils.safeNumber(regla.incremento);
            }
        });

        const total = (precioBase + incrementoTotal) * ModalProducto.cantidadActual;
        document.getElementById('modalPrice').innerText = `Total: ${Utils.formatCurrency(total)}`;
        if (document.getElementById('modalAnticipo')) document.getElementById('modalAnticipo').innerText = `Anticipo (20%): ${Utils.formatCurrency(total * 0.20)}`;
        if (document.getElementById('modalCupicoins')) {
            const c = Math.floor(total / 1000) * 5;
            document.getElementById('modalCupicoins').innerHTML = `✨ Sumas <b>${c} CupiCoins</b>`;
            document.getElementById('modalCupicoins').style.display = 'block';
        }
        ModalProducto.productoActual._incrementoActual = incrementoTotal;
    },

    addToCart: () => {
        let ok = true;
        document.querySelectorAll('.var-select.var-required').forEach(s => { if(!s.value){ Utils.toast(`Elige ${s.getAttribute('data-columna').replace(/[*#]/g,'')}`, "error"); ok = false; }});
        if (document.querySelector('.color-group') && !document.querySelector('.var-radio:checked')){ Utils.toast("Elige un COLOR", "error"); ok = false; }
        if (!ok) return;

        const vars = {};
        document.querySelectorAll('.var-select').forEach(s => { if(s.value) vars[s.getAttribute('data-columna').replace(/[*#]/g,'')] = s.value; });
        const rc = document.querySelector('.var-radio:checked');
        if(rc) vars[rc.getAttribute('data-columna').replace(/[*#]/g,'')] = rc.value;
        const chks = Array.from(document.querySelectorAll('.var-checkbox:checked')).map(c => c.value);
        if(chks.length > 0) vars['Complementos'] = chks.join(', ');
        const chkP = document.getElementById('chkPersonalizar');
        if(chkP && chkP.checked) vars['Personalización'] = document.getElementById('txtPers').value;

        Carrito.add(ModalProducto.productoActual, vars, ModalProducto.productoActual._incrementoActual || 0, ModalProducto.cantidadActual);
        ModalProducto.close();
    }
};
document.addEventListener('DOMContentLoaded', ModalProducto.init);