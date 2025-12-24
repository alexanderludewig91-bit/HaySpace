import { rand } from './utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { ensureAudio, startBackgroundMusic, stopBackgroundMusic, startLevelMusic, stopLevelMusic, setMusicVolume, setSFXVolume, getMusicVolume, getSFXVolume } from './systems/AudioSystem.js';
import { Game } from './game/Game.js';
import { render } from './render/GameRenderer.js';
import { drawHUD, drawScoreOverlay } from './ui/HUD.js';
import { Starfield } from './background/Starfield.js';
import { initDevMode } from './ui/DevMode.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;

// DOM Elements
const overlay = document.getElementById('overlay');
const titleScreen = document.getElementById('titleScreen');
const startJourneySection = document.getElementById('startJourneySection');
const mainMenuSection = document.getElementById('mainMenuSection');
const mainMenuCard = document.getElementById('mainMenuCard');
const mainMenuButtons = document.getElementById('mainMenuButtons');
const levelSelectContent = document.getElementById('levelSelectContent');
const settingsContent = document.getElementById('settingsContent');
const levelSelect = document.getElementById('levelSelect');
const levelList = document.getElementById('levelList');
const levelComplete = document.getElementById('levelComplete');
const gameComplete = document.getElementById('gameComplete');
const pauseMenu = document.getElementById('pauseMenu');
const startJourneyBtn = document.getElementById('startJourneyBtn');
const newGameBtn = document.getElementById('newGameBtn');
const continueBtn = document.getElementById('continueBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backToTitleFromMainBtn = document.getElementById('backToTitleFromMainBtn');
const resumeBtn = document.getElementById('resumeBtn');
const pauseToLevelSelectBtn = document.getElementById('pauseToLevelSelectBtn');
const backToTitleBtn = document.getElementById('backToTitleBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const backToLevelSelectBtn = document.getElementById('backToLevelSelectBtn');
const backToLevelSelectFromCompleteBtn = document.getElementById('backToLevelSelectFromCompleteBtn');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteText = document.getElementById('levelCompleteText');
const newGameWarning = document.getElementById('newGameWarning');
const confirmNewGameBtn = document.getElementById('confirmNewGameBtn');
const cancelNewGameBtn = document.getElementById('cancelNewGameBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
const musicVolumeValue = document.getElementById('musicVolumeValue');
const sfxVolumeValue = document.getElementById('sfxVolumeValue');

// Input
const keys = new Set();
let hardMode = false;
let levelCompleteDelayStarted = false;
let levelCompleteTime = 0;

// Game instance
const game = new Game();

// Starfield für Titelbildschirm
const titleStarfieldCanvas = document.getElementById('titleStarfield');
const titleStarfieldCtx = titleStarfieldCanvas.getContext('2d');
let titleStarfieldVisible = true;
let titleStarfieldTime = 0;

// Canvas-Größe an Fenstergröße anpassen
function resizeTitleStarfield() {
  titleStarfieldCanvas.width = window.innerWidth;
  titleStarfieldCanvas.height = window.innerHeight;
  
  // Starfield neu initialisieren mit neuer Größe
  if (titleStarfield) {
    titleStarfield = createTitleStarfield();
  }
}

function createTitleStarfield() {
  const starfield = {
    stars: Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() < 0.85 ? rand(0.6, 1.6) : rand(1.8, 3.0),
      v: rand(14, 55),
      a: rand(0.18, 0.85),
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.5, 1.5)
    })),
    update(dt) {
      for (const s of this.stars) {
        s.y += s.v * dt;
        s.twinklePhase += s.twinkleSpeed * dt;
        if (s.y > window.innerHeight + 30) {
          s.y = -30;
          s.x = Math.random() * window.innerWidth;
        }
      }
    },
    render(ctx) {
      for (const s of this.stars) {
        ctx.save();
        const twinkle = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(s.twinklePhase));
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = 'rgba(245,250,255,0.9)';
        ctx.fillRect(s.x, s.y, s.r, s.r);
        ctx.restore();
      }
    }
  };
  return starfield;
}

