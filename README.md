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
├── main.js                 # Einstiegspunkt (106 Zeilen)
│                           # - Canvas-Initialisierung
│                           # - Input-Handling
│                           # - Game-Loop mit Fixed Timestep
│                           # - Koordiniert Game, Renderer und HUD
│
├── game/
│   └── Game.js            # Game-Logik (566 Zeilen)
│                           # - Game-State-Management
│                           # - Player-Physik und Bewegung
│                           # - Enemy-Spawning und AI
│                           # - Collision-Detection
│                           # - Bullet-System
│                           # - Pickup-System
│                           # - Boss-Logik
│                           # - Particle-System
│                           # - Score und Wave-Management
│
├── render/
│   └── GameRenderer.js    # Rendering-Funktionen (333 Zeilen)
│                           # - drawPlayer() - Spieler-Rendering
│                           # - drawEnemy() - Gegner-Rendering
│                           # - drawBoss() - Boss-Rendering
│                           # - drawBullet() - Projektil-Rendering
│                           # - drawPickup() - Pickup-Rendering
│                           # - drawParticle() - Partikel-Effekte
│                           # - drawPopup() - Text-Popups
│                           # - render() - Haupt-Render-Funktion
│                           # - drawGlowCircle() - Glow-Effekte
│                           # - drawRoundedRect() - Abgerundete Rechtecke
│
├── ui/
│   └── HUD.js             # HUD-Rendering (130 Zeilen)
│                           # - Score, Wave, Lives, Weapon-Anzeige
│                           # - Shield- und Heat-Bars
│                           # - Boss-Health-Bar (wenn aktiv)
│                           # - Overheat-Warnung
│
├── systems/
│   ├── AudioSystem.js     # Audio-System
│   │                       # - WebAudio API Integration
│   │                       # - SFX-Funktionen (shoot, hit, upgrade, etc.)
│   │                       # - ensureAudio() - Audio-Context-Management
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
- `state`: 'title', 'play', 'dead', 'win'
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
- **Typen**: Drone, Striker, Tank
- **AI**: Einfache Bewegungsmuster (sinusförmig, linear)
- **Shooting**: Cooldown-basiert, zielt auf Player
- **Drops**: Zufällige Pickups bei Tod

### Boss-System
- **Spawn**: Nach Wave 4
- **Patterns**: Rotierende Projektile, gezielte Bursts, Beam-Attacke
- **Rage-Mode**: Bei <55% HP, Beam-Attacken

### Pickup-System
- **Shield**: Stellt Schild wieder her
- **Speed**: Erhöht Geschwindigkeit (+0.15, max 2.0x)
- **Upgrade**: Erhöht Waffen-Level (max Level 5)

## Erweiterungsmöglichkeiten

### Geplante Features
- Couch Co-op für 2-4 Spieler
- Online Multiplayer mit Lobby
- Mehrere Level
- Erfahrungspunkte und Progression
- Unterschiedliche Waffen
- Spielstände (Save/Load)
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

### Web
- `npm run build` erstellt `dist/` Ordner
- Kann auf GitHub Pages, Netlify, Vercel, etc. deployed werden
- Alle Assets werden automatisch optimiert

### Apple TV
- Option 1: Native tvOS App (Swift/SwiftUI)
- Option 2: Web-App im TV-Browser
- Option 3: Hybrid-Ansatz (WebView in Native App)
- Option 4: React Native (wenn Framework gewünscht)

## Technische Details

- **Canvas-Größe**: 1600x900px
- **Fixed Timestep**: 60 FPS (1/60 Sekunden)
- **Collision Detection**: Circle-based mit `Math.hypot()`
- **Audio**: WebAudio API (procedural SFX, keine externen Assets)
- **Rendering**: Canvas 2D API mit Gradients, Shadows, Glow-Effekten

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
- `main.js`: 106 Zeilen ✅
- `Game.js`: 566 Zeilen ✅
- `GameRenderer.js`: 333 Zeilen ✅
- `HUD.js`: 130 Zeilen ✅
