/* ===================================================== */
/* API.JS - CONEXIÓN CENTRALIZADA CON EL BACKEND         */
/* ===================================================== */

const API = {
    // La URL de tu Web App de Google Apps Script (obtenida al desplegar) [cite: 89]
    URL: "https://script.google.com/macros/s/AKfycbz0IEEXDtWHyN0EAks9WAxXAni6B9agd29VVfIEUaLTMWpMgaTmc_gtBVfHgEncA70/exec",

    /**
     * Motor de peticiones genérico para CUPISSA
     * Maneja el envío de datos y la recepción de JSON
     */
    call: async (action, data = {}) => {
        try {
            // Añadimos la acción a los parámetros para el switch de Main.gs
            const params = new URLSearchParams({ action, ...data });
            
            // Usamos el modo 'no-cors' no es necesario si devolvemos ContentService.MimeType.JSON en GAS
            const response = await fetch(`${API.URL}?${params.toString()}`, {
                method: 'POST',
                mode: 'cors'
            });

            if (!response.ok) throw new Error("Error en la red");
            return await response.json();
        } catch (error) {
            console.error(`Error en API action: ${action}`, error);
            return { success: false, error: "No se pudo conectar con el servidor." };
        }
    },

    // --- MÓDULO DE AUTENTICACIÓN ---

    login: async (email, password) => {
        // Llama a case 'login' en Main.gs
        const res = await API.call('login', { email, password });
        
        if (res.success) {
            // Almacenamiento local de la sesión
            localStorage.setItem('cupissa_user', JSON.stringify({
                nombre: res.nombre,
                email: res.email,
                rol: res.tipo_usuario.toUpperCase()
            }));

            // Redirección física según privilegios del documento [cite: 146-149]
            const rutas = {
                'ADMIN': '/panel/admin/',
                'CLIENTE': '/panel/cliente/',
                'ASESOR': '/panel/asesor/',
                'FINANZAS': '/panel/finanzas/',
                'EQUIPO': '/panel/equipo/', // Panel producción compartido [cite: 148]
                'PRODUCCION': '/panel/equipo/' 
            };

            const destino = rutas[res.tipo_usuario.toUpperCase()] || '/panel/cliente/';
            window.location.href = destino;
        }
        return res;
    },

    registrar: async (datosUsuario) => {
        // Llama a case 'registrarUsuario' en Main.gs
        return await API.call('registrarUsuario', datosUsuario);
    },

    // --- MÓDULO DE PRODUCTOS ---

    obtenerCatalogo: async () => {
        // Llama a case 'obtenerCatalogoBase' en Main.gs [cite: 23]
        return await API.call('obtenerCatalogoBase');
    },

    // --- MÓDULO DE PEDIDOS ---

    crearPedido: async (datosPedido) => {
        // Llama a case 'registrarPedido' en Main.gs [cite: 65, 323]
        // datosPedido debe incluir productos como string JSON
        return await API.call('registrarPedido', datosPedido);
    },

    rastrear: async (id_pedido) => {
        // Llama a case 'rastrearPedido' en Main.gs [cite: 33, 158]
        return await API.call('rastrearPedido', { id_pedido });
    },

    // --- MÓDULO DE PRODUCCIÓN (SEMÁFORO) ---

    actualizarEstado: async (id_pedido, nuevo_estado, rol_usuario) => {
        // Llama a case 'actualizarProduccion' (nuevo módulo) [cite: 156]
        return await API.call('actualizarProduccion', { 
            id_pedido, 
            nuevo_estado, 
            rol_usuario 
        });
    }
};