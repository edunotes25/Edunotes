// Generar ID único
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`.toUpperCase();
}

// Formatear fecha
function formatDate(date, format = 'dd/mm/yyyy') {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    switch(format) {
        case 'dd/mm/yyyy':
            return `${day}/${month}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        case 'dd MMM yyyy':
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${day} ${months[d.getMonth()]} ${year}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar teléfono español
function isValidPhone(phone) {
    const re = /^[6789]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Sanitizar texto (evitar XSS)
function sanitizeText(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Calcular IVA (21%)
function calculateIVA(amount) {
    return {
        base: amount / 1.21,
        iva: amount - (amount / 1.21),
        total: amount
    };
}

// Generar slug para URLs
function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Reemplazar espacios por -
        .replace(/[^\w\-]+/g, '')        // Eliminar caracteres especiales
        .replace(/\-\-+/g, '-')          // Reemplazar múltiples - por uno solo
        .replace(/^-+/, '')               // Eliminar - del inicio
        .replace(/-+$/, '');              // Eliminar - del final
}

// Paginar resultados
function paginateResults(data, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
        data: data.slice(startIndex, endIndex),
        currentPage: page,
        totalPages: Math.ceil(data.length / limit),
        totalItems: data.length,
        hasNext: endIndex < data.length,
        hasPrev: startIndex > 0
    };
}

// Ordenar objetos por propiedad
function sortByProperty(array, property, order = 'asc') {
    return array.sort((a, b) => {
        if (order === 'asc') {
            return a[property] > b[property] ? 1 : -1;
        } else {
            return a[property] < b[property] ? 1 : -1;
        }
    });
}

// Agrupar por propiedad
function groupBy(array, property) {
    return array.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

// Formatear número como moneda
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Truncar texto
function truncateText(text, length = 100, suffix = '...') {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
}

// Extraer dominio de URL
function getDomainFromUrl(url) {
    try {
        const { hostname } = new URL(url);
        return hostname.replace('www.', '');
    } catch {
        return null;
    }
}

module.exports = {
    generateId,
    formatDate,
    isValidEmail,
    isValidPhone,
    sanitizeText,
    calculateIVA,
    generateSlug,
    paginateResults,
    sortByProperty,
    groupBy,
    formatCurrency,
    truncateText,
    getDomainFromUrl
};