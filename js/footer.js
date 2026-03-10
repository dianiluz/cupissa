/* ===================================================== */
/* CUPISSA — FOOTER DINÁMICO */
/* ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-block">
                <img src="/assets/logo.png" alt="Cupissa Logo" class="footer-logo">
                <ul class="footer-contact">
                    <li><i class="fas fa-envelope"></i>contacto@cupissa.com</li>
                    <li><i class="fab fa-whatsapp"></i> +57 314 767 1380</li>
                    <li><i class="fas fa-map-marker-alt"></i> Barranquilla, Colombia</li>
                </ul>
                <div class="footer-socials">
                    <a href="https://instagram.com/cupissa.co" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="https://tiktok.com/@cupissa.co" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                    <a href="https://wa.me/+573147671380" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>

            <div class="footer-block">
                <h3 class="footer-title">EXPLORA</h3>
                <ul>
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/catalogo/">Catálogo</a></li>
                    <li><a href="/rastreo/">Rastrear Pedido</a></li>
                    <li><a href="/auth/">Iniciar Sesión</a></li>
                    <li><a href="/trabaja-con-nosotros/">Trabaja con Nosotros</a></li>
                </ul>
            </div>

            <div class="footer-block">
                <h3 class="footer-title">LEGALES</h3>
                <ul>
                    <li><a href="/legales/terminos.html">Términos y condiciones</a></li>
                    <li><a href="/legales/privacidad.html">Políticas de privacidad</a></li>
                    <li><a href="/legales/envios.html">Domicilios y Envíos</a></li>
                    <li><a href="/legales/club.html">Club Cupissa</a></li>
                    <li><a href="/legales/marketing.html">Marketing y Puntos</a></li>
                </ul>
            </div>

            <div class="footer-block">
                <h3 class="footer-title">MEDIOS DE PAGO</h3>
                <div class="payment-container">
                    <div class="payment-method">
                        <span class="payment-tag">✅ Wompi</span>
                        <p class="payment-detail">Débito, Crédito, Nequi, PSE, Bancolombia, Daviplata, SU+Pay.</p>
                    </div>
                    <div class="payment-method">
                        <span class="payment-tag">✅ Transferencia Directa</span>
                        <p class="payment-detail">Bancolombia, Nequi y Llave Bre-B desde cualquier banco.</p>
                    </div>
                    <div class="payment-method">
                        <span class="payment-tag">✅ Crédito ADDI</span>
                    </div>
                    <div class="payment-method">
                        <span class="payment-tag">✅ Contraentrega</span>
                        <p class="payment-detail">Local (Efectivo/Transf) | Nacional (Interrapidisimo).</p>
                    </div>
                    <p class="payment-disclaimer">*Requiere anticipo del 20% para agendar.</p>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 CUPISSA: Todos los derechos reservados — Desarrollado por Diani Gonzalez.</p>
        </div>
    `;

    // Inyectar dentro del div #footer si existe, sino al final del body
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        footerContainer.appendChild(footer);
    } else {
        document.body.appendChild(footer);
    }
});