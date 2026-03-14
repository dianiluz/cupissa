/* ===================================================== */
/* CUPISSA — CATALOGO.JS (PRO: MOTOR + FILTROS + TEMU STYLE) */
/* ===================================================== */

const DEMO_PRODUCTS_CATALOG = [
    { ref: 'DEMO001', nombre: 'Mameluco Personalizado', imagenurl: '/assets/mockups/mameluco.png', precio_base: 35000, mundo: 'MUNDO TEXTIL', categoria: 'BEBÉS', activo: 'SI', '#Color': 'Blanco|Negro', '*Tallas': '0-3M|3-6M|6-9M' }
];

const Catalogo = {
    productos: [],
    variacionesDB: [],
    filtrosActivos: {},
    filtrados: [],
    paginaActual: 1,
    itemsPorPagina: 12,
    cargandoNuevos: false,

    esperarSupabase: async () => {
        let intentos = 0;
        while (!window.db && intentos < 20) {
            if (typeof window.supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
                window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
                break;
            }
            await new Promise(r => setTimeout(r, 200));
            intentos++;
        }
    },

    init: async () => {
        const grid = document.getElementById('catalogoGrid');
        if(grid) grid.innerHTML = '<div class="empty-state">Cargando catálogo oficial...</div>';

        try {
            await Catalogo.esperarSupabase();
            const { data: prodData } = await window.db.from('productos').select('*');
            const { data: varData } = await window.db.from('variaciones').select('*');

            Catalogo.variacionesDB = varData || [];
            let dataRaw = prodData || [];
            
            Catalogo.productos = dataRaw.filter(p => {
                const estado = p.activo || p['*activ'] || p['*activo'] || 'NO';
                const ref = p.ref || p.referencia || '';
                return ref && String(estado).toUpperCase().trim() === 'SI';
            }).map(p => ({
                ...p,
                ref: String(p.ref || p.referencia).trim(),
                nombre: p.producto || p.nombre || 'Producto Cupissa',
                '*precio_base': p.precio_base || p['*precio_base'] || 0
            }));

            if (Catalogo.productos.length === 0) Catalogo.productos = DEMO_PRODUCTS_CATALOG;

            Catalogo.renderFiltros();
            Catalogo.aplicarFiltros();
            Catalogo.bindEvents();
            Catalogo.setupInfiniteScroll();
        } catch (e) { console.error("Error init:", e); }
    },

    renderFiltros: () => {
        const container = document.getElementById('filtrosContainer');
        if(!container) return;
        container.innerHTML = '';
        const columnas = ['mundo', 'categoria', 'subcategoria', 'tematica', 'para_quien', 'temporada'];
        
        columnas.forEach(col => {
            const valores = [...new Set(Catalogo.productos.map(p => p[col]).filter(v => v))].sort();
            if (valores.length === 0) return;

            const details = document.createElement('details');
            details.className = 'filter-group';
            details.innerHTML = `
                <summary class="filter-title">${col.replace('_', ' ').toUpperCase()}</summary>
                <div class="filter-options">
                    <label class="filter-label">
                        <input type="radio" name="filter_${col}" data-col="${col}" value="" checked> Todos
                    </label>
                    ${valores.map(v => `
                        <label class="filter-label">
                            <input type="radio" name="filter_${col}" data-col="${col}" value="${v}"> ${v}
                        </label>
                    `).join('')}
                </div>
            `;
            
            details.addEventListener('toggle', () => {
                if (details.open) {
                    document.querySelectorAll('.filter-group').forEach(other => { if (other !== details) other.open = false; });
                }
            });
            container.appendChild(details);
        });
    },

    aplicarFiltros: () => {
        Catalogo.filtrados = Catalogo.productos.filter(p => {
            return Object.keys(Catalogo.filtrosActivos).every(col => {
                return !Catalogo.filtrosActivos[col] || p[col] === Catalogo.filtrosActivos[col];
            });
        });
        document.getElementById('catalogoCount').innerText = `${Catalogo.filtrados.length} productos`;
        Catalogo.paginaActual = 1;
        document.getElementById('catalogoGrid').innerHTML = '';
        Catalogo.cargarMasProductos();
    },

    cargarMasProductos: () => {
        if (Catalogo.cargandoNuevos) return;
        Catalogo.cargandoNuevos = true;
        const grid = document.getElementById('catalogoGrid');
        const inicio = (Catalogo.paginaActual - 1) * Catalogo.itemsPorPagina;
        const lote = Catalogo.filtrados.slice(inicio, inicio + Catalogo.itemsPorPagina);

        lote.forEach(p => {
            let selectsHtml = '';
            // Solo mostramos Tallas/Modalidad en la tarjeta (limpio)
            Object.keys(p).forEach(key => {
                const val = String(p[key]);
                const keyL = key.replace(/[*#]/g, '').toLowerCase();
                if ((val.includes('|') || keyL.includes('talla')) && !keyL.includes('color') && !keyL.includes('complemento') && !keyL.includes('personaliza')) {
                    const opciones = val.replace('#','').split('|').map(o => o.trim());
                    selectsHtml += `<select class="card-select" data-col="${key}" onchange="Catalogo.updateCardPrice('${p.ref}')">
                        <option value="" disabled selected>${keyL.toUpperCase()}</option>
                        ${opciones.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>`;
                }
            });

            // Lógica TEMU: Números aleatorios realistas
            const vendidos = Math.floor(Math.random() * 25) + 8;
            const viendo = Math.floor(Math.random() * 12) + 4;

            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.id = `card-${p.ref}`;
            card.innerHTML = `
                <div style="position:relative; overflow:hidden;">
                    <img src="${p.imagenurl}" class="product-image" onclick="ModalProducto.open('${p.ref}')" onerror="this.src='/assets/logo.png'">
                    <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                        <span id="badge-cupi-${p.ref}" style="background:var(--color-pink); color:white; font-size:0.7rem; padding:4px 12px; border-radius:20px; font-weight:bold; box-shadow:var(--shadow-sm);">Otorga --- CupiCoins</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.nombre}</h3>
                    <div style="font-size:0.75rem; color:var(--color-success); margin-bottom:8px; display:flex; align-items:center; gap:5px;">
                        <span>🔥 ${vendidos}+ vendidos hoy</span> | <span>👁️ ${viendo} viéndolo</span>
                    </div>
                    <div class="card-selects">${selectsHtml}</div>
                    <div style="margin-top:auto; border-top:1px solid #f0f0f0; padding-top:10px;">
                        <div id="price-total-${p.ref}" style="color:var(--color-success); font-weight:700; font-size:1.1rem;">$ ---</div>
                        <div id="price-anticipo-${p.ref}" style="color:var(--color-gray-dark); font-size:0.85rem; font-weight:500;">Anticipo: ---</div>
                    </div>
                    <button class="btn-add-direct" onclick="ModalProducto.open('${p.ref}')" style="margin-top:12px; width:100%; font-size:0.9rem;">Agregar al carrito</button>
                </div>`;
            grid.appendChild(card);
            Catalogo.updateCardPrice(p.ref);
        });
        Catalogo.paginaActual++;
        Catalogo.cargandoNuevos = false;
    },

    updateCardPrice: (ref) => {
        const card = document.getElementById(`card-${ref}`);
        const p = Catalogo.productos.find(prod => prod.ref === ref);
        if (!card || !p) return;

        let base = Utils.safeNumber(p['*precio_base']);
        let inc = 0;
        const estado = {};
        
        // Sincronización exacta con lógica del Modal
        Object.keys(p).forEach(k => { estado[Utils.normalizeStr(k.replace(/[*#]/g, ''))] = Utils.normalizeStr(String(p[k])); });
        card.querySelectorAll('.card-select').forEach(s => {
            if (s.value) estado[Utils.normalizeStr(s.getAttribute('data-col').replace(/[*#]/g, ''))] = Utils.normalizeStr(s.value);
        });

        const ids = String(p.variaciones_ids || "").replace(/[\[\]"']/g, '').split(/[|,]/).map(id => id.trim());
        const reglas = Catalogo.variacionesDB.filter(v => ids.includes(String(v.id)));

        reglas.forEach(r => {
            const cols = String(r.columna).split('|').map(c => Utils.normalizeStr(c.replace(/[*#]/g, '')));
            const vals = String(r.valor).split('|').map(v => Utils.normalizeStr(v));
            if (cols.length === vals.length) {
                let cumple = true;
                for (let i = 0; i < cols.length; i++) { if (estado[cols[i]] !== vals[i]) { cumple = false; break; } }
                if (cumple) inc += Utils.safeNumber(r.incremento);
            }
        });

        const total = base + inc;
        document.getElementById(`price-total-${ref}`).innerText = Utils.formatCurrency(total);
        document.getElementById(`price-anticipo-${ref}`).innerText = `Anticipo (20%): ${Utils.formatCurrency(total * 0.20)}`;
        document.getElementById(`badge-cupi-${ref}`).innerText = `Otorga ${Math.floor(total/1000)*5} CupiCoins`;
    },

    bindEvents: () => {
        document.getElementById('filtrosContainer')?.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const col = e.target.getAttribute('data-col');
                const val = e.target.value;
                if (!val) delete Catalogo.filtrosActivos[col];
                else Catalogo.filtrosActivos[col] = val;
                Catalogo.aplicarFiltros();
            }
        });
    },

    setupInfiniteScroll: () => {
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) Catalogo.cargarMasProductos();
        });
    }
};

document.addEventListener('DOMContentLoaded', Catalogo.init);