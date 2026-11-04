export default {
    name: 'Certificados',
    isMatch: () => /\/certificados\/?$/.test(window.location.pathname),
    interaction: {
        name: 'View Certificados',
    },
};
