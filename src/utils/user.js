import { looksLikeEmail } from "./validation.js";
import { getCrossDomainCookie, setCrossDomainCookie } from "./cookies.js";

export const KNOWN_USER_EMAIL_KEY = 'sfmc_known_user_email';

export const rememberUserEmail = (email) => {
    const normalized = String(email || '').trim();
    if (!looksLikeEmail(normalized)) return;
    try {
        sessionStorage.setItem(KNOWN_USER_EMAIL_KEY, normalized);
        setCrossDomainCookie(KNOWN_USER_EMAIL_KEY, normalized, 7);
    } catch (e) {
        console.error('[SFMC AddToCart] failed to remember user email', e);
    }
};
export const getUserEmail = () => {
    const sources = [
        () => localStorage.getItem('tbcAlunoEmail'),
        () => sessionStorage.getItem(KNOWN_USER_EMAIL_KEY),
        () => getCrossDomainCookie(KNOWN_USER_EMAIL_KEY),
    ];
    for (const readEmail of sources) {
        try {
            const email = readEmail();
            if (looksLikeEmail(email)) return String(email).trim();
        } catch (e) {}
    }
    return '';
};

export const isUserLoggedIn = () => Boolean(document.querySelector('#usuario-logado'));
export const isUserIdentified = () => Boolean(getUserEmail());
