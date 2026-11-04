import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'Conte-nos a sua história',
    isMatch: () => {
        return (
            window.location.pathname.includes('gran-aprovados')
        );
    },
    interaction: {
        name: 'Acessou Página Conte-nos a sua história',
    },
    listeners: [
        createListener(EVENTS.click, "form.hs-form button[type='submit']", () => {
            const name = SalesforceInteractions.cashDom(
                "form.hs-form input[name='firstname']",
            )
                .first()
                .val();

            const lastname = SalesforceInteractions.cashDom(
                "form.hs-form input[name='lastname']",
            )
                .first()
                .val();
            const emailAddress = SalesforceInteractions.cashDom(
                "form.hs-form input[name='email']",
            )
                .first()
                .val();
            const phoneInput = SalesforceInteractions.cashDom(
                "form.hs-form input[data-phone-input='mobilephone']",
            )
                .first()
                .val();
            const userAttributes = {};
            if (name) {
                userAttributes.name = name.trim();
            }
            if (lastname) {
                userAttributes.lastname = lastname.trim();
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
                    eventName: '[Formulário] - Conte-nos a sua história',
                    emailAddress,
                });
                return;
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: '[Formulário] - Conte-nos a sua história',
                },
                user: {
                    identities: { emailAddress: userAttributes.emailAddress },
                    attributes: userAttributes,
                },
            });
        }),
    ],
};
