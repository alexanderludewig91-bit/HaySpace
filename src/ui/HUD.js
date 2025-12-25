import { clamp } from '../utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';
import { drawRoundedRect, drawGlowCircle } from '../render/GameRenderer.js';

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;

// Kleines Raumschiff-Icon für Lives
function drawLifeIcon(ctx, x, y, scale = 0.25) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Miniatur-Version des Players
  drawGlowCircle(ctx, 0, 13, 3, 'rgba(255,209,102,0.35)', 1);

  ctx.shadowColor = 'rgba(77,227,255,0.35)';
  ctx.shadowBlur = 5;

  const hull = ctx.createLinearGradient(0, -7.5, 0, 8.5);
  hull.addColorStop(0, 'rgba(245,250,255,0.85)');
  hull.addColorStop(1, 'rgba(180,200,255,0.40)');

  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(0, -9.5);
  ctx.quadraticCurveTo(5.5, -2.5, 6.5, 2.5);
  ctx.quadraticCurveTo(3.5, 8, 0, 10);
  ctx.quadraticCurveTo(-3.5, 8, -6.5, 2.5);
  ctx.quadraticCurveTo(-5.5, -2.5, 0, -9.5);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  const glass = ctx.createLinearGradient(-2, -5, 2.5, 4.5);
  glass.addColorStop(0, 'rgba(77,227,255,0.65)');
  glass.addColorStop(1, 'rgba(0,90,255,0.25)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.ellipse(0, 0.5, 2.25, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(108,255,154,0.75)';
  ctx.beginPath();
  ctx.roundRect(-7.5, 1.5, 3, 5, 2);
  ctx.roundRect(4.5, 1.5, 3, 5, 2);
  ctx.fill();

  ctx.restore();
}

export function drawScoreOverlay(ctx, game, upgradeSystem = null) {
  const padX = 20;
  const padY = 20;

  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  // Credits (statt Score)
  const credits = upgradeSystem ? upgradeSystem.getCredits() : game.score;
  ctx.fillStyle = 'rgba(100,255,200,0.9)';
  ctx.font = '600 18px ui-sans-serif, system-ui';
  ctx.fillText(`Credits: ${credits.toLocaleString()}`, W - padX, padY);

  // Wave (unauffälliger)
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.font = '500 12px ui-sans-serif, system-ui';
  ctx.fillText(`Wave ${game.wave}`, W - padX, padY + 24);

  ctx.restore();
}

