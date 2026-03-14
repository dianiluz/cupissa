/* ===================================================== */
/* CUPISSA — CATALOGO.JS (CON SEO AUTOMÁTICO & SUPABASE) */
/* ===================================================== */

const DEMO_PRODUCTS_CATALOG = [
    { ref: 'DEMO001', nombre: 'Mameluco Personalizado', imagenurl: '/assets/mockups/mameluco.png', precio_base: 35000, mundo: 'MUNDO TEXTIL', categoria: 'BEBÉS', activo: 'SI', '#Color': 'Blanco|Negro', '*Tallas': '0-3M|3-6M|6-9M' },
    { ref: 'DEMO002', nombre: 'Camiseta Oversize', imagenurl: '/assets/mockups/camiseta.png', precio_base: 45000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', activo: 'SI', '#Color': 'Negro|Gris', '*Tallas': 'S|M|L|XL' },
    { ref: 'DEMO003', nombre: 'Taza Mágica', imagenurl: '/assets/mockups/taza.png', precio_base: 25000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS', activo: 'SI' }
];

const Catalogo = {
    productos: [],
    variacionesDB: [],
    filtrosActivos: {},
    filtrados: [],
    paginaActual: 1,
    itemsPorPagina: 12,
    cargandoNuevos: false,

    // AUTO-INICIALIZADOR BLINDADO (Evita pantalla vacía en conexiones lentas)
    esperarSupabase: async () => {
        let intentos = 0;
        while (!window.db && intentos < 20) {
            if (typeof window.supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
                window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            intentos++;
        }
        if (!window.db) throw new Error("Supabase no inicializó a tiempo. Revisa tu conexión a internet.");
    },

   init: async () => {
       const grid = document.getElementById('catalogoGrid');
       if(grid) grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Cargando catálogo oficial...</div>';

       try {
           await Catalogo.esperarSupabase();

           const { data: prodData, error: errProd } = await window.db.from('productos').select('*');
           if (errProd) throw errProd;

           const { data: varData, error: errVar } = await window.db.from('variaciones').select('*');
           if (errVar) throw errVar;

           Catalogo.variacionesDB = varData || [];
           let dataProductos = prodData || [];
           
           let productosActivos = dataProductos.filter(p => {
               const estado = p.activo || p['*activ'] || p['*activo'] || 'NO';
               const referencia = p.ref || p.referencia || p.Referencia || '';
               return p && referencia && String(referencia).trim() !== '' && String(estado).toUpperCase().trim() === 'SI';
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
                   p.nombre = p.producto || p.nombre || p['*producto'] || 'Producto sin nombre';
                   p['*precio_base'] = p.precio_base || p['*precio_base'] || p.precio || 0;
                   
                   p.mundo = p.mundo || p.Mundo || '';
                   p.categoria = p.categoria || p.Categoria || '';
                   p.subcategoria = p.subcategoria || p.Subcategoria || '';
                   p.tematica = p.tematica || p.Tematica || '';
                   p.para_quien = p.para_quien || p.Para_quien || p['Para quien'] || '';
                   p.temporada = p.temporada || p.Temporada || '';

                   productosUnicos.push(p);
               }
           });

           Catalogo.productos = Utils.shuffle(productosUnicos);
           
           const urlParams = new URLSearchParams(window.location.search);
           const query = urlParams.get('q');
           const refParam = urlParams.get('ref');
           const catParam = urlParams.get('cat');
           const mundoParam = urlParams.get('mundo');

           if (query) {
               const qLower = Utils.normalizeStr(query);
               Catalogo.productos = Catalogo.productos.filter(p => 
                   Object.values(p).some(val => Utils.normalizeStr(String(val)).includes(qLower))
               );
               const titleEl = document.getElementById('catalogoTitle');
               if(titleEl) titleEl.innerText = `Resultados para "${query}"`;
           } else if (refParam) {
               Catalogo.productos = Catalogo.productos.filter(p => p.ref === refParam);
           }
           
           Catalogo.renderFiltros();

           ['categoria', 'mundo'].forEach(param => {
               const paramVal = urlParams.get(param);
               if (paramVal && Catalogo.filtrosActivos[param]) {
                   Catalogo.filtrosActivos[param].push(paramVal);
                   const cb = document.querySelector(`input[data-col="${param}"][value="${paramVal.replace(/"/g, '\\"')}"]`);
                   if (cb) cb.checked = true;
                   const titleEl = document.getElementById('catalogoTitle');
                   if(titleEl) titleEl.innerText = paramVal;
               }
           });

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
        if(!container) return;
        container.innerHTML = '';
        Catalogo.filtrosActivos = {};

        if (Catalogo.productos.length === 0) return;

        const columnasPrincipales = ['mundo', 'categoria', 'subcategoria', 'tematica', 'para_quien', 'temporada'];

        columnasPrincipales.forEach(col => {
            Catalogo.filtrosActivos[col] = []; 

            const valoresUnicos = [...new Set(Catalogo.productos
                .map(p => p[col])
                .filter(val => val && String(val).trim() !== '')
            )].sort();

            if (valoresUnicos.length === 0) return;

            const group = document.createElement('details');
            group.className = 'filter-group';
            group.open = true;
            
            const title = document.createElement('summary');
            title.className = 'filter-title';
            title.innerText = col.replace('_', ' ').charAt(0).toUpperCase() + col.replace('_', ' ').slice(1);
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
        const grid = document.getElementById('catalogoGrid');
        if(grid) grid.innerHTML = '';
        Catalogo.cargarMasProductos();
    },

    cargarMasProductos: () => {
        if (Catalogo.cargandoNuevos) return;
        Catalogo.cargandoNuevos = true;

        const grid = document.getElementById('catalogoGrid');
        if(!grid) return;

        const inicio = (Catalogo.paginaActual - 1) * Catalogo.itemsPorPagina;
        const fin = inicio + Catalogo.itemsPorPagina;
        const lote = Catalogo.filtrados.slice(inicio, fin);

        if (lote.length === 0 && Catalogo.paginaActual === 1) {
            grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No hay productos que coincidan.</div>';
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
                let rawPath = String(p.imagenurl).split('|')[0].trim();
                
                if (rawPath.includes('drive.google.com')) {
                    const match = rawPath.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
                    }
                } else if (rawPath.startsWith('http')) {
                    imgUrlFinal = rawPath;
                } else {
                    imgUrlFinal = `https://raw.githubusercontent.com/dianiluz/cupissa/main/${rawPath.replace(/^\//, '')}`;
                }
            }
            
            const isWished = (typeof Wishlist !== 'undefined' && Wishlist.items.some(i => i.ref === p.ref));
            const heartColor = isWished ? 'var(--color-pink)' : 'var(--color-gray-dark)';

            const btnAddHtml = requierePersonalizacion 
                ? `<button class="btn-add-direct" onclick="ModalProducto.open('${p.ref}')">Personalizar</button>`
                : `<button class="btn-add-direct" onclick="Catalogo.addDirectToCart('${p.ref}')">Agregar al carrito</button>`;
            
            const altText = `${p.nombre} - ${p.categoria} | Cupissa Productos Personalizados Colombia`;

            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.id = `card-${p.ref}`;
            card.setAttribute('itemscope', '');
            card.setAttribute('itemtype', 'https://schema.org/Product');

            card.innerHTML = `
                <div style="position:relative;">
                    <img itemprop="image" src="${imgUrlFinal}" alt="${altText}" class="product-image" onerror="this.src='/assets/logo.png'" onclick="ModalProducto.open('${p.ref}')" loading="lazy">
                    <button style="position:absolute; top:10px; right:10px; background:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; color:${heartColor}; box-shadow:var(--shadow-sm);" title="Agregar a favoritos" onclick="Wishlist.toggle('${p.ref}')">
                        <i class="fas fa-heart" id="wishlist-icon-${p.ref}"></i>
                    </button>
                    <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                        <span id="cupicoins-${p.ref}" style="background:var(--color-pink); color:white; font-size:0.75rem; padding:3px 10px; border-radius:15px; font-weight:bold;">Otorga ${cupiCoins} CupiCoins</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 itemprop="name" class="product-title">${p.nombre}</h3>
                    <meta itemprop="description" content="Personaliza tu ${p.nombre}. Mundo ${p.mundo} en Cupissa SAS Colombia.">
                    <div style="font-size:0.75rem; color:var(--color-success); margin-bottom:5px;">🔥 ${vendidos}+ vendidos hoy | 👀 ${viendo} viéndolo</div>
                    
                    <div class="card-selects">
                        ${selectsHtml}
                    </div>

                    <div itemprop="offers" itemscope itemtype="https://schema.org/Offer" style="display:flex; justify-content:space-between; align-items:flex-end;">
                        <meta itemprop="priceCurrency" content="COP">
                        <meta itemprop="price" content="${precioBase}">
                        <link itemprop="availability" href="https://schema.org/InStock">
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
            
            Catalogo.inyectarJSONLD(p, precioBase, imgUrlFinal);

            if(selectsHtml !== '') Catalogo.updateCardPrice(p.ref);
        });

        Catalogo.paginaActual++;
        Catalogo.cargandoNuevos = false;
    },

    inyectarJSONLD: (p, precio, img) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        const json = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": p.nombre,
            "image": img,
            "description": `Producto personalizado de la categoría ${p.categoria} en Cupissa.`,
            "sku": p.ref,
            "brand": { "@type": "Brand", "name": "CUPISSA" },
            "offers": {
                "@type": "Offer",
                "url": `https://cupissa.com/catalogo/?ref=${p.ref}`,
                "priceCurrency": "COP",
                "price": precio,
                "availability": "https://schema.org/InStock",
                "seller": { "@type": "Organization", "name": "CUPISSA SAS" }
            }
        };
        script.text = JSON.stringify(json);
        document.head.appendChild(script);
    },

    updateCardPrice: (ref) => {
        const card = document.getElementById(`card-${ref}`);
        const producto = Catalogo.productos.find(p => p.ref === ref);
        if (!card || !producto) return;

        let precioBase = Utils.safeNumber(producto.precio_base || producto['*precio_base'] || 0);
        let incrementoTotal = 0;

        const seleccionActual = {};
        
        Object.keys(producto).forEach(key => {
            const claveLimpia = Utils.normalizeStr(key.replace('*','').replace('#',''));
            seleccionActual[claveLimpia] = Utils.normalizeStr(String(producto[key]));
        });

        const selects = card.querySelectorAll('.card-select');
        selects.forEach(sel => {
            const claveLimpia = Utils.normalizeStr(sel.getAttribute('data-col').replace('*','').replace('#',''));
            seleccionActual[claveLimpia] = Utils.normalizeStr(sel.value);
        });

        let reglasAUsar = [];
        const idsGuardados = String(producto.variaciones_ids || "").trim();
        
        if (idsGuardados !== '' && idsGuardados.toUpperCase() !== 'NULO') {
            const idsStr = idsGuardados.replace(/[\[\]"']/g, '').replace(/\|/g, ',');
            const idsArray = idsStr.split(',').map(id => id.trim());
            // Busca estrictamente por la columna "id" que me confirmaste
            reglasAUsar = Catalogo.variacionesDB.filter(v => idsArray.includes(String(v.id)));
        } else {
            reglasAUsar = Catalogo.variacionesDB.filter(v => !v.producto || String(v.producto).trim() === "");
        }

        // EVALUACIÓN TOLERANTE A ERRORES (Fuzzy Match)
        reglasAUsar.forEach(regla => {
            if (!regla.columna || !regla.valor) return;
            
            const columnasRegla = regla.columna.split('|');
            const valoresRegla = regla.valor.split('|');

            if (columnasRegla.length === valoresRegla.length) {
                let cumpleTodas = true;
                for (let i = 0; i < columnasRegla.length; i++) {
                    const colReq = Utils.normalizeStr(columnasRegla[i].replace('*','').replace('#',''));
                    const valReq = Utils.normalizeStr(valoresRegla[i]);
                    
                    const matchingKey = Object.keys(seleccionActual).find(k => k === colReq || k.includes(colReq) || colReq.includes(k));
                    const valorSeleccionado = matchingKey ? seleccionActual[matchingKey] : undefined;

                    if (!valorSeleccionado || !(valorSeleccionado === valReq || valorSeleccionado.includes(valReq) || valReq.includes(valorSeleccionado))) {
                        cumpleTodas = false;
                        break;
                    }
                }
                if (cumpleTodas) incrementoTotal += Number(regla.incremento || 0);
            } 
            else {
                const colReq = Utils.normalizeStr(regla.columna.replace('*','').replace('#',''));
                const valReq = Utils.normalizeStr(regla.valor);
                
                const matchingKey = Object.keys(seleccionActual).find(k => k === colReq || k.includes(colReq) || colReq.includes(k));
                const valorSeleccionado = matchingKey ? seleccionActual[matchingKey] : undefined;

                if (valorSeleccionado && (valorSeleccionado === valReq || valorSeleccionado.includes(valReq) || valReq.includes(valorSeleccionado))) {
                    incrementoTotal += Number(regla.incremento || 0);
                }
            }
        });

        const precioTotalFinal = precioBase + incrementoTotal;
        producto._incrementoActual = incrementoTotal; 
        
        const labelTotal = document.getElementById(`price-total-${ref}`);
        const labelAnticipo = document.getElementById(`price-anticipo-${ref}`);
        
        if (labelTotal) labelTotal.innerText = `Total: ${Utils.formatCurrency(precioTotalFinal)}`;
        if (labelAnticipo) labelAnticipo.innerText = `Anticipo: ${Utils.formatCurrency(precioTotalFinal * 0.20)}`;
        
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

        if (typeof Carrito !== 'undefined' && Carrito.add) {
            Carrito.add(producto, variacionesSeleccionadas, producto._incrementoActual || 0, 1);
        }
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
        const c = document.getElementById('filtrosContainer');
        if(c) {
            c.addEventListener('change', (e) => {
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
    }
};

document.addEventListener('DOMContentLoaded', Catalogo.init);