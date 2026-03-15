/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT Y PASARELAS (SUPABASE)   */
/* ===================================================== */

const MUNICIPIOS = {
    "Amazonas":["Leticia", "Puerto Nariño", "El Encanto", "La Chorrera", "La Pedrera", "La Victoria","Mirití-Paraná", "Puerto Alegría","Puerto Arica", "Puerto Santander", "Tarapacá"],
    "Antioquia":["Abejorral", "Abriaquí", "Alejandría", "Amagá","Amalfi", "Andes", "Angelópolis","Angostura","Anorí","Anzá","Apartadó","Arboletes", "Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia", "Bolívar","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa", "Carolina del Príncipe","Caucasia","Chigorodó","Cisneros","Cocorná", "Concepción","Concordia","Copacabana","Dabeiba","Don Matías", "Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia", "Frontino","Giraldo","Girardota","Gómez Plata", "Granada", "Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí", "Ituango","Jardín","Jericó","La Ceja", "La Estrella", "La Pintada", "La Unión","Liborina","Maceo","Marinilla","Medellín"," Montebello", "Murindó","Mutatá","Nariño","Nechí","Necoclí","Olaya","Peñol", "Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo", "Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar", "San Andrés", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá","San Luis", "San Pedro", "San Pedro de Urabá","San Rafael", "San Roque", "Santa Bárbara", "Santa Fe de Antioquia", "Santa Rosa de Osos", "Santo Domingo", "El Santuario","San Vicente", "Segovia", "Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí", "Toledo","Turbo","Uramita","Urrao","Valdivia", "Valparaíso", "Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal", "Yolombó","Yondó","Zaragoza"],
    "Arauca":["Arauca","Arauquita","Cravo Norte","Fortul", "Puerto Rondón","Saravena","Tame"],
    "Atlántico":["Baranoa","Barranquilla", "Campo de la Cruz","Candelaria","Galapa", "Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela", "Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón", "Sabanagrande","Sabanalarga","Santa Lucía", "Santo Tomás", "Soledad","Suan","Tubará","Usiacurí"],
    "Bogotá D.C.":["Bogotá"],
    "Bolívar":["Achí","Altos del Rosario","Arenal","Arjona","Arroyo Hondo", "Barranco de Loba","Calamar","Cantagallo","Cartagena","Cicuco","Clemencia","Córdoba","El Carmen de Bolívar", "El Guamo","El Peñón","Hatillo de Loba","Magangué", "Mahates","Margarita", "María La Baja", "Montecristo", "Morales", "Norosí","Pinillos", "Regidor", "Río Viejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto", "San Juan Nepomuceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur","Simití","Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbaná","Villanueva", "Zambrano"],
    "Boyacá":["Tunja","Duitama","Sogamoso","Chiquinquirá","Paipa", "Puerto Boyacá","Villa de Leyva","Moniquirá","Soatá","Socha", "Samacá","Ramiriquí","Miraflores","Garagoa","Ráquira", "Nobsa","Muzo","Pauna","Otanche","Aquitania"],
    "Caldas":["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná", "Filadelfia","La Dorada","La Merced","Manizales", "Manzanares","Marmato","Marquetalia","Marulanda", "Neira","Norcasia","Pácora","Palestina","Pensilvania", "Riosucio","Risaralda","Salamina","Samaná","San José", "Supía","Victoria","Villamaría","Viterbo"],
    "Caquetá":["Albania","Belén de los Andaquíes","Cartagena del Chairá", "Curillo","El Doncello","El Paujil","Florencia", "La Montañita","Milán","Morelia","Puerto Rico", "San José del Fragua","San Vicente del Caguán", "Solano","Solita","Valparaíso"],
    "Casanare":["Aguazul","Chámeza","Hato Corozal","La Salina", "Maní","Monterrey","Nunchía","Orocué", "Paz de Ariporo","Pore","Recetor", "Sabanalarga","Sácama","San Luis de Palenque", "Támara","Tauramena","Trinidad","Villanueva","Yopal"],
    "Cauca":["Popayán","Santander de Quilichao","Puerto Tejada", "Corinto","El Tambo","Guapi","Miranda","Silvia", "Timbío","Villa Rica"],
    "Cesar":["Valledupar","Aguachica","Agustín Codazzi", "Bosconia","Chimichagua","Curumaní", "La Jagua de Ibirico","Pueblo Bello", "San Alberto","San Diego","San Martín"],
    "Chocó":["Quibdó","Acandí","Bahía Solano", "Istmina","Nuquí","Riosucio","Tadó"],
    "Córdoba":["Montería","Cereté","Lorica","Sahagún", "Montelíbano","Planeta Rica","Tierralta", "Valencia","Ayapel","Chinú"],
    "Cundinamarca":["Soacha","Chía","Zipaquirá","Girardot", "Facatativá","Fusagasugá","Madrid", "Mosquera","Cajicá","La Calera"],
    "La Guajira":["Riohacha","Maicao","Uribia", "Manaure","San Juan del Cesar", "Fonseca","Albania","Barrancas"],
    "Magdalena":["Santa Marta","Ciénaga","Fundación", "El Banco","Aracataca","Zona Bananera", "Plato","Pivijay"],
    "Meta":["Villavicencio","Acacías","Granada", "Puerto López","Restrepo","Cumaral"],
    "Nariño":["Pasto","Tumaco","Ipiales", "Túquerres","La Unión","Samaniego"],
    "Norte de Santander":["Cúcuta","Ocaña","Pamplona", "Villa del Rosario","Tibú"],
    "Putumayo":["Mocoa","Puerto Asís","Orito", "San Miguel","Sibundoy"],
    "Quindío":["Armenia","Calarcá","Montenegro", "La Tebaida","Quimbaya","Salento"],
    "Risaralda":["Pereira","Dosquebradas", "Santa Rosa de Cabal","La Virginia"],
    "Santander":["Bucaramanga","Floridablanca", "Girón","Piedecuesta","Barrancabermeja", "San Gil","Socorro"],
    "Sucre":["Sincelejo","Corozal","Sampués", "San Marcos","Tolú"],
    "Tolima":["Ibagué","Espinal","Melgar", "Líbano","Mariquita","Honda"],
    "Valle del Cauca":["Cali","Palmira","Buenaventura", "Tuluá","Cartago","Buga","Jamundí"],
    "Vaupés":["Mitú","Carurú","Taraira"],
    "Vichada":["Puerto Carreño","Cumaribo", "La Primavera","Santa Rosalía"]
};

const barriosBD = [
    {n:"Buenos Aires", m:"BARRANQUILLA", p:8000}, {n:"Los Girasoles", m:"BARRANQUILLA", p:8000}, {n:"Carrizal", m:"BARRANQUILLA", p:8000}, {n:"San Luis", m:"BARRANQUILLA", p:9000}, {n:"Cevillar", m:"BARRANQUILLA", p:10000}, {n:"Santa María", m:"BARRANQUILLA", p:10000}, {n:"Ciudadela 20 de Julio", m:"BARRANQUILLA", p:8000}, {n:"Santo Domingo de Guzman", m:"BARRANQUILLA", p:10000}, {n:"El Santuario", m:"BARRANQUILLA", p:9000}, {n:"Sevilla Real", m:"BARRANQUILLA", p:10000}, {n:"Kennedy", m:"BARRANQUILLA", p:10000}, {n:"Siete de Abril", m:"BARRANQUILLA", p:8000}, {n:"La Sierra", m:"BARRANQUILLA", p:10000}, {n:"Sinaí", m:"BARRANQUILLA", p:10000}, {n:"La Sierrita", m:"BARRANQUILLA", p:9000}, {n:"Veinte de Julio", m:"BARRANQUILLA", p:8000}, {n:"Las Americas", m:"BARRANQUILLA", p:9000}, {n:"Villa San Carlos", m:"BARRANQUILLA", p:10000}, {n:"Las Cayenas", m:"BARRANQUILLA", p:8000}, {n:"Villa San Pedro", m:"BARRANQUILLA", p:10000}, {n:"Las Gardenias", m:"BARRANQUILLA", p:10000}, {n:"Villa Sevilla", m:"BARRANQUILLA", p:10000}, {n:"Las Granjas", m:"BARRANQUILLA", p:10000}, {n:"Villa Valery", m:"BARRANQUILLA", p:10000}, {n:"Los Continentes", m:"BARRANQUILLA", p:10000},
    {n:"Alfonso López", m:"BARRANQUILLA", p:12000}, {n:"Las Estrellas", m:"BARRANQUILLA", p:12000}, {n:"Bernardo Hoyos", m:"BARRANQUILLA", p:12000}, {n:"Las Malvinas", m:"BARRANQUILLA", p:10000}, {n:"Buena Esperanza", m:"BARRANQUILLA", p:12000}, {n:"Las Terrazas", m:"BARRANQUILLA", p:12000}, {n:"California", m:"BARRANQUILLA", p:12000}, {n:"Lipaya", m:"BARRANQUILLA", p:10000}, {n:"Caribe Verde", m:"BARRANQUILLA", p:12000}, {n:"Loma Fresca", m:"BARRANQUILLA", p:12000}, {n:"Carlos Meisel", m:"BARRANQUILLA", p:12000}, {n:"Los Andes", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles II", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles III", m:"BARRANQUILLA", p:12000}, {n:"Ciudad Modesto", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de la Salud", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de Paz", m:"BARRANQUILLA", p:12000}, {n:"Colina Campestre", m:"BARRANQUILLA", p:12000}, {n:"Cordialidad", m:"BARRANQUILLA", p:10000}, {n:"Los Olivos", m:"BARRANQUILLA", p:12000}, {n:"Los Olivos II", m:"BARRANQUILLA", p:12000}, {n:"Corregimiento de Juan Mina", m:"BARRANQUILLA", p:17000}, {n:"Los Pinos", m:"BARRANQUILLA", p:12000}, {n:"Cuchilla de Villate", m:"BARRANQUILLA", p:12000}, {n:"Los Rosales", m:"BARRANQUILLA", p:12000}, {n:"El Bosque", m:"BARRANQUILLA", p:10000}, {n:"El Carmén", m:"BARRANQUILLA", p:12000}, {n:"Lucero", m:"BARRANQUILLA", p:12000}, {n:"Me Quejo", m:"BARRANQUILLA", p:12000}, {n:"Mercedes Sur", m:"BARRANQUILLA", p:12000}, {n:"El Pueblo", m:"BARRANQUILLA", p:12000}, {n:"Nueva Colombia", m:"BARRANQUILLA", p:12000}, {n:"El Romance", m:"BARRANQUILLA", p:12000}, {n:"Nueva Granada", m:"BARRANQUILLA", p:12000}, {n:"El Rubí", m:"BARRANQUILLA", p:12000}, {n:"Olaya", m:"BARRANQUILLA", p:12000}, {n:"El Silencio", m:"BARRANQUILLA", p:12000}, {n:"El Valle", m:"BARRANQUILLA", p:10000}, {n:"Por Fin", m:"BARRANQUILLA", p:12000}, {n:"Pumarejo", m:"BARRANQUILLA", p:12000}, {n:"Gerlein y Villate", m:"BARRANQUILLA", p:12000}, {n:"San Felipe", m:"BARRANQUILLA", p:12000}, {n:"Kalamary", m:"BARRANQUILLA", p:12000}, {n:"San Isidro", m:"BARRANQUILLA", p:12000}, {n:"La Ceiba", m:"BARRANQUILLA", p:12000}, {n:"La Esmeralda", m:"BARRANQUILLA", p:10000}, {n:"San Pedro Alejandrino", m:"BARRANQUILLA", p:12000}, {n:"San Pedro Sector I", m:"BARRANQUILLA", p:12000}, {n:"Santo Domigo", m:"BARRANQUILLA", p:12000}, {n:"Siete de Agosto", m:"BARRANQUILLA", p:12000}, {n:"La Libertad", m:"BARRANQUILLA", p:12000}, {n:"Villa del Rosario", m:"BARRANQUILLA", p:12000}, {n:"Villa Flor", m:"BARRANQUILLA", p:12000}, {n:"Villas de la Cordialidad", m:"BARRANQUILLA", p:12000}, {n:"Villas de San Pablo", m:"BARRANQUILLA", p:12000}, {n:"Las Colinas", m:"BARRANQUILLA", p:12000},
    {n:"Atlántico", m:"BARRANQUILLA", p:12000}, {n:"Las Palmeras", m:"BARRANQUILLA", p:12000}, {n:"Bellarena", m:"BARRANQUILLA", p:12000}, {n:"Los Laureles", m:"BARRANQUILLA", p:12000}, {n:"Boyaca", m:"BARRANQUILLA", p:12000}, {n:"Los Trupillos", m:"BARRANQUILLA", p:12000}, {n:"Chiquinquira", m:"BARRANQUILLA", p:13000}, {n:"Moderno", m:"BARRANQUILLA", p:12000}, {n:"El Campito", m:"BARRANQUILLA", p:12000}, {n:"Montes", m:"BARRANQUILLA", p:13000}, {n:"El Limón", m:"BARRANQUILLA", p:12000}, {n:"Pasadena", m:"BARRANQUILLA", p:12000}, {n:"El Milagro", m:"BARRANQUILLA", p:12000}, {n:"Primero de Mayo", m:"BARRANQUILLA", p:12000}, {n:"El Ferry", m:"BARRANQUILLA", p:13000}, {n:"El Parque Sector Barranquilla", m:"BARRANQUILLA", p:12000}, {n:"Rebolo", m:"BARRANQUILLA", p:13000}, {n:"José Antonio Galán", m:"BARRANQUILLA", p:12000}, {n:"San Jose", m:"BARRANQUILLA", p:12000}, {n:"San Nicolás", m:"BARRANQUILLA", p:13000}, {n:"San Roque", m:"BARRANQUILLA", p:13000}, {n:"Santa Helena", m:"BARRANQUILLA", p:12000}, {n:"Simón Bolívar", m:"BARRANQUILLA", p:12000}, {n:"La Luz", m:"BARRANQUILLA", p:13000}, {n:"La Magdalena", m:"BARRANQUILLA", p:12000}, {n:"La Unión", m:"BARRANQUILLA", p:12000}, {n:"La Victoria", m:"BARRANQUILLA", p:12000}, {n:"Tayrona", m:"BARRANQUILLA", p:12000}, {n:"Universal I", m:"BARRANQUILLA", p:12000}, {n:"Universal II", m:"BARRANQUILLA", p:12000}, {n:"Las Dunas", m:"BARRANQUILLA", p:12000}, {n:"Las Nieves", m:"BARRANQUILLA", p:12000}, {n:"Villa Blanca", m:"BARRANQUILLA", p:12000}, {n:"Villa del Carmén", m:"BARRANQUILLA", p:12000}, {n:"Las Palmas", m:"BARRANQUILLA", p:12000},
    {n:"Barrio Abajo", m:"BARRANQUILLA", p:15000}, {n:"La Concepción", m:"BARRANQUILLA", p:15000}, {n:"Alameda del Rio", m:"BARRANQUILLA", p:15000}, {n:"La Cumbre", m:"BARRANQUILLA", p:15000}, {n:"Altos del Prado", m:"BARRANQUILLA", p:15000}, {n:"La Loma", m:"BARRANQUILLA", p:15000}, {n:"America", m:"BARRANQUILLA", p:15000}, {n:"Las Delicias", m:"BARRANQUILLA", p:15000}, {n:"Barlovento", m:"BARRANQUILLA", p:15000}, {n:"Las Mercedes", m:"BARRANQUILLA", p:15000}, {n:"Bellavista", m:"BARRANQUILLA", p:15000}, {n:"Las Nubes (vereda)", m:"BARRANQUILLA", p:15000}, {n:"Bethania", m:"BARRANQUILLA", p:15000}, {n:"Los Alpes", m:"BARRANQUILLA", p:15000}, {n:"Bostón", m:"BARRANQUILLA", p:15000}, {n:"Los Jobos", m:"BARRANQUILLA", p:15000}, {n:"Campo Alegre", m:"BARRANQUILLA", p:15000}, {n:"Los Nogales", m:"BARRANQUILLA", p:15000}, {n:"Centro Bquilla", m:"BARRANQUILLA", p:15000}, {n:"Miramar", m:"BARRANQUILLA", p:15000}, {n:"Ciudad Jardín", m:"BARRANQUILLA", p:15000}, {n:"Modelo", m:"BARRANQUILLA", p:15000}, {n:"Colombia", m:"BARRANQUILLA", p:15000}, {n:"Montecristo", m:"BARRANQUILLA", p:15000}, {n:"El Castillo", m:"BARRANQUILLA", p:15000}, {n:"El Golf", m:"BARRANQUILLA", p:15000}, {n:"El Porvenir", m:"BARRANQUILLA", p:15000}, {n:"El Prado", m:"BARRANQUILLA", p:15000}, {n:"El Recreo", m:"BARRANQUILLA", p:15000}, {n:"San Francisco", m:"BARRANQUILLA", p:15000}, {n:"El Rosario", m:"BARRANQUILLA", p:15000}, {n:"Santa Ana", m:"BARRANQUILLA", p:15000}, {n:"El Tabor", m:"BARRANQUILLA", p:15000}, {n:"Villa Country", m:"BARRANQUILLA", p:15000}, {n:"La Campiña", m:"BARRANQUILLA", p:15000}, {n:"Villanueva", m:"BARRANQUILLA", p:15000}, {n:"Zona Franca", m:"BARRANQUILLA", p:15000}, {n:"Zona Industrial", m:"BARRANQUILLA", p:15000}, {n:"Paraiso", m:"BARRANQUILLA", p:15000},
    {n:"Altamira", m:"BARRANQUILLA", p:15000}, {n:"Riomar", m:"BARRANQUILLA", p:15000}, {n:"Altos de Riomar", m:"BARRANQUILLA", p:15000}, {n:"San Salvador", m:"BARRANQUILLA", p:15000}, {n:"Altos del Limón", m:"BARRANQUILLA", p:15000}, {n:"San Vicente", m:"BARRANQUILLA", p:15000}, {n:"Andalucia", m:"BARRANQUILLA", p:15000}, {n:"Santa Mónica", m:"BARRANQUILLA", p:15000}, {n:"Corregimiento Eduardo Santos", m:"BARRANQUILLA", p:17000}, {n:"La Playa", m:"BARRANQUILLA", p:18000}, {n:"Siape", m:"BARRANQUILLA", p:15000}, {n:"El Limoncito", m:"BARRANQUILLA", p:15000}, {n:"Solaire Norte", m:"BARRANQUILLA", p:16000}, {n:"El Poblado", m:"BARRANQUILLA", p:15000}, {n:"Villa Campestre", m:"BARRANQUILLA", p:16000}, {n:"La Floresta", m:"BARRANQUILLA", p:15000}, {n:"Villa Carolina", m:"BARRANQUILLA", p:15000}, {n:"Las Flores", m:"BARRANQUILLA", p:16000}, {n:"Villa del Este", m:"BARRANQUILLA", p:15000}, {n:"Las Tres Ave Maria", m:"BARRANQUILLA", p:15000}, {n:"Villa Santos", m:"BARRANQUILLA", p:15000},
    {n:"Villa Estadio", m:"SOLEDAD", p:8000}, {n:"Los Robles", m:"SOLEDAD", p:8000}, {n:"Las Moras", m:"SOLEDAD", p:9000}, {n:"13 de Mayo", m:"SOLEDAD", p:10000}, {n:"16 de Julio", m:"SOLEDAD", p:10000}, {n:"20 de Julio", m:"SOLEDAD", p:10000}, {n:"7 de Agosto", m:"SOLEDAD", p:9000}, {n:"12 de Octubre", m:"SOLEDAD", p:10000}, {n:"Altos de Sevilla", m:"SOLEDAD", p:10000}, {n:"Bella Murillo", m:"SOLEDAD", p:9000}, {n:"Bonanza", m:"SOLEDAD", p:9000}, {n:"Cabrera", m:"SOLEDAD", p:10000}, {n:"Centenario", m:"SOLEDAD", p:10000}, {n:"Ciudad Bolívar", m:"SOLEDAD", p:10000}, {n:"Ciudad Camelot", m:"SOLEDAD", p:10000}, {n:"Ciudad Paraíso", m:"SOLEDAD", p:10000}, {n:"El Parque", m:"SOLEDAD", p:8000}, {n:"El Pasito", m:"SOLEDAD", p:10000}, {n:"El Río", m:"SOLEDAD", p:10000}, {n:"El Triunfo", m:"SOLEDAD", p:10000}, {n:"El Tucan", m:"SOLEDAD", p:9000}, {n:"La Alianza", m:"SOLEDAD", p:10000}, {n:"La Arboleda", m:"SOLEDAD", p:9000}, {n:"La Central", m:"SOLEDAD", p:10000}, {n:"La Esperanza", m:"SOLEDAD", p:10000}, {n:"La Farruca", m:"SOLEDAD", p:10000}, {n:"Las Gaviotas", m:"SOLEDAD", p:9000}, {n:"Las Margaritas", m:"SOLEDAD", p:9000}, {n:"Las Nubes", m:"SOLEDAD", p:10000}, {n:"Las Trinitarias", m:"SOLEDAD", p:9000}, {n:"Los Almendros", m:"SOLEDAD", p:10000}, {n:"Los Arrayanes", m:"SOLEDAD", p:10000}, {n:"Los Balcanes", m:"SOLEDAD", p:10000}, {n:"Los Cedros", m:"SOLEDAD", p:10000}, {n:"Los Cusules", m:"SOLEDAD", p:10000}, {n:"Los Laureles", m:"SOLEDAD", p:10000}, {n:"Los Loteros", m:"SOLEDAD", p:10000}, {n:"Nuevo Triunfo", m:"SOLEDAD", p:10000}, {n:"Oriental", m:"SOLEDAD", p:10000}, {n:"Portal De Las Moras", m:"SOLEDAD", p:9000}, {n:"Porvenir", m:"SOLEDAD", p:10000}, {n:"Primero De Mayo", m:"SOLEDAD", p:10000}, {n:"Puerta de Oro", m:"SOLEDAD", p:10000}, {n:"Pumarejo Soledad", m:"SOLEDAD", p:10000}, {n:"Renacer", m:"SOLEDAD", p:10000}, {n:"Sal Si Puedes", m:"SOLEDAD", p:10000}, {n:"Salcedo", m:"SOLEDAD", p:10000}, {n:"San Antonio", m:"SOLEDAD", p:10000}, {n:"Villa Angelita", m:"SOLEDAD", p:9000}, {n:"Villa del Carmen", m:"SOLEDAD", p:10000}, {n:"Villa del Rey", m:"SOLEDAD", p:10000}, {n:"Villa Estefanny", m:"SOLEDAD", p:10000}, {n:"Villa Éxito", m:"SOLEDAD", p:10000}, {n:"Villa Gladys", m:"SOLEDAD", p:10000}, {n:"Villa Karla", m:"SOLEDAD", p:10000}, {n:"Villa Katanga", m:"SOLEDAD", p:9000}, {n:"Villa María", m:"SOLEDAD", p:10000}, {n:"Villa Merly", m:"SOLEDAD", p:10000}, {n:"Villa Monaco", m:"SOLEDAD", p:10000}, {n:"Villa Severa", m:"SOLEDAD", p:10000}, {n:"Villa Valentina", m:"SOLEDAD", p:10000}, {n:"Villa Viola", m:"SOLEDAD", p:10000},
    {n:"Centro Soledad", m:"SOLEDAD", p:12000}, {n:"El Hipódromo", m:"SOLEDAD", p:11000}, {n:"Ferrocarril", m:"SOLEDAD", p:12000}, {n:"Juan Domínguez Romero", m:"SOLEDAD", p:12000}, {n:"Prado Soledad", m:"SOLEDAD", p:11000}, {n:"Salamanca", m:"SOLEDAD", p:12000}
];

const municipiosFijos = { "MALAMBO": 15000, "GALAPA": 18000, "PUERTO COLOMBIA": 20000 };
const CIUDADES_LOCALES = ["BARRANQUILLA", "SOLEDAD", "MALAMBO", "GALAPA", "PUERTO COLOMBIA", "VILLA OLIMPICA"];

const Checkout = {
    items: [],
    costoEnvioActual: 0,
    currentStep: 1,
    isSubmitting: false,
    
    descuentoMonto: 0,
    codigoAplicado: '',
    cupicoinsDisponibles: 0,
    cupicoinsUsar: 0,

    init: () => {
        Checkout.loadCart();
        Checkout.bindEvents();
        Checkout.restoreCheckoutData();
        Checkout.injectDescuentosUI();
        Checkout.renderResumen();
        Checkout.updateStepper();
    },

    restoreCheckoutData: () => {
        const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
        Object.keys(data).forEach(id => {
            const el = document.getElementById(id);
            if(el && el.type !== 'file') el.value = data[id];
        });
        if(data['chkCorreo']) {
            Checkout.buscarDatosUsuario(data['chkCorreo']);
        }
    },

    loadCart: () => {
        const saved = localStorage.getItem('cupissa_cart');
        if (saved) Checkout.items = JSON.parse(saved);
        if (!Checkout.items || Checkout.items.length === 0) {
            setTimeout(() => window.location.href = '/catalogo/', 1000);
        }
    },

    buscarDatosUsuario: async (email) => {
        if (!email || !window.db) return;
        Checkout.verificarCupicoins(email);
        try {
            const { data } = await window.db.from('usuarios').select('*').eq('email', email.trim().toLowerCase()).single();
            if (data) {
                if (data.nombre && !document.getElementById('chkNombre').value) document.getElementById('chkNombre').value = data.nombre;
                if (data.telefono && !document.getElementById('chkTelefono').value) document.getElementById('chkTelefono').value = data.telefono;
                if (data.ciudad && !document.getElementById('chkCiudad').value) {
                    document.getElementById('chkCiudad').value = data.ciudad;
                    Checkout.autocompletarDepartamento();
                }
                if (data.barrio && !document.getElementById('chkBarrioBuscador').value) document.getElementById('chkBarrioBuscador').value = data.barrio;
                if (data.direccion && !document.getElementById('chkDireccion').value) document.getElementById('chkDireccion').value = data.direccion;
                if (data.cc && document.getElementById('chkCedula')) document.getElementById('chkCedula').value = data.cc;
                
                Checkout.calcularEnvio();
            }
        } catch (e) {
            // Es un usuario nuevo, falla silenciosa
        }
    },

    verificarCupicoins: async (email) => {
        if (!email || !window.db) return;
        try {
            const { data } = await window.db.from('billeteras').select('saldo').eq('email', email.trim().toLowerCase()).single();
            const box = document.getElementById('boxCupicoins');
            if (data && data.saldo > 0) {
                Checkout.cupicoinsDisponibles = data.saldo;
                if(box) box.style.display = 'block';
                document.getElementById('lblCupiDisp').innerText = data.saldo;
                document.getElementById('lblCupiDinero').innerText = Utils.formatCurrency(data.saldo);
            } else {
                if(box) box.style.display = 'none';
                Checkout.cupicoinsDisponibles = 0;
            }
            Checkout.calcularTotalFinal();
        } catch(e) { console.warn("Sin billetera"); }
    },

    toggleCupicoins: () => {
        const isChecked = document.getElementById('chkUsarCupicoins').checked;
        Checkout.cupicoinsUsar = isChecked ? Checkout.cupicoinsDisponibles : 0;
        Checkout.calcularTotalFinal();
    },

    aplicarCupon: async () => {
        const input = document.getElementById('inputCodigoDescuento');
        const codigo = input.value.trim().toUpperCase();
        if (!codigo || !window.db) return;
        
        let subtotal = Checkout.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
        try {
            const { data: col } = await window.db.from('colaboradores').select('*').eq('codigo_asignado', codigo).eq('estado_contrato', 'FIRMADO').single();
            if (col) {
                Checkout.descuentoMonto = subtotal * 0.10;
                Checkout.codigoAplicado = codigo;
                Utils.toast(`¡Apoyando a ${col.usuario_redes}! (-10%)`, "success");
            } else {
                const { data: promo } = await window.db.from('promociones').select('*').eq('codigo', codigo).eq('estado', 'ACTIVA').single();
                if (promo) {
                    Checkout.descuentoMonto = promo.tipo === 'PORCENTAJE' ? (subtotal * (promo.valor / 100)) : promo.valor;
                    Checkout.codigoAplicado = codigo;
                    Utils.toast("¡Cupón aplicado!", "success");
                } else {
                    const { data: refClient } = await window.db.from('usuarios').select('*').eq('codigo_referido', codigo).single();
                    if (refClient) {
                        Checkout.descuentoMonto = 0; 
                        Checkout.codigoAplicado = codigo;
                        Utils.toast("¡Código válido! Las CupiCoins de este pedido se sumarán tanto a tu cuenta como a la de quien te refirió al entregar el pedido.", "success");
                    } else {
                        Utils.toast("Código no válido o inactivo", "error");
                        Checkout.descuentoMonto = 0;
                        Checkout.codigoAplicado = '';
                    }
                }
            }
            Checkout.calcularTotalFinal();
        } catch (e) { Utils.toast("Error validando código", "error"); }
    },

    nextStep: (step) => {
        if (!Checkout.validateStep(Checkout.currentStep)) return;
        Checkout.currentStep = step;
        Checkout.updateStepper();
    },

    prevStep: (step) => {
        Checkout.currentStep = step;
        Checkout.updateStepper();
    },

    updateStepper: () => {
        document.querySelectorAll('.checkout-step').forEach(el => el.style.display = 'none');
        const current = document.getElementById(`step-${Checkout.currentStep}`);
        if(current) current.style.display = 'block';

        document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
        for(let i = 1; i <= Checkout.currentStep; i++) {
            const ind = document.getElementById(`ind-${i}`);
            if(ind) ind.classList.add('active');
        }
        window.scrollTo(0, 0);
    },

    validateStep: (step) => {
        if (step === 1) {
            const nom = document.getElementById('chkNombre').value.trim();
            const tel = document.getElementById('chkTelefono').value.trim();
            const cor = document.getElementById('chkCorreo').value.trim();
            if (!nom || !tel || !cor) {
                Utils.toast("Completa todos los datos de contacto", "error");
                return false;
            }
            return true;
        }
        if (step === 2) {
            const ciu = document.getElementById('chkCiudad').value.trim().toUpperCase();
            const dir = document.getElementById('chkDireccion').value.trim();
            if (!ciu || !dir) {
                Utils.toast("Completa la ciudad y la dirección", "error");
                return false;
            }
            const esLocal = CIUDADES_LOCALES.includes(ciu);
            if (!esLocal) {
                const cedula = document.getElementById('chkCedula') ? document.getElementById('chkCedula').value.trim() : '';
                if (!cedula) {
                    Utils.toast("La cédula es obligatoria para envíos nacionales", "error");
                    return false;
                }
            }
            return true;
        }
        return true;
    },

    renderResumen: () => {
        const container = document.getElementById('chkItemsContainer');
        if (!container) return;
        container.innerHTML = '';
        Checkout.items.forEach(item => {
            let imgUrlFinal = '/assets/logo.png';
            if (item.imagenurl && String(item.imagenurl).trim() !== '') {
                let rawPath = String(item.imagenurl).split('|')[0].trim();
                if (rawPath.includes('drive.google.com')) {
                    const match = rawPath.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) imgUrlFinal = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
                } else if (rawPath.startsWith('http')) {
                    imgUrlFinal = rawPath;
                } else {
                    imgUrlFinal = `https://raw.githubusercontent.com/dianiluz/cupissa/main/${rawPath.replace(/^\//, '')}`;
                }
            }

            container.innerHTML += `
                <div class="summary-item" style="display:flex; gap:10px; margin-bottom:10px;">
                    <img src="${imgUrlFinal}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" onerror="this.src='/assets/logo.png'">
                    <div style="flex:1; font-size:0.85rem;">
                        <div>${item.nombre} (x${item.cantidad})</div>
                        <div style="color:var(--color-pink); font-weight:bold;">${Utils.formatCurrency(item.precio_unitario * item.cantidad)}</div>
                    </div>
                </div>`;
        });
        Checkout.calcularTotalFinal();
    },

    autocompletarDepartamento: () => {
        const ciudadInput = document.getElementById('chkCiudad');
        const deptoInput = document.getElementById('chkDepartamento');
        if (!ciudadInput || !deptoInput) return;

        const ciudadM = Utils.normalizeStr(ciudadInput.value);
        let encontrado = false;

        for (const [depto, ciudades] of Object.entries(MUNICIPIOS)) {
            if (ciudades.find(c => Utils.normalizeStr(c) === ciudadM)) {
                deptoInput.value = depto;
                encontrado = true;
                const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
                data['chkDepartamento'] = depto;
                localStorage.setItem("cupissa_checkout_data", JSON.stringify(data));
                break;
            }
        }
        if (!encontrado) deptoInput.value = "";
    },

    calcularEnvio: () => {
        const ciudadInput = document.getElementById('chkCiudad');
        const barrioInput = document.getElementById('chkBarrioBuscador');
        const msjNacional = document.getElementById('msjEnvioNacional');
        const inputCC = document.getElementById('grupoCedulaNacional');
        const envioUI = document.getElementById('chkCostoEnvioUI');
        
        if (!ciudadInput) return;

        const ciudad = Utils.normalizeStr(ciudadInput.value).toUpperCase();
        const esLocal = CIUDADES_LOCALES.includes(ciudad);

        Checkout.costoEnvioActual = 0;

        if (ciudad.length > 2 && !esLocal) {
            if(msjNacional) {
                msjNacional.style.display = 'block';
                msjNacional.innerHTML = `
                    <strong>Envío Nacional (Por Cotizar)</strong><br>
                    El valor del envío se calculará según medidas y peso. Un asesor te enviará la cotización por WhatsApp.<br>
                    <span style="color: var(--color-danger); font-size: 0.8rem;">⚠️ IMPORTANTE: Solo INTERRAPIDISIMO permite PAGO EN CASA (Contraentrega) del saldo restante.</span>
                    <div style="margin-top:10px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Elige transportadora de preferencia:</label>
                        <select id="chkTransportadora" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc;">
                            <option value="INTERRAPIDISIMO">Interrapidisimo (Permite contraentrega)</option>
                            <option value="ENVIA">Envía</option>
                            <option value="SERVIENTREGA">Servientrega</option>
                            <option value="COORDINADORA">Coordinadora</option>
                            <option value="OTRA">Otra (Especificar)</option>
                        </select>
                        <input type="text" id="chkTransportadoraOtra" placeholder="Escribe la transportadora..." style="display:none; width:100%; padding:8px; margin-top:5px; border-radius:4px; border:1px solid #ccc;">
                    </div>
                `;
                
                document.getElementById('chkTransportadora').addEventListener('change', (e) => {
                    document.getElementById('chkTransportadoraOtra').style.display = e.target.value === 'OTRA' ? 'block' : 'none';
                });
            }
            if(inputCC) inputCC.style.display = 'block'; 
            
            if(envioUI) {
                envioUI.innerText = "Por Cotizar";
                envioUI.style.color = "#f57f17"; 
            }
        } else if (esLocal) {
            if(msjNacional) msjNacional.style.display = 'none';
            if(inputCC) inputCC.style.display = 'none';

            if (municipiosFijos[ciudad]) {
                Checkout.costoEnvioActual = municipiosFijos[ciudad];
            } else {
                const barrioNorm = Utils.normalizeStr(barrioInput?.value || '');
                const match = barriosBD.find(b => b.m === ciudad && Utils.normalizeStr(b.n) === barrioNorm);
                if (match) Checkout.costoEnvioActual = match.p;
            }
            
            if(envioUI) {
                envioUI.innerText = Checkout.costoEnvioActual > 0 ? Utils.formatCurrency(Checkout.costoEnvioActual) : "$0";
                envioUI.style.color = "var(--color-success)";
            }
        }
        Checkout.calcularTotalFinal();
    },

    selectBarrioDinamico: (nombre, precio) => {
        const input = document.getElementById('chkBarrioBuscador');
        if(input) input.value = nombre;
        document.getElementById('suggestions').style.display = 'none';
        
        const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
        data['chkBarrioBuscador'] = nombre;
        localStorage.setItem("cupissa_checkout_data", JSON.stringify(data));
        
        Checkout.calcularEnvio();
    },

    calcularTotalFinal: () => {
        let subtotalProds = Checkout.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
        let totalBase = Math.max(0, subtotalProds - Checkout.descuentoMonto - Checkout.cupicoinsUsar);
        
        let totalConEnvio = totalBase + Checkout.costoEnvioActual;
        
        const porcentajeAbono = Number(document.getElementById('chkAbono')?.value || 0.20);
        let montoBaseHoy = totalConEnvio * porcentajeAbono;
        
        const metodo = document.getElementById('chkMetodoPago')?.value;
        let comision = 0;

        if (metodo === 'WOMPI') {
            const valorConComision = (montoBaseHoy + 833) / 0.968465;
            comision = Math.ceil(valorConComision - montoBaseHoy);
        }

        const totalUI = document.getElementById('chkTotalPedido');
        const subtUI = document.getElementById('chkSubtotal');
        const montoBaseUI = document.getElementById('chkMontoBaseValor');
        const rowCom = document.getElementById('rowComision');
        const chkComisionValor = document.getElementById('chkComisionValor');
        const totalGeneralUI = document.getElementById('chkTotalGeneral');

        if(subtUI) subtUI.innerText = Utils.formatCurrency(subtotalProds);
        if(totalUI) totalUI.innerText = Utils.formatCurrency(totalConEnvio);
        if(montoBaseUI) montoBaseUI.innerText = Utils.formatCurrency(montoBaseHoy);
        
        if (comision > 0) {
            if(rowCom) rowCom.style.display = 'flex';
            if(chkComisionValor) chkComisionValor.innerText = Utils.formatCurrency(comision);
        } else {
            if(rowCom) rowCom.style.display = 'none';
        }
        
        if(totalGeneralUI) totalGeneralUI.innerText = Utils.formatCurrency(montoBaseHoy + comision);

        const transInfo = document.getElementById('transferenciaInfo');
        const btn = document.getElementById('btnConfirmarPedido');
        const txtMonto = document.getElementById('txtMontoTransferir');

        if (metodo === 'TRANSFERENCIA') {
            if (transInfo) transInfo.style.display = 'block';
            if (btn) btn.innerHTML = 'Enviar pago a verificación <i class="fas fa-file-invoice-dollar" style="margin-left: 5px;"></i>';
            if (txtMonto) txtMonto.innerText = Utils.formatCurrency(montoBaseHoy + comision);
        } else {
            if (transInfo) transInfo.style.display = 'none';
            if (btn) btn.innerHTML = 'Confirmar Pedido <i class="fas fa-check" style="margin-left: 5px;"></i>';
        }
    },

    injectDescuentosUI: () => {
        const anchor = document.getElementById('checkoutTotalSection');
        if (!anchor || document.getElementById('seccionDescuentos')) return;
        const html = `
            <div id="seccionDescuentos" style="margin:15px 0; padding:15px; background:#fff; border:1px dashed var(--color-pink); border-radius:8px;">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" id="inputCodigoDescuento" placeholder="CÓDIGO DE DESCUENTO" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button type="button" class="btn-primary" onclick="Checkout.aplicarCupon()" style="padding:8px 15px;">OK</button>
                </div>
                <div id="boxCupicoins" style="display:none; padding-top:10px; border-top:1px solid #eee;">
                    <label style="cursor:pointer; font-size:13px; display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" id="chkUsarCupicoins" onchange="Checkout.toggleCupicoins()" style="width:auto;"> 
                        Usar <b id="lblCupiDisp">0</b> CupiCoins (<span id="lblCupiDinero"></span>)
                    </label>
                </div>
            </div>
        `;
        anchor.insertAdjacentHTML('beforebegin', html);
    },

    procesarPago: async (e) => {
        e.preventDefault();
        
        if(!document.getElementById('chkAceptaTerminos')?.checked) return Utils.toast("Debes aceptar los Términos y Condiciones", "error");
        if(!document.getElementById('chkAceptaPrivacidad')?.checked) return Utils.toast("Debes aceptar la Política de Privacidad", "error");

        if (Checkout.isSubmitting) return;
        Checkout.isSubmitting = true;
        
        const btn = document.getElementById('btnConfirmarPedido');
        btn.disabled = true; btn.innerHTML = 'Procesando... <i class="fas fa-spinner fa-spin"></i>';

        try {
            const idPedido = "CUP-" + Date.now().toString().slice(-8);
            const correo = document.getElementById('chkCorreo').value.trim().toLowerCase();
            const nombreCliente = document.getElementById('chkNombre').value;
            const totalFinalPedido = parseInt(document.getElementById('chkTotalPedido').innerText.replace(/\D/g, ''));
            const anticipo = parseInt(document.getElementById('chkMontoBaseValor').innerText.replace(/\D/g, ''));
            const cciu = document.getElementById('chkCiudad').value.toUpperCase();
            const cedula = document.getElementById('chkCedula') ? document.getElementById('chkCedula').value.trim() : '';
            const metodoPagoSelec = document.getElementById('chkMetodoPago').value;
            
            const transInput = document.getElementById('chkTransportadora');
            let transportadoraFinal = "Mensajería Local";
            if (!CIUDADES_LOCALES.includes(cciu)) {
                if (transInput) {
                    transportadoraFinal = transInput.value === 'OTRA' ? document.getElementById('chkTransportadoraOtra').value : transInput.value;
                } else {
                    transportadoraFinal = "Por Cotizar";
                }
            }

            let estadoPagoIncial = "PENDIENTE";
            if (metodoPagoSelec === 'TRANSFERENCIA') {
                const fileInput = document.getElementById('chkComprobante');
                if (fileInput && fileInput.files.length > 0) {
                    estadoPagoIncial = "EN REVISIÓN";
                    const file = fileInput.files[0];
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result); 
                    });
                    await Utils.fetchFromBackend('subirSoportePago', { id_pedido: idPedido, archivoBase64: base64 });
                }
            }

            // === VERIFICACIÓN DE USUARIO NUEVO (ANTES DEL UPSERT) ===
            let esUsuarioNuevo = false;
            const { data: checkUser } = await window.db.from('usuarios').select('email').eq('email', correo).single();
            if (!checkUser) {
                esUsuarioNuevo = true;
            }

            // UPSERT A TABLA USUARIOS
            const userData = {
                email: correo,
                nombre: nombreCliente,
                telefono: document.getElementById('chkTelefono').value.replace(/\D/g, ''),
                ciudad: cciu,
                departamento: document.getElementById('chkDepartamento').value,
                barrio: document.getElementById('chkBarrioBuscador').value,
                direccion: document.getElementById('chkDireccion').value,
                cc: cedula, 
                tipo_usuario: 'CLIENTE', 
                activo: 'SI'
            };
            const { error: errUser } = await window.db.from('usuarios').upsert(userData, { onConflict: 'email' });
            if (errUser) throw new Error("Error en BD (Usuarios): " + errUser.message);

            // INSERT A TABLA PEDIDOS
            const pedData = {
                idpedido: idPedido, 
                tipo: 'WEB', 
                estado: 1, 
                usuario_email: correo, 
                total: totalFinalPedido, 
                fecha_creacion: new Date().toISOString(),
                estado_pago: estadoPagoIncial, 
                metodo_pago: metodoPagoSelec,
                valor_anticipo: anticipo,
                saldo_pendiente: totalFinalPedido - anticipo, 
                transportadora: transportadoraFinal,
                vendedor: 'TIENDA ONLINE'
            };
            const { error: errPed } = await window.db.from('pedidos').insert([pedData]);
            if (errPed) throw new Error("Error en BD (Pedidos): " + errPed.message);

            // INSERT A TABLA PEDIDOS_PRODUCTOS
            const itemsToInsert = Checkout.items.map(i => {
                let imgGuardar = '/assets/logo.png';
                if (i.imagenurl && String(i.imagenurl).trim() !== '') {
                    imgGuardar = String(i.imagenurl).split('|')[0].trim();
                }
                return {
                    idpedido: idPedido, 
                    ref_producto: i.ref, 
                    producto: `${i.nombre} (${JSON.stringify(i.variaciones)})`, 
                    cantidad: i.cantidad, 
                    precio: i.precio_unitario,
                    imagenurl: imgGuardar
                };
            });
            await window.db.from('pedidos_productos').insert(itemsToInsert);

            if (Checkout.cupicoinsUsar > 0) {
                await window.db.from('billeteras').update({ saldo: Checkout.cupicoinsDisponibles - Checkout.cupicoinsUsar }).eq('email', correo);
            }

            // === DISPARO DE NOTIFICACIONES (CORREGIDO) ===
            if (esUsuarioNuevo) {
                const claveTemporal = Math.random().toString(36).slice(-8);
                Utils.fetchFromBackend('enviarCorreoBienvenida', { 
                    email: correo, 
                    nombre: nombreCliente, 
                    clave_temporal: claveTemporal 
                });
            }

            const payloadNotificaciones = {
                pedido: pedData,
                usuario: userData,
                productos: itemsToInsert
            };

            Utils.fetchFromBackend('enviarCorreoConfirmacion', payloadNotificaciones);
            Utils.fetchFromBackend('notificarTelegramPedido', payloadNotificaciones);

            // === LÓGICA DE WOMPI ===
            if (metodoPagoSelec === 'WOMPI') {
                const totalWompi = parseInt(document.getElementById('chkTotalGeneral').innerText.replace(/\D/g, ''));
                const res = await Utils.fetchFromBackend('generarFirmaWompi', { id_pedido: idPedido, monto: totalWompi });
                
                if (res && res.success && res.firma) {
                    const redirectUrl = encodeURIComponent(`https://cupissa.com/rastreo/?ref=${idPedido}`);
                    const urlWompi = `https://checkout.wompi.co/p/?public-key=${res.llave_publica}&currency=COP&amount-in-cents=${totalWompi * 100}&reference=${idPedido}&signature:integrity=${res.firma}&redirect-url=${redirectUrl}`;
                    window.location.href = urlWompi;
                } else {
                    throw new Error("Wompi falló: " + (res.error || "No se generó la firma"));
                }
            } else {
                localStorage.removeItem('cupissa_cart');
                localStorage.removeItem('cupissa_checkout_data');
                window.location.href = `/rastreo/?ref=${idPedido}`;
            }
        } catch (err) {
            Utils.toast(err.message, "error");
            Checkout.isSubmitting = false; 
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Pedido <i class="fas fa-check" style="margin-left: 5px;"></i>';
        }
    },

    bindEvents: () => {
        document.getElementById('chkCiudad')?.addEventListener('input', () => {
            Checkout.autocompletarDepartamento();
            Checkout.calcularEnvio();
        });
        
        const emailInput = document.getElementById('chkCorreo');
        if(emailInput) {
            emailInput.addEventListener('blur', (e) => {
                Checkout.buscarDatosUsuario(e.target.value);
            });
        }
        
        document.getElementById('chkBarrioBuscador')?.addEventListener('input', function() {
            const val = Utils.normalizeStr(this.value);
            const ciudadSel = Utils.normalizeStr(document.getElementById('chkCiudad').value).toUpperCase();
            const sugg = document.getElementById('suggestions');
            if (!sugg) return;
            sugg.innerHTML = '';
            if (val.length < 1 || !["BARRANQUILLA", "SOLEDAD"].includes(ciudadSel)) { 
                sugg.style.display = 'none'; return; 
            }
            const filtered = barriosBD.filter(b => b.m === ciudadSel && Utils.normalizeStr(b.n).includes(val));
            if (filtered.length > 0) {
                filtered.forEach(b => {
                    const d = document.createElement('div');
                    d.style.padding = "10px"; d.style.cursor = "pointer"; d.style.borderBottom = "1px solid #eee";
                    d.textContent = b.n; d.onclick = () => Checkout.selectBarrioDinamico(b.n, b.p);
                    sugg.appendChild(d);
                });
                sugg.style.display = 'block';
            }
        });

        const campos = ['chkNombre','chkTelefono','chkCorreo','chkDireccion','chkCiudad','chkDepartamento','chkBarrioBuscador'];
        campos.forEach(id=>{
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener("input",()=>{
                    const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
                    data[id] = el.value;
                    localStorage.setItem("cupissa_checkout_data", JSON.stringify(data));
                });
            }
        });

        document.getElementById('chkAbono')?.addEventListener('change', Checkout.calcularTotalFinal);
        document.getElementById('chkMetodoPago')?.addEventListener('change', Checkout.calcularTotalFinal);
        document.getElementById('formCheckout')?.addEventListener('submit', Checkout.procesarPago);
        
        document.addEventListener('click', (e) => {
            if (e.target.id !== 'chkBarrioBuscador') {
                const sugg = document.getElementById('suggestions');
                if(sugg) sugg.style.display = 'none';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Checkout.init);