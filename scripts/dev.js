// Modo dev: rebuild a cada alteração em src/ e servidor local pra extensão do Chrome.
//   GET /sitemap.js   bundle atual (sem cache)
//   GET /version      { build, ok, error, updatedAt }  usado pra recarregar a página
//   GET /config.json  targetUrl e sitePatterns, lidos pela extensão
import * as esbuild from "esbuild";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { esbuildOptions, config, root } from "./bundle.js";

const state = { build: 0, ok: false, error: null, updatedAt: null };
const out = path.join(root, config.outfile);
const time = () => new Date().toLocaleTimeString("pt-BR");

const reporter = {
  name: "reporter",
  setup(build) {
    let started = 0;
    build.onStart(() => {
      started = Date.now();
    });
    build.onEnd((result) => {
      if (result.errors.length) {
        state.ok = false;
        state.error = result.errors
          .map((e) => (e.location ? `${e.location.file}:${e.location.line}:${e.location.column} ` : "") + e.text)
          .join("\n");
        console.error(`[${time()}] ✖ erro no build, a página continua com a versão anterior:\n${state.error}`);
        return;
      }
      state.build += 1;
      state.ok = true;
      state.error = null;
      state.updatedAt = new Date().toISOString();
      const kb = (fs.statSync(out).size / 1024).toFixed(1);
      console.log(`[${time()}] ✔ build #${state.build} (${kb} KB, ${Date.now() - started} ms), páginas abertas vão recarregar`);
    });
  },
};

const opts = esbuildOptions();
opts.plugins = [...opts.plugins, reporter];
const ctx = await esbuild.context(opts);
await ctx.watch();

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Private-Network": "true",
  "Cache-Control": "no-store",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "OPTIONS") {
    res.writeHead(204, { ...headers, "Access-Control-Allow-Headers": "*" });
    return res.end();
  }
  if (url.pathname === "/sitemap.js") {
    if (!fs.existsSync(out)) {
      res.writeHead(503, headers);
      return res.end("// bundle ainda não gerado");
    }
    res.writeHead(200, { ...headers, "Content-Type": "application/javascript; charset=utf-8" });
    return fs.createReadStream(out).pipe(res);
  }
  if (url.pathname === "/version") {
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    return res.end(JSON.stringify(state));
  }
  if (url.pathname === "/config.json") {
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        targetUrl: config.targetUrl,
        sitePatterns: config.sitePatterns,
        bundleUrl: `http://localhost:${config.port}/sitemap.js`,
      })
    );
  }
  res.writeHead(404, headers);
  res.end("not found");
});

server.listen(config.port, () => {
  console.log(`sitemap-modular dev em http://localhost:${config.port}`);
  console.log(`  trocando: ${config.targetUrl}`);
  console.log(`  recarregando: ${config.sitePatterns.join(", ")}`);
  console.log("  (mudou sitemap.config.js? reinicie o comando)\n");
});

process.on("SIGINT", async () => {
  await ctx.dispose();
  server.close();
  process.exit(0);
});
