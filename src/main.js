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
const startBtn = document.getElementById('startBtn');

// Input
const keys = new Set();
let hardMode = false;

// Game instance
const game = new Game();

window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys.add(e.code);

  if (e.code === 'Enter') {
    ensureAudio();
    if (game.state === 'title' || game.state === 'dead' || game.state === 'win') start();
  }
  if (e.code === 'KeyR') restart();
  if (e.code === 'KeyP') game.paused = !game.paused;
  if (e.code === 'KeyM') {
    hardMode = !hardMode;
    game.hardMode = hardMode;
  }
}, {passive:false});

window.addEventListener('keyup', (e) => keys.delete(e.code));

function start(){
  game.resetAll();
  game.state = 'play';
  game.paused = false;
  game.hardMode = hardMode;
  overlay.classList.add('hidden');
  game.spawnWave(game.wave);
}

function restart(){
  if (game.state !== 'play') { start(); return; }
  game.resetAll();
  game.state = 'play';
  game.hardMode = hardMode;
  game.spawnWave(game.wave);
}

startBtn.addEventListener('click', () => { ensureAudio(); start(); });

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
          overlay.querySelector('h1').textContent = 'GAME OVER';
        } else if (game.state === 'win') {
          overlay.classList.remove('hidden');
          overlay.querySelector('h1').textContent = 'YOU WIN';
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

requestAnimationFrame(gameLoop);
