/* ===================================================== */
/* CUPISSA — LÓGICA DE RASTREO PÚBLICO */
/* ===================================================== */

const Rastreo = {
    init: () => {
        const form = document.getElementById('formRastreo');
        form.addEventListener('submit', Rastreo.buscarPedido);

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

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success && data.pedido) {
                Rastreo.mostrarResultado(data.pedido);
            } else {
                err.style.display = 'block';
            }
        } catch (error) {
            Utils.toast("Error de red. Intenta nuevamente.", "error");
        } finally {
            btn.disabled = false; btn.innerText = "Buscar";
        }
    },

    mostrarResultado: (pedido) => {
        document.getElementById('lblPedidoId').innerText = pedido.IDPedido;
        document.getElementById('lblCliente').innerText = pedido.NombreCliente;
        document.getElementById('lblTipoEnvio').innerText = pedido.Transportadora && pedido.Transportadora !== '' ? pedido.Transportadora : pedido.Tipo;

        const estadoActual = parseInt(pedido.Estado) || 1; 

        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`paso-${i}`);
            step.classList.remove('completed', 'active');
            if (i < estadoActual) step.classList.add('completed');
            else if (i === estadoActual) step.classList.add('active');
        }

        const guiaContainer = document.getElementById('guiaContainer');
        const tituloPaso4 = document.getElementById('tituloPaso4');
        const descPaso4 = document.getElementById('descPaso4');

        if (estadoActual >= 4 && pedido.GuiaTransportadora && pedido.URLtransportadora) {
            tituloPaso4.innerText = "En Camino con Transportadora";
            descPaso4.innerText = "Tu paquete ya fue despachado. Usa este número de guía para rastrearlo:";
            
            guiaContainer.innerHTML = `
                <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin-top: 10px; display: flex; align-items: center; justify-content: space-between; border: 1px dashed #ccc;">
                    <span style="font-weight: bold; font-family: monospace; font-size: 1.1rem; letter-spacing: 1px;" id="numGuiaCopy">${pedido.GuiaTransportadora}</span>
                    <button onclick="navigator.clipboard.writeText('${pedido.GuiaTransportadora}'); Utils.toast('Guía copiada', 'success');" style="background: var(--color-black); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;"><i class="fas fa-copy"></i> Copiar</button>
                </div>
                <a href="${pedido.URLtransportadora}" target="_blank" class="transportadora-link" style="display: block; text-align: center; margin-top: 10px; padding: 10px; text-decoration: none;">Rastrear en Transportadora <i class="fas fa-external-link-alt"></i></a>
            `;
            guiaContainer.style.display = 'block';
        } else {
            tituloPaso4.innerText = "En Camino";
            descPaso4.innerText = "Tu pedido está en ruta hacia ti.";
            guiaContainer.style.display = 'none';
        }

        document.getElementById('resultadoRastreo').classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', Rastreo.init);