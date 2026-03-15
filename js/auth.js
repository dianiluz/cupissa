/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN (SUPABASE DIRECTO)  */
/* ===================================================== */

const Auth = {
    init: () => {
        // 1. FUERZA BRUTA: Asegurar conexión a Supabase antes de hacer nada
        if (typeof window.supabase !== 'undefined' && !window.db) {
            window.db = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
        }

        if (!window.db) {
            console.error("❌ Supabase no cargó. Revisa el orden de los scripts.");
            return;
        }

        // 2. ESCUCHAR CAMBIOS (Sirve para cuando Google devuelve al usuario)
        window.db.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log("✅ Sesión detectada:", session.user.email);
                // El panel.js se encargará de crear o sincronizar al usuario en la tabla 'usuarios'
                // Solo redirigimos si estamos en la página de auth
                if (window.location.pathname.includes('/auth') || window.location.pathname.includes('/login')) {
                    window.location.replace("/cpanel/");
                }
            }
        });

        Auth.checkSession();
        Auth.bindEvents();
    },

    checkSession: async () => {
        // Verificar si ya hay una sesión activa de Supabase
        if (window.db) {
            const { data: { session } } = await window.db.auth.getSession();
            const path = window.location.pathname;
            const isAuthPage = path.includes('/auth') || path.includes('/login') || path.includes('/registro');
            
            if (session && isAuthPage) {
                window.location.replace("/cpanel/");
            }
        }
    },

    /* ===================================================== */
    /* LOGIN TRADICIONAL (CORREO Y CLAVE)                    */
    /* ===================================================== */
    login: async (e) => {
        if (e) e.preventDefault();
        
        const btn = document.getElementById('btnLoginSubmit');
        const errorDiv = document.getElementById('loginError');
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) return Utils.toast("Llena todos los campos", "error");

        if (btn) { btn.disabled = true; btn.innerText = "Conectando..."; }
        if (errorDiv) errorDiv.style.display = 'none';

        try {
            // LOGIN DIRECTO CON SUPABASE (Reemplaza a Google Apps Script)
            const { data, error } = await window.db.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Si pasa, onAuthStateChange lo detectará y lo mandará a /cpanel/
            Utils.toast("¡Bienvenido!", "success");

        } catch (error) {
            console.error("Error Login:", error.message);
            if (errorDiv) {
                // Traducir errores comunes de Supabase
                let msg = "Credenciales incorrectas.";
                if (error.message.includes("Invalid login")) msg = "Correo o contraseña incorrectos.";
                if (error.message.includes("Email not confirmed")) msg = "Debes confirmar tu correo primero.";
                
                errorDiv.innerText = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.toast("Error: Credenciales incorrectas", "error");
            }
            if (btn) { btn.disabled = false; btn.innerText = "Ingresar"; }
        }
    },

    /* ===================================================== */
    /* LOGIN CON GOOGLE                                      */
    /* ===================================================== */
    loginConGoogle: async () => {
        try {
            const { data, error } = await window.db.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: { access_type: 'offline', prompt: 'select_account' }
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error Google:", error.message);
            Utils.toast("Error al conectar con Google.", "error");
        }
    },

    /* ===================================================== */
    /* RECUPERAR CONTRASEÑA                                  */
    /* ===================================================== */
    recuperarClave: async (e) => {
        if (e) e.preventDefault();

        let email = document.getElementById('recEmail')?.value.trim();
        if (!email) email = prompt("Ingresa el correo registrado:");
        if (!email) return; 

        const btn = document.getElementById('btnRecSubmit');
        const msgDiv = document.getElementById('recMsg');
        
        if(btn) { btn.disabled = true; btn.innerText = "Enviando..."; }
        if(msgDiv) { msgDiv.style.display = 'none'; }

        try {
            // AQUÍ LLAMAMOS A TU GOOGLE APPS SCRIPT
            const res = await Utils.fetchFromBackend('recuperarClave', { email: email });

            if (res.success) {
                if(msgDiv) {
                    msgDiv.style.display = 'block';
                    msgDiv.style.color = 'green';
                    msgDiv.innerText = "¡Enviado! Revisa tu bandeja de entrada o SPAM.";
                } else {
                    alert("¡Correo enviado exitosamente!");
                }
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            console.error("Error:", error);
            if(msgDiv) {
                msgDiv.style.display = 'block';
                msgDiv.style.color = 'red';
                msgDiv.innerText = "Error: " + error.message;
            } else {
                Utils.toast("Error: " + error.message, "error");
            }
        } finally {
            if(btn) { btn.disabled = false; btn.innerText = "Enviar Enlace"; }
        }
    },

    registro: async (e) => {
        if (e) e.preventDefault();
        
        const btn = document.getElementById('btnRegSubmit');
        const errorDiv = document.getElementById('regError');
        
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const telefono = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;

        if (!email || !password || !nombre) return Utils.toast("Llena los campos obligatorios", "error");

        if (btn) { btn.disabled = true; btn.innerText = "Creando..."; }
        if (errorDiv) errorDiv.style.display = 'none';

        try {
            // PASO 1: Registrar en la Bóveda (El Cadenero)
            const { data: authData, error: authError } = await window.db.auth.signUp({
                email: email,
                password: password,
                options: { data: { full_name: nombre } } // Guardamos el nombre en Auth por si acaso
            });

            if (authError) throw authError;

            // PASO 2: Guardar en tu tabla 'usuarios' (El Salón VIP)
            // Usamos 'upsert' por si el cliente ya había comprado antes sin loguearse
            const { error: dbError } = await window.db.from('usuarios').upsert({
                email: email,
                nombre: nombre,
                telefono: telefono,
                tipo_usuario: 'CLIENTE',
                activo: 'SI',
                nivel_cuenta: 'Cliente Cupissa'
            }, { onConflict: 'email' });

            if (dbError) console.error("Error guardando en tabla usuarios:", dbError);

            Utils.toast("¡Cuenta creada exitosamente!", "success");
            
            // Lo mandamos al panel directo (ya está logueado por signUp)
            setTimeout(() => window.location.replace("/cpanel/"), 1000);

        } catch (error) {
            console.error("Error Registro:", error.message);
            if (errorDiv) {
                let msg = "Error al crear la cuenta.";
                if (error.message.includes("already registered")) msg = "Este correo ya tiene una cuenta. Intenta iniciar sesión.";
                if (error.message.includes("Password should be")) msg = "La contraseña debe tener al menos 6 caracteres.";
                errorDiv.innerText = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.toast("Error: " + error.message, "error");
            }
            if (btn) { btn.disabled = false; btn.innerText = "Registrarme"; }
        }
    },

    /* ===================================================== */
    /* VINCULAR EVENTOS A LOS BOTONES                        */
    /* ===================================================== */
    /* ===================================================== */
    /* VINCULAR EVENTOS A LOS BOTONES                        */
    /* ===================================================== */
    bindEvents: () => {
        // Formulario Normal
        const loginForm = document.getElementById('formLogin');
        if (loginForm) loginForm.addEventListener('submit', Auth.login);

        // Formulario de Registro (CORREGIDO: Estaba atrapado en el if de abajo)
        const regForm = document.getElementById('formRegister');
        if (regForm) regForm.addEventListener('submit', Auth.registro);

        // Botón Google
        const btnGoogle = document.getElementById('btnGoogleLogin') || document.querySelector('[onclick*="loginConGoogle"]');
        if (btnGoogle) btnGoogle.addEventListener('click', Auth.loginConGoogle);

        // Botón Recuperar Clave
        const linkRecuperar = document.getElementById('btnRecuperarClave') || 
                              Array.from(document.querySelectorAll('a')).find(el => el.textContent.toLowerCase().includes('olvidaste') || el.textContent.toLowerCase().includes('contraseña'));
        
        if (linkRecuperar) {
            linkRecuperar.href = "#"; // Evitar que la página salte
            linkRecuperar.addEventListener('click', Auth.recuperarClave);
        }
    }
    };

document.addEventListener('DOMContentLoaded', Auth.init);