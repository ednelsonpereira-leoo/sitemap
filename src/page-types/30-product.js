import { productFromPage } from "../utils/catalog.js";

export default {
  name: "product_detail",
  isMatch: () => !!document.querySelector("[data-product-id]"),
  interaction: {
    name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
    catalogObject: {
      type: "Product",
      id: () => productFromPage().id,
      attributes: {
        name: () => productFromPage().name,
        price: () => productFromPage().price,
        url: () => window.location.href,
      },
      relatedCatalogObjects: { Category: () => [productFromPage().category] },
    },
  },
  contentZones: [{ name: "product_recommendations", selector: "#product-recommendations" }],
};
