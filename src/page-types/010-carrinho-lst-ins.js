import { getLineItems, isCarrinhoLstInsPage } from "../utils/cart.js";

export default {
    name: 'default',
    isMatch: () => Promise.resolve(isCarrinhoLstInsPage()),
    interaction: {
        name: SalesforceInteractions.CartInteractionName.ReplaceCart,
        lineItems: getLineItems,
    },
};
