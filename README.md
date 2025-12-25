# Modern Arcade Space Shooter

Ein modernes Space-Shooter-Spiel im Apple Arcade Stil, entwickelt mit HTML5 Canvas und JavaScript.

## Setup

1. Dependencies installieren:
```bash
npm install
```

2. Development Server starten:
```bash
npm run dev
```
Der Server startet automatisch auf `http://localhost:3000` und öffnet das Spiel im Browser.

3. Build für Production:
```bash
npm run build
```
Erstellt optimierte Dateien im `dist/` Ordner für Deployment.

## Projektstruktur

Das Projekt ist modular aufgebaut, um Wartbarkeit und Skalierbarkeit zu gewährleisten:

```
src/
├── main.js                 # Einstiegspunkt (1133 Zeilen)
│                           # - Canvas-Initialisierung
│                           # - Input-Handling (Keyboard + Gamepad)
│                           # - Game-Loop mit Fixed Timestep
│                           # - UI-Management (Titelbildschirm, Menüs, Settings)
│                           # - Levelauswahl-UI
│                           # - Settings-Menü-Integration
│                           # - Musik-Steuerung (Start/Stop)
│                           # - Koordiniert Game, Renderer und HUD
│
├── game/
│   └── Game.js            # Game-Logik (723 Zeilen)
│                           # - Game-State-Management
│                           # - Player-Physik und Bewegung
│                           # - Enemy-Spawning und AI
│                           # - Collision-Detection
│                           # - Bullet-System
│                           # - Pickup-System
│                           # - Boss-Logik (Level-abhängige Stats & Design)
│                           # - Particle-System
│                           # - Score und Wave-Management
│                           # - Level-abhängige Wellen-Anzahl
│
├── render/
│   └── GameRenderer.js    # Rendering-Funktionen (450+ Zeilen)
│                           # - drawPlayer() - Spieler-Rendering
│                           # - drawEnemy() - Gegner-Rendering
│                           # - drawBoss() - Boss-Rendering (3 verschiedene Designs)
│                           # - drawBullet() - Projektil-Rendering
│                           # - drawPickup() - Pickup-Rendering
│                           # - drawParticle() - Partikel-Effekte
│                           # - drawPopup() - Text-Popups
│                           # - drawWaveMessage() - Wellen-Meldung (Level-abhängig)
│                           # - render() - Haupt-Render-Funktion
│                           # - drawGlowCircle() - Glow-Effekte
│                           # - drawRoundedRect() - Abgerundete Rechtecke
│
├── ui/
│   ├── HUD.js             # HUD-Rendering (263 Zeilen)
│   │                       # - Credits-Anzeige (statt Score)
│   │                       # - Wave, Lives, Weapon-Anzeige
│   │                       # - Shield- und Heat-Bars
│   │                       # - Speed-Boost-Bar
│   │                       # - Boss-Health-Bar (wenn aktiv)
│   │                       # - Overheat-Warnung
│   │                       # - Credits/Wave-Overlay oben rechts
│   │
│   ├── GamepadMenuNavigation.js  # Gamepad-Menü-Navigation (228 Zeilen)
│   │                              # - Automatische Button-Erkennung
│   │                              # - Menü-Navigation mit D-Pad/Stick
│   │                              # - Back-Button-Handling
│   │                              # - Unterstützung für Shop/Werft-Menü
│   │
│   ├── Shop.js            # Shop-UI (279 Zeilen)
│   │                       # - Upgrade-Shop/Werft-Interface
│   │                       # - Grafische Darstellung der Upgrades
│   │                       # - Kauf-Logik und Preis-Anzeige
│   │                       # - Credits-Anzeige
│   │
│   └── DevMode.js         # Dev Mode Panel (280+ Zeilen)
│                           # - Level-Unlock-Funktionen
│                           # - Save-Game-Management
│                           # - Enemy-Übersicht
│                           # - LocalStorage-Anzeige (statisch)
│                           # - Add 10k Credits Button
│
├── systems/
│   ├── AudioSystem.js     # Audio-System (184 Zeilen)
│   │                       # - WebAudio API Integration
│   │                       # - SFX-Funktionen (shoot, hit, upgrade, etc.)
│   │                       # - ensureAudio() - Audio-Context-Management
│   │                       # - Hintergrundmusik-System (Intro, Level 1-5)
│   │                       # - Lautstärke-Kontrolle (Musik & SFX)
│   │                       # - MP3-Audio-Unterstützung
│   │                       # - Autoplay-Policy Workaround
│   │
│   ├── GamepadSystem.js   # Gamepad-System (313 Zeilen)
│   │                       # - Xbox Controller Support
│   │                       # - Bewegung (Left Stick / D-Pad)
│   │                       # - Schießen (A Button / Right Trigger)
│   │                       # - Dash (B Button / Left Trigger)
│   │                       # - Pause (Start Button)
│   │                       # - Menü-Navigation (D-Pad / Left Stick)
│   │
│   ├── UpgradeSystem.js   # Upgrade-System (201 Zeilen)
│   │                       # - Permanent Upgrades (Waffe, Overheat, Speed, Dash, Shield)
│   │                       # - Credits-System (Score = Credits, kumulativ)
│   │                       # - LocalStorage für Upgrades und Credits
│   │                       # - Upgrade-Preise und Stufen-Management
│   │                       # - getGameValues() - Berechnet Spiel-Werte aus Upgrades
│   │
│   └── InputSystem.js     # Input-System (für zukünftige Erweiterungen)
│                           # - Keyboard-Input-Handling
│                           # - Hard-Mode-Toggle
│
├── background/
│   ├── Starfield.js       # Sternenhintergrund
│   │                       # - Parallax-Sterne mit Twinkle-Effekt
│   │                       # - Update- und Render-Logik
│   │
│   └── Nebula.js          # Nebel-Effekte
│                           # - Bewegende Nebel-Wolken
│                           # - Langsame Parallax-Bewegung
│
├── utils/
│   └── math.js            # Math-Utilities
│                           # - clamp() - Werte begrenzen
│                           # - rand() - Zufallszahlen
│                           # - lerp() - Lineare Interpolation
│
├── config.js              # Konfiguration
│                           # - CANVAS_WIDTH, CANVAS_HEIGHT
│
└── styles.css             # CSS-Styles
                            # - Alle visuellen Styles
                            # - CSS-Variablen für Farben
```

