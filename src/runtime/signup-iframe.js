import { looksLikeEmail } from "../utils/validation.js";
import { captureUserIdentity } from "../utils/identity.js";

export const getUserInfo = () => {
    const IFRAME_SEL = "iframe[src*='/aluno/aluno/cadastro']";
    let tries = 0;
    const waitForSignupIframe = setInterval(() => {
        tries++;
        if (tries > 100) return clearInterval(waitForSignupIframe);
        if (!/\/aluno\/aluno\/cadastro$/.test(window.location.pathname)) return;
        const frame = document.querySelector(IFRAME_SEL);
        let doc;
        try {
            doc = frame && frame.contentWindow && frame.contentWindow.document;
        } catch (e) {
            console.warn('[SFMC] signup iframe is cross-origin; needs server-side event', e);
            return clearInterval(waitForSignupIframe);
        }
        if (!doc || !doc.querySelector('#email')) return;
        if (doc.__sfmcSignupBound) return clearInterval(waitForSignupIframe);
        doc.__sfmcSignupBound = true;
        clearInterval(waitForSignupIframe);
        const readAndSend = () => {
            const val = (sel) => {
                const el = doc.querySelector(sel);
                return el ? String(el.value || '').trim() : '';
            };
            const email = val('#email');
            if (!looksLikeEmail(email)) return;
            const attributes = {};
            const nome = val('#nome');
            const celular = val('#celular');
            if (nome) attributes.name = nome;
            if (celular) attributes.telephone = `55${celular.replace(/[()\-\s]+/g, '')}`;
            captureUserIdentity('User Sign Up', email);
            if (Object.keys(attributes).length) {
                SalesforceInteractions.sendEvent({
                    interaction: { name: 'Update User Info' },
                    user: { identities: { emailAddress: email }, attributes },
                });
            }
        };
        // TODO: idealmente disparar só no sucesso do cadastro (tela/resposta OK).
        doc.addEventListener('submit', readAndSend, true);
        doc.addEventListener(
            'click',
            (e) => {
                const b = e.target.closest && e.target.closest("button[type='submit'], input[type='submit']");
                if (b) readAndSend();
            },
            true,
        );
    }, 1e3);
};
