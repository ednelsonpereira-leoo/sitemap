// Ponto de entrada. Cada arquivo em src/page-types e src/listeners entra sozinho no bundle.
// A ordem das chamadas abaixo é a mesma do sitemap original; mude com cuidado.
import pageTypes from "glob:page-types";
import globalListeners from "glob:listeners";
import initOptions from "./init.js";
import global from "./global.js";
import pageTypeDefault from "./page-type-default.js";
import { assertUniqueNames } from "./utils/validate.js";
import { logMarketingPreference } from "./runtime/consent.js";
import { installSendEventGuard } from "./runtime/send-event-guard.js";
import { handleSPAPageChange } from "./runtime/spa.js";
import { getUserInfo } from "./runtime/signup-iframe.js";
import { startDataLayerMonitor } from "./runtime/data-layer.js";
import { bindSignupForm } from "./utils/identity.js";
import { bindSocialAuthButtons, resolvePendingSocial } from "./utils/social-auth.js";
import { handlePageView, handleUtms } from "./utils/page-view.js";
import { rememberUserEmail } from "./utils/user.js";
import { scheduleFlushPendingAddToCart, startPendingAddToCartWatcher, triggerCoachingAddToCart } from "./utils/add-to-cart.js";
import { captureLastCoachingProductFromDataLayer } from "./utils/coaching.js";

assertUniqueNames(pageTypes);

logMarketingPreference();
installSendEventGuard();

SalesforceInteractions.init(initOptions).then(() => {
  handleSPAPageChange();
  getUserInfo();
  bindSignupForm("User Sign Up", "#btn-cadastrar-modal", "#email");
  bindSignupForm("User Sign Up", "#btn-cadastro", "#email");
  bindSocialAuthButtons();
  SalesforceInteractions.initSitemap({
    global: {
      ...global,
      listeners: [...(global.listeners || []), ...globalListeners.flat()],
    },
    pageTypeDefault,
    pageTypes,
  });
  resolvePendingSocial();
  handleUtms();
  handlePageView();
  try {
    const existingEmail = localStorage.getItem("tbcAlunoEmail");
    if (existingEmail) rememberUserEmail(existingEmail);
  } catch (e) {}
  scheduleFlushPendingAddToCart();
  startPendingAddToCartWatcher();
  captureLastCoachingProductFromDataLayer();
  triggerCoachingAddToCart();
  startDataLayerMonitor();
});
