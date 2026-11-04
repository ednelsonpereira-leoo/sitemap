import { getProductData } from "../utils/product.js";
import { isValidCatalogId } from "../utils/validation.js";

export default {
    name: 'Product',
    isMatch: () =>
        new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10;
            const timer = setInterval(() => {
                attempts++;
                const productId = getProductData()?.id;
                if (isValidCatalogId(productId)) {
                    clearInterval(timer);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    resolve(false);
                }
            }, 500);
        }),
    interaction: {
        name: SalesforceInteractions.CatalogObjectInteractionName
            .ViewCatalogObject,
        catalogObject: {
            type: 'Product',
            id: SalesforceInteractions.util.resolveWhenTrue.bind(() => {
                try {
                    const productData = getProductData();
                    if (!productData.id) return false;
                    const isAssinatura =
                        window.location.pathname.includes('assinatura') ||
                        (productData.category &&
                            productData.category.toLowerCase().includes('assinatura'));
                    return isAssinatura
                        ? `A_${productData.id}`
                        : String(productData.id);
                } catch (e) {
                    return false;
                }
            }),
            relatedCatalogObjects: () => {
                const productData = getProductData();
                const related = {};
                if (productData.name) related.TipoCurso = [productData.name];
                if (productData.brand) related.Brand = [productData.brand];
                if (productData.list) related.List = [productData.list];
                if (productData.category) related.Category = [productData.category];
                return related;
            },
            attributes: () => {
                const productData = getProductData();
                const cleanUrl = window.location.origin + window.location.pathname;
                return {
                    url: cleanUrl,
                    ...(productData.linkVideo && { linkVideo: productData.linkVideo }),
                    ...(productData.variant && { name: productData.variant }),
                    ...(productData.price && { price: productData.price }),
                    ...(productData.coordinatorImg && {
                        coordenadorCurso: productData.coordinatorImg,
                    }),
                    ...(productData.coordinatorName && {
                        coordenadorNome: productData.coordinatorName,
                    }),
                    ...(productData.materialCurso && {
                        materialCurso: productData.materialCurso,
                    }),
                    ...(productData.original_price && {
                        listPrice: productData.original_price,
                    }),
                    ...(productData.installments && {
                        quantidadeParcelas: productData.installments,
                    }),
                };
            },
        },
    },
};
