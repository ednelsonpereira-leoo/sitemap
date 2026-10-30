export default {
  name: "cart",
  isMatch: () => /^\/carrinho/.test(window.location.pathname),
  interaction: { name: "View Cart" },
  contentZones: [{ name: "cart_upsell", selector: "#cart-upsell" }],
};
