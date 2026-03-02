let pasoActual = 1;

let checkoutData = {
  tipo: null,
  envio: null,
  metodo_pago: null
};

const CIUDADES_LOCALES = [
  "BARRANQUILLA",
  "SOLEDAD",
  "GALAPA",
  "MALAMBO",
  "PUERTO COLOMBIA"
];

const MUNICIPIOS = {

"Amazonas":[
"Leticia","Puerto Nariño","El Encanto","La Chorrera","La Pedrera",
"La Victoria","Mirití-Paraná","Puerto Alegría","Puerto Arica",
"Puerto Santander","Tarapacá"
],

"Antioquia":[
"Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes",
"Angelópolis","Angostura","Anorí","Anzá","Apartadó","Arboletes",
"Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia",
"Bolívar","Briceño","Buriticá","Cáceres","Caicedo","Caldas",
"Campamento","Cañasgordas","Caracolí","Caramanta","Carepa",
"Carolina del Príncipe","Caucasia","Chigorodó","Cisneros","Cocorná",
"Concepción","Concordia","Copacabana","Dabeiba","Don Matías",
"Ebéjico","El Bagre","Entrerríos","Envigado","Fredonia",
"Frontino","Giraldo","Girardota","Gómez Plata","Granada",
"Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí",
"Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada",
"La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello",
"Murindó","Mutatá","Nariño","Nechí","Necoclí","Olaya","Peñol",
"Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo",
"Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar",
"San Andrés","San Carlos","San Francisco","San Jerónimo",
"San José de la Montaña","San Juan de Urabá","San Luis",
"San Pedro","San Pedro de Urabá","San Rafael","San Roque",
"Santa Bárbara","Santa Fe de Antioquia","Santa Rosa de Osos",
"Santo Domingo","El Santuario","San Vicente","Segovia",
"Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí",
"Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso",
"Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal",
"Yolombó","Yondó","Zaragoza"
],

"Arauca":[
"Arauca","Arauquita","Cravo Norte","Fortul",
"Puerto Rondón","Saravena","Tame"
],

"Atlántico":[
"Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa",
"Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela",
"Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón",
"Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás",
"Soledad","Suan","Tubará","Usiacurí"
],

"Bogotá D.C.":[
"Bogotá"
],

"Bolívar":[
"Achí","Altos del Rosario","Arenal","Arjona","Arroyo Hondo",
"Barranco de Loba","Calamar","Cantagallo","Cartagena",
"Cicuco","Clemencia","Córdoba","El Carmen de Bolívar",
"El Guamo","El Peñón","Hatillo de Loba","Magangué",
"Mahates","Margarita","María La Baja","Montecristo",
"Morales","Norosí","Pinillos","Regidor","Río Viejo",
"San Cristóbal","San Estanislao","San Fernando",
"San Jacinto","San Juan Nepomuceno","San Martín de Loba",
"San Pablo","Santa Catalina","Santa Rosa",
"Santa Rosa del Sur","Simití","Soplaviento",
"Talaigua Nuevo","Tiquisio","Turbaco","Turbaná",
"Villanueva","Zambrano"
],

"Boyacá":[
"Tunja","Duitama","Sogamoso","Chiquinquirá","Paipa",
"Puerto Boyacá","Villa de Leyva","Moniquirá","Soatá","Socha",
"Samacá","Ramiriquí","Miraflores","Garagoa","Ráquira",
"Nobsa","Muzo","Pauna","Otanche","Aquitania"
],

"Caldas":[
"Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná",
"Filadelfia","La Dorada","La Merced","Manizales",
"Manzanares","Marmato","Marquetalia","Marulanda",
"Neira","Norcasia","Pácora","Palestina","Pensilvania",
"Riosucio","Risaralda","Salamina","Samaná","San José",
"Supía","Victoria","Villamaría","Viterbo"
],

"Caquetá":[
"Albania","Belén de los Andaquíes","Cartagena del Chairá",
"Curillo","El Doncello","El Paujil","Florencia",
"La Montañita","Milán","Morelia","Puerto Rico",
"San José del Fragua","San Vicente del Caguán",
"Solano","Solita","Valparaíso"
],

"Casanare":[
"Aguazul","Chámeza","Hato Corozal","La Salina",
"Maní","Monterrey","Nunchía","Orocué",
"Paz de Ariporo","Pore","Recetor",
"Sabanalarga","Sácama","San Luis de Palenque",
"Támara","Tauramena","Trinidad","Villanueva","Yopal"
],

"Cauca":[
"Popayán","Santander de Quilichao","Puerto Tejada",
"Corinto","El Tambo","Guapi","Miranda","Silvia",
"Timbío","Villa Rica"
],

"Cesar":[
"Valledupar","Aguachica","Agustín Codazzi",
"Bosconia","Chimichagua","Curumaní",
"La Jagua de Ibirico","Pueblo Bello",
"San Alberto","San Diego","San Martín"
],

"Chocó":[
"Quibdó","Acandí","Bahía Solano",
"Istmina","Nuquí","Riosucio","Tadó"
],

"Córdoba":[
"Montería","Cereté","Lorica","Sahagún",
"Montelíbano","Planeta Rica","Tierralta",
"Valencia","Ayapel","Chinú"
],

"Cundinamarca":[
"Soacha","Chía","Zipaquirá","Girardot",
"Facatativá","Fusagasugá","Madrid",
"Mosquera","Cajicá","La Calera"
],

"La Guajira":[
"Riohacha","Maicao","Uribia",
"Manaure","San Juan del Cesar",
"Fonseca","Albania","Barrancas"
],

"Magdalena":[
"Santa Marta","Ciénaga","Fundación",
"El Banco","Aracataca","Zona Bananera",
"Plato","Pivijay"
],

"Meta":[
"Villavicencio","Acacías","Granada",
"Puerto López","Restrepo","Cumaral"
],

"Nariño":[
"Pasto","Tumaco","Ipiales",
"Túquerres","La Unión","Samaniego"
],

"Norte de Santander":[
"Cúcuta","Ocaña","Pamplona",
"Villa del Rosario","Tibú"
],

"Putumayo":[
"Mocoa","Puerto Asís","Orito",
"San Miguel","Sibundoy"
],

"Quindío":[
"Armenia","Calarcá","Montenegro",
"La Tebaida","Quimbaya","Salento"
],

"Risaralda":[
"Pereira","Dosquebradas",
"Santa Rosa de Cabal","La Virginia"
],

"Santander":[
"Bucaramanga","Floridablanca",
"Girón","Piedecuesta","Barrancabermeja",
"San Gil","Socorro"
],

"Sucre":[
"Sincelejo","Corozal","Sampués",
"San Marcos","Tolú"
],

"Tolima":[
"Ibagué","Espinal","Melgar",
"Líbano","Mariquita","Honda"
],

"Valle del Cauca":[
"Cali","Palmira","Buenaventura",
"Tuluá","Cartago","Buga","Jamundí"
],

"Vaupés":[
"Mitú","Carurú","Taraira"
],

"Vichada":[
"Puerto Carreño","Cumaribo",
"La Primavera","Santa Rosalía"
]

};

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async () => {

  renderResumenCarrito();
  manejarNavegacion();
  inicializarDepartamento();
  inicializarCiudad();
  await inicializarBarrio();
  prellenarUsuario();

  const ciudadInput = document.getElementById("ciudad");
  if (ciudadInput) {
    ciudadInput.addEventListener("input", actualizarDocumento);
  }
});

