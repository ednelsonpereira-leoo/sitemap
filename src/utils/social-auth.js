import { COOKIE_DOMAIN, getCrossDomainCookie } from "./cookies.js";
import { getUserEmail } from "./user.js";
import { captureUserIdentity } from "./identity.js";

export const PENDING_SOCIAL_KEY = 'sfmc_pending_social';
export const PENDING_SOCIAL_TTL_MS = 10 * 60 * 1e3;
export const SOCIAL_BUTTONS = [
    { selector: '#btn-register-facebook', type: 'signup', method: 'facebook' },
    { selector: '#btn-register-google', type: 'signup', method: 'google' },
    { selector: '#btn-login-facebook', type: 'login', method: 'facebook' },
    { selector: '#btn-login-google', type: 'login', method: 'google' },
];
export const savePendingSocial = (marker) => {
    const value = JSON.stringify(marker);
    try {
        sessionStorage.setItem(PENDING_SOCIAL_KEY, value);
    } catch (e) {}
    try {
        document.cookie = `${PENDING_SOCIAL_KEY}=${encodeURIComponent(value)};max-age=600;path=/;domain=${COOKIE_DOMAIN};SameSite=Lax`;
    } catch (e) {}
};
export const readPendingSocial = () => {
    const sources = [
        () => sessionStorage.getItem(PENDING_SOCIAL_KEY),
        () => getCrossDomainCookie(PENDING_SOCIAL_KEY),
    ];
    for (const read of sources) {
        try {
            const raw = read();
            if (!raw) continue;
            const marker = JSON.parse(raw);
            if (marker && marker.type && marker.method && marker.at) return marker;
        } catch (e) {}
    }
    return null;
};
export const clearPendingSocial = () => {
    try {
        sessionStorage.removeItem(PENDING_SOCIAL_KEY);
    } catch (e) {}
    try {
        document.cookie = `${PENDING_SOCIAL_KEY}=;max-age=0;path=/;domain=${COOKIE_DOMAIN};SameSite=Lax`;
    } catch (e) {}
};
export const bindSocialAuthButtons = () => {
    document.addEventListener(
        'click',
        (e) => {
            if (!e.target.closest) return;
            for (const btn of SOCIAL_BUTTONS) {
                if (e.target.closest(btn.selector)) {
                    savePendingSocial({ type: btn.type, method: btn.method, at: Date.now() });
                    return;
                }
            }
        },
        true,
    );
};
export const resolvePendingSocial = () => {
    const marker = readPendingSocial();
    if (!marker) return;
    if (Date.now() - Number(marker.at) > PENDING_SOCIAL_TTL_MS) {
        clearPendingSocial();
        return;
    }
    let attempts = 0;
    const tryFire = () => {
        const email = getUserEmail();
        if (email) {
            clearPendingSocial();
            if (marker.type === 'signup') {
                captureUserIdentity('User Sign Up', email, { signupMethod: marker.method });
            } else {
                captureUserIdentity('User Login', email, { loginMethod: marker.method });
            }
            return true;
        }
        return false;
    };
    if (tryFire()) return;
    const interval = setInterval(() => {
        attempts += 1;
        if (tryFire() || attempts >= 10) clearInterval(interval);
    }, 1e3);
};
