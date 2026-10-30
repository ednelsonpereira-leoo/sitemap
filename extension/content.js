// Pergunta ao background, a cada segundo, se saiu build novo; se saiu, recarrega a página.
(() => {
  let loadedBuild = null; // build que estava no ar quando a página carregou
  let loggedError = null;

  async function tick() {
    let res;
    try {
      res = await chrome.runtime.sendMessage({ type: "poll", url: location.href });
    } catch {
      return setTimeout(tick, 3000); // extensão recarregada ou background dormindo
    }
    if (res && res.removedRule) {
      // O servidor caiu com a troca ligada: recarrega pra voltar ao sitemap original.
      console.info("[sitemap-dev] servidor local desligado, voltando ao sitemap original");
      return location.reload();
    }
    if (!res || !res.serverUp) {
      // Servidor desligado: a página está com o sitemap original. Se ele subir, recarrega.
      loadedBuild = loadedBuild ?? "original";
      return setTimeout(tick, 3000);
    }
    if (!res.watch) return; // página fora de sitePatterns: para de perguntar

    const v = res.version;
    if (!v.ok) {
      if (loggedError !== v.error) console.warn("[sitemap-dev] erro no build, mantendo a versão anterior:\n" + v.error);
      loggedError = v.error;
      return setTimeout(tick, 1000);
    }
    loggedError = null;
    if (loadedBuild === null) {
      loadedBuild = v.build;
      console.info(`[sitemap-dev] sitemap local ativo (build #${v.build})`);
    } else if (loadedBuild !== v.build) {
      console.info(`[sitemap-dev] build #${v.build}, recarregando`);
      return location.reload();
    }
    setTimeout(tick, 1000);
  }

  tick();
})();
