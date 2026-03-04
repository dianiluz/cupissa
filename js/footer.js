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
                    <li><i class="fas fa-envelope"></i> ${CONFIG.contactEmail}</li>
                    <li><i class="fab fa-whatsapp"></i> +${CONFIG.whatsappNumber}</li>
                    <li><i class="fas fa-map-marker-alt"></i> Barranquilla, Colombia</li>
                </ul>
                <div class="footer-socials">
                    <a href="https://instagram.com/cupissa.co" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>

            <div class="footer-block">
                <h3 class="footer-title">EXPLORA</h3>
                <ul>
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/catalogo/">Catálogo</a></li>
                    <li><a href="/rastreo/">Rastrear Pedido</a></li>
                    <li><a href="/panel/">Iniciar Sesión</a></li>
                    <li><a href="/panel/">Registrarse</a></li>
                </ul>
            </div>

            <div class="footer-block">
                <h3 class="footer-title">LEGALES</h3>
                <ul>
                    <li><a href="/legales/terminos.html">Términos y Condiciones</a></li>
                    <li><a href="/legales/privacidad.html">Políticas de Privacidad</a></li>
                    <li><a href="/legales/envios.html">Domicilios y Envíos</a></li>
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
            <p>&copy; 2026 ${CONFIG.brandName}: Todos los derechos reservados — Desarrollado por Diani Gonzalez.</p>
        </div>
    `;

    document.body.appendChild(footer);
});