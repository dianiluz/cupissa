/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN SEGURA */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        Auth.checkSession();
        Auth.checkSetupURL(); // Verifica si viene del correo de bienvenida
        Auth.bindEvents();
    },

    checkSession: () => {
        const activeUser = Utils.getUserSession();
        if (activeUser && window.location.pathname.includes('/auth/')) {
            window.location.replace("/cliente/");
        }
    },

    checkSetupURL: () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'setup') {
            // Un micro-retraso para asegurar que el DOM cargó y forzar la vista correcta
            setTimeout(() => {
                const cajas = ['loginBox', 'registerBox', 'recoverBox'];
                cajas.forEach(id => {
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
                Auth.user = res;
                if (remember) localStorage.setItem('cupissa_user', JSON.stringify(res));
                else sessionStorage.setItem('cupissa_user', JSON.stringify(res));
                window.location.replace("/cliente/");
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
            btn.innerText = "Ingresar";
        }
    },

    setupPassword: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSetupSubmit');
        const msgDiv = document.getElementById('setupMsg');
        
        const email = document.getElementById('setupEmail').value;
        const token = document.getElementById('setupToken').value;
        const password = document.getElementById('setupPassword').value;

        if(password.length < 6) {
            msgDiv.style.color = "var(--color-danger)";
            msgDiv.innerText = "La contraseña debe tener al menos 6 caracteres.";
            msgDiv.style.display = 'block';
            return;
        }

        btn.disabled = true; 
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        msgDiv.style.display = 'none';

        try {
            const res = await Utils.fetchFromBackend('restablecerClave', { email, token, password });
            
            if (res.success) {
                Utils.toast("¡Contraseña creada con éxito!", "success");
                
                // Hacer auto-login inmediatamente
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                await Auth.login(); 
            } else {
                msgDiv.style.color = "var(--color-danger)";
                msgDiv.innerText = res.error || "El enlace expiró o es inválido.";
                msgDiv.style.display = 'block';
                btn.disabled = false; 
                btn.innerText = "Guardar y Entrar";
            }
        } catch (err) {
            msgDiv.style.color = "var(--color-danger)";
            msgDiv.innerText = "Error de conexión.";
            msgDiv.style.display = 'block';
            btn.disabled = false; 
            btn.innerText = "Guardar y Entrar";
        }
    },

    register: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnRegSubmit');
        const errorDiv = document.getElementById('regError');
        
        btn.disabled = true;
        btn.innerText = "Creando cuenta...";
        errorDiv.style.display = 'none';

        const dataRegistro = {
            nombre: document.getElementById('regNombre').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            telefono: document.getElementById('regPhone').value.trim(),
            password: document.getElementById('regPassword').value,
            rol: "CLIENTE"
        };

        try {
            const res = await Utils.fetchFromBackend('registrarUsuario', dataRegistro);
            
            if (res.success) {
                Utils.toast("¡Cuenta creada! Ya puedes iniciar sesión.", "success");
                document.getElementById('formRegister').reset();
                document.getElementById('registerBox').style.display = 'none';
                document.getElementById('loginBox').style.display = 'block';
            } else {
                errorDiv.innerText = res.error || "No se pudo crear la cuenta.";
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.innerText = "Error de red. Intenta nuevamente.";
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Registrarme";
        }
    },

    logout: () => {
        localStorage.removeItem('cupissa_user');
        sessionStorage.removeItem('cupissa_user');
        Auth.user = null;
        window.location.replace("/");
    },

    bindEvents: () => {
        const loginForm = document.getElementById('formLogin');
        if (loginForm) loginForm.addEventListener('submit', Auth.login);

        const regForm = document.getElementById('formRegister');
        if (regForm) regForm.addEventListener('submit', Auth.register);

        const setupForm = document.getElementById('formSetup');
        if (setupForm) setupForm.addEventListener('submit', Auth.setupPassword);
    }
};

document.addEventListener('DOMContentLoaded', Auth.init);