let titleStarfield = createTitleStarfield();
window.addEventListener('resize', resizeTitleStarfield);
resizeTitleStarfield();

// Starfield für Levelauswahl entfernt - nur auf Titelbildschirm

// Levelauswahl rendern
function renderLevelSelect() {
  levelList.innerHTML = '';
  const unlocked = game.getUnlockedLevels();
  
  // Erst alle Buttons erstellen und zum DOM hinzufügen
  const buttons = [];
  for (let i = 1; i <= 5; i++) {
    const levelBtn = document.createElement('button');
    levelBtn.className = 'btn';
    levelBtn.style.width = '100%';
    levelBtn.style.textAlign = 'center';
    levelBtn.style.padding = '20px 30px';
    levelBtn.style.display = 'flex';
    levelBtn.style.justifyContent = 'center';
    levelBtn.style.alignItems = 'center';
    levelBtn.style.gap = '10px';
    
    // Für Animation vorbereiten - komplett unsichtbar
    levelBtn.style.opacity = '0';
    levelBtn.style.transform = 'scale(0.9) translateY(10px)';
    levelBtn.style.visibility = 'hidden'; // Zusätzlich verstecken
    
    if (unlocked.includes(i)) {
      levelBtn.innerHTML = `<span><b>LEVEL ${i}</b></span>`;
      levelBtn.onclick = () => startLevel(i);
    } else {
      levelBtn.innerHTML = `<span><b>LEVEL ${i}</b> 🔒</span>`;
      levelBtn.disabled = true;
      levelBtn.style.cursor = 'not-allowed';
    }
    
    levelList.appendChild(levelBtn);
    buttons.push({ btn: levelBtn, index: i, unlocked: unlocked.includes(i) });
  }
  
  // Nachdem alle Buttons gerendert wurden, Animation starten
  requestAnimationFrame(() => {
    buttons.forEach(({ btn, index, unlocked }) => {
      btn.style.visibility = 'visible'; // Sichtbar machen für Animation
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 2) btn.classList.add('level-button-enter-delay-1');
        if (index === 3) btn.classList.add('level-button-enter-delay-2');
        if (index === 4) btn.classList.add('level-button-enter-delay-2'); // Gleiche Delay wie Level 3
        if (index === 5) btn.classList.add('level-button-enter-delay-2'); // Gleiche Delay wie Level 3
        
        // Animation-Klassen nach Animation entfernen
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
          // Bei gesperrten Buttons Opacity auf 0.5 setzen
          if (!unlocked) {
            btn.style.opacity = '0.5';
          }
        }, 500);
      }, 200 + (index - 1) * 100); // 200ms, 300ms, 400ms, 500ms, 600ms Delay
    });
  });
}

