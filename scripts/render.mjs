import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const pages = process.argv.slice(2);
if (!pages.length) throw new Error('usage: node scripts/render.mjs kb/incidents/4471-split …');

for (const page of pages) {
  const src = resolve('build', `${page}.html`);
  const html = readFileSync(src, 'utf8')
    .replace(/<link href="([^"]+\.css)" rel="stylesheet">/g, (_, href) => `<style>${readFileSync(join(dirname(src), href), 'utf8')}</style>`)
    .replace(/<link href="[^"]+" rel="modulepreload">\s*/g, '')
    .replace(/<script\b[\s\S]*?<\/script>\s*/g, '');
  const out = resolve('rendered', `${page}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`rendered/${page}.html`);
}
