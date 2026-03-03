/* ===================================================== */
/* CUPISSA — CONFIGURACIÓN GLOBAL */
/* ===================================================== */

const CONFIG = {
    brandName: "CUPISSA",
    whatsappNumber: "573147671380",
    baseURL: "https://cupissa.com",
    contactEmail: "contacto@cupissa.com",
    sheetURL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQB2HWydVva17mDTdLcYgY409q5DcJHg3PumZLypAgLiwWs6s8ptH_kC_qjuhZv7W010xobmyFl2d7y/pub?output=tsv",
    backendURL: "https://script.google.com/macros/s/AKfycbyzqj3w2a83cHtAXAP3LKnsj5kel8C5EwRCgFlaEHv5V70SrnxXGt7kOfNmLQCW9dhK/exec",
    gids: {
        PRODUCTOS: "0",
        VARIACIONES: "1408591435",
        USUARIOS: "93400123",
        PEDIDOS: "1721653611",
        PEDIDOS_PRODUCTOS: "1545784056",
        MARKETING: "1174791065",
        PUNTOS_CLIENTES: "310660099"
    }
};

function getSheetURL(gid) {
    return CONFIG.sheetURL.replace("output=tsv", `gid=${gid}&single=true&output=tsv`);
}