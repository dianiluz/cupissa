/* js/catalogo.js */
/* ===================================================== */
/* CUPISSA — CATALOGO.JS (ACTUALIZADO) */
/* ===================================================== */

const DEMO_PRODUCTS_CATALOG = [
    { ref: 'DEMO001', nombre: 'Mameluco Personalizado', imagenurl: '/assets/mockups/mameluco.png', '*precio_base': 35000, mundo: 'MUNDO TEXTIL', categoria: 'BEBÉS', '*activo': 'SI', '#Color': 'Blanco|Negro', '*Tallas': '0-3M|3-6M|6-9M' },
    { ref: 'DEMO002', nombre: 'Camiseta Oversize', imagenurl: '/assets/mockups/camiseta.png', '*precio_base': 45000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', '*activo': 'SI', '#Color': 'Negro|Gris', '*Tallas': 'S|M|L|XL' },
    { ref: 'DEMO003', nombre: 'Taza Mágica', imagenurl: '/assets/mockups/taza.png', '*precio_base': 25000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', '*activo': 'SI' },
    { ref: 'DEMO004', nombre: 'Buzo Capota', imagenurl: '/assets/mockups/buzo.png', '*precio_base': 75000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', '*activo': 'SI', '#Color': 'Fucsia|Blanco', '*Tallas': 'S|M|L' },
    { ref: 'DEMO005', nombre: 'Tula Deportiva', imagenurl: '/assets/mockups/tula.png', '*precio_base': 20000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', '*activo': 'SI' },
    { ref: 'DEMO006', nombre: 'Cojín Personalizado', imagenurl: '/assets/mockups/almohada.png', '*precio_base': 30000, mundo: 'MUNDO DETALLES', categoria: 'DETALLES PERSONALIZADOS', '*activo': 'SI' }
];

const Catalogo = {
    productos: [],
    variacionesDB: [],
    filtrosActivos: {},
    filtrados: [],
    paginaActual: 1,
    itemsPorPagina: 12,
    cargandoNuevos: false,

   init: async () => {
        const grid = document.getElementById('catalogoGrid');
        grid.innerHTML = '<div class="empty-state">Cargando productos maravillosos...</div>';

        try {
            const res = await Utils.fetchFromBackend('obtenerCatalogoBase');
            
            if (!res || !res.success) {
                throw new Error("No se pudo cargar la data desde el servidor.");
            }

            Catalogo.variacionesDB = res.variaciones || [];
            let dataProductos = res.productos || [];
            
            let productosActivos = dataProductos.filter(p => {
                const estado = p['*activ'] || p['*activo'] || p['activo'] || p['Activo'] || 'NO';
                const referencia = p.ref || p.referencia || p.Referencia || '';
                
                return p && referencia && String(referencia).trim() !== '' && 
                       String(estado).toUpperCase().trim() === 'SI';
            });
            
            if (productosActivos.length === 0) {
                productosActivos = DEMO_PRODUCTS_CATALOG;
            }
            
            let productosUnicos = [];
            let mapaRefs = new Set();
            
            productosActivos.forEach(p => {
                const refString = String(p.ref || p.referencia || p.Referencia).trim(); 
                if(!mapaRefs.has(refString)) {
                    mapaRefs.add(refString);
                    p.ref = refString; 
                    p['*precio_base'] = p['*precio_base'] || p['precio_base'] || p.precio || 0;
                    productosUnicos.push(p);
                }
            });

            Catalogo.productos = Utils.shuffle(productosUnicos);
            
            // Logica para aplicar parametros de busqueda si existen en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            const refParam = urlParams.get('ref');

            if (query) {
                const qLower = Utils.normalizeStr(query);
                Catalogo.productos = Catalogo.productos.filter(p => 
                    Object.values(p).some(val => Utils.normalizeStr(String(val)).includes(qLower))
                );
                document.getElementById('catalogoTitle').innerText = `Resultados para "${query}"`;
            } else if (refParam) {
                Catalogo.productos = Catalogo.productos.filter(p => p.ref === refParam);
            }
            
            Catalogo.renderFiltros();
            Catalogo.aplicarFiltros();
            Catalogo.bindEvents();
            Catalogo.setupInfiniteScroll();
        } catch (error) {
            console.error("Error cargando catálogo:", error);
            Catalogo.productos = Utils.shuffle(DEMO_PRODUCTS_CATALOG);
            Catalogo.renderFiltros();
            Catalogo.aplicarFiltros();
            Catalogo.bindEvents();
            Catalogo.setupInfiniteScroll();
        }
    },

    renderFiltros: () => {
        const container = document.getElementById('filtrosContainer');
        container.innerHTML = '';
        Catalogo.filtrosActivos = {};

        if (Catalogo.productos.length === 0) return;

        const ignorar = ['ref', 'nombre', 'imagenurl'];
        const columnasTotales = Object.keys(Catalogo.productos[0]);
        const columnasFiltro = columnasTotales.filter(col => 
            !col.startsWith('*') && 
            !ignorar.includes(col.toLowerCase()) && 
            !col.includes('#')
        );

        columnasFiltro.forEach(col => {
            Catalogo.filtrosActivos[col] = []; 

            const valoresUnicos = [...new Set(Catalogo.productos
                .map(p => p[col])
                .filter(val => val && String(val).trim() !== '' && !String(val).includes('|'))
            )].sort();

            if (valoresUnicos.length === 0) return;

            const group = document.createElement('details');
            group.className = 'filter-group';
            if(container.children.length === 0) group.open = true; 
            
            const title = document.createElement('summary');
            title.className = 'filter-title';
            title.innerText = col.charAt(0).toUpperCase() + col.slice(1);
            group.appendChild(title);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'filter-options';

            valoresUnicos.forEach(val => {
                const label = document.createElement('label');
                label.className = 'filter-label';
                label.innerHTML = `
                    <input type="checkbox" data-col="${col}" value="${val}">
                    ${val}
                `;
                optionsDiv.appendChild(label);
            });

            group.appendChild(optionsDiv);
            container.appendChild(group);
        });
    },

    aplicarFiltros: () => {
        Catalogo.filtrados = Catalogo.productos.filter(p => {
            return Object.keys(Catalogo.filtrosActivos).every(col => {
                if (!Catalogo.filtrosActivos[col] || Catalogo.filtrosActivos[col].length === 0) return true;
                return Catalogo.filtrosActivos[col].includes(p[col]);
            });
        });

        const count = document.getElementById('catalogoCount');
        if(count) count.innerText = `${Catalogo.filtrados.length} resultados`;

        Catalogo.paginaActual = 1;
        document.getElementById('catalogoGrid').innerHTML = '';
        Catalogo.cargarMasProductos();
    },

    cargarMasProductos: () => {
        if (Catalogo.cargandoNuevos) return;
        Catalogo.cargandoNuevos = true;

        const grid = document.getElementById('catalogoGrid');
        const inicio = (Catalogo.paginaActual - 1) * Catalogo.itemsPorPagina;
        const fin = inicio + Catalogo.itemsPorPagina;
        const lote = Catalogo.filtrados.slice(inicio, fin);

        if (lote.length === 0 && Catalogo.paginaActual === 1) {
            grid.innerHTML = '<div class="empty-state">No hay productos que coincidan.</div>';
            Catalogo.cargandoNuevos = false;
            return;
        }

        lote.forEach(p => {
            let selectsHtml = '';
            let requierePersonalizacion = false;

            Object.keys(p).forEach(key => {
                let val = String(p[key]);
                if (val.includes('#') || val.includes('|') || key.toLowerCase() === '*tallas') {
                    const cleanVal = val.replace('#', '');
                    if(!cleanVal) return;
                    
                    const opciones = cleanVal.split('|').map(o => o.trim());
                    const nombreLimpio = key.replace('*', '').replace('#', '');
                    
                    if (nombreLimpio.toLowerCase() === 'personalizable') {
                        requierePersonalizacion = true;
                    } else {
                        selectsHtml += `
                            <select class="card-select" data-col="${key}" onchange="Catalogo.updateCardPrice('${p.ref}')">
                                ${opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        `;
                    }
                }
            });

            const precioBase = Utils.safeNumber(p['*precio_base']);
            const cupiCoins = Math.floor(precioBase / 1000) * 5;
            const precioAnticipo = Utils.formatCurrency(precioBase * 0.20);
            const vendidos = Math.floor(Math.random() * 20) + 5;
            const viendo = Math.floor(Math.random() * 15) + 3;
            
            let imgUrlFinal = '/assets/logo.png';
            if (p.imagenurl && String(p.imagenurl).trim() !== '') {
                imgUrlFinal = String(p.imagenurl).split('|')[0].trim();
                if (imgUrlFinal.includes('drive.google.com')) {
                    const match = imgUrlFinal.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
                    }
                }
            }
            
            const isWished = (typeof Wishlist !== 'undefined' && Wishlist.items.some(i => i.ref === p.ref));
            const heartColor = isWished ? 'var(--color-pink)' : 'var(--color-gray-dark)';

            const btnAddHtml = requierePersonalizacion 
                ? `<button class="btn-add-direct" onclick="ModalProducto.open('${p.ref}')">Personalizar</button>`
                : `<button class="btn-add-direct" onclick="Catalogo.addDirectToCart('${p.ref}')">Agregar al carrito</button>`;
            
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.id = `card-${p.ref}`;
            card.innerHTML = `
                <div style="position:relative;">
                    <img src="${imgUrlFinal}" alt="${p.nombre}" class="product-image" onerror="this.src='/assets/logo.png'" onclick="ModalProducto.open('${p.ref}')" loading="lazy">
                    <button style="position:absolute; top:10px; right:10px; background:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; color:${heartColor}; box-shadow:var(--shadow-sm);" title="Agregar a favoritos" onclick="Wishlist.toggle('${p.ref}')">
                        <i class="fas fa-heart" id="wishlist-icon-${p.ref}"></i>
                    </button>
                    <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                        <span id="cupicoins-${p.ref}" style="background:var(--color-pink); color:white; font-size:0.75rem; padding:3px 10px; border-radius:15px; font-weight:bold;">Otorga ${cupiCoins} CupiCoins</span>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-title">${p.nombre}</div>
                    <div style="font-size:0.75rem; color:var(--color-success); margin-bottom:5px;">🔥 ${vendidos}+ vendidos hoy | 👀 ${viendo} viéndolo</div>
                    
                    <div class="card-selects">
                        ${selectsHtml}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                        <div>
                            <div style="color:var(--color-success); font-size:0.85rem; font-weight:600;" id="price-total-${p.ref}">Total: ${Utils.formatCurrency(precioBase)}</div>
                            <div class="product-price" style="font-size:1.1rem; color:var(--color-black); font-weight:bold;" id="price-anticipo-${p.ref}">Anticipo: ${precioAnticipo}</div>
                        </div>
                    </div>
                    
                    <div class="card-actions" style="margin-top:10px;">
                        ${btnAddHtml}
                        <button class="btn-view-modal" onclick="ModalProducto.open('${p.ref}')" title="Ver detalles" style="background:var(--color-black); color:white; border:none; padding:10px; border-radius:var(--radius-md); cursor:pointer;"><i class="fas fa-expand"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
            
            if(selectsHtml !== '') Catalogo.updateCardPrice(p.ref);
        });

        Catalogo.paginaActual++;
        Catalogo.cargandoNuevos = false;
    },

    updateCardPrice: (ref) => {
        const card = document.getElementById(`card-${ref}`);
        const producto = Catalogo.productos.find(p => p.ref === ref);
        if (!card || !producto) return;

        let precioBase = Utils.safeNumber(producto['*precio_base']);
        let incrementoTotal = 0;

        const seleccionActual = {};
        Object.keys(producto).forEach(key => {
            const claveLimpia = key.replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(producto[key]);
        });

        const selects = card.querySelectorAll('.card-select');
        selects.forEach(sel => {
            const claveLimpia = sel.getAttribute('data-col').replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(sel.value);
        });

        let reglasEspecificas = Catalogo.variacionesDB.filter(v => {
            if (!v.producto) return false;
            return v.producto.split('|').map(r => Utils.normalizeStr(r)).includes(Utils.normalizeStr(ref));
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
                if (cumpleTodas) incrementoTotal += Utils.safeNumber(regla.incremento);
            }
        });

        const precioTotalFinal = precioBase + incrementoTotal;
        producto._incrementoActual = incrementoTotal;
        
        document.getElementById(`price-total-${ref}`).innerText = `Total: ${Utils.formatCurrency(precioTotalFinal)}`;
        document.getElementById(`price-anticipo-${ref}`).innerText = `Anticipo: ${Utils.formatCurrency(precioTotalFinal * 0.20)}`;
        
        const cupiCoinsBadge = document.getElementById(`cupicoins-${ref}`);
        if (cupiCoinsBadge) {
            const cupiCoins = Math.floor(precioTotalFinal / 1000) * 5;
            cupiCoinsBadge.innerText = `Otorga ${cupiCoins} CupiCoins`;
        }
    },

    addDirectToCart: (ref) => {
        const card = document.getElementById(`card-${ref}`);
        const producto = Catalogo.productos.find(p => p.ref === ref);
        if (!card || !producto) return;

        const selects = card.querySelectorAll('.card-select');
        const variacionesSeleccionadas = {};
        
        selects.forEach(sel => {
            const nombreLimpio = sel.getAttribute('data-col').replace('*', '').replace('#', '');
            variacionesSeleccionadas[nombreLimpio] = sel.value;
        });

        Carrito.add(producto, variacionesSeleccionadas, producto._incrementoActual || 0, 1);
    },

    setupInfiniteScroll: () => {
        window.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                Catalogo.cargarMasProductos();
            }
        });
    },

    bindEvents: () => {
        document.getElementById('filtrosContainer').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const col = e.target.getAttribute('data-col');
                const val = e.target.value;

                if (e.target.checked) {
                    Catalogo.filtrosActivos[col].push(val);
                } else {
                    Catalogo.filtrosActivos[col] = Catalogo.filtrosActivos[col].filter(v => v !== val);
                }
                Catalogo.aplicarFiltros();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Catalogo.init);