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
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/spaceship\.png/g, `$1"${base}spaceship.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/spaceship\.png/g, `$1'${base}spaceship.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/drone\.png/g, `$1"${base}drone.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/drone\.png/g, `$1'${base}drone.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/striker\.png/g, `$1"${base}striker.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/striker\.png/g, `$1'${base}striker.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/tank\.png/g, `$1"${base}tank.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/tank\.png/g, `$1'${base}tank.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/hunter\.png/g, `$1"${base}hunter.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/hunter\.png/g, `$1'${base}hunter.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/crusher\.png/g, `$1"${base}crusher.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/crusher\.png/g, `$1'${base}crusher.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/guardian\.png/g, `$1"${base}guardian.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/guardian\.png/g, `$1'${base}guardian.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/destroyer\.png/g, `$1"${base}destroyer.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/destroyer\.png/g, `$1'${base}destroyer.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/reaper\.png/g, `$1"${base}reaper.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/reaper\.png/g, `$1'${base}reaper.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/titan\.png/g, `$1"${base}titan.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/titan\.png/g, `$1'${base}titan.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/void\.png/g, `$1"${base}void.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/void\.png/g, `$1'${base}void.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/apocalypse\.png/g, `$1"${base}apocalypse.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/apocalypse\.png/g, `$1'${base}apocalypse.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core1\.png/g, `$1"${base}boss_core1.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core1\.png/g, `$1'${base}boss_core1.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core2\.png/g, `$1"${base}boss_core2.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core2\.png/g, `$1'${base}boss_core2.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core2_ring\.png/g, `$1"${base}boss_core2_ring.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core2_ring\.png/g, `$1'${base}boss_core2_ring.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core3\.png/g, `$1"${base}boss_core3.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core3\.png/g, `$1'${base}boss_core3.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core3_ring\.png/g, `$1"${base}boss_core3_ring.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core3_ring\.png/g, `$1'${base}boss_core3_ring.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)"\/boss_core3_ring_element\.png/g, `$1"${base}boss_core3_ring_element.png`);
html = html.replace(/(href|src|background-image:\s*url\(['"]?)'\/boss_core3_ring_element\.png/g, `$1'${base}boss_core3_ring_element.png`);

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
  
  console.log(`Found ${assetFiles.length} files in assets directory`);
  
  for (const file of assetFiles) {
    // Nur JavaScript- und CSS-Dateien verarbeiten
    if (!file.match(/\.(js|css)$/)) {
      continue;
    }
    
    const filePath = join(assetsDir, file);
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Musik-Dateien: /backround-music/ -> /HaySpace/backround-music/
    content = content.replace(/\/backround-music\//g, `${base}backround-music/`);
    
    // Cover-Bild: /hayspace-cover.png -> /HaySpace/hayspace-cover.png
    content = content.replace(/\/hayspace-cover\.png/g, `${base}hayspace-cover.png`);
    
    // Hangar-Bild: /hangar.png -> /HaySpace/hangar.png
    // Muss auch in url('/hangar.png') Strings funktionieren
    // Prüfe zuerst, ob überhaupt hangar.png vorkommt
    if (content.includes('hangar.png')) {
      const beforeHangar = content;
      
      // Alle Varianten von /hangar.png ersetzen (auch in Strings, Template-Strings, etc.)
      // Pattern: /hangar.png (mit oder ohne Anführungszeichen davor/nachher)
      content = content.replace(/\/hangar\.png/g, `${base}hangar.png`);
      
      // Auch url('/hangar.png') oder url("/hangar.png") explizit behandeln
      content = content.replace(/url\(['"]\/hangar\.png['"]\)/g, (match) => {
        const quote = match.includes("'") ? "'" : '"';
        return `url(${quote}${base}hangar.png${quote})`;
      });
      
      // Auch url(`/hangar.png`) (Template-String)
      content = content.replace(/url\(`\/hangar\.png`\)/g, `url(\`${base}hangar.png\`)`);
      
      if (content !== beforeHangar) {
        const matches = (beforeHangar.match(/\/hangar\.png/g) || []).length;
        console.log(`  → Fixed ${matches} hangar.png reference(s) in ${file}`);
      }
    }
    
    // Spaceship-Bild: /spaceship.png -> /HaySpace/spaceship.png
    if (content.includes('spaceship.png')) {
      const beforeSpaceship = content;
      
      // Alle Varianten von /spaceship.png ersetzen
      content = content.replace(/\/spaceship\.png/g, `${base}spaceship.png`);
      
      if (content !== beforeSpaceship) {
        const matches = (beforeSpaceship.match(/\/spaceship\.png/g) || []).length;
        console.log(`  → Fixed ${matches} spaceship.png reference(s) in ${file}`);
      }
    }
    
    // Drone-Bild: /drone.png -> /HaySpace/drone.png
    if (content.includes('drone.png')) {
      const beforeDrone = content;
      
      // Alle Varianten von /drone.png ersetzen
      content = content.replace(/\/drone\.png/g, `${base}drone.png`);
      
      if (content !== beforeDrone) {
        const matches = (beforeDrone.match(/\/drone\.png/g) || []).length;
        console.log(`  → Fixed ${matches} drone.png reference(s) in ${file}`);
      }
    }
    
    // Striker-Bild: /striker.png -> /HaySpace/striker.png
    if (content.includes('striker.png')) {
      const beforeStriker = content;
      
      // Alle Varianten von /striker.png ersetzen
      content = content.replace(/\/striker\.png/g, `${base}striker.png`);
      
      if (content !== beforeStriker) {
        const matches = (beforeStriker.match(/\/striker\.png/g) || []).length;
        console.log(`  → Fixed ${matches} striker.png reference(s) in ${file}`);
      }
    }
    
    // Tank-Bild: /tank.png -> /HaySpace/tank.png
    if (content.includes('tank.png')) {
      const beforeTank = content;
      
      // Alle Varianten von /tank.png ersetzen
      content = content.replace(/\/tank\.png/g, `${base}tank.png`);
      
      if (content !== beforeTank) {
        const matches = (beforeTank.match(/\/tank\.png/g) || []).length;
        console.log(`  → Fixed ${matches} tank.png reference(s) in ${file}`);
      }
    }
    
    // Hunter-Bild: /hunter.png -> /HaySpace/hunter.png
    if (content.includes('hunter.png')) {
      const beforeHunter = content;
      
      // Alle Varianten von /hunter.png ersetzen
      content = content.replace(/\/hunter\.png/g, `${base}hunter.png`);
      
      if (content !== beforeHunter) {
        const matches = (beforeHunter.match(/\/hunter\.png/g) || []).length;
        console.log(`  → Fixed ${matches} hunter.png reference(s) in ${file}`);
      }
    }
    
    // Crusher-Bild: /crusher.png -> /HaySpace/crusher.png
    if (content.includes('crusher.png')) {
      const beforeCrusher = content;
      
      // Alle Varianten von /crusher.png ersetzen
      content = content.replace(/\/crusher\.png/g, `${base}crusher.png`);
      
      if (content !== beforeCrusher) {
        const matches = (beforeCrusher.match(/\/crusher\.png/g) || []).length;
        console.log(`  → Fixed ${matches} crusher.png reference(s) in ${file}`);
      }
    }
    
    // Guardian-Bild: /guardian.png -> /HaySpace/guardian.png
    if (content.includes('guardian.png')) {
      const beforeGuardian = content;
      
      // Alle Varianten von /guardian.png ersetzen
      content = content.replace(/\/guardian\.png/g, `${base}guardian.png`);
      
      if (content !== beforeGuardian) {
        const matches = (beforeGuardian.match(/\/guardian\.png/g) || []).length;
        console.log(`  → Fixed ${matches} guardian.png reference(s) in ${file}`);
      }
    }
    
    // Destroyer-Bild: /destroyer.png -> /HaySpace/destroyer.png
    if (content.includes('destroyer.png')) {
      const beforeDestroyer = content;
      
      // Alle Varianten von /destroyer.png ersetzen
      content = content.replace(/\/destroyer\.png/g, `${base}destroyer.png`);
      
      if (content !== beforeDestroyer) {
        const matches = (beforeDestroyer.match(/\/destroyer\.png/g) || []).length;
        console.log(`  → Fixed ${matches} destroyer.png reference(s) in ${file}`);
      }
    }
    
    // Reaper-Bild: /reaper.png -> /HaySpace/reaper.png
    if (content.includes('reaper.png')) {
      const beforeReaper = content;
      
      // Alle Varianten von /reaper.png ersetzen
      content = content.replace(/\/reaper\.png/g, `${base}reaper.png`);
      
      if (content !== beforeReaper) {
        const matches = (beforeReaper.match(/\/reaper\.png/g) || []).length;
        console.log(`  → Fixed ${matches} reaper.png reference(s) in ${file}`);
      }
    }
    
    // Titan-Bild: /titan.png -> /HaySpace/titan.png
    if (content.includes('titan.png')) {
      const beforeTitan = content;
      
      // Alle Varianten von /titan.png ersetzen
      content = content.replace(/\/titan\.png/g, `${base}titan.png`);
      
      if (content !== beforeTitan) {
        const matches = (beforeTitan.match(/\/titan\.png/g) || []).length;
        console.log(`  → Fixed ${matches} titan.png reference(s) in ${file}`);
      }
    }
    
    // Void-Bild: /void.png -> /HaySpace/void.png
    if (content.includes('void.png')) {
      const beforeVoid = content;
      
      // Alle Varianten von /void.png ersetzen
      content = content.replace(/\/void\.png/g, `${base}void.png`);
      
      if (content !== beforeVoid) {
        const matches = (beforeVoid.match(/\/void\.png/g) || []).length;
        console.log(`  → Fixed ${matches} void.png reference(s) in ${file}`);
      }
    }
    
    // Apocalypse-Bild: /apocalypse.png -> /HaySpace/apocalypse.png
    if (content.includes('apocalypse.png')) {
      const beforeApocalypse = content;
      
      // Alle Varianten von /apocalypse.png ersetzen
      content = content.replace(/\/apocalypse\.png/g, `${base}apocalypse.png`);
      
      if (content !== beforeApocalypse) {
        const matches = (beforeApocalypse.match(/\/apocalypse\.png/g) || []).length;
        console.log(`  → Fixed ${matches} apocalypse.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 1-Bild: /boss_core1.png -> /HaySpace/boss_core1.png
    if (content.includes('boss_core1.png')) {
      const beforeBossCore1 = content;
      
      // Alle Varianten von /boss_core1.png ersetzen
      content = content.replace(/\/boss_core1\.png/g, `${base}boss_core1.png`);
      
      if (content !== beforeBossCore1) {
        const matches = (beforeBossCore1.match(/\/boss_core1\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core1.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 2-Bild: /boss_core2.png -> /HaySpace/boss_core2.png
    if (content.includes('boss_core2.png')) {
      const beforeBossCore2 = content;
      
      // Alle Varianten von /boss_core2.png ersetzen
      content = content.replace(/\/boss_core2\.png/g, `${base}boss_core2.png`);
      
      if (content !== beforeBossCore2) {
        const matches = (beforeBossCore2.match(/\/boss_core2\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core2.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 2 Ring-Bild: /boss_core2_ring.png -> /HaySpace/boss_core2_ring.png
    if (content.includes('boss_core2_ring.png')) {
      const beforeBossCore2Ring = content;
      
      // Alle Varianten von /boss_core2_ring.png ersetzen
      content = content.replace(/\/boss_core2_ring\.png/g, `${base}boss_core2_ring.png`);
      
      if (content !== beforeBossCore2Ring) {
        const matches = (beforeBossCore2Ring.match(/\/boss_core2_ring\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core2_ring.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 3 Ring Element-Bild: /boss_core3_ring_element.png -> /HaySpace/boss_core3_ring_element.png
    // ZUERST das längste Pattern ersetzen, damit es nicht von kürzeren Patterns erfasst wird
    if (content.includes('boss_core3_ring_element.png')) {
      const beforeBossCore3RingElement = content;
      
      // Alle Varianten von /boss_core3_ring_element.png ersetzen
      content = content.replace(/\/boss_core3_ring_element\.png/g, `${base}boss_core3_ring_element.png`);
      
      if (content !== beforeBossCore3RingElement) {
        const matches = (beforeBossCore3RingElement.match(/\/boss_core3_ring_element\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core3_ring_element.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 3 Ring-Bild: /boss_core3_ring.png -> /HaySpace/boss_core3_ring.png
    if (content.includes('boss_core3_ring.png')) {
      const beforeBossCore3Ring = content;
      
      // Alle Varianten von /boss_core3_ring.png ersetzen
      content = content.replace(/\/boss_core3_ring\.png/g, `${base}boss_core3_ring.png`);
      
      if (content !== beforeBossCore3Ring) {
        const matches = (beforeBossCore3Ring.match(/\/boss_core3_ring\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core3_ring.png reference(s) in ${file}`);
      }
    }
    
    // Boss Core 3-Bild: /boss_core3.png -> /HaySpace/boss_core3.png
    if (content.includes('boss_core3.png')) {
      const beforeBossCore3 = content;
      
      // Alle Varianten von /boss_core3.png ersetzen
      content = content.replace(/\/boss_core3\.png/g, `${base}boss_core3.png`);
      
      if (content !== beforeBossCore3) {
        const matches = (beforeBossCore3.match(/\/boss_core3\.png/g) || []).length;
        console.log(`  → Fixed ${matches} boss_core3.png reference(s) in ${file}`);
      }
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