function showScreen(screenName) {
  // titleScreen wird nicht versteckt, wenn levelSelect angezeigt wird (gleiche Karte)
  if (screenName !== 'levelSelect' && screenName !== 'title') {
    titleScreen.classList.add('hidden');
  }
  // levelSelect wird nur versteckt, wenn es nicht angezeigt werden soll
  if (screenName !== 'levelSelect') {
    levelSelect.classList.add('hidden');
  }
  levelComplete.classList.add('hidden');
  gameComplete.classList.add('hidden');
  pauseMenu.classList.add('hidden');
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  // devModePanel wird NICHT hier versteckt, da es ein Overlay ist, das unabhängig funktioniert
  
  if (screenName === 'title') {
    titleScreen.classList.remove('hidden');
    startJourneySection.classList.remove('hidden');
    mainMenuSection.classList.add('hidden');
    // Levelauswahl-Content verstecken, Hauptmenü-Buttons wieder anzeigen
    if (levelSelectContent) {
      levelSelectContent.style.display = 'none';
    }
    // Settings-Content verstecken
    if (settingsContent) {
      settingsContent.style.display = 'none';
    }
    if (mainMenuButtons) {
      mainMenuButtons.style.display = 'flex';
      mainMenuButtons.style.flexDirection = 'column';
      mainMenuButtons.style.gap = '16px';
    }
    // Sterne wieder anzeigen, wenn zum Titelbildschirm zurückgekehrt wird
    titleStarfieldVisible = true;
    titleStarfieldCanvas.style.opacity = '1';
    titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-in';
    // Level-Musik stoppen und Titelmusik starten
    stopLevelMusic();
    ensureAudio();
    startBackgroundMusic();
  }
  else if (screenName === 'levelSelect') {
    // titleScreen bleibt sichtbar (gleiche Karte)
    titleScreen.classList.remove('hidden');
    // startJourneySection verstecken
    startJourneySection.classList.add('hidden');
    // Hauptmenü-Section muss sichtbar bleiben, da die Karte dort ist
    mainMenuSection.classList.remove('hidden');
    // levelSelect-Screen wird nicht benötigt, da alles in titleScreen ist
    // levelSelect bleibt versteckt, da die Karte in titleScreen ist
    // Hauptmenü-Buttons ausblenden
    if (mainMenuButtons) {
      mainMenuButtons.style.display = 'none';
    }
    // Levelauswahl-Content einblenden
    if (levelSelectContent) {
      levelSelectContent.style.display = 'block';
      // Sanfte Animation für Levelauswahl-Buttons
      renderLevelSelect();
    }
  }
  else if (screenName === 'levelComplete') levelComplete.classList.remove('hidden');
  else if (screenName === 'gameComplete') gameComplete.classList.remove('hidden');
  else if (screenName === 'pause') {
    pauseMenu.classList.remove('hidden');
  }
  else if (screenName === 'settings') {
    // titleScreen bleibt sichtbar (gleiche Karte)
    titleScreen.classList.remove('hidden');
    // startJourneySection verstecken
    startJourneySection.classList.add('hidden');
    // Hauptmenü-Section muss sichtbar bleiben, da die Karte dort ist
    mainMenuSection.classList.remove('hidden');
    // Hauptmenü-Buttons ausblenden
    if (mainMenuButtons) {
      mainMenuButtons.style.display = 'none';
    }
    // Levelauswahl-Content verstecken, falls sichtbar
    if (levelSelectContent) {
      levelSelectContent.style.display = 'none';
    }
    // Settings-Content einblenden
    if (settingsContent) {
      settingsContent.style.display = 'block';
    }
  }
  else if (screenName === 'newGameWarning') {
    // Titelbildschirm sichtbar lassen, damit das Menü im Hintergrund bleibt
    titleScreen.classList.remove('hidden');
    // Hauptmenü-Section sichtbar lassen
    mainMenuSection.classList.remove('hidden');
    // Warnmeldung-Container anzeigen (enthält Overlay und Warnmeldung)
    const newGameWarningContainer = document.getElementById('newGameWarningContainer');
    if (newGameWarningContainer) {
      newGameWarningContainer.classList.remove('hidden');
    }
  }
  // devMode wird nicht über showScreen gehandhabt, da es ein Overlay ist
  
  if (screenName !== 'pause') {
    overlay.classList.remove('hidden');
  }
}

function showPauseMenu() {
  if (game.state === 'play') {
    game.paused = true;
    showScreen('pause');
    overlay.classList.remove('hidden');
  }
}

function hidePauseMenu() {
  if (game.state === 'play' && game.paused) {
    game.paused = false;
    pauseMenu.classList.add('hidden');
    overlay.classList.add('hidden');
  }
}

function resetLocalStorage() {
  localStorage.removeItem('unlockedLevels');
  game.unlockedLevels = [1];
}

function loadFromLocalStorage() {
  game.unlockedLevels = game.getUnlockedLevels();
}

