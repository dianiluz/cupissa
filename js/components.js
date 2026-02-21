async function loadComponent(id,url){
  const res=await fetch(url);
  document.getElementById(id).innerHTML=await res.text();
}

loadComponent("header","/components/header.html");
loadComponent("footer","/components/footer.html");