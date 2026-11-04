import { isValidCatalogId } from "./validation.js";

export const getUtmAttributes = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmAttributes = {};
    for (const [key, value] of urlParams.entries()) {
        if (key.toLowerCase().startsWith('utm_') && value) {
            utmAttributes[key] = value;
        }
    }
    return utmAttributes;
};
export const getPageTitle = () => {
    const title = (document.title || '').replace(/\s+/g, ' ').trim();
    return title || window.location.pathname || 'Sem título';
};
export const getPageCatalogType = () => {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    if (pathname === '/') return 'Home';
    if (/\/identificacao/.test(pathname)) return 'Login Page Type';
    if (/\/nossos-cursos\/?$/.test(pathname)) return 'Nossos Cursos';
    if (/\/meus-cursos\/?$/.test(pathname)) return 'Meus Cursos';
    if (/coaching\/checkout/.test(pathname)) return 'Coaching Checkout';
    if (/\/certificados\/?$/.test(pathname)) return 'Certificados';
    if (
        hostname === 'lp.grancursosonline.com.br' &&
        pathname.includes('a-hora-da-virada')
    )
        return 'A Hora da Virada';
    if (
        hostname === 'concursos.grancursosonline.com.br' &&
        pathname.includes('sua-aprovacao')
    )
        return 'Sua Aprovacao';
    if (/\/carrinho/.test(pathname)) return 'Cart';
    return 'default';
};
export const CATALOG_PAGE_TYPES = new Set(['Nossos Cursos', 'Meus Cursos']);
export const normalizeCatalogPageId = (pathname) => {
    const path = pathname || '/';
    if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
    return path;
};
export const handlePageView = () => {
    try {
        const pageTitle = getPageTitle();
        const pageId = normalizeCatalogPageId(window.location.pathname || '/');
        const utmAttributes = getUtmAttributes();
        const pageType = getPageCatalogType();
        const event = {
            interaction: {
                name: `Acessou Página - ${pageType}`,
            },
        };
        if (CATALOG_PAGE_TYPES.has(pageType) && isValidCatalogId(pageId)) {
            event.interaction.name =
                SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject;
            event.interaction.catalogObject = {
                type: 'Page',
                id: pageId,
                attributes: {
                    title: pageTitle,
                    pageUrl: window.location.origin + pageId,
                    type: pageType,
                },
            };
        }
        if (Object.keys(utmAttributes).length) {
            event.user = {
                attributes: utmAttributes,
            };
        }
        SalesforceInteractions.sendEvent(event);
    } catch (e) {
        console.error('Erro ao disparar PageView:', e.message);
    }
};
export const handleUtms = () => {
    try {
        const utmAttributes = getUtmAttributes();
        if (Object.keys(utmAttributes).length) {
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: 'Captura de UTMs',
                },
                user: {
                    attributes: utmAttributes,
                },
            });
        }
    } catch (e) {
        console.error('Erro ao capturar UTMs:', e.message);
    }
};