## Architektur-Übersicht

### Game-Loop (Fixed Timestep)

Das Spiel verwendet einen **Fixed Timestep** für konsistente Physik unabhängig von der Frame-Rate:

- **Target FPS**: 60 FPS (fixedDT = 1/60)
- **Update-Logik**: Wird mit fester Delta-Time ausgeführt
- **Render-Logik**: Wird mit variabler Frame-Rate ausgeführt
- **Accumulator-Pattern**: Verhindert Frame-Drops bei niedriger Performance

### Game-State-Management

Die `Game`-Klasse verwaltet den gesamten Spielzustand:
- `state`: 'title', 'levelSelect', 'play', 'dead', 'levelComplete', 'gameComplete'
- `currentLevel`: Aktuelles Level (1-3)
- `unlockedLevels`: Array der freigeschalteten Level (gespeichert in LocalStorage)
- `paused`: Pause-Zustand
- `hardMode`: Schwierigkeitsmodus
- Alle Game-Entities (Player, Enemies, Bullets, etc.)

### Rendering-Pipeline

1. **Background**: Gradient → Nebula → Stars
2. **Entities**: Enemies → Boss → Bullets → Pickups → Player
3. **Effects**: Particles → Popups
4. **UI**: Pause-Overlay → Shake-Effekt → Vignette → HUD

### Module-Kommunikation

- **main.js** → erstellt `Game`-Instanz, koordiniert Update und Render
- **Game.js** → enthält alle Game-Logik, gibt State an Renderer weiter
- **GameRenderer.js** → rendert alle visuellen Elemente basierend auf Game-State
- **HUD.js** → rendert UI-Overlay basierend auf Game-State

