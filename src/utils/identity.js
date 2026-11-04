import { looksLikeEmail } from "./validation.js";
import { rememberUserEmail } from "./user.js";
import { scheduleFlushPendingAddToCart } from "./add-to-cart.js";

export let lastIdentityCapture = { key: '', at: 0 };
export const emailFromForm = (el, fallbackSelector) => {
    const form = el && el.closest ? el.closest('form') : null;
    const input =
        (form &&
            form.querySelector(
                "input[type='email'], input[name='email'], input[name*='mail']",
            )) ||
        document.querySelector(fallbackSelector);
    return input ? input.value : '';
};
export const bindSignupForm = (eventName, buttonSelector, fallbackEmailSelector) => {
    const handler = (target) =>
        captureUserIdentity(eventName, emailFromForm(target, fallbackEmailSelector));
    document.addEventListener(
        'click',
        (e) => {
            const btn = e.target.closest && e.target.closest(buttonSelector);
            if (btn) handler(btn);
        },
        true,
    );
    document.addEventListener(
        'submit',
        (e) => {
            const form = e.target;
            if (form && form.querySelector && form.querySelector(buttonSelector))
                handler(form);
        },
        true,
    );
};
export const captureUserIdentity = (eventName, emailAddress, attributes) => {
    const email = String(emailAddress || '').trim();
    if (!looksLikeEmail(email)) {
        console.warn('[SFMC] lead skipped - email does not look valid', {
            eventName,
            emailAddress: email,
        });
        return;
    }
    const dedupeKey = eventName + '|' + email.toLowerCase();
    const now = Date.now();
    if (lastIdentityCapture.key === dedupeKey && now - lastIdentityCapture.at < 5e3) return;
    lastIdentityCapture = { key: dedupeKey, at: now };
    rememberUserEmail(email);
    SalesforceInteractions.sendEvent({
        interaction: {
            name: eventName,
        },
        user: {
            identities: {
                emailAddress: email,
            },
            ...(attributes ? { attributes } : {}),
        },
    });
    scheduleFlushPendingAddToCart();
};
