// Ordem importa: o primeiro page type cujo isMatch() for true vence.
// Os arquivos entram em ordem alfabética, por isso o prefixo numérico.
// Prefixe com _ (ex.: _rascunho.js) pra tirar um arquivo do bundle sem apagar.
export default {
  name: "home",
  isMatch: () => window.location.pathname === "/",
  interaction: { name: "Home" },
  contentZones: [
    { name: "home_hero", selector: "#home-hero" },
    { name: "home_recommendations", selector: "#home-recommendations" },
  ],
};
