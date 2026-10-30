import { text } from "../utils/dom.js";

export default {
  name: "category",
  isMatch: () => /^\/categoria\//.test(window.location.pathname),
  interaction: {
    name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
    catalogObject: {
      type: "Category",
      id: () => window.location.pathname.split("/").filter(Boolean).pop(),
      attributes: { name: () => text("h1") },
    },
  },
};
