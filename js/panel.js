/* ===================================================== */
/* CUPISSA — MI PANEL DEFINITIVO (CONEXIÓN DIRECTA BD)   */
/* ===================================================== */

const Panel = {
    user: null,
    billetera: 0,
    pedidos: [],
    promos: [],

    init: async () => {
        try {
            console.log("🚀 Iniciando Motor del Panel...");
            
            // 1. INICIALIZAR SUPABASE
            if (!window.db) {
                if (typeof window.supabase === 'undefined') throw new Error("Librería de Supabase no cargada.");
                window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
            }

            // 2. VERIFICAR SESIÓN
            const { data: { session }, error: sessionError } = await window.db.auth.getSession();
            if (sessionError || !session?.user) {
                localStorage.clear();
                return window.location.replace("/auth/");
            }

            const emailLogueado = session.user.email;

            // 3. SINCRONIZAR USUARIO (Tabla: usuarios)
            let { data: usuarioDB } = await window.db.from('usuarios').select('*').eq('email', emailLogueado).single();
            
            if (!usuarioDB) {
                // Si es nuevo, lo creamos
                const nuevoUsuario = {
                    email: emailLogueado,
                    nombre: session.user.user_metadata?.full_name || "Cliente Cupissa",
                    tipo_usuario: 'CLIENTE',
                    activo: 'SI',
                    nivel_cuenta: 'Cliente Cupissa'
                };
                const { data: insertado } = await window.db.from('usuarios').insert([nuevoUsuario]).select().single();
                usuarioDB = insertado || nuevoUsuario;
            }
            
            Panel.user = usuarioDB;
            localStorage.setItem('cupissa_user', JSON.stringify(Panel.user));

            // 4. DESCARGAR TODA LA DATA EN PARALELO (Súper rápido)
            await Promise.all([
                Panel.fetchBilletera(),
                Panel.fetchPedidos(),
                Panel.fetchPromos()
            ]);

            // 5. CONSTRUIR INTERFAZ
            Panel.construirApp();
            Panel.showTab('resumen');

        } catch (e) {
            console.error("❌ Error Crítico:", e);
            document.body.innerHTML = `<div style="padding:50px; text-align:center; color:red;"><h3>Error de conexión.</h3><p>${e.message}</p><button onclick="localStorage.clear(); window.location.replace('/auth/')">Volver al Login</button></div>`;
        }
    },

    // ==========================================
    // CONSULTAS DIRECTAS A SUPABASE
    // ==========================================
    fetchBilletera: async () => {
        const { data } = await window.db.from('billeteras').select('total').eq('email', Panel.user.email).single();
        Panel.billetera = data ? data.total : 0;
    },

    fetchPedidos: async () => {
        console.log("🔍 Buscando pedidos para:", Panel.user.email);
        
        // 1. Buscamos SOLO los pedidos primero (Consulta simple, cero errores)
        const { data: misPedidos, error: errPedidos } = await window.db.from('pedidos')
            .select('*')
            .eq('usuario_email', Panel.user.email)
            .order('fecha_creacion', { ascending: false });

        if (errPedidos) {
            console.error("❌ Error de Supabase al buscar pedidos:", errPedidos);
            return;
        }

        Panel.pedidos = misPedidos || [];

        // 2. Traemos las fotos de forma separada y las unimos a la fuerza
        if (Panel.pedidos.length > 0) {
            const idsPed = Panel.pedidos.map(p => p.idpedido);
            const { data: fotos } = await window.db.from('pedidos_productos')
                .select('*')
                .in('idpedido', idsPed);
            
            if (fotos) {
                Panel.pedidos.forEach(p => {
                    p.pedidos_productos = fotos.filter(f => f.idpedido === p.idpedido);
                });
            }
        }
        
        console.log("✅ Pedidos cargados con éxito:", Panel.pedidos.length);
    },
    fetchPromos: async () => {
        // Trae promos activas
        const { data } = await window.db.from('promociones').select('*').eq('activa', true);
        Panel.promos = data || [];
    },

    // ==========================================
    // CONSTRUCTOR DE LA INTERFAZ (DOM)
    // ==========================================
    construirApp: () => {
        const appContainer = document.getElementById("panelApp") || document.body;
        
        let insigniaColor = "#db137a";
        let nivel = Panel.user.nivel_cuenta || "Cliente Cupissa";
        if(nivel.toLowerCase().includes("plata")) insigniaColor = "#a6a6a6";
        if(nivel.toLowerCase().includes("oro")) insigniaColor = "#d4af37";

        appContainer.innerHTML = `
            <div class="panel-layout">
                <aside class="panel-sidebar">
                    <div class="user-profile-summary">
                        <div class="badge-nivel" style="background:${insigniaColor}; color:white; padding:5px 15px; border-radius:20px; font-size:0.75rem; font-weight:bold; display:inline-block; margin-bottom:10px;">
                            <i class="fas fa-gem"></i> ${nivel}
                        </div>
                        <h2 style="margin:0; font-family:'Bree Serif'; color:#333;">${Panel.user.nombre}</h2>
                    </div>

                    <nav class="panel-sidebar-menu">
                        <ul class="nav-app-mobile">
                            <li id="menu-resumen" onclick="Panel.showTab('resumen')" class="sidebar-btn active-tab">
                                <i class="fas fa-chart-pie"></i> <span>Resumen</span>
                            </li>
                            <li id="menu-pedidos" onclick="Panel.showTab('pedidos')" class="sidebar-btn">
                                <i class="fas fa-box-open"></i> <span>Pedidos</span>
                            </li>
                            <li id="menu-perfil" onclick="Panel.showTab('perfil')" class="sidebar-btn">
                                <i class="fas fa-user-edit"></i> <span>Perfil</span>
                            </li>
                        </ul>
                    </nav>

                    <div class="sidebar-actions">
                        <button onclick="alert('Descarga de App próximamente...')" class="btn-app-descargar"><i class="fab fa-google-play"></i> Descargar App</button>
                        <button onclick="window.location.reload(true)" class="btn-app-actualizar"><i class="fas fa-sync"></i> Actualizar App</button>
                        <button onclick="Panel.cerrarSesion()" class="btn-app-salir"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>
                    </div>
                </aside>

                <main class="panel-content" id="panelContentArea">
                    </main>
            </div>
        `;
    },

    showTab: (tab) => {
        // Manejo limpio de clases CSS en lugar de estilos en línea
        document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active-tab'));
        const activeBtn = document.getElementById("menu-" + tab);
        if(activeBtn) activeBtn.classList.add('active-tab');

        const area = document.getElementById("panelContentArea");
        if (tab === 'resumen') area.innerHTML = Panel.htmlResumen();
        if (tab === 'pedidos') area.innerHTML = Panel.htmlPedidos();
        if (tab === 'perfil') area.innerHTML = Panel.htmlPerfil();
    },

    // ==========================================
    // 1. VISTA: RESUMEN (AHORA CALCULA EL SALDO REAL)
    // ==========================================
    // ==========================================
    // 1. VISTA: RESUMEN (MATEMÁTICAS CORREGIDAS)
    // ==========================================
    htmlResumen: () => {
        const ultimoPedido = Panel.pedidos.length > 0 ? Panel.pedidos[0] : null;

        // 🧠 LÓGICA DE CUPICOINS: 1000 COP = 1 CC | 1 CC = 5 COP
        let sumEntregados = 0;
        Panel.pedidos.forEach(p => {
            const estadoActual = (CONFIG.estadosProduccion[p.estado]?.nombre || '').toUpperCase();
            if (estadoActual.includes('ENTREGADO') || p.estado === 5) { 
                sumEntregados += Number(p.total) || 0;
            }
        });

        // 1000 pesos en compra = 1 CupiCoin
        let cupicoinsReales = Math.floor(sumEntregados / 1000); 
        // 1 CupiCoin = 5 pesos
        let valorEnPesos = cupicoinsReales * 5; 
        
        // Si hay un saldo cargado manualmente en la billetera que sea mayor, lo respetamos.
        let saldoCupiCoins = Panel.billetera > cupicoinsReales ? Panel.billetera : cupicoinsReales;
        let saldoPesos = Panel.billetera > cupicoinsReales ? (Panel.billetera * 5) : valorEnPesos;

        return `
            <div class="fade-in">
                <h2 style="margin-top:0; color:#333; font-family:'Bree Serif', serif;">Hola, ${Panel.user.nombre.split(' ')[0]} 👋</h2>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:25px; margin-top:25px;">
                    <div style="background:linear-gradient(135deg, #db137a, #ff6b9e); color:white; padding:30px; border-radius:20px; text-align:center; box-shadow: 0 10px 25px rgba(219, 19, 122, 0.3); position:relative; overflow:hidden;">
                        <i class="fas fa-coins" style="position:absolute; top:-20px; right:-20px; font-size:8rem; opacity:0.1;"></i>
                        <h4 style="margin:0; opacity:0.9; font-weight:500;">Saldo CupiCoins</h4>
                        <h1 style="font-size:4.5rem; margin:5px 0; font-family:'Bree Serif', serif; text-shadow: 2px 2px 5px rgba(0,0,0,0.2); line-height:1;">${saldoCupiCoins}</h1>
                        <p style="margin:10px 0 0 0; font-size:0.95rem; font-weight:500; background:rgba(255,255,255,0.2); display:inline-block; padding:5px 15px; border-radius:20px;">
                            Equivale a ${Utils.formatCurrency(saldoPesos)}
                        </p>
                    </div>

                    <div style="background:white; border:1px solid #f0f0f0; padding:30px; border-radius:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:center;">
                        <h4 style="margin:0 0 15px 0; color:#888; text-transform:uppercase; font-size:0.8rem; letter-spacing:1px;"><i class="fas fa-box-open"></i> Último Pedido</h4>
                        ${ultimoPedido ? `
                            <h2 style="margin:0 0 5px 0; color:#db137a; font-family:'Bree Serif', serif; font-size:1.6rem;">#${ultimoPedido.idpedido}</h2>
                            <p style="margin:0 0 10px 0; color:#555; font-weight:500;">
                                <i class="fas fa-circle" style="font-size:8px; color:#db137a; vertical-align:middle;"></i> Estado: ${CONFIG.estadosProduccion[ultimoPedido.estado]?.nombre || 'Pendiente'}
                            </p>
                            <h3 style="margin:0; color:#333;">${Utils.formatCurrency(ultimoPedido.total)}</h3>
                            <button onclick="Panel.verDetallePedido('${ultimoPedido.idpedido}')" style="margin-top:20px; background:#fff0f6; color:#db137a; border:1px solid #db137a; font-weight:bold; padding:10px 15px; border-radius:8px; cursor:pointer; transition:0.3s; width:100%;">
                                Ver Detalles <i class="fas fa-arrow-right" style="margin-left:5px;"></i>
                            </button>
                        ` : `<div style="text-align:center; color:#aaa; padding:20px 0;"><i class="fas fa-shopping-bag fa-2x" style="margin-bottom:10px;"></i><p>Aún no tienes compras.</p></div>`}
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 2. VISTA: MIS PEDIDOS (ACTUALIZADA AL MODAL)
    // ==========================================
    htmlPedidos: () => {
        return `
            <div class="fade-in">
                <h2 style="margin-top:0; color:#333; font-family:'Bree Serif', serif;">Historial de Pedidos</h2>
                <div style="display:grid; gap:20px; margin-top:25px;">
                    ${Panel.pedidos.length > 0 ? Panel.pedidos.map(p => {
                        let estadoNombre = CONFIG.estadosProduccion[p.estado]?.nombre || 'Pendiente';
                        let bgBadge = "#f5f5f5"; let colorBadge = "#555"; let iconBadge = "fa-clock";

                        if(estadoNombre.toUpperCase().includes('ENTREGADO')) { bgBadge = '#d4edda'; colorBadge = '#155724'; iconBadge = 'fa-check-circle'; }
                        else if(estadoNombre.toUpperCase().includes('DISEÑO')) { bgBadge = '#cce5ff'; colorBadge = '#004085'; iconBadge = 'fa-paint-brush'; }
                        else if(estadoNombre.toUpperCase().includes('PRODUCCIÓN')) { bgBadge = '#fff3cd'; colorBadge = '#856404'; iconBadge = 'fa-cogs'; }
                        else if(estadoNombre.toUpperCase().includes('CANCELADO')) { bgBadge = '#f8d7da'; colorBadge = '#721c24'; iconBadge = 'fa-times-circle'; }

                        return `
                        <div style="background:white; border-radius:18px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.04); border:1px solid #f4f4f4; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.04)'">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #f0f0f0; padding-bottom:15px; margin-bottom:20px;">
                                <div>
                                    <h3 style="margin:0; color:#db137a; font-family:'Bree Serif', serif; font-size:1.3rem;">#${p.idpedido}</h3>
                                    <p style="margin:5px 0 0 0; font-size:0.85rem; color:#888;"><i class="far fa-calendar-alt"></i> ${new Date(p.fecha_creacion).toLocaleString()}</p>
                                </div>
                                <span style="background:${bgBadge}; color:${colorBadge}; padding:6px 14px; border-radius:20px; font-weight:bold; font-size:0.8rem; letter-spacing:0.5px; display:flex; align-items:center; gap:5px;">
                                    <i class="fas ${iconBadge}"></i> ${estadoNombre}
                                </span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                                <div>
                                    <p style="margin:0; font-size:0.85rem; color:#666; font-weight:500;">Total a pagar</p>
                                    <h3 style="margin:0; color:#333; font-size:1.5rem; font-weight:bold;">${Utils.formatCurrency(p.total)}</h3>
                                </div>
                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    <button onclick="Panel.verDetallePedido('${p.idpedido}')" style="padding:10px 20px; border-radius:10px; border:2px solid #db137a; background:white; color:#db137a; font-weight:bold; cursor:pointer; transition:0.3s;" onmouseover="this.style.background='#fff0f6'" onmouseout="this.style.background='white'">
                                        <i class="fas fa-search"></i> Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    `}).join('') : `
                        <div style="text-align:center; padding:50px 20px; background:white; border-radius:20px; border:1px dashed #ccc;">
                            <i class="fas fa-box-open fa-3x" style="color:#ddd; margin-bottom:15px;"></i>
                            <h3 style="color:#666; margin:0;">Sin pedidos</h3>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    // ==========================================
    // NUEVA FUNCIÓN: MODAL DE DETALLES DE PEDIDO
    // ==========================================
    verDetallePedido: (idPedido) => {
        // Buscamos el pedido en nuestra lista local
        const p = Panel.pedidos.find(x => x.idpedido == idPedido);
        if (!p) return Utils.toast("Pedido no encontrado", "error");

        // Eliminar modal anterior si existe para no duplicar
        const modalPrevio = document.getElementById("modalDetallePedido");
        if (modalPrevio) modalPrevio.remove();

        // Armamos la lista de productos con fotos
        let productosHtml = '';
        if (p.pedidos_productos && p.pedidos_productos.length > 0) {
            productosHtml = p.pedidos_productos.map(prod => `
                <div style="display:flex; gap:15px; padding:15px 0; border-bottom:1px solid #eee; align-items:center;">
                    <img src="${prod.imagenurl || '/assets/placeholder.png'}" style="width:70px; height:70px; object-fit:cover; border-radius:10px; border:1px solid #ddd; background:#f9f9f9;">
                    <div style="flex:1;">
                        <p style="margin:0; font-weight:bold; color:#333; font-size:0.95rem;">${prod.refproducto || 'Producto Personalizado'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            productosHtml = `<p style="color:#888; font-size:0.9rem; font-style:italic;">No hay fotos o detalles específicos registrados para este pedido.</p>`;
        }

        // Creamos el contenedor del Modal
        const modalOverlay = document.createElement("div");
        modalOverlay.id = "modalDetallePedido";
        modalOverlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px; backdrop-filter:blur(3px);";

        modalOverlay.innerHTML = `
            <div style="background:white; width:100%; max-width:500px; max-height:90vh; border-radius:20px; display:flex; flex-direction:column; box-shadow:0 15px 35px rgba(0,0,0,0.2); animation: fadeInUp 0.3s ease;">
                
                <div style="padding:20px 25px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff0f6; border-radius:20px 20px 0 0;">
                    <h2 style="margin:0; color:#db137a; font-family:'Bree Serif', serif;">Pedido #${p.idpedido}</h2>
                    <button onclick="document.getElementById('modalDetallePedido').remove()" style="background:none; border:none; font-size:1.8rem; color:#db137a; cursor:pointer; line-height:1;">&times;</button>
                </div>

                <div style="padding:25px; overflow-y:auto; flex:1;">
                    <div style="background:#f9f9f9; padding:15px; border-radius:12px; margin-bottom:20px;">
                        <p style="margin:0 0 8px 0; font-size:0.9rem; color:#555;"><strong>Fecha:</strong> ${new Date(p.fecha_creacion).toLocaleString()}</p>
                        <p style="margin:0 0 8px 0; font-size:0.9rem; color:#555;"><strong>Método de Pago:</strong> ${p.metodo_pago || 'N/A'}</p>
                        <p style="margin:0 0 8px 0; font-size:0.9rem; color:#555;"><strong>Total Pagado:</strong> <span style="color:#db137a; font-weight:bold;">${Utils.formatCurrency(p.total)}</span></p>
                        <p style="margin:0; font-size:0.9rem; color:#555;"><strong>Estado:</strong> ${CONFIG.estadosProduccion[p.estado]?.nombre || 'Pendiente'}</p>
                    </div>

                    <h4 style="margin:0 0 10px 0; color:#333; border-bottom:2px solid #db137a; display:inline-block; padding-bottom:5px;">Artículos</h4>
                    <div style="margin-bottom:10px;">
                        ${productosHtml}
                    </div>
                </div>

                <div style="padding:20px 25px; border-top:1px solid #eee; background:#fff; border-radius:0 0 20px 20px; display:flex; gap:10px;">
                    <button onclick="window.location.href='/rastreo/?id=${p.idpedido}'" style="flex:1; background:#db137a; color:white; border:none; padding:15px; border-radius:12px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 4px 10px rgba(219,19,122,0.2);">
                        <i class="fas fa-map-marker-alt"></i> Abrir Rastreo de Envío
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Cerrar si hace clic fuera de la caja blanca
        modalOverlay.addEventListener('click', (e) => {
            if(e.target === modalOverlay) modalOverlay.remove();
        });
    },
    // ==========================================
    // 3. VISTA: MI PERFIL (Formulario Completo)
    // ==========================================
    htmlPerfil: () => {
        const u = Panel.user;
        return `
            <div class="fade-in">
                <h2 style="margin-top:0;">Mi Perfil de Usuario</h2>
                <p style="color:gray; font-size:0.9rem; margin-bottom:20px;">Mantén tus datos de entrega actualizados para evitar demoras.</p>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Correo (Solo Lectura)</label>
                        <input type="text" value="${u.email}" readonly style="padding:10px; border-radius:8px; border:1px solid #ddd; background:#f5f5f5; color:#888;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Cédula / NIT</label>
                        <input type="text" id="updCC" value="${u.cc || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Nombre Completo</label>
                        <input type="text" id="updNombre" value="${u.nombre || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Teléfono</label>
                        <input type="tel" id="updTel" value="${u.telefono || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Departamento</label>
                        <input type="text" id="updDepto" value="${u.departamento || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Ciudad</label>
                        <input type="text" id="updCiudad" value="${u.ciudad || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Barrio</label>
                        <input type="text" id="updBarrio" value="${u.barrio || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Dirección Exacta</label>
                        <input type="text" id="updDir" value="${u.direccion || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                </div>

                <hr style="margin:30px 0; border:0; border-top:1px solid #eee;">
                
                <h3 style="color:#db137a; margin-bottom:5px;">Contacto de Confianza</h3>
                <p style="color:gray; font-size:0.85rem; margin-bottom:15px;">Persona autorizada para recibir pedidos en tu nombre.</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Nombre del Contacto</label>
                        <input type="text" id="updConfNombre" value="${u.confianza_nombre || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Teléfono del Contacto</label>
                        <input type="tel" id="updConfTel" value="${u.confianza_telf || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px; grid-column: 1 / -1;">
                        <label style="font-size:0.85rem; font-weight:bold; color:#555;">Dirección de Entrega Alterna</label>
                        <input type="text" id="updConfDir" value="${u.confianza_dir || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                    </div>
                </div>

                <hr style="margin:30px 0; border:0; border-top:1px solid #eee;">

                <h3 style="color:#555; margin-bottom:15px;">Seguridad</h3>
                <div style="display:flex; flex-direction:column; gap:8px; max-width:50%;">
                    <label style="font-size:0.85rem; font-weight:bold; color:#555;">Nueva Contraseña (Opcional)</label>
                    <input type="password" id="updPass" placeholder="Dejar en blanco para no cambiar" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
                </div>

                <button onclick="Panel.guardarPerfil()" style="margin-top:30px; background:#db137a; color:white; border:none; padding:15px 30px; border-radius:8px; font-weight:bold; font-size:1rem; cursor:pointer; width:100%;">Guardar Cambios</button>
            </div>
        `;
    },

    // ==========================================
    // ACCIONES (ACTUALIZAR, LOGOUT, CANCELAR)
    // ==========================================
    guardarPerfil: async () => {
        const btn = event.target;
        btn.innerText = "Guardando..."; btn.disabled = true;

        const payload = {
            cc: document.getElementById('updCC').value,
            nombre: document.getElementById('updNombre').value,
            telefono: document.getElementById('updTel').value,
            departamento: document.getElementById('updDepto').value,
            ciudad: document.getElementById('updCiudad').value,
            barrio: document.getElementById('updBarrio').value,
            direccion: document.getElementById('updDir').value,
            confianza_nombre: document.getElementById('updConfNombre').value,
            confianza_telf: document.getElementById('updConfTel').value,
            confianza_dir: document.getElementById('updConfDir').value
        };

        // 1. Actualizar Datos en Tabla Usuarios
        const { error } = await window.db.from('usuarios').update(payload).eq('email', Panel.user.email);
        
        // 2. Actualizar Contraseña si la escribió (Y si entró por correo, no por Google)
        const pass = document.getElementById('updPass').value;
        if (pass.length > 5) {
            await window.db.auth.updateUser({ password: pass });
        }

        btn.innerText = "Guardar Cambios"; btn.disabled = false;

        if (error) {
            Utils.toast("Error al guardar: " + error.message, "error");
        } else {
            Utils.toast("¡Perfil Actualizado!", "success");
            Panel.user = { ...Panel.user, ...payload };
            localStorage.setItem('cupissa_user', JSON.stringify(Panel.user));
            Panel.construirApp();
            Panel.showTab('perfil');
        }
    },

    redimirPremio: (idPremio, costo) => {
        if(Panel.billetera < costo) return Utils.toast("No tienes suficientes CupiCoins", "error");
        if(confirm(`¿Deseas canjear este premio por ${costo} CupiCoins?`)) {
            alert("Lógica de canje en desarrollo..."); // Aquí conectarías con tu backend para descontar
        }
    },

    cancelarPedido: async (id) => {
        if(!confirm(`¿Seguro que deseas cancelar el pedido #${id}?`)) return;
        const { error } = await window.db.from('pedidos').update({ estado: 99 }).eq('idpedido', id); // 99 = Cancelado
        if(!error) {
            Utils.toast("Pedido Cancelado", "success");
            Panel.init(); // Recargar todo
        }
    },

    cerrarSesion: async () => {
        if(confirm("¿Estás seguro que deseas salir?")) {
            if (window.db) await window.db.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/");
        }
    }
};

// CSS Básico inyectado para las transiciones
const style = document.createElement('style');
style.innerHTML = `
    .fade-in { animation: fadeIn 0.4s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .panel-layout { display: grid; grid-template-columns: 250px 1fr; gap: 30px; max-width: 1200px; margin: 40px auto; padding: 0 20px; }
    .sidebar-btn { padding: 12px 15px; border-radius: 10px; cursor: pointer; transition: 0.3s; display:flex; gap:10px; align-items:center; }
    .sidebar-btn:hover { background: #f9f9f9; color: #db137a; }
    @media (max-width: 800px) { .panel-layout { grid-template-columns: 1fr; } }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", Panel.init);