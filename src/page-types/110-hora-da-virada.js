import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'A Hora da Virada',
    isMatch: () => {
        return (
            window.location.hostname === 'lp.grancursosonline.com.br' &&
            window.location.pathname.includes('a-hora-da-virada')
        );
    },
    interaction: {
        name: 'Acessou Página A Hora da Virada',
    },
    listeners: [
        createListener(
            EVENTS.click,
            "#hero-form-form button[type='submit']",
            () => {
                const name = SalesforceInteractions.cashDom(
                    "#hero-form-form input[name='nome']",
                )
                    .first()
                    .val();
                const emailAddress = SalesforceInteractions.cashDom(
                    "#hero-form-form input[name='email']",
                )
                    .first()
                    .val();
                const phoneInput = SalesforceInteractions.cashDom(
                    "#hero-form-form input[data-phone-input='numero_de_celular']",
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
                        eventName: '[Formulário] - A Hora da Virada',
                        emailAddress,
                    });
                    return;
                }
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: '[Formulário] - A Hora da Virada',
                    },
                    user: {
                        identities: { emailAddress: userAttributes.emailAddress },
                        attributes: userAttributes,
                    },
                });
            },
        ),
    ],
};
