(function(){

if(localStorage.getItem("cupissa_cookie_consent")) return;

const banner = document.createElement("div");
banner.id = "cookieBanner";
banner.className = "cookie-banner";

banner.innerHTML = `
<div class="cookie-content">
<p>
En CUPISSA utilizamos cookies y tecnologías similares para mejorar tu experiencia,
recordar productos en tu carrito, analizar el tráfico del sitio y mostrar
promociones relevantes. Al continuar navegando aceptas el uso de cookies
de acuerdo con nuestra <a href="/legales/#privacidad">Política de Privacidad</a>.
</p>

<button id="acceptCookies">Aceptar</button>
</div>
`;

document.body.appendChild(banner);

document.getElementById("acceptCookies").onclick = () => {
localStorage.setItem("cupissa_cookie_consent", "true");
banner.remove();
};

})();