function startLevel(level) {
  ensureAudio();
  // Level-Musik starten
  startLevelMusic(level);
  game.setLevel(level);
  game.resetAll();
  game.state = 'play';
  game.paused = false;
  game.hardMode = hardMode;
  overlay.classList.add('hidden');
  // Alle Screens verstecken, damit Canvas wieder sichtbar wird
  titleScreen.classList.add('hidden');
  levelSelect.classList.add('hidden');
  // Levelauswahl-Content verstecken
  const levelSelectContent = document.getElementById('levelSelectContent');
  if (levelSelectContent) {
    levelSelectContent.style.display = 'none';
  }
  // Hauptmenü-Buttons verstecken
  const mainMenuButtons = document.getElementById('mainMenuButtons');
  if (mainMenuButtons) {
    mainMenuButtons.style.display = 'none';
  }
  // Delay-Variablen zurücksetzen
  levelCompleteDelayStarted = false;
  levelCompleteTime = 0;
  game.bossDefeated = false;
  game.spawnWave(game.wave);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys.add(e.code);

  // Enter key wird jetzt separat für title screen gehandhabt
  if (e.code === 'KeyR') restart();
  if (e.code === 'KeyP' || (e.code === 'Enter' && game.state === 'play')) {
    if (game.state === 'play') {
      e.preventDefault();
      if (game.paused) {
        hidePauseMenu();
      } else {
        showPauseMenu();
      }
    }
  }
}, {passive:false});

window.addEventListener('keyup', (e) => keys.delete(e.code));

function restart(){
  if (game.state !== 'play') return;
  game.resetAll();
  game.state = 'play';
  game.hardMode = hardMode;
  game.spawnWave(game.wave);
}

// Start Journey Button
startJourneyBtn.addEventListener('click', () => {
  ensureAudio();
  
  // Sterne ausblenden
  titleStarfieldVisible = false;
  titleStarfieldCanvas.style.opacity = '0';
  titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-out';
  
  // Start Journey Button ausblenden mit Animation
  startJourneyBtn.classList.add('start-journey-exit');
  
  // Nach der Ausblend-Animation die Section verstecken und Hauptmenü einblenden
  setTimeout(() => {
    startJourneySection.classList.add('hidden');
    startJourneyBtn.classList.remove('start-journey-exit');
    
    // Hauptmenü Section sichtbar machen (aber noch unsichtbar für Animation)
    mainMenuSection.classList.remove('hidden');
    
    // Hauptmenü-Karte für Animation vorbereiten
    const mainMenuCard = mainMenuSection.querySelector('.card');
    if (mainMenuCard) {
      mainMenuCard.style.opacity = '0';
      mainMenuCard.style.transform = 'scale(0.85) translateY(15px)';
      mainMenuCard.classList.add('level-select-enter');
      
      setTimeout(() => {
        mainMenuCard.classList.add('level-select-enter');
        setTimeout(() => {
          mainMenuCard.classList.remove('level-select-enter');
          mainMenuCard.style.opacity = '';
          mainMenuCard.style.transform = '';
        }, 600);
      }, 50);
    }
    
    // Buttons nacheinander einblenden mit Animation
    const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.9) translateY(10px)';
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 1) btn.classList.add('level-button-enter-delay-1');
        if (index === 2) btn.classList.add('level-button-enter-delay-2');
        if (index === 3) btn.classList.add('level-button-enter-delay-2'); // Gleiche Delay wie Button 2
        
        // Animation-Klassen nach Animation entfernen
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 500);
      }, 200 + (index * 100)); // 200ms, 300ms, 400ms, 500ms Delay
    });
  }, 600);
});