/* ================= UTIL ================= */

function val(id){
  return document.getElementById(id)?.value.trim();
}

/* ================= DOCUMENTO DINÁMICO ================= */

function actualizarDocumento(){

  const ciudad = val("ciudad")?.toUpperCase();
  const cont = document.getElementById("documentoContainer");
  if(!cont) return;

  if(!ciudad){
    cont.style.display = "none";
    return;
  }

  cont.style.display = CIUDADES_LOCALES.includes(ciudad) ? "none" : "block";
}

/* ================= NAVEGACIÓN ================= */

function manejarNavegacion(){

  document.querySelectorAll(".next-step").forEach(btn=>{
    btn.addEventListener("click", async ()=>{

      if(pasoActual===1){
        if(!validarPaso1()) return;
        prepararTipo();
        if (typeof generarOpcionesEnvio === "function") {
          await generarOpcionesEnvio();
        }
      }

      cambiarPaso(pasoActual+1);
    });
  });

  document.querySelectorAll(".prev-step").forEach(btn=>{
    btn.addEventListener("click",()=>cambiarPaso(pasoActual-1));
  });
}

function cambiarPaso(n){
  if(n<1||n>4) return;

  document.querySelector(`#paso-${pasoActual}`).classList.remove("active");
  document.querySelector(`.step[data-step="${pasoActual}"]`).classList.remove("active");

  pasoActual=n;

  document.querySelector(`#paso-${pasoActual}`).classList.add("active");
  document.querySelector(`.step[data-step="${pasoActual}"]`).classList.add("active");
}

/* ================= VALIDACIÓN ================= */

function validarPaso1(){

  const campos=["nombre","email","telefono","direccion","barrio","ciudad","departamentoBuscador"];

  for(let c of campos){
    if(!val(c)){
      mostrarNotificacion("Completa todos los datos.");
      return false;
    }
  }

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))){
    mostrarNotificacion("Correo inválido.");
    return false;
  }

  if(!CIUDADES_LOCALES.includes(val("ciudad").toUpperCase()) && !val("documento")){
    mostrarNotificacion("Documento obligatorio para envío nacional.");
    return false;
  }

  checkoutData={
    ...checkoutData,
    nombre_cliente:val("nombre"),
    usuario_email:val("email"),
    telefono:val("telefono"),
    direccion:val("direccion"),
    barrio:val("barrio"),
    ciudad:val("ciudad"),
    departamento:val("departamentoBuscador"),
    cc:val("documento")
  };

  return true;
}