## Wichtige Konzepte

### Player-System
- **Hitbox**: `player.r` (10px) für Schaden
- **Collection-Radius**: `player.collectRadius` (25px) für Pickups
- **Speed-Boost**: Multiplikator für Bewegung (1.0 - 2.0)
- **Weapon-Levels**: 1-5, beeinflusst Schussmuster
- **Heat-System**: Overheat bei 100%, muss auf 0% abkühlen

### Enemy-System
- **Typen**: Je nach Level unterschiedlich (siehe Levelsystem)
- **AI**: Einfache Bewegungsmuster (sinusförmig, linear)
- **Shooting**: Cooldown-basiert, zielt auf Player
- **Drops**: Zufällige Pickups bei Tod

### Boss-System
- **Spawn**: Level-abhängig (Level 1: Welle 6, Level 2: Welle 7, Level 3: Welle 8)
- **Stats-Skalierung**: 
  - Level 1: 420 HP (Normal) / 520 HP (Hard)
  - Level 2: 525 HP (Normal) / 650 HP (Hard), +25% HP, aggressiver
  - Level 3: 630 HP (Normal) / 780 HP (Hard), +50% HP, deutlich aggressiver
- **Designs**: 
  - Level 1: Rechteckiges Design (Rot/Pink)
  - Level 2: Hexagonales Design (Lila/Violett, rotierend)
  - Level 3: Oktagonales Design (Orange/Rot, Spikes, rotierende Ringe)
- **Schussmuster**: 
  - Level 1: 10-12 Petals, 0.6s Cooldown
  - Level 2: 11-13 Petals, 0.55s Cooldown, schnellere Rate
  - Level 3: 12-14 Petals, 0.5s Cooldown, schnellste Rate
- **Patterns**: Rotierende Projektile, gezielte Bursts, Beam-Attacke
- **Rage-Mode**: Bei <55% HP, Beam-Attacken

### Pickup-System
- **Shield**: Stellt Schild wieder her
- **Speed/Upgrade Pickups**: Entfernt (ersetzt durch permanent Shop-Upgrades)

### Upgrade-Shop-System
- **Permanent Upgrades**: Werden im Shop gekauft und bleiben erhalten
- **Upgrade-Typen**:
  - **Waffe**: 2 Stufen (1→2→3 Schüsse gleichzeitig)
  - **Overheat Protection**: 3 Stufen (15%, 30%, 50% langsamer)
  - **Speed Boost**: 5 Stufen (+0.2, +0.4, +0.6, +0.8, +1.0 auf Basis 1.0)
  - **Dash System**: 1 Stufe (aktiviert/deaktiviert)
  - **Shield**: 5 Stufen (+20%, +40%, +60%, +80%, +100%)
- **Credits-System**: Score = Credits, kumulativ, verfallen nicht bei Tod
- **Speicherung**: Upgrades und Credits im LocalStorage
- **Menü-Struktur**: Seite 3 (Game Menu: Level-Auswahl/Werft), Seite 4 (Level-Auswahl)

## Erweiterungsmöglichkeiten

### Levelsystem

Das Spiel besteht aus **5 Leveln**, die nacheinander freigeschaltet werden:

#### Level-Freischaltung
- **Level 1**: Immer verfügbar
- **Level 2-5**: Werden nacheinander nach Abschluss des vorherigen Levels freigeschaltet
- Freigeschaltete Level werden im **LocalStorage** gespeichert (Key: `'unlockedLevels'`, Value: JSON-Array wie `[1,2,3,4,5]`)

#### Gegner-Typen je Level

**Level 1 (Original-Gegner):**
- **Drone** (Hue: 340, Rot): Kleiner, schnell, 2-3 HP, Score: 25
- **Striker** (Hue: 330, Rot): Mittel, bewegt sich seitlich, 4-6 HP, Score: 45
- **Tank** (Hue: 350, Rot): Groß, langsam, 10-14 HP, Score: 90, hat HP-Bar

