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

console.log('Original HTML snippet:', html.match(/<script[^>]*src="[^"]*"/)?.[0]);
console.log('Original CSS snippet:', html.match(/<link[^>]*href="[^"]*"/)?.[0]);

// Alle absoluten Pfade zu Assets ersetzen (robuster)
// /assets/... -> /HaySpace/assets/...
html = html.replace(/(href|src)="\/assets\//g, `$1="${base}assets/`);

// Auch andere absolute Pfade, die mit / beginnen (aber nicht http/https)
html = html.replace(/(href|src)="\/(?!\/)([^"]+)"/g, (match, attr, path) => {
  // Überspringe, wenn es schon mit base beginnt
  if (path.startsWith(basePath + '/')) {
    return match;
  }
  // Überspringe externe URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return match;
  }
  return `${attr}="${base}${path}"`;
});

console.log('Fixed HTML snippet:', html.match(/<script[^>]*src="[^"]*"/)?.[0]);
console.log('Fixed CSS snippet:', html.match(/<link[^>]*href="[^"]*"/)?.[0]);

// HTML-Datei schreiben
writeFileSync(indexPath, html, 'utf-8');

console.log('Base path fixed successfully!');

