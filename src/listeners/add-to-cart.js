// Um arquivo de listeners exporta um array de SalesforceInteractions.listener(...).
import { productFromPage } from "../utils/catalog.js";

export default [
  SalesforceInteractions.listener("click", "#add-to-cart", () => {
    const p = productFromPage();
    SalesforceInteractions.sendEvent({
      interaction: {
        name: SalesforceInteractions.CartInteractionName.AddToCart,
        lineItem: {
          catalogObjectType: "Product",
          catalogObjectId: p.id,
          price: p.price,
          quantity: 1,
        },
      },
    });
  }),
];
