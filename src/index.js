// Ponto de entrada. Normalmente você não precisa mexer aqui:
// cada arquivo em src/page-types e src/listeners entra sozinho no bundle.
import pageTypes from "glob:page-types";
import globalListeners from "glob:listeners";
import initOptions from "./init.js";
import global from "./global.js";
import pageTypeDefault from "./page-type-default.js";
import { assertUniqueNames } from "./utils/validate.js";

assertUniqueNames(pageTypes);

SalesforceInteractions.init(initOptions).then(() => {
  SalesforceInteractions.initSitemap({
    global: {
      ...global,
      listeners: [...(global.listeners || []), ...globalListeners.flat()],
    },
    pageTypeDefault,
    pageTypes,
  });
});
