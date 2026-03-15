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
        // Trae pedidos y sus productos asociados de una vez
        const { data } = await window.db.from('pedidos')
            .select(`*, pedidos_productos ( refproducto, imagenurl )`)
            .eq('usuario_email', Panel.user.email)
            .order('fecha_creacion', { ascending: false });
        Panel.pedidos = data || [];
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
    // 1. VISTA: RESUMEN
    // ==========================================
    htmlResumen: () => {
        const ultimoPedido = Panel.pedidos.length > 0 ? Panel.pedidos[0] : null;

        return `
            <div class="fade-in">
                <h2 style="margin-top:0;">Hola, ${Panel.user.nombre.split(' ')[0]} 👋</h2>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
                    <div style="background:linear-gradient(135deg, #db137a, #ff6b9e); color:white; padding:25px; border-radius:15px; text-align:center;">
                        <h4 style="margin:0; opacity:0.9;">Saldo CupiCoins</h4>
                        <h1 style="font-size:3.5rem; margin:10px 0;">${Panel.billetera}</h1>
                        <p style="margin:0; font-size:0.9rem;">Equivale a ${Utils.formatCurrency(Panel.billetera)}</p>
                    </div>

                    <div style="border:1px solid #eee; padding:25px; border-radius:15px;">
                        <h4 style="margin:0; color:#555;">Último Pedido</h4>
                        ${ultimoPedido ? `
                            <h2 style="margin:10px 0; color:#db137a;">#${ultimoPedido.idpedido}</h2>
                            <p style="margin:0 0 10px 0;">Estado: <b>${CONFIG.estadosProduccion[ultimoPedido.estado]?.nombre || 'Pendiente'}</b></p>
                            <p style="margin:0;">Total: ${Utils.formatCurrency(ultimoPedido.total)}</p>
                            <button onclick="window.location.href='/rastreo/?id=${ultimoPedido.idpedido}'" style="margin-top:15px; background:#f5f5f5; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Rastrear</button>
                        ` : `<p style="margin-top:15px; color:#888;">No has realizado compras aún.</p>`}
                    </div>
                </div>

                <h3 style="margin-top:40px; border-bottom:2px solid #eee; padding-bottom:10px;">Promos y Premios Disponibles</h3>
                <div style="display:grid; gap:15px; margin-top:20px;">
                    ${Panel.promos.length > 0 ? Panel.promos.map(p => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#fdfdfd; border:1px dashed #ccc; border-radius:10px;">
                            <div>
                                <h4 style="margin:0; color:#db137a;">${p.título}</h4>
                                <p style="margin:5px 0 0 0; font-size:0.85rem; color:#666;">${p.descripción}</p>
                            </div>
                            <button onclick="Panel.redimirPremio('${p.id}', ${p.costo_cupicoins})" style="background:#db137a; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                                Canjear por ${p.costo_cupicoins} CC
                            </button>
                        </div>
                    `).join('') : '<p style="color:#888;">No hay premios activos en este momento.</p>'}
                </div>
            </div>
        `;
    },

    // ==========================================
    // 2. VISTA: MIS PEDIDOS
    // ==========================================
    htmlPedidos: () => {
        return `
            <div class="fade-in">
                <h2 style="margin-top:0;">Historial de Pedidos</h2>
                <div style="display:grid; gap:20px; margin-top:20px;">
                    ${Panel.pedidos.length > 0 ? Panel.pedidos.map(p => `
                        <div style="border:1px solid #eee; border-radius:10px; padding:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:15px;">
                                <div>
                                    <h3 style="margin:0;">Pedido #${p.idpedido}</h3>
                                    <p style="margin:5px 0 0 0; font-size:0.85rem; color:#888;">${new Date(p.fecha_creacion).toLocaleString()}</p>
                                </div>
                                <span style="background:#f5f5f5; padding:5px 15px; border-radius:20px; font-weight:bold; color:#555;">
                                    ${CONFIG.estadosProduccion[p.estado]?.nombre || 'Pendiente'}
                                </span>
                            </div>
                            
                            <div style="display:flex; gap:10px; margin-bottom:15px; overflow-x:auto;">
                                ${p.pedidos_productos ? p.pedidos_productos.map(prod => `
                                    <img src="${prod.imagenurl}" style="width:50px; height:50px; object-fit:cover; border-radius:5px; border:1px solid #ddd;" title="${prod.refproducto}">
                                `).join('') : ''}
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="margin:0; color:#db137a;">${Utils.formatCurrency(p.total)}</h3>
                                <div style="display:flex; gap:10px;">
                                    <button onclick="window.location.href='/rastreo/?id=${p.idpedido}'" style="padding:8px 15px; border-radius:5px; border:1px solid #ccc; background:white; cursor:pointer;">Ver Detalles / Rastrear</button>
                                    ${p.estado === 1 ? `<button onclick="Panel.cancelarPedido('${p.idpedido}')" style="padding:8px 15px; border-radius:5px; border:none; background:#ffebee; color:red; cursor:pointer;">Cancelar</button>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') : '<p style="color:#888;">No tienes pedidos registrados.</p>'}
                </div>
            </div>
        `;
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