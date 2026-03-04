document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idTransaccion = urlParams.get('id'); // ID de Wompi
    
    // Wompi te manda algo como: /respuesta/?id=12345-abcde&env=prod
    if (!idTransaccion) {
        mostrarError("Transacción inválida. Revisa tu correo.");
        return;
    }

    try {
        // Consultar la API pública de Wompi para ver si se pagó
        const wompiRes = await fetch(`https://production.wompi.co/v1/transactions/${idTransaccion}`);
        const wompiData = await wompiRes.json();
        
        if (wompiData && wompiData.data) {
            const status = wompiData.data.status;
            const referenciaPedido = wompiData.data.reference; // Este es nuestro CUP-0001

            // Avisarle a nuestro Backend
            const fd = new FormData();
            fd.append('action', 'procesarRespuestaWompi');
            fd.append('id_pedido', referenciaPedido);
            fd.append('status', status);

            await fetch(CONFIG.backendURL, { method: 'POST', body: fd });

            if (status === "APPROVED") {
                document.getElementById('resTitulo').innerText = "¡Pago Exitoso!";
                document.getElementById('resTitulo').style.color = "var(--color-success)";
                document.getElementById('resMensaje').innerText = `Tu pedido ${referenciaPedido} ha sido agendado a producción.`;
                document.getElementById('loadingSpinner').style.display = "none";
                
                setTimeout(() => window.location.href = `/rastreo/?id=${referenciaPedido}`, 3000);
            } else {
                mostrarError(`El pago fue rechazado o declinado por tu banco. El pedido ${referenciaPedido} no fue agendado.`);
            }
        }
    } catch (error) {
        mostrarError("Hubo un error verificando con el banco.");
    }
});

function mostrarError(msg) {
    document.getElementById('resTitulo').innerText = "Pago Cancelado o Fallido";
    document.getElementById('resTitulo').style.color = "red";
    document.getElementById('resMensaje').innerText = msg;
    document.getElementById('loadingSpinner').style.display = "none";
    document.getElementById('btnVolver').style.display = "block";
}