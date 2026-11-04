import { getReplaceLineItems } from "../utils/checkout.js";

export default {
    name: 'Coaching Checkout',
    isMatch: () => /coaching\/checkout/.test(window.location.pathname),
    interaction: {
        name: SalesforceInteractions.CartInteractionName.ReplaceCart,
        lineItems: getReplaceLineItems,
    },
};
