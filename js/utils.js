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
            // Usamos URLSearchParams para asegurar compatibilidad con e.parameter de GAS
            const params = new URLSearchParams();
            params.append('action', action);
            Object.keys(extraData).forEach(key => params.append(key, extraData[key]));
            
            const response = await fetch(CONFIG.backendURL, { 
                method: 'POST', 
                body: params,
                mode: 'cors' 
            });
            
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return await response.json();
        } catch (error) {
            console.error(`Error en action ${action}:`, error);
            Utils.toast("Error de conexión con el servidor", "error");
            return { success: false, error: error.message };
        }
    },

    getClientIP: async () => {
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            return data.ip || "";
        } catch (e) {
            return "";
        }
    },

    getDeviceInfo: () => {
        const ua = navigator.userAgent;

        let device = "Desktop";
        if (/mobile/i.test(ua)) device = "Mobile";
        if (/tablet/i.test(ua)) device = "Tablet";

        let browser = "Unknown";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        let os = "Unknown";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone")) os = "iOS";

        return {
            device,
            browser,
            os,
            user_agent: ua
        };
    },

    // --- GESTIÓN DE SESIÓN  ---
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
        
        const data = local ? JSON.parse(local) : (session ? JSON.parse(session) : null);
        return data;
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
        // Usando los colores oficiales de la marca 
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
    },

    // --- TEMAS (MODO CLARO/OSCURO) ---
    toggleDarkMode: () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('cupissa_theme', isDark ? 'dark' : 'light');
    },

    applyTheme: () => {
        const theme = localStorage.getItem('cupissa_theme');
        if (theme === 'dark') document.body.classList.add('dark-mode');
    }
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', Utils.applyTheme);

document.addEventListener("DOMContentLoaded",()=>{
    if(!localStorage.getItem("cookieConsent")){
        const banner = document.getElementById("cookieBanner");
        if(!localStorage.getItem("cookieConsent") && banner){
            banner.style.display="flex";
        }
        const btn = document.getElementById("acceptCookies");
        if(btn){
            btn.onclick=()=>{
                localStorage.setItem("cookieConsent","true");
                banner.style.display="none";
            };
        }
    }

    const btnAccept = document.getElementById("acceptCookies");
    if(btnAccept) {
        btnAccept.onclick=()=>{
            localStorage.setItem("cookieConsent","true");
            const banner = document.getElementById("cookieBanner");
            if(banner) banner.style.display="none";
        };
    }
});