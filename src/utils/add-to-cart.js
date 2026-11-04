import { getCrossDomainCookie, setCrossDomainCookie } from "./cookies.js";
import { getUserEmail, isUserIdentified, isUserLoggedIn } from "./user.js";
import { captureLastCoachingProductFromDataLayer, isCoachingCheckoutPage, readLastCoachingProduct } from "./coaching.js";

export const ADD_TO_CART_DEDUP_WINDOW_MS = 4e3;
export const addToCartRecentKeys = new Map();
export const addToCartPlanIds = new Map();
export const logAddToCartSkip = (source, reason, details = {}) => {
    console.log('[SFMC AddToCart] skipped', { source, reason, ...details });
};
export const parseAddToCartPrice = (price) => {
    const parsed = parseFloat(String(price).replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
export const wasAddToCartRecentlySent = (key) => {
    const sentAt = addToCartRecentKeys.get(key);
    if (!sentAt) return false;
    if (Date.now() - sentAt > ADD_TO_CART_DEDUP_WINDOW_MS) {
        addToCartRecentKeys.delete(key);
        return false;
    }
    return true;
};
export const markAddToCartSent = (key, catalogObjectId) => {
    addToCartRecentKeys.set(key, Date.now());
    if (catalogObjectId.startsWith('A_')) {
        addToCartPlanIds.set(catalogObjectId.slice(2), Date.now());
    }
};
export const wasPlanIdRecentlySent = (planId) => {
    const sentAt = addToCartPlanIds.get(String(planId));
    if (!sentAt) return false;
    if (Date.now() - sentAt > ADD_TO_CART_DEDUP_WINDOW_MS) {
        addToCartPlanIds.delete(String(planId));
        return false;
    }
    return true;
};
export const getAbandonmentKey = (catalogObjectId) => {
    const rawId = String(catalogObjectId).startsWith('A_')
        ? String(catalogObjectId).slice(2)
        : String(catalogObjectId);
    return `abandon|${rawId}`;
};
export const getAddToCartDedupKey = (catalogObjectId) => String(catalogObjectId);
export const buildValidatedLineItem = (catalogObjectId, price) => ({
    catalogObjectType: 'Product',
    catalogObjectId,
    price,
    quantity: 1,
});

export const PENDING_ADD_TO_CART_KEY = 'sfmc_pending_add_to_cart';

export const PENDING_ADD_TO_CART_TTL_MS = 24 * 60 * 60 * 1e3;

export const readPendingQueue = () => {
    try {
        const fromCookie = getCrossDomainCookie(PENDING_ADD_TO_CART_KEY);
        if (fromCookie) return JSON.parse(fromCookie);
        const fromLocal = localStorage.getItem(PENDING_ADD_TO_CART_KEY);
        if (fromLocal) return JSON.parse(fromLocal);
    } catch (e) {
        console.error('[SFMC AddToCart] failed to read pending queue', e);
    }
    return [];
};
export const writePendingQueue = (queue) => {
    const value = JSON.stringify(queue);
    try {
        setCrossDomainCookie(PENDING_ADD_TO_CART_KEY, value, 1);
        localStorage.setItem(PENDING_ADD_TO_CART_KEY, value);
    } catch (e) {
        console.error('[SFMC AddToCart] failed to write pending queue', e);
    }
};
export const clearPendingQueue = () => {
    try {
        setCrossDomainCookie(PENDING_ADD_TO_CART_KEY, '', -1);
        localStorage.removeItem(PENDING_ADD_TO_CART_KEY);
    } catch (e) {}
};
export const savePendingAddToCart = (lineItemInput, source) => {
    const catalogObjectId = lineItemInput?.catalogObjectId;
    const price = parseAddToCartPrice(lineItemInput?.price);
    if (!catalogObjectId || price === null) return;
    const entry = { catalogObjectId, price, source, savedAt: Date.now() };
    try {
        let queue = readPendingQueue();
        queue = queue.filter((item) => item.catalogObjectId !== catalogObjectId);
        queue.push(entry);
        writePendingQueue(queue);
        console.log('[SFMC AddToCart] pending saved for login', entry);
    } catch (e) {
        console.error('[SFMC AddToCart] failed to save pending', e);
    }
};
export const sendAddToCartEvent = (lineItemInput, source) => {
    const catalogObjectId = lineItemInput?.catalogObjectId;
    const price = parseAddToCartPrice(lineItemInput?.price);
    if (!catalogObjectId || price === null) {
        logAddToCartSkip(source, 'missing lineItem', {
            catalogObjectId,
            price: lineItemInput?.price,
        });
        return;
    }
    const validatedLineItem = buildValidatedLineItem(catalogObjectId, price);
    console.log('[SFMC AddToCart] sent', { source, ...validatedLineItem });
    const emailAddress = getUserEmail();
    const userPayload = {
        attributes: {
            ...(isUserLoggedIn() && { crmContact: true }),
            ultimo_produto_adicionado_carrinho: catalogObjectId,
            ultimo_preco_adicionado_carrinho: String(price),
            ultima_fonte_add_to_cart: source,
        },
    };
    if (emailAddress) {
        userPayload.identities = { emailAddress };
    }
    SalesforceInteractions.sendEvent({
        interaction: {
            name: SalesforceInteractions.CartInteractionName.AddToCart,
            lineItem: validatedLineItem,
        },
    });
    SalesforceInteractions.sendEvent({
        interaction: {
            name: 'add_to_cart',
            lineItem: validatedLineItem,
        },
        user: userPayload,
    });
    console.log('[SFMC AddToCart] add_to_cart trigger sent', {
        source,
        ...validatedLineItem,
    });
};
export const flushPendingAddToCart = () => {
    const queue = readPendingQueue();
    if (!queue.length) return;
    if (!isUserIdentified()) {
        console.log('[SFMC AddToCart] flush skipped - waiting for email', {
            usuarioLogado: isUserLoggedIn(),
            tbcAlunoEmail: (() => {
                try {
                    return Boolean(localStorage.getItem('tbcAlunoEmail'));
                } catch (e) {
                    return false;
                }
            })(),
            knownEmail: Boolean(getUserEmail()),
        });
        return;
    }
    clearPendingQueue();
    const now = Date.now();
    queue.forEach((pending) => {
        if (now - pending.savedAt > PENDING_ADD_TO_CART_TTL_MS) {
            logAddToCartSkip(
                pending.source || 'pending_flush',
                'pending expired',
                pending,
            );
            return;
        }
        sendAddToCartEvent(pending, pending.source || 'pending_flush');
    });
};
export const scheduleFlushPendingAddToCart = (attempt = 0) => {
    const maxAttempts = 30;
    setTimeout(() => {
        const queue = readPendingQueue();
        if (!queue.length) return;
        if (isUserIdentified()) {
            flushPendingAddToCart();
            return;
        }
        if (attempt < maxAttempts) {
            scheduleFlushPendingAddToCart(attempt + 1);
            return;
        }
        console.log('[SFMC AddToCart] flush gave up waiting for user email', {
            usuarioLogado: isUserLoggedIn(),
            pendingCount: queue.length,
        });
    }, 1e3);
};
export const startPendingAddToCartWatcher = () => {
    setInterval(() => {
        try {
            const queue = readPendingQueue();
            if (!queue.length) return;
            if (isUserIdentified()) flushPendingAddToCart();
        } catch (e) {}
    }, 2e3);
};
export const sendAddToCartOnce = (lineItemInput, source) => {
    const catalogObjectId = lineItemInput?.catalogObjectId;
    const price = parseAddToCartPrice(lineItemInput?.price);
    if (!catalogObjectId || price === null) {
        logAddToCartSkip(source, 'missing lineItem', {
            catalogObjectId,
            price: lineItemInput?.price,
        });
        return;
    }
    const dedupKey = getAddToCartDedupKey(catalogObjectId);
    if (wasAddToCartRecentlySent(dedupKey)) {
        logAddToCartSkip(source, 'duplicate', { catalogObjectId, price });
        return;
    }
    markAddToCartSent(dedupKey, catalogObjectId);
    markAddToCartSent(getAbandonmentKey(catalogObjectId), catalogObjectId);
    if (!isUserIdentified()) {
        savePendingAddToCart(lineItemInput, source);
        return;
    }
    sendAddToCartEvent(lineItemInput, source);
};
export const triggerCoachingAddToCart = async () => {
    if (!isCoachingCheckoutPage()) return;
    captureLastCoachingProductFromDataLayer();
    const saved = readLastCoachingProduct();
    if (!saved || !saved.catalogObjectId || saved.price == null) {
        logAddToCartSkip(
            'coaching_checkout',
            'missing saved product from productDetails_UA',
            saved,
        );
        return;
    }
    sendAddToCartOnce(
        {
            catalogObjectId: saved.catalogObjectId,
            price: saved.price,
        },
        'coaching_checkout',
    );
};
