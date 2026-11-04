import { createListener, EVENTS } from "../utils/listener.js";
import { getLineItems, getRemovePayload, isCarrinhoLstInsPage } from "../utils/cart.js";
import { isValidLineItem } from "../utils/validation.js";

export default {
    name: 'Cart',
    isMatch: () =>
        new Promise((resolve) => {
            const isAssinaturaPage = window.location.pathname.includes('carrinho');
            if (!isAssinaturaPage || isCarrinhoLstInsPage()) {
                resolve(false);
                return;
            }
            let attempts = 0;
            const maxAttempts = 10;
            const timer = setInterval(() => {
                attempts++;
                let dataLayerObject = null;
                if (window.dataLayer) {
                    dataLayerObject = window.dataLayer.find(
                        (item) => item && item.event === 'checkout_UA',
                    );
                }
                if (dataLayerObject) {
                    clearInterval(timer);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    resolve(false);
                }
            }, 500);
        }),
    interaction: {
        name: SalesforceInteractions.CartInteractionName.ReplaceCart,
        lineItems: getLineItems,
    },
    listeners: [
        createListener(EVENTS.click, 'button[data-eec-remove]', () => {
            const productData = getRemovePayload();
            if (!isValidLineItem(productData)) {
                console.warn(
                    '[SFMC RemoveFromCart] skipped - invalid lineItem',
                    productData,
                );
                return;
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: SalesforceInteractions.CartInteractionName.RemoveFromCart,
                    lineItem: productData,
                },
                user: {
                    attributes: {
                        ultimo_produto_removido_Carrinho: productData.catalogObjectId,
                    },
                },
            });
        }),
    ],
};
