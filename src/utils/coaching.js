import { isValidCatalogId } from "./validation.js";

export const LAST_COACHING_PRODUCT_KEY = 'sfmc_last_coaching_product';
export const LAST_COACHING_PRODUCT_TTL_MS = 60 * 60 * 1e3;
export const LAST_COACHING_PRODUCT_COOKIE_DOMAIN = '.grancursosonline.com.br';
export const isCoachingCheckoutPage = () =>
    /coaching\/checkout/.test(window.location.pathname);
export const isCoachingOrMentoriaProduct = (product) => {
    const name = product && product.name ? product.name : '';
    const category = product && product.category ? product.category : '';
    const text = (name + ' ' + category).toLowerCase();
    return text.includes('coaching') || text.includes('mentoria');
};
export const getProductFromDetailsEvent = (evt) => {
    const ecommerce = evt && evt.ecommerce ? evt.ecommerce : {};
    const detailProduct =
        ecommerce.detail &&
        ecommerce.detail.products &&
        ecommerce.detail.products[0];
    const clickProduct =
        ecommerce.click &&
        ecommerce.click.products &&
        ecommerce.click.products[0];
    return detailProduct || clickProduct || null;
};
export let lastSavedCoachingProductKey = '';
export const saveLastCoachingProduct = (product) => {
    if (
        !product ||
        !isValidCatalogId(product.id) ||
        !isCoachingOrMentoriaProduct(product)
    )
        return;
    const price = parseFloat(String(product.price).replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) return;
    const dedupKey = `${product.id}|${price}`;
    if (lastSavedCoachingProductKey === dedupKey) return;
    lastSavedCoachingProductKey = dedupKey;
    const entry = {
        catalogObjectId: String(product.id),
        price,
        savedAt: Date.now(),
    };
    const value = JSON.stringify(entry);
    try {
        sessionStorage.setItem(LAST_COACHING_PRODUCT_KEY, value);
    } catch (e) {}
    try {
        localStorage.setItem(LAST_COACHING_PRODUCT_KEY, value);
    } catch (e) {}
    try {
        const expires = new Date(
            Date.now() + LAST_COACHING_PRODUCT_TTL_MS,
        ).toUTCString();
        document.cookie = `${LAST_COACHING_PRODUCT_KEY}=${encodeURIComponent(value)};expires=${expires};path=/;domain=${LAST_COACHING_PRODUCT_COOKIE_DOMAIN};SameSite=Lax`;
    } catch (e) {}
    console.log('[SFMC AddToCart] coaching product saved for checkout', entry);
};
export const readLastCoachingProduct = () => {
    const sources = [
        () => {
            const match = document.cookie.match(
                new RegExp(`(?:^|; )${LAST_COACHING_PRODUCT_KEY}=([^;]*)`),
            );
            return match ? decodeURIComponent(match[1]) : '';
        },
        () => sessionStorage.getItem(LAST_COACHING_PRODUCT_KEY),
        () => localStorage.getItem(LAST_COACHING_PRODUCT_KEY),
    ];
    for (const readValue of sources) {
        try {
            const raw = readValue();
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.catalogObjectId || parsed.price == null)
                continue;
            if (Date.now() - parsed.savedAt > LAST_COACHING_PRODUCT_TTL_MS)
                continue;
            return parsed;
        } catch (e) {}
    }
    return null;
};
export const captureLastCoachingProductFromDataLayer = () => {
    try {
        if (!window.dataLayer || !Array.isArray(window.dataLayer)) return;
        const detailsEvent = window.dataLayer
            .slice()
            .reverse()
            .find((item) => item && item.event === 'productDetails_UA');
        if (!detailsEvent) return;
        saveLastCoachingProduct(getProductFromDetailsEvent(detailsEvent));
    } catch (e) {}
};
