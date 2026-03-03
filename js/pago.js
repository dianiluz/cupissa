/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT, DOMICILIOS Y MATEMÁTICAS */
/* ===================================================== */

const MUNICIPIOS = {
    "Atlántico":["Baranoa","Barranquilla", "Campo de la Cruz","Candelaria","Galapa", "Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela", "Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón", "Sabanagrande","Sabanalarga","Santa Lucía", "Santo Tomás", "Soledad","Suan","Tubará","Usiacurí"],
    "Bogotá D.C.":["Bogotá"],
    "Antioquia":["Medellín", "Bello", "Itagüí", "Envigado"],
    // Se agregan el resto de los municipios aquí (reducido por espacio en código, usa tu const MUNICIPIOS completo)
};

const barriosBD = [
    {n:"Buenos Aires", m:"BARRANQUILLA", p:8000}, {n:"San Luis", m:"BARRANQUILLA", p:9000}, {n:"Cevillar", m:"BARRANQUILLA", p:10000}, {n:"Santa María", m:"BARRANQUILLA", p:10000}, {n:"Ciudadela 20 de Julio", m:"BARRANQUILLA", p:8000}, {n:"Santo Domingo de Guzman", m:"BARRANQUILLA", p:10000}, {n:"El Santuario", m:"BARRANQUILLA", p:9000},
    {n:"Alfonso López", m:"BARRANQUILLA", p:12000}, {n:"Las Estrellas", m:"BARRANQUILLA", p:12000}, {n:"Corregimiento de Juan Mina", m:"BARRANQUILLA", p:17000},
    {n:"Chiquinquira", m:"BARRANQUILLA", p:13000}, {n:"Montes", m:"BARRANQUILLA", p:13000}, {n:"Barrio Abajo", m:"BARRANQUILLA", p:15000}, {n:"Centro Bquilla", m:"BARRANQUILLA", p:15000},
    {n:"La Playa", m:"BARRANQUILLA", p:18000}, {n:"Villa Campestre", m:"BARRANQUILLA", p:16000},
    {n:"Villa Estadio", m:"SOLEDAD", p:8000}, {n:"Las Moras", m:"SOLEDAD", p:9000}, {n:"El Hipódromo", m:"SOLEDAD", p:11000}, {n:"Centro Soledad", m:"SOLEDAD", p:12000}
];

const municipiosFijos = { "MALAMBO": 15000, "GALAPA": 18000, "PUERTO COLOMBIA": 20000 };

