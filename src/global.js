// Configuração global do sitemap (vale pra todas as páginas).
// Listeners globais ficam em src/listeners, um arquivo por responsabilidade.
export default {
  onActionEvent: (event) => {
    // Identidade: completa o evento com o usuário logado, se houver.
    const user = window.dataLayer && window.dataLayer.find && window.dataLayer.find((e) => e && e.userId);
    if (user) {
      event.user = event.user || {};
      event.user.identities = { ...(event.user.identities || {}), emailAddress: user.email };
    }
    return event;
  },
  contentZones: [{ name: "global_header_banner", selector: "header .banner" }],
  listeners: [],
};
