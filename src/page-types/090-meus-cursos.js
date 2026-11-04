export default {
    name: 'Meus Cursos',
    isMatch: () => /\/meus-cursos\/?$/.test(window.location.pathname),
    interaction: {
        name: () => {
            let eventName = '';
            const hostname = window.location.hostname;
            if (hostname.startsWith('aluno')) {
                eventName = 'web_pageview_ava_faculdade_meus_cursos';
            } else {
                eventName = 'web_pageview_ava_preparatorio_meus_cursos';
            }
            return eventName;
        },
    },
};
