import { handlePageView, handleUtms } from "../utils/page-view.js";
import { captureLastCoachingProductFromDataLayer } from "../utils/coaching.js";
import { triggerCoachingAddToCart } from "../utils/add-to-cart.js";

export const handleSPAPageChange = () => {
    let url = window.location.href;
    const urlChangeInterval = setInterval(() => {
        if (url !== window.location.href) {
            url = window.location.href;
            handleUtms();
            handlePageView();
            SalesforceInteractions.reinit();
            captureLastCoachingProductFromDataLayer();
            triggerCoachingAddToCart();
        }
    }, 2e3);
};
