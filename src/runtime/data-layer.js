import { getProductFromDetailsEvent, saveLastCoachingProduct } from "../utils/coaching.js";
import { logAddToCartSkip, parseAddToCartPrice, sendAddToCartOnce, wasPlanIdRecentlySent } from "../utils/add-to-cart.js";
import { handleAssinaturas } from "../utils/assinaturas.js";
import { sendPurchaseFromPaymentInfo } from "../utils/purchase.js";
import { isValidCatalogId } from "../utils/validation.js";
import { handleDownloadCertificado, handlerEbookDownload, handlerGuiasDownload } from "./click-handlers.js";

function monitorDataLayer(intervalDelay, events) {
    const state = (window._DataLayerMonitoringState = {
        events,
        lastIndex: 0,
        interval: null,
    });
    state.interval = setInterval(function () {
        const dl = window.dataLayer;
        if (!dl) return;
        for (let i = state.lastIndex; i < dl.length; i++) {
            const eventName = dl[i] ? dl[i].event : null;
            if (!eventName) continue;
            const cb = events[eventName];
            if (!cb) continue;
            cb(dl[i]);
        }
        state.lastIndex = dl.length;
    }, intervalDelay);
}

export function startDataLayerMonitor() {
    let cronogramaName = '';
    let cursosArray = [];
    monitorDataLayer(1e3, {
        productDetails_UA: (evt) => {
            saveLastCoachingProduct(getProductFromDetailsEvent(evt));
        },
        addToCart: (evt) => {
            const plan = evt.product?.plan;
            if (!plan?.id) {
                logAddToCartSkip('addToCart', 'no plan.id');
                return;
            }
            const price = parseAddToCartPrice(plan.price ?? evt.product?.price);
            if (price === null) {
                logAddToCartSkip('addToCart', 'missing price', { planId: plan.id });
                return;
            }
            sendAddToCartOnce(
                {
                    catalogObjectId: `A_${plan.id}`,
                    price,
                },
                'addToCart',
            );
        },
        addToCart_UA: (evt) => {
            const product = evt.ecommerce?.add?.products?.[0];
            if (!product?.id) {
                logAddToCartSkip('addToCart_UA', 'missing product.id');
                return;
            }
            const plan = evt.product?.plan || product.plan;
            const planId = plan?.id;
            if (wasPlanIdRecentlySent(planId || product.id)) {
                logAddToCartSkip('addToCart_UA', 'already sent via plan', {
                    productId: product.id,
                    planId,
                });
                return;
            }
            const price = parseAddToCartPrice(plan?.price ?? product.price);
            if (price === null) {
                logAddToCartSkip('addToCart_UA', 'missing price', {
                    productId: product.id,
                });
                return;
            }
            sendAddToCartOnce(
                {
                    catalogObjectId: planId ? `A_${planId}` : String(product.id),
                    price,
                },
                'addToCart_UA',
            );
        },
        // Impressions for Assinatura Ilimitada, OAB e Residencial Multiprofissional pages
        productImpressions_UA: (evt) => {
            const pathname = window.location.pathname;
            const pageMap = [
                {
                    name: 'Assinatura Ilimitada',
                    regex: /^\/assinatura-ilimitada(\/?$|$)/,
                    action: (eventData) => {
                        const impressoesCapturadas =
                            eventData?.ecommerce?.impressions || [];
                        handleAssinaturas(impressoesCapturadas);
                    },
                },
                {
                    name: 'OAB At\xE9 Passar',
                    regex: /^\/assinatura-oab-ate-passar(\/?$|$)/,
                    action: (eventData) => {
                        const impression = eventData?.ecommerce?.impressions?.[1];
                        const impressoesCapturadas = impression ? [impression] : [];
                        handleAssinaturas(impressoesCapturadas);
                    },
                },
                {
                    name: 'Residencia Multiprofissional',
                    regex: /^\/assinatura-residencia-multiprofissional(\/?$|$)/,
                    action: (eventData) => {
                        const impression = eventData?.ecommerce?.impressions?.[1];
                        const impressoesCapturadas = impression ? [impression] : [];
                        handleAssinaturas(impressoesCapturadas);
                    },
                },
            ];
            pageMap.forEach((page) => {
                const isMatch = page.regex.test(pathname);
                if (isMatch) {
                    page.action(evt);
                }
            });
        },
        /**
         *  Purchase a partir do add_payment_info (GA4)
         */
        add_payment_info: (evt) => {
            sendPurchaseFromPaymentInfo(evt);
        },
        /**
         *  Evento de Purchase
         */
        purchase_UA: (evt) => {
            const dataLayerPurchaseEvent = window.dataLayer
                .toReversed()
                .find((item) => item && item.event == 'purchase_UA');
            if (!dataLayerPurchaseEvent?.ecommerce?.purchase?.products) return;
            const cartLineItems = [];
            const id = new Date().getTime();
            dataLayerPurchaseEvent.ecommerce.purchase.products.forEach(
                (product) => {
                    if (!isValidCatalogId(product?.id)) {
                        console.warn('[Purchase] skipped product without id', product);
                        return;
                    }
                    const name = String(product.name || '');
                    cartLineItems.push({
                        catalogObjectType: 'Product',
                        catalogObjectId: name.toLowerCase().includes('assinatura')
                            ? `A_${product.id}`
                            : product.id,
                        price: product.price,
                        quantity: 1,
                    });
                },
            );
            if (!cartLineItems.length) {
                console.warn('[Purchase] skipped - no valid lineItems');
                return;
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: SalesforceInteractions.OrderInteractionName.Purchase,
                    order: {
                        id,
                        lineItems: cartLineItems,
                        totalValue: 0,
                    },
                },
            });
        },
        /**
         *  Os eventos de Cronograma são controlados via monitoramento do Data Layer
         *  A cada interação é adicionado um evento e a coleta de dados ocorre quando as condições de cada evento são atendidas.
         */
        // Cronograma
        home_criar: (evt) => {
            cursosArray = [];
            cronogramaName = '';
        },
        criar_cursos_add: (evt) => {
            const nomeDoCurso = evt.eventProperties?.name;
            if (nomeDoCurso && !cursosArray.includes(nomeDoCurso)) {
                cursosArray.push(nomeDoCurso);
            }
        },
        criar_cursos_remove: (evt) => {
            const nomeDoCurso = evt.eventProperties?.name;
            if (nomeDoCurso) {
                cursosArray = cursosArray.filter((curso) => curso !== nomeDoCurso);
            }
        },
        criar_finish: (evt) => {
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: 'criou_cronograma_cursos',
                },
                user: {
                    attributes: {
                        cursos_cronograma_Estudo: cursosArray,
                        nome_cronograma_Estudo: cronogramaName,
                    },
                },
            });
        },
    });
    const CONTINUAR = {
        CLICK: ['button.cr-bg-primary-70', 'button.cr-bg-primary-70 *'],
    };
    const handlerCronogramaName = (e) => {
        const pathname = window.location.pathname;
        if (
            e.target.matches(CONTINUAR.CLICK) &&
            /^\/aluno\/cronograma\/criar\/configuracoes$/.test(pathname)
        ) {
            const inputNameElement = document.querySelector("input[name='nome']");
            if (inputNameElement) {
                cronogramaName = inputNameElement.value;
            }
        }
    };
    setTimeout(() => {
        document.body.removeEventListener('click', handlerCronogramaName, true);
        document.body.addEventListener('click', handlerCronogramaName, true);
        document.body.removeEventListener('click', handlerGuiasDownload, true);
        document.body.addEventListener('click', handlerGuiasDownload, true);
        document.body.removeEventListener('click', handlerEbookDownload, true);
        document.body.addEventListener('click', handlerEbookDownload, true);
        document.body.removeEventListener(
            'click',
            handleDownloadCertificado,
            true,
        );
        document.body.addEventListener('click', handleDownloadCertificado, true);
    }, 500);
}
