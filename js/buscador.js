/* ===================================================== */
/* CUPISSA — BUSCADOR INTELIGENTE (VOZ, FUZZY, HISTORIAL)*/
/* ===================================================== */

const Buscador = {
    productosBD: [],
    historial: [],

    init: async () => {
        Buscador.cargarHistorial();
        Buscador.crearInterfaz();
        
        try {
            const resProd = await Utils.fetchFromBackend('obtenerProductos');
            Buscador.productosBD = resProd.success ? resProd.data.filter(p => p['*activo'] && p['*activo'].toUpperCase().trim() === 'SI') : DEMO_PRODUCTS;
        } catch (e) {
            Buscador.productosBD = DEMO_PRODUCTS;
        }
        
        Buscador.bindEvents();
    },

    crearInterfaz: () => {
        const nav = document.querySelector('.header-nav');
        if (!nav) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.cssText = 'position: relative; display: flex; align-items: center; background: var(--color-gray-light); border-radius: var(--radius-xl); padding: 5px 15px; flex: 1; margin: 0 20px;';

        searchContainer.innerHTML = `
            <i class="fas fa-search" style="color: var(--color-gray-dark);"></i>
            <input type="text" id="searchInput" placeholder="Buscar productos, referencias, temáticas..." style="border: none; background: transparent; padding: 8px 10px; width: 100%; outline: none; font-family: var(--font-primary);">
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
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    },

    buscar: (termino) => {
        const valLimpio = Utils.normalizeStr(termino);
        if (valLimpio.length < 2) return [];

        let resultados = [];
        let mapaRefs = new Set();

        Buscador.productosBD.forEach(p => {
            if(mapaRefs.has(p.ref)) return;

            const nNombre = Utils.normalizeStr(p.nombre || '');
            const nRef = Utils.normalizeStr(p.ref || '');
            const nCat = Utils.normalizeStr(p.categoria || '');
            const nSub = Utils.normalizeStr(p.subcategoria || '');
            const nTem = Utils.normalizeStr(p.tematica || '');

            if (nNombre.includes(valLimpio) || nRef.includes(valLimpio) || nCat.includes(valLimpio) || nSub.includes(valLimpio) || nTem.includes(valLimpio)) {
                resultados.push({ ...p, score: 0 });
                mapaRefs.add(p.ref);
                return;
            }

            const palabrasNombre = nNombre.split(' ');
            for (let palabra of palabrasNombre) {
                if (palabra.length > 3 && Buscador.distanciaLevenshtein(valLimpio, palabra) <= 2) {
                    resultados.push({ ...p, score: 1 });
                    mapaRefs.add(p.ref);
                    break;
                }
            }
        });

        return resultados.sort((a, b) => a.score - b.score).slice(0, 8);
    },

    renderSugerencias: (resultados, termino) => {
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = '';
        
        if (termino.length < 2 && Buscador.historial.length > 0) {
            container.innerHTML = `<div style="padding: 10px 15px; font-size: 0.8rem; color: var(--color-gray-dark); background: #f9f9f9; border-bottom: 1px solid #eee;">Búsquedas recientes</div>`;
            Buscador.historial.forEach(h => {
                container.innerHTML += `<div class="sug-historial" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="document.getElementById('searchInput').value='${h}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));"><i class="fas fa-history" style="color: var(--color-gray-medium);"></i> ${h}</div>`;
            });
            container.style.display = 'flex';
            return;
        }

        if (resultados.length === 0 && termino.length >= 2) {
            container.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--color-gray-dark);">No encontramos "${termino}". Revisa la ortografía.</div>`;
            container.style.display = 'flex';
            return;
        }

        resultados.forEach(r => {
            const precio = Utils.formatCurrency(r['*precio_base']);
            container.innerHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 10px 15px; border-bottom: 1px solid var(--color-gray-light); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='white'" onclick="Buscador.guardarHistorial('${termino}'); window.location.href='/catalogo/?ref=${r.ref}'">
                    <img src="${r.imagenurl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${r.nombre}</div>
                        <div style="font-size: 0.75rem; color: var(--color-gray-dark);">${r.categoria}</div>
                    </div>
                    <div style="color: var(--color-pink); font-weight: bold; font-size: 0.9rem;">${precio}</div>
                </div>
            `;
        });
        
        if(resultados.length > 0) {
            container.innerHTML += `<div style="padding: 10px; text-align: center; background: var(--color-gray-light); cursor: pointer; font-size: 0.85rem; font-weight: bold;" onclick="Buscador.guardarHistorial('${termino}'); window.location.href='/catalogo/?q=${encodeURIComponent(termino)}'">Ver todos los resultados</div>`;
        }
        
        container.style.display = 'flex';
    },

    bindEvents: () => {
        const input = document.getElementById('searchInput');
        const container = document.getElementById('searchSuggestions');
        const btnVoz = document.getElementById('btnVoz');

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
            if (!e.target.closest('.search-container')) {
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
                input.placeholder = "Buscar productos, referencias, temáticas...";
            };

            recognition.onerror = () => {
                btnVoz.style.color = "var(--color-pink)";
                input.placeholder = "Buscar productos, referencias, temáticas...";
                Utils.toast('No pudimos entender el audio.', 'error');
            };
        } else {
            btnVoz.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', Buscador.init);