const Checkout = {
    cartTotal: 0,
    cartItemsCount: 0,
    tipoEnvio: "", 
    isLocal: false,
    costoDomicilio: 0,
    costoExpress: 0,
    metodoPago: "transferencia",
    tipoMonto: "anticipo", // anticipo o total

    init: () => {
        const saved = localStorage.getItem('cupissa_cart');
        const items = saved ? JSON.parse(saved) : [];
        if (items.length === 0) {
            window.location.href = "/catalogo/";
            return;
        }

        Checkout.renderSummary(items);
        Checkout.loadDepartments();
        Checkout.prefillData();
        Checkout.bindEvents();
    },

    prefillData: () => {
        const user = Utils.getUserSession();
        if (user) {
            document.getElementById('chkEmail').value = user.email || '';
            document.getElementById('chkNombre').value = user.nombre || '';
            document.getElementById('chkTelefono').value = user.telefono || '';
            document.getElementById('chkDireccion').value = user.direccion || '';
            document.getElementById('chkCC').value = user.cc || '';
        }
    },

    loadDepartments: () => {
        const select = document.getElementById('chkDepartamento');
        select.innerHTML = '<option value="">Seleccione...</option>';
        Object.keys(MUNICIPIOS).sort().forEach(dep => {
            select.innerHTML += `<option value="${dep}">${dep}</option>`;
        });
    },

    loadCities: () => {
        const dep = document.getElementById('chkDepartamento').value;
        const select = document.getElementById('chkCiudad');
        select.innerHTML = '<option value="">Seleccione...</option>';
        if (dep && MUNICIPIOS[dep]) {
            MUNICIPIOS[dep].sort().forEach(ciudad => {
                select.innerHTML += `<option value="${ciudad.toUpperCase()}">${ciudad}</option>`;
            });
        }
        Checkout.handleMunicipioChange();
    },

    handleMunicipioChange: () => {
        const ciudad = document.getElementById('chkCiudad').value;
        Checkout.isLocal = ["BARRANQUILLA", "SOLEDAD", "MALAMBO", "GALAPA", "PUERTO COLOMBIA"].includes(ciudad);
        
        const bCont = document.getElementById('barrio-container');
        const bManual = document.getElementById('barrio-manual');
        const bBuscador = document.getElementById('chkBarrioBuscador');
        const bHidden = document.getElementById('chkBarrio');
        const aviso = document.getElementById('aviso-barrio');

        bBuscador.value = '';
        bHidden.value = '';
        Checkout.costoDomicilio = 0;

        if (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") {
            bCont.style.display = 'block';
            bManual.style.display = 'none';
            aviso.innerText = "Busca en la lista para calcular el costo exacto.";
        } else if (municipiosFijos[ciudad]) {
            bCont.style.display = 'none';
            bManual.style.display = 'block';
            Checkout.costoDomicilio = municipiosFijos[ciudad];
        } else {
            bCont.style.display = 'none';
            bManual.style.display = 'block';
        }

        Checkout.updateEnvioOptions();
        Checkout.updateCCRequirement();
        Checkout.calculateTotals();
    },

    selectBarrioDinamico: (nombre, precio) => {
        document.getElementById('chkBarrioBuscador').value = nombre;
        document.getElementById('chkBarrio').value = nombre;
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('aviso-barrio').innerText = `Domicilio calculado: $${precio.toLocaleString('es-CO')}`;
        Checkout.costoDomicilio = precio;
        Checkout.calculateTotals();
    },

    updateEnvioOptions: () => {
        const container = document.getElementById('opcionesEnvio');
        if (Checkout.isLocal) {
            container.innerHTML = `
                <label class="radio-card selected" onclick="Checkout.selectEnvio('domicilio')">
                    <input type="radio" name="tipoEnvio" value="domicilio" checked>
                    <div class="radio-content">
                        <span class="radio-title">Domicilio Local</span>
                        <span class="radio-desc">Se agregará al total de tu pedido.</span>
                    </div>
                </label>
                <label class="radio-card" onclick="Checkout.selectEnvio('transportadora')">
                    <input type="radio" name="tipoEnvio" value="transportadora">
                    <div class="radio-content">
                        <span class="radio-title">Transportadora (Local)</span>
                        <span class="radio-desc">Pago de flete anticipado. Asesor cotiza por WhatsApp.</span>
                    </div>
                </label>
            `;
            Checkout.selectEnvio('domicilio');
        } else {
            container.innerHTML = `
                <label class="radio-card selected" onclick="Checkout.selectEnvio('transportadora')">
                    <input type="radio" name="tipoEnvio" value="transportadora" checked>
                    <div class="radio-content">
                        <span class="radio-title">Envío Nacional por Transportadora</span>
                        <span class="radio-desc">Flete cotizado por WhatsApp y cobrado anticipado.</span>
                    </div>
                </label>
            `;
            Checkout.selectEnvio('transportadora');
        }
    },

    selectEnvio: (tipo) => {
        Checkout.tipoEnvio = tipo;
        document.querySelectorAll('input[name="tipoEnvio"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === tipo) r.closest('.radio-card').classList.add('selected');
        });
        
        if (tipo === 'transportadora') {
            document.getElementById('chkEnvioValor').innerText = 'Cotizado por WhatsApp';
        } else {
            document.getElementById('chkEnvioValor').innerText = Checkout.costoDomicilio > 0 ? Utils.formatCurrency(Checkout.costoDomicilio) : 'A confirmar';
        }

        Checkout.updateCCRequirement();
        Checkout.updateMetodosPago();
        Checkout.calculateTotals();
    },

    renderExpressOptions: () => {
        const container = document.getElementById('opcionesExpress');
        let precioExpress = 0;
        
        if (Checkout.cartTotal <= 999999 && Checkout.cartItemsCount <= 5) {
            precioExpress = 10000;
            container.innerHTML = `
                <label class="radio-card" onclick="Checkout.selectProduccion('express')">
                    <input type="radio" name="tipoProduccion" value="express">
                    <div class="radio-content">
                        <span class="radio-title">Producción Express (24 a 72 horas)</span>
                        <span class="radio-desc">+ $10.000 adicionales al pedido.</span>
                    </div>
                </label>
            `;
        } else {
            precioExpress = 20000;
            container.innerHTML = `
                <label class="radio-card" onclick="Checkout.selectProduccion('express')">
                    <input type="radio" name="tipoProduccion" value="express">
                    <div class="radio-content">
                        <span class="radio-title">Producción Express Máxima (Hasta 144h / 6 días)</span>
                        <span class="radio-desc">+ $20.000 adicionales al pedido por volumen/valor.</span>
                    </div>
                </label>
            `;
        }
        Checkout.costoExpress = precioExpress;
    },

    selectProduccion: (tipo) => {
        document.querySelectorAll('input[name="tipoProduccion"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === tipo) r.closest('.radio-card').classList.add('selected');
        });

        const row = document.getElementById('rowProduccion');
        if (tipo === 'express') {
            row.style.display = 'flex';
            document.getElementById('chkProduccionValor').innerText = Utils.formatCurrency(Checkout.costoExpress);
        } else {
            row.style.display = 'none';
        }
        Checkout.calculateTotals();
    },

    selectTipoPago: (tipo) => {
        Checkout.tipoMonto = tipo;
        document.querySelectorAll('input[name="tipoMonto"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === tipo) r.closest('.radio-card').classList.add('selected');
        });
        
        document.getElementById('lblMontoAPagar').innerText = tipo === 'anticipo' ? 'Anticipo a pagar hoy (20%):' : 'Pago Total (100%):';
        Checkout.calculateTotals();
    },

    selectPago: (metodo) => {
        Checkout.metodoPago = metodo;
        document.querySelectorAll('input[name="metodoPago"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === metodo) r.closest('.radio-card').classList.add('selected');
        });
        Checkout.calculateTotals();
    },

    updateCCRequirement: () => {
        const ccInput = document.getElementById('chkCC');
        const lblOpt = document.getElementById('lblCCOpcional');
        
        if (!Checkout.isLocal || Checkout.tipoEnvio === 'transportadora') {
            ccInput.required = true;
            lblOpt.innerText = "(Obligatorio para envíos nacionales/transportadora)";
        } else {
            ccInput.required = false;
            lblOpt.innerText = "(Opcional)";
        }
    },

    updateMetodosPago: () => {
        const optCE = document.getElementById('optContraentrega');
        const descCE = document.getElementById('descContraentrega');
        
        optCE.style.display = 'flex';
        
        if (Checkout.isLocal && Checkout.tipoEnvio === 'domicilio') {
            descCE.innerText = "Paga el saldo en efectivo o transferencia al recibir tu pedido.";
        } else {
            descCE.innerText = "Solo con transportadora Interrapidisimo (Pago en Casa). Flete se paga anticipado SIEMPRE.";
        }
    },

    renderSummary: (items) => {
        const container = document.getElementById('chkSummaryItems');
        let subtotal = 0;
        let count = 0;
        container.innerHTML = '';

        items.forEach(item => {
            let varsHtml = '';
            for (const [key, val] of Object.entries(item.variaciones)) {
                varsHtml += `${key}: ${val} | `;
            }
            subtotal += (Utils.safeNumber(item.precio_unitario) * Utils.safeNumber(item.cantidad));
            count += Utils.safeNumber(item.cantidad);

            container.innerHTML += `
                <div class="summary-item">
                    <img src="${item.imagenurl}">
                    <div class="summary-item-info">
                        <div><strong>${item.cantidad}x</strong> ${item.nombre}</div>
                        <div style="color:gray; font-size:0.75rem;">${varsHtml.slice(0, -3)}</div>
                    </div>
                    <div class="summary-item-price">${Utils.formatCurrency(item.precio_unitario * item.cantidad)}</div>
                </div>
            `;
        });

        Checkout.cartTotal = subtotal;
        Checkout.cartItemsCount = count;
        document.getElementById('chkSubtotal').innerText = Utils.formatCurrency(subtotal);
        
        Checkout.renderExpressOptions();
        Checkout.calculateTotals();
    },

    calculateTotals: () => {
        const subtotal = Utils.safeNumber(Checkout.cartTotal);
        const envio = Checkout.tipoEnvio === 'domicilio' ? Utils.safeNumber(Checkout.costoDomicilio) : 0;
        const express = document.querySelector('input[name="tipoProduccion"]:checked').value === 'express' ? Utils.safeNumber(Checkout.costoExpress) : 0;

        const totalPedido = subtotal + envio + express;
        document.getElementById('chkTotalPedido').innerText = Utils.formatCurrency(totalPedido);

        // Definir base a pagar hoy (Anticipo 20% o Total 100%)
        let baseCobro = Checkout.tipoMonto === 'anticipo' ? (totalPedido * 0.20) : totalPedido;
        document.getElementById('chkMontoBaseValor').innerText = Utils.formatCurrency(baseCobro);

        // Comisiones pasarelas calculadas estrictamente sobre la base a cobrar y convertidas a número seguro
        let comisionNeta = 0;
        let ivaComision = 0;

        if (Checkout.metodoPago === 'wompi') {
            comisionNeta = (baseCobro * 0.0265) + 700;
            ivaComision = comisionNeta * 0.19;
        } else if (Checkout.metodoPago === 'addi') {
            comisionNeta = baseCobro * 0.09;
            ivaComision = comisionNeta * 0.19;
        }

        const comisionFinal = comisionNeta + ivaComision;
        const totalPagarCheckout = baseCobro + comisionFinal;

        const rowComision = document.getElementById('rowComision');
        if (comisionFinal > 0) {
            rowComision.style.display = 'flex';
            document.getElementById('chkComisionValor').innerText = Utils.formatCurrency(comisionFinal);
        } else {
            rowComision.style.display = 'none';
        }

        document.getElementById('chkTotalGeneral').innerText = Utils.formatCurrency(totalPagarCheckout);
    },

    nextStep: (step) => {
        if(step === 2) {
            let valid = true;
            ['chkEmail', 'chkNombre', 'chkTelefono', 'chkDepartamento', 'chkCiudad', 'chkDireccion'].forEach(id => {
                const el = document.getElementById(id);
                if(!el.value.trim()) { el.style.borderColor = 'red'; valid = false; } else { el.style.borderColor = 'var(--color-gray-medium)'; }
            });
            const bHidden = document.getElementById('chkBarrio');
            const bManual = document.getElementById('chkBarrioManual');
            const ciudad = document.getElementById('chkCiudad').value;
            
            if (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") {
                if(!bHidden.value.trim()) { document.getElementById('chkBarrioBuscador').style.borderColor = 'red'; valid = false; }
            } else {
                if(!bManual.value.trim()) { bManual.style.borderColor = 'red'; valid = false; }
            }

            if(document.getElementById('chkCC').required && !document.getElementById('chkCC').value.trim()) {
                document.getElementById('chkCC').style.borderColor = 'red'; valid = false;
            }

            if(!valid) return alert("Por favor completa los campos obligatorios en rojo. Asegúrate de seleccionar el barrio si es requerido.");
        }

        if(step === 4) Checkout.renderFinalSummary();

        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');

        document.querySelectorAll('.step-indicator').forEach((el, index) => {
            el.classList.remove('active');
            if(index < step) el.classList.add('completed');
            if(index === step - 1) { el.classList.remove('completed'); el.classList.add('active'); }
        });
        window.scrollTo(0,0);
    },

    prevStep: (step) => {
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');
        
        document.querySelectorAll('.step-indicator').forEach((el, index) => {
            el.classList.remove('active');
            if(index < step) el.classList.add('completed');
            else el.classList.remove('completed');
            if(index === step - 1) el.classList.add('active');
        });
        window.scrollTo(0,0);
    },

    renderFinalSummary: () => {
        const ciudad = document.getElementById('chkCiudad').value;
        const barrio = (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") ? document.getElementById('chkBarrio').value : document.getElementById('chkBarrioManual').value;
        
        const express = document.querySelector('input[name="tipoProduccion"]:checked').value === 'express' ? "SI" : "NO";

        document.getElementById('resumenDatosFinales').innerHTML = `
            <p><strong>Cliente:</strong> ${document.getElementById('chkNombre').value}</p>
            <p><strong>Cédula:</strong> ${document.getElementById('chkCC').value || 'N/A'}</p>
            <p><strong>Dirección:</strong> ${document.getElementById('chkDireccion').value}, ${barrio}</p>
            <p><strong>Ciudad:</strong> ${ciudad} (${document.getElementById('chkDepartamento').value})</p>
            <p><strong>Envío:</strong> ${Checkout.tipoEnvio.toUpperCase()}</p>
            <p><strong>Producción Express:</strong> ${express}</p>
            <p><strong>Pago en Checkout:</strong> ${Checkout.tipoMonto.toUpperCase()} con ${Checkout.metodoPago.toUpperCase()}</p>
            <p style="margin-top:10px; color:var(--color-pink); font-size:1.2rem; font-weight:bold;">Total a procesar hoy: ${document.getElementById('chkTotalGeneral').innerText}</p>
        `;
    },

    submitPedido: async () => {
        const btn = document.getElementById('btnConfirmarPedido');
        const err = document.getElementById('errorCheckout');
        btn.disabled = true;
        btn.innerText = "Conectando con Backend...";
        err.style.display = 'none';

        const ciudad = document.getElementById('chkCiudad').value;
        const barrio = (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") ? document.getElementById('chkBarrio').value : document.getElementById('chkBarrioManual').value;
        
        const saved = localStorage.getItem('cupissa_cart');
        const items = saved ? JSON.parse(saved) : [];

        // Valor a enviar limpio al backend (Total general del pedido sin comisiones de pasarela)
        const subtotal = Utils.safeNumber(Checkout.cartTotal);
        const envio = Checkout.tipoEnvio === 'domicilio' ? Utils.safeNumber(Checkout.costoDomicilio) : 0;
        const express = document.querySelector('input[name="tipoProduccion"]:checked').value === 'express' ? Utils.safeNumber(Checkout.costoExpress) : 0;
        const totalRealPedido = subtotal + envio + express;

        const payload = {
            action: 'registrarPedido',
            nombre_cliente: document.getElementById('chkNombre').value,
            usuario_email: document.getElementById('chkEmail').value,
            telefono: document.getElementById('chkTelefono').value,
            direccion: document.getElementById('chkDireccion').value,
            barrio: barrio,
            ciudad: ciudad,
            departamento: document.getElementById('chkDepartamento').value,
            cc: document.getElementById('chkCC').value,
            tipo: Checkout.isLocal ? 'LOCAL' : 'NACIONAL',
            transportadora: Checkout.tipoEnvio === 'transportadora' ? 'POR ASIGNAR' : 'DOMICILIO',
            metodo_pago: Checkout.metodoPago,
            total: totalRealPedido,
            productos: JSON.stringify(items)
        };

        const fd = new FormData();
        Object.keys(payload).forEach(k => fd.append(k, payload[k]));

        try {
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const data = await res.json();

            if(data.success) {
                localStorage.removeItem('cupissa_cart');
                alert(`¡Pedido Registrado con éxito! Tu ID es: ${data.id_pedido}. Serás redirigido a rastreo.`);
                window.location.href = `/rastreo/?id=${data.id_pedido}`;
            } else {
                err.innerText = data.error || "Error en el servidor. Verifica el ID de Apps Script.";
                err.style.display = 'block';
                btn.disabled = false;
                btn.innerText = "Confirmar y Generar Pedido";
            }
        } catch (error) {
            err.innerText = "Error de conexión. Revisa tu internet o la URL del backend.";
            err.style.display = 'block';
            btn.disabled = false;
            btn.innerText = "Confirmar y Generar Pedido";
        }
    },

    bindEvents: () => {
        // Buscador de barrios
        document.getElementById('chkBarrioBuscador').addEventListener('input', function() {
            const val = Utils.normalizeStr(this.value);
            const muni = document.getElementById('chkCiudad').value;
            const sugg = document.getElementById('suggestions');
            sugg.innerHTML = '';
            
            if (val.length < 1) { sugg.style.display = 'none'; return; }

            const filtered = barriosBD.filter(b => b.m === muni && Utils.normalizeStr(b.n).includes(val));
            if (filtered.length > 0) {
                filtered.forEach(b => {
                    const d = document.createElement('div');
                    d.className = 'sug-item';
                    d.textContent = b.n;
                    d.onclick = () => Checkout.selectBarrioDinamico(b.n, b.p);
                    sugg.appendChild(d);
                });
                sugg.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => { 
            if (e.target.id !== 'chkBarrioBuscador') {
                const sugg = document.getElementById('suggestions');
                if(sugg) sugg.style.display = 'none'; 
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Checkout.init);