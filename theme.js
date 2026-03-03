/* ===================================================== */
/* CUPISSA — THEME (DARK DEFAULT / LIGHT OPTIONAL) */
/* ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  inicializarTema();
});

function inicializarTema() {
  const temaGuardado = obtenerLocal("cupissa_theme");

  // Modo oscuro es default
  if (temaGuardado === "light") {
    document.body.classList.add("light-mode");
  }

  actualizarIconoTema();
}

function alternarTema() {
  document.body.classList.toggle("light-mode");

  const esClaro = document.body.classList.contains("light-mode");
  guardarLocal("cupissa_theme", esClaro ? "light" : "dark");

  actualizarIconoTema();
}

function actualizarIconoTema() {
  const themeBtn = document.getElementById("themeToggle");
  if (!themeBtn) return;

  const esClaro = document.body.classList.contains("light-mode");
  themeBtn.textContent = esClaro ? "☀" : "🌙";
}