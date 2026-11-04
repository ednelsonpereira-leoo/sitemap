// Executa o bundle num ambiente simulado e confere se o initSitemap recebe um sitemap válido.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { config, root } from "./bundle.js";

const code = fs.readFileSync(path.join(root, config.outfile), "utf8");
let sitemap = null;

const enumProxy = new Proxy({}, { get: (_, k) => String(k) });
const SalesforceInteractions = {
  init: () => ({ then: (cb) => cb() }),
  initSitemap: (cfg) => {
    sitemap = cfg;
  },
  listener: (event, selector, handler) => ({ event, selector, handler }),
  sendEvent: () => {},
  reinit: () => {},
  cashDom: () => ({}),
  util: { resolveWhenTrue: () => undefined },
  resolvers: new Proxy({}, { get: () => () => () => undefined }),
  mcis: { ConsentPurpose: enumProxy },
  ConsentStatus: enumProxy,
  CatalogObjectInteractionName: enumProxy,
  CartInteractionName: enumProxy,
  OrderInteractionName: enumProxy,
};
const document = {
  cookie: "",
  title: "",
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
  body: { addEventListener: () => {}, removeEventListener: () => {} },
};
const window = {
  location: {
    pathname: "/",
    href: "https://exemplo.com.br/",
    hostname: "exemplo.com.br",
    origin: "https://exemplo.com.br",
    search: "",
  },
  dataLayer: [],
};
const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const timer = () => 0;

try {
  vm.runInNewContext(code, {
    SalesforceInteractions,
    window,
    document,
    localStorage: storage,
    sessionStorage: storage,
    setTimeout: timer,
    setInterval: timer,
    clearTimeout: timer,
    clearInterval: timer,
    URL,
    URLSearchParams,
    // O sitemap registra bastante coisa no console; aqui só erro interessa.
    console: { log: () => {}, info: () => {}, warn: () => {}, error: console.error },
  });
} catch (err) {
  console.error("✖ o bundle quebrou ao executar:", err.message);
  process.exit(1);
}

const problems = [];
if (!sitemap) problems.push("initSitemap não foi chamado");
else {
  if (!Array.isArray(sitemap.pageTypes) || !sitemap.pageTypes.length) problems.push("nenhum page type");
  for (const pt of sitemap.pageTypes || []) {
    if (typeof pt.isMatch !== "function") problems.push(`page type ${pt.name} sem isMatch()`);
    if (!pt.interaction) problems.push(`page type ${pt.name} sem interaction`);
  }
  if (!sitemap.pageTypeDefault) problems.push("sem pageTypeDefault");
}

if (problems.length) {
  for (const p of problems) console.error("✖ " + p);
  process.exit(1);
}
console.log(`✔ sitemap válido: ${sitemap.pageTypes.length} page types (${sitemap.pageTypes.map((p) => p.name).join(", ")}), ${sitemap.global.listeners.length} listeners globais`);
