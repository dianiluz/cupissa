/* js/trabajo.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE POSTULACIONES (CARRERAS) */
/* ===================================================== */

const Trabajo = {
    vacantesBase: [
        {
            id: "ASESOR_COMERCIAL",
            titulo: "Asesor Freelance",
            descripcion: "Genera ingresos adicionales recomendando nuestros productos a tu red de contactos. Ideal para personas con habilidades sociales y ganas de emprender sin dejar su trabajo actual.",
            responsabilidades: [
                "Reomendación de productos vía WhatsApp o canales propios.",
                "Gestión de pedidos desde tu propio Panel de Asesor Cupissa.",
            ],
            ofrecemos: [
                "Comisión del 10% por cada venta completada y pagada.",
                "Trabajo 100% remoto bajo tu propio ritmo y horario.",
                "Contrato por prestación de servicios."
            ]
        },
        {
            id: "CREADOR_UGC",
            titulo: "Creador de Contenido UGC (Intercambio)",
            descripcion: "Si te encanta crear videos en TikTok o reels en Instagram y tienes una comunidad activa, te queremos en Cupissa. Necesitamos creadores auténticos que muestren nuestros productos en uso.",
            responsabilidades: [
                "Grabar unboxings, reviews y videos de estilo de vida usando ropa y detalles Cupissa.",
                "Entregar material crudo y editado mensualmente.",
                "Etiquetar y colaborar con la marca en redes sociales."
            ],
            ofrecemos: [
                "Modalidad de INTERCAMBIO: Recibe productos 100% personalizados por tu contenido.",
                "Visibilidad en nuestras plataformas oficiales.",
                "Posibilidad futura de pasar a contratos remunerados según rendimiento."
            ]
        }
    ],

    init: () => {
        console.log("Iniciando módulo de Trabajo/Vacantes...");
        Trabajo.renderVacantes();
        Trabajo.bindEvents();
    },

    renderVacantes: () => {
        const container = document.getElementById('vacantesContainer');
        const select = document.getElementById('trabVacante');
        
        console.log("Contenedor de vacantes:", container);
        console.log("Select de vacantes:", select);

        if (!container || !select) {
            console.error("ERROR: No se encontraron los contenedores HTML para las vacantes.");
            return;
        }

        let html = '';
        let options = '<option value="" disabled selected>Selecciona una opción</option>';

        Trabajo.vacantesBase.forEach(v => {
            html += `
                <div class="vacante-card fade-in">
                    <h3>${v.titulo}</h3>
                    <p><strong>¿Qué harás?</strong> ${v.descripcion}</p>
                    <p><strong>Tus responsabilidades:</strong></p>
                    <ul>${v.responsabilidades.map(r => `<li>${r}</li>`).join('')}</ul>
                    <p><strong>¿Qué te ofrecemos?</strong></p>
                    <ul>${v.ofrecemos.map(o => `<li>${o}</li>`).join('')}</ul>
                </div>
            `;
            options += `<option value="${v.titulo}">${v.titulo}</option>`;
        });

        container.innerHTML = html;
        select.innerHTML = options;
        console.log("Vacantes renderizadas correctamente.");
    },

    procesarPostulacion: async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btnEnviarPostulacion');
        const vacante = document.getElementById('trabVacante').value;
        const nombre = document.getElementById('trabNombre').value.trim();
        const telefono = document.getElementById('trabTelefono').value.trim();
        const correo = document.getElementById('trabCorreo').value.trim();
        const ciudad = document.getElementById('trabCiudad').value.trim();
        const link = document.getElementById('trabLink').value.trim();
        const fileInput = document.getElementById('trabCV');

        if (!document.getElementById('trabTerminos').checked) {
            if(typeof Utils !== 'undefined') Utils.toast("Debes aceptar los Términos y Condiciones.", "warning");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';

        const payload = {
            vacante: vacante,
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            ciudad: ciudad,
            enlace: link
        };

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = error => reject(error);
                });
                payload.cv_b64 = base64;
                payload.cv_name = file.name;
                payload.cv_mime = file.type;
            } catch (err) {
                if(typeof Utils !== 'undefined') Utils.toast("Hubo un problema procesando el archivo adjunto.", "error");
                btn.disabled = false;
                btn.innerHTML = 'Enviar Postulación <i class="fas fa-paper-plane"></i>';
                return;
            }
        }

        try {
            const res = await Utils.fetchFromBackend('registrarPostulacion', payload);
            if (res.success) {
                if(typeof Utils !== 'undefined') Utils.toast("¡Postulación enviada con éxito!", "success");
                document.getElementById('formTrabajo').reset();
            } else {
                if(typeof Utils !== 'undefined') Utils.toast("No pudimos enviar tu postulación. Intenta más tarde.", "error");
            }
        } catch (error) {
            if(typeof Utils !== 'undefined') Utils.toast("Error de conexión.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Enviar Postulación <i class="fas fa-paper-plane"></i>';
        }
    },

    bindEvents: () => {
        const form = document.getElementById('formTrabajo');
        if (form) {
            form.addEventListener('submit', Trabajo.procesarPostulacion);
        }
    }
};

// SEGURO DE CARGA: Garantiza que el código se ejecute aunque el HTML tarde en cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Trabajo.init);
} else {
    Trabajo.init();
}