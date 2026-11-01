import initialData from "../data/taxonomy.json" with { type: "json" };
const KEY="cupissa-admin-taxonomy-v1";
const clone=(v)=>JSON.parse(JSON.stringify(v));
let data=load();
let currentView="dashboard",editingId=null;
const $=(s)=>document.querySelector(s);
const configs={
 worlds:{title:"Mundos",description:"Cada mundo tiene identidad propia y agrupa sus categorías.",collection:"worlds",fields:[["name","Nombre","text"],["description","Descripción","textarea"],["color","Color característico","color"],["icon","Icono o símbolo","text"],["active","Estado","select",[["true","Activo"],["false","Oculto"]]]]},
 categories:{title:"Categorías",description:"Las categorías pertenecen a un mundo específico.",collection:"categories",fields:[["name","Nombre","text"],["worldId","Mundo","world"],["active","Estado","select",[["true","Activa"],["false","Oculta"]]]]},
 subcategories:{title:"Subcategorías",description:"Cada subcategoría pertenece a una categoría y, por relación, a su mundo.",collection:"subcategories",fields:[["name","Nombre","text"],["categoryId","Categoría","category"],["active","Estado","select",[["true","Activa"],["false","Oculta"]]]]},
 themes:{title:"Temáticas",description:"Clasificación global reutilizable en todos los mundos.",collection:"themes",fields:[["name","Tipo de temática","text"]]},
 occasions:{title:"Ocasiones",description:"Motivos de compra y celebraciones reutilizables.",collection:"occasions",fields:[["name","Nombre de ocasión","text"]]},
 seasons:{title:"Temporadas",description:"Campañas comerciales y fechas especiales.",collection:"seasons",fields:[["name","Nombre de temporada","text"]]},
 audiences:{title:"Públicos",description:"Públicos objetivo ampliables: personas, mascotas, empresas y más.",collection:"audiences",fields:[["name","Nombre del público","text"]]}
};
function load(){try{const saved=localStorage.getItem(KEY);return saved?JSON.parse(saved):clone(initialData)}catch{return clone(initialData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function id(){return "item-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7)}
function notify(message){const t=$("#toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function labelForWorld(id){return data.worlds.find(x=>x.id===id)?.name||"Sin mundo"}
function labelForCategory(id){return data.categories.find(x=>x.id===id)?.name||"Sin categoría"}
function renderDashboard(){
 const counts=[["Mundos",data.worlds.length],["Categorías",data.categories.length],["Subcategorías",data.subcategories.length],["Temáticas",data.themes.length+data.seasons.length+data.occasions.length+data.audiences.length]];
 $("#stats").innerHTML=counts.map(([n,v])=>`<div class="stat"><span>${n}</span><strong>${v}</strong></div>`).join("");
 $("#overview").innerHTML=[["Temáticas",data.themes.length],["Ocasiones",data.occasions.length],["Temporadas",data.seasons.length],["Públicos",data.audiences.length]].map(([n,v])=>`<div><b>${v}</b>${n}</div>`).join("");
}
function renderManager(){
 const c=configs[currentView];$("#managerTitle").textContent=c.title;$("#managerDescription").textContent=c.description;$("#pageTitle").textContent=c.title;
 const term=($("#tableSearch").value||"").toLocaleLowerCase("es");
 let rows=data[c.collection].filter(x=>JSON.stringify(x).toLocaleLowerCase("es").includes(term));
 $("#itemCount").textContent=rows.length+" elementos";
 const headers=currentView==="worlds"?["Nombre","Color","Descripción","Estado"]:currentView==="categories"?["Categoría","Mundo","Estado"]:currentView==="subcategories"?["Subcategoría","Categoría","Estado"]:["Nombre"];
 const body=rows.map(item=>{
 let cells="";
 if(currentView==="worlds")cells=`<td><strong>${esc(item.name)}</strong></td><td><span class="swatch" style="background:${esc(item.color||"#ed1683")}"></span>${esc(item.color||"")}</td><td>${esc(item.description||"")}</td><td><span class="tag">${item.active===false?"Oculto":"Activo"}</span></td>`;
 else if(currentView==="categories")cells=`<td><strong>${esc(item.name)}</strong></td><td>${esc(labelForWorld(item.worldId))}</td><td><span class="tag">${item.active===false?"Oculta":"Activa"}</span></td>`;
 else if(currentView==="subcategories")cells=`<td><strong>${esc(item.name)}</strong></td><td>${esc(labelForCategory(item.categoryId))}</td><td><span class="tag">${item.active===false?"Oculta":"Activa"}</span></td>`;
 else cells=`<td><strong>${esc(item.name)}</strong></td>`;
 return `<tr>${cells}<td><div class="row-actions"><button data-edit="${item.id}">Editar</button><button class="delete" data-delete="${item.id}">Eliminar</button></div></td></tr>`;
 }).join("");
 $("#managerContent").innerHTML=rows.length?`<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}<th>Acciones</th></tr></thead><tbody>${body}</tbody></table></div>`:'<div class="empty">No hay elementos que coincidan con la búsqueda.</div>';
 $("#managerContent").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openEditor(b.dataset.edit)));
 $("#managerContent").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>removeItem(b.dataset.delete)));
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openView(view){
 currentView=view;document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 $("#dashboardView").classList.toggle("active",view==="dashboard");$("#managerView").classList.toggle("active",view!=="dashboard");
 if(view==="dashboard"){ $("#pageTitle").textContent="Dashboard";renderDashboard()}else{ $("#tableSearch").value="";renderManager()}
}
function openEditor(itemId=null){
 editingId=itemId;const c=configs[currentView],item=itemId?data[c.collection].find(x=>x.id===itemId):{};
 $("#dialogTitle").textContent=itemId?"Editar elemento":"Crear elemento";$("#formFields").innerHTML="";
 c.fields.forEach(([key,label,type,options])=>{
 const wrap=document.createElement("div");wrap.className="field";const lab=document.createElement("label");lab.textContent=label;lab.htmlFor="field-"+key;wrap.append(lab);
 let input;
 if(type==="textarea"){input=document.createElement("textarea");input.rows=3}
 else if(type==="select"||type==="world"||type==="category"){input=document.createElement("select");let opts=type==="world"?data.worlds.map(x=>[x.id,x.name]):type==="category"?data.categories.map(x=>[x.id,x.name+" · "+labelForWorld(x.worldId)]):options;opts.forEach(([v,n])=>{const o=document.createElement("option");o.value=v;o.textContent=n;input.append(o)})}
 else{input=document.createElement("input");input.type=type}
 input.id="field-"+key;input.name=key;input.required=["name","worldId","categoryId"].includes(key);
 let value=item?.[key];if(key==="active")value=String(value!==false);if(value!==undefined)input.value=value;else if(type==="color")input.value="#ed1683";
 wrap.append(input);$("#formFields").append(wrap);
 });
 $("#editDialog").showModal();
}
function removeItem(itemId){
 const c=configs[currentView];const item=data[c.collection].find(x=>x.id===itemId);if(!item)return;
 if(!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer en este navegador.`))return;
 if(currentView==="worlds"){
 const dependent=data.categories.filter(x=>x.worldId===itemId);
 if(dependent.length&&!confirm("Este mundo tiene categorías asociadas. También se eliminarán sus categorías y subcategorías. ¿Continuar?"))return;
 const catIds=dependent.map(x=>x.id);data.categories=data.categories.filter(x=>x.worldId!==itemId);data.subcategories=data.subcategories.filter(x=>!catIds.includes(x.categoryId));
 }
 if(currentView==="categories")data.subcategories=data.subcategories.filter(x=>x.categoryId!==itemId);
 data[c.collection]=data[c.collection].filter(x=>x.id!==itemId);save();renderManager();notify("Elemento eliminado.");
}
function submitEditor(event){
 event.preventDefault();const c=configs[currentView],form=new FormData($("#editForm"));const item={};
 c.fields.forEach(([key,label,type])=>{let v=form.get(key);if(type==="select"&&key==="active")v=v==="true";item[key]=v});
 if(currentView==="subcategories"){const cat=data.categories.find(x=>x.id===item.categoryId);if(!cat){notify("Selecciona una categoría válida.");return}item.worldId=cat.worldId}
 if(editingId){const index=data[c.collection].findIndex(x=>x.id===editingId);data[c.collection][index]={...data[c.collection][index],...item}}
 else data[c.collection].push({id:id(),...item});
 save();$("#editDialog").close();renderManager();notify("Cambios guardados en este navegador.");
}
function exportData(){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cupissa-taxonomia.json";a.click();URL.revokeObjectURL(url);notify("Archivo de respaldo generado.");
}
function importData(file){
 const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);for(const key of ["worlds","categories","subcategories","themes","occasions","seasons","audiences"])if(!Array.isArray(incoming[key]))throw Error("Estructura incompleta");if(!confirm("La importación reemplazará la clasificación guardada en este navegador. ¿Continuar?"))return;data=incoming;save();openView(currentView);notify("Datos importados correctamente.")}catch{notify("No se pudo importar: archivo inválido o incompleto.")}};reader.readAsText(file);
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>openView(b.dataset.view)));
$("#addBtn").addEventListener("click",()=>openEditor());$("#editForm").addEventListener("submit",submitEditor);
$("#closeDialog").addEventListener("click",()=>$("#editDialog").close());$("#cancelDialog").addEventListener("click",()=>$("#editDialog").close());
$("#tableSearch").addEventListener("input",renderManager);$("#exportBtn").addEventListener("click",exportData);
$("#importBtn").addEventListener("click",()=>$("#importFile").click());$("#importFile").addEventListener("change",e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value=""});
renderDashboard();