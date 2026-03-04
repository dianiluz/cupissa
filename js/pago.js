/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT Y PASARELAS */
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
    {n:"Alfonso López", m:"BARRANQUILLA", p:12000}, {n:"Las Estrellas", m:"BARRANQUILLA", p:12000}, {n:"Bernardo Hoyos", m:"BARRANQUILLA", p:12000}, {n:"Las Malvinas", m:"BARRANQUILLA", p:10000}, {n:"Buena Esperanza", m:"BARRANQUILLA", p:12000}, {n:"Las Terrazas", m:"BARRANQUILLA", p:12000}, {n:"California", m:"BARRANQUILLA", p:12000}, {n:"Lipaya", m:"BARRANQUILLA", p:10000}, {n:"Caribe Verde", m:"BARRANQUILLA", p:12000}, {n:"Loma Fresca", m:"BARRANQUILLA", p:12000}, {n:"Carlos Meisel", m:"BARRANQUILLA", p:12000}, {n:"Los Andes", m:"BARRANQUILLA", p:12000}, {n:"Ciudad Modesto", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de la Salud", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles II", m:"BARRANQUILLA", p:12000}, {n:"Ciudadela de Paz", m:"BARRANQUILLA", p:12000}, {n:"Los Angeles III", m:"BARRANQUILLA", p:12000}, {n:"Colina Campestre", m:"BARRANQUILLA", p:12000}, {n:"Los Olivos", m:"BARRANQUILLA", p:12000}, {n:"Cordialidad", m:"BARRANQUILLA", p:10000}, {n:"Los Olivos II", m:"BARRANQUILLA", p:12000}, {n:"Corregimiento de Juan Mina", m:"BARRANQUILLA", p:17000}, {n:"Los Pinos", m:"BARRANQUILLA", p:12000}, {n:"Cuchilla de Villate", m:"BARRANQUILLA", p:12000}, {n:"Los Rosales", m:"BARRANQUILLA", p:12000}, {n:"El Bosque", m:"BARRANQUILLA", p:10000}, {n:"Lucero", m:"BARRANQUILLA", p:12000}, {n:"El Carmén", m:"BARRANQUILLA", p:12000}, {n:"Me Quejo", m:"BARRANQUILLA", p:12000}, {n:"El Eden", m:"BARRANQUILLA", p:12000}, {n:"Mercedes Sur", m:"BARRANQUILLA", p:12000}, {n:"El Pueblo", m:"BARRANQUILLA", p:12000}, {n:"Nueva Colombia", m:"BARRANQUILLA", p:12000}, {n:"El Romance", m:"BARRANQUILLA", p:12000}, {n:"Nueva Granada", m:"BARRANQUILLA", p:12000}, {n:"El Rubí", m:"BARRANQUILLA", p:12000}, {n:"Olaya", m:"BARRANQUILLA", p:12000}, {n:"El Silencio", m:"BARRANQUILLA", p:12000}, {n:"Pinar del Rio", m:"BARRANQUILLA", p:12000}, {n:"El Valle", m:"BARRANQUILLA", p:10000}, {n:"Por Fin", m:"BARRANQUILLA", p:12000}, {n:"Evaristo Sourdis", m:"BARRANQUILLA", p:12000}, {n:"Pumarejo", m:"BARRANQUILLA", p:12000}, {n:"Gerlein y Villate", m:"BARRANQUILLA", p:12000}, {n:"San Felipe", m:"BARRANQUILLA", p:12000}, {n:"Kalamary", m:"BARRANQUILLA", p:12000}, {n:"San Isidro", m:"BARRANQUILLA", p:12000}, {n:"La Ceiba", m:"BARRANQUILLA", p:12000}, {n:"San Pedro Alejandrino", m:"BARRANQUILLA", p:12000}, {n:"La Esmeralda", m:"BARRANQUILLA", p:10000}, {n:"San Pedro Sector I", m:"BARRANQUILLA", p:12000}, {n:"La Florida", m:"BARRANQUILLA", p:12000}, {n:"Santo Domigo", m:"BARRANQUILLA", p:12000}, {n:"Siete de Agosto", m:"BARRANQUILLA", p:12000}, {n:"La Libertad", m:"BARRANQUILLA", p:12000}, {n:"Villa del Rosario", m:"BARRANQUILLA", p:12000}, {n:"La Manga", m:"BARRANQUILLA", p:12000}, {n:"Villa Flor", m:"BARRANQUILLA", p:12000}, {n:"La Paz", m:"BARRANQUILLA", p:12000}, {n:"Villas de la Cordialidad", m:"BARRANQUILLA", p:12000}, {n:"Villas de San Pablo", m:"BARRANQUILLA", p:12000}, {n:"Las Colinas", m:"BARRANQUILLA", p:12000},
    {n:"Atlántico", m:"BARRANQUILLA", p:12000}, {n:"Las Palmeras", m:"BARRANQUILLA", p:12000}, {n:"Bellarena", m:"BARRANQUILLA", p:12000}, {n:"Los Laureles", m:"BARRANQUILLA", p:12000}, {n:"Boyaca", m:"BARRANQUILLA", p:12000}, {n:"Los Trupillos", m:"BARRANQUILLA", p:12000}, {n:"Chiquinquira", m:"BARRANQUILLA", p:13000}, {n:"Moderno", m:"BARRANQUILLA", p:12000}, {n:"El Campito", m:"BARRANQUILLA", p:12000}, {n:"Montes", m:"BARRANQUILLA", p:13000}, {n:"El Limón", m:"BARRANQUILLA", p:12000}, {n:"Pasadena", m:"BARRANQUILLA", p:12000}, {n:"El Milagro", m:"BARRANQUILLA", p:12000}, {n:"Primero de Mayo", m:"BARRANQUILLA", p:12000}, {n:"El Ferry", m:"BARRANQUILLA", p:13000}, {n:"El Parque Sector Barranquilla", m:"BARRANQUILLA", p:12000}, {n:"Rebolo", m:"BARRANQUILLA", p:13000}, {n:"José Antonio Galán", m:"BARRANQUILLA", p:12000}, {n:"San Jose", m:"BARRANQUILLA", p:12000}, {n:"La Arboraya", m:"BARRANQUILLA", p:12000}, {n:"San Nicolás", m:"BARRANQUILLA", p:13000}, {n:"La Chinita", m:"BARRANQUILLA", p:13000}, {n:"San Roque", m:"BARRANQUILLA", p:13000}, {n:"La Luz", m:"BARRANQUILLA", p:13000}, {n:"Santa Helena", m:"BARRANQUILLA", p:12000}, {n:"La Magdalena", m:"BARRANQUILLA", p:12000}, {n:"Simón Bolívar", m:"BARRANQUILLA", p:12000}, {n:"La Unión", m:"BARRANQUILLA", p:12000}, {n:"Tayrona", m:"BARRANQUILLA", p:12000}, {n:"La Victoria", m:"BARRANQUILLA", p:12000}, {n:"Universal I", m:"BARRANQUILLA", p:12000}, {n:"Universal II", m:"BARRANQUILLA", p:12000}, {n:"Las Dunas", m:"BARRANQUILLA", p:12000}, {n:"Las Nieves", m:"BARRANQUILLA", p:12000}, {n:"Villa Blanca", m:"BARRANQUILLA", p:12000}, {n:"Las Palmas", m:"BARRANQUILLA", p:12000}, {n:"Villa del Carmén", m:"BARRANQUILLA", p:12000},
    {n:"Barrio Abajo", m:"BARRANQUILLA", p:15000}, {n:"La Concepción", m:"BARRANQUILLA", p:15000}, {n:"Alameda del Rio", m:"BARRANQUILLA", p:15000}, {n:"La Cumbre", m:"BARRANQUILLA", p:15000}, {n:"Altos del Prado", m:"BARRANQUILLA", p:15000}, {n:"La Loma", m:"BARRANQUILLA", p:15000}, {n:"America", m:"BARRANQUILLA", p:15000}, {n:"Las Delicias", m:"BARRANQUILLA", p:15000}, {n:"Barlovento", m:"BARRANQUILLA", p:15000}, {n:"Las Mercedes", m:"BARRANQUILLA", p:15000}, {n:"Bellavista", m:"BARRANQUILLA", p:15000}, {n:"Las Nubes (vereda)", m:"BARRANQUILLA", p:15000}, {n:"Bethania", m:"BARRANQUILLA", p:15000}, {n:"Los Alpes", m:"BARRANQUILLA", p:15000}, {n:"Bostón", m:"BARRANQUILLA", p:15000}, {n:"Los Jobos", m:"BARRANQUILLA", p:15000}, {n:"Campo Alegre", m:"BARRANQUILLA", p:15000}, {n:"Los Nogales", m:"BARRANQUILLA", p:15000}, {n:"Centro Bquilla", m:"BARRANQUILLA", p:15000}, {n:"Miramar", m:"BARRANQUILLA", p:15000}, {n:"Ciudad Jardín", m:"BARRANQUILLA", p:15000}, {n:"Modelo", m:"BARRANQUILLA", p:15000}, {n:"Colombia", m:"BARRANQUILLA", p:15000}, {n:"Montecristo", m:"BARRANQUILLA", p:15000}, {n:"El Castillo", m:"BARRANQUILLA", p:15000}, {n:"Nuevo Horizonte", m:"BARRANQUILLA", p:15000}, {n:"El Golf", m:"BARRANQUILLA", p:15000}, {n:"Paraiso", m:"BARRANQUILLA", p:15000}, {n:"El Porvenir", m:"BARRANQUILLA", p:15000}, {n:"San Francisco", m:"BARRANQUILLA", p:15000}, {n:"El Prado", m:"BARRANQUILLA", p:15000}, {n:"Santa Ana", m:"BARRANQUILLA", p:15000}, {n:"El Recreo", m:"BARRANQUILLA", p:15000}, {n:"Villa Country", m:"BARRANQUILLA", p:15000}, {n:"El Rosario", m:"BARRANQUILLA", p:15000}, {n:"Villanueva", m:"BARRANQUILLA", p:15000}, {n:"El Tabor", m:"BARRANQUILLA", p:15000}, {n:"Zona Franca", m:"BARRANQUILLA", p:15000}, {n:"Zona Industrial", m:"BARRANQUILLA", p:15000}, {n:"La Campiña", m:"BARRANQUILLA", p:15000},
    {n:"Altamira", m:"BARRANQUILLA", p:15000}, {n:"Riomar", m:"BARRANQUILLA", p:15000}, {n:"Altos de Riomar", m:"BARRANQUILLA", p:15000}, {n:"San Salvador", m:"BARRANQUILLA", p:15000}, {n:"Altos del Limón", m:"BARRANQUILLA", p:15000}, {n:"San Vicente", m:"BARRANQUILLA", p:15000}, {n:"Andalucia", m:"BARRANQUILLA", p:15000}, {n:"Santa Mónica", m:"BARRANQUILLA", p:15000}, {n:"Corregimiento Eduardo Santos", m:"BARRANQUILLA", p:17000}, {n:"La Playa", m:"BARRANQUILLA", p:18000}, {n:"Siape", m:"BARRANQUILLA", p:15000}, {n:"El Limoncito", m:"BARRANQUILLA", p:15000}, {n:"Solaire Norte", m:"BARRANQUILLA", p:16000}, {n:"El Poblado", m:"BARRANQUILLA", p:15000}, {n:"Villa Campestre", m:"BARRANQUILLA", p:16000}, {n:"La Floresta", m:"BARRANQUILLA", p:15000}, {n:"Villa Carolina", m:"BARRANQUILLA", p:15000}, {n:"Las Flores", m:"BARRANQUILLA", p:16000}, {n:"Villa del Este", m:"BARRANQUILLA", p:15000}, {n:"Las Tres Ave Maria", m:"BARRANQUILLA", p:15000}, {n:"Villa Santos", m:"BARRANQUILLA", p:15000},
    {n:"Villa Estadio", m:"SOLEDAD", p:8000}, {n:"Los Robles", m:"SOLEDAD", p:8000}, {n:"Las Moras", m:"SOLEDAD", p:9000}, {n:"13 de Mayo", m:"SOLEDAD", p:10000}, {n:"16 de Julio", m:"SOLEDAD", p:10000}, {n:"20 de Julio", m:"SOLEDAD", p:10000}, {n:"7 de Agosto", m:"SOLEDAD", p:9000}, {n:"12 de Octubre", m:"SOLEDAD", p:10000}, {n:"Altos de Sevilla", m:"SOLEDAD", p:10000}, {n:"Bella Murillo", m:"SOLEDAD", p:9000}, {n:"Bonanza", m:"SOLEDAD", p:9000}, {n:"Cabrera", m:"SOLEDAD", p:10000}, {n:"Centenario", m:"SOLEDAD", p:10000}, {n:"Ciudad Bolívar", m:"SOLEDAD", p:10000}, {n:"Ciudad Camelot", m:"SOLEDAD", p:10000}, {n:"Ciudad Paraíso", m:"SOLEDAD", p:10000}, {n:"El Parque", m:"SOLEDAD", p:8000}, {n:"El Pasito", m:"SOLEDAD", p:10000}, {n:"El Río", m:"SOLEDAD", p:10000}, {n:"El Triunfo", m:"SOLEDAD", p:10000}, {n:"El Tucan", m:"SOLEDAD", p:9000}, {n:"La Alianza", m:"SOLEDAD", p:10000}, {n:"La Arboleda", m:"SOLEDAD", p:9000}, {n:"La Central", m:"SOLEDAD", p:10000}, {n:"La Esperanza", m:"SOLEDAD", p:10000}, {n:"La Farruca", m:"SOLEDAD", p:10000}, {n:"Las Gaviotas", m:"SOLEDAD", p:9000}, {n:"Las Margaritas", m:"SOLEDAD", p:9000}, {n:"Las Nubes", m:"SOLEDAD", p:10000}, {n:"Las Trinitarias", m:"SOLEDAD", p:9000}, {n:"Los Almendros", m:"SOLEDAD", p:10000}, {n:"Los Arrayanes", m:"SOLEDAD", p:10000}, {n:"Los Balcanes", m:"SOLEDAD", p:10000}, {n:"Los Cedros", m:"SOLEDAD", p:10000}, {n:"Los Cusules", m:"SOLEDAD", p:10000}, {n:"Los Laureles", m:"SOLEDAD", p:10000}, {n:"Los Loteros", m:"SOLEDAD", p:10000}, {n:"Nuevo Triunfo", m:"SOLEDAD", p:10000}, {n:"Oriental", m:"SOLEDAD", p:10000}, {n:"Portal De Las Moras", m:"SOLEDAD", p:9000}, {n:"Porvenir", m:"SOLEDAD", p:10000}, {n:"Primero De Mayo", m:"SOLEDAD", p:10000}, {n:"Puerta de Oro", m:"SOLEDAD", p:10000}, {n:"Pumarejo Soledad", m:"SOLEDAD", p:10000}, {n:"Renacer", m:"SOLEDAD", p:10000}, {n:"Sal Si Puedes", m:"SOLEDAD", p:10000}, {n:"Salcedo", m:"SOLEDAD", p:10000}, {n:"San Antonio", m:"SOLEDAD", p:10000}, {n:"Villa Angelita", m:"SOLEDAD", p:9000}, {n:"Villa del Carmen", m:"SOLEDAD", p:10000}, {n:"Villa del Rey", m:"SOLEDAD", p:10000}, {n:"Villa Estefanny", m:"SOLEDAD", p:10000}, {n:"Villa Éxito", m:"SOLEDAD", p:10000}, {n:"Villa Gladys", m:"SOLEDAD", p:10000}, {n:"Villa Karla", m:"SOLEDAD", p:10000}, {n:"Villa Katanga", m:"SOLEDAD", p:9000}, {n:"Villa María", m:"SOLEDAD", p:10000}, {n:"Villa Merly", m:"SOLEDAD", p:10000}, {n:"Villa Monaco", m:"SOLEDAD", p:10000}, {n:"Villa Severa", m:"SOLEDAD", p:10000}, {n:"Villa Valentina", m:"SOLEDAD", p:10000}, {n:"Villa Viola", m:"SOLEDAD", p:10000},
    {n:"Centro Soledad", m:"SOLEDAD", p:12000}, {n:"El Hipódromo", m:"SOLEDAD", p:11000}, {n:"Ferrocarril", m:"SOLEDAD", p:12000}, {n:"Juan Domínguez Romero", m:"SOLEDAD", p:12000}, {n:"Prado Soledad", m:"SOLEDAD", p:11000}, {n:"Salamanca", m:"SOLEDAD", p:12000}
];

