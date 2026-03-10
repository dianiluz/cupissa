/* ===================================================== */
/* CUPISSA — LÓGICA DE LA PÁGINA DE INICIO */
/* ===================================================== */

const MOCKUPS = [
    "/assets/mockups/camiseta.png",
    "/assets/mockups/buzo.png",
    "/assets/mockups/tula.png",
    "/assets/mockups/bolsa.png",
    "/assets/mockups/almohada.png",
    "/assets/mockups/bandera.png",
    "/assets/mockups/taza.png",
    "/assets/mockups/mameluco.png"
];

const Home = {
    mockupIndex: 2, // Inicia en 2 porque 0 y 1 ya están en el HTML inicial

    init: async () => {
        // 1. Animaciones de las Cintas y el Hero
        Home.activarEfectosVisuales();

        try {
            const res = await Utils.fetchFromBackend('obtenerCatalogoBase');
            let productos = res.success ? res.productos : [];
            
            // Filtro para productos activos
            let productosActivos = productos.filter(p => p['*activo'] && String(p['*activo']).toUpperCase().trim() === 'SI');
            
            if (productosActivos.length > 0) {
                Home.renderMundos(productosActivos);
                Home.renderCategorias(productosActivos);
                Home.renderTemporada(productosActivos);
            }
        } catch (error) {
            console.error("Error en Home.init", error);
        }
    },

    activarEfectosVisuales: () => {
        // Cintas: Duplicamos contenido para que no se vean mochas
        const tracks = document.querySelectorAll('.ribbon-track');
        tracks.forEach((track, index) => {
            track.innerHTML += track.innerHTML; 
            track.style.animation = (index % 2 === 0) 
                ? "marqueeLeft 30s linear infinite" 
                : "marqueeRight 30s linear infinite";
        });

        // Rotación de Mockup Hero (Uno por uno)
        const rotator = document.getElementById('mockupRotator');
        const imgFront = document.getElementById('mockupFront');
        const imgBack = document.getElementById('mockupBack');

        if(rotator && imgFront && imgBack) {
            setInterval(() => {
                rotator.classList.toggle('flipped');
                
                // Cambio de imagen en la cara oculta (después de 1s de giro)
                setTimeout(() => {
                    const isFlipped = rotator.classList.contains('flipped');
                    const nextImg = MOCKUPS[Home.mockupIndex];

                    if (isFlipped) {
                        // Si está volteado, la cara Frontal está oculta
                        imgFront.src = nextImg;
                    } else {
                        // Si no está volteado, la cara Trasera está oculta
                        imgBack.src = nextImg;
                    }

                    Home.mockupIndex = (Home.mockupIndex + 1) % MOCKUPS.length;
                }, 1000); 
            }, 3500);
        }
    },

    renderMundos: (productos) => {
        const container = document.getElementById('homeMundos');
        if(!container) return;
        
        const mundos = [...new Set(productos.map(p => p.mundo).filter(m => m && m.trim() !== ''))];
        container.innerHTML = mundos.map(mundo => `
            <div class="why-card fade-in" style="cursor: pointer; text-align: center;" onclick="window.location.href='/catalogo/?mundo=${encodeURIComponent(mundo)}'">
                <h3 style="color: var(--color-pink); font-family: 'Bree Serif'; font-size: 1.3rem;">${mundo}</h3>
                <p style="font-size: 0.8rem; margin-top: 10px; font-weight: 600;">EXPLORAR</p>
            </div>
        `).join('');
    },

    renderCategorias: (productos) => {
        const container = document.getElementById('homeCategorias');
        if(!container) return;

        const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c && c.trim() !== ''))].slice(0, 12);
        container.innerHTML = categorias.map(cat => `
            <div class="categoria-item-wrapper fade-in" style="flex:0 0 auto; display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.href='/catalogo/?cat=${encodeURIComponent(cat)}'">
                <div class="categoria-circulo" style="width:85px; height:85px; border-radius:50%; border:3px solid var(--color-pink); display:flex; align-items:center; justify-content:center; background:white;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--color-pink); font-size:1.5rem;"></i>
                </div>
                <span style="font-size:0.8rem; font-weight:600;">${cat}</span>
            </div>
        `).join('');
    },

    renderTemporada: (productos) => {
        const container = document.getElementById('homeTemporada');
        const titulo = document.getElementById('temporadaTitulo');
        if(!container || !titulo) return;

        const destacados = productos.filter(p => p['*x_temp'] && p['*x_temp'].toUpperCase().trim() === 'X');
        
        if (destacados.length > 0) {
            titulo.innerText = destacados[0]['*temporada'] || "Destacados";
            
            container.innerHTML = destacados.map(p => {
                const precioBase = Utils.safeNumber(p['*precio_base']);
                const cupicoins = Math.floor(precioBase / 1000) * 5;
                const nombreProducto = p.producto || p.nombre || "Producto Cupissa";

                return `
                    <div class="product-card fade-in" onclick="window.location.href='/catalogo/?ref=${p.ref}'" style="cursor: pointer;">
                        <div style="position:relative;">
                            <img src="${p.imagenurl}" alt="${nombreProducto}" class="product-image" onerror="this.src='/assets/logo.png'">
                            <div style="position:absolute; bottom:10px; left:0; width:100%; text-align:center;">
                                <span style="background:var(--color-pink); color:white; font-size:0.75rem; padding:3px 10px; border-radius:15px; font-weight:bold;">Otórga ${cupicoins} CupiCoins</span>
                            </div>
                        </div>
                        <div class="product-info" style="padding:15px;">
                            <div class="product-title" style="font-weight:600;">${nombreProducto}</div>
                            <div style="margin-top:10px;">
                                <div style="text-decoration:line-through; color:var(--color-gray-medium); font-size:0.75rem;">${Utils.formatCurrency(precioBase)}</div>
                                <div class="product-price" style="color:var(--color-black); font-weight:700;">Desde ${Utils.formatCurrency(precioBase * 0.20)}</div>
                            </div>
                            <button class="btn-add-direct" style="width:100%; margin-top:10px; padding:10px; background:var(--color-pink); color:white; border:none; border-radius:8px; font-weight:bold;">Ver opciones</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
};

document.addEventListener('DOMContentLoaded', Home.init);