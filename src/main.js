import { rand } from './utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { ensureAudio } from './systems/AudioSystem.js';
import { Game } from './game/Game.js';
import { render } from './render/GameRenderer.js';
import { drawHUD, drawScoreOverlay } from './ui/HUD.js';
import { Starfield } from './background/Starfield.js';

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
const pauseToTitleBtn = document.getElementById('pauseToTitleBtn');
const backToTitleBtn = document.getElementById('backToTitleBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const backToLevelSelectBtn = document.getElementById('backToLevelSelectBtn');
const backToLevelSelectFromCompleteBtn = document.getElementById('backToLevelSelectFromCompleteBtn');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteText = document.getElementById('levelCompleteText');
const newGameWarning = document.getElementById('newGameWarning');
const confirmNewGameBtn = document.getElementById('confirmNewGameBtn');
const cancelNewGameBtn = document.getElementById('cancelNewGameBtn');

// Input
const keys = new Set();
let hardMode = false;

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

// Levelauswahl rendern
function renderLevelSelect() {
  levelList.innerHTML = '';
  const unlocked = game.getUnlockedLevels();
  
  for (let i = 1; i <= 3; i++) {
    const levelBtn = document.createElement('button');
    levelBtn.className = 'btn';
    levelBtn.style.width = '100%';
    levelBtn.style.textAlign = 'left';
    levelBtn.style.padding = '16px';
    levelBtn.style.display = 'flex';
    levelBtn.style.justifyContent = 'space-between';
    levelBtn.style.alignItems = 'center';
    
    if (unlocked.includes(i)) {
      levelBtn.innerHTML = `<span><b>Level ${i}</b></span><span style="opacity: 0.7;">▶</span>`;
      levelBtn.onclick = () => startLevel(i);
    } else {
      levelBtn.innerHTML = `<span style="opacity: 0.5;"><b>Level ${i}</b> 🔒</span>`;
      levelBtn.disabled = true;
      levelBtn.style.opacity = '0.5';
      levelBtn.style.cursor = 'not-allowed';
    }
    
    levelList.appendChild(levelBtn);
  }
}

function showScreen(screenName) {
  titleScreen.classList.add('hidden');
  levelSelect.classList.add('hidden');
  levelComplete.classList.add('hidden');
  gameComplete.classList.add('hidden');
  pauseMenu.classList.add('hidden');
  newGameWarning.classList.add('hidden');
  
  if (screenName === 'title') {
    titleScreen.classList.remove('hidden');
    startJourneySection.classList.remove('hidden');
    mainMenuSection.classList.add('hidden');
    // Sterne wieder anzeigen, wenn zum Titelbildschirm zurückgekehrt wird
    titleStarfieldVisible = true;
    titleStarfieldCanvas.style.opacity = '1';
    titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-in';
  }
  else if (screenName === 'levelSelect') {
    levelSelect.classList.remove('hidden');
    renderLevelSelect();
  }
  else if (screenName === 'levelComplete') levelComplete.classList.remove('hidden');
  else if (screenName === 'gameComplete') gameComplete.classList.remove('hidden');
  else if (screenName === 'pause') {
    pauseMenu.classList.remove('hidden');
  }
  else if (screenName === 'newGameWarning') {
    newGameWarning.classList.remove('hidden');
  }
  
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
  game.setLevel(level);
  game.resetAll();
  game.state = 'play';
  game.paused = false;
  game.hardMode = hardMode;
  overlay.classList.add('hidden');
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
  if (e.code === 'KeyM') {
    hardMode = !hardMode;
    game.hardMode = hardMode;
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
    
    // Buttons nacheinander einblenden mit Animation
    const menuButtons = [newGameBtn, continueBtn, settingsBtn, backToTitleFromMainBtn];
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.3) translateY(40px)';
      
      setTimeout(() => {
        btn.classList.add('main-menu-enter');
        if (index === 1) btn.classList.add('main-menu-enter-delay-1');
        if (index === 2) btn.classList.add('main-menu-enter-delay-2');
        if (index === 3) btn.classList.add('main-menu-enter-delay-3');
        
        // Animation-Klassen nach Animation entfernen
        setTimeout(() => {
          btn.classList.remove('main-menu-enter', 'main-menu-enter-delay-1', 'main-menu-enter-delay-2', 'main-menu-enter-delay-3');
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 900); // Etwas länger, damit auch der letzte Button fertig ist
      }, 50);
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
    showScreen('levelSelect');
  }
});

// Bestätigen: Neues Spiel starten
confirmNewGameBtn.addEventListener('click', () => {
  ensureAudio();
  resetLocalStorage();
  showScreen('levelSelect');
});

// Abbrechen: Zurück zum Hauptmenü
cancelNewGameBtn.addEventListener('click', () => {
  ensureAudio();
  showScreen('title');
  // Hauptmenü wieder anzeigen
  startJourneySection.classList.add('hidden');
  mainMenuSection.classList.remove('hidden');
});

// Continue Button
continueBtn.addEventListener('click', () => {
  ensureAudio();
  loadFromLocalStorage();
  showScreen('levelSelect');
});

// Settings Button (Placeholder)
settingsBtn.addEventListener('click', () => {
  // TODO: Settings implementieren
  alert('Settings kommen bald!');
});

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
  }, 600);
});

backToTitleBtn.addEventListener('click', () => {
  showScreen('title');
});

nextLevelBtn.addEventListener('click', () => {
  if (game.currentLevel < 3) {
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
  game.paused = false;
  showScreen('levelSelect');
});

pauseToTitleBtn.addEventListener('click', () => {
  game.paused = false;
  showScreen('title');
});

function gameLoop(){
  const realDT = Math.min(0.033, (performance.now() - last)/1000);
  last = performance.now();
  accumulator += realDT;

  while (accumulator >= fixedDT) {
    const dt = fixedDT;
    accumulator -= fixedDT;

    if (game.state === 'play' && !game.paused) {
      const gameOver = game.update(dt, keys);
      if (gameOver) {
        if (game.state === 'dead') {
          overlay.classList.remove('hidden');
          titleScreen.querySelector('h1').textContent = 'GAME OVER';
          showScreen('title');
        } else if (game.state === 'levelComplete') {
          if (game.currentLevel === 3) {
            showScreen('gameComplete');
          } else {
            levelCompleteTitle.textContent = `LEVEL ${game.currentLevel} GESCHAFFT!`;
            levelCompleteText.textContent = 'Gratulation! Du hast das Level erfolgreich abgeschlossen.';
            nextLevelBtn.style.display = 'block';
            showScreen('levelComplete');
          }
        }
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

requestAnimationFrame(gameLoop);
requestAnimationFrame(titleStarfieldLoop);
