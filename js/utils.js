/* ===================================================== */
/* CUPISSA — UTILIDADES GLOBALES */
/* ===================================================== */

/* ========================= */
/* SELECTORES */
/* ========================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

/* ========================= */
/* CAPITALIZAR TEXTO */
/* ========================= */

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* ========================= */
/* NORMALIZAR TEXTO (para buscador futuro) */
/* ========================= */

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* ========================= */
/* FORMATEAR TEXTO SEO */
/* ========================= */

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/* ========================= */
/* PARSEAR TSV A JSON */
/* ========================= */

function parseTSV(tsv) {
  const lineas = tsv.trim().split("\n");
  const headers = lineas[0].split("\t");

  return lineas.slice(1).map(linea => {
    const valores = linea.split("\t");
    const objeto = {};

    headers.forEach((header, index) => {
      objeto[header.trim()] = valores[index] ? valores[index].trim() : "";
    });

    return objeto;
  });
}

/* ========================= */
/* LOCAL STORAGE SEGURO */
/* ========================= */

function guardarLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function obtenerLocal(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function eliminarLocal(key) {
  localStorage.removeItem(key);
}