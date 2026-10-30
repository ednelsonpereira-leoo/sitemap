import { attr } from "./dom.js";

// Fonte única dos dados de produto na página. Mudou o HTML do site? Ajusta só aqui.
export function productFromPage() {
  const root = "[data-product-id]";
  return {
    id: attr(root, "data-product-id"),
    name: attr(root, "data-product-name"),
    category: attr(root, "data-product-category"),
    price: Number(attr(root, "data-product-price")) || undefined,
  };
}
