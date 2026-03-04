/* ===================================================== */
/* CUPISSA — UTILIDADES GLOBALES Y NOTIFICACIONES */
/* ===================================================== */

const Utils = {
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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    },

    normalizeStr: (str) => {
        if (!str) return "";
        return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    },

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
            console.error("Error fetching TSV");
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

    // AQUI ESTÁ LA SOLUCIÓN DEL LOOP
    getUserSession: () => {
        const local = localStorage.getItem('cupissa_user');
        const session = sessionStorage.getItem('cupissa_user');
        
        if (local) return JSON.parse(local);
        if (session) return JSON.parse(session);
        return null;
    },

    toast: (msg, type = 'info') => {
        let toastBox = document.getElementById('cupissa-toast-box');
        if (!toastBox) {
            toastBox = document.createElement('div');
            toastBox.id = 'cupissa-toast-box';
            toastBox.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
            document.body.appendChild(toastBox);
        }
        
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'var(--color-danger, #dc3545)' : (type === 'success' ? 'var(--color-success, #28a745)' : 'var(--color-black, #000)');
        
        toast.style.cssText = `background-color: ${bgColor}; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: var(--font-primary); font-size: 0.95rem; opacity: 0; transform: translateY(20px); transition: all 0.3s ease;`;
        toast.innerText = msg;
        
        toastBox.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};