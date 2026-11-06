import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// Use the developer's existing installation; this does not install dependencies.
const esbuildPath = process.env.ESBUILD_PATH || 'esbuild';
const { build } = require(esbuildPath);
const assets = path.join(root,'reference/assets');
await mkdir(assets,{recursive:true});
for (const filename of await readdir(assets)) await rm(path.join(assets,filename),{recursive:true});
const result = await build({
  entryPoints:[path.join(root,'authoring/page.js')],
  bundle:true, splitting:true, format:'esm', target:'es2022',
  minify:true, sourcemap:false, legalComments:'none',
  outdir:assets, entryNames:'page-[hash]', chunkNames:'part-[hash]', metafile:true,
});
const outputs = Object.entries(result.metafile.outputs);
const entry = outputs.find(([,value]) => value.entryPoint?.endsWith('/page.js'))[0];
const css = outputs.find(([name]) => name.endsWith('.css'))[0];
const html = (await readFile(path.join(root,'authoring/index.html'),'utf8'))
  .replace('./assets/page.js',`./assets/${path.basename(entry)}`)
  .replace('</head>',`<link rel="stylesheet" href="./assets/${path.basename(css)}"></head>`);
await writeFile(path.join(root,'reference/index.html'),html);
console.log(`Built ${outputs.length} minified shipped assets; no source maps.`);
