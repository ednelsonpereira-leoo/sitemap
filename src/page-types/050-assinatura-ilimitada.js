import { createListener, EVENTS } from "../utils/listener.js";
import { captureUserIdentity } from "../utils/identity.js";

export default {
    name: 'Assinatura Ilimitada',
    isMatch: () => /\/assinatura-ilimitada/.test(window.location.pathname),
    interaction: {
        name: 'Acessou Página Assinatura Ilimitada',
    },
    listeners: [
        createListener(EVENTS.click, '.btn-submit-newsletter', () => {
            captureUserIdentity(
                '[Formulário] - Assinatura Ilimitada',
                SalesforceInteractions.cashDom('#email-newsletter-footer').first().val(),
            );
        }),
    ],
};
