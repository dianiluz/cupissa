/* js/chat.js */
/* ===================================================== */
/* CUPISSA — LIVE CHAT MODULAR (FIREBASE) */
/* ===================================================== */

const LiveChat = {
    firebaseConfig: {
        apiKey: "AIzaSyCz6k0PneQA9oovdeDgb_XltkLYfQ4H9ek",
        authDomain: "cupissa-platform.firebaseapp.com",
        databaseURL: "https://cupissa-platform-default-rtdb.firebaseio.com",
        projectId: "cupissa-platform",
        storageBucket: "cupissa-platform.firebasestorage.app",
        messagingSenderId: "843004819374",
        appId: "1:843004819374:web:21ccec0c831afd86113a3f"
    },
    
    db: null,
    chatId: null,
    userInfo: null,
    isInitialized: false,

    init: () => {
        if (LiveChat.isInitialized) return;

        // 1. Inyectar CSS modular y ESPERAR a que cargue
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/css/chat.css';
        
        cssLink.onload = async () => {
            // 2. Inyectar la interfaz SOLO cuando el CSS ya está aplicado
            LiveChat.crearInterfaz();

            // 3. Cargar librerías de Firebase dinámicamente
            await LiveChat.cargarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
            await LiveChat.cargarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js");

            // 4. Inicializar Firebase
            if (!firebase.apps.length) firebase.initializeApp(LiveChat.firebaseConfig);
            LiveChat.db = firebase.database();

            // 5. Configurar Sesión de Usuario
            LiveChat.configurarSesion();
            
            // 6. Activar Listeners (Firebase y DOM)
            LiveChat.bindEvents();
            
            LiveChat.isInitialized = true;
        };

        document.head.appendChild(cssLink);
    },

    cargarScript: (url) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            document.head.appendChild(script);
        });
    },

    crearInterfaz: () => {
        const widget = document.createElement('div');
        widget.className = 'cupissa-chat-widget';
        widget.id = 'cupissaChatWidget';

        widget.innerHTML = `
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-header-avatar"><i class="fas fa-headset"></i></div>
                    <div class="chat-header-info">
                        <h4>Soporte Cupissa</h4>
                        <p>En línea, listos para crear</p>
                    </div>
                </div>
                
                <div id="chatLoginForm" class="chat-login-form">
                    <p>Por favor, ingresa tus datos para iniciar el chat.</p>
                    <input type="text" id="chatRegName" placeholder="Nombre completo" required>
                    <input type="tel" id="chatRegPhone" placeholder="Teléfono" required>
                    <input type="email" id="chatRegEmail" placeholder="Correo electrónico" required>
                    <button id="chatStartBtn">Comenzar a chatear</button>
                </div>

                <div id="chatMainInterface" class="chat-main-interface">
                    <div class="chat-body" id="chatBody">
                        <div class="chat-msg admin">
                            Por favor, deja un mensaje con tu consulta o comentario, y uno de nuestros agentes te responderá lo antes posible.
                            <span class="chat-time">Ahora</span>
                        </div>
                    </div>
                    <div class="chat-footer">
                        <input type="text" id="chatInput" placeholder="Escribe tu mensaje..." autocomplete="off">
                        <button id="chatSendBtn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
            <div class="chat-fab" onclick="LiveChat.toggleChat()">
                <i class="fas fa-comment-dots"></i>
                <i class="fas fa-times"></i>
            </div>
        `;
        document.body.appendChild(widget);
    },

    toggleChat: () => {
        document.getElementById('cupissaChatWidget').classList.toggle('open');
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input && document.getElementById('chatMainInterface').style.display === 'flex') input.focus();
            LiveChat.scrollBottom();
        }, 300);
    },

    configurarSesion: () => {
        let savedId = localStorage.getItem('cupissa_chat_session');
        let savedInfo = localStorage.getItem('cupissa_chat_user');
        
        if (!savedId) {
            savedId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('cupissa_chat_session', savedId);
        }
        LiveChat.chatId = savedId;

        if (savedInfo) {
            LiveChat.userInfo = JSON.parse(savedInfo);
            LiveChat.mostrarChat();
        }
    },

    iniciarRegistro: async () => {
        const nom = document.getElementById('chatRegName').value.trim();
        const tel = document.getElementById('chatRegPhone').value.trim();
        const cor = document.getElementById('chatRegEmail').value.trim();

        if (!nom || !tel || !cor) {
            if(typeof Utils !== 'undefined') Utils.toast("Por favor completa todos los campos", "warning");
            return;
        }

        LiveChat.userInfo = { nombre: nom, telefono: tel, correo: cor };
        localStorage.setItem('cupissa_chat_user', JSON.stringify(LiveChat.userInfo));
        
        LiveChat.mostrarChat();
        
        // Enviar mensaje oculto inicial al backend para crear el Tema en Telegram
        if (typeof Utils !== 'undefined' && Utils.fetchFromBackend) {
            Utils.fetchFromBackend('notificarChatTelegram', {
                chat_id: LiveChat.chatId,
                nombre: nom,
                telefono: tel,
                correo: cor,
                mensaje: "El cliente ha iniciado el chat.",
                is_first: true
            });
        }
    },

    mostrarChat: () => {
        document.getElementById('chatLoginForm').style.display = 'none';
        document.getElementById('chatMainInterface').style.display = 'flex';
        LiveChat.escucharMensajes();
        setTimeout(LiveChat.scrollBottom, 100);
    },

    enviarMensaje: async () => {
        const input = document.getElementById('chatInput');
        const texto = input.value.trim();
        if (!texto) return;

        input.value = '';
        
        const msgData = {
            sender: 'user',
            text: texto,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        await LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).push(msgData);
        
        if (typeof Utils !== 'undefined' && Utils.fetchFromBackend) {
            Utils.fetchFromBackend('notificarChatTelegram', {
                chat_id: LiveChat.chatId,
                nombre: LiveChat.userInfo.nombre,
                mensaje: texto,
                is_first: false
            });
        }
    },

    escucharMensajes: () => {
        const chatBody = document.getElementById('chatBody');
        
        // Desvincular oyentes previos para evitar duplicados si se cierra sesión
        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).off();

        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).on('child_added', (snapshot) => {
            const data = snapshot.val();
            const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const div = document.createElement('div');
            div.className = `chat-msg ${data.sender}`; // "admin" o "user"
            div.innerHTML = `
                ${data.text}
                <span class="chat-time">${time}</span>
            `;
            
            chatBody.appendChild(div);
            LiveChat.scrollBottom();
        });
    },

    scrollBottom: () => {
        const body = document.getElementById('chatBody');
        if(body) body.scrollTop = body.scrollHeight;
    },

    bindEvents: () => {
        document.getElementById('chatStartBtn').addEventListener('click', LiveChat.iniciarRegistro);
        document.getElementById('chatSendBtn').addEventListener('click', LiveChat.enviarMensaje);
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') LiveChat.enviarMensaje();
        });
    }
};

document.addEventListener('DOMContentLoaded', LiveChat.init);