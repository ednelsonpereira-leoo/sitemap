import { isValidCatalogId } from "./validation.js";

export const getRemovePayload = () => {
    try {
        const dataLayerObject = window.dataLayer
            .slice()
            .reverse()
            .find((item) => item && item.event === 'checkout_UA');
        if (
            !dataLayerObject ||
            !dataLayerObject.ecommerce ||
            !dataLayerObject.ecommerce.checkout ||
            !dataLayerObject.ecommerce.checkout.products ||
            dataLayerObject.ecommerce.checkout.products.length < 1
        )
            return null;
        const products = dataLayerObject.ecommerce.checkout.products[0];
        if (!products || !isValidCatalogId(products.id)) {
            console.warn(
                "Evento 'checkout_UA' encontrado, mas sem produtos válidos no carrinho.",
            );
            return null;
        }
        return {
            catalogObjectType: 'Product',
            catalogObjectId: products.id,
            price: products.price,
            quantity: 1,
        };
    } catch (e) {
        console.error('Erro ao obter os line items do carrinho:', e.message);
        return null;
    }
};
export const getLineItems = () => {
    try {
        const dataLayerObject = window.dataLayer
            .slice()
            .reverse()
            .find((item) => item && item.event === 'checkout_UA');
        if (
            !dataLayerObject ||
            !dataLayerObject.ecommerce ||
            !dataLayerObject.ecommerce.checkout ||
            !dataLayerObject.ecommerce.checkout.products
        )
            return [];
        const products = dataLayerObject.ecommerce.checkout.products;
        if (!products || products.length === 0) {
            console.warn(
                "Evento 'checkout_UA' encontrado, mas sem produtos no carrinho.",
            );
            return [];
        }
        return products
            .filter((produto) => produto && isValidCatalogId(produto.id))
            .map((produto) => ({
                catalogObjectType: 'Product',
                catalogObjectId: produto.id,
                price: produto.price,
                quantity: 1,
            }));
    } catch (e) {
        console.error('Erro ao obter os line items do carrinho:', e.message);
        return [];
    }
};
export const isCarrinhoLstInsPage = () =>
    /\/carrinho\/index\/lstIns\//.test(window.location.pathname);