// New Game Button
newGameBtn.addEventListener('click', () => {
  ensureAudio();
  
  // Prüfen, ob ein Spielstand existiert
  const existingSave = localStorage.getItem('unlockedLevels');
  const unlockedLevels = existingSave ? JSON.parse(existingSave) : [1];
  
  // Wenn mehr als nur Level 1 freigeschaltet ist, Warnung anzeigen
  if (unlockedLevels.length > 1 || (unlockedLevels.length === 1 && unlockedLevels[0] > 1)) {
    showScreen('newGameWarning');
  } else {
    // Kein Spielstand vorhanden, direkt fortfahren
    resetLocalStorage();
    transitionToLevelSelect();
  }
});

// Funktion für Übergang zur Levelauswahl (Karte bleibt, Buttons werden getauscht)
function transitionToLevelSelect() {
  // Sicherstellen, dass titleScreen und mainMenuSection sichtbar sind
  // WICHTIG: Das muss SOFORT passieren, nicht erst nach dem Timeout
  titleScreen.classList.remove('hidden');
  mainMenuSection.classList.remove('hidden');
  startJourneySection.classList.add('hidden');
  
  // Hauptmenü-Buttons ausblenden mit Animation
  const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
  menuButtons.forEach((btn, index) => {
    btn.classList.add('start-journey-exit');
  });
  
  setTimeout(() => {
    // Hauptmenü-Buttons verstecken
    if (mainMenuButtons) {
      mainMenuButtons.style.display = 'none';
    }
    
    // WICHTIG: Karte auf Hauptmenü-Größe setzen, BEVOR Content eingeblendet wird
    // Dies verhindert, dass die Karte schlagartig größer wird
    if (mainMenuCard) {
      mainMenuCard.style.width = 'min(500px, 92vw)';
      mainMenuCard.style.maxWidth = '500px';
    }
    
    // Levelauswahl rendern BEVOR der Content eingeblendet wird
    renderLevelSelect();
    
    // Levelauswahl-Content einblenden (aber Karte bleibt bei kleiner Größe)
    if (levelSelectContent) {
      levelSelectContent.style.display = 'block';
    }
    
    // Levelauswahl-Screen anzeigen
    showScreen('levelSelect');
    
    // Karte vergrößern mit Animation (nachdem alles gerendert wurde)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mainMenuCard) {
          mainMenuCard.classList.add('card-expanding');
          // Nach Animation die explizite Breite entfernen, damit die Standard-Card-Größe greift
          setTimeout(() => {
            mainMenuCard.classList.remove('card-expanding');
            mainMenuCard.style.width = '';
            mainMenuCard.style.maxWidth = '';
          }, 600);
        }
      });
    });
  }, 600);
}

// Bestätigen: Neues Spiel starten
confirmNewGameBtn.addEventListener('click', () => {
  ensureAudio();
  // Warnmeldung-Container verstecken
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  resetLocalStorage();
  transitionToLevelSelect();
});

// Abbrechen: Zurück zum Hauptmenü
cancelNewGameBtn.addEventListener('click', () => {
  ensureAudio();
  // Warnmeldung-Container verstecken (enthält Overlay und Warnmeldung)
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  // titleScreen und mainMenuSection bleiben sichtbar (waren bereits sichtbar)
  // Sterne NICHT anzeigen, da wir im Hauptmenü sind, nicht auf der Titelseite
  // startJourneySection bleibt versteckt
  // mainMenuSection bleibt sichtbar
});

// Continue Button
continueBtn.addEventListener('click', () => {
  ensureAudio();
  loadFromLocalStorage();
  transitionToLevelSelect();
});

