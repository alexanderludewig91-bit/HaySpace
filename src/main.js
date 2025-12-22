import { rand } from './utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { ensureAudio } from './systems/AudioSystem.js';
import { Game } from './game/Game.js';
import { render } from './render/GameRenderer.js';
import { drawHUD, drawScoreOverlay } from './ui/HUD.js';

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
const resumeBtn = document.getElementById('resumeBtn');
const pauseToLevelSelectBtn = document.getElementById('pauseToLevelSelectBtn');
const pauseToTitleBtn = document.getElementById('pauseToTitleBtn');
const backToTitleBtn = document.getElementById('backToTitleBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const backToLevelSelectBtn = document.getElementById('backToLevelSelectBtn');
const backToLevelSelectFromCompleteBtn = document.getElementById('backToLevelSelectFromCompleteBtn');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteText = document.getElementById('levelCompleteText');

// Input
const keys = new Set();
let hardMode = false;

// Game instance
const game = new Game();

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
  
  if (screenName === 'title') {
    titleScreen.classList.remove('hidden');
    startJourneySection.classList.remove('hidden');
    mainMenuSection.classList.add('hidden');
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
  startJourneySection.classList.add('hidden');
  mainMenuSection.classList.remove('hidden');
});

// New Game Button
newGameBtn.addEventListener('click', () => {
  ensureAudio();
  resetLocalStorage();
  showScreen('levelSelect');
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

requestAnimationFrame(gameLoop);
