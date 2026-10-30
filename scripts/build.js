import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { esbuildOptions, config, root } from "./bundle.js";

const minify = process.argv.includes("--minify");
try {
  const result = await esbuild.build(esbuildOptions({ minify }));
  for (const w of result.warnings) console.warn("aviso:", w.text);
  const out = path.join(root, config.outfile);
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`✔ ${config.outfile} gerado (${kb} KB${minify ? ", minificado" : ""})`);
} catch (err) {
  for (const e of err.errors ?? []) {
    const loc = e.location ? `${e.location.file}:${e.location.line}:${e.location.column} ` : "";
    console.error(`✖ ${loc}${e.text}`);
  }
  if (!err.errors) console.error(err);
  process.exit(1);
}
