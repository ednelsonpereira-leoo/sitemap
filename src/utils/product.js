import { saveLastCoachingProduct } from "./coaching.js";

export const getEbook = () => {
    const guiaMba = document.querySelector('a.LateralMba_baixeoGuia__mY9Yp');
    const guiaPos = document.querySelector(
        'a[href*="/pos/guias/"][href$=".pdf"]',
    );
    if (guiaMba) {
        return guiaMba.href;
    } else if (guiaPos) {
        return guiaPos.href;
    } else {
        return null;
    }
};
export const getVideoLink = () => {
    const iframeDoVideo = document.querySelector(
        'iframe[src*="youtube.com/embed/"]',
    );
    if (iframeDoVideo) {
        return iframeDoVideo.src;
    }
    return null;
};
export const getCoordinatorData = () => {
    const currentHostname = window.location.hostname;
    const coordinatorData = {};
    if (currentHostname.startsWith('faculdade.')) {
        const secaoCoordenador = document.getElementById('coordinator');
        if (secaoCoordenador) {
            const imagemCoordenador = secaoCoordenador.querySelector('img[srcset]');
            const nomeCoordenadorEl = secaoCoordenador.querySelector('h4');
            const nomeCoordenador = nomeCoordenadorEl
                ? nomeCoordenadorEl.textContent.trim()
                : null;
            if (nomeCoordenador) coordinatorData.coordinatorName = nomeCoordenador;
            const urlImagemSrcset = imagemCoordenador
                ? imagemCoordenador.srcset
                : null;
            if (urlImagemSrcset) {
                const primeiraUrlInfo = urlImagemSrcset.split(',')[0].trim();
                const urlRelativa = primeiraUrlInfo.split(' ')[0];
                const urlAbsoluta = new URL(urlRelativa, window.location.origin).href;
                coordinatorData.coordinatorImg = urlAbsoluta;
            }
        }
    } else if (currentHostname.startsWith('pos.')) {
        const secaoProfessores = document.getElementById('heading-professores');
        if (secaoProfessores) {
            const imagemDiv = secaoProfessores.querySelector(
                'div[style*="background-image"]',
            );
            const nomeDiv = secaoProfessores.querySelector(
                '.fs-6.text-color-dark-900.font-weight-600',
            );
            const nomeDivDark = secaoProfessores.querySelector(
                '.fs-6.text-color-light-0.font-weight-600',
            );
            if (imagemDiv) {
                const styleAttr = imagemDiv.style.backgroundImage;
                const match = styleAttr.match(/url\("?(.+?)"?\)/);
                if (match && match[1]) {
                    coordinatorData.coordinatorImg = match[1];
                }
            }
            if (nomeDivDark) {
                coordinatorData.coordinatorName = nomeDivDark.textContent.trim();
            } else {
                coordinatorData.coordinatorName = nomeDiv.textContent.trim();
            }
        }
    }
    return coordinatorData;
};
export const getProductData = () => {
    try {
        if (!window.dataLayer || !Array.isArray(window.dataLayer)) {
            return {};
        }
        const dataLayerObject = window.dataLayer
            .slice()
            .reverse()
            .find((item) => item && item.event === 'productDetails_UA');
        if (!dataLayerObject) {
            return {};
        }
        const productData = {};
        const currentHostname = window.location.hostname;
        const ecommerce = dataLayerObject?.ecommerce || {};
        const productDetailsPath =
            ecommerce.detail?.products?.[0] || ecommerce.click?.products?.[0];
        const listPath =
            ecommerce.detail?.actionField || ecommerce.click?.actionField;
        const id = productDetailsPath?.id;
        const category = productDetailsPath?.category;
        const name = productDetailsPath?.name;
        const brand = productDetailsPath?.brand;
        const variant = productDetailsPath?.variant;
        const price = productDetailsPath?.price;
        const installments = productDetailsPath?.installments;
        const original_price = productDetailsPath?.original_price;
        const materialCurso = productDetailsPath?.ebookUrl;
        let list = listPath?.list;
        if (!list && !currentHostname.startsWith('pos.')) {
            list = productDetailsPath?.list;
        }
        if (id) productData.id = id;
        if (category) productData.category = category;
        if (name) productData.name = name;
        if (brand) productData.brand = brand;
        if (variant) productData.variant = variant;
        if (list) productData.list = list;
        if (price) productData.price = price;
        if (installments) productData.installments = installments;
        if (original_price) productData.original_price = original_price;
        if (materialCurso) productData.materialCurso = materialCurso;
        const coordinatorData = getCoordinatorData();
        if (coordinatorData.coordinatorName)
            productData.coordinatorName = coordinatorData.coordinatorName;
        if (coordinatorData.coordinatorImg)
            productData.coordinatorImg = coordinatorData.coordinatorImg;
        const videoLink = getVideoLink();
        if (videoLink) productData.linkVideo = videoLink;
        if (!materialCurso) {
            const materialCurso2 = getEbook();
            productData.materialCurso = materialCurso2;
        }
        saveLastCoachingProduct(productData);
        return productData;
    } catch (e) {
        console.error('Erro ao obter os dados do produto:', e.message);
        return {};
    }
};
