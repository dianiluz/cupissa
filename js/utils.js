/* ===================================================== */
/* CUPISSA — UTILIDADES GLOBALES */
/* ===================================================== */

const Utils = {

    // Quita tildes, ñ y espacios extra para comparar textos exactamente iguales
    normalizeStr: (str) => {
        if (!str) return "";
        return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    },
    // Limpia cualquier formato ($ o puntos) y lo vuelve un número real
    safeNumber: (val) => {
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9]/g, '');
        return Number(clean) || 0;
    },


    formatCurrency: (amount) => {
        const num = Utils.safeNumber(amount);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(num);
    },

    // Función para revolver (aleatorizar) un arreglo
    shuffle: (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },

    fetchSheetData: async (gid) => {
        try {
            const response = await fetch(getSheetURL(gid));
            const text = await response.text();
            return Utils.tsvToJSON(text);
        } catch (error) {
            console.error("Error fetching TSV:", error);
            return [];
        }
    },

    tsvToJSON: (tsv) => {
        const lines = tsv.split('\n');
        const headers = lines[0].split('\t').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const obj = {};
            const currentLine = lines[i].split('\t');
            headers.forEach((header, j) => {
                obj[header] = currentLine[j] ? currentLine[j].trim() : "";
            });
            result.push(obj);
        }
        return result;
    },

    getUserSession: () => {
        const session = localStorage.getItem('cupissa_user');
        return session ? JSON.parse(session) : null;
    }
};