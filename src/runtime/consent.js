export function logMarketingPreference() {
    let marketingPreference = '';
    try {
        marketingPreference = document.cookie
            .split(';')
            .find((cookie) => cookie.includes('OptanonConsent'))
            .split('&')
            .find((pcookie) => pcookie.includes('groups'))[27];
    } catch (e) {
        console.warn(e);
        marketingPreference = '0';
    }
    console.log('Marketing Opt In');
}
