/* ===================================================== */
/* CUPISSA — LÓGICA DEL PANEL (ROLES) */
/* ===================================================== */

const Panel = {
    user: null,

    init: (userData) => {
        Panel.user = userData;
        Panel.renderSidebar();
        Panel.loadView('resumen');
    },

    renderSidebar: () => {
        document.getElementById('panelUserName').innerText = Panel.user.nombre;
        document.getElementById('panelUserRole').innerText = Panel.user.tipo_usuario;
        document.getElementById('panelAvatar').innerText = Panel.user.nombre.charAt(0).toUpperCase();

        const nav = document.getElementById('panelNav');
        let html = '';

        // Vistas comunes
        html += `<button class="panel-nav-btn" onclick="Panel.loadView('resumen')"><i class="fas fa-home"></i> Resumen</button>`;
        html += `<button class="panel-nav-btn" onclick="Panel.loadView('perfil')"><i class="fas fa-user-cog"></i> Mi Perfil</button>`;
        html += `<button class="panel-nav-btn" onclick="Panel.loadView('pedidos')"><i class="fas fa-box"></i> Mis Pedidos</button>`;

        // Vistas Vendedor
        if (Panel.user.tipo_usuario === 'VENDEDOR' || Panel.user.tipo_usuario === 'ADMIN') {
            html += `<button class="panel-nav-btn" onclick="Panel.loadView('clientes')"><i class="fas fa-users"></i> Clientes</button>`;
            html += `<button class="panel-nav-btn" onclick="Panel.loadView('comisiones')"><i class="fas fa-wallet"></i> Comisiones</button>`;
        }

        // Vistas Admin
        if (Panel.user.tipo_usuario === 'ADMIN') {
            html += `<button class="panel-nav-btn" onclick="Panel.loadView('productos')"><i class="fas fa-tags"></i> Productos</button>`;
            html += `<button class="panel-nav-btn" onclick="Panel.loadView('promos')"><i class="fas fa-bullhorn"></i> Promociones</button>`;
        }

        nav.innerHTML = html;
    },

    loadView: (viewName) => {
        const area = document.getElementById('panelContentArea');
        area.innerHTML = '<h2>Cargando...</h2>';

        // Quitar active de botones
        document.querySelectorAll('.panel-nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = Array.from(document.querySelectorAll('.panel-nav-btn')).find(b => b.innerText.toLowerCase().includes(viewName.toLowerCase()));
        if (activeBtn) activeBtn.classList.add('active');

        switch (viewName) {
            case 'resumen':
                Panel.renderResumen(area);
                break;
            case 'pedidos':
                Panel.renderPedidos(area);
                break;
            case 'perfil':
                Panel.renderPerfil(area);
                break;
            case 'comisiones':
                Panel.renderComisiones(area); // Lógica Vendedor
                break;
            default:
                area.innerHTML = `<h2>Vista ${viewName} en construcción</h2>`;
        }
    },

    renderResumen: async (area) => {
        area.innerHTML = `
            <div class="panel-header">
                <h1 class="panel-title">Hola, ${Panel.user.nombre.split(' ')[0]}</h1>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Puntos Acumulados</div>
                    <div class="stat-value" id="puntosValor">Consultando...</div>
                </div>
            </div>
        `;

        // Consultar puntos al backend
        try {
            const fd = new FormData();
            fd.append('action', 'obtenerPuntos');
            fd.append('email', Panel.user.email);
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
            document.getElementById('puntosValor').innerText = data.success ? data.puntos : 0;
        } catch (e) {
            document.getElementById('puntosValor').innerText = "0";
        }
    },

    renderPedidos: (area) => {
        area.innerHTML = `
            <div class="panel-header">
                <h1 class="panel-title">Historial de Pedidos</h1>
            </div>
            <div class="table-container">
                <p>Consultando pedidos...</p>
            </div>
        `;
        // Aquí se implementará la llamada a obtenerPedidosCliente / Vendedor
    },

    renderPerfil: (area) => {
        area.innerHTML = `
            <div class="panel-header">
                <h1 class="panel-title">Datos Personales</h1>
            </div>
            <div class="auth-card" style="max-width: 100%; text-align: left; padding: 2rem;">
                <p><strong>Cédula:</strong> ${Panel.user.cc || 'No registrada'}</p>
                <p><strong>Email:</strong> ${Panel.user.email}</p>
                <p><strong>Teléfono:</strong> ${Panel.user.telefono}</p>
                <p><strong>Dirección:</strong> ${Panel.user.direccion || 'No registrada'}</p>
                <p><strong>Ciudad:</strong> ${Panel.user.ciudad || 'No registrada'}</p>
            </div>
        `;
    },

    renderComisiones: (area) => {
        if (Panel.user.tipo_usuario !== 'VENDEDOR' && Panel.user.tipo_usuario !== 'ADMIN') return;
        area.innerHTML = `
            <div class="panel-header">
                <h1 class="panel-title">Mis Comisiones (10%)</h1>
            </div>
            <p>Se calculará el 10% sobre el subtotal de productos agendados.</p>
            <div class="table-container">En construcción...</div>
        `;
    }
};