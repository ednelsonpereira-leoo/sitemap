import { getProductData } from "../utils/product.js";

export const CERTIFICADO = {
    DOWNLOAD: [
        '.flex-shrink-0.btn.btn-primary',
        '.flex-shrink-0.btn.btn-primary *',
    ],
};
export async function handleDownloadCertificado(e) {
    if (e.target.matches(CERTIFICADO.DOWNLOAD.join(','))) {
        let course = '';
        const selector = document.querySelector('p.g-Text.line-clamp-2');
        if (selector) {
            course = selector.textContent.trim();
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: 'web_click_logado_curso_livre_certificado',
                },
                user: {
                    attributes: {
                        curso_certificado_Baixado: course,
                    },
                },
            });
        }
    }
}

export const EBOOK_BTNS = {
    DOWNLOAD: [
        'a[href*="/site/ebooks/"][href$=".pdf"]',
        'button.group',
        'button.group *',
        'button:has(img[alt="Ebook do Curso"])',
        'button:has(img[alt="Ebook do Curso"]) *',
    ].join(', '),
};
export const GUIAS_BTNS = {
    DOWNLOAD: [
        'a[href*="/pos/guias/"][href$=".pdf"]',
        'button.group',
        'button.group *',
    ].join(', '),
};
export async function handlerGuiasDownload(e) {
    const currentHostname = window.location.hostname;
    const cleanUrl = window.location.origin + window.location.pathname;
    if (
        e.target.matches(GUIAS_BTNS.DOWNLOAD) &&
        currentHostname.startsWith('pos.')
    ) {
        const pathname = window.location.pathname;
        if (!pathname.includes('/mba')) {
            try {
                const productData = getProductData();
                const userAttributes = {
                    ultimo_guia_Baixado: productData.materialCurso,
                    id_curso_Baixado: productData.id,
                    tipo_curso_Baixado: productData.category,
                    nome_curso_Baixado: productData.variant,
                    ultimo_link_curso_guia_Baixado: cleanUrl,
                    ultimo_nome_coordenador_curso_guia_Baixado:
                    productData.coordinatorName,
                    ultima_imagem_coordenador_curso_guia_Baixado:
                    productData.coordinatorImg,
                    ultimo_link_video_curso_guia_Baixado: productData.linkVideo,
                };
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: 'web_click_baixou_guia_de_curso',
                    },
                    user: {
                        attributes: userAttributes,
                    },
                });
            } catch (e2) {
                throw new Error('Erro ao obter dados do Ebook: ' + e2.message);
            }
        }
    }
}
export async function handlerEbookDownload(e) {
    const currentHostname = window.location.hostname;
    if (
        e.target.matches(EBOOK_BTNS.DOWNLOAD) &&
        currentHostname.startsWith('faculdade.')
    ) {
        try {
            const productData = getProductData();
            const cleanUrl = window.location.origin + window.location.pathname;
            const userAttributes = {
                ultimo_guia_Baixado: productData.materialCurso,
                id_curso_Baixado: productData.id,
                tipo_curso_Baixado: productData.category,
                nome_curso_Baixado: productData.variant,
                ultimo_link_curso_guia_Baixado: cleanUrl,
                ultimo_nome_coordenador_curso_guia_Baixado:
                productData.coordinatorName,
                ultima_imagem_coordenador_curso_guia_Baixado:
                productData.coordinatorImg,
                ultimo_link_video_curso_guia_Baixado: productData.linkVideo,
            };
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: 'web_click_baixou_guia_de_curso',
                },
                user: {
                    attributes: userAttributes,
                },
            });
        } catch (err) {
            console.error(
                'Erro ao processar dados do Ebook (Faculdade):',
                err.message,
            );
        }
    }
}