export function drawHUD(ctx, game) {
  const padX = 20;
  const padY = H - 104;
  const panelH = 88;
  const panelW1 = 520;

  ctx.save();
  ctx.globalAlpha = 0.95;
  drawRoundedRect(ctx, padX, padY, panelW1, panelH, 16);
  const panelGrad1 = ctx.createLinearGradient(padX, padY, padX, padY + panelH);
  panelGrad1.addColorStop(0, 'rgba(255,255,255,.12)');
  panelGrad1.addColorStop(1, 'rgba(255,255,255,.06)');
  ctx.fillStyle = panelGrad1;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = '500 13px ui-sans-serif, system-ui';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const leftX = padX + 18;
  const topY = padY + 8; // Höher positioniert für mehr Platz
  const barH = 12;
  const labelHeight = 18; // Abstand zwischen Label und Bar
  const barSpacing = 20; // Abstand zwischen Elementen
  const rowSpacing = 8; // Abstand zwischen den beiden Zeilen

  // === ERSTE ZEILE: Lives, Weapon, Speed ===
  const firstRowLabelY = topY;
  const firstRowBarY = topY + labelHeight;
  
  // Lives (links)
  const livesX = leftX;
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.fillText('Lives', livesX, firstRowLabelY);
  
  const lifeIconSpacing = 24; // Etwas mehr Abstand für größere Icons
  const lifeStartX = livesX + 50;
  const lifeY = firstRowLabelY + 1; // Zentriert mit der Schrift
  
  // Icons größer machen (Scale 0.4 statt 0.25) - etwa so groß wie die Schrift (13px)
  for (let i = 0; i < game.player.lives; i++) {
    drawLifeIcon(ctx, lifeStartX + i * lifeIconSpacing, lifeY, 0.4);
  }

  // Weapon (Mitte)
  const weaponX = lifeStartX + (3 * lifeIconSpacing) + barSpacing; // Platz für 3 Icons + Abstand
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.fillText('Weapon', weaponX, firstRowLabelY);
  
  const weaponBarX = weaponX;
  const weaponBarW = 110;
  
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  drawRoundedRect(ctx, weaponBarX, firstRowBarY, weaponBarW, barH, 999);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Weapon Level: 1-5 -> 0-100% (Level 1 = 0%, Level 5 = 100%)
  const weaponPct = clamp((game.player.weaponLevel - 1) / 4, 0, 1);
  if (weaponPct > 0) {
    const grad = ctx.createLinearGradient(weaponBarX, firstRowBarY, weaponBarX + weaponBarW, firstRowBarY);
    grad.addColorStop(0, '#1a2a6c');
    grad.addColorStop(1, '#4de3ff');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, weaponBarX, firstRowBarY, weaponBarW * weaponPct, barH, 999);
    ctx.fill();
  }

  // Speed (rechts)
  const speedX = weaponBarX + weaponBarW + barSpacing;
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.fillText('Speed', speedX, firstRowLabelY);
  
  const speedBarX = speedX;
  const speedBarW = 110;
  
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  drawRoundedRect(ctx, speedBarX, firstRowBarY, speedBarW, barH, 999);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  const speedPct = clamp((game.player.speedBoost - 1.0) / 1.0, 0, 1); // 1.0 = 0%, 2.0 = 100%
  if (speedPct > 0) {
    // Helles, gleichbleibendes Gelb (kein Gradient)
    ctx.fillStyle = '#ffd700'; // Goldgelb
    drawRoundedRect(ctx, speedBarX, firstRowBarY, speedBarW * speedPct, barH, 999);
    ctx.fill();
  }

  // === ZWEITE ZEILE: Shield, Heat ===
  // Sicherstellen, dass die zweite Zeile genug Abstand zur ersten hat
  const secondRowLabelY = firstRowBarY + barH + rowSpacing;
  const secondRowBarY = secondRowLabelY + labelHeight;

  // Shield (links)
  const shieldX = leftX;
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.fillText('Shield', shieldX, secondRowLabelY);

  ctx.fillStyle = 'rgba(255,255,255,.10)';
  const shieldBarW = 240;
  drawRoundedRect(ctx, shieldX, secondRowBarY, shieldBarW, barH, 999);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const shieldPct = game.player.shield / game.player.shieldMax;
  if (shieldPct > 0) {
    const grad = ctx.createLinearGradient(shieldX, secondRowBarY, shieldX + shieldBarW, secondRowBarY);
    grad.addColorStop(0, '#6cff9a');
    grad.addColorStop(1, '#4de3ff');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, shieldX, secondRowBarY, shieldBarW * shieldPct, barH, 999);
    ctx.fill();
  }

  // Heat (rechts)
  const heatX = shieldX + shieldBarW + barSpacing;
  ctx.fillStyle = 'rgba(245,250,255,.62)';
  ctx.fillText('Heat', heatX, secondRowLabelY);

  ctx.fillStyle = 'rgba(255,255,255,.10)';
  const heatBarW = 150;
  drawRoundedRect(ctx, heatX, secondRowBarY, heatBarW, barH, 999);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const heatPct = clamp(game.player.heat, 0, 100) / 100;
  if (heatPct > 0) {
    // Farbverlauf von hellem Orange zu dunklem Rot
    const grad = ctx.createLinearGradient(heatX, secondRowBarY, heatX + heatBarW, secondRowBarY);
    grad.addColorStop(0, '#ff9f1c'); // Helles Orange
    grad.addColorStop(1, '#cc0000'); // Dunkles Rot
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, heatX, secondRowBarY, heatBarW * heatPct, barH, 999);
    ctx.fill();
  }

  // Overheat Warnung
  if (game.overheatLocked) {
    ctx.fillStyle = 'rgba(255,59,107,.95)';
    ctx.font = '800 12px ui-sans-serif, system-ui';
    ctx.fillText('OVERHEAT', heatX + heatBarW + 10, secondRowLabelY);
  }

  // Boss Bar (wenn vorhanden) - oben links
  if (game.boss) {
    const bossX = 20; // Oben links, wie Score-Overlay
    const bossLabelY = 20;
    const bossBarY = bossLabelY + labelHeight;
    const bossBarW = 320;

    ctx.fillStyle = 'rgba(255,255,255,.10)';
    drawRoundedRect(ctx, bossX, bossBarY, bossBarW, barH, 999);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.stroke();

    const bossPct = clamp(game.boss.hp / game.boss.hpMax, 0, 1);
    const grad = ctx.createLinearGradient(bossX, bossBarY, bossX + bossBarW, bossBarY);
    grad.addColorStop(0, '#ff3b6b');
    grad.addColorStop(1, '#ff9f1c');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, bossX, bossBarY, bossBarW * bossPct, barH, 999);
    ctx.fill();

    ctx.fillStyle = 'rgba(245,250,255,.62)';
    ctx.font = '500 13px ui-sans-serif, system-ui';
    ctx.fillText('Boss', bossX, bossLabelY);

    ctx.fillStyle = 'rgba(245,250,255,.92)';
    ctx.font = '600 13px ui-sans-serif, system-ui';
    ctx.fillText('DREAD CORE', bossX + 60, bossLabelY);
  }

  ctx.restore();
}