**Level 2 (Neue Gegner-Typen):**
- **Hunter** (Hue: 200, Cyan): Schnell, bewegt sich seitlich, 4-5 HP, Score: 40
- **Crusher** (Hue: 280, Lila): Mittel, 6-8 HP, Score: 60
- **Guardian** (Hue: 50, Gelb-Grün): Groß, langsam, 14-18 HP, Score: 110, hat HP-Bar

**Level 3 (Schwerste Gegner):**
- **Hunter** (wie Level 2)
- **Crusher** (wie Level 2)
- **Guardian** (wie Level 2)
- **Destroyer** (Hue: 10, Rot-Orange): Sehr groß, langsam, 20-24 HP, Score: 150, hat HP-Bar

#### Wellen-System
- **Level 1**: 5 normale Wellen + Boss (Boss bei Welle 6)
- **Level 2**: 6 normale Wellen + Boss (Boss bei Welle 7)
- **Level 3**: 7 normale Wellen + Boss (Boss bei Welle 8)
- **Level 4**: 8 normale Wellen + Boss (Boss bei Welle 9)
- **Level 5**: 9 normale Wellen + Boss (Boss bei Welle 10)
- **Formel**: `bossWave = 5 + currentLevel`
- **Gegner-Anzahl**: Skaliert mit Wellennummer (`6 + n*2 + (hardMode?2:0)`)

#### Level-Ende
- Nach Abschluss eines Levels (Boss besiegt) erscheint ein Overlay mit Gratulation
- **Level 1-4**: Optionen "Nächstes Level" oder "Zur Levelauswahl"
- **Level 5**: Nur "Zur Levelauswahl" (Spiel-Ende)

#### Code-Stellen
- **Gegner-Auswahl je Level**: `src/game/Game.js`, Zeilen 196-216 (`spawnWave()`)
- **Gegner-Eigenschaften**: `src/game/Game.js`, Zeilen 118-193 (`spawnEnemy()`)
- **Level-Freischaltung**: `src/game/Game.js`, Zeilen 56-70 (`getUnlockedLevels()`, `unlockLevel()`)
- **Level-Ende-Logik**: `src/game/Game.js`, Zeilen 577-579
- **Boss-Spawn-Logik**: `src/game/Game.js`, Zeilen 630-640 (Level-abhängige Boss-Welle)
- **Boss-Stats**: `src/game/Game.js`, Zeilen 218-245 (`spawnBoss()`)
- **Boss-Designs**: `src/render/GameRenderer.js`, Zeilen 127-250 (`drawBoss()`)
- **Wellen-Meldung**: `src/render/GameRenderer.js`, Zeilen 335-382 (`drawWaveMessage()`)

### Implementierte Features (Neueste Updates)

#### Gamepad-Support
- ✅ Xbox Controller Support (Gameplay)
  - Bewegung: Left Stick / D-Pad
  - Schießen: A Button / Right Trigger
  - Dash: B Button / Left Trigger
  - Pause: Start Button (drei Balken)
- ✅ Gamepad-Menü-Navigation
  - Navigation durch alle Menüs mit D-Pad / Left Stick
  - Automatische Button-Erkennung
  - Back-Button-Handling (B Button)
  - Fokus-Highlighting für aktiven Button

#### Audio-System
- ✅ Hintergrundmusik für Titelbildschirm (Intro.mp3)
- ✅ Level-spezifische Hintergrundmusik (Level1-5.mp3)
- ✅ Musik-Lautstärke-Kontrolle (0-100%)
- ✅ Soundeffekte-Lautstärke-Kontrolle (0-100%)
- ✅ Settings-Menü mit Slidern
- ✅ Autoplay-Policy Workaround
- ✅ Musik-Steuerung (Start/Stop basierend auf Spielzustand)

#### Boss-System
- ✅ Level-abhängige Boss-Stats (HP, Schussrate, Petals)
- ✅ Verschiedene Boss-Designs pro Level
  - Level 1: Rechteckig (Rot/Pink)
  - Level 2: Hexagonal (Lila/Violett, rotierend)
  - Level 3: Oktagonal (Orange/Rot, Spikes, rotierende Ringe)
