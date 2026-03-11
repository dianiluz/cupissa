/* js/pago.js */
/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT Y PASARELAS COMPLETADA */
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
    {n:"Alfonso López", m:"BARRANQUILLA", p:12000}, {n:"Las Estrellas", m:"BARRANQUILLA", p:12000}, {n:"Bernardo Hoyos", m:"BARRANQUILLA", p:12000}, {n:"Las Malvinas", m:"BARRANQUILLA", p:10000}, {n:"Buena Esperanza", m:"BARRANQUILLA", p:12000}, {n:"Las Terrazas", m:"BARRANQUILLA", p:12000}, {n:"California", m:"BARRANQUILLA", p:12000}, {n:"Lipaya", m:"BARRANQUILLA", p:10000}, {n:"Caribe Verde", m:"BARRANQUILLA", p:12000}, {n:"Loma Fresca", m:"BARRANQUILLA", p:12000}, {n:"Carlos Meisel", m:"BARRANQUILLA", p:12000}, {n:"Los Andes", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles II", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles III", m:"BARRANQUILLA", p:12000}, {n:"Ciudad Modesto", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de la Salud", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de Paz", m:"BARRANQUILLA", p:12000}, {n:"Colina Campestre", m:"BARRANQUILLA", p:12000}, {n:"Cordialidad", m:"BARRANQUILLA", p:10000}, {n:"Los Olivos", m:"BARRANQUILLA", p:12000}, {n:"Los Olivos II", m:"BARRANQUILLA", p:12000}, {n:"Corregimiento de Juan Mina", m:"BARRANQUILLA", p:17000}, {n:"Los Pinos", m:"BARRANQUILLA", p:12000}, {n:"Cuchilla de Villate", m:"BARRANQUILLA", p:12000}, {n:"Los Rosales", m:"BARRANQUILLA", p:12000}, {n:"El Bosque", m:"BARRANQUILLA", p:10000}, {n:"El Carmén", m:"BARRANQUILLA", p:12000}, {n:"Lucero", m:"BARRANQUILLA", p:12000}, {n:"Me Quejo", m:"BARRANQUILLA", p:12000}, {n:"Mercedes Sur", m:"BARRANQUILLA", p:12000}, {n:"El Pueblo", m:"BARRANQUILLA", p:12000}, {n:"Nueva Colombia", m:"BARRANQUILLA", p:12000}, {n:"El Romance", m:"BARRANQUILLA", p:12000}, {n:"Nueva Granada", m:"BARRANQUILLA", p:12000}, {n:"El Rubí", m:"BARRANQUILLA", p:12000}, {n:"Olaya", m:"BARRANQUILLA", p:12000}, {n:"El Silencio", m:"BARRANQUILLA", p:12000}, {n:"Pinar del Rio", m:"BARRANQUILLA", p:12000}, {n:"El Valle", m:"BARRANQUILLA", p:10000}, {n:"Por Fin", m:"BARRANQUILLA", p:12000}, {n:"Pumarejo", m:"BARRANQUILLA", p:12000}, {n:"Gerlein y Villate", m:"BARRANQUILLA", p:12000}, {n:"San Felipe", m:"BARRANQUILLA", p:12000}, {n:"Kalamary", m:"BARRANQUILLA", p:12000}, {n:"San Isidro", m:"BARRANQUILLA", p:12000}, {n:"La Ceiba", m:"BARRANQUILLA", p:12000}, {n:"La Esmeralda", m:"BARRANQUILLA", p:10000}, {n:"San Pedro Alejandrino", m:"BARRANQUILLA", p:12000}, {n:"La Florida", m:"BARRANQUILLA", p:12000}, {n:"San Pedro Sector I", m:"BARRANQUILLA", p:12000}, {n:"Santo Domigo", m:"BARRANQUILLA", p:12000}, {n:"Siete de Agosto", m:"BARRANQUILLA", p:12000}, {n:"La Libertad", m:"BARRANQUILLA", p:12000}, {n:"Villa del Rosario", m:"BARRANQUILLA", p:12000}, {n:"La Manga", m:"BARRANQUILLA", p:12000}, {n:"Villa Flor", m:"BARRANQUILLA", p:12000}, {n:"La Paz", m:"BARRANQUILLA", p:12000}, {n:"Villas de la Cordialidad", m:"BARRANQUILLA", p:12000}, {n:"Villas de San Pablo", m:"BARRANQUILLA", p:12000}, {n:"Las Colinas", m:"BARRANQUILLA", p:12000},
    {n:"Atlántico", m:"BARRANQUILLA", p:12000}, {n:"Las Palmeras", m:"BARRANQUILLA", p:12000}, {n:"Bellarena", m:"BARRANQUILLA", p:12000}, {n:"Los Laureles", m:"BARRANQUILLA", p:12000}, {n:"Boyaca", m:"BARRANQUILLA", p:12000}, {n:"Los Trupillos", m:"BARRANQUILLA", p:12000}, {n:"Chiquinquira", m:"BARRANQUILLA", p:13000}, {n:"Moderno", m:"BARRANQUILLA", p:12000}, {n:"El Campito", m:"BARRANQUILLA", p:12000}, {n:"Montes", m:"BARRANQUILLA", p:13000}, {n:"El Limón", m:"BARRANQUILLA", p:12000}, {n:"Pasadena", m:"BARRANQUILLA", p:12000}, {n:"El Milagro", m:"BARRANQUILLA", p:12000}, {n:"Primero de Mayo", m:"BARRANQUILLA", p:12000}, {n:"El Ferry", m:"BARRANQUILLA", p:13000}, {n:"El Parque Sector Barranquilla", m:"BARRANQUILLA", p:12000}, {n:"Rebolo", m:"BARRANQUILLA", p:13000}, {n:"José Antonio Galán", m:"BARRANQUILLA", p:12000}, {n:"San Jose", m:"BARRANQUILLA", p:12000}, {n:"La Arboraya", m:"BARRANQUILLA", p:12000}, {n:"San Nicolás", m:"BARRANQUILLA", p:13000}, {n:"La Chinita", m:"BARRANQUILLA", p:13000}, {n:"San Roque", m:"BARRANQUILLA", p:13000}, {n:"La Luz", m:"BARRANQUILLA", p:13000}, {n:"Santa Helena", m:"BARRANQUILLA", p:12000}, {n:"La Magdalena", m:"BARRANQUILLA", p:12000}, {n:"Simón Bolívar", m:"BARRANQUILLA", p:12000}, {n:"La Unión", m:"BARRANQUILLA", p:12000}, {n:"La Victoria", m:"BARRANQUILLA", p:12000}, {n:"Tayrona", m:"BARRANQUILLA", p:12000}, {n:"Universal I", m:"BARRANQUILLA", p:12000}, {n:"Universal II", m:"BARRANQUILLA", p:12000}, {n:"Las Dunas", m:"BARRANQUILLA", p:12000}, {n:"Las Nieves", m:"BARRANQUILLA", p:12000}, {n:"Villa Blanca", m:"BARRANQUILLA", p:12000}, {n:"Villa del Carmén", m:"BARRANQUILLA", p:12000}, {n:"Las Palmas", m:"BARRANQUILLA", p:12000},
    {n:"Barrio Abajo", m:"BARRANQUILLA", p:15000}, {n:"La Concepción", m:"BARRANQUILLA", p:15000}, {n:"Alameda del Rio", m:"BARRANQUILLA", p:15000}, {n:"La Cumbre", m:"BARRANQUILLA", p:15000}, {n:"Altos del Prado", m:"BARRANQUILLA", p:15000}, {n:"La Loma", m:"BARRANQUILLA", p:15000}, {n:"America", m:"BARRANQUILLA", p:15000}, {n:"Las Delicias", m:"BARRANQUILLA", p:15000}, {n:"Barlovento", m:"BARRANQUILLA", p:15000}, {n:"Las Mercedes", m:"BARRANQUILLA", p:15000}, {n:"Bellavista", m:"BARRANQUILLA", p:15000}, {n:"Las Nubes (vereda)", m:"BARRANQUILLA", p:15000}, {n:"Bethania", m:"BARRANQUILLA", p:15000}, {n:"Los Alpes", m:"BARRANQUILLA", p:15000}, {n:"Bostón", m:"BARRANQUILLA", p:15000}, {n:"Los Jobos", m:"BARRANQUILLA", p:15000}, {n:"Campo Alegre", m:"BARRANQUILLA", p:15000}, {n:"Los Nogales", m:"BARRANQUILLA", p:15000}, {n:"Centro Bquilla", m:"BARRANQUILLA", p:15000}, {n:"Miramar", m:"BARRANQUILLA", p:15000}, {n:"Ciudad Jardín", m:"BARRANQUILLA", p:15000}, {n:"Modelo", m:"BARRANQUILLA", p:15000}, {n:"Colombia", m:"BARRANQUILLA", p:15000}, {n:"Montecristo", m:"BARRANQUILLA", p:15000}, {n:"El Castillo", m:"BARRANQUILLA", p:15000}, {n:"Nuevo Horizonte", m:"BARRANQUILLA", p:15000}, {n:"El Golf", m:"BARRANQUILLA", p:15000}, {n:"Paraiso", m:"BARRANQUILLA", p:15000}, {n:"El Porvenir", m:"BARRANQUILLA", p:15000}, {n:"San Francisco", m:"BARRANQUILLA", p:15000}, {n:"El Prado", m:"BARRANQUILLA", p:15000}, {n:"Santa Ana", m:"BARRANQUILLA", p:15000}, {n:"El Recreo", m:"BARRANQUILLA", p:15000}, {n:"Villa Country", m:"BARRANQUILLA", p:15000}, {n:"El Rosario", m:"BARRANQUILLA", p:15000}, {n:"Villanueva", m:"BARRANQUILLA", p:15000}, {n:"El Tabor", m:"BARRANQUILLA", p:15000}, {n:"Zona Franca", m:"BARRANQUILLA", p:15000}, {n:"Zona Industrial", m:"BARRANQUILLA", p:15000}, {n:"La Campiña", m:"BARRANQUILLA", p:15000},
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

    init: () => {
        Checkout.loadCart();
        Checkout.bindEvents();
        Checkout.restoreCheckoutData();
        Checkout.renderResumen();
        Checkout.updateStepper();
    },

    restoreCheckoutData: () => {
        const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
        Object.keys(data).forEach(id=>{
            const el = document.getElementById(id);
            if(el){
                el.value = data[id];
            }
        });
    },

    loadCart: () => {
        const saved = localStorage.getItem('cupissa_cart');
        if (saved) Checkout.items = JSON.parse(saved);
        if (Checkout.items.length === 0) {
            if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Tu carrito está vacío", "error");
            setTimeout(() => window.location.href = '/catalogo/', 2000);
        }
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
        document.getElementById(`step-${Checkout.currentStep}`).style.display = 'block';

        document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
        for(let i = 1; i <= Checkout.currentStep; i++) {
            document.getElementById(`ind-${i}`).classList.add('active');
        }
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
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(cor)){
                Utils.toast("Correo electrónico inválido", "error");
                return false;
            }
            const telRegex = /^[3][0-9]{9}$/;
            if(!telRegex.test(tel)){
                Utils.toast("Número de celular inválido", "error");
                return false;
            }
            return true;
        }
        if (step === 2) {
            const ciu = document.getElementById('chkCiudad').value.trim();
            const dir = document.getElementById('chkDireccion').value.trim();
            if (!ciu || !dir) {
                if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Completa la ciudad y la dirección", "error");
                return false;
            }
            return true;
        }
        return true;
    },

    renderResumen: () => {
        const container = document.getElementById('chkItemsContainer');
        const subtUI = document.getElementById('chkSubtotal');
        const envioUI = document.getElementById('chkCostoEnvioUI');
        const totalUI = document.getElementById('chkTotalPedido');
        
        if (!container) return;
        container.innerHTML = '';
        
        let subtotal = 0;
        Checkout.items.forEach(item => {
            subtotal += item.precio_unitario * item.cantidad;
            container.innerHTML += `
                <div class="summary-item">
                    <img src="${item.imagenurl}" alt="${item.nombre}" onerror="this.src='/assets/logo.png'">
                    <div class="summary-item-info">
                        <div>${item.nombre} (x${item.cantidad})</div>
                        <div class="summary-item-price">${Utils.formatCurrency(item.precio_unitario * item.cantidad)}</div>
                    </div>
                </div>
            `;
        });

        if(subtUI) subtUI.innerText = Utils.formatCurrency(subtotal);
        
        // Actualizamos visualmente el campo Envío en el resumen
        if(envioUI) {
            if (isNaN(Checkout.costoEnvioActual) || Checkout.costoEnvioActual === 0) {
                const ciudadInput = document.getElementById('chkCiudad');
                const ciudad = ciudadInput ? Utils.normalizeStr(ciudadInput.value).toUpperCase() : '';
                envioUI.innerText = (ciudad !== '' && !CIUDADES_LOCALES.includes(ciudad)) ? "Por Cotizar" : "$0";
                envioUI.style.color = "var(--color-success)";
            } else {
                envioUI.innerText = Utils.formatCurrency(Checkout.costoEnvioActual);
                envioUI.style.color = "var(--color-success)";
            }
        }

        if(totalUI) totalUI.innerText = Utils.formatCurrency(subtotal + Checkout.costoEnvioActual);
        
        Checkout.calcularTotalFinal();
    },

    autocompletarDepartamento: () => {
    const ciudadInput = document.getElementById('chkCiudad');
    const deptoInput = document.getElementById('chkDepartamento');
    if (!ciudadInput || !deptoInput) return;

    const ciudadM = Utils.normalizeStr(ciudadInput.value);
    let encontrado = false;

    // CORRECCIÓN: Cambiado MUNICIPIES por MUNICIPIOS
    for (const [depto, ciudades] of Object.entries(MUNICIPIOS)) {
        const match = ciudades.find(c => Utils.normalizeStr(c) === ciudadM);
        if (match) {
            deptoInput.value = depto;
            encontrado = true;
            
            // Guardar el departamento automáticamente en el localStorage
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
        
        if (!ciudadInput) return;

        const ciudad = Utils.normalizeStr(ciudadInput.value).toUpperCase();
        const esLocal = CIUDADES_LOCALES.includes(ciudad);

        Checkout.costoEnvioActual = 0;

        if (ciudad.length > 2 && !esLocal) {
            if(msjNacional) {
                msjNacional.style.display = 'block';
                msjNacional.innerText = "Valor del envío varía por medidas y peso. Un asesor te enviará la cotización. Debe cancelarse antes de producción.";
            }
            if(inputCC) inputCC.style.display = 'block';
        } else if (esLocal) {
            if(msjNacional) msjNacional.style.display = 'none';
            if(inputCC) inputCC.style.display = 'none';

            if (municipiosFijos[ciudad]) {
                Checkout.costoEnvioActual = municipiosFijos[ciudad];
            } else if (barrioInput && barrioInput.value !== "") {
                const barrioNorm = Utils.normalizeStr(barrioInput.value);
                const matchBarrio = barriosBD.find(b => b.m === ciudad && Utils.normalizeStr(b.n) === barrioNorm);
                if (matchBarrio) Checkout.costoEnvioActual = matchBarrio.p;
            }
        }

        Checkout.renderResumen();
    },

    selectBarrioDinamico: (nombre, precio) => {
        const input = document.getElementById('chkBarrioBuscador');
        const sugg = document.getElementById('suggestions');
        
        if(input) input.value = nombre;
        Checkout.costoEnvioActual = precio;
        if(sugg) sugg.style.display = 'none';
        
        const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
        data['chkBarrioBuscador'] = nombre;
        localStorage.setItem("cupissa_checkout_data", JSON.stringify(data));

        Checkout.renderResumen();
    },

    calcularTotalFinal: () => {
        let subtotalProds = Checkout.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
        let totalConEnvio = subtotalProds + Checkout.costoEnvioActual; 
        
        const abonoSelect = document.getElementById('chkAbono');
        const metodoSelect = document.getElementById('chkMetodoPago');
        
        const porcentajeAbono = abonoSelect ? Number(abonoSelect.value) : 0.20;
        let montoAPagarBase = totalConEnvio * porcentajeAbono;
        
        const montoBaseUI = document.getElementById('chkMontoBaseValor');
        if(montoBaseUI) montoBaseUI.innerText = Utils.formatCurrency(montoAPagarBase);

        const metodo = metodoSelect ? metodoSelect.value : '';
        let comision = 0;

        const rowComision = document.getElementById('rowComision');
        const chkComisionValor = document.getElementById('chkComisionValor');
        const totalGeneralUI = document.getElementById('chkTotalGeneral');

        if (metodo === 'WOMPI') {
            const montoConComision = (montoAPagarBase + 833) / 0.968465;
            comision = Math.ceil(montoConComision - montoAPagarBase);
        }

        if (comision > 0 && rowComision) {
            rowComision.style.display = 'flex';
            chkComisionValor.innerText = Utils.formatCurrency(comision);
        } else if (rowComision) {
            rowComision.style.display = 'none';
        }

        const totalFinalHoy = montoAPagarBase + comision;
        if(totalGeneralUI) totalGeneralUI.innerText = Utils.formatCurrency(totalFinalHoy);

        const transInfo = document.getElementById('transferenciaInfo');
        const btn = document.getElementById('btnConfirmarPedido');
        const txtMonto = document.getElementById('txtMontoTransferir');

        if (metodo === 'TRANSFERENCIA') {
            if (transInfo) transInfo.style.display = 'block';
            if (btn) btn.innerHTML = 'Enviar pago a verificación <i class="fas fa-file-invoice-dollar" style="margin-left: 5px;"></i>';
            if (txtMonto) txtMonto.innerText = Utils.formatCurrency(totalFinalHoy);
        } else {
            if (transInfo) transInfo.style.display = 'none';
            if (btn) btn.innerHTML = 'Confirmar Pedido <i class="fas fa-check" style="margin-left: 5px;"></i>';
        }
    },

    procesarPago: async (e) => {
        e.preventDefault();
        const lastOrderTime = localStorage.getItem("cupissa_last_order");
        if(lastOrderTime){
            if(Date.now() - Number(lastOrderTime) < 30000){
                Utils.toast("Espera unos segundos antes de intentar otro pedido", "error");
                return;
            }
        }
        
        if (!Checkout.validateStep(1) || !Checkout.validateStep(2)) return;
        if(!document.getElementById('chkAceptaTerminos')?.checked){
            Utils.toast("Debes aceptar los Términos y Condiciones", "error");
            return;
        }
        if(!document.getElementById('chkAceptaPrivacidad')?.checked){
            Utils.toast("Debes aceptar la Política de Privacidad", "error");
            return;
        }
        
        if (Checkout.isSubmitting) return; 
        Checkout.isSubmitting = true;

        const btn = document.getElementById('btnConfirmarPedido');
        btn.disabled = true;
        btn.innerHTML = 'Procesando... <i class="fas fa-spinner fa-spin"></i>';

        let totalPedidoBase = Checkout.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0) + Checkout.costoEnvioActual;
        const porcentajeAbono = Number(document.getElementById('chkAbono').value);
        let anticipoHoy = totalPedidoBase * porcentajeAbono;
        const metodoPagoSelec = document.getElementById('chkMetodoPago').value;

        const dataPedido = {
            nombre_cliente: document.getElementById('chkNombre').value,
            usuario_email: document.getElementById('chkCorreo').value,
            telefono: document.getElementById('chkTelefono').value,
            direccion: document.getElementById('chkDireccion').value,
            barrio: document.getElementById('chkBarrioBuscador') ? document.getElementById('chkBarrioBuscador').value : '',
            ciudad: document.getElementById('chkCiudad').value,
            departamento: document.getElementById('chkDepartamento').value,
            cedula: document.getElementById('chkCedula') ? document.getElementById('chkCedula').value : '',
            total: totalPedidoBase,
            monto_pagado_hoy: anticipoHoy,
            metodo_pago: metodoPagoSelec,
            productos: JSON.stringify(Checkout.items),
            fecha_consentimiento: new Date().toISOString()
        };

        if (metodoPagoSelec === 'TRANSFERENCIA') {
            const fileInput = document.getElementById('chkComprobante');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                try {
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result.split(',')[1]); 
                        reader.onerror = error => reject(error);
                    });
                    dataPedido.comprobante_b64 = base64;
                    dataPedido.comprobante_name = file.name;
                    dataPedido.comprobante_mime = file.type;
                } catch (err) {
                    if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Error con el comprobante", "warning");
                }
            }
        }

        try {
            const res = await Utils.fetchFromBackend('registrarPedido', dataPedido);
            if (res.success) {
                localStorage.removeItem("cupissa_checkout_data");
                localStorage.setItem("cupissa_last_order", Date.now());
                localStorage.removeItem('cupissa_cart');
                
                if (metodoPagoSelec === 'WOMPI' && res.wompi_signature) {
                    const redirectUrl = "https://cupissa.com/rastreo/?id=" + res.id_pedido;
                    window.location.href = `https://checkout.wompi.co/p/?public-key=${res.wompi_pub}&currency=COP&amount-in-cents=${res.wompi_amount}&reference=${res.id_pedido}&signature:integrity=${res.wompi_signature}&redirect-url=${encodeURIComponent(redirectUrl)}`;
                } else {
                    if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Pedido creado con éxito", "success");
                    setTimeout(() => window.location.href = `/rastreo/?id=${res.id_pedido}`, 2000);
                }
            } else {
                if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast(res.error || "Error al procesar el pedido", "error");
                Checkout.isSubmitting = false;
                btn.disabled = false;
                Checkout.calcularTotalFinal();
            }
        } catch (err) {
            if(typeof Utils !== 'undefined' && Utils.toast) Utils.toast("Error de conexión.", "error");
            Checkout.isSubmitting = false;
            btn.disabled = false;
        }
    },

    bindEvents: () => {
        const ciudadInput = document.getElementById('chkCiudad');
        if (ciudadInput) {
            ciudadInput.addEventListener('input', () => {
                Checkout.autocompletarDepartamento();
                Checkout.calcularEnvio();
            });
            const campos = ['chkNombre','chkTelefono','chkCorreo','chkDireccion','chkCiudad','chkDepartamento','chkBarrioBuscador'];
            campos.forEach(id=>{
                const el = document.getElementById(id);
                if(!el) return;
                el.addEventListener("input",()=>{
                    const data = JSON.parse(localStorage.getItem("cupissa_checkout_data") || "{}");
                    data[id] = el.value;
                    localStorage.setItem("cupissa_checkout_data", JSON.stringify(data));
                });
            });
        }

        const barrioInput = document.getElementById('chkBarrioBuscador');
        if (barrioInput) {
            barrioInput.addEventListener('input', function() {
                const val = Utils.normalizeStr(this.value);
                const ciudadSel = document.getElementById('chkCiudad') ? Utils.normalizeStr(document.getElementById('chkCiudad').value).toUpperCase() : '';
                const sugg = document.getElementById('suggestions');
                if (!sugg) return;
                sugg.innerHTML = '';
                if (val.length < 1 || !["BARRANQUILLA", "SOLEDAD"].includes(ciudadSel)) { 
                    sugg.style.display = 'none'; 
                    return; 
                }
                const filtered = barriosBD.filter(b => b.m === ciudadSel && Utils.normalizeStr(b.n).includes(val));
                if (filtered.length > 0) {
                    filtered.forEach(b => {
                        const d = document.createElement('div'); 
                        d.className = 'sug-item'; 
                        d.textContent = b.n;
                        d.style.padding = "10px";
                        d.style.cursor = "pointer";
                        d.style.borderBottom = "1px solid #eee";
                        d.onclick = () => Checkout.selectBarrioDinamico(b.n, b.p);
                        sugg.appendChild(d);
                    });
                    sugg.style.display = 'block';
                }
            });
            barrioInput.addEventListener('change', Checkout.calcularEnvio);
        }

        const abonoSelect = document.getElementById('chkAbono');
        if (abonoSelect) abonoSelect.addEventListener('change', Checkout.calcularTotalFinal);

        const metodoSelect = document.getElementById('chkMetodoPago');
        if (metodoSelect) metodoSelect.addEventListener('change', Checkout.calcularTotalFinal);

        const form = document.getElementById('formCheckout');
        if (form) form.addEventListener('submit', Checkout.procesarPago);
        
        document.addEventListener('click', (e) => {
            const sugg = document.getElementById('suggestions');
            if (sugg && e.target.id !== 'chkBarrioBuscador') {
                sugg.style.display = 'none';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Checkout.init);