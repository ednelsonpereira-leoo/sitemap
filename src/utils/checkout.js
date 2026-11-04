import { isCoachingCheckoutPage, readLastCoachingProduct } from "./coaching.js";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const getReplaceLineItems = async () => {
    try {
        const savedCoachingProduct = isCoachingCheckoutPage()
            ? readLastCoachingProduct()
            : null;
        if (
            savedCoachingProduct &&
            savedCoachingProduct.catalogObjectId &&
            savedCoachingProduct.price != null
        ) {
            return [
                {
                    catalogObjectType: 'Product',
                    catalogObjectId: String(savedCoachingProduct.catalogObjectId),
                    price: savedCoachingProduct.price,
                    quantity: 1,
                },
            ];
        }
        let productId = null;
        let price = null;
        const pathname = window.location.pathname;
        const regexId = /\/checkout\/(\d+)/;
        const matchId = pathname.match(regexId);
        if (matchId && matchId[1]) {
            productId = matchId[1];
        } else {
            console.warn(
                'AVISO: ID do Produto n\xE3o encontrado na URL. Padr\xE3o /checkout/(\\d+) n\xE3o correspondido.',
            );
        }
        const maxAttempts = 3;
        const retryDelay = 500;
        const seletorOpcaoAVista = '#opt-nr-parcelas option[value="1"]';
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const opcaoAVista = document.querySelector(seletorOpcaoAVista);
            if (opcaoAVista) {
                const textoCompleto = opcaoAVista.textContent;
                const regexValor = /R\$\s*([\d\.\,]+)/;
                const matchValor = textoCompleto.match(regexValor);
                if (matchValor && matchValor[1]) {
                    price = matchValor[1].trim().replace(',', '.');
                    break;
                }
            }
            if (!price && attempt < maxAttempts) {
                await delay(retryDelay);
            } else if (!price && attempt === maxAttempts) {
                console.warn(
                    `AVISO: A extra\xE7\xE3o do pre\xE7o falhou ap\xF3s ${maxAttempts} tentativas.`,
                );
            }
        }
        if (productId && price) {
            const lineItemsData = {
                catalogObjectType: 'Product',
                catalogObjectId: productId,
                price,
                quantity: 1,
            };
            return [lineItemsData];
        }
        console.error(
            'ERRO: N\xE3o foi poss\xEDvel gerar o line item (ID ou Pre\xE7o ausente).',
        );
        return [];
    } catch (e) {
        console.error('Erro ao gerar line items para ReplaceCart:', e.message);
        return [];
    }
};
