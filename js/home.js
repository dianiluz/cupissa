/* ===================================================== */
/* CUPISSA — LÓGICA DE LA PÁGINA DE INICIO */
/* ===================================================== */

const Home = {
    init: async () => {
        try {
            const data = await Utils.fetchSheetData(CONFIG.gids.PRODUCTOS);
            const productosActivos = data.filter(p => p['*activo'] && p['*activo'].toUpperCase().trim() === 'SI');
            
            Home.renderMundos(productosActivos);
            Home.renderCategorias(productosActivos);
            Home.renderTemporada(productosActivos);
        } catch (error) {
            console.error("Error cargando inicio");
        }
    },

    renderMundos: (productos) => {
        const container = document.getElementById('homeMundos');
        if(!container) return;
        
        const mundos = [...new Set(productos.map(p => p.mundo).filter(m => m && m.trim() !== ''))];
        container.innerHTML = mundos.map(mundo => `
            <div class="product-card fade-in" style="padding: 2rem; text-align: center; cursor: pointer;" onclick="window.location.href='/catalogo/'">
                <h3 style="color: var(--color-pink); text-transform: uppercase;">${mundo}</h3>
                <p style="font-size: 0.9rem; color: var(--color-gray-dark);">Ver colección</p>
            </div>
        `).join('');
    },

    renderCategorias: (productos) => {
        const container = document.getElementById('homeCategorias');
        if(!container) return;

        const categorias = [...new Set(productos.map(p => p.categoría).filter(c => c && c.trim() !== ''))];
        container.innerHTML = categorias.map(cat => `
            <div class="product-card fade-in" style="min-width: 200px; padding: 1.5rem; text-align: center; cursor: pointer; flex-shrink: 0;" onclick="window.location.href='/catalogo/'">
                <h3 style="font-size: 1.1rem; color: var(--color-black);">${cat}</h3>
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
                const precioBaseFmt = Utils.formatCurrency(p['*precio_base']);
                return `
                    <div class="product-card fade-in" onclick="window.location.href='/catalogo/'" style="cursor: pointer;">
                        <img src="${p.imagenurl}" alt="${p.nombre}" class="product-image" onerror="this.src='/assets/logo.png'">
                        <div class="product-info">
                            <div class="product-title">${p.nombre}</div>
                            <div class="product-price">${precioBaseFmt}</div>
                            <button class="btn-add-modal" style="margin-top:10px;">Comprar</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            titulo.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', Home.init);