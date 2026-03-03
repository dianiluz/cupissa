/* ===================================================== */
/* CUPISSA — LÓGICA DE RASTREO PÚBLICO */
/* ===================================================== */

const Rastreo = {
    init: () => {
        const form = document.getElementById('formRastreo');
        form.addEventListener('submit', Rastreo.buscarPedido);

        // Si viene un ID por la URL (ej: /rastreo/?id=CUP-0001), buscar automáticamente
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
        if (id) {
            Rastreo.ejecutarBusqueda(id);
        }
    },

    ejecutarBusqueda: async (idPedido) => {
        const btn = document.getElementById('btnRastrear');
        const err = document.getElementById('msgError');
        const resultDiv = document.getElementById('resultadoRastreo');

        btn.disabled = true;
        btn.innerText = "Buscando...";
        err.style.display = 'none';
        resultDiv.classList.remove('active');

        try {
            const fd = new FormData();
            fd.append('action', 'rastrearPedido'); // Esta función se agregará al backend
            fd.append('id_pedido', idPedido);

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success && data.pedido) {
                Rastreo.mostrarResultado(data.pedido);
            } else {
                err.style.display = 'block';
            }
        } catch (error) {
            err.innerText = "Error de conexión. Intenta nuevamente.";
            err.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Buscar";
        }
    },

    mostrarResultado: (pedido) => {
        document.getElementById('lblPedidoId').innerText = pedido.IDPedido;
        document.getElementById('lblCliente').innerText = pedido.NombreCliente;
        document.getElementById('lblTipoEnvio').innerText = pedido.Transportadora && pedido.Transportadora !== '' ? pedido.Transportadora : pedido.Tipo;

        const estadoActual = parseInt(pedido.Estado) || 1; // 1: Agendado, 2: Fabricación, 3: Listo, 4: En camino, 5: Entregado

        // Resetear clases
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`paso-${i}`);
            step.classList.remove('completed', 'active');
            
            if (i < estadoActual) {
                step.classList.add('completed');
            } else if (i === estadoActual) {
                step.classList.add('active');
            }
        }

        // Manejar lógica de guía si está en estado 4 (En Camino) y tiene URL
        const guiaContainer = document.getElementById('guiaContainer');
        const tituloPaso4 = document.getElementById('tituloPaso4');
        const descPaso4 = document.getElementById('descPaso4');

        if (estadoActual >= 4 && pedido.GuiaTransportadora && pedido.URLtransportadora) {
            tituloPaso4.innerText = "En Camino con Transportadora";
            descPaso4.innerText = `Guía: ${pedido.GuiaTransportadora}`;
            document.getElementById('linkGuia').href = pedido.URLtransportadora;
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