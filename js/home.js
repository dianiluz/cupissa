/* js/home.js */
const MOCKUPS = ["/assets/mockups/camiseta.png", "/assets/mockups/buzo.png", "/assets/mockups/tula.png", "/assets/mockups/bolsa.png", "/assets/mockups/almohada.png", "/assets/mockups/bandera.png", "/assets/mockups/taza.png", "/assets/mockups/mameluco.png"];

const Home = {
    mockupIndex: 2, 
    productosBase: [],
    variacionesDB: [],

    esperarSupabase: async () => {
        let intentos = 0;
        while (!window.db && intentos < 30) {
            // Intento de emergencia: si Supabase existe pero no se ha iniciado la DB
            if (typeof window.supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
                window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
                break;
            }
            await new Promise(r => setTimeout(r, 400));
            intentos++;
        }
    },

    init: async () => {
        Home.activarEfectosVisuales();
        try {
            await Home.esperarSupabase();
            if (!window.db) return console.error("Home: Supabase sigue sin responder.");

            const { data: prodData } = await window.db.from('productos').select('*');
            const { data: varData } = await window.db.from('variaciones').select('*');

            Home.variacionesDB = varData || [];
            Home.productosBase = (prodData || []).filter(p => (p.activo || p['*activo'] || 'NO').toUpperCase().trim() === 'SI');

            if (Home.productosBase.length > 0) {
                Home.renderMundos(Home.productosBase);
                Home.renderCategorias(Home.productosBase);
                Home.renderTemporada(Home.productosBase);
            }
        } catch (error) { console.error("Error Home:", error); }
    },

    /* js/home.js - Sección de Efectos Visuales */
activarEfectosVisuales: () => {
    // 1. Cintas (Ribbons)
    const tracks = document.querySelectorAll('.ribbon-track');
    tracks.forEach((t, i) => {
        t.innerHTML += t.innerHTML; 
        t.style.animation = (i % 2 === 0) ? "marqueeLeft 30s linear infinite" : "marqueeRight 30s linear infinite";
    });

    // 2. Animación de Mockups (FLIP)
    const rot = document.getElementById('mockupRotator');
    const frontImg = document.getElementById('mockupFront');
    const backImg = document.getElementById('mockupBack');

    if(rot && frontImg && backImg) {
        setInterval(() => {
            rot.classList.toggle('flipped');
            
            // Esperamos a que la cara no visible cambie su imagen
            setTimeout(() => {
                const isFlipped = rot.classList.contains('flipped');
                const nextImg = MOCKUPS[Home.mockupIndex];
                
                // Si está flipped, la cara que NO se ve es la Front, ahí cargamos la siguiente
                if (isFlipped) {
                    frontImg.src = nextImg;
                } else {
                    backImg.src = nextImg;
                }
                Home.mockupIndex = (Home.mockupIndex + 1) % MOCKUPS.length;
            }, 1000); // Se cambia la imagen justo a mitad de la vuelta
        }, 3500);
    }
},

    renderMundos: (prods) => {
        const cont = document.getElementById('homeMundos');
        if(!cont) return;
        const mundos = [...new Set(prods.map(p => p.mundo || p.Mundo).filter(m => m))];
        cont.innerHTML = mundos.map(m => `
            <div class="why-card fade-in" style="cursor:pointer; text-align:center; border:1.5px solid #eee; border-radius:15px; padding:20px;" onclick="window.location.href='/catalogo/?mundo=${encodeURIComponent(m)}'">
                <h3 style="color:var(--color-pink); font-family:'Bree Serif'; font-size:1.3rem; margin:0;">${m}</h3>
                <p style="font-size:0.7rem; font-weight:700; color:#ccc; margin-top:10px; letter-spacing:1px;">EXPLORAR</p>
            </div>`).join('');
    },

    renderCategorias: (prods) => {
        const cont = document.getElementById('homeCategorias');
        if(!cont) return;
        const cats = [...new Set(prods.map(p => p.categoria || p.Categoria).filter(c => c))].slice(0, 12);
        cont.innerHTML = cats.map(c => `
            <div class="categoria-item-wrapper fade-in" style="flex:0 0 auto; display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.href='/catalogo/?cat=${encodeURIComponent(c)}'">
                <div class="categoria-circulo" style="width:75px; height:75px; border-radius:50%; border:2.5px solid var(--color-pink); display:flex; align-items:center; justify-content:center; background:white;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--color-pink); font-size:1.4rem;"></i>
                </div>
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">${c}</span>
            </div>`).join('');
    },

    renderTemporada: (prods) => {
        const cont = document.getElementById('homeTemporada');
        const tit = document.getElementById('temporadaTitulo');
        if(!cont || !tit) return;

        const dest = prods.filter(p => (p.x_temp || p['*x_temp'] || '').toUpperCase().trim() === 'X');
        if (dest.length > 0) {
            const nomT = dest[0].temporada || dest[0]['*temporada'] || "Especial";
            tit.innerHTML = `DESTACADOS DE <span style="color:var(--color-pink)">${nomT.toUpperCase()}</span>`;
            
            cont.innerHTML = dest.map(p => {
                const ref = p.ref || p.referencia;
                const base = Utils.safeNumber(p.precio_base || p['*precio_base']);
                const vendidos = Math.floor(Math.random() * 20) + 15;
                const viendo = Math.floor(Math.random() * 10) + 5;

                return `
                <div class="product-card fade-in">
                    <div style="position:relative; overflow:hidden;">
                        <img src="${p.imagenurl}" class="product-image" onclick="ModalProducto.open('${ref}')" onerror="this.src='/assets/logo.png'">
                        <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                            <span id="h-cupi-${ref}" style="background:var(--color-pink); color:white; font-size:0.7rem; padding:4px 12px; border-radius:20px; font-weight:bold;">Cargando CupiCoins...</span>
                        </div>
                    </div>
                    <div class="product-info" style="padding:15px;">
                        <h3 class="product-title" style="font-size:1rem; margin-bottom:5px; font-weight:700;">${p.producto || p.nombre}</h3>
                        <div style="font-size:0.75rem; color:var(--color-success); margin-bottom:10px; font-weight:600;">
                            🔥 ${vendidos}+ vendidos | 👁️ ${viendo} viendo
                        </div>
                        <div style="border-top:1px solid #eee; padding-top:10px; margin-top:auto;">
                            <div id="h-total-${ref}" style="color:var(--color-success); font-weight:bold; font-size:1.1rem;">$ ---</div>
                            <div id="h-ant-${ref}" style="color:var(--color-gray-dark); font-size:0.8rem;">Anticipo: ---</div>
                        </div>
                        <button class="btn-add-direct" onclick="window.location.href='/catalogo/?q=${encodeURIComponent(nomT)}'" style="width:100%; margin-top:12px;">Ver más productos</button>
                    </div>
                </div>`;
            }).join('');
            dest.forEach(p => Home.calcularPrecioDestacado(p));
        }
    },

    calcularPrecioDestacado: (p) => {
        const ref = p.ref || p.referencia;
        let base = Utils.safeNumber(p.precio_base || p['*precio_base']);
        let inc = 0;
        const ids = String(p.variaciones_ids || "").replace(/[\[\]"']/g, '').split(/[|,]/).map(id => id.trim());
        const reglas = Home.variacionesDB.filter(v => ids.includes(String(v.id)));
        
        reglas.forEach(r => {
            const cols = String(r.columna).split('|').map(c => Utils.normalizeStr(c.replace(/[*#]/g, '')));
            const vals = String(r.valor).split('|').map(v => Utils.normalizeStr(v));
            let cumple = true;
            for (let i = 0; i < cols.length; i++) {
                if (Utils.normalizeStr(String(p[cols[i]] || '')) !== vals[i]) { cumple = false; break; }
            }
            if (cumple) inc += Utils.safeNumber(r.incremento);
        });

        const tot = base + inc;
        if(document.getElementById(`h-total-${ref}`)) document.getElementById(`h-total-${ref}`).innerText = Utils.formatCurrency(tot);
        if(document.getElementById(`h-ant-${ref}`)) document.getElementById(`h-ant-${ref}`).innerText = `Anticipo (20%): ${Utils.formatCurrency(tot * 0.20)}`;
        if(document.getElementById(`h-cupi-${ref}`)) document.getElementById(`h-cupi-${ref}`).innerText = `Otorga ${Math.floor(tot/1000)*5} CupiCoins`;
    }
};
document.addEventListener('DOMContentLoaded', Home.init);