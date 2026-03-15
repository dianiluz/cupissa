/* ===================================================== */
/* CUPISSA — CATALOGO.JS (FILTRADO INICIAL + GITHUB IMG) */
/* ===================================================== */

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
            
            // 1. CARGA Y NORMALIZACIÓN
            Catalogo.productos = (prodData || []).filter(p => {
                const estado = p.activo || p['*activo'] || p['*activ'] || 'NO';
                return String(estado).toUpperCase().trim() === 'SI';
            }).map(p => ({
                ...p,
                ref: String(p.ref || p.referencia).trim(),
                nombre: p.producto || p.nombre || 'Producto Cupissa',
                '*precio_base': p.precio_base || p['*precio_base'] || 0
            }));

            // 2. CAPTURAR FILTROS DE LA URL ANTES DE RENDERIZAR
            const params = new URLSearchParams(window.location.search);
            if (params.get('mundo')) Catalogo.filtrosActivos['mundo'] = params.get('mundo');
            if (params.get('cat')) Catalogo.filtrosActivos['categoria'] = params.get('cat');
            if (params.get('q')) Catalogo.filtrosActivos['search'] = params.get('q');

            Catalogo.renderFiltros();
            Catalogo.aplicarFiltros(); // Aquí ya se filtran por la URL
            Catalogo.bindEvents();
            Catalogo.setupInfiniteScroll();
        } catch (e) { console.error("Error Catálogo:", e); }
    },

    renderFiltros: () => {
        const container = document.getElementById('filtrosContainer');
        if(!container) return;
        container.innerHTML = '';
        const columnas = ['mundo', 'categoria', 'subcategoria', 'tematica', 'para_quien', 'temporada'];
        
        columnas.forEach(col => {
            const valores = [...new Set(Catalogo.productos.map(p => p[col]).filter(v => v))].sort();
            if (valores.length === 0) return;

            const isOpen = Catalogo.filtrosActivos[col] ? 'open' : '';
            const details = document.createElement('details');
            details.className = 'filter-group';
            if(isOpen) details.setAttribute('open', '');
            
            details.innerHTML = `
                <summary class="filter-title">${col.replace('_', ' ').toUpperCase()}</summary>
                <div class="filter-options">
                    <label class="filter-label">
                        <input type="radio" name="filter_${col}" data-col="${col}" value="" ${!Catalogo.filtrosActivos[col]?'checked':''}> Todos
                    </label>
                    ${valores.map(v => `
                        <label class="filter-label">
                            <input type="radio" name="filter_${col}" data-col="${col}" value="${v}" ${Catalogo.filtrosActivos[col] === v ? 'checked' : ''}> ${v}
                        </label>
                    `).join('')}
                </div>`;
            
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
            // Filtros de Radio
            const matchFiltros = Object.keys(Catalogo.filtrosActivos).every(col => {
                if(col === 'search') return true;
                return !Catalogo.filtrosActivos[col] || p[col] === Catalogo.filtrosActivos[col];
            });

            // Filtro de Búsqueda (q=)
            let matchSearch = true;
            if (Catalogo.filtrosActivos['search']) {
                const term = Utils.normalizeStr(Catalogo.filtrosActivos['search']);
                matchSearch = Utils.normalizeStr(p.nombre).includes(term) || 
                              Utils.normalizeStr(p.ref).includes(term) ||
                              Utils.normalizeStr(p.temporada || '').includes(term);
            }

            return matchFiltros && matchSearch;
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
        const lote = Catalogo.filtrados.slice((Catalogo.paginaActual - 1) * Catalogo.itemsPorPagina, Catalogo.paginaActual * Catalogo.itemsPorPagina);

        lote.forEach(p => {
            // USAMOS EL NUEVO MOTOR INTELIGENTE DE UTILS
            // Dentro del lote.forEach de cargarMasProductos:
const imgFinal = Utils.getImagenUrl(p); // Intenta la de Supabase
const imgBase = `https://raw.githubusercontent.com/dianiluz/cupissa/main/assets/productos/${p.ref}/base.webp`;



            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.id = `card-${p.ref}`;
            card.innerHTML = `
                <div style="position:relative; overflow:hidden;">
<img src="${imgFinal}" 
     class="product-image" 
     onclick="ModalProducto.open('${p.ref}')" 
     onerror="this.onerror=null; this.src='${imgBase}'; this.setAttribute('onerror', 'this.src=\\'/assets/logo.png\\'');">
                    
                    <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                        <span id="badge-cupi-${p.ref}" style="background:var(--color-pink); color:white; font-size:0.7rem; padding:4px 12px; border-radius:20px; font-weight:bold;">Calculando CupiCoins...</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.nombre}</h3>
                    <div style="font-size:0.75rem; color:var(--color-success); margin-bottom:8px;">
                        🔥 ${Math.floor(Math.random()*20)+10}+ vendidos hoy | 👁️ ${Math.floor(Math.random()*10)+5} viendo
                    </div>
                    
                    <div style="margin-top:auto; border-top:1px solid #eee; padding-top:10px;">
                        <div id="price-total-${p.ref}" style="color:var(--color-success); font-weight:700; font-size:1.1rem;">$ ---</div>
                        <div id="price-anticipo-${p.ref}" style="color:var(--color-gray-dark); font-size:0.85rem;">Anticipo: ---</div>
                    </div>
                    <button class="btn-add-direct" onclick="ModalProducto.open('${p.ref}')" style="margin-top:10px; width:100%;">Agregar al carrito</button>
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
        document.getElementById(`badge-cupi-${ref}`).innerText = `Otorga ${Math.floor(total/1000)} CupiCoins`;
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