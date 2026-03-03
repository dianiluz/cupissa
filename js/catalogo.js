/* ===================================================== */
/* CUPISSA — LÓGICA DEL CATÁLOGO, FILTROS Y VARIACIONES */
/* ===================================================== */

const Catalogo = {
    productos: [],
    variacionesDB: [],
    filtrosActivos: {},

    init: async () => {
        const grid = document.getElementById('catalogoGrid');
        grid.innerHTML = '<div class="empty-state">Cargando productos maravillosos...</div>';

        try {
            // Cargar datos en paralelo para mayor rapidez
            const [dataProductos, dataVariaciones] = await Promise.all([
                Utils.fetchSheetData(CONFIG.gids.PRODUCTOS),
                Utils.fetchSheetData(CONFIG.gids.VARIACIONES)
            ]);

            Catalogo.variacionesDB = dataVariaciones;
            
            // Filtrar solo activos
            let productosActivos = dataProductos.filter(p => p['*activo'] && p['*activo'].toUpperCase().trim() === 'SI');
            
            // AGRUPAR POR REFERENCIA PARA NO MOSTRAR DUPLICADOS EN EL CATÁLOGO
            let productosUnicos = [];
            let mapaRefs = new Set();
            productosActivos.forEach(p => {
                if(!mapaRefs.has(p.ref)) {
                    mapaRefs.add(p.ref);
                    productosUnicos.push(p);
                }
            });

            // Revolver los productos únicos para que el orden sea aleatorio
            Catalogo.productos = Utils.shuffle(productosUnicos);
            
            Catalogo.renderFiltros();
            Catalogo.renderProductos();
            Catalogo.bindEvents();
        } catch (error) {
            grid.innerHTML = '<div class="empty-state">Error al cargar el catálogo. Intenta recargar.</div>';
            console.error(error);
        }
    },

    renderFiltros: () => {
        const container = document.getElementById('filtrosContainer');
        container.innerHTML = '';
        Catalogo.filtrosActivos = {};

        if (Catalogo.productos.length === 0) return;

        // Extraer TODAS las columnas que NO empiezan con * y que NO son "ref", "nombre", "imagenurl"
        const ignorar = ['ref', 'nombre', 'imagenurl'];
        const columnasTotales = Object.keys(Catalogo.productos[0]);
        const columnasFiltro = columnasTotales.filter(col => 
            !col.startsWith('*') && 
            !ignorar.includes(col.toLowerCase()) && 
            !col.includes('#')
        );

        columnasFiltro.forEach(col => {
            Catalogo.filtrosActivos[col] = []; // Iniciar estado de filtros

            // Ignorar los que tienen | porque esos son para desplegables de tarjeta, no filtros
            const valoresUnicos = [...new Set(Catalogo.productos
                .map(p => p[col])
                .filter(val => val && val.trim() !== '' && !val.includes('|'))
            )].sort();

            if (valoresUnicos.length === 0) return;

            const group = document.createElement('details');
            group.className = 'filter-group';
            // Dejar el primer filtro abierto por defecto
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

    renderProductos: () => {
        const grid = document.getElementById('catalogoGrid');
        const count = document.getElementById('catalogoCount');
        grid.innerHTML = '';

        // Aplicar filtros
        const filtrados = Catalogo.productos.filter(p => {
            return Object.keys(Catalogo.filtrosActivos).every(col => {
                if (!Catalogo.filtrosActivos[col] || Catalogo.filtrosActivos[col].length === 0) return true;
                return Catalogo.filtrosActivos[col].includes(p[col]);
            });
        });

        count.innerText = `${filtrados.length} resultados`;

        if (filtrados.length === 0) {
            grid.innerHTML = '<div class="empty-state">No hay productos que coincidan con tu búsqueda.</div>';
            return;
        }

        filtrados.forEach(p => {
            // Generar listas desplegables (selects) para la tarjeta
            let selectsHtml = '';
            
            Object.keys(p).forEach(key => {
                let val = p[key];
                // Regla: si el campo empieza con #, o contiene |, o es *tallas
                if (typeof val === 'string' && (val.includes('#') || val.includes('|') || key.toLowerCase() === '*tallas')) {
                    const cleanVal = val.replace('#', '');
                    if(!cleanVal) return;
                    
                    const opciones = cleanVal.split('|').map(o => o.trim());
                    const nombreLimpio = key.replace('*', '').replace('#', '');
                    
                    if (nombreLimpio.toLowerCase() !== 'personalizable') {
                        selectsHtml += `
                            <select class="card-select" data-col="${key}" onchange="Catalogo.updateCardPrice('${p.ref}')">
                                ${opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        `;
                    }
                }
            });

            const precioBaseFmt = Utils.formatCurrency(p['*precio_base']);
            
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.id = `card-${p.ref}`;
            card.innerHTML = `
                <img src="${p.imagenurl}" alt="${p.nombre}" class="product-image" onerror="this.src='/assets/logo.png'" onclick="ModalProducto.open('${p.ref}')">
                <div class="product-info">
                    <div class="product-title">${p.nombre}</div>
                    
                    <div class="card-selects">
                        ${selectsHtml}
                    </div>

                    <div class="product-price" id="price-${p.ref}">${precioBaseFmt}</div>
                    
                    <div class="card-actions">
                        <button class="btn-add-direct" onclick="Catalogo.addDirectToCart('${p.ref}')">Agregar</button>
                        <button class="btn-view-modal" onclick="ModalProducto.open('${p.ref}')" title="Ver detalles"><i class="fas fa-expand"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
            
            // Ejecutar actualización de precio inicial por si la primera opción tiene incremento
            if(selectsHtml !== '') Catalogo.updateCardPrice(p.ref);
        });
    },

    updateCardPrice: (ref) => {
        const card = document.getElementById(`card-${ref}`);
        const producto = Catalogo.productos.find(p => p.ref === ref);
        if (!card || !producto) return;

        let precioBase = Utils.safeNumber(producto['*precio_base']);
        let incrementoTotal = 0;

        const seleccionActual = {};
        
        // 1. PRIMERO CARGAMOS LOS ATRIBUTOS FIJOS DEL PRODUCTO
        Object.keys(producto).forEach(key => {
            const claveLimpia = key.replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(producto[key]);
        });

        // 2. SOBREESCRIBIMOS CON LO QUE EL USUARIO ELIGIÓ EN LOS SELECTS
        const selects = card.querySelectorAll('.card-select');
        selects.forEach(sel => {
            const claveLimpia = sel.getAttribute('data-col').replace('*','').replace('#','');
            seleccionActual[Utils.normalizeStr(claveLimpia)] = Utils.normalizeStr(sel.value);
        });

        // 3. BUSCAMOS LAS REGLAS
        let reglasEspecificas = Catalogo.variacionesDB.filter(v => {
            if (!v.producto) return false;
            return v.producto.split('|').map(r => Utils.normalizeStr(r)).includes(Utils.normalizeStr(ref));
        });

        let reglasAUsar = reglasEspecificas.length > 0 
            ? reglasEspecificas 
            : Catalogo.variacionesDB.filter(v => !v.producto || v.producto.trim() === "");

        // 4. EVALUAMOS MATEMÁTICAMENTE
        reglasAUsar.forEach(regla => {
            if (!regla.columna || !regla.valor) return;
            
            const columnasRegla = regla.columna.split('|');
            const valoresRegla = regla.valor.split('|');

            if (columnasRegla.length === valoresRegla.length) {
                let cumpleTodas = true;
                for (let i = 0; i < columnasRegla.length; i++) {
                    const colReq = Utils.normalizeStr(columnasRegla[i].replace('*','').replace('#',''));
                    const valReq = Utils.normalizeStr(valoresRegla[i]);
                    
                    // Compara si el atributo (fijo o del select) coincide con la regla
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

        producto._incrementoActual = incrementoTotal;
        document.getElementById(`price-${ref}`).innerText = Utils.formatCurrency(precioBase + incrementoTotal);
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

        Carrito.add(
            producto, 
            variacionesSeleccionadas, 
            producto._incrementoActual || 0,
            1 // Cantidad por defecto desde la tarjeta
        );
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
                Catalogo.renderProductos();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Catalogo.init);