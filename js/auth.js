/* js/auth.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN SEGURA */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        // 1. ESCUCHAR CAMBIOS DE AUTENTICACIÓN (Para Google)
        if (window.db) {
            window.db.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    console.log("Sesión detectada desde Google:", session.user);
                    
                    // Normalizamos los datos de Google para que coincidan con tu sistema
                    const userData = {
                        nombre: session.user.user_metadata.full_name || session.user.user_metadata.name,
                        email: session.user.email,
                        tipo_usuario: 'CLIENTE', // Por defecto
                        success: true
                    };

                    // Guardamos en LocalStorage para que todo el sitio sepa quién es
                    localStorage.setItem('cupissa_user', JSON.stringify(userData));
                    
                    // Redirigimos al panel
                    window.location.replace("/cpanel/");
                }
            });
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
        if (!window.db) {
            window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
        }

        const { data, error } = await window.db.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Quitamos el redirectTo manual para que no choque mientras probamos
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                }
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error("Error:", error.message);
        Utils.toast("Error: " + error.message, "error");
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