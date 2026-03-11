/* ===================================================== */
/* CUPISSA — PANEL CLIENTE FUNCIONAL                     */
/* ===================================================== */

const Panel = {

user:null,
datosFull:null,
pedidos:[],
promos:[],

/* INIT */

init: async ()=>{

const session = Utils.getUserSession();

if(!session){
window.location.href="/login/";
return;
}

Panel.user=session;

await Panel.fetchUserData();

Panel.showTab("resumen");

},

/* ===================================================== */
/* CARGAR DATOS PANEL                                    */
/* ===================================================== */

fetchUserData: async ()=>{

const res = await Utils.fetchFromBackend(
"obtenerDatosPanel",
{email:Panel.user.email}
);

if(!res.success){
Utils.toast(res.error,"error");
return;
}

Panel.datosFull = res.datos;
Panel.pedidos = res.pedidos || [];
Panel.promos = res.promociones || [];

document.getElementById("panelUserName").innerText = res.datos.nombre;
document.getElementById("valCupiCoins").innerText = res.datos.total_cupicoins;
document.getElementById("valPedidosActivos").innerText = res.datos.pedidos_activos;
document.getElementById("valNivelClub").innerText = res.datos.nivel_club;
document.getElementById("userPhoto").src = res.datos.foto_url;

Panel.renderPedidos();
Panel.renderAlbumes();
Panel.renderPerfil();

},

/* ===================================================== */
/* CAMBIAR TAB                                           */
/* ===================================================== */

showTab:(tab)=>{

document.querySelectorAll(".tab-pane").forEach(p=>p.classList.remove("active"));
document.querySelectorAll(".panel-sidebar-menu li").forEach(l=>l.classList.remove("active"));

document.getElementById("tab-"+tab).classList.add("active");
document.getElementById("menu-"+tab).classList.add("active");

if(tab==="pedidos") Panel.renderPedidos();
if(tab==="albumes") Panel.renderAlbumes();
if(tab==="perfil") Panel.renderPerfil();

},

/* ===================================================== */
/* PEDIDOS                                               */
/* ===================================================== */

renderPedidos: ()=>{

const cont = document.getElementById("listaPedidos");

if(!Panel.pedidos.length){

cont.innerHTML=`<p>No tienes pedidos.</p>`;
return;

}

cont.innerHTML = Panel.pedidos.map(p=>{

const estado = CONFIG.estadosProduccion[p.estado] || {nombre:"Desconocido",color:"#777"};

return `
<div class="pedido-card">

<div class="pedido-head">
<b>Pedido #${p.IDpedido}</b>
<span style="color:${estado.color}">
${estado.nombre}
</span>
</div>

<p>Total: ${Utils.formatCurrency(p.total)}</p>

<div class="pedido-actions">

<button onclick="Panel.rastrear('${p.IDpedido}')">
Rastrear
</button>

<button onclick="Panel.cancelarPedido('${p.IDpedido}')">
Cancelar
</button>

</div>

</div>
`;

}).join("");

},

cancelarPedido: async (id)=>{

if(!confirm("Cancelar pedido?")) return;

const res = await Utils.fetchFromBackend(
"cancelarPedidoCliente",
{id_pedido:id}
);

if(res.success){

Utils.toast("Pedido cancelado","success");

Panel.fetchUserData();

}

},

rastrear:(id)=>{
window.location.href=`/rastreo/?id=${id}`;
},

/* ===================================================== */
/* SOBRES                                                */
/* ===================================================== */

comprarSobre: async ()=>{

if(!confirm("Comprar sobre por 25 CupiCoins?")) return;

const res = await Utils.fetchFromBackend(
"abrirSobreBackend",
{email:Panel.user.email}
);

if(!res.success){
Utils.toast(res.error,"error");
return;
}

Panel.animarSobre(res.estampitas);

Panel.fetchUserData();

},

animarSobre:(cards)=>{

const modal=document.createElement("div");

modal.className="modal-sobre";

modal.innerHTML=`

<div class="sobre-opening">

<h2>¡Abriste un sobre!</h2>

<div class="cards-pack">

${cards.map(c=>`

<div class="card-pack ${c.rareza}">
<img src="${c.imagenurl}">
<p>${c.nombre}</p>
</div>

`).join("")}

</div>

<button onclick="this.closest('.modal-sobre').remove()">
Cerrar
</button>

</div>
`;

document.body.appendChild(modal);

},

/* ===================================================== */
/* ALBUM                                                 */
/* ===================================================== */

renderAlbumes: async ()=>{

const cont = document.getElementById("albumContainer");

const res = await Utils.fetchFromBackend(
"obtenerAlbumUsuario",
{email:Panel.user.email}
);

if(!res.success){

cont.innerHTML="<p>No tienes estampitas</p>";
return;

}

if(!res.album.length){

cont.innerHTML=`
<p>No tienes estampitas.</p>
<button onclick="Panel.comprarSobre()">Comprar sobre</button>
`;
return;

}

cont.innerHTML = res.album.map(e=>`

<div class="card-estampita">

<img src="${e.imagen}">
<h4>${e.nombre}</h4>
<p>${e.rareza}</p>
<p>x${e.cantidad}</p>

<button onclick="Panel.publicarIntercambio(${e.id})">
Intercambiar
</button>

</div>

`).join("");

},

/* ===================================================== */
/* INTERCAMBIOS                                          */
/* ===================================================== */

publicarIntercambio: async (id)=>{

const quiere = prompt("¿Qué estampita quieres a cambio? (ID)");

if(!quiere) return;

const res = await Utils.fetchFromBackend(
"crearIntercambio",
{
email:Panel.user.email,
ofrece:id,
quiere
}
);

if(res.success){

Utils.toast("Intercambio publicado","success");

}

},

/* ===================================================== */
/* PERFIL                                                */
/* ===================================================== */

renderPerfil: ()=>{

const cont = document.getElementById("tab-perfil");

cont.innerHTML=`

<div class="perfil-form">

<label>Teléfono</label>
<input id="tel" value="${Panel.datosFull.telefono || ""}">

<label>Barrio</label>
<input id="barrio" value="${Panel.datosFull.barrio || ""}">

<label>Dirección</label>
<input id="direccion" value="${Panel.datosFull.direccion || ""}">

<button onclick="Panel.guardarPerfil()">
Guardar
</button>

</div>

`;

},

guardarPerfil: async ()=>{

const telefono=document.getElementById("tel").value;
const barrio=document.getElementById("barrio").value;
const direccion=document.getElementById("direccion").value;

const res = await Utils.fetchFromBackend(
"actualizarDatosPerfil",
{
email:Panel.user.email,
telefono,
barrio,
direccion
}
);

if(res.success){

Utils.toast("Datos actualizados","success");

Panel.fetchUserData();

}

}

};

document.addEventListener("DOMContentLoaded",Panel.init);