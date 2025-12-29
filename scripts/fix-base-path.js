import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const basePath = process.env.GITHUB_REPOSITORY_NAME || '';
const distDir = 'dist';
const indexPath = join(distDir, 'index.html');
const assetsDir = join(distDir, 'assets');

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

// Auch Bild-Pfade im HTML korrigieren (falls vorhanden)
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/hangar\.png/g, `$1"${base}hangar.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/hangar\.png/g, `$1'${base}hangar.png`);

if (html === beforeReplace) {
  console.warn('WARNING: No /assets/ paths found to replace!');
} else {
  console.log('✓ Replaced /assets/ paths');
}

// HTML-Datei schreiben
writeFileSync(indexPath, html, 'utf-8');

// JavaScript- und CSS-Dateien auch korrigieren
if (existsSync(assetsDir)) {
  const assetFiles = readdirSync(assetsDir);
  
  for (const file of assetFiles) {
    const filePath = join(assetsDir, file);
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Musik-Dateien: /backround-music/ -> /HaySpace/backround-music/
    content = content.replace(/\/backround-music\//g, `${base}backround-music/`);
    
    // Cover-Bild: /hayspace-cover.png -> /HaySpace/hayspace-cover.png
    content = content.replace(/\/hayspace-cover\.png/g, `${base}hayspace-cover.png`);
    
    // Hangar-Bild: /hangar.png -> /HaySpace/hangar.png
    // Muss auch in url('/hangar.png') Strings funktionieren
    const hangarMatches = content.match(/\/hangar\.png/g);
    if (hangarMatches) {
      content = content.replace(/\/hangar\.png/g, `${base}hangar.png`);
      console.log(`  → Fixed ${hangarMatches.length} hangar.png reference(s)`);
    }
    
    // Auch url('/hangar.png') explizit behandeln
    const urlHangarMatches = content.match(/url\(['"]\/hangar\.png['"]\)/g);
    if (urlHangarMatches) {
      content = content.replace(/url\(['"]\/hangar\.png['"]\)/g, (match) => {
        const quote = match.includes("'") ? "'" : '"';
        return `url(${quote}${base}hangar.png${quote})`;
      });
      console.log(`  → Fixed ${urlHangarMatches.length} url('/hangar.png') reference(s)`);
    }
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ Fixed paths in ${file}`);
    }
  }
}

const fixedScript = html.match(/<script[^>]*src="[^"]*"/)?.[0];
// Nur Asset-CSS prüfen, nicht externe Links
const fixedAssetCss = html.match(/<link[^>]*href="[^"]*assets[^"]*"[^>]*stylesheet/)?.[0];

console.log('Fixed script:', fixedScript);
console.log('Fixed asset CSS:', fixedAssetCss);

// Prüfe nur, ob Script-Pfad korrekt ist
// Asset-CSS ist optional (kann auch fehlen, wenn nur externe CSS-Links vorhanden sind)
const scriptIsFixed = fixedScript && fixedScript.includes(base);
const assetCssIsFixed = !fixedAssetCss || fixedAssetCss.includes(base);

if (scriptIsFixed && assetCssIsFixed) {
  console.log('✓ Base path fixed successfully!');
  process.exit(0);
} else {
  console.error('ERROR: Base path fix failed!');
  if (!scriptIsFixed) {
    console.error('Script path is incorrect:', fixedScript);
  }
  if (fixedAssetCss && !assetCssIsFixed) {
    console.error('Asset CSS path is incorrect:', fixedAssetCss);
  }
  process.exit(1);
}

