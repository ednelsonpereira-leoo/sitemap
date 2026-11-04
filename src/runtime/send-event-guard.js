import { isValidCatalogId, isValidLineItem, LEAD_CAPTURE_EVENTS, looksLikeEmail } from "../utils/validation.js";

export function installSendEventGuard() {
    SalesforceInteractions.sendEvent = ((originalSendEvent) => {
        return (event) => {
            const interaction = event?.interaction || {};
            const catalogId = interaction.catalogObject?.id;
            if (interaction.catalogObject && !isValidCatalogId(catalogId)) {
                console.warn('[SFMC sendEvent] skipped - invalid catalogObject.id', {
                    name: interaction.name,
                    id: catalogId,
                    payload: event,
                });
                return;
            }
            const isCartLineItemAction =
                interaction.name ===
                SalesforceInteractions.CartInteractionName.AddToCart ||
                interaction.name ===
                SalesforceInteractions.CartInteractionName.RemoveFromCart;
            if (isCartLineItemAction && !isValidLineItem(interaction.lineItem)) {
                console.warn(
                    '[SFMC sendEvent] skipped - cart action missing valid lineItem',
                    {
                        name: interaction.name,
                        lineItem: interaction.lineItem,
                        payload: event,
                    },
                );
                return;
            }
            if (
                interaction.lineItem !== undefined &&
                !isValidLineItem(interaction.lineItem)
            ) {
                console.warn('[SFMC sendEvent] skipped - invalid lineItem', {
                    name: interaction.name,
                    lineItem: interaction.lineItem,
                    payload: event,
                });
                return;
            }
            if (Array.isArray(interaction.lineItems)) {
                interaction.lineItems = interaction.lineItems.filter(isValidLineItem);
            }
            if (interaction.order?.lineItems) {
                interaction.order.lineItems =
                    interaction.order.lineItems.filter(isValidLineItem);
                if (!interaction.order.lineItems.length) {
                    console.warn(
                        '[SFMC sendEvent] skipped - purchase without valid lineItems',
                        {
                            name: interaction.name,
                            payload: event,
                        },
                    );
                    return;
                }
            }
            const user = event?.user;
            if (
                user?.identities &&
                user.identities.emailAddress !== undefined &&
                !looksLikeEmail(user.identities.emailAddress)
            ) {
                console.warn('[SFMC sendEvent] stripped invalid email identity', {
                    name: interaction.name,
                    emailAddress: user.identities.emailAddress,
                });
                delete user.identities.emailAddress;
                if (!Object.keys(user.identities).length) delete user.identities;
            }
            if (
                user?.attributes &&
                user.attributes.emailAddress !== undefined &&
                !looksLikeEmail(user.attributes.emailAddress)
            ) {
                console.warn('[SFMC sendEvent] stripped invalid email attribute', {
                    name: interaction.name,
                    emailAddress: user.attributes.emailAddress,
                });
                delete user.attributes.emailAddress;
            }
            const capturedEmail =
                user?.identities?.emailAddress || user?.attributes?.emailAddress;
            if (
                LEAD_CAPTURE_EVENTS.has(interaction.name) &&
                !looksLikeEmail(capturedEmail)
            ) {
                console.warn(
                    '[SFMC sendEvent] skipped lead - email does not look valid',
                    {
                        name: interaction.name,
                        payload: event,
                    },
                );
                return;
            }
            console.log('[SFMC sendEvent]', {
                name: interaction.name,
                lineItem: interaction.lineItem,
                lineItems: interaction.lineItems,
                catalogObject: interaction.catalogObject,
                user: event?.user,
                payload: event,
            });
            return originalSendEvent(event);
        };
    })(SalesforceInteractions.sendEvent);
}
