import { isValidCatalogId } from "./validation.js";
import { parseAddToCartPrice } from "./add-to-cart.js";
import { getUserEmail, isUserLoggedIn } from "./user.js";

export const PURCHASE_DEDUP_WINDOW_MS = 30 * 1e3;
export const purchaseRecentKeys = new Map();
export const wasPurchaseRecentlySent = (key) => {
    const sentAt = purchaseRecentKeys.get(key);
    if (!sentAt) return false;
    if (Date.now() - sentAt > PURCHASE_DEDUP_WINDOW_MS) {
        purchaseRecentKeys.delete(key);
        return false;
    }
    return true;
};
export const markPurchaseSent = (key) => {
    purchaseRecentKeys.set(key, Date.now());
};
export const isAssinaturaPaymentItem = (item) => {
    const text =
        `${item?.item_name || ''} ${item?.item_variant || ''}`.toLowerCase();
    return text.includes('assinatura');
};
export const sendPurchaseFromPaymentInfo = (evt) => {
    const items = evt?.ecommerce?.items;
    if (!Array.isArray(items) || !items.length) {
        console.warn('[SFMC Purchase] skipped - no items', evt);
        return;
    }
    const lineItems = [];
    items.forEach((item) => {
        const rawId = item?.item_id;
        if (!isValidCatalogId(rawId)) {
            console.warn('[SFMC Purchase] skipped item without id', item);
            return;
        }
        const price = parseAddToCartPrice(item?.price);
        if (price === null) {
            console.warn('[SFMC Purchase] skipped item without price', {
                itemId: rawId,
            });
            return;
        }
        lineItems.push({
            catalogObjectType: 'Product',
            catalogObjectId: isAssinaturaPaymentItem(item)
                ? `A_${rawId}`
                : String(rawId),
            price,
            quantity: 1,
        });
    });
    if (!lineItems.length) {
        console.warn('[SFMC Purchase] skipped - no valid lineItems');
        return;
    }
    const signature = lineItems
        .map((item) => `${item.catalogObjectId}:${item.price}`)
        .join('|');
    const uniqueId = evt?.['gtm.uniqueEventId'];
    if (
        (uniqueId != null && wasPurchaseRecentlySent(`id|${uniqueId}`)) ||
        wasPurchaseRecentlySent(`sig|${signature}`)
    ) {
        console.log('[SFMC Purchase] skipped', {
            reason: 'duplicate',
            signature,
            uniqueId,
        });
        return;
    }
    if (uniqueId != null) markPurchaseSent(`id|${uniqueId}`);
    markPurchaseSent(`sig|${signature}`);
    const parsedValue = parseAddToCartPrice(evt?.ecommerce?.value);
    const totalValue =
        parsedValue !== null
            ? parsedValue
            : lineItems.reduce((sum, item) => sum + item.price, 0);
    const emailAddress = getUserEmail();
    const purchaseEvent = {
        interaction: {
            name: SalesforceInteractions.OrderInteractionName.Purchase,
            order: {
                id: Date.now(),
                lineItems,
                totalValue,
            },
        },
    };
    const attributes = {
        ...(isUserLoggedIn() && { crmContact: true }),
    };
    if (emailAddress || Object.keys(attributes).length) {
        purchaseEvent.user = { attributes };
        if (emailAddress) purchaseEvent.user.identities = { emailAddress };
    }
    console.log('[SFMC Purchase] sent', {
        source: 'add_payment_info',
        paymentType: evt?.ecommerce?.payment_type,
        order: purchaseEvent.interaction.order,
    });
    SalesforceInteractions.sendEvent(purchaseEvent);
};