// Settings laden und anwenden
function loadSettings() {
  const savedMusicVolume = localStorage.getItem('musicVolume');
  const savedSFXVolume = localStorage.getItem('sfxVolume');
  
  if (savedMusicVolume !== null) {
    const volume = parseFloat(savedMusicVolume);
    setMusicVolume(volume);
    if (musicVolumeSlider) {
      musicVolumeSlider.value = volume * 100;
    }
    if (musicVolumeValue) {
      musicVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
  }
  
  if (savedSFXVolume !== null) {
    const volume = parseFloat(savedSFXVolume);
    setSFXVolume(volume);
    if (sfxVolumeSlider) {
      sfxVolumeSlider.value = volume * 100;
    }
    if (sfxVolumeValue) {
      sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
  }
}

// Settings Button
settingsBtn.addEventListener('click', () => {
  ensureAudio();
  showScreen('settings');
});

// Settings Back Button
settingsBackBtn.addEventListener('click', () => {
  ensureAudio();
  
  // Settings-Content ausblenden
  if (settingsContent) {
    settingsContent.style.display = 'none';
  }
  
  // Levelauswahl-Content verstecken, falls sichtbar
  if (levelSelectContent) {
    levelSelectContent.style.display = 'none';
  }
  
  // Karte verkleinern mit Animation (zurück zur Hauptmenü-Größe)
  if (mainMenuCard) {
    // Entferne expand-Animation
    mainMenuCard.classList.remove('card-expanding');
    // Sanft zurücksetzen zur Hauptmenü-Größe
    requestAnimationFrame(() => {
      mainMenuCard.style.width = 'min(500px, 92vw)';
      setTimeout(() => {
        mainMenuCard.style.width = '';
      }, 600);
    });
  }
  
  // Hauptmenü-Buttons wieder einblenden
  if (mainMenuButtons) {
    mainMenuButtons.style.display = 'flex';
    mainMenuButtons.style.flexDirection = 'column';
    mainMenuButtons.style.gap = '16px';
    
    // Hauptmenü-Buttons einblenden mit Animation
    const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.9) translateY(10px)';
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 1) btn.classList.add('level-button-enter-delay-1');
        if (index === 2) btn.classList.add('level-button-enter-delay-2');
        if (index === 3) btn.classList.add('level-button-enter-delay-2');
        
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 500);
      }, 50 + (index * 100));
    });
  }
  
  // titleScreen und mainMenuSection bleiben sichtbar
});

// Music Volume Slider
if (musicVolumeSlider) {
  musicVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value) / 100;
    setMusicVolume(volume);
    if (musicVolumeValue) {
      musicVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
    // Im localStorage speichern
    localStorage.setItem('musicVolume', volume.toString());
  });
}

// SFX Volume Slider
if (sfxVolumeSlider) {
  sfxVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value) / 100;
    setSFXVolume(volume);
    if (sfxVolumeValue) {
      sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
    // Im localStorage speichern
    localStorage.setItem('sfxVolume', volume.toString());
  });
}

// Back to Title Button (vom Hauptmenü)
backToTitleFromMainBtn.addEventListener('click', () => {
  ensureAudio();
  
  // Hauptmenü-Buttons ausblenden mit Animation
  const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
  menuButtons.forEach((btn, index) => {
    btn.classList.add('start-journey-exit');
  });
  
  // Nach der Ausblend-Animation zurück zum Titelbildschirm
  setTimeout(() => {
    mainMenuSection.classList.add('hidden');
    menuButtons.forEach(btn => {
      btn.classList.remove('start-journey-exit');
    });
    
    // Start Journey Section wieder einblenden
    startJourneySection.classList.remove('hidden');
    startJourneyBtn.style.opacity = '0';
    startJourneyBtn.style.transform = 'scale(0.3) translateY(40px)';
    
    // Start Journey Button einblenden mit Animation
    setTimeout(() => {
      startJourneyBtn.classList.add('main-menu-enter');
      setTimeout(() => {
        startJourneyBtn.classList.remove('main-menu-enter');
        startJourneyBtn.style.opacity = '';
        startJourneyBtn.style.transform = '';
      }, 600);
    }, 50);
    
    // Sterne wieder anzeigen
    titleStarfieldVisible = true;
    titleStarfieldCanvas.style.opacity = '1';
    titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-in';
    // Start Journey Section wieder einblenden
    startJourneySection.classList.remove('hidden');
    // Level-Musik stoppen und Titelmusik starten
    stopLevelMusic();
    ensureAudio();
    startBackgroundMusic();
  }, 600);
});

