import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const basePath = process.env.GITHUB_REPOSITORY_NAME || '';
const distDir = 'dist';
const indexPath = join(distDir, 'index.html');

if (!basePath) {
  console.log('No GITHUB_REPOSITORY_NAME set, skipping base path fix');
  process.exit(0);
}

const base = `/${basePath}/`;

console.log(`Fixing base path to: ${base}`);

// HTML-Datei lesen
let html = readFileSync(indexPath, 'utf-8');

// Alle absoluten Pfade zu Assets ersetzen
// /assets/... -> /HaySpace/assets/...
html = html.replace(/href="\/assets\//g, `href="${base}assets/`);
html = html.replace(/src="\/assets\//g, `src="${base}assets/`);

// Auch relative Pfade, die mit / beginnen
html = html.replace(/href="\/([^"])/g, (match, p1) => {
  // Nur ersetzen, wenn es nicht schon mit base beginnt
  if (!match.startsWith(`href="${base}`)) {
    return `href="${base}${p1}`;
  }
  return match;
});

html = html.replace(/src="\/([^"])/g, (match, p1) => {
  if (!match.startsWith(`src="${base}`)) {
    return `src="${base}${p1}`;
  }
  return match;
});

// HTML-Datei schreiben
writeFileSync(indexPath, html, 'utf-8');

console.log('Base path fixed successfully!');

