/* ===================================================== */
/* CUPISSA — LÓGICA DE AUTENTICACIÓN */
/* ===================================================== */

const Auth = {
    user: null,

    init: () => {
        Auth.checkSession();
        Auth.bindEvents();
    },

    checkSession: () => {
        const localUser = localStorage.getItem('cupissa_user');
        const sessionUser = sessionStorage.getItem('cupissa_user');
        
        if (localUser) {
            Auth.user = JSON.parse(localUser);
            Auth.switchView('viewDashboard');
        } else if (sessionUser) {
            Auth.user = JSON.parse(sessionUser);
            Auth.switchView('viewDashboard');
        } else {
            Auth.switchView('viewLogin');
        }
    },

    switchView: (viewId) => {
        document.getElementById('viewLogin').classList.add('view-hidden');
        document.getElementById('viewRegister').classList.add('view-hidden');
        document.getElementById('viewDashboard').classList.add('view-hidden');
        
        document.getElementById(viewId).classList.remove('view-hidden');

        if (viewId === 'viewDashboard' && Auth.user) {
            if (typeof Panel !== 'undefined') Panel.init(Auth.user);
        }
    },

    login: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnLoginSubmit');
        const errorDiv = document.getElementById('loginError');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('loginRemember').checked;

        btn.disabled = true;
        btn.innerText = "Verificando...";
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
                const storage = remember ? localStorage : sessionStorage;
                storage.setItem('cupissa_user', JSON.stringify(data));
                Auth.switchView('viewDashboard');
                window.location.reload(); // Refrescar header
            } else {
                errorDiv.innerText = "Credenciales incorrectas o usuario inactivo.";
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.innerText = "Error de conexión. Intenta de nuevo.";
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerText = "Ingresar";
        }
    },

    register: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnRegSubmit');
        const errorDiv = document.getElementById('regError');
        
        btn.disabled = true;
        btn.innerText = "Creando cuenta...";
        errorDiv.style.display = 'none';

        try {
            const fd = new FormData();
            fd.append('action', 'registrarUsuario');
            fd.append('nombre', document.getElementById('regNombre').value);
            fd.append('cc', document.getElementById('regCC').value);
            fd.append('email', document.getElementById('regEmail').value);
            fd.append('telefono', document.getElementById('regTelefono').value);
            fd.append('password', document.getElementById('regPassword').value);

            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                alert("Cuenta creada exitosamente. Por favor, inicia sesión.");
                document.getElementById('formRegister').reset();
                Auth.switchView('viewLogin');
            } else {
                errorDiv.innerText = data.error || "Error al crear la cuenta. El correo ya existe.";
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

    logout: () => {
        localStorage.removeItem('cupissa_user');
        sessionStorage.removeItem('cupissa_user');
        Auth.user = null;
        window.location.reload();
    },

    bindEvents: () => {
        const loginForm = document.getElementById('formLogin');
        if (loginForm) loginForm.addEventListener('submit', Auth.login);

        const regForm = document.getElementById('formRegister');
        if (regForm) regForm.addEventListener('submit', Auth.register);
    }
};

document.addEventListener('DOMContentLoaded', Auth.init);