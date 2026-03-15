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

        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/css/chat.css';
        
        cssLink.onload = async () => {
            LiveChat.crearInterfaz();

            await LiveChat.cargarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
            await LiveChat.cargarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js");

            if (!firebase.apps.length) firebase.initializeApp(LiveChat.firebaseConfig);
            LiveChat.db = firebase.database();

            LiveChat.configurarSesion();
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

                <div id="chatMainInterface" class="chat-main-interface" style="display:none;">
                    <div class="chat-body" id="chatBody">
                        <div class="chat-msg admin">
                            Hola! 👋 Soy CupiBot, el asistente de Cupissa. ¿En qué te puedo ayudar hoy?
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
                <i class="fas fa-times" style="display:none;"></i>
            </div>
        `;
        document.body.appendChild(widget);
    },

    toggleChat: () => {
        const widget = document.getElementById('cupissaChatWidget');
        widget.classList.toggle('open');
        const iconChat = widget.querySelector('.fa-comment-dots');
        const iconClose = widget.querySelector('.fa-times');
        
        if (widget.classList.contains('open')) {
            iconChat.style.display = 'none';
            iconClose.style.display = 'block';
            setTimeout(() => {
                const input = document.getElementById('chatInput');
                if (input && document.getElementById('chatMainInterface').style.display === 'flex') input.focus();
                LiveChat.scrollBottom();
            }, 300);
        } else {
            iconChat.style.display = 'block';
            iconClose.style.display = 'none';
        }
    },

    configurarSesion: () => {
        let savedId = sessionStorage.getItem('cupissa_chat_session');
        let savedInfo = localStorage.getItem('cupissa_chat_user');
        
        if (!savedId) {
            // El ID es único por pestaña, así siempre limpia la web, pero en Telegram se agrupa por correo
            savedId = 'sess_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('cupissa_chat_session', savedId);
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
        
        if (typeof Utils !== 'undefined' && Utils.fetchFromBackend) {
            Utils.fetchFromBackend('nuevoMensajeChat', {
                thread_id: LiveChat.chatId,
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
            Utils.fetchFromBackend('nuevoMensajeChat', {
                thread_id: LiveChat.chatId,
                nombre: LiveChat.userInfo.nombre,
                correo: LiveChat.userInfo.correo,
                mensaje: texto,
                is_first: false
            });
        }
    },

    escucharMensajes: () => {
        const chatBody = document.getElementById('chatBody');
        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).off();

        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).on('child_added', (snapshot) => {
            const data = snapshot.val();
            // Evitar duplicar el mensaje inicial de bienvenida
            if (data.text.includes("Soy CupiBot") && data.sender === "admin") return;

            const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const div = document.createElement('div');
            div.className = `chat-msg ${data.sender}`;
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