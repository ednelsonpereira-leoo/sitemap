import { isValidCatalogId } from "./validation.js";

export const handleAssinaturas = (impressoes) => {
    (impressoes || []).forEach((produto) => {
        if (!produto || !isValidCatalogId(produto.id)) {
            console.warn(
                '[SFMC ViewCatalogObject] skipped assinatura impression without id',
                produto,
            );
            return;
        }
        const related = {};
        if (produto.brand) related.Brand = [produto.brand];
        if (produto.category) related.Category = [produto.category];
        if (produto.list) related.List = [produto.list];
        if (produto.name) related.TipoCurso = [produto.name];
        const attributes = {
            url: window.location.origin + window.location.pathname,
        };
        if (produto.variant) attributes.name = produto.variant;
        if (produto.price) attributes.price = produto.price;
        if (produto.original_price) attributes.listPrice = produto.original_price;
        if (produto.installments)
            attributes.quantidadeParcelas = produto.installments;
        SalesforceInteractions.sendEvent({
            interaction: {
                name: SalesforceInteractions.CatalogObjectInteractionName
                    .ViewCatalogObject,
                catalogObject: {
                    type: 'Product',
                    id: `A_${produto.id}`,
                    relatedCatalogObjects: related,
                    attributes,
                },
            },
        });
    });
};