const municipiosFijos = { "MALAMBO": 15000, "GALAPA": 18000, "PUERTO COLOMBIA": 20000 };
const CIUDADES_LOCALES = ["BARRANQUILLA", "SOLEDAD", "MALAMBO", "GALAPA", "PUERTO COLOMBIA", "VILLA OLIMPICA"];

/* ===================================================== */
/* CUPISSA — LÓGICA DE CHECKOUT Y PASARELAS — CORREGIDO */
/* ===================================================== */

// ... (Se mantienen MUNICIPIOS, barriosBD y constantes iniciales igual) ...

const Checkout = {
    cartTotal: 0, cartItemsCount: 0, tipoEnvio: "", isLocal: false,
    costoDomicilio: 0, costoExpress: 0, metodoPago: "transferencia", tipoMonto: "anticipo",
    totalBaseCobro: 0, comisionFinal: 0, pagoDomicilioMomento: "ahora",

    init: () => {
        const saved = localStorage.getItem('cupissa_cart');
        const items = saved ? JSON.parse(saved) : [];
        if (items.length === 0) return window.location.href = "/catalogo/";

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
        Object.keys(MUNICIPIOS).sort().forEach(dep => select.innerHTML += `<option value="${dep}">${dep}</option>`);
    },

    loadCities: () => {
        const dep = document.getElementById('chkDepartamento').value;
        const select = document.getElementById('chkCiudad');
        select.innerHTML = '<option value="">Seleccione...</option>';
        if (dep && MUNICIPIOS[dep]) {
            MUNICIPIOS[dep].sort().forEach(ciudad => select.innerHTML += `<option value="${ciudad.toUpperCase()}">${ciudad}</option>`);
        }
        Checkout.handleMunicipioChange();
    },

    handleMunicipioChange: () => {
        const ciudad = document.getElementById('chkCiudad').value;
        Checkout.isLocal = CIUDADES_LOCALES.includes(ciudad);
        
        const bCont = document.getElementById('barrio-container');
        const bManual = document.getElementById('barrio-manual');
        const bBuscador = document.getElementById('chkBarrioBuscador');
        const bHidden = document.getElementById('chkBarrio');

        bBuscador.value = ''; bHidden.value = ''; Checkout.costoDomicilio = 0;

        if (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") {
            bCont.style.display = 'block'; bManual.style.display = 'none';
        } else if (municipiosFijos[ciudad]) {
            bCont.style.display = 'none'; bManual.style.display = 'block';
            Checkout.costoDomicilio = municipiosFijos[ciudad];
        } else {
            bCont.style.display = 'none'; bManual.style.display = 'block';
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
                    <div class="radio-content"><span class="radio-title">Domicilio Local</span><span class="radio-desc">Se agregará al total de tu pedido.</span></div>
                </label>
                <label class="radio-card" onclick="Checkout.selectEnvio('transportadora')">
                    <input type="radio" name="tipoEnvio" value="transportadora">
                    <div class="radio-content"><span class="radio-title">Transportadora (Local)</span><span class="radio-desc">Asesor cotiza flete por WhatsApp.</span></div>
                </label>`;
            Checkout.selectEnvio('domicilio');
        } else {
            container.innerHTML = `
                <label class="radio-card selected" onclick="Checkout.selectEnvio('transportadora')">
                    <input type="radio" name="tipoEnvio" value="transportadora" checked>
                    <div class="radio-content"><span class="radio-title">Envío Nacional por Transportadora</span><span class="radio-desc">Flete cotizado y cobrado por WhatsApp.</span></div>
                </label>`;
            Checkout.selectEnvio('transportadora');
        }
    },

    selectEnvio: (tipo) => {
        Checkout.tipoEnvio = tipo;
        document.querySelectorAll('input[name="tipoEnvio"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === tipo) r.closest('.radio-card').classList.add('selected');
        });
        
        document.getElementById('chkEnvioValor').innerText = tipo === 'transportadora' ? 'Cotizado por WhatsApp' : (Checkout.costoDomicilio > 0 ? Utils.formatCurrency(Checkout.costoDomicilio) : 'A confirmar');
        
        const optDom = document.getElementById('opcionesPagoDomicilio');
        if (tipo === 'domicilio') {
            optDom.style.display = 'block';
        } else {
            optDom.style.display = 'none';
        }
        
        Checkout.updateCCRequirement(); Checkout.updateMetodosPago(); Checkout.calculateTotals();
    },

    renderExpressOptions: () => {
        const container = document.getElementById('opcionesExpress');
        let precioExpress = (Checkout.cartTotal <= 999999 && Checkout.cartItemsCount <= 5) ? 10000 : 20000;
        const titulo = precioExpress === 10000 ? "Producción Express (24 a 72 horas)" : "Producción Express Máxima (Hasta 6 días)";
        
        container.innerHTML = `
            <label class="radio-card" onclick="Checkout.selectProduccion('express')">
                <input type="radio" name="tipoProduccion" value="express">
                <div class="radio-content"><span class="radio-title">${titulo}</span><span class="radio-desc">+ $${precioExpress.toLocaleString('es-CO')} adicionales al pedido.</span></div>
            </label>`;
        Checkout.costoExpress = precioExpress;
    },

    selectProduccion: (tipo) => {
        document.querySelectorAll('input[name="tipoProduccion"]').forEach(r => {
            r.closest('.radio-card').classList.remove('selected');
            if(r.value === tipo) r.closest('.radio-card').classList.add('selected');
        });
        document.getElementById('rowProduccion').style.display = tipo === 'express' ? 'flex' : 'none';
        if(tipo === 'express') document.getElementById('chkProduccionValor').innerText = Utils.formatCurrency(Checkout.costoExpress);
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
        const req = (!Checkout.isLocal || Checkout.tipoEnvio === 'transportadora');
        document.getElementById('chkCC').required = req;
        document.getElementById('lblCCOpcional').innerText = req ? "(Obligatorio)" : "(Opcional)";
    },

    updateMetodosPago: () => {
        const optCE = document.getElementById('optContraentrega');
        optCE.style.display = 'flex';
        document.getElementById('descContraentrega').innerText = (Checkout.isLocal && Checkout.tipoEnvio === 'domicilio') ? "Paga el saldo en efectivo/transferencia al recibir." : "Solo Interrapidisimo (Pago en Casa).";
    },

    renderSummary: (items) => {
        const container = document.getElementById('chkSummaryItems');
        Checkout.cartTotal = 0; Checkout.cartItemsCount = 0; container.innerHTML = '';
        items.forEach(item => {
            const sub = Utils.safeNumber(item.precio_unitario) * Utils.safeNumber(item.cantidad);
            Checkout.cartTotal += sub; Checkout.cartItemsCount += Utils.safeNumber(item.cantidad);
            const varsHtml = Object.keys(item.variaciones).map(k => `${k}: ${item.variaciones[k]}`).join(" | ");
            container.innerHTML += `
                <div class="summary-item">
                    <img src="${item.imagenurl}">
                    <div class="summary-item-info">
                        <div><strong>${item.cantidad}x</strong> ${item.nombre}</div>
                        <div style="color:gray; font-size:0.75rem;">${varsHtml}</div>
                    </div>
                    <div class="summary-item-price">${Utils.formatCurrency(sub)}</div>
                </div>`;
        });
        document.getElementById('chkSubtotal').innerText = Utils.formatCurrency(Checkout.cartTotal);
        Checkout.renderExpressOptions(); Checkout.calculateTotals();
    },

    calculateTotals: () => {
        const subtotal = Utils.safeNumber(Checkout.cartTotal);
        const envio = Checkout.tipoEnvio === 'domicilio' ? Utils.safeNumber(Checkout.costoDomicilio) : 0;
        const express = document.querySelector('input[name="tipoProduccion"]:checked')?.value === 'express' ? Utils.safeNumber(Checkout.costoExpress) : 0;
        
        if (Checkout.tipoEnvio === 'domicilio') {
            document.getElementById('chkEnvioValor').innerText = envio > 0 ? Utils.formatCurrency(envio) : 'A confirmar';
        } else {
            document.getElementById('chkEnvioValor').innerText = 'Cotizado por WhatsApp';
        }

        Checkout.pagoDomicilioMomento = document.querySelector('input[name="momentoPagoDomicilio"]:checked')?.value || "ahora";

        const totalPedido = subtotal + envio + express;
        document.getElementById('chkTotalPedido').innerText = Utils.formatCurrency(totalPedido);

        if (Checkout.tipoMonto === 'anticipo') {
            Checkout.totalBaseCobro = ((subtotal + express) * 0.20);
            if (Checkout.pagoDomicilioMomento === "ahora") Checkout.totalBaseCobro += envio;
        } else {
            Checkout.totalBaseCobro = totalPedido; 
        }

        document.getElementById('chkMontoBaseValor').innerText = Utils.formatCurrency(Checkout.totalBaseCobro);

        let comisionNeta = 0, ivaComision = 0;
        if (Checkout.metodoPago === 'wompi') {
            comisionNeta = (Checkout.totalBaseCobro * 0.0265) + 700;
            ivaComision = comisionNeta * 0.19;
        } else if (Checkout.metodoPago === 'addi') {
            comisionNeta = Checkout.totalBaseCobro * 0.09;
            ivaComision = comisionNeta * 0.19;
        }
        
        Checkout.comisionFinal = Math.ceil(comisionNeta + ivaComision);
        
        const rowComision = document.getElementById('rowComision');
        rowComision.style.display = Checkout.comisionFinal > 0 ? 'flex' : 'none';
        document.getElementById('chkComisionValor').innerText = Utils.formatCurrency(Checkout.comisionFinal);
        document.getElementById('chkTotalGeneral').innerText = Utils.formatCurrency(Math.ceil(Checkout.totalBaseCobro + Checkout.comisionFinal));
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
            if(!valid) return Utils.toast("Por favor completa los campos obligatorios en rojo.", "error");
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
        const express = document.querySelector('input[name="tipoProduccion"]:checked')?.value === 'express' ? "SI" : "NO";
        const msgDomicilio = Checkout.pagoDomicilioMomento === "ahora" ? "Pagado anticipado" : "Pago contraentrega";

        document.getElementById('resumenDatosFinales').innerHTML = `
            <p><strong>Cliente:</strong> ${document.getElementById('chkNombre').value}</p>
            <p><strong>Dirección:</strong> ${document.getElementById('chkDireccion').value}, ${barrio}</p>
            <p><strong>Ciudad:</strong> ${ciudad} (${document.getElementById('chkDepartamento').value})</p>
            <p><strong>Envío:</strong> ${Checkout.tipoEnvio.toUpperCase()} (${msgDomicilio})</p>
            <p><strong>Producción Express:</strong> ${express}</p>
            <p><strong>Método de Pago:</strong> ${Checkout.metodoPago.toUpperCase()} (${Checkout.tipoMonto.toUpperCase()})</p>
            <p style="margin-top:10px; color:var(--color-pink); font-size:1.2rem; font-weight:bold;">Total a procesar hoy: ${document.getElementById('chkTotalGeneral').innerText}</p>
        `;
    },

    submitPedido: async () => {
        const reqIds = ['chkNombre', 'chkEmail', 'chkTelefono', 'chkDireccion', 'chkCiudad'];
        for(let id of reqIds) {
            if(!document.getElementById(id).value.trim()) return Utils.toast("Regresa al paso 1: Hay campos obligatorios vacíos.", "error");
        }

        const btn = document.getElementById('btnConfirmarPedido');
        btn.disabled = true; btn.innerText = "Procesando Pedido...";

        const ciudad = document.getElementById('chkCiudad').value;
        const barrio = (ciudad === "BARRANQUILLA" || ciudad === "SOLEDAD") ? document.getElementById('chkBarrio').value : document.getElementById('chkBarrioManual').value;
        const items = JSON.parse(localStorage.getItem('cupissa_cart')) || [];

        const subtotal = Utils.safeNumber(Checkout.cartTotal);
        const envio = Checkout.tipoEnvio === 'domicilio' ? Utils.safeNumber(Checkout.costoDomicilio) : 0;
        const express = document.querySelector('input[name="tipoProduccion"]:checked')?.value === 'express' ? Utils.safeNumber(Checkout.costoExpress) : 0;
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
            monto_pagado_hoy: Math.ceil(Checkout.totalBaseCobro + Checkout.comisionFinal),
            productos: JSON.stringify(items)
        };

        const fd = new FormData();
        Object.keys(payload).forEach(k => fd.append(k, payload[k]));

        try {
            const res = await fetch(CONFIG.backendURL, { method: 'POST', body: fd });
            const text = await res.text();

            try {
                const data = JSON.parse(text);
                
                if(data.success) {
                    localStorage.removeItem('cupissa_cart');
                    
                    if (Checkout.metodoPago === 'wompi') {
                        Utils.toast("Redirigiendo a Wompi...", "success");
                        const montoCents = Math.round(payload.monto_pagado_hoy * 100);
                        const redirectUrlSegura = encodeURIComponent(`https://cupissa.com/respuesta/`);
                        
                        // CORRECCIÓN: Se añade el parámetro signature:integrity capturado del backend
                        setTimeout(() => {
                            window.location.href = `https://checkout.wompi.co/p/?public-key=pub_prod_q69BzlCLtdFiZQEmbQFTMX9uXwr6E4Xg&currency=COP&amount-in-cents=${montoCents}&reference=${data.id_pedido}&redirect-url=${redirectUrlSegura}&signature:integrity=${data.signature}`;
                        }, 1500);
                        
                    } else if (Checkout.metodoPago === 'addi') {
                        Utils.toast("Pedido creado. Serás redirigido para tu crédito Addi.", "success");
                        setTimeout(() => {
                            window.location.href = `https://wa.me/573147671380?text=Hola,%20acabo%20de%20crear%20el%20pedido%20${data.id_pedido}%20y%20quiero%20pagarlo%20con%20Addi.%20El%20valor%20es%20de%20$${payload.monto_pagado_hoy.toLocaleString('es-CO')}.`;
                        }, 2000);
                    } else {
                        Utils.toast(`¡Pedido Registrado! Redirigiendo...`, "success");
                        setTimeout(() => window.location.href = `/rastreo/?id=${data.id_pedido}`, 2000);
                    }
                } else {
                    Utils.toast(data.error || "Error guardando el pedido.", "error");
                    btn.disabled = false; btn.innerText = "Confirmar y Generar Pedido";
                }
            } catch(jsonError) {
                console.error("Respuesta del servidor no fue JSON:", text);
                Utils.toast("Error interno del servidor Google.", "error");
                btn.disabled = false; btn.innerText = "Confirmar y Generar Pedido";
            }
        } catch (error) {
            Utils.toast("Error de conexión. Revisa internet.", "error");
            btn.disabled = false; btn.innerText = "Confirmar y Generar Pedido";
        }
    },

    bindEvents: () => {
        document.getElementById('chkBarrioBuscador').addEventListener('input', function() {
            const val = Utils.normalizeStr(this.value);
            const muni = document.getElementById('chkCiudad').value;
            const sugg = document.getElementById('suggestions');
            sugg.innerHTML = '';
            if (val.length < 1) { sugg.style.display = 'none'; return; }
            const filtered = barriosBD.filter(b => b.m === muni && Utils.normalizeStr(b.n).includes(val));
            if (filtered.length > 0) {
                filtered.forEach(b => {
                    const d = document.createElement('div'); d.className = 'sug-item'; d.textContent = b.n;
                    d.onclick = () => Checkout.selectBarrioDinamico(b.n, b.p);
                    sugg.appendChild(d);
                });
                sugg.style.display = 'block';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Checkout.init);