/* js/rastreo.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE RASTREO PÚBLICO */
/* ===================================================== */

const Rastreo = {
    init: () => {
        const form = document.getElementById('formRastreo');
        if (form) form.addEventListener('submit', Rastreo.buscarPedido);

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            document.getElementById('inputIdPedido').value = id;
            Rastreo.ejecutarBusqueda(id);
        }
    },

    buscarPedido: (e) => {
        e.preventDefault();
        const id = document.getElementById('inputIdPedido').value.trim().toUpperCase();
        if (id) Rastreo.ejecutarBusqueda(id);
    },

    ejecutarBusqueda: async (idPedido) => {
        const btn = document.getElementById('btnRastrear');
        const err = document.getElementById('msgError');
        const resultDiv = document.getElementById('resultadoRastreo');

        btn.disabled = true; btn.innerText = "Buscando...";
        err.style.display = 'none'; resultDiv.classList.remove('active');

        try {
            const fd = new FormData();
            fd.append('action', 'rastrearPedido');
            fd.append('id_pedido', idPedido);

            const res = await fetch(typeof CONFIG !== 'undefined' ? CONFIG.backendURL : '', { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success && data.pedido) {
                Rastreo.mostrarResultado(data.pedido);
            } else {
                err.style.display = 'block';
            }
        } catch (error) {
            console.error("Error al buscar pedido:", error);
            if (typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Error de red. Intenta nuevamente.", "error");
        } finally {
            btn.disabled = false; btn.innerText = "Buscar";
        }
    },

    mostrarResultado: (pedidoData) => {
        // 1. Corrección principal: Extraer el objeto si el backend envía un arreglo
        const pedido = Array.isArray(pedidoData) ? pedidoData[0] : pedidoData;

        if (!pedido) return;

        // 2. Función interna de lectura robusta a prueba de cambios en Google Sheets
        const obtener = (nombreBuscado) => {
            const key = Object.keys(pedido).find(k => 
                String(k).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') === 
                nombreBuscado.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            return key ? pedido[key] : '';
        };

        // 3. Extracción de variables [cite: 65, 66, 67]
        const idPed = obtener('idpedido') || obtener('id') || '---';
        const cliente = obtener('cliente') || obtener('nombre') || '---';
        const transportadora = obtener('transportadora') || '';
        const tipo = obtener('tipo') || '';
        const guia = obtener('guia') || '';
        const estadoActualStr = obtener('estado') || '1';

        // 4. Pintar cabecera
        document.getElementById('lblPedidoId').innerText = idPed;
        document.getElementById('lblCliente').innerText = cliente;
        document.getElementById('lblTipoEnvio').innerText = transportadora !== '' ? transportadora : (tipo !== '' ? tipo : 'Local');

        // 5. Conversión de Estado (Soporta números del 1 al 5 o el texto del semáforo) [cite: 758]
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

        // 6. Actualizar línea de tiempo
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

        if (estadoActualNum >= 4) {
            const transUpper = String(transportadora).toUpperCase().trim();
            const esNacional = transportadora !== '' && !transUpper.includes("LOCAL") && !transUpper.includes("DOMICILIO");

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
                descPaso4.innerText = "Tu pedido está en ruta hacia ti (Envío Local/Domiciliario).";
                guiaContainer.style.display = 'none';
            } else {
                guiaContainer.style.display = 'none';
            }
        } else {
            tituloPaso4.innerText = "En Camino";
            descPaso4.innerText = "Tu pedido está en ruta hacia ti.";
            guiaContainer.style.display = 'none';
        }

        document.getElementById('resultadoRastreo').classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', Rastreo.init);