/* ===================================================== */
/* CUPISSA — CONFIGURACIÓN GLOBAL */
/* ===================================================== */

const CONFIG = {

  /* ========================= */
  /* INFORMACIÓN GENERAL */
  /* ========================= */

  brandName: "CUPISSA",
  whatsappNumber: "573147671380",
  baseURL: "https://cupissa.com",
  contactEmail: "contacto@cupissa.com",

  /* ========================= */
  /* GOOGLE SHEET */
  /* ========================= */

  sheetURL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=tsv",
  variacionesURL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?gid=1408591435&single=true&output=tsv",
  /* ========================= */
  /* BACKEND (APPS SCRIPT) */
  /* ========================= */

  backendURL: "https://script.google.com/macros/s/AKfycbyzqj3w2a83cHtAXAP3LKnsj5kel8C5EwRCgFlaEHv5V70SrnxXGt7kOfNmLQCW9dhK/exec",

  
  /* ========================= */
  /* FUTURO (PREPARADO) */
  /* ========================= */

  defaultLanguage: "es",
  supportedLanguages: ["es", "en"],

  defaultCurrency: "COP",
  supportedCurrencies: ["COP", "USD"],

  /* ========================= */
  /* TRANSPORTADORAS */
  /* ========================= */

  transportadoras: {
    "Interrapidisimo": "https://www.interrapidisimo.com/sigue-tu-envio/",
    "Envía": "https://www.envia.co/seguimiento",
    "Servientrega": "https://www.servientrega.com/seguimiento-envios",
    "TCC": "https://www.tcc.com.co/rastreo/"
  }

};