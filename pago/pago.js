
/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT COMPLETA */
/* ===================================================== */

let pasoActual = 1;
let wompiWidget = null;
let procesandoCompra = false;

let checkoutData = {
    tipo: null, 
    nombre_cliente: "",
    usuario_email: "",
    telefono: "",
    direccion: "",
    barrio: "",
    ciudad: "",
    departamento: "",
    cc: "",
    envio: null,
    transportadora_id: null,
    metodo_pago: null,
    total_productos: 0,
    costo_envio: 0, 
    comision_pasarela: 0,
    total_final: 0,
    pago_hoy: 0,
    saldo_pendiente: 0,
    paga_total: false,
    productos: []
};

const CIUDADES_LOCALES = [
    "BARRANQUILLA",
    "SOLEDAD",
    "GALAPA",
    "MALAMBO",
    "PUERTO COLOMBIA"
];

const MUNICIPIOS = {
    "Amazonas": ["Leticia","Puerto Nariño","El Encanto","La Chorrera","La Pedrera","La Victoria","Mirití-Paraná","Puerto Alegría","Puerto Arica","Puerto Santander","Tarapacá"],
    "Antioquia": ["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anzá","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Bolívar","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carolina del Príncipe","Caucasia","Chigorodó","Cisneros","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Murinó","Mutatá","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro","San Pedro de Urabá","San Rafael","San Roque","Santa Bárbara","Santa Fe de Antioquia","Santa Rosa de Osos","Santo Domingo","El Santuario","San Vicente","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],
    "Arauca": ["Arauca","Arauquita","Cravo Norte","Fortul","Puerto Rondón","Saravena","Tame"],
    "Atlántico": ["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suan","Tubará","Usiacurí"],
    "Bogotá D.C.": ["Bogotá"],
    "Bolívar": ["Achí","Altos del Rosario","Arenal","Arjona","Arroyo Hondo","Barranco de Loba","Calamar","Cantagallo","Cartagena","Cicuco","Clemencia","Córdoba","El Carmen de Bolívar","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María La Baja","Montecristo","Morales","Norosí","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbaná","Villanueva","Zambrano"],
    "Boyacá": ["Tunja","Duitama","Sogamoso","Chiquinquirá","Paipa","Puerto Boyacá","Villa de Leyva","Moniquirá","Soatá","Socha","Samacá","Ramiriquí","Miraflores","Garagoa","Ráquira","Nobsa","Muzo","Pauna","Otanche","Aquitania"],
    "Caldas": ["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],
    "Caquetá": ["Albania","Belén de los Andaquíes","Cartagena del Chairá","Curillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaíso"],
    "Casanare": ["Aguazul","Chámeza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],
    "Cauca": ["Popayán","Santander de Quilichao","Puerto Tejada","Corinto","El Tambo","Guapi","Miranda","Silvia","Timbío","Villa Rica"],
    "Cesar": ["Valledupar","Aguachica","Agustín Codazzi","Bosconia","Chimichagua","Curumaní","La Jagua de Ibirico","Pueblo Bello","San Alberto","San Diego","San Martín"],
    "Chocó": ["Quibdó","Acandí","Bahía Solano","Istmina","Nuquí","Riosucio","Tadó"],
    "Córdoba": ["Montería","Cereté","Lorica","Sahagún","Montelíbano","Planeta Rica","Tierralta","Valencia","Ayapel","Chinú"],
    "Cundinamarca": ["Soacha","Chía","Zipaquirá","Girardot","Facatativá","Fusagasugá","Madrid","Mosquera","Cajicá","La Calera"],
    "La Guajira": ["Riohacha","Maicao","Uribia","Manaure","San Juan del Cesar","Fonseca","Albania","Barrancas"],
    "Magdalena": ["Santa Marta","Ciénaga","Fundación","El Banco","Aracataca","Zona Bananera","Plato","Pivijay"],
    "Meta": ["Villavicencio","Acacías","Granada","Puerto López","Restrepo","Cumaral"],
    "Nariño": ["Pasto","Tumaco","Ipiales","Túquerres","La Unión","Samaniego"],
    "Norte de Santander": ["Cúcuta","Ocaña","Pamplona","Villa del Rosario","Tibú"],
    "Putumayo": ["Mocoa","Puerto Asís","Orito","San Miguel","Sibundoy"],
    "Quindío": ["Armenia","Calarcá","Montenegro","La Tebaida","Quimbaya","Salento"],
    "Risaralda": ["Pereira","Dosquebradas","Santa Rosa de Cabal","La Virginia"],
    "Santander": ["Bucaramanga","Floridablanca","Girón","Piedecuesta","Barrancabermeja","San Gil","Socorro"],
    "Sucre": ["Sincelejo","Corozal","Sampués","San Marcos","Tolú"],
    "Tolima": ["Ibagué","Espinal","Melgar","Líbano","Mariquita","Honda"],
    "Valle del Cauca": ["Cali","Palmira","Buenaventura","Tuluá","Cartago","Buga","Jamundí"],
    "Vaupés": ["Mitú","Carurú","Taraira"],
    "Vichada": ["Puerto Carreño","Cumaribo","La Primavera","Santa Rosalía"]
};

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    renderResumenCarrito();
    manejarNavegacion();
    inicializarDepartamento();
    inicializarCiudad();
    inicializarBarrio();
    prellenarUsuario();
    document.getElementById("ciudad").addEventListener("input", actualizarDocumento);
    
    // Listener para confirmar pedido
    document.getElementById("confirmarPedido")?.addEventListener("click", confirmarPedido);
});

function val(id) { return document.getElementById(id)?.value.trim(); }

/* ================= PASO 1: DIRECCIÓN & BARRIO ================= */

function actualizarDocumento() {
    const ciudad = val("ciudad")?.toUpperCase();
    const cont = document.getElementById("documentoContainer");
    if (!cont) return;
    cont.style.display = CIUDADES_LOCALES.includes(ciudad) ? "none" : "block";
}

async function inicializarBarrio() {
    const input = document.getElementById("barrio");
    const lista = document.createElement("div");
    lista.className = "direccion-sugerencias";
    input.parentElement.appendChild(lista);

    try {
        const url = getSheetURL(CONFIG.gids.TARIFAS_DOMICILIOS);
        const res = await fetch(url);
        const tsv = await res.text();
        const filas = tsv.split("\n").slice(1);

        const barriosData = filas.map(f => {
            const cols = f.split("\t");
            return {
                nombre: cols[1]?.trim(),
                precio: parseInt(cols[2]) || 0
            };
        }).filter(b => b.nombre);

        input.addEventListener("input", function() {
            const q = this.value.toLowerCase().trim();
            lista.innerHTML = "";
            if (q.length < 2) { lista.style.display = "none"; return; }

            barriosData.filter(b => b.nombre.toLowerCase().includes(q)).slice(0, 8).forEach(b => {
                const d = document.createElement("div");
                d.className = "direccion-item";
                d.textContent = b.nombre;
                d.onclick = () => {
                    input.value = b.nombre;
                    input.dataset.precio = b.precio;
                    lista.style.display = "none";
                };
                lista.appendChild(d);
            });
            lista.style.display = lista.innerHTML ? "block" : "none";
        });
    } catch (e) { console.error("Error barrios:", e); }
}

/* ================= PASO 2: ENVÍO ================= */

async function generarOpcionesEnvio() {
    const cont = document.getElementById("envioOpciones");
    cont.innerHTML = "";
    const esLocal = CIUDADES_LOCALES.includes(val("ciudad").toUpperCase());
    
    let html = `<h3>Selecciona el método de entrega</h3>`;

    if (esLocal) {
        const precioBarrio = document.getElementById("barrio").dataset.precio || 10000;
        html += `
            <div class="opcion-envio-card" onclick="seleccionarEnvio('domicilio', ${precioBarrio})">
                <input type="radio" name="envio_radio" id="env_dom">
                <label for="env_dom">Domicilio Local - <strong>$${parseInt(precioBarrio).toLocaleString()}</strong></label>
                <p class="nota-envio">El valor puede aumentar por tamaño del paquete o esperas. Servicio externo asumido por el cliente.</p>
            </div>
        `;
    }

    html += `
        <div class="opcion-envio-card" onclick="seleccionarEnvio('transportadora', 0)">
            <input type="radio" name="envio_radio" id="env_trans">
            <label for="env_trans">Transportadora (Nacional/Local)</label>
            <div id="trans_selector_container" style="display:none; margin-top:10px;">
                <select id="select_trans" class="form-input">
                    <option value="">Selecciona transportadora...</option>
                    ${Object.keys(CONFIG.transportadoras).map(t => `<option value="${t}">${t}</option>`).join('')}
                    <option value="OTRA">Otra (especificar)</option>
                </select>
                <input type="text" id="trans_otra" placeholder="Escribe el nombre" class="form-input" style="display:none; margin-top:5px;">
            </div>
            <p class="nota-envio">El valor del envío será consultado por tu asesor y enviado para pago posterior. Los tiempos dependen de la transportadora.</p>
        </div>
        <div class="check-aceptacion">
            <input type="checkbox" id="acepta_envio">
            <label for="acepta_envio">Entiendo y acepto las condiciones de envío y producción.</label>
        </div>
    `;
    cont.innerHTML = html;

    document.getElementById("select_trans")?.addEventListener("change", (e) => {
        document.getElementById("trans_otra").style.display = e.target.value === "OTRA" ? "block" : "none";
    });
}

function seleccionarEnvio(tipo, precio) {
    checkoutData.envio = tipo;
    checkoutData.costo_envio = precio;
    document.getElementById("trans_selector_container").style.display = tipo === 'transportadora' ? 'block' : 'none';
    
    // Ajuste de CC dinámico
    const necesitaCC = (tipo === 'transportadora' || !CIUDADES_LOCALES.includes(val("ciudad").toUpperCase()));
    document.getElementById("documentoContainer").style.display = necesitaCC ? "block" : "none";
}

/* ================= PASO 3: PAGO ================= */

function generarOpcionesPago() {
    const cont = document.getElementById("pagoOpciones");
    cont.innerHTML = `
        <div class="pago-modo-selector">
            <button class="btn-toggle ${checkoutData.paga_total ? 'active' : ''}" onclick="setModoPago(true)">Pagar Total (100%)</button>
            <button class="btn-toggle ${!checkoutData.paga_total ? 'active' : ''}" onclick="setModoPago(false)">Pagar Anticipo (20%)</button>
        </div>
        <div id="metodosDisponibles"></div>
    `;
    renderMetodosPago();
}

function setModoPago(total) {
    checkoutData.paga_total = total;
    document.querySelectorAll(".btn-toggle").forEach(b => b.classList.toggle("active"));
    renderMetodosPago();
}

function renderMetodosPago() {
    const cont = document.getElementById("metodosDisponibles");
    const subtotalBase = checkoutData.total_productos + checkoutData.costo_envio;
    const valorABase = checkoutData.paga_total ? subtotalBase : Math.round(subtotalBase * 0.20);
    
    const metodos = [
        { id: "transferencia", nombre: "Transferencia Directa", comision: 0, fijo: 0 },
        { id: "wompi", nombre: "Wompi (Tarjetas, PSE, Nequi)", comision: 0.0265, fijo: 700 },
        { id: "addi", nombre: "Crédito ADDI", comision: 0.09, fijo: 0 }
    ];

    let html = `<h4>Pagarás ${checkoutData.paga_total ? 'el TOTAL' : 'el ANTICIPO'} mediante:</h4>`;
    metodos.forEach(m => {
        const comision = Math.round((valorABase * m.comision) + m.fijo);
        const totalPagar = valorABase + comision;

        html += `
            <div class="opcion-pago-card" onclick="finalizarSeleccionPago('${m.id}', ${comision}, ${totalPagar})">
                <input type="radio" name="pago_radio" id="pay_${m.id}" ${checkoutData.metodo_pago === m.id ? 'checked' : ''}>
                <label for="pay_${m.id}">${m.nombre} <br><strong>Valor a pagar: $${totalPagar.toLocaleString()}</strong></label>
            </div>
        `;
    });
    cont.innerHTML = html;
}

function finalizarSeleccionPago(id, comision, totalPagar) {
    checkoutData.metodo_pago = id;
    checkoutData.comision_pasarela = comision;
    checkoutData.pago_hoy = totalPagar; 
    checkoutData.total_final = (checkoutData.total_productos + checkoutData.costo_envio) + comision;
    checkoutData.saldo_pendiente = checkoutData.total_final - totalPagar;
}

/* ================= PASO 4: CONFIRMACIÓN ================= */

function renderResumenFinal() {
    const cont = document.getElementById("resumenFinal");
    const envioTxt = checkoutData.envio === 'domicilio' ? 'Domicilio Local' : `Transportadora (${checkoutData.transportadora_id})`;
    
    cont.innerHTML = `
        <div class="resumen-final-card">
            <p><strong>Cliente:</strong> ${checkoutData.nombre_cliente}</p>
            <p><strong>Destino:</strong> ${checkoutData.direccion}, ${checkoutData.barrio} - ${checkoutData.ciudad}</p>
            <p><strong>Envío:</strong> ${envioTxt}</p>
            <p><strong>Pago:</strong> ${checkoutData.metodo_pago.toUpperCase()} (${checkoutData.paga_total ? 'Total' : 'Anticipo'})</p>
            <hr>
            <div class="desglose-precios">
                <p>Productos: <span>$${checkoutData.total_productos.toLocaleString()}</span></p>
                <p>Envío: <span>${checkoutData.costo_envio > 0 ? '$'+checkoutData.costo_envio.toLocaleString() : 'Flete por cobrar'}</span></p>
                <p>Comisión: <span>$${checkoutData.comision_pasarela.toLocaleString()}</span></p>
                <h3 class="total-final-texto">TOTAL PEDIDO: $${checkoutData.total_final.toLocaleString()}</h3>
            </div>
            <div class="pago-destacado">
                <p>PAGAS HOY: <strong>$${checkoutData.pago_hoy.toLocaleString()}</strong></p>
                ${checkoutData.saldo_pendiente > 0 ? `<p>Saldo pendiente: $${checkoutData.saldo_pendiente.toLocaleString()}</p>` : ''}
            </div>
        </div>
    `;
}

/* ================= CONFIRMAR PEDIDO Y PASARELA ================= */

async function confirmarPedido() {
    if (procesandoCompra) return;
    procesandoCompra = true;

    try {
        // Si es transferencia directa o contraentrega, registrar sin pasar por pasarela
        if (checkoutData.metodo_pago === "transferencia") {
            await registrarPedidoDirecto();
        } else if (checkoutData.metodo_pago === "wompi") {
            // Para Wompi, inicializar widget
            inicializarWompiWidget();
        } else if (checkoutData.metodo_pago === "addi") {
            mostrarNotificacion("Redirección a ADDI en desarrollo");
            procesandoCompra = false;
        }
    } catch (error) {
        mostrarNotificacion("Error al procesar: " + error.message);
        procesandoCompra = false;
    }
}

async function inicializarWompiWidget() {

    // 1️⃣ Primero crear pedido en estado pendiente
    const carritoData = JSON.parse(localStorage.getItem("cupissa_carrito")) || [];

    const params = new URLSearchParams();
    params.append("action", "registrarPedido");
    params.append("tipo", checkoutData.tipo);
    params.append("nombre_cliente", checkoutData.nombre_cliente);
    params.append("usuario_email", checkoutData.usuario_email);
    params.append("telefono", checkoutData.telefono);
    params.append("direccion", checkoutData.direccion);
    params.append("barrio", checkoutData.barrio);
    params.append("ciudad", checkoutData.ciudad);
    params.append("departamento", checkoutData.departamento);
    params.append("cc", checkoutData.cc);
    params.append("transportadora", checkoutData.transportadora_id || "");
    params.append("metodo_pago", "wompi");
    params.append("total", checkoutData.total_final);
    params.append("costo_envio", checkoutData.costo_envio);
    params.append("productos", JSON.stringify(carritoData));

    const urlCompleta = CONFIG.backendURL + "?" + params.toString();

    const response = await fetch(urlCompleta, { method: "GET" });
    const result = await response.json();

    if (!result.success) {
        mostrarNotificacion("Error creando pedido");
        procesandoCompra = false;
        return;
    }

    const idPedido = result.id_pedido;

    // 2️⃣ Ahora sí abrir Wompi con referencia real
    const container = document.getElementById("paso-4");

    let wompiContainer = document.getElementById("wompi-widget-container");
    if (!wompiContainer) {
        wompiContainer = document.createElement("div");
        wompiContainer.id = "wompi-widget-container";
        wompiContainer.style.marginTop = "30px";
        container.insertBefore(wompiContainer, document.getElementById("confirmarPedido"));
    }

    wompiContainer.innerHTML = "";

    if (typeof WidgetCheckout === 'undefined') {
        mostrarNotificacion("Wompi no disponible");
        procesandoCompra = false;
        return;
    }

    const checkout = new WidgetCheckout({
        currency: "COP",
        amountInCents: checkoutData.pago_hoy * 100,
        reference: idPedido, // 🔥 AHORA ES REAL
        publicKey: "pub_prod_q69BzlCLtdFiZQEmbQFTMX9uXwr6E4Xg",
        redirectUrl: CONFIG.baseURL + "/rastreo/?id=" + idPedido
    });

    checkout.render(wompiContainer);

    document.getElementById("confirmarPedido").style.display = "none";
}

async function registrarPedidoDirecto() {
    const carritoData = JSON.parse(localStorage.getItem("cupissa_carrito")) || [];
    
    // Construir URL con parámetros GET para evitar CORS
    const params = new URLSearchParams();
    params.append("action", "registrarPedido");
    params.append("tipo", checkoutData.tipo);
    params.append("nombre_cliente", checkoutData.nombre_cliente);
    params.append("usuario_email", checkoutData.usuario_email);
    params.append("telefono", checkoutData.telefono);
    params.append("direccion", checkoutData.direccion);
    params.append("barrio", checkoutData.barrio);
    params.append("ciudad", checkoutData.ciudad);
    params.append("departamento", checkoutData.departamento);
    params.append("cc", checkoutData.cc);
    params.append("transportadora", checkoutData.transportadora_id || "");
    params.append("metodo_pago", checkoutData.metodo_pago);
    params.append("total", checkoutData.total_final);
    params.append("costo_envio", checkoutData.costo_envio);
    params.append("productos", JSON.stringify(carritoData));

    const urlCompleta = CONFIG.backendURL + "?" + params.toString();

    try {
        const response = await fetch(urlCompleta, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const result = await response.json();

        if (result.success) {
            // Limpiar carrito
            localStorage.removeItem("cupissa_carrito");
            
            // Mostrar confirmación y redirigir
            mostrarNotificacion("¡Pedido confirmado! ID: " + result.id_pedido);
            
            setTimeout(() => {
                window.location.href = "/rastreo/?id=" + result.id_pedido;
            }, 2000);
        } else {
            throw new Error(result.error || "Error al registrar");
        }
    } catch (error) {
        mostrarNotificacion("Error: " + error.message);
        procesandoCompra = false;
    }
}

/* ================= NAVEGACIÓN GENERAL ================= */

function manejarNavegacion() {
    document.querySelectorAll(".next-step").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (pasoActual === 1) {
                if (!validarPaso1()) return;
                prepararTipo();
                await generarOpcionesEnvio();
            }
            if (pasoActual === 2) {
                if (!checkoutData.envio) return mostrarNotificacion("Selecciona un método de envío");
                if (!document.getElementById("acepta_envio").checked) return mostrarNotificacion("Debes aceptar las condiciones");
                if (checkoutData.envio === 'transportadora') {
                    const trans = document.getElementById("select_trans").value;
                    if (!trans) return mostrarNotificacion("Selecciona una transportadora");
                    checkoutData.transportadora_id = trans === 'OTRA' ? val("trans_otra") : trans;
                }
                if (document.getElementById("documentoContainer").style.display === 'block' && !val("documento")) {
                    return mostrarNotificacion("El documento es obligatorio para transportadora");
                }
                checkoutData.cc = val("documento");
                generarOpcionesPago();
            }
            if (pasoActual === 3) {
                if (!checkoutData.metodo_pago) return mostrarNotificacion("Selecciona un método de pago");
                renderResumenFinal();
            }
            cambiarPaso(pasoActual + 1);
        });
    });

    document.querySelectorAll(".prev-step").forEach(btn => {
        btn.addEventListener("click", () => cambiarPaso(pasoActual - 1));
    });
}

