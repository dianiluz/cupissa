/* js/auth.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN SEGURA */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        // VERIFICACIÓN DE CONEXIÓN A SUPABASE
        if (!window.db) {
            console.error("❌ Error: Supabase no está inicializado. Revisa config.js y utils.js");
        } else {
            console.log("✅ Auth conectado a Supabase");
        }

        Auth.checkSession();
        Auth.checkSetupURL(); 
        Auth.bindEvents();
    },

    checkSession: () => {
        const activeUser = Utils.getUserSession ? Utils.getUserSession() : JSON.parse(localStorage.getItem('cupissa_user'));
        const path = window.location.pathname;
        const isAuthPage = path.includes('/auth/') || path.includes('/login/') || path.includes('/registro/');
        
        if (activeUser && isAuthPage) {
            window.location.replace("/cpanel/");
        }
    },

    // --- NUEVA FUNCIÓN: LOGIN CON GOOGLE ---
    loginConGoogle: async () => {
    try {
        const { data, error } = await window.db.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/cpanel/' }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error Google:", error.message);
        Utils.toast("Error al conectar con Google", "error");
    }
},

    login: async (e) => {
        if(e) e.preventDefault();
        const btn = document.getElementById('btnLoginSubmit');
        const errorDiv = document.getElementById('loginError');
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const remEl = document.getElementById('loginRemember');
        const remember = remEl ? remEl.checked : false;

        btn.disabled = true;
        btn.innerText = "Conectando...";
        if(errorDiv) errorDiv.style.display = 'none';

        try {
            const res = await Utils.fetchFromBackend('login', { email, password });
            if (res.success) {
                if (remember) localStorage.setItem('cupissa_user', JSON.stringify(res));
                else sessionStorage.setItem('cupissa_user', JSON.stringify(res));
                window.location.replace("/cpanel/");
            } else {
                if(errorDiv) {
                    errorDiv.innerText = res.error || "Credenciales incorrectas.";
                    errorDiv.style.display = 'block';
                }
                btn.disabled = false;
                btn.innerText = "Ingresar";
            }
        } catch (error) {
            if(errorDiv) {
                errorDiv.innerText = "Error de red. Intenta nuevamente.";
                errorDiv.style.display = 'block';
            }
            btn.disabled = false;
        }
    },

    bindEvents: () => {
        const loginForm = document.getElementById('formLogin');
        if (loginForm) loginForm.addEventListener('submit', Auth.login);

        // ASIGNAR EVENTO AL BOTÓN DE GOOGLE
        const btnGoogle = document.getElementById('btnGoogleLogin');
        if (btnGoogle) {
            btnGoogle.addEventListener('click', Auth.loginConGoogle);
        }
    }
};

document.addEventListener('DOMContentLoaded', Auth.init);