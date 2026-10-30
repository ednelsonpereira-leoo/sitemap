export function assertUniqueNames(pageTypes) {
  const seen = new Set();
  for (const pt of pageTypes) {
    if (!pt || !pt.name) throw new Error("[sitemap] page type sem name");
    if (seen.has(pt.name)) throw new Error(`[sitemap] page type duplicado: ${pt.name}`);
    seen.add(pt.name);
  }
}
