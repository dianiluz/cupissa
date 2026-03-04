/* ===================================================== */
/* CUPISSA — LÓGICA DEL PANEL MAESTRO (TABS Y ROLES) */
/* ===================================================== */

const Panel = {
    user: null,
    listaPedidos: [],

    init: () => {
        Panel.user = Utils.getUserSession();
        if (!Panel.user) return window.location.replace("/auth/");

        const userNameEl = document.getElementById('panelUserName');
        if(userNameEl) userNameEl.innerText = Panel.user.nombre.split(' ')[0];
        
        Panel.renderTabsByRole();
        Panel.bindEvents();
    },

    renderTabsByRole: () => {
        const menu = document.getElementById('menuTabs');
        const rol = Panel.user.tipo_usuario;
        
        let tabsHTML = '';
        
        if (rol === 'CLIENTE') {
            // TABS EXCLUSIVOS PARA CLIENTES
            tabsHTML += `<li onclick="Panel.switchTab('tab-resumen', this)" class="active"><i class="fas fa-home"></i> Resumen</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-perfil', this)"><i class="fas fa-user-cog"></i> Mi Perfil</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-pedidos', this)"><i class="fas fa-box-open"></i> Mis Pedidos</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-promos', this)"><i class="fas fa-tag"></i> Promociones</li>`;
            
            menu.innerHTML = tabsHTML;
            Panel.cargarDatosCliente();
            Panel.switchTab('tab-resumen', menu.firstElementChild);
            
        } else {
            // TABS EXCLUSIVOS PARA ADMIN Y VENDEDOR
            tabsHTML += `<li onclick="Panel.switchTab('tab-perfil', this)"><i class="fas fa-user-cog"></i> Mi Perfil</li>`;
            tabsHTML += `<li style="background:var(--color-black);color:white;text-align:center;pointer-events:none;margin-top:10px;font-size:0.8rem;padding:5px;">ZONA STAFF</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-gestion', this)" class="active"><i class="fas fa-tasks"></i> Gestión Pedidos</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-clientes', this)"><i class="fas fa-users"></i> Clientes</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-productos', this)"><i class="fas fa-tshirt"></i> Productos</li>`;
            tabsHTML += `<li onclick="Panel.switchTab('tab-comisiones', this)"><i class="fas fa-wallet"></i> Comisiones</li>`;
            
            if(rol === 'ADMIN') {
                tabsHTML += `<li onclick="Panel.switchTab('tab-marketing', this)"><i class="fas fa-bullhorn"></i> Marketing</li>`;
                tabsHTML += `<li onclick="Panel.switchTab('tab-correos', this)"><i class="fas fa-envelope"></i> Buzón Correos</li>`;
            }

            menu.innerHTML = tabsHTML;
            
            // Ocultar las vistas de cliente que están en el HTML para que no interfieran
            if(document.getElementById('tab-resumen')) document.getElementById('tab-resumen').style.display = 'none';
            if(document.getElementById('tab-pedidos')) document.getElementById('tab-pedidos').style.display = 'none';
            if(document.getElementById('tab-promos')) document.getElementById('tab-promos').style.display = 'none';

            Panel.cargarPerfilBase(); 
            Panel.cargarPedidosAdmin();
            Panel.cargarClientesLista();
            Panel.cargarProductosLista();
            
            // Activar la pestaña de gestión por defecto
            Panel.switchTab('tab-gestion', menu.children[2]);
        }
    },

    switchTab: (tabId, element) => {
        document.querySelectorAll('.panel-sidebar-menu li').forEach(li => li.classList.remove('active'));
        if(element) element.classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
        const targetTab = document.getElementById(tabId);
        if(targetTab) targetTab.classList.add('active');
    },

    logout: () => {
        localStorage.removeItem('cupissa_user');
        sessionStorage.removeItem('cupissa_user');
        window.location.replace("/");
    },

    /* ================================================= */
    /* CARGAS BÁSICAS Y PERFIL                           */
    /* ================================================= */
    cargarPerfilBase: () => {
        document.getElementById('perfilNombre').value = Panel.user.nombre || '';
        document.getElementById('perfilTelefono').value = Panel.user.telefono || '';
        document.getElementById('perfilDireccion').value = Panel.user.direccion || '';
        document.getElementById('perfilCiudad').value = Panel.user.ciudad || '';
        document.getElementById('perfilCC').value = Panel.user.cc || '';
        if(document.getElementById('perfilConfianza')) document.getElementById('perfilConfianza').value = Panel.user.conf_nombre || '';
        if(document.getElementById('perfilConfianzaDir')) document.getElementById('perfilConfianzaDir').value = Panel.user.conf_dir || '';

        // Vendedor no puede cambiar su nombre base
        if(Panel.user.tipo_usuario === 'VENDEDOR') {
            document.getElementById('perfilNombre').disabled = true;
        }
    },

    /* ================================================= */
    /* MÓDULO CLIENTE                                    */
    /* ================================================= */
    cargarDatosCliente: async () => {
        Panel.cargarPerfilBase();

        try {
            const fd = new FormData(); fd.append('action', 'obtenerDatosPanel'); fd.append('email', Panel.user.email);
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
            
            if(data.success) {
                if(document.getElementById('kpiPuntos')) document.getElementById('kpiPuntos').innerText = data.puntos;
                
                const entregados = data.pedidos.filter(p => p.Estado == "5").length;
                const enProceso = data.pedidos.filter(p => parseInt(p.Estado) > 0 && parseInt(p.Estado) < 5).length;
                if(document.getElementById('kpiEntregados')) document.getElementById('kpiEntregados').innerText = entregados;
                if(document.getElementById('kpiProceso')) document.getElementById('kpiProceso').innerText = enProceso;

                Panel.listaPedidos = data.pedidos;
                Panel.renderHistorialPersonal(data.pedidos);
                Panel.renderPromos(data.promociones);
            }
        } catch(e) { console.error("Error al cargar datos del cliente"); }
    },

    renderHistorialPersonal: (pedidos) => {
        const cont = document.getElementById('historialPedidosLista');
        if(!cont) return;
        if(pedidos.length === 0) return cont.innerHTML = "<p>Aún no tienes pedidos registrados.</p>";

        cont.innerHTML = pedidos.map(p => {
            let badge = p.Estado == "5" ? "var(--color-success)" : (p.Estado == "0" ? "red" : (p.Estado == "9" ? "gray" : "var(--color-pink)"));
            let txt = p.Estado == "5" ? "Entregado" : (p.Estado == "0" ? "Pago Pendiente" : (p.Estado == "9" ? "Cancelado" : "En Proceso"));
            let btnCancelar = (p.Estado == "0" || p.Estado == "1") ? `<button onclick="Panel.cancelarPedido('${p.IDPedido}')" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Cancelar Pedido</button>` : '';

            return `
                <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; background:#fff;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; color:var(--color-pink);">${p.IDPedido}</h4>
                            <p style="margin: 5px 0 0 0; font-size: 0.85rem;">${p.fecha_creacion.split('T')[0]} | ${Utils.formatCurrency(p.total)}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${badge}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight:bold;">${txt}</span>
                        </div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee; display: flex; gap: 10px; align-items:center;">
                        <button onclick="Panel.abrirModalDetalle('${p.IDPedido}', 'CLIENTE')" style="flex:1; background: var(--color-black); color: white; border: none; padding: 6px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Ver Detalles</button>
                        ${btnCancelar}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderPromos: (promos) => {
        const cont = document.getElementById('promocionesLista');
        if(!cont) return;
        if(!promos || promos.length === 0) return cont.innerHTML = "<p>No hay promos activas.</p>";
        
        cont.innerHTML = promos.map(p => `
            <div style="min-width: 250px; background: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; padding:15px; flex:1;">
                <span style="background: var(--color-pink); color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">${p.tipo_promo}</span>
                <h4 style="margin: 10px 0 5px 0;">${p.titulo}</h4>
                <p style="font-size: 0.85rem; color: gray; margin-bottom: 10px;">${p.descripción}</p>
                ${p.codigo ? `<div style="background: #f9f9f9; border: 1px dashed #000; padding: 5px; text-align: center; font-family: monospace; font-weight: bold; cursor: pointer;" onclick="navigator.clipboard.writeText('${p.codigo}'); Utils.toast('Código copiado', 'success');" title="Clic para copiar">${p.codigo}</div>` : ''}
            </div>
        `).join('');
    },

    cancelarPedido: async (id) => {
        if(!confirm("¿Deseas cancelar este pedido de forma permanente?")) return;
        const fd = new FormData(); fd.append('action', 'cancelarPedidoCliente'); fd.append('id_pedido', id); fd.append('email', Panel.user.email);
        await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
        Utils.toast("Pedido Cancelado", "info");
        Panel.cargarDatosCliente();
    },

    /* ================================================= */
    /* MÓDULO ADMIN / VENDEDOR                           */
    /* ================================================= */
    cargarPedidosAdmin: async () => {
        const tbody = document.getElementById('tablaAdminPedidos');
        if(!tbody) return;
        
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Consultando base de datos...</td></tr>";

        try {
            const fd = new FormData(); fd.append('action', 'obtenerTodosPedidos');
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
            
            if (data.success && data.pedidos.length > 0) {
                Panel.listaPedidos = data.pedidos;
                
                // Lógica de Comisiones (10% sobre pedidos no cancelados y no pendientes)
                let pedidosValidos = data.pedidos.filter(p => p.Estado != "0" && p.Estado != "9");
                let misVentas = Panel.user.tipo_usuario === 'VENDEDOR' ? pedidosValidos.filter(p => p.vendedor === Panel.user.email) : pedidosValidos;
                
                let totalVentasMis = misVentas.reduce((sum, p) => sum + Number(p.total), 0);
                if(document.getElementById('kpiComisionTotal')) document.getElementById('kpiComisionTotal').innerText = Utils.formatCurrency(totalVentasMis * 0.10);

                // Si es admin, mostrar desglose por vendedor en la tabla de comisiones
                if(Panel.user.tipo_usuario === 'ADMIN' && document.getElementById('tablaListaComisiones')) {
                    let resumenVendedores = {};
                    pedidosValidos.forEach(p => {
                        let vend = p.vendedor || "Venta Directa Web";
                        if(!resumenVendedores[vend]) resumenVendedores[vend] = 0;
                        resumenVendedores[vend] += Number(p.total);
                    });
                    
                    document.getElementById('tablaListaComisiones').innerHTML = Object.keys(resumenVendedores).map(v => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${v}</td>
                            <td style="padding:10px;">${Utils.formatCurrency(resumenVendedores[v])}</td>
                            <td style="padding:10px; font-weight:bold; color:var(--color-success);">${Utils.formatCurrency(resumenVendedores[v] * 0.10)}</td>
                        </tr>
                    `).join('');
                }

                // Renderizar tabla de pedidos espectacular
                tbody.innerHTML = data.pedidos.map(p => {
                    const bgRow = p.Estado == "5" ? "#f4fdf4" : (p.Estado == "0" ? "#fff0f0" : (p.Estado == "9" ? "#f5f5f5" : "#fff"));
                    let imgThumb = p.productos && p.productos[0] ? p.productos[0].Imagen : '/assets/logo.png';
                    if(!imgThumb.startsWith('http')) imgThumb = 'https://cupissa.com' + imgThumb;

                    let estTxt = ["Pendiente", "Agendado", "En Fabricación", "Listo", "En Camino", "Entregado", "", "", "", "Cancelado"][parseInt(p.Estado)] || "Desconocido";
                    let badgeColor = p.Estado == "5" ? "green" : (p.Estado == "9" ? "gray" : "var(--color-pink)");

                    return `
                        <tr style="border-bottom: 1px solid #eee; background: ${bgRow};">
                            <td style="padding: 12px; display:flex; gap:10px; align-items:center;">
                                <img src="${imgThumb}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;" onerror="this.src='/assets/logo.png'">
                                <div>
                                    <strong style="color:var(--color-pink);">${p.IDPedido}</strong><br>
                                    <span style="font-size:0.75rem; color:gray;">${p.productos ? p.productos.length : 0} item(s)</span>
                                </div>
                            </td>
                            <td style="padding: 12px; font-size:0.85rem;"><strong>${p.NombreCliente}</strong><br><a href="https://wa.me/57${p.Telefono.replace(/\D/g,'')}" target="_blank" style="color:var(--color-success); text-decoration:none;"><i class="fab fa-whatsapp"></i> ${p.Telefono}</a></td>
                            <td style="padding: 12px; font-size:0.85rem;">Tot: ${Utils.formatCurrency(p.total)}<br><span style="color:red; font-weight:bold;">Sal: ${Utils.formatCurrency(p.saldo_pendiente)}</span></td>
                            <td style="padding: 12px; font-size: 0.85rem; font-weight:bold; color:${badgeColor};">${estTxt}</td>
                            <td style="padding: 12px; text-align: center;">
                                <button onclick="Panel.abrirModalDetalle('${p.IDPedido}', 'ADMIN')" style="background: var(--color-black); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; font-weight:bold;">Gestionar</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else { tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 20px;'>No hay pedidos registrados en la base de datos.</td></tr>"; }
        } catch (error) { tbody.innerHTML = "<tr><td colspan='5' style='color:red; text-align:center;'>Error de red al consultar pedidos.</td></tr>"; }
    },

    cargarClientesLista: async () => {
        try {
            const fd = new FormData(); fd.append('action', 'obtenerClientesGeneral');
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
            
            if(data.success && document.getElementById('tablaListaClientes')) {
                document.getElementById('tablaListaClientes').innerHTML = data.clientes.map(c => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;"><strong>${c.nombre}</strong></td>
                        <td style="padding: 10px;">${c.email}<br><span style="color:gray; font-size:0.8rem;">${c.telefono}</span></td>
                        <td style="padding: 10px; font-size:0.85rem;"><span style="background:#eee; padding:3px 8px; border-radius:10px;">${c.rol}</span><br><span style="color:gray; font-size:0.75rem;">${c.fecha.split('T')[0]}</span></td>
                    </tr>
                `).join('');
                
                const selDest = document.getElementById('listaDestinosBuzon');
                if(selDest) {
                    selDest.innerHTML = '<option value="TODOS">💥 ENVIAR A TODOS LOS CLIENTES</option>';
                    data.clientes.forEach(c => selDest.innerHTML += `<option value="${c.email}">${c.nombre}</option>`);
                }
            }
        } catch(e) {}
    },

    cargarProductosLista: async () => {
        try {
            const fd = new FormData(); fd.append('action', 'obtenerCatalogoBase');
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
            if(data.success && document.getElementById('tablaListaProductos')) {
                document.getElementById('tablaListaProductos').innerHTML = data.productos.map(p => {
                    let imgUrl = p.imagenurl.startsWith('http') ? p.imagenurl : 'https://cupissa.com' + p.imagenurl;
                    return `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; display:flex; gap:10px; align-items:center;">
                            <img src="${imgUrl}" style="width:45px; height:45px; object-fit:cover; border-radius:5px;" onerror="this.src='/assets/logo.png'">
                            <strong style="color:var(--color-pink);">${p['*referencia']}</strong>
                        </td>
                        <td style="padding: 10px;"><strong>${p['*nombre']}</strong><br><span style="color:gray; font-size:0.8rem;">${p.mundo} / ${p.categoría || p.categoria}</span></td>
                        <td style="padding: 10px; font-weight:bold;">${Utils.formatCurrency(p['*precio_base'])}</td>
                    </tr>
                `}).join('');
            }
        } catch(e) {}
    },

    /* ================================================= */
    /* MODAL Y GESTIÓN DE ESTADOS                        */
    /* ================================================= */
    abrirModalDetalle: (id, vista) => {
        const p = Panel.listaPedidos.find(ped => ped.IDPedido === id);
        if (!p) return;

        document.getElementById('modId').innerText = `Pedido ${p.IDPedido}`;
        let estTxt = ["Pendiente/Fallido", "Agendado", "En Fabricación", "Listo", "En Camino", "Entregado", "", "", "", "Cancelado"][parseInt(p.Estado)] || "Desconocido";

        document.getElementById('modInfo').innerHTML = `
            <strong>Estado:</strong> <span style="color:var(--color-pink); font-weight:bold; font-size:1.1rem;">${estTxt}</span><br>
            <strong>Cliente:</strong> ${p.NombreCliente} (${p.Telefono})<br>
            <strong>Dirección:</strong> ${p.Dirección}<br>
            <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-top:10px;">
                <strong>Pago:</strong> ${p.metodo_pago.toUpperCase()} | <strong>Abonado:</strong> <span style="color:var(--color-success);">${Utils.formatCurrency(p.valor_anticipo)}</span><br>
                <strong>Saldo Pendiente:</strong> <span style="color:red; font-size:1.1rem; font-weight:bold;">${Utils.formatCurrency(p.saldo_pendiente)}</span>
            </div>
        `;

        const prodsHtml = p.productos && p.productos.length > 0 ? p.productos.map(pr => {
            let img = pr.Imagen.startsWith('http') ? pr.Imagen : 'https://cupissa.com' + pr.Imagen;
            return `
                <div style="display:flex; gap:15px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" onerror="this.src='/assets/logo.png'">
                    <div>
                        <div style="font-weight:bold; font-size:0.95rem;">${pr.Cantidad}x ${pr.Nombre.split('(')[0]}</div>
                        <div style="font-size:0.8rem; color:var(--color-pink);">${pr.Nombre.includes('(') ? pr.Nombre.split('(')[1].replace(')','') : ''}</div>
                        <div style="font-size:0.85rem;">Unitario: ${Utils.formatCurrency(pr.PrecioUnitario)}</div>
                    </div>
                </div>
            `;
        }).join('') : "<p>No hay detalle de productos en la base de datos.</p>";
        document.getElementById('modProductos').innerHTML = prodsHtml;

        const acc = document.getElementById('modAccionesAdmin');
        if (vista === 'ADMIN') {
            acc.style.display = 'block';
            acc.innerHTML = `
                <h4 style="margin-top:0;">Actualizar Estado y Transporte</h4>
                <select id="est_${p.IDPedido}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; margin-bottom:10px; font-weight:bold;">
                    <option value="0" ${p.Estado == "0" ? "selected" : ""}>Pendiente / Pago Fallido</option>
                    <option value="1" ${p.Estado == "1" ? "selected" : ""}>Agendado (A Producción)</option>
                    <option value="2" ${p.Estado == "2" ? "selected" : ""}>En Fabricación</option>
                    <option value="3" ${p.Estado == "3" ? "selected" : ""}>Listo (Empacado)</option>
                    <option value="4" ${p.Estado == "4" ? "selected" : ""}>En Camino (Transportadora)</option>
                    <option value="5" ${p.Estado == "5" ? "selected" : ""}>Entregado (Cierra y da Puntos)</option>
                    <option value="9" ${p.Estado == "9" ? "selected" : ""}>Cancelado Definitivamente</option>
                </select>
                <input type="text" id="guia_${p.IDPedido}" placeholder="N° Guía Transportadora" value="${p.GuiaTransportadora || ''}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; margin-bottom:10px;">
                <input type="text" id="url_${p.IDPedido}" placeholder="Link Rastreo Transportadora" value="${p.URLtransportadora || ''}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; margin-bottom:10px;">
                <button onclick="Panel.guardarAdmin('${p.IDPedido}')" style="width:100%; background:var(--color-success); color:white; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1.1rem;">Guardar Cambios de Pedido</button>
            `;
        } else acc.style.display = 'none';

        document.getElementById('modalDetallePedido').style.display = 'flex';
    },

    guardarAdmin: async (id) => {
        const est = document.getElementById(`est_${id}`).value;
        const gu = document.getElementById(`guia_${id}`).value;
        const url = document.getElementById(`url_${id}`).value;
        
        Utils.toast("Guardando en el servidor...", "info");
        try {
            const fd = new FormData(); fd.append('action', 'actualizarEstadoPedido'); fd.append('id_pedido', id); fd.append('estado', est);
            fd.append('guia', gu); fd.append('url_guia', url); 
            await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            Utils.toast("Estado actualizado exitosamente.", "success");
            Panel.cargarPedidosAdmin();
        } catch(e) { Utils.toast("Error al guardar.", "error"); }
    },

    /* ================================================= */
    /* EVENTOS Y FORMULARIOS                             */
    /* ================================================= */
    bindEvents: () => {
        // Perfil Común
        const formPerfil = document.getElementById('formEditarPerfil');
        if(formPerfil) formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnActualizarPerfil'); btn.disabled = true; btn.innerText = "Guardando...";
            const payload = {
                action: 'actualizarPerfil', email: Panel.user.email, rol: Panel.user.tipo_usuario,
                nombre: document.getElementById('perfilNombre').value, telefono: document.getElementById('perfilTelefono').value,
                direccion: document.getElementById('perfilDireccion').value, ciudad: document.getElementById('perfilCiudad').value,
                cc: document.getElementById('perfilCC') ? document.getElementById('perfilCC').value : '',
                conf_nombre: document.getElementById('perfilConfianza').value, conf_dir: document.getElementById('perfilConfianzaDir').value,
                password: document.getElementById('perfilPassword').value
            };
            const fd = new FormData(); Object.keys(payload).forEach(k => fd.append(k, payload[k]));
            await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            Utils.toast("¡Perfil actualizado!", "success");
            btn.disabled = false; btn.innerText = "Guardar Cambios";
        });

        // Crear Cliente/Vendedor
        const formCli = document.getElementById('formNuevoCliente');
        if(formCli) formCli.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnCrearCli'); btn.disabled = true;
            const fd = new FormData(); fd.append('action', 'crearUsuarioPanel');
            fd.append('nombre', document.getElementById('nCliNombre').value); 
            fd.append('email', document.getElementById('nCliEmail').value); 
            fd.append('telefono', document.getElementById('nCliTel').value);
            // El admin no puede crear vendedores según las reglas. Se fuerza CLIENTE.
            fd.append('rol', 'CLIENTE'); 
            
            try {
                const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd }); 
                const data = await res.json();
                if(data.success) { Utils.toast("Usuario registrado. Correo enviado.", "success"); formCli.reset(); Panel.cargarClientesLista(); } 
                else Utils.toast(data.error, "error");
            } catch(err) { Utils.toast("Error de conexión", "error"); }
            btn.disabled = false;
        });

        // Crear Producto (Con URL automática y variaciones)
        const formProd = document.getElementById('formNuevoProd');
        if(formProd) formProd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnCrearProd'); btn.disabled = true; btn.innerText = "Subiendo producto...";
            const fd = new FormData(); fd.append('action', 'crearProductoNuevo');
            
            const campos = ['Ref', 'Nombre', 'Precio', 'Mundo', 'Cat', 'SubCat', 'Grupo', 'Tipo', 'Tallas', 'Tematica', 'Personal', 'Activo', 'ParaQuien', 'Modalidad', 'XTemp', 'Temporada', 'Variaciones'];
            campos.forEach(c => {
                const el = document.getElementById(`p${c}`);
                fd.append(c.toLowerCase(), el ? el.value : "");
            });
            
            try {
                const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd }); 
                const data = await res.json();
                if(data.success) { 
                    Utils.toast(`Guardado. Imagen asignada: ${data.img}`, "success"); 
                    formProd.reset(); 
                    Panel.cargarProductosLista(); 
                } else Utils.toast(data.error, "error");
            } catch(err) { Utils.toast("Error al subir", "error"); }
            btn.disabled = false; btn.innerText = "Guardar Producto Definitivo";
        });

        // Marketing
        const formPro = document.getElementById('formNuevaPromo');
        if(formPro) formPro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(); fd.append('action', 'crearPromocionMarketing');
            fd.append('tipo', document.getElementById('nProTipo').value); fd.append('titulo', document.getElementById('nProTitulo').value);
            fd.append('codigo', document.getElementById('nProCodigo').value); fd.append('valor', document.getElementById('nProValor').value);
            fd.append('descripcion', document.getElementById('nProDesc').value);
            await fetch(CONFIG.backendURL, { method: 'POST', body: fd }); 
            Utils.toast("Promoción Lanzada", "success"); formPro.reset();
        });

        // Buzón de Correos
        const formBuzon = document.getElementById('formBuzonEnvio');
        if(formBuzon) formBuzon.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnEnviarBuzon'); btn.disabled = true; btn.innerText = "Enviando...";
            const fd = new FormData(); fd.append('action', 'enviarCorreoBuzon');
            fd.append('destinatario', document.getElementById('buzonDestinoInput').value); 
            fd.append('asunto', document.getElementById('buzonAsunto').value);
            fd.append('mensaje', document.getElementById('buzonCuerpo').value);
            try {
                await fetch(CONFIG.backendURL, { method: 'POST', body: fd }); 
                Utils.toast("Correo(s) Enviados Exitosamente", "success"); 
                formBuzon.reset();
            } catch(err) { Utils.toast("Error al enviar", "error"); }
            btn.disabled = false; btn.innerText = "Enviar Mensaje";
        });
    }
};

document.addEventListener('DOMContentLoaded', Panel.init);