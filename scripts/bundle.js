// Configuração compartilhada do esbuild (build e dev).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../sitemap.config.js";

// fileURLToPath: no Windows, URL.pathname começa com "/C:/" e o path.resolve
// monta "C:\C:\...", então o esbuild não acha src/index.js.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Plugin que transforma uma pasta inteira em um módulo virtual.
// `import pageTypes from "glob:page-types"` vira um array com o default export
// de cada arquivo de src/page-types, em ordem alfabética do nome do arquivo.
// Assim, criar um arquivo novo basta pra ele entrar no sitemap.
const globFolders = {
  name: "glob-folders",
  setup(build) {
    build.onResolve({ filter: /^glob:/ }, (args) => ({
      path: args.path.slice(5),
      namespace: "glob-folder",
    }));
    build.onLoad({ filter: /.*/, namespace: "glob-folder" }, (args) => {
      const dir = path.join(root, "src", args.path);
      const files = fs
        .readdirSync(dir)
        .filter((f) => /\.(js|mjs|ts)$/.test(f) && !f.startsWith("_"))
        .sort();
      const imports = files.map((f, i) => `import m${i} from ${JSON.stringify(path.join(dir, f))};`);
      const list = files.map((_, i) => `m${i}`).join(", ");
      return {
        contents: `${imports.join("\n")}\nexport default [${list}];\n`,
        resolveDir: dir,
        watchDirs: [dir], // arquivo novo ou apagado na pasta dispara rebuild
        loader: "js",
      };
    });
  },
};

export function esbuildOptions({ minify = false } = {}) {
  return {
    absWorkingDir: root,
    entryPoints: ["src/index.js"],
    outfile: config.outfile,
    bundle: true,
    format: "iife",
    target: config.target,
    minify,
    legalComments: "none",
    charset: "utf8",
    logLevel: "silent",
    banner: {
      js: `/* Sitemap gerado por sitemap-modular em ${new Date().toISOString()}. Não edite este arquivo; edite src/. */`,
    },
    plugins: [globFolders],
  };
}

export { config, root };
