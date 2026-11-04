import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'Cursos',
    isMatch: () => {
        return (
            window.location.pathname.includes('concurso')
        );
    },
    interaction: {
        name: 'Acessou Página Cursos',
    },
    listeners: [
        createListener(EVENTS.click, "form#form-receba-informacoes button[type='submit']", () => {
            const name = SalesforceInteractions.cashDom(
                "form input[name='nome']",
            )
                .first()
                .val();
            const phoneInput = SalesforceInteractions.cashDom(
                "form input[name='celular']",
            )
                .first()
                .val();
            const carreiraInput = SalesforceInteractions.cashDom(
                "form select[name='carreira']",
            )
                .first()
                .val();
            const emailAddress = SalesforceInteractions.cashDom(
                "form input[name='email']",
            )
                .first()
                .val();
            const userAttributes = {};
            if (name) {
                userAttributes.name = name.trim();
            }
            if (phoneInput) {
                userAttributes.telephone = `55${phoneInput.replace(/[()\-\s]+/g, '')}`;
            }
            if (carreiraInput) {
                userAttributes.carreira = carreiraInput.trim();
            }
            if (looksLikeEmail(emailAddress)) {
                userAttributes.emailAddress = String(emailAddress).trim();
                rememberUserEmail(userAttributes.emailAddress);
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: '[Formulário] - Cursos',
                },
                user: {
                    identities: { emailAddress: userAttributes.emailAddress },
                    attributes: userAttributes,
                },
            });
        }),
    ],
};