- ✅ Level-abhängige Boss-Wellen (Level 1: Welle 6, Level 2: Welle 7, Level 3: Welle 8)

#### Wellen-System
- ✅ Level-abhängige Anzahl von Wellen vor dem Boss
- ✅ Korrekte Wellen-Meldung (zeigt "WAVE X" statt "BOSS WAVE" für normale Wellen)

#### UI-System
- ✅ Settings-Menü integriert in Hauptmenü-Karte
- ✅ Konsistente Menü-Navigation
- ✅ Musik-Steuerung über UI
- ✅ Upgrade-Shop/Werft-Interface
- ✅ Credits-Anzeige (statt Score)
- ✅ Neue Menü-Struktur (Game Menu, Shop, Level-Auswahl)

#### Upgrade-System
- ✅ Permanent Upgrade-Shop
- ✅ 5 Upgrade-Typen mit mehreren Stufen
- ✅ Credits-System (Score = Credits, kumulativ)
- ✅ LocalStorage für Upgrades und Credits
- ✅ Upgrades werden beim Level-Start angewendet
- ✅ Pickups entfernt (nur Shield bleibt)

### Geplante Features
- Couch Co-op für 2-4 Spieler
- Online Multiplayer mit Lobby
- Erfahrungspunkte und Progression
- Unterschiedliche Waffen
- Spielstände (Save/Load) - Teilweise implementiert (Level-Freischaltung)
- Raumschiff-Upgrades
- Apple TV Deployment

### Empfohlene Struktur für neue Features

**Multiplayer:**
- `src/network/` - Netzwerk-Logik
- `src/game/PlayerManager.js` - Multiplayer-Player-Verwaltung

**Level-System:**
- `src/levels/` - Level-Definitionen
- `src/game/LevelManager.js` - Level-Progression

**Progression:**
- `src/progression/` - XP, Upgrades, Unlocks
- `src/data/` - Save-Game-Datenstrukturen

**Waffen-System:**
- `src/weapons/` - Waffen-Definitionen
- `src/game/WeaponSystem.js` - Waffen-Logik

## Code-Stil

- **ES6 Modules**: Alle Dateien verwenden `import/export`
- **Klassen**: Für komplexe Systeme (Game, Starfield, Nebula)
- **Funktionen**: Für Rendering und Utilities
- **Konstanten**: In `config.js` zentralisiert
- **Naming**: camelCase für Variablen/Funktionen, PascalCase für Klassen

## Deployment

### GitHub Pages (Aktuell implementiert)

Das Spiel ist automatisch für GitHub Pages konfiguriert und wird bei jedem Push automatisch deployed.

#### Automatisches Deployment

1. **GitHub Actions Workflow**: `.github/workflows/deploy.yml`
   - Wird automatisch bei jedem Push auf `main` ausgelöst
   - Baut das Projekt mit Vite
   - Korrigiert Base-Pfade für GitHub Pages Subpath
   - Deployed automatisch zu GitHub Pages

2. **GitHub Pages aktivieren**:
   - Repository Settings → Pages
   - Source: "GitHub Actions"
   - Das Spiel ist dann erreichbar unter: `https://[username].github.io/[repository-name]/`

#### Base-Path-Konfiguration

GitHub Pages hostet das Spiel unter einem Subpath (z.B. `/HaySpace/`), nicht im Root. Das Projekt verwendet ein Post-Build-Script, um alle Asset-Pfade automatisch anzupassen:

- **Script**: `scripts/fix-base-path.js`
- **Funktion**: Ersetzt alle absoluten Pfade (`/assets/`, `/backround-music/`, `/hayspace-cover.png`) mit dem korrekten Base-Path
- **Automatisch**: Wird im GitHub Actions Workflow ausgeführt

#### Manuelles Deployment

Falls du manuell deployen möchtest:

