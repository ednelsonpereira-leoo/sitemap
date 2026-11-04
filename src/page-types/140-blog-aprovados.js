import { createListener, EVENTS } from "../utils/listener.js";
import { looksLikeEmail } from "../utils/validation.js";
import { rememberUserEmail } from "../utils/user.js";

export default {
    name: 'Blog Aprovados',
    isMatch: () => {
        return (
            window.location.hostname === 'blog.grancursosonline.com.br' &&
            window.location.pathname.includes('aprovados')
        );
    },
    interaction: {
        name: 'Acessou Página Blog de Aprovados',
    },
    listeners: [
        createListener(EVENTS.click, "form input[type='submit']", () => {
            const name = SalesforceInteractions.cashDom(
                "form input[name='nome']",
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
            if (looksLikeEmail(emailAddress)) {
                userAttributes.emailAddress = String(emailAddress).trim();
                rememberUserEmail(userAttributes.emailAddress);
            }
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: '[Formulário] - Blog de Aprovados',
                },
                user: {
                    identities: { emailAddress: userAttributes.emailAddress },
                    attributes: userAttributes,
                },
            });
        }),
    ],
};