function mostrarNotificacion(msg){

  const n=document.createElement("div");
  n.className="cupissa-notificacion";
  n.textContent=msg;
  document.body.appendChild(n);

  setTimeout(()=>n.classList.add("visible"),50);
  setTimeout(()=>{
    n.classList.remove("visible");
    setTimeout(()=>n.remove(),400);
  },3500);
}

/* ================= TIPO ================= */

function prepararTipo(){
  checkoutData.tipo = CIUDADES_LOCALES.includes(val("ciudad").toUpperCase())
    ? "LOCAL"
    : "NACIONAL";
}

/* ================= DEPARTAMENTO ================= */

function inicializarDepartamento(){

  const input=document.getElementById("departamentoBuscador");
  const lista=document.getElementById("departamentoLista");
  if(!input||!lista) return;

  input.addEventListener("input",function(){

    const v=this.value.toLowerCase();
    lista.innerHTML="";

    Object.keys(MUNICIPIOS).forEach(dep=>{
      if(dep.toLowerCase().includes(v)){
        const d=document.createElement("div");
        d.className="direccion-item";
        d.textContent=dep;
        d.onclick=()=>{
          input.value=dep;
          lista.style.display="none";
        };
        lista.appendChild(d);
      }
    });

    lista.style.display=lista.innerHTML?"block":"none";
  });
}

/* ================= CIUDAD ================= */

function inicializarCiudad(){

  const input=document.getElementById("ciudad");
  const lista=document.getElementById("ciudadSugerencias");
  const depInput=document.getElementById("departamentoBuscador");
  if(!input||!lista||!depInput) return;

  input.addEventListener("input",function(){

    const v=this.value.toLowerCase();
    lista.innerHTML="";

    Object.entries(MUNICIPIOS).forEach(([dep,ciudades])=>{
      ciudades.forEach(ciudad=>{
        if(ciudad.toLowerCase().includes(v)){
          const d=document.createElement("div");
          d.className="direccion-item";
          d.textContent=`${ciudad} - ${dep}`;

          d.onclick=()=>{
            input.value=ciudad;
            depInput.value=dep;
            lista.style.display="none";
            actualizarDocumento();
          };

          lista.appendChild(d);
        }
      });
    });

    lista.style.display=lista.innerHTML?"block":"none";
  });
}

/* ================= BARRIO ================= */

async function inicializarBarrio(){

  const input = document.getElementById("barrio");
  if(!input) return;

  const lista = document.createElement("div");
  lista.className = "direccion-sugerencias";
  input.parentElement.appendChild(lista);

  try {

    const url = CONFIG.sheetURL;
    const res = await fetch(url);
    const tsv = await res.text();

    const filas = tsv.split("\n").slice(1);

    const barrios = filas
      .map(f => f.split("\t")[1]?.trim())
      .filter(Boolean);

    input.addEventListener("input", function(){

      const q = this.value.toLowerCase().trim();
      lista.innerHTML = "";

      if(q.length < 2){
        lista.style.display = "none";
        return;
      }

      barrios
        .filter(b => b.toLowerCase().includes(q))
        .slice(0,8)
        .forEach(b => {

          const d = document.createElement("div");
          d.className = "direccion-item";
          d.textContent = b;

          d.onclick = () => {
            input.value = b;
            lista.style.display = "none";
          };

          lista.appendChild(d);
        });

      lista.style.display = lista.innerHTML ? "block" : "none";
    });

  } catch(e){
    console.error("Error cargando barrios", e);
  }
}

/* ================= RESUMEN ================= */

function renderResumenCarrito(){

  const cont=document.getElementById("resumenCarrito");
  const carrito=obtenerLocal("cupissa_carrito")||[];

  if(!carrito.length){
    cont.innerHTML="<p>Tu carrito está vacío.</p>";
    return;
  }

  let total=0;
  let html="";

  carrito.forEach(i=>{
    total+=i.subtotal||0;
    html+=`<div><strong>${i.nombre}</strong><br>$ ${i.subtotal.toLocaleString()}</div>`;
  });

  html+=`<hr><strong>Total: $ ${total.toLocaleString()}</strong>`;
  cont.innerHTML=html;

  checkoutData.total=total;
  checkoutData.productos=JSON.stringify(carrito);
}

/* ================= PRELLENAR ================= */

function prellenarUsuario(){

  const data=localStorage.getItem("cupissa_user");
  if(!data) return;

  const u=JSON.parse(data);

  ["nombre","email","telefono","direccion","barrio","ciudad","departamento"]
  .forEach(id=>{
    const input=document.getElementById(id==="departamento"?"departamentoBuscador":id);
    if(input&&u[id]) input.value=u[id];
  });

  actualizarDocumento();
}