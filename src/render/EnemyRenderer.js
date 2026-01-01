/**
 * Enemy Renderer
 * Rendert alle Gegner-Typen
 */

import { clamp } from '../utils/math.js';
import { drawGlowCircle, drawRoundedRect } from './RenderUtils.js';
import { Assets } from './AssetManager.js';

// Gegner-Konfiguration: targetHeight für jeden Typ
const ENEMY_CONFIG = {
  drone: { targetHeight: 100 },
  striker: { targetHeight: 110 },
  tank: { targetHeight: 120 },
  hunter: { targetHeight: 100 },
  crusher: { targetHeight: 110 },
  guardian: { targetHeight: 130 },
  destroyer: { targetHeight: 140 },
  reaper: { targetHeight: 150 },
  titan: { targetHeight: 160 },
  void: { targetHeight: 170 },
  apocalypse: { targetHeight: 180 },
};

// Alle Gegner-Typen mit eigenen Grafiken
const ENEMIES_WITH_IMAGES = ['drone', 'striker', 'tank', 'hunter', 'crusher', 'guardian', 'destroyer', 'reaper', 'titan', 'void', 'apocalypse'];

// Gegner mit HP-Bar
const ENEMIES_WITH_HP_BAR = ['tank', 'guardian', 'destroyer', 'reaper', 'titan', 'void', 'apocalypse'];

// Hilfsfunktion: Rendert ein Gegner-Bild
function drawEnemyImage(ctx, e, assetKey, targetHeight, hue) {
  const asset = Assets[assetKey];
  if (!asset || !asset.loaded() || !asset.image()) return false;
  
  const image = asset.image();
  const imageWidth = image.width || 24;
  const imageHeight = image.height || 24;
  const scale = targetHeight / imageHeight;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.55)`;
  ctx.shadowBlur = 22;
  ctx.imageSmoothingEnabled = true;
  if (ctx.imageSmoothingQuality) {
    ctx.imageSmoothingQuality = 'high';
  }

  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  return true;
}

// Hilfsfunktion: Fallback-Zeichnung für Gegner ohne Bild
function drawEnemyFallback(ctx, e, hue) {
  const body = ctx.createLinearGradient(0, -e.r, 0, e.r);
  body.addColorStop(0, 'rgba(255,255,255,0.85)');
  body.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.90)`);

  ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.55)`;
  ctx.shadowBlur = 22;
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.r * 1.05, e.r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(245,250,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -e.r * 0.18, e.r * 0.65, e.r * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();

  const glowSize = ENEMIES_WITH_HP_BAR.includes(e.kind) ? 8 : 6;
  drawGlowCircle(ctx, e.r * 0.22, -e.r * 0.08, glowSize, 'rgba(255,209,102,0.90)', 1);
}

// Hilfsfunktion: Zeichnet HP-Bar für große Gegner
function drawEnemyHPBar(ctx, e, hardMode) {
  if (!ENEMIES_WITH_HP_BAR.includes(e.kind)) return;

  const w = 70;
  const maxHP = {
    tank: hardMode ? 14 : 10,
    guardian: hardMode ? 18 : 14,
    destroyer: hardMode ? 24 : 20,
    reaper: hardMode ? 30 : 26,
    titan: hardMode ? 36 : 30,
    void: hardMode ? 40 : 34,
    apocalypse: hardMode ? 48 : 40,
  }[e.kind] || 10;

  const hp = clamp(e.hp, 0, maxHP);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  drawRoundedRect(ctx, -w / 2, -e.r - 22, w, 8, 999);
  ctx.fill();
  ctx.fillStyle = 'rgba(108,255,154,0.85)';
  drawRoundedRect(ctx, -w / 2, -e.r - 22, w * (hp / maxHP), 8, 999);
  ctx.fill();
}

export function drawEnemy(ctx, e, hardMode) {
  ctx.save();

  const hue = e.hue || 340;

  // Glow-Circle nur für Gegner ohne eigenes Bild
  if (!ENEMIES_WITH_IMAGES.includes(e.kind)) {
    const glowColor = `hsla(${hue}, 100%, 60%, 0.48)`;
    drawGlowCircle(ctx, e.x, e.y, e.r * 1.15, glowColor, 1);
  }

  ctx.translate(e.x, e.y);

  // Versuche, Bild zu rendern
  const config = ENEMY_CONFIG[e.kind];
  if (config) {
    const assetKey = e.kind; // Asset-Key entspricht dem Gegner-Typ
    const drawn = drawEnemyImage(ctx, e, assetKey, config.targetHeight, hue);
    if (!drawn) {
      drawEnemyFallback(ctx, e, hue);
    }
  } else {
    drawEnemyFallback(ctx, e, hue);
  }

  // HP-Bar zeichnen
  drawEnemyHPBar(ctx, e, hardMode);

  ctx.restore();
}

