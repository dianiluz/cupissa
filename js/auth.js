/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN SEGURA */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        Auth.checkSession();
        Auth.bindEvents();
    },

    checkSession: () => {
        const activeUser = Utils.getUserSession();
        if (activeUser && window.location.pathname.includes('login.html')) {
            window.location.replace("/panel/");
        }
    },

    login: async (e) => {
        e.preventDefault();
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
            const fd = new FormData();
            fd.append('action', 'login');
            fd.append('email', email);
            fd.append('password', password);

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();
                
            if (data.success) {
                Auth.user = data;
                if (remember) localStorage.setItem('cupissa_user', JSON.stringify(data));
                else sessionStorage.setItem('cupissa_user', JSON.stringify(data));
                window.location.replace("/panel/");
            } else {
                errorDiv.innerText = "Correo o contraseña incorrectos.";
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.innerText = "Error de conexión. Verifica tu internet.";
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Iniciar Sesión";
        }
    },

    register: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnRegSubmit');
        const errorDiv = document.getElementById('regError');
        
        btn.disabled = true;
        btn.innerText = "Guardando datos...";
        errorDiv.style.display = 'none';

        const nombre = document.getElementById('regNombre') ? document.getElementById('regNombre').value : '';
        const cc = document.getElementById('regCC') ? document.getElementById('regCC').value : '';
        const email = document.getElementById('regEmail') ? document.getElementById('regEmail').value : '';
        const telefono = document.getElementById('regTelefono') ? document.getElementById('regTelefono').value : '';
        const password = document.getElementById('regPassword') ? document.getElementById('regPassword').value : '';

        try {
            const fd = new FormData();
            fd.append('action', 'registrarUsuario');
            fd.append('nombre', nombre);
            fd.append('cc', cc);
            fd.append('email', email);
            fd.append('telefono', telefono);
            fd.append('password', password);

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                alert("Cuenta creada exitosamente. Por favor, inicia sesión.");
                document.getElementById('formRegister').reset();
                document.getElementById('tabLogin').click(); 
            } else {
                errorDiv.innerText = data.error || "Error al registrar.";
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.innerText = "Error de conexión. Intenta de nuevo.";
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Crear Cuenta";
        }
    },

    recover: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnRecoverSubmit');
        const msgDiv = document.getElementById('recoverMsg');
        const email = document.getElementById('recoverEmail').value.trim();

        btn.disabled = true;
        btn.innerText = "Buscando correo...";
        msgDiv.style.display = 'none';

        try {
            const fd = new FormData();
            fd.append('action', 'recuperarPassword');
            fd.append('email', email);

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                msgDiv.style.color = "green";
                msgDiv.innerText = "Nueva clave enviada a tu correo.";
                msgDiv.style.display = 'block';
                setTimeout(() => document.getElementById('btnVolverLogin').click(), 3000);
            } else {
                msgDiv.style.color = "red";
                msgDiv.innerText = data.error || "No se pudo recuperar.";
                msgDiv.style.display = 'block';
            }
        } catch (error) {
            msgDiv.style.color = "red";
            msgDiv.innerText = "Error de conexión.";
            msgDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Enviar Clave";
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

        const recForm = document.getElementById('formRecover');
        if (recForm) recForm.addEventListener('submit', Auth.recover);
    }
};

document.addEventListener('DOMContentLoaded', Auth.init);