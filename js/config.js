/* ===================================================== */
/* CUPISSA — CONFIGURACIÓN GLOBAL Y REGLAS DE NEGOCIO    */
/* ===================================================== */

const CONFIG = {
    brandName: "CUPISSA",
    whatsappNumber: "573147671380",
    baseURL: "https://cupissa.com",
    contactEmail: "contacto@cupissa.com",
    
    // URL del nuevo script de Google (Backend)
    backendURL: "https://script.google.com/macros/s/AKfycbz0lEEXDtWHyN0EAks9WAxXAni6B9agd29VVflEUaLTMWpMgaTmc_gtBVfHgEncA70/exec",

    // SUPABASE (El nuevo cerebro de datos para tu catálogo)
    supabase: {
        url: "https://dhsoimmxfapcppdyjhcj.supabase.co",
        key: "sb_publishable__F5Xz9UmI0-HOreX3MhFqA_9eZX0qRJ"
    },

    // LÓGICA DE PRECIOS Y FIDELIZACIÓN
    porcentajeAnticipo: 0.20, // 20% obligatorio para agendar
    puntosPorCada: 1000,      // $1.000 pagados = 1 punto
    cupicoinsPorPunto: 5,     // 1 punto = 5 CupiCoins

    // COMISIONES DE PASARELAS
    comisiones: {
        wompi: {
            porcentaje: 0.0265, // 2.65%
            fijo: 700,          // + $700
            ivaSobreComision: 0.19, // + 19% del valor de la comisión
            sumaAlCliente: true  // Wompi se le cobra al cliente
        },
        addi: {
            porcentaje: 0.09,   // 9% de comisión
            sumaAlCliente: false // CUPISSA asume este costo (asumido internamente)
        }
    },

    // GEOGRAFÍA Y ENVÍOS
    zonasLocales: [
        "BARRANQUILLA", 
        "SOLEDAD", 
        "MALAMBO", 
        "GALAPA", 
        "PUERTO COLOMBIA"
    ],
    
    transportadorasNacionales: [
        "INTERRAPIDISIMO", 
        "ENVÍA", 
        "SERVIENTREGA", 
        "COORDINADORA"
    ],

    // ESTADOS DEL SEMÁFORO DE PRODUCCIÓN 
    estadosProduccion: {
        "0": { nombre: "PENDIENTE PAGO", color: "#777" },
        "1": { nombre: "DISEÑO", color: "#007bff" },
        "2": { nombre: "TALLER", color: "#fd7e14" },
        "3": { nombre: "LISTO PARA ENVÍO", color: "#28a745" },
        "4": { nombre: "EN CAMINO", color: "#6f42c1" },
        "5": { nombre: "ENTREGADO", color: "#db137a" },
        "9": { nombre: "CANCELADO", color: "#000" }
    },

    // FUNCIONES DE CÁLCULO ÚTILES PARA EL FRONTEND
    calcularWompi: (monto) => {
        const base = (monto * CONFIG.comisiones.wompi.porcentaje) + CONFIG.comisiones.wompi.fijo;
        const iva = base * CONFIG.comisiones.wompi.ivaSobreComision;
        return Math.round(base + iva);
    },

    formatMoney: (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
};