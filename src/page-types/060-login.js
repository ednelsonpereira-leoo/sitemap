import { createListener, EVENTS } from "../utils/listener.js";
import { captureUserIdentity } from "../utils/identity.js";

export default {
    name: 'Login Page Type',
    isMatch: () => /\/identificacao/.test(window.location.pathname),
    interaction: {
        name: 'View Login Page',
    },
    listeners: [
        createListener(EVENTS.click, '#login-entrar-site', () => {
            captureUserIdentity(
                'User Login',
                SalesforceInteractions.cashDom('#login-email-site').first().val(),
            );
        }),
    ],
};