function cambiarPaso(n) {
    if (n < 1 || n > 4) return;
    document.querySelector(`#paso-${pasoActual}`).classList.remove("active");
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    pasoActual = n;
    document.querySelector(`#paso-${pasoActual}`).classList.add("active");
    document.querySelector(`[data-step="${n}"]`).classList.add("active");
    window.scrollTo(0, 0);
}

function validarPaso1() {
    const campos = ["nombre", "email", "telefono", "direccion", "barrio", "ciudad", "departamentoBuscador"];
    for (let c of campos) { if (!val(c)) { mostrarNotificacion("Completa todos los campos"); return false; } }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) { mostrarNotificacion("Correo inválido"); return false; }
    
    checkoutData = { ...checkoutData, 
        nombre_cliente: val("nombre"), usuario_email: val("email"), 
        telefono: val("telefono"), direccion: val("direccion"), 
        barrio: val("barrio"), ciudad: val("ciudad"), departamento: val("departamentoBuscador")
    };
    return true;
}

function prepararTipo() {
    checkoutData.tipo = CIUDADES_LOCALES.includes(val("ciudad").toUpperCase()) ? "LOCAL" : "NACIONAL";
}

/* ================= RESUMEN DETALLADO (DERECHA) ================= */

function renderResumenCarrito() {
    const cont = document.getElementById("resumenCarrito");
    const carritoData = JSON.parse(localStorage.getItem("cupissa_carrito")) || [];
    
    if (!carritoData || carritoData.length === 0) {
        if(cont) cont.innerHTML = "<p>Tu carrito está vacío.</p>";
        return;
    }

    let html = `<div class="resumen-lista-productos" style="display:flex; flex-direction:column; gap:20px;">`;
    let totalCalculado = 0;

    carritoData.forEach((item) => {
        const subtotalGrupo = Number(item.subtotal) || 0;
        totalCalculado += subtotalGrupo;

        html += `
            <div class="resumen-item-agrupado" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                    <img src="${item.imagenurl || '/assets/logo.png'}" style="width:50px; height:50px; object-fit:cover; border-radius:8px; flex-shrink:0; background:#111;">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:700; color:#fff; margin-bottom:8px; text-transform:uppercase;">${item.nombre}</div>
                        <div class="variantes-contenedor" style="display:flex; flex-direction:column; gap:5px;">`;

        if (item.combinaciones && Array.isArray(item.combinaciones)) {
            item.combinaciones.forEach((combo) => {
                const textoVars = Object.entries(combo.variantes || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ");

                html += `
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; padding:2px 0;">
                        <span>${textoVars}</span>
                        <span style="color:#fff;">x${combo.cantidad}</span>
                    </div>`;
            });
        }

        html += `       </div>
                    </div>
                </div>
            </div>`;
    });

    html += `</div>`;
    
    html += `
        <div style="margin-top:20px; padding-top:15px; border-top:2px solid var(--color-pink);">
            <div style="display:flex; justify-content:space-between; font-weight:700; font-size:16px; color:#fff;">
                <span>Subtotal productos:</span>
                <span>$${totalCalculado.toLocaleString()}</span>
            </div>
        </div>
    `;

    if(cont) cont.innerHTML = html;

    checkoutData.total_productos = totalCalculado;
    checkoutData.productos = carritoData;
}

/* ================= DIRECCIÓN AUXILIAR ================= */

function inicializarDepartamento() {
    const input = document.getElementById("departamentoBuscador");
    const lista = document.getElementById("departamentoLista");
    input.addEventListener("input", function() {
        const v = this.value.toLowerCase();
        lista.innerHTML = "";
        Object.keys(MUNICIPIOS).forEach(dep => {
            if (dep.toLowerCase().includes(v)) {
                const d = document.createElement("div");
                d.className = "direccion-item";
                d.textContent = dep;
                d.onclick = () => { input.value = dep; lista.style.display = "none"; };
                lista.appendChild(d);
            }
        });
        lista.style.display = lista.innerHTML ? "block" : "none";
    });
}

function inicializarCiudad() {
    const input = document.getElementById("ciudad");
    const lista = document.getElementById("ciudadSugerencias");
    const depInput = document.getElementById("departamentoBuscador");
    input.addEventListener("input", function() {
        const v = this.value.toLowerCase();
        lista.innerHTML = "";
        Object.entries(MUNICIPIOS).forEach(([dep, ciudades]) => {
            ciudades.forEach(ciudad => {
                if (ciudad.toLowerCase().includes(v)) {
                    const d = document.createElement("div");
                    d.className = "direccion-item";
                    d.textContent = `${ciudad} - ${dep}`;
                    d.onclick = () => {
                        input.value = ciudad; depInput.value = dep;
                        lista.style.display = "none"; actualizarDocumento();
                    };
                    lista.appendChild(d);
                }
            });
        });
        lista.style.display = lista.innerHTML ? "block" : "none";
    });
}

function prellenarUsuario() {
    const data = localStorage.getItem("cupissa_user");
    if (!data) return;
    const u = JSON.parse(data);
    ["nombre", "email", "telefono", "direccion", "barrio", "ciudad", "departamento"].forEach(id => {
        const input = document.getElementById(id === "departamento" ? "departamentoBuscador" : id);
        if (input && u[id]) input.value = u[id];
    });
    actualizarDocumento();
}

function mostrarNotificacion(msg) {
    const div = document.createElement("div");
    div.className = "cupissa-notificacion";
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add("visible"), 10);
    setTimeout(() => {
        div.classList.remove("visible");
        setTimeout(() => div.remove(), 400);
    }, 3000);
}