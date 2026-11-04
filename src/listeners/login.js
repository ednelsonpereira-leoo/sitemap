import { createListener, EVENTS } from "../utils/listener.js";
import { captureUserIdentity } from "../utils/identity.js";

export default [
  createListener(EVENTS.click, '#btn-login-site', () => {
      captureUserIdentity(
          'User Login',
          SalesforceInteractions.cashDom('#login-email').first().val(),
      );
  }),
];
