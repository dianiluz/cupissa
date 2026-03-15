/* js/chat.js */
/* ===================================================== */
/* CUPISSA — LIVE CHAT CON ADJUNTOS (FIREBASE + GITHUB)  */
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
                    <div class="chat-body" id="chatBody"></div>
                    <div class="chat-footer">
                        <label for="chatFile" style="cursor:pointer; padding: 10px; color: #db137a;">
                            <i class="fas fa-paperclip"></i>
                            <input type="file" id="chatFile" style="display:none;">
                        </label>
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
        if (typeof Utils !== 'undefined') {
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
    },

    enviarMensaje: async () => {
        const input = document.getElementById('chatInput');
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';
        const msgData = { sender: 'user', text: texto, timestamp: firebase.database.ServerValue.TIMESTAMP };
        await LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).push(msgData);
        if (typeof Utils !== 'undefined') {
            Utils.fetchFromBackend('nuevoMensajeChat', {
                thread_id: LiveChat.chatId, nombre: LiveChat.userInfo.nombre,
                correo: LiveChat.userInfo.correo, mensaje: texto, is_first: false
            });
        }
    },

    manejarArchivo: async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (typeof Utils !== 'undefined') Utils.toast("Subiendo archivo...", "info");
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result;
            const fileName = `chat_${Date.now()}_${file.name}`;
            
            // 1. Subimos a GitHub mediante el backend
            const res = await Utils.fetchFromBackend('subirFotoGithub', {
                base64: base64,
                nombre_archivo: fileName
            });

            if (res.success) {
                const urlImg = `https://raw.githubusercontent.com/dianiluz/cupissa/main/assets/productos/${fileName}`;
                const msgAdjunto = `[ARCHIVO ADJUNTO]: ${urlImg}`;
                
                // 2. Guardamos en Firebase para que se vea en la web
                await LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).push({
                    sender: 'user',
                    text: `📎 Archivo enviado: ${file.name}`,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                // 3. Notificamos a Telegram
                Utils.fetchFromBackend('nuevoMensajeChat', {
                    thread_id: LiveChat.chatId,
                    nombre: LiveChat.userInfo.nombre,
                    correo: LiveChat.userInfo.correo,
                    mensaje: msgAdjunto,
                    is_first: false
                });
                Utils.toast("Archivo enviado con éxito", "success");
            } else {
                Utils.toast("Error al subir archivo", "error");
            }
        };
    },

    escucharMensajes: () => {
        const chatBody = document.getElementById('chatBody');
        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).off();
        LiveChat.db.ref(`chats/${LiveChat.chatId}/messages`).on('child_added', (snapshot) => {
            const data = snapshot.val();
            const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const div = document.createElement('div');
            div.className = `chat-msg ${data.sender}`;
            div.innerHTML = `${data.text}<span class="chat-time">${time}</span>`;
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
        document.getElementById('chatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') LiveChat.enviarMensaje(); });
        document.getElementById('chatFile').addEventListener('change', LiveChat.manejarArchivo);
    }
};

document.addEventListener('DOMContentLoaded', LiveChat.init);