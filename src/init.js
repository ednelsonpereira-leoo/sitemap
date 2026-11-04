// Opções do SalesforceInteractions.init().
export default {
  cookieDomain: "grancursosonline.com.br",
  consents: [
    {
      purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
      provider: "GranCursos",
      status: SalesforceInteractions.ConsentStatus.OptIn,
    },
  ],
};
