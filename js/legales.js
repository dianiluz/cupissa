/* js/legales.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DEL CENTRO LEGAL */
/* ===================================================== */

const Legales = {
    init: () => {
        Legales.bindEvents();
        Legales.checkHash();
    },

    bindEvents: () => {
        const navItems = document.querySelectorAll('.legales-nav li');
        
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                Legales.cambiarPestana(targetId);
                
                // Actualizar la URL sin recargar la página para poder compartir enlaces directos
                window.history.pushState(null, null, '#' + targetId);
            });
        });
    },

    cambiarPestana: (targetId) => {
        // Quitar 'active' de todos los botones y secciones
        document.querySelectorAll('.legales-nav li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.legal-section').forEach(sec => sec.classList.remove('active'));

        // Agregar 'active' al seleccionado
        const targetBoton = document.querySelector(`.legales-nav li[data-target="${targetId}"]`);
        const targetSeccion = document.getElementById(targetId);

        if (targetBoton && targetSeccion) {
            targetBoton.classList.add('active');
            targetSeccion.classList.add('active');
            
            // Si está en celular, hace scroll automático hacia el contenido
            if (window.innerWidth <= 900) {
                targetSeccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },

    checkHash: () => {
        // Lee si la URL trae un hash (ej: misitio.com/legales/#privacidad)
        const hash = window.location.hash.substring(1);
        if (hash) {
            Legales.cambiarPestana(hash);
        }
    }
};

document.addEventListener('DOMContentLoaded', Legales.init);