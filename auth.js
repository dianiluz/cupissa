document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {

    const usuarioGuardado = localStorage.getItem("cupissa_user");

    if (usuarioGuardado) {
      const userData = JSON.parse(usuarioGuardado);
      renderUsuarioLogueado(userData);
    }

  }, 150);

  const userIcon = document.getElementById("userIcon");
  const overlay = document.getElementById("authOverlay");
  const cerrar = document.getElementById("cerrarAuth");
  const btnLogin = document.getElementById("btnLogin");
  const error = document.getElementById("authError");

  if (!userIcon) return;

  userIcon.addEventListener("click", () => {

  const usuarioGuardado = localStorage.getItem("cupissa_user");

  if (usuarioGuardado) {
    window.location.href = "/panel/";
  } else {
    overlay.classList.add("active");
  }

});

  cerrar.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  btnLogin.addEventListener("click", async () => {

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value.trim();
    const rol = document.querySelector('input[name="rol"]:checked').value;

    if (!email || !password) {
      mostrarError("Completa todos los campos");
      return;
    }

    try {

      const response = await fetch(CONFIG.backendURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: new URLSearchParams({
    action: "login",
    email: email,
    password: password
  })
});

      const data = await response.json();

      if (!data.success) {
        mostrarError("Credenciales incorrectas");
        return;
      }

      if (data.tipo_usuario !== rol) {
        mostrarError("Rol incorrecto");
        return;
      }

      localStorage.setItem("cupissa_user", JSON.stringify({
  tipo_usuario: data.tipo_usuario,
  nombre: data.nombre,
  email: data.email,
  telefono: data.telefono || "",
  direccion: data.direccion || "",
  barrio: data.barrio || "",
  ciudad: data.ciudad || "",
  departamento: data.departamento || ""
}));

      overlay.classList.remove("active");
      location.reload();

    } catch (err) {
      mostrarError("Error de conexión");
    }

  });

  function mostrarError(msg) {
    error.textContent = msg;
    error.style.display = "block";
  }

});

function renderUsuarioLogueado(user) {

  const userIcon = document.getElementById("userIcon");
  if (!userIcon) return;

  userIcon.innerHTML = `
    <div class="user-dropdown" id="userDropdown">
      <span id="userName">${user.nombre} ▾</span>
      <div class="user-menu" id="userMenu">
        <div id="irPanel">Mi cuenta</div>
        <div id="cerrarSesion">Cerrar sesión</div>
      </div>
    </div>
  `;

  const userName = document.getElementById("userName");
  const userMenu = document.getElementById("userMenu");

  // Toggle menú con click
  userName.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("active");
  });

  // Cerrar si se hace click fuera
  document.addEventListener("click", () => {
    userMenu.classList.remove("active");
  });

  document.getElementById("irPanel").addEventListener("click", () => {
    window.location.href = "/panel/";
  });

  document.getElementById("cerrarSesion").addEventListener("click", () => {
    localStorage.removeItem("cupissa_user");
    window.location.href = "/";
  });

}