backToTitleBtn.addEventListener('click', () => {
  ensureAudio();
  // Levelauswahl-Buttons ausblenden mit Animation
  const buttons = levelList.querySelectorAll('.btn');
  buttons.forEach((btn, index) => {
    btn.classList.add('start-journey-exit');
  });
  
  // Auch den Back-Button ausblenden
  backToTitleBtn.classList.add('start-journey-exit');
  
  setTimeout(() => {
    // Levelauswahl-Content verstecken
    if (levelSelectContent) {
      levelSelectContent.style.display = 'none';
    }
    
    // Karte verkleinern mit Animation (zurück zur Hauptmenü-Größe)
    if (mainMenuCard) {
      // Entferne expand-Animation
      mainMenuCard.classList.remove('card-expanding');
      // Sanft zurücksetzen zur Hauptmenü-Größe
      requestAnimationFrame(() => {
        mainMenuCard.style.width = 'min(500px, 92vw)';
        setTimeout(() => {
          mainMenuCard.style.width = '';
        }, 600);
      });
    }
    
    // Hauptmenü-Buttons wieder einblenden
    if (mainMenuButtons) {
      mainMenuButtons.style.display = 'flex';
      mainMenuButtons.style.flexDirection = 'column';
      mainMenuButtons.style.gap = '16px';
      
      // Hauptmenü-Buttons einblenden mit Animation
      const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
      menuButtons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.9) translateY(10px)';
        btn.classList.remove('start-journey-exit');
        
        setTimeout(() => {
          btn.classList.add('level-button-enter');
          if (index === 1) btn.classList.add('level-button-enter-delay-1');
          if (index === 2) btn.classList.add('level-button-enter-delay-2');
          if (index === 3) btn.classList.add('level-button-enter-delay-2');
          
          setTimeout(() => {
            btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
            btn.style.opacity = '';
            btn.style.transform = '';
          }, 500);
        }, 50 + (index * 100));
      });
    }
    // Back-Button Animation entfernen
    backToTitleBtn.classList.remove('start-journey-exit');
    // titleScreen und mainMenuSection bleiben sichtbar (kein showScreen('title') nötig)
    // Musik bleibt gestoppt im Hauptmenü
  }, 600);
});

nextLevelBtn.addEventListener('click', () => {
  if (game.currentLevel < 5) {
    startLevel(game.currentLevel + 1);
  } else {
    showScreen('gameComplete');
  }
});

backToLevelSelectBtn.addEventListener('click', () => {
  showScreen('levelSelect');
});

backToLevelSelectFromCompleteBtn.addEventListener('click', () => {
  showScreen('levelSelect');
});

// Pause Menu Buttons
resumeBtn.addEventListener('click', () => {
  hidePauseMenu();
});

pauseToLevelSelectBtn.addEventListener('click', () => {
  // Spiel beenden
  game.state = 'menu';
  game.paused = false;
  overlay.classList.add('hidden');
  pauseMenu.classList.add('hidden');
  // Level-Musik läuft weiter, wenn zur Level-Auswahl navigiert wird
  // Zur Levelauswahl navigieren
  transitionToLevelSelect();
});

