import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'Sua Aprovacao',
    isMatch: () => {
        return (
            window.location.hostname === 'concursos.grancursosonline.com.br' &&
            window.location.pathname.includes('sua-aprovacao')
        );
    },
    interaction: {
        name: 'Acessou Página Sua Aprovação',
    },
    listeners: [
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
                    eventName: '[Formulário] - Sua Aprovação',
                    emailAddress,
                });
                return;
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: '[Formulário] - Sua Aprovação',
                },
                user: {
                    identities: { emailAddress: userAttributes.emailAddress },
                    attributes: userAttributes,
                },
            });
        }),
    ],
};
