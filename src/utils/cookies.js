export const COOKIE_DOMAIN = '.grancursosonline.com.br';
export const setCrossDomainCookie = (name, value, days) => {
    const expires =
        days < 0
            ? new Date(0).toUTCString()
            : new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;domain=${COOKIE_DOMAIN};SameSite=Lax`;
};
export const getCrossDomainCookie = (name) => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${escapedName}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : '';
};
