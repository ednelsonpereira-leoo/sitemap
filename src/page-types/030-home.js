import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'Home',
    isMatch: () => window.location.pathname === '/',
    interaction: {
        name: () => {
            const { hostname, pathname, origin } = window.location;
            const isMainDomainHome =
                origin + pathname === 'https://www.grancursosonline.com.br/';
            if (isMainDomainHome) {
                return 'web_pageview_preparatorio';
            } else if (hostname.startsWith('faculdade.')) {
                return 'web_pageview_graduacao';
            } else if (hostname.startsWith('pos.')) {
                return 'web_pageview_pos';
            } else {
                return 'web_pageview_home';
            }
        },
    },
    listeners: [
        window.location.hostname.replace(/^www\./, '').startsWith('grancursosonline.') ?
            createListener(EVENTS.click, "#btn-submit", () => {
                const name = SalesforceInteractions.cashDom(
                    '#sugestao-nome'
                )
                    .first()
                    .val();
                const emailAddress = SalesforceInteractions.cashDom(
                    '#sugestao-email'
                )
                    .first()
                    .val();
                const phone = SalesforceInteractions.cashDom(
                    '#sugestao-telefone'
                )
                    .first()
                    .val();
                const userAttributes = {};
                if (name) {
                    userAttributes.name = name.trim();
                }
                if (looksLikeEmail(emailAddress)) {
                    userAttributes.emailAddress = String(emailAddress).trim();
                    rememberUserEmail(userAttributes.emailAddress);
                }
                if (phone) {
                    userAttributes.telephone = phone.trim();
                }
                if (!looksLikeEmail(userAttributes.emailAddress)) {
                    console.warn('[SFMC] lead skipped - email does not look valid', {
                        eventName: 'Envio de Formul\xE1rio - Sua Aprova\xE7\xE3o',
                        emailAddress,
                    });
                    return;
                }
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: '[Formulário] - Deseja receber novidades sobre concursos?',
                    },
                    user: {
                        identities: { emailAddress: userAttributes.emailAddress },
                        attributes: userAttributes,
                    },
                });
            })
            :
            createListener(EVENTS.click, "form.hs-form button[type='submit']", () => {
                const name = SalesforceInteractions.cashDom(
                    "form.hs-form input[name='nome']",
                )
                    .first()
                    .val();
                const emailAddress = SalesforceInteractions.cashDom(
                    "form.hs-form input[name='email']",
                )
                    .first()
                    .val();
                const phoneInput = SalesforceInteractions.cashDom(
                    "form.hs-form input[data-phone-input='numero_de_celular']",
                )
                    .first()
                    .val();
                const userAttributes = {};
                if (name) {
                    userAttributes.name = name.trim();
                }
                if (looksLikeEmail(emailAddress)) {
                    userAttributes.emailAddress = String(emailAddress).trim();
                    rememberUserEmail(userAttributes.emailAddress);
                }
                if (phoneInput) {
                    userAttributes.telephone = `55${phoneInput.replace(/[()\-\s]+/g, '')}`;
                }
                if (!looksLikeEmail(userAttributes.emailAddress)) {
                    console.warn('[SFMC] lead skipped - email does not look valid', {
                        eventName: 'Envio de Formul\xE1rio - Sua Aprova\xE7\xE3o',
                        emailAddress,
                    });
                    return;
                }
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: (() => {
                            const { hostname } = window.location;
                            if (hostname.startsWith('faculdade.')) {
                                return '[Formulário] - Graduação';
                            }
                            if (hostname.startsWith('pos.')) {
                                return '[Formulário] - Pós-Graduação';
                            }
                            return 'Envio de Formulário - Sua Aprovação';
                        })(),
                    },

                    user: {
                        identities: { emailAddress: userAttributes.emailAddress },
                        attributes: userAttributes,
                    },
                });
            })
    ],
    contentZones: [
        { name: 'home-hero-banner', selector: '#lotes' },
        { name: 'carrossel_professores', selector: '.slick-track' },
        { name: 'carrossel_lives', selector: '.row.pl-3.pr-3' },
    ],
};
