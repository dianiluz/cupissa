/* js/auth.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN SEGURA */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        Auth.checkSession();
        Auth.checkSetupURL(); 
        Auth.bindEvents();
    },

    checkSession: () => {
        const activeUser = Utils.getUserSession ? Utils.getUserSession() : JSON.parse(localStorage.getItem('cupissa_user'));
        const path = window.location.pathname;
        
        // CORRECCIÓN: Solo redirigir al panel si estamos en login/registro y ya hay sesión
        const isAuthPage = path.includes('/auth/') || path.includes('/login/') || path.includes('/registro/');
        
        if (activeUser && isAuthPage) {
            window.location.replace("/cpanel/");
        }
    },

    checkSetupURL: () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'setup') {
            setTimeout(() => {
                ['loginBox', 'registerBox', 'recoverBox'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.style.display = 'none';
                });
                const setupBox = document.getElementById('setupBox');
                if (setupBox) {
                    setupBox.style.display = 'block';
                    document.getElementById('setupEmail').value = params.get('email');
                    document.getElementById('setupToken').value = params.get('token');
                }
            }, 100);
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
        errorDiv.style.display = 'none';

        try {
            const res = await Utils.fetchFromBackend('login', { email, password });
            if (res.success) {
                if (remember) localStorage.setItem('cupissa_user', JSON.stringify(res));
                else sessionStorage.setItem('cupissa_user', JSON.stringify(res));
                
                // Redirigir siempre a la nueva carpeta del panel
                window.location.replace("/cpanel/");
            } else {
                errorDiv.innerText = res.error || "Credenciales incorrectas.";
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.innerText = "Ingresar";
            }
        } catch (error) {
            errorDiv.innerText = "Error de red. Intenta nuevamente.";
            errorDiv.style.display = 'block';
            btn.disabled = false;
        }
    },

    logout: () => {
        localStorage.removeItem('cupissa_user');
        sessionStorage.removeItem('cupissa_user');
        window.location.replace("/");
    },

    bindEvents: () => {
        const loginForm = document.getElementById('formLogin');
        if (loginForm) loginForm.addEventListener('submit', Auth.login);
    }
};

document.addEventListener('DOMContentLoaded', Auth.init);