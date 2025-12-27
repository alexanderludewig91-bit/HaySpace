/**
 * Title Starfield
 * Verwaltet das Starfield für den Titelbildschirm
 */

import { rand } from '../utils/math.js';

let titleStarfield = null;
let titleStarfieldVisible = true;
let titleStarfieldTime = 0;
let titleStarfieldCanvas = null;
let titleStarfieldCtx = null;

/**
 * Passt die Canvas-Größe an die Fenstergröße an
 */
function resizeTitleStarfield() {
  if (!titleStarfieldCanvas) return;
  titleStarfieldCanvas.width = window.innerWidth;
  titleStarfieldCanvas.height = window.innerHeight;
  
  // Starfield neu initialisieren mit neuer Größe
  if (titleStarfieldCanvas && titleStarfieldCtx) {
    titleStarfield = createTitleStarfield();
  }
}

/**
 * Erstellt ein neues Starfield für den Titelbildschirm
 * @returns {Object} Starfield-Objekt
 */
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
      titleStarfieldTime += dt;
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

/**
 * Initialisiert das Title Starfield
 * @param {HTMLCanvasElement} canvas - Canvas-Element
 * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext
 */
export function initTitleStarfield(canvas, ctx) {
  titleStarfieldCanvas = canvas;
  titleStarfieldCtx = ctx;
  resizeTitleStarfield();
  titleStarfield = createTitleStarfield();
  window.addEventListener('resize', resizeTitleStarfield);
}

/**
 * Setzt die Sichtbarkeit des Starfields
 * @param {boolean} visible - Sichtbar oder nicht
 */
export function setTitleStarfieldVisible(visible) {
  titleStarfieldVisible = visible;
}

/**
 * Aktualisiert und rendert das Starfield
 * @param {number} dt - Delta-Zeit
 */
export function updateTitleStarfield(dt) {
  if (titleStarfieldVisible && titleStarfieldCanvas && !titleStarfieldCanvas.closest('.overlay')?.classList.contains('hidden')) {
    if (titleStarfield && titleStarfieldCtx) {
      titleStarfield.update(dt);
      
      // Canvas leeren
      titleStarfieldCtx.clearRect(0, 0, titleStarfieldCanvas.width, titleStarfieldCanvas.height);
      
      // Sterne rendern
      titleStarfield.render(titleStarfieldCtx);
    }
  }
}

