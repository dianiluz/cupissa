/* ===================================================== */
/* CUPISSA — UTILIDADES GLOBALES Y NOTIFICACIONES        */
/* ===================================================== */

// --- INICIALIZACIÓN GLOBAL DE SUPABASE (NUEVO MOTOR) ---
if (typeof window.supabase !== 'undefined' && !window.db) {
    window.db = window.supabase.createClient(
        CONFIG.supabase.url, 
        CONFIG.supabase.key
    );
    console.log("🟢 Conexión Supabase (Tienda) establecida correctamente");
}

const Utils = {
    // --- NUEVO MOTOR DE IMÁGENES INTELIGENTE ---
    getImagenUrl: (producto, color = null) => {
        if (!producto) return '/assets/logo.png';
        
        const ref = String(producto.ref || producto.referencia || "").trim();
        const imgDb = String(producto.imagenurl || "").trim();
        const baseRepo = "https://raw.githubusercontent.com/dianiluz/cupissa/main/assets/productos";

        // 1. Si Supabase tiene una URL completa de Drive o externa, se respeta
        if (imgDb.startsWith('http')) return imgDb.split('|')[0].trim();

        // 2. Si el panel admin ya está guardando solo la referencia o el nuevo sistema
        // Construimos la ruta: assets/productos/REFERENCIA/
        const folderPath = `${baseRepo}/${ref}`;

        // Si se pide un color específico (para el modal o carrito)
        if (color) {
            const colorClean = Utils.normalizeStr(color).replace(/\s+/g, '_');
            return `${folderPath}/${colorClean}.webp`;
        }

        // Si es para el catálogo o no hay color, intentamos cargar 'base.webp'
        // Pero si la DB trae una ruta vieja tipo "/assets/productos/CUP123.png", la usamos de fallback
        if (imgDb !== "" && imgDb.includes('.')) {
             return imgDb.startsWith('/') ? `https://raw.githubusercontent.com/dianiluz/cupissa/main${imgDb}` : imgDb;
        }

        return `${folderPath}/base.webp`;
    },

    // --- MANEJO DE NÚMEROS Y MONEDA ---
    safeNumber: (val) => {
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9]/g, '');
        return Number(clean) || 0;
    },

    formatCurrency: (amount) => {
        const num = Utils.safeNumber(amount);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    },

    // --- MANEJO DE TEXTO ---
    normalizeStr: (str) => {
        if (!str) return "";
        return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    },

    // Para carga aleatoria de productos 
    shuffle: (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },

    // --- COMUNICACIÓN CON BACKEND (APPS SCRIPT) ---
    fetchFromBackend: async (action, extraData = {}) => {
        try {
            const payload = { action: action, ...extraData };
            const response = await fetch(CONFIG.backendURL, { 
                method: 'POST', 
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return await response.json();
        } catch (error) {
            console.error(`Error en action ${action}:`, error);
            Utils.toast("Error de conexión con el servidor", "error");
            return { success: false, error: error.message };
        }
    },

    // --- GESTIÓN DE SESIÓN ---
    setUserSession: (userData) => {
        const data = {
            nombre: userData.nombre,
            email: userData.email,
            tipo_usuario: userData.tipo_usuario.toUpperCase(),
            loginTime: new Date().getTime()
        };
        localStorage.setItem('cupissa_user', JSON.stringify(data));
        sessionStorage.setItem('cupissa_user', JSON.stringify(data));
    },

    getUserSession: () => {
        const local = localStorage.getItem('cupissa_user');
        const session = sessionStorage.getItem('cupissa_user');
        return local ? JSON.parse(local) : (session ? JSON.parse(session) : null);
    },

    logout: () => {
        localStorage.removeItem('cupissa_user');
        sessionStorage.removeItem('cupissa_user');
        window.location.href = '/login/';
    },

    // --- UI Y UX ---
    toast: (msg, type = 'info') => {
        let toastBox = document.getElementById('cupissa-toast-box');
        if (!toastBox) {
            toastBox = document.createElement('div');
            toastBox.id = 'cupissa-toast-box';
            toastBox.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
            document.body.appendChild(toastBox);
        }
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#ff4d4d' : (type === 'success' ? '#28a745' : '#db137a');
        toast.style.cssText = `background-color: ${bgColor}; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: 'Poppins', sans-serif; font-size: 0.95rem; opacity: 0; transform: translateY(20px); transition: all 0.3s ease;`;
        toast.innerText = msg;
        toastBox.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('cupissa_theme');
    if (theme === 'dark') document.body.classList.add('dark-mode');
});