```bash
# Build erstellen
npm run build

# Base-Path für GitHub Pages korrigieren (wenn nötig)
# Das Script wird automatisch im GitHub Actions Workflow ausgeführt
# Für lokales Testen: Setze GITHUB_REPOSITORY_NAME Umgebungsvariable
$env:GITHUB_REPOSITORY_NAME="HaySpace"
node scripts/fix-base-path.js

# dist/ Ordner zu gh-pages Branch pushen (alternativ zu GitHub Actions)
```

#### Troubleshooting

**Problem: Weißer Bildschirm oder Assets laden nicht**
- **Ursache**: Browser-Cache (besonders Chrome)
- **Lösung**: 
  - Hard Refresh: `Ctrl + Shift + R` (Windows) oder `Cmd + Shift + R` (Mac)
  - DevTools öffnen → Rechtsklick auf Reload → "Empty Cache and Hard Reload"
  - Cache komplett löschen: `Ctrl + Shift + Delete`

**Problem: Musik oder Cover-Bild fehlt**
- **Ursache**: Pfade in JavaScript/CSS-Dateien nicht korrigiert
- **Lösung**: Stelle sicher, dass `scripts/fix-base-path.js` im GitHub Actions Workflow ausgeführt wird

**Problem: GitHub Pages zeigt 404**
- **Ursache**: GitHub Pages nicht aktiviert oder falsch konfiguriert
- **Lösung**: 
  1. Repository Settings → Pages
  2. Source: "GitHub Actions" wählen
  3. Falls nicht verfügbar: Zuerst manuell von `gh-pages` Branch deployen, dann zu GitHub Actions wechseln

### Andere Deployment-Optionen

#### Netlify / Vercel
- `npm run build` erstellt `dist/` Ordner
- `dist/` Ordner hochladen oder Git-Integration nutzen
- **Wichtig**: Base-Path auf `/` setzen (nicht wie bei GitHub Pages)

#### Eigener Server
- `npm run build` ausführen
- `dist/` Ordner auf Server hochladen
- Web-Server konfigurieren (z.B. Nginx, Apache)

### Apple TV (Zukünftig)
- Option 1: Native tvOS App (Swift/SwiftUI)
- Option 2: Web-App im TV-Browser
- Option 3: Hybrid-Ansatz (WebView in Native App)
- Option 4: React Native (wenn Framework gewünscht)

## Audio-System

### Hintergrundmusik
- **Intro-Musik**: `/public/backround-music/Intro.mp3`
  - Startet automatisch auf dem Titelbildschirm
  - Läuft im Loop
  - Stoppt, wenn ein Level gestartet wird
  - Startet wieder, wenn zum Titelbildschirm zurückgekehrt wird
- **Level-Musik**: `/public/backround-music/Level1.mp3`, `Level2.mp3`, `Level3.mp3`
  - Startet automatisch beim Level-Start
  - Läuft im Loop während des Levels
  - Läuft weiter, wenn über Pausenmenü zu Level Select navigiert wird
  - Stoppt, wenn zum Titelbildschirm zurückgekehrt wird
- **Autoplay-Policy**: Workaround für Browser, die Autoplay blockieren
  - Musik startet beim ersten Benutzerinteraktion (Klick/Tastendruck)
  - Implementiert in `src/main.js` (Event-Listener)

### Soundeffekte
- **Procedural SFX**: Generiert mit WebAudio API
  - `shoot`: Schuss-Sound
  - `overheat`: Overheat-Warnung
  - `shield`: Schild-Pickup
  - `upgrade`: Waffen-Upgrade
  - `hit`: Spieler-Treffer

### Lautstärke-Kontrolle
- **Settings-Menü**: Zwei separate Slider für Musik und Soundeffekte
- **Speicherung**: Einstellungen werden im LocalStorage gespeichert
  - `musicVolume`: 0-1 (Standard: 0.5)
  - `sfxVolume`: 0-1 (Standard: 1.0)
- **Code-Stellen**:
  - Settings-UI: `index.html` (Settings-Menü)
  - Lautstärke-Funktionen: `src/systems/AudioSystem.js`
  - Settings-Logik: `src/main.js` (loadSettings, Slider-Event-Handler)

