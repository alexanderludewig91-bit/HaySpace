import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const basePath = process.env.GITHUB_REPOSITORY_NAME || '';
const distDir = 'dist';
const indexPath = join(distDir, 'index.html');

console.log('=== Fix Base Path Script ===');
console.log('GITHUB_REPOSITORY_NAME:', basePath || '(not set)');
console.log('Index path:', indexPath);
console.log('File exists:', existsSync(indexPath));

if (!basePath) {
  console.error('ERROR: No GITHUB_REPOSITORY_NAME set, skipping base path fix');
  process.exit(1);
}

if (!existsSync(indexPath)) {
  console.error(`ERROR: Index file not found at ${indexPath}`);
  process.exit(1);
}

const base = `/${basePath}/`;

console.log(`Fixing base path to: ${base}`);

// HTML-Datei lesen
let html = readFileSync(indexPath, 'utf-8');

const originalScript = html.match(/<script[^>]*src="[^"]*"/)?.[0];
const originalCss = html.match(/<link[^>]*href="[^"]*"[^>]*stylesheet/)?.[0];

console.log('Original script:', originalScript);
console.log('Original CSS:', originalCss);

// Alle absoluten Pfade zu Assets ersetzen (robuster)
// /assets/... -> /HaySpace/assets/...
const beforeReplace = html;
html = html.replace(/(href|src)="\/assets\//g, `$1="${base}assets/`);

if (html === beforeReplace) {
  console.warn('WARNING: No /assets/ paths found to replace!');
} else {
  console.log('✓ Replaced /assets/ paths');
}

// HTML-Datei schreiben
writeFileSync(indexPath, html, 'utf-8');

const fixedScript = html.match(/<script[^>]*src="[^"]*"/)?.[0];
const fixedCss = html.match(/<link[^>]*href="[^"]*"[^>]*stylesheet/)?.[0];

console.log('Fixed script:', fixedScript);
console.log('Fixed CSS:', fixedCss);

if (fixedScript && fixedScript.includes(base) && fixedCss && fixedCss.includes(base)) {
  console.log('✓ Base path fixed successfully!');
  process.exit(0);
} else {
  console.error('ERROR: Base path fix failed!');
  console.error('Script still contains:', fixedScript);
  console.error('CSS still contains:', fixedCss);
  process.exit(1);
}

