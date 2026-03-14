/* ===================================================== */
/* CUPISSA — LÓGICA DE RASTREO PÚBLICO (SUPABASE)        */
/* ===================================================== */

const Rastreo = {
    init: () => {
        const form = document.getElementById('formRastreo');
        if (form) form.addEventListener('submit', Rastreo.buscarPedido);

        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. Prioridad absoluta: Buscar 'ref' (El código CUP- que mandamos a Wompi)
        let idPedido = urlParams.get('ref');
        
        // 2. Si no hay 'ref', buscamos 'id' (Por si entran desde un link directo viejo)
        if (!idPedido) {
            idPedido = urlParams.get('id');
        }

        // 3. BLINDAJE CONTRA WOMPI: Si capturamos algo, pero NO tiene "CUP-", es basura. Lo ignoramos.
        if (idPedido && !idPedido.toUpperCase().includes('CUP-')) {
            idPedido = null; 
        }

        // 4. Si tenemos un código válido, lo ponemos en la caja y buscamos
        if (idPedido) {
            idPedido = idPedido.trim().toUpperCase();
            const input = document.getElementById('inputIdPedido');
            if (input) input.value = idPedido;
            Rastreo.ejecutarBusqueda(idPedido);
        }
    },

    buscarPedido: (e) => {
        e.preventDefault();
        const id = document.getElementById('inputIdPedido').value.trim().toUpperCase();
        if (id) Rastreo.ejecutarBusqueda(id);
    },

    esperarDB: async () => {
        let intentos = 0;
        // Esperamos a que Supabase (window.db) se inicialice en la página
        while (!window.db && intentos < 20) {
            await new Promise(r => setTimeout(r, 200));
            intentos++;
        }
        return window.db;
    },

    ejecutarBusqueda: async (idPedido) => {
        const btn = document.getElementById('btnRastrear');
        const err = document.getElementById('msgError');
        const resultDiv = document.getElementById('resultadoRastreo');

        if(btn) { btn.disabled = true; btn.innerText = "Buscando..."; }
        if(err) err.style.display = 'none'; 
        if(resultDiv) resultDiv.classList.remove('active');

        try {
            const db = await Rastreo.esperarDB();
            
            // Si después de esperar no hay conexión a Supabase, avisamos el error real.
            if (!db) {
                console.error("No se detectó Supabase en esta página.");
                throw new Error("NoDB");
            }

            // 1. CONSULTA DIRECTA A LA TABLA 'pedidos' EN SUPABASE
            const { data: pedido, error: errPed } = await db
                .from('pedidos')
                .select('*')
                .eq('idpedido', idPedido)
                .single();

            if (errPed || !pedido) {
                if(err) err.style.display = 'block';
                return; // No se encontró el pedido
            }

            // 2. BUSCAMOS EL NOMBRE DEL CLIENTE (Opcional, para saludarlo)
            let nombreCliente = "Cliente Cupissa";
            if (pedido.usuario_email) {
                const { data: user } = await db.from('usuarios').select('nombre').eq('email', pedido.usuario_email).single();
                if (user && user.nombre) nombreCliente = user.nombre;
            }
            pedido.cliente = nombreCliente;

            // 3. PINTAMOS LA PANTALLA
            Rastreo.mostrarResultado(pedido);

        } catch (error) {
            console.error("Error al buscar:", error);
            if (typeof Utils !== 'undefined' && Utils.toast) {
                if (error.message === "NoDB") {
                    Utils.toast("Falta conectar Supabase en rastreo.html", "error");
                } else {
                    Utils.toast("Error de conexión. Intenta nuevamente.", "error");
                }
            }
        } finally {
            if(btn) { btn.disabled = false; btn.innerText = "Buscar"; }
        }
    },

    mostrarResultado: (pedido) => {
        if (!pedido) return;

        // Variables limpias directas de las columnas de tu tabla
        const idPed = pedido.idpedido || '---';
        const cliente = pedido.cliente || '---';
        const transportadora = pedido.transportadora || '';
        const tipo = pedido.tipo || '';
        const guia = pedido.guia || '';
        const estadoActualStr = pedido.estado || '1';
        const estadoPago = pedido.estado_pago || 'PENDIENTE';

        // 4. Pintar cabecera superior
        if(document.getElementById('lblPedidoId')) document.getElementById('lblPedidoId').innerText = idPed;
        if(document.getElementById('lblCliente')) document.getElementById('lblCliente').innerText = cliente;
        if(document.getElementById('lblTipoEnvio')) document.getElementById('lblTipoEnvio').innerText = transportadora !== '' ? transportadora : (tipo !== '' ? tipo : 'Local');

        // AVISO VISUAL DE PAGO (Por si paga en efectivo y queda PENDIENTE)
        let estadoPagoLabel = document.getElementById('lblEstadoPago');
        if (!estadoPagoLabel) {
            const containerTipoEnvio = document.getElementById('lblTipoEnvio')?.parentNode;
            if (containerTipoEnvio) {
                estadoPagoLabel = document.createElement('p');
                estadoPagoLabel.id = 'lblEstadoPago';
                estadoPagoLabel.style.fontWeight = 'bold';
                estadoPagoLabel.style.marginTop = '10px';
                containerTipoEnvio.appendChild(estadoPagoLabel);
            }
        }
        if (estadoPagoLabel) {
            const color = (estadoPago.includes('CONFIRMADO') || estadoPago.includes('APROBADO')) ? 'var(--color-success, #28a745)' : '#db137a';
            estadoPagoLabel.innerHTML = `Estado del Pago: <span style="color: ${color};">${estadoPago}</span>`;
        }

        // 5. Conversión de Estado a Números para la barra
        let estadoActualNum = parseInt(estadoActualStr);
        if (isNaN(estadoActualNum)) {
            const str = String(estadoActualStr).toUpperCase().trim();
            if (str.includes("DISEÑO") || str.includes("DISENO")) estadoActualNum = 1;
            else if (str.includes("TALLER") || str.includes("FABRICACION")) estadoActualNum = 2;
            else if (str.includes("LISTO")) estadoActualNum = 3;
            else if (str.includes("CAMINO") || str.includes("ENVIO") || str.includes("ENVIADO")) estadoActualNum = 4;
            else if (str.includes("ENTREGADO")) estadoActualNum = 5;
            else estadoActualNum = 1;
        }

        // 6. Actualizar pasos (Bolas fucsias)
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`paso-${i}`);
            if (!step) continue;
            step.classList.remove('completed', 'active');
            if (i < estadoActualNum) step.classList.add('completed');
            else if (i === estadoActualNum) step.classList.add('active');
        }

        // 7. Lógica del Botón y Guía (Paso 4)
        const guiaContainer = document.getElementById('guiaContainer');
        const tituloPaso4 = document.getElementById('tituloPaso4');
        const descPaso4 = document.getElementById('descPaso4');

        if (tituloPaso4 && descPaso4 && guiaContainer) {
            if (estadoActualNum >= 4) {
                const transUpper = String(transportadora).toUpperCase().trim();
                const esNacional = transportadora !== '' && !transUpper.includes("LOCAL") && !transUpper.includes("DOMICILIO") && !transUpper.includes("POR COTIZAR");

                if (esNacional && guia !== '') {
                    let urlRastreo = "#";
                    
                    if (transUpper.includes("INTERRAPIDISIMO")) {
                        urlRastreo = `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${guia}`;
                    } else if (transUpper.includes("SERVIENTREGA")) {
                        urlRastreo = `https://www.servientrega.com/wps/portal/Colombia/transacciones-personas/rastreo-envios/detalle?guia=${guia}`;
                    } else if (transUpper.includes("ENVIA") || transUpper.includes("ENVÍA")) {
                        urlRastreo = `https://enviacolombia.com/Rastreo/Seguimiento?guia=${guia}`;
                    } else if (transUpper.includes("COORDINADORA")) {
                        urlRastreo = `https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/?guia=${guia}`;
                    }

                    tituloPaso4.innerText = `En Camino con ${transportadora}`;
                    descPaso4.innerText = "Tu paquete ya fue despachado. Usa este número de guía para rastrearlo directamente:";
                    
                    guiaContainer.innerHTML = `
                        <div style="background: var(--color-gray-light); padding: 10px; border-radius: var(--radius-sm); margin-top: 10px; display: flex; align-items: center; justify-content: space-between; border: 1px dashed var(--color-gray-medium);">
                            <span style="font-weight: bold; font-family: monospace; font-size: 1.1rem; letter-spacing: 1px;" id="numGuiaCopy">${guia}</span>
                            <button onclick="navigator.clipboard.writeText('${guia}'); if(typeof Utils !== 'undefined') Utils.toast('Guía copiada', 'success');" style="background: var(--color-black); color: var(--color-white); border: none; padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem;"><i class="fas fa-copy"></i> Copiar</button>
                        </div>
                        ${urlRastreo !== "#" ? `<a href="${urlRastreo}" target="_blank" class="transportadora-link" style="display: block; text-align: center; margin-top: 15px; padding: 12px; text-decoration: none; background: var(--color-pink); color: var(--color-white); border-radius: var(--radius-md); font-weight: bold; box-shadow: var(--shadow-sm); transition: transform 0.2s;">Rastrear en la Transportadora <i class="fas fa-external-link-alt"></i></a>` : ''}
                    `;
                    guiaContainer.style.display = 'block';
                } else if (estadoActualNum === 4) {
                    tituloPaso4.innerText = "En Camino";
                    descPaso4.innerText = "Tu pedido está en ruta hacia ti (Envío Local o Domiciliario).";
                    guiaContainer.style.display = 'none';
                } else {
                    guiaContainer.style.display = 'none';
                }
            } else {
                tituloPaso4.innerText = "En Camino";
                descPaso4.innerText = "Tu pedido está en ruta hacia ti.";
                guiaContainer.style.display = 'none';
            }
        }

        const resultDiv = document.getElementById('resultadoRastreo');
        if (resultDiv) resultDiv.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', Rastreo.init);