## UI-System

### Menü-Struktur
1. **Titelbildschirm** (`titleScreen`)
   - "Start Your Journey" Button
   - Starfield-Animation im Hintergrund
   - Intro-Musik läuft

2. **Hauptmenü** (`mainMenuSection`)
   - New Game Button
   - Continue Button
   - Settings Button
   - Back to Title Button
   - Alle in einer Karte (`mainMenuCard`)

3. **Game Menu** (`gameMenuContent`) - Seite 3
   - Level Select Button (führt zu Seite 4)
   - Werft Button (Shop für Upgrades)
   - Back Button

4. **Level-Auswahl** (`levelSelectContent`) - Seite 4
   - Wird in der gleichen Karte wie Hauptmenü angezeigt
   - Dynamische Level-Buttons (gesperrt/freigeschaltet)
   - Back Button (zurück zu Game Menu)

5. **Shop/Werft** (`shopContent`)
   - Upgrade-Shop-Interface
   - Grafische Darstellung aller Upgrades
   - Aktuelle Stufe, nächste Stufe, Preis
   - Credits-Anzeige
   - Back Button (zurück zu Game Menu)

6. **Settings-Menü** (`settingsContent`)
   - Wird in der gleichen Karte wie Hauptmenü angezeigt
   - Musik-Lautstärke-Slider (0-100%)
   - Soundeffekte-Lautstärke-Slider (0-100%)
   - Back Button

5. **Pause-Menü** (`pauseMenu`)
   - Resume Button
   - Level Select Button

6. **Level Complete** (`levelComplete`)
   - Gratulation
   - Next Level Button (Level 1-2)
   - Level Select Button

7. **Game Complete** (`gameComplete`)
   - Gratulation für alle 3 Level
   - Level Select Button

### Code-Stellen
- HTML-Struktur: `index.html`
- UI-Logik: `src/main.js` (showScreen, Event-Handler)
- CSS-Styling: `src/styles.css`

## Technische Details

- **Canvas-Größe**: 1600x900px
- **Fixed Timestep**: 60 FPS (1/60 Sekunden)
- **Collision Detection**: Circle-based mit `Math.hypot()`
- **Input**: 
  - Keyboard (Pfeiltasten, Space, P, Enter)
  - Gamepad (Xbox Controller via Web Gamepad API)
- **Audio**: 
  - WebAudio API für procedural SFX
  - HTML5 Audio für Hintergrundmusik (MP3)
  - Lautstärke-Kontrolle für beide Systeme
- **Rendering**: Canvas 2D API mit Gradients, Shadows, Glow-Effekten
- **LocalStorage**: 
  - `unlockedLevels`: Array der freigeschalteten Level
  - `musicVolume`: Musik-Lautstärke (0-1)
  - `sfxVolume`: Soundeffekte-Lautstärke (0-1)
  - `upgrades`: Upgrade-Daten (Upgrade-Stufen und Credits)
    - Format: `{upgrades: {weapon, overheat, speed, dash, shield}, credits: number}`

## Entwicklung

### Lokales Testen
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Teste Production-Build lokal
```

### Dateigrößen-Guidelines
- **Ideal**: 200-500 Zeilen pro Datei
- **Akzeptabel**: 500-800 Zeilen
- **Zu groß**: >1000 Zeilen → sollte aufgeteilt werden

Aktuelle Dateigrößen:
- `main.js`: 1307 Zeilen ⚠️ (erweitert durch UI-Management und Upgrade-System)
- `Game.js`: 901 Zeilen ✅
- `GameRenderer.js`: 450+ Zeilen ✅
- `GamepadSystem.js`: 313 Zeilen ✅
- `GamepadMenuNavigation.js`: 228 Zeilen ✅
- `Shop.js`: 279 Zeilen ✅
- `UpgradeSystem.js`: 201 Zeilen ✅
- `HUD.js`: 263 Zeilen ✅
- `AudioSystem.js`: 184 Zeilen ✅
- `DevMode.js`: 280+ Zeilen ✅
