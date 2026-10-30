// Porta do `npm run dev`. Se mudar em sitemap.config.js, mude aqui também.
const SERVER = "http://localhost:5577";
const RULE_ID = 1;
let appliedKey;

async function isEnabled() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  return enabled;
}

async function getJson(path) {
  const res = await fetch(SERVER + path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

// Liga a troca do sitemap só quando o servidor local responde.
// Servidor desligado = regra removida, e o site volta a carregar o sitemap original.
// Retorna true quando acabou de remover uma troca que estava ativa.
async function applyRule(cfg) {
  const key = cfg ? `${cfg.targetUrl}|${cfg.bundleUrl}` : "";
  if (key === appliedKey) return false;
  const hadRule = (await chrome.declarativeNetRequest.getDynamicRules()).length > 0;
  const addRules = cfg
    ? [
        {
          id: RULE_ID,
          priority: 1,
          action: { type: "redirect", redirect: { url: cfg.bundleUrl } },
          condition: { urlFilter: "|" + cfg.targetUrl.split("?")[0], resourceTypes: ["script"] },
        },
      ]
    : [];
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID], addRules });
  appliedKey = key;
  return !cfg && hadRule;
}

async function sync() {
  const enabled = await isEnabled();
  let cfg = null;
  let version = null;
  if (enabled) {
    try {
      [cfg, version] = await Promise.all([getJson("/config.json"), getJson("/version")]);
    } catch {
      cfg = null;
    }
  }
  const removedRule = await applyRule(cfg);
  chrome.action.setBadgeText({ text: !enabled ? "" : !cfg ? "OFF" : version.ok ? "ON" : "ERR" });
  chrome.action.setBadgeBackgroundColor({ color: !cfg ? "#888" : version.ok ? "#1a7f37" : "#cf222e" });
  return { enabled, cfg, version, removedRule };
}

function matches(patterns, url) {
  return (patterns || []).some((p) => {
    const re = new RegExp("^" + p.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
    return re.test(url);
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "poll") {
    sync()
      .then(({ cfg, version, removedRule }) =>
        sendResponse({ serverUp: !!cfg, watch: !!cfg && matches(cfg.sitePatterns, msg.url), version, removedRule })
      )
      .catch(() => sendResponse({ serverUp: false, watch: false }));
    return true;
  }
});

chrome.action.onClicked.addListener(async () => {
  await chrome.storage.local.set({ enabled: !(await isEnabled()) });
  await sync();
});

chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
