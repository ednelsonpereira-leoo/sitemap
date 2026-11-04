import { createListener, EVENTS } from "../utils/listener.js";
import { captureUserIdentity } from "../utils/identity.js";

export default {
    name: 'OAB',
    isMatch: () => /\/assinatura-oab-ate-passar/.test(window.location.pathname),
    interaction: {
        name: 'Acessou Página OAB',
    },
    listeners: [
        createListener(EVENTS.click, '.btn-submit-newsletter', () => {
            captureUserIdentity(
                '[Formulário] - OAB',
                SalesforceInteractions.cashDom('#email-newsletter-footer').first().val(),
            );
        }),
    ],
};