function gameLoop(){
  const realDT = Math.min(0.033, (performance.now() - last)/1000);
  last = performance.now();
  accumulator += realDT;

  while (accumulator >= fixedDT) {
    const dt = fixedDT;
    accumulator -= fixedDT;

    if (game.state === 'play' && !game.paused) {
      game.update(dt, keys);
      
      // Prüfen, ob Boss besiegt wurde
      if (game.bossDefeated && !levelCompleteDelayStarted) {
        // Delay-Timer starten, wenn Boss besiegt wurde
        levelCompleteDelayStarted = true;
        levelCompleteTime = performance.now();
      }
      
      // Prüfen, ob Spieler tot ist
      if (game.state === 'dead') {
        overlay.classList.remove('hidden');
        titleScreen.querySelector('h1').textContent = 'GAME OVER';
        showScreen('title');
      }
    }
    
    // Level-Complete-Delay-Logik außerhalb der Play-State-Bedingung,
    // damit sie in jedem Frame geprüft wird
    if (game.bossDefeated && levelCompleteDelayStarted) {
      // 2 Sekunden warten, bevor das Menü angezeigt wird
      if (performance.now() - levelCompleteTime >= 2000) {
        // State auf levelComplete setzen und Menü anzeigen
        game.state = 'levelComplete';
        if (game.currentLevel === 5) {
          showScreen('gameComplete');
        } else {
          levelCompleteTitle.textContent = `LEVEL ${game.currentLevel} COMPLETE!`;
          levelCompleteText.textContent = 'Congratulations! You have successfully completed the level.';
          nextLevelBtn.style.display = 'block';
          showScreen('levelComplete');
        }
        // Reset für nächstes Level
        levelCompleteDelayStarted = false;
        game.bossDefeated = false;
      }
    }
  }

  let sx = 0, sy = 0;
  if (game.shake > 0){
    sx = rand(-game.shake, game.shake);
    sy = rand(-game.shake, game.shake);
  }

  ctx.save();
  ctx.translate(sx, sy);
  render(ctx, game);
  drawHUD(ctx, game);
  ctx.restore();
  
  // Score/Wave Overlay oben rechts (außerhalb des Shake-Transforms)
  drawScoreOverlay(ctx, game);

  requestAnimationFrame(gameLoop);
}

let last = performance.now();
let accumulator = 0;
const targetFPS = 60;
const fixedDT = 1.0 / targetFPS;

// Initial state
game.state = 'title';
showScreen('title');
// Settings laden
loadSettings();
// Hintergrundmusik starten (nach showScreen, damit alles initialisiert ist)
ensureAudio();
startBackgroundMusic();

// Autoplay-Policy Workaround: Musik beim ersten Benutzerinteraktion starten
let musicStartedByUser = false;
function startMusicOnFirstInteraction() {
  if (!musicStartedByUser) {
    musicStartedByUser = true;
    ensureAudio();
    startBackgroundMusic();
    // Event-Listener entfernen, da wir sie nur einmal brauchen
    document.removeEventListener('click', startMusicOnFirstInteraction);
    document.removeEventListener('keydown', startMusicOnFirstInteraction);
  }
}

// Event-Listener für erste Benutzerinteraktion hinzufügen
document.addEventListener('click', startMusicOnFirstInteraction, { once: true });
document.addEventListener('keydown', startMusicOnFirstInteraction, { once: true });

// Enter key handling for title screen (separate listener to avoid conflicts)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && game.state === 'title' && !overlay.classList.contains('hidden')) {
    if (startJourneySection.classList.contains('hidden')) {
      // Main menu is visible, do nothing (buttons handle it)
      return;
    } else {
      // Start Journey section is visible
      e.preventDefault();
      startJourneyBtn.click();
    }
  }
  // Enter für Pause wird im window.addEventListener gehandhabt
}, {passive:false});

// Titelbildschirm Starfield Animation-Loop
function titleStarfieldLoop() {
  if (titleStarfieldVisible && !overlay.classList.contains('hidden')) {
    const dt = 1/60; // Fixed timestep für Titelbildschirm
    titleStarfieldTime += dt;
    
    titleStarfield.update(dt);
    
    // Canvas leeren
    titleStarfieldCtx.clearRect(0, 0, titleStarfieldCanvas.width, titleStarfieldCanvas.height);
    
    // Sterne rendern
    titleStarfield.render(titleStarfieldCtx);
  }
  
  requestAnimationFrame(titleStarfieldLoop);
}

// Dev Mode initialisieren
initDevMode(game, resetLocalStorage);

requestAnimationFrame(gameLoop);
requestAnimationFrame(titleStarfieldLoop);
