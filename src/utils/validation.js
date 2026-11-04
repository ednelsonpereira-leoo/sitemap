export const INVALID_CATALOG_IDS = new Set([
    '',
    'false',
    'undefined',
    'null',
    'nan',
    '-1000',
]);
export const isValidCatalogId = (id) => {
    if (typeof id === 'function') return true;
    if (id === undefined || id === null || typeof id === 'boolean')
        return false;
    const normalized = String(id).trim();
    if (!normalized) return false;
    return !INVALID_CATALOG_IDS.has(normalized.toLowerCase());
};
export const isValidLineItem = (lineItem) => {
    if (!lineItem || Array.isArray(lineItem) || typeof lineItem !== 'object')
        return false;
    if (!isValidCatalogId(lineItem.catalogObjectId)) return false;
    const quantity = Number(lineItem.quantity);
    return Number.isFinite(quantity) && quantity > 0;
};
export const looksLikeEmail = (email) => {
    const value = String(email || '').trim();
    if (value.length < 6 || value.length > 254) return false;
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
};
export const LEAD_CAPTURE_EVENTS = new Set([
    'User Sign Up',
    'User Login',
    'Envio de Formul\xE1rio - A Hora da Virada',
    'Envio de Formul\xE1rio - Sua Aprova\xE7\xE3o',
]);
