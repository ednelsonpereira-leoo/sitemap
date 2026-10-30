export const $ = (selector, root = document) => root.querySelector(selector);
export const text = (selector, root = document) => {
  const el = $(selector, root);
  return el ? el.textContent.trim() : undefined;
};
export const attr = (selector, name, root = document) => {
  const el = $(selector, root);
  return el ? el.getAttribute(name) : undefined;
};
