/* js/buscador.js */
/* ===================================================== */
/* CUPISSA — BUSCADOR INTELIGENTE (VOZ, FUZZY, HISTORIAL)*/
/* ===================================================== */

const Buscador = {
    productosBD: [],
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
            // Se usa el mismo endpoint robusto del catálogo
            const resProd = await (typeof Utils !== 'undefined' ? Utils.fetchFromBackend('obtenerCatalogoBase') : Promise.reject('No Utils'));
            if (resProd && resProd.success && resProd.productos) {
                Buscador.productosBD = resProd.productos.filter(p => {
                    const estado = p['*activ'] || p['*activo'] || p['activo'] || p['Activo'] || 'NO';
                    return String(estado).toUpperCase().trim() === 'SI';
                });
            }
        } catch (e) {
            console.error("Buscador usando productos en caché/demo.");
        }

        // Carga de seguridad para evitar que el buscador quede inoperativo
        if (!Buscador.productosBD || Buscador.productosBD.length === 0) {
            Buscador.productosBD = typeof DEMO_PRODUCTS_CATALOG !== 'undefined' ? DEMO_PRODUCTS_CATALOG : [
                { ref: 'DEMO001', nombre: 'Mameluco Personalizado', imagenurl: '/assets/mockups/mameluco.png', '*precio_base': 35000, mundo: 'MUNDO TEXTIL', categoria: 'BEBÉS' },
                { ref: 'DEMO002', nombre: 'Camiseta Oversize', imagenurl: '/assets/mockups/camiseta.png', '*precio_base': 45000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS' },
                { ref: 'DEMO003', nombre: 'Taza Mágica', imagenurl: '/assets/mockups/taza.png', '*precio_base': 25000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS' },
                { ref: 'DEMO004', nombre: 'Buzo Capota', imagenurl: '/assets/mockups/buzo.png', '*precio_base': 75000, mundo: 'MUNDO CREATIVO', categoria: 'PRODUCTOS PERSONALIZADOS' }
            ];
        }
        
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
            
            <div id="searchSuggestions" style="display: none; position: absolute; top: 110%; left: 0; width: 100%; background: var(--color-white); box-shadow: var(--shadow-md); border-radius: var(--radius-md); max-height: 400px; overflow-y: auto; z-index: 2000; flex-direction: column;">
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
        if (valLimpio.length < 2) return [];

        const stopWords = ['de', 'la', 'el', 'las', 'los', 'en', 'para', 'con', 'y', 'un', 'una', 'unos', 'unas'];
        const tokens = valLimpio.split(/\s+/).filter(t => t.length > 1 && !stopWords.includes(t));
        if (tokens.length === 0) tokens.push(valLimpio);

        let resultados = [];
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

            // Prioridad 1: Coincidencias exactas
            if (nRef === valLimpio) score += 100;
            if (nNombre === valLimpio) score += 90;
            if (nNombre.includes(valLimpio)) score += 70;
            
            // Prioridad 2: Coincidencias completas de Categorías o Mundos
            if (nCat === valLimpio || nSub === valLimpio || nTem === valLimpio || nMundo === valLimpio) score += 80;
            if (nCat.includes(valLimpio) || nSub.includes(valLimpio) || nTem.includes(valLimpio) || nMundo.includes(valLimpio)) score += 50;

            // Prioridad 3: Análisis de tokens por separaciones y errores ortográficos
            tokens.forEach(token => {
                if (nRef.includes(token)) score += 30;
                if (nNombre.includes(token)) score += 20;
                if (nCat.includes(token) || nSub.includes(token) || nTem.includes(token) || nMundo.includes(token)) score += 15;

                if (token.length > 3) {
                    const allWords = `${nNombre} ${nCat} ${nSub} ${nTem} ${nMundo}`.split(/\s+/);
                    for (let word of allWords) {
                        if (word.length > 3) {
                            const dist = Buscador.distanciaLevenshtein(token, word);
                            if (dist === 1) {
                                score += 10;
                                break;
                            } else if (dist === 2 && token.length > 5) {
                                score += 5;
                                break;
                            }
                        }
                    }
                }
            });

            if (score > 0) {
                resultados.push({ ...p, score: score });
                mapaRefs.add(p.ref);
            }
        });

        return resultados.sort((a, b) => b.score - a.score).slice(0, 8);
    },

    renderSugerencias: (resultados, termino) => {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (termino.length < 2 && Buscador.historial.length > 0) {
            container.innerHTML = `<div style="padding: 10px 15px; font-size: 0.8rem; color: var(--color-gray-dark); background: #f9f9f9; border-bottom: 1px solid #eee;">Búsquedas recientes</div>`;
            Buscador.historial.forEach(h => {
                container.innerHTML += `<div class="sug-historial" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="document.getElementById('searchInput').value='${h}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));"><i class="fas fa-history" style="color: var(--color-gray-medium);"></i> ${h}</div>`;
            });
            container.style.display = 'flex';
            return;
        }

        let listaMostrar = resultados;

        // Fallback robusto visual para cuando realmente no hay ningún match ortográfico o numérico
        if (resultados.length === 0 && termino.length >= 2) {
            container.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--color-gray-dark); font-size: 0.85rem;">No encontramos coincidencias exactas para "${termino}". ¿Quizás te interese esto?</div>`;
            listaMostrar = [...Buscador.productosBD].sort(() => 0.5 - Math.random()).slice(0, 4);
        }

        listaMostrar.forEach(r => {
            const precioBase = r['*precio_base'] || r.precio_base || r.precio || 0;
            const precio = typeof Utils !== 'undefined' ? Utils.formatCurrency(precioBase) : '$' + precioBase;
            
            let imgUrlFinal = '/assets/logo.png';
            if (r.imagenurl && String(r.imagenurl).trim() !== '') {
                imgUrlFinal = String(r.imagenurl).split('|')[0].trim();
                if (imgUrlFinal.includes('drive.google.com')) {
                    const match = imgUrlFinal.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
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
        
        if(resultados.length > 0) {
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
                Buscador.renderSugerencias([], '');
            } else {
                const resultados = Buscador.buscar(termino);
                Buscador.renderSugerencias(resultados, termino);
            }
        });

        input.addEventListener('focus', () => {
            if (input.value.trim().length === 0 && Buscador.historial.length > 0) {
                Buscador.renderSugerencias([], '');
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