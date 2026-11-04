import { looksLikeEmail } from "./utils/validation.js";
import { getUserEmail, rememberUserEmail } from "./utils/user.js";

export default {
    onActionEvent: (actionEvent) => {
        console.log('Global Action Event: ', actionEvent.interaction.name);
        console.log('Action Event', actionEvent);
        const iconeUsuarioLogado = document.querySelector('#usuario-logado');
        const iconeEntrar = document.querySelector(
            "[data-original-title='Entre na sua conta']",
        );
        if (iconeUsuarioLogado) {
            actionEvent.user = actionEvent.user || {};
            actionEvent.user.attributes = actionEvent.user.attributes || {};
            actionEvent.user.attributes.crmContact = true;
        } else if (iconeEntrar) {
            actionEvent.user = actionEvent.user || {};
            actionEvent.user.attributes = actionEvent.user.attributes || {};
        }
        try {
            const knownEmail = getUserEmail();
            if (looksLikeEmail(knownEmail)) {
                const emailAddress = String(knownEmail).trim();
                rememberUserEmail(emailAddress);
                actionEvent.user = actionEvent.user || {};
                actionEvent.user.identities = actionEvent.user.identities || {};
                actionEvent.user.identities.emailAddress = emailAddress;
            }
        } catch (e) {
            console.error('Error accessing localStorage', e);
        }
        return actionEvent;
    },
    contentZones: [
        { name: 'popup-lead', selector: '#popup-lead-placeholder' },
        { name: 'popup-carrinho', selector: '#popup-carrinho-placeholder' },
    ],
};
