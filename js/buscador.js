/* ===================================================== */
/* CUPISSA — BUSCADOR INTELIGENTE (PRODUCTOS Y FILTROS)  */
/* ===================================================== */

const Buscador = {
    productosBD: [],
    filtrosUnicos: [],
    historial: [],
    inicializado: false,

    init: async () => {
        if (Buscador.inicializado) return;
        
        const nav = document.querySelector('.header-nav');
        if (!nav) return;

        Buscador.inicializado = true;
        Buscador.cargarHistorial();
        Buscador.crearInterfaz(nav);
        
        try {
            // --- NUEVA CONEXIÓN A SUPABASE (BLINDADA) ---
            let intentos = 0;
            while (!window.db && intentos < 20) {
                if (typeof window.supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
                    window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
                    break;
                }
                await new Promise(r => setTimeout(r, 200));
                intentos++;
            }
            if (!window.db) throw new Error("Supabase no inicializado en el buscador");

            const { data: prodData, error } = await window.db.from('productos').select('*').eq('activo', 'SI');
            
            if (error) throw error;
            
            if (prodData && prodData.length > 0) {
                Buscador.productosBD = prodData.map(p => {
                    p.nombre = p.producto || p.nombre || 'Producto';
                    p['*precio_base'] = p.precio_base || p.precio || 0;
                    return p;
                });
            }
        } catch (e) {
            console.error("Buscador usando productos en caché/demo:", e);
        }

        if (!Buscador.productosBD || Buscador.productosBD.length === 0) {
            Buscador.productosBD = typeof DEMO_PRODUCTS_CATALOG !== 'undefined' ? DEMO_PRODUCTS_CATALOG : [];
        }

        const mapFiltros = new Map();
        const camposFiltro = ['mundo', 'categoria', 'subcategoria', 'tematica', 'modalidad'];
        
        Buscador.productosBD.forEach(p => {
            camposFiltro.forEach(campo => {
                if (p[campo] && String(p[campo]).trim() !== '') {
                    const val = String(p[campo]).trim();
                    const nVal = typeof Utils !== 'undefined' && Utils.normalizeStr ? Utils.normalizeStr(val) : val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (!mapFiltros.has(nVal)) {
                        mapFiltros.set(nVal, { tipo: campo.charAt(0).toUpperCase() + campo.slice(1), valor: val });
                    }
                }
            });
        });
        Buscador.filtrosUnicos = Array.from(mapFiltros.values());
        
        Buscador.bindEvents();
    },

    crearInterfaz: (nav) => {
        if (document.querySelector('.search-container')) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.cssText = 'position: relative; display: flex; align-items: center; background: var(--color-gray-light); border-radius: var(--radius-xl); padding: 5px 15px; flex: 1; margin: 0 20px;';

        searchContainer.innerHTML = `
            <i class="fas fa-search" style="color: var(--color-gray-dark);"></i>
            <input type="text" id="searchInput" placeholder="Buscar productos, referencias, categorías..." style="border: none; background: transparent; padding: 8px 10px; width: 100%; outline: none; font-family: var(--font-primary);">
            <button id="btnVoz" title="Búsqueda por voz" style="background: none; border: none; cursor: pointer; color: var(--color-pink); font-size: 1.1rem;"><i class="fas fa-microphone"></i></button>
            
            <div id="searchSuggestions" style="display: none; position: absolute; top: 110%; left: 0; width: 100%; background: var(--color-white); box-shadow: var(--shadow-md); border-radius: var(--radius-md); max-height: 450px; overflow-y: auto; z-index: 2000; flex-direction: column;">
            </div>
        `;

        nav.parentNode.insertBefore(searchContainer, nav.nextSibling);
    },

    cargarHistorial: () => {
        const guardado = localStorage.getItem('cupissa_search_history');
        if (guardado) Buscador.historial = JSON.parse(guardado);
    },

    guardarHistorial: (termino) => {
        if (!termino || termino.trim() === '') return;
        Buscador.historial = Buscador.historial.filter(h => h !== termino);
        Buscador.historial.unshift(termino);
        if (Buscador.historial.length > 5) Buscador.historial.pop();
        localStorage.setItem('cupissa_search_history', JSON.stringify(Buscador.historial));
    },

    distanciaLevenshtein: (a, b) => {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        let matrix = [];
        for(let i = 0; i <= b.length; i++){ matrix[i] = [i]; }
        for(let j = 0; j <= a.length; j++){ matrix[0][j] = j; }
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) === a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    },

    buscar: (termino) => {
        const getNorm = (val) => typeof Utils !== 'undefined' && Utils.normalizeStr ? Utils.normalizeStr(val || '') : String(val || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const valLimpio = getNorm(termino).trim();
        if (valLimpio.length < 2) return { productos: [], filtros: [] };

        const stopWords = ['de', 'la', 'el', 'las', 'los', 'en', 'para', 'con', 'y', 'un', 'una', 'unos', 'unas'];
        const tokens = valLimpio.split(/\s+/).filter(t => t.length > 1 && !stopWords.includes(t));
        if (tokens.length === 0) tokens.push(valLimpio);

        let resultadosProd = [];
        let mapaRefs = new Set();

        Buscador.productosBD.forEach(p => {
            if(mapaRefs.has(p.ref)) return;

            const nNombre = getNorm(p.nombre);
            const nRef = getNorm(p.ref);
            const nCat = getNorm(p.categoria);
            const nSub = getNorm(p.subcategoria);
            const nTem = getNorm(p.tematica);
            const nMundo = getNorm(p.mundo);

            let score = 0;

            if (nRef === valLimpio) score += 100;
            if (nNombre === valLimpio) score += 90;
            if (nNombre.includes(valLimpio)) score += 70;
            if (nCat === valLimpio || nMundo === valLimpio) score += 50;

            tokens.forEach(token => {
                if (nRef.includes(token)) score += 30;
                if (nNombre.includes(token)) score += 20;
                if (nCat.includes(token) || nSub.includes(token) || nTem.includes(token) || nMundo.includes(token)) score += 15;

                if (token.length > 3) {
                    const allWords = `${nNombre} ${nCat} ${nSub} ${nTem} ${nMundo}`.split(/\s+/);
                    for (let word of allWords) {
                        if (word.length > 3 && Buscador.distanciaLevenshtein(token, word) <= 1) {
                            score += 10;
                            break;
                        }
                    }
                }
            });

            if (score > 0) {
                resultadosProd.push({ ...p, score: score });
                mapaRefs.add(p.ref);
            }
        });

        let resultadosFiltros = [];
        Buscador.filtrosUnicos.forEach(f => {
            const nVal = getNorm(f.valor);
            let score = 0;
            
            if (nVal === valLimpio) score += 100;
            else if (nVal.includes(valLimpio)) score += 60;

            tokens.forEach(token => {
                if (nVal.includes(token)) score += 30;
                if (token.length > 3) {
                    const words = nVal.split(/\s+/);
                    for (let w of words) {
                        if (w.length > 3 && Buscador.distanciaLevenshtein(token, w) <= 1) {
                            score += 15;
                            break;
                        }
                    }
                }
            });

            if (score > 0) {
                resultadosFiltros.push({ ...f, score: score });
            }
        });

        return {
            productos: resultadosProd.sort((a, b) => b.score - a.score).slice(0, 5),
            filtros: resultadosFiltros.sort((a, b) => b.score - a.score).slice(0, 3)
        };
    },

    renderSugerencias: (resultadosObj, termino) => {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        const { productos, filtros } = resultadosObj;

        if (termino.length < 2 && Buscador.historial.length > 0) {
            container.innerHTML = `<div style="padding: 10px 15px; font-size: 0.8rem; color: var(--color-gray-dark); background: #f9f9f9; border-bottom: 1px solid #eee;">Búsquedas recientes</div>`;
            Buscador.historial.forEach(h => {
                container.innerHTML += `<div class="sug-historial" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="document.getElementById('searchInput').value='${h}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));"><i class="fas fa-history" style="color: var(--color-gray-medium);"></i> ${h}</div>`;
            });
            container.style.display = 'flex';
            return;
        }

        let listaProd = productos || [];

        if ((!productos || productos.length === 0) && (!filtros || filtros.length === 0) && termino.length >= 2) {
            container.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--color-gray-dark); font-size: 0.85rem;">No encontramos coincidencias para "${termino}". ¿Quizás te interese esto?</div>`;
            listaProd = [...Buscador.productosBD].sort(() => 0.5 - Math.random()).slice(0, 4);
        }

        if (filtros && filtros.length > 0) {
            filtros.forEach(f => {
                container.innerHTML += `
                    <div style="display: flex; align-items: center; gap: 15px; padding: 10px 15px; border-bottom: 1px solid var(--color-gray-light); cursor: pointer; transition: background 0.2s; background: #fafafa;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='#fafafa'" onclick="Buscador.guardarHistorial('${f.valor}'); window.location.href='/catalogo/?q=${encodeURIComponent(f.valor)}'">
                        <div style="width: 40px; height: 40px; border-radius: 5px; background: var(--color-pink); display: flex; align-items: center; justify-content: center; color: white;">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 0.95rem; color: var(--color-black);">Explorar ${f.valor}</div>
                            <div style="font-size: 0.75rem; color: var(--color-gray-dark);">Filtro: ${f.tipo}</div>
                        </div>
                        <i class="fas fa-arrow-right" style="color: var(--color-gray-medium); font-size: 0.8rem;"></i>
                    </div>
                `;
            });
        }

        listaProd.forEach(r => {
            const precioBase = r['*precio_base'] || r.precio_base || r.precio || 0;
            const precio = typeof Utils !== 'undefined' ? Utils.formatCurrency(precioBase) : '$' + precioBase;
            
            // --- ENLACE DINÁMICO DE IMÁGENES (Igual que en catalogo.js) ---
            let imgUrlFinal = '/assets/logo.png';
            if (r.imagenurl && String(r.imagenurl).trim() !== '') {
                let rawPath = String(r.imagenurl).split('|')[0].trim();
                
                if (rawPath.includes('drive.google.com')) {
                    const match = rawPath.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
                    }
                } else if (rawPath.startsWith('http')) {
                    imgUrlFinal = rawPath;
                } else {
                    imgUrlFinal = `https://raw.githubusercontent.com/dianiluz/cupissa/main/${rawPath.replace(/^\//, '')}`;
                }
            }
            
            container.innerHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 10px 15px; border-bottom: 1px solid var(--color-gray-light); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='white'" onclick="Buscador.guardarHistorial('${termino}'); window.location.href='/catalogo/?ref=${r.ref}'">
                    <img src="${imgUrlFinal}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;" onerror="this.src='/assets/logo.png'">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${r.nombre}</div>
                        <div style="font-size: 0.75rem; color: var(--color-gray-dark);">${r.categoria || ''}</div>
                    </div>
                    <div style="color: var(--color-pink); font-weight: bold; font-size: 0.9rem;">${precio}</div>
                </div>
            `;
        });
        
        if(listaProd.length > 0 || (filtros && filtros.length > 0)) {
            container.innerHTML += `<div style="padding: 10px; text-align: center; background: var(--color-gray-light); cursor: pointer; font-size: 0.85rem; font-weight: bold;" onclick="Buscador.guardarHistorial('${termino}'); window.location.href='/catalogo/?q=${encodeURIComponent(termino)}'">Ver todos los resultados para "${termino}"</div>`;
        }
        
        container.style.display = 'flex';
    },

    bindEvents: () => {
        const input = document.getElementById('searchInput');
        const container = document.getElementById('searchSuggestions');
        const btnVoz = document.getElementById('btnVoz');

        if (!input) return;

        input.addEventListener('input', (e) => {
            const termino = e.target.value.trim();
            if (termino.length === 0) {
                Buscador.renderSugerencias({ productos: [], filtros: [] }, '');
            } else {
                const resultados = Buscador.buscar(termino);
                Buscador.renderSugerencias(resultados, termino);
            }
        });

        input.addEventListener('focus', () => {
            if (input.value.trim().length === 0 && Buscador.historial.length > 0) {
                Buscador.renderSugerencias({ productos: [], filtros: [] }, '');
            } else if (input.value.trim().length >= 2) {
                container.style.display = 'flex';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container') && container) {
                container.style.display = 'none';
            }
        });

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-CO';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            btnVoz.addEventListener('click', () => {
                recognition.start();
                btnVoz.style.color = "red";
                input.placeholder = "Escuchando...";
            });

            recognition.onresult = (event) => {
                const transcripcion = event.results[0][0].transcript;
                input.value = transcripcion;
                input.dispatchEvent(new Event('input'));
            };

            recognition.onspeechend = () => {
                recognition.stop();
                btnVoz.style.color = "var(--color-pink)";
                input.placeholder = "Buscar productos, referencias, categorías...";
            };

            recognition.onerror = () => {
                btnVoz.style.color = "var(--color-pink)";
                input.placeholder = "Buscar productos...";
                if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast('No pudimos entender el audio.', 'error');
            };
        } else {
            if(btnVoz) btnVoz.style.display = 'none';
        }
    }
};