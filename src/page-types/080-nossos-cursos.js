export default {
    name: 'Nossos Cursos',
    isMatch: () => /\/nossos-cursos\/?$/.test(window.location.pathname),
    interaction: {
        name: () => {
            const hostname = window.location.hostname;
            let eventName = '';
            if (hostname.startsWith('faculdade.')) {
                eventName = 'web_pageview_graduacao_nossos_cursos';
            } else if (hostname.startsWith('pos.')) {
                eventName = 'web_pageview_pos_nossos_cursos';
            }
            return eventName;
        },
    },
};
