/**
 * Game Renderer
 * Haupt-Renderer, orchestriert alle Rendering-Funktionen
 */

import { clamp } from '../utils/math.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config.js';
import { drawGlowCircle, drawRoundedRect } from './RenderUtils.js';
import { drawPlayer } from './PlayerRenderer.js';
import { drawEnemy } from './EnemyRenderer.js';
import { drawBoss } from './BossRenderer.js';

const H = CANVAS_HEIGHT;
const W = CANVAS_WIDTH;

export function drawBullet(ctx, b, friendly, time = 0){
  // Boss-Schüsse (Level 2+) bekommen spezielles Rendering
  if (!friendly && b.isBoss && b.bossLevel >= 2) {
    // Pulsierender Effekt basierend auf Zeit
    const pulse = 0.8 + Math.sin(time * 8) * 0.2; // Pulsation zwischen 0.6 und 1.0
    
    // Farbschema basierend auf Boss-Level
    // Level 3: Rot, Level 2+: Lila/Magenta
    let outerGlow, middleGlow, innerGlow, trailColor, shadowColor;
    if (b.bossLevel === 3) {
      // Rot/Orange-Farbschema für Level 3 Boss
      outerGlow = `rgba(255,50,50,${0.6 * pulse})`;
      middleGlow = `rgba(255,100,80,${0.8 * pulse})`;
      innerGlow = `rgba(255,150,100,${1.0 * pulse})`;
      trailColor = `rgba(255,100,80,${0.9 * pulse})`;
      shadowColor = 'rgba(255,60,60,0.9)';
    } else {
      // Lila/Magenta-Farbschema passend zum Level 2 Boss
      outerGlow = `rgba(200,50,255,${0.6 * pulse})`;
      middleGlow = `rgba(220,80,255,${0.8 * pulse})`;
      innerGlow = `rgba(255,150,255,${1.0 * pulse})`;
      trailColor = `rgba(220,80,255,${0.9 * pulse})`;
      shadowColor = 'rgba(200,50,255,0.9)';
    }
    
    // Mehrschichtiger Glow-Effekt
    const baseSize = b.r;
    drawGlowCircle(ctx, b.x, b.y, baseSize * 1.8, outerGlow, 1); // Äußerer Glow
    drawGlowCircle(ctx, b.x, b.y, baseSize * 1.3, middleGlow, 1); // Mittlerer Ring
    drawGlowCircle(ctx, b.x, b.y, baseSize * 0.9, innerGlow, 1); // Innerer Kern
    
    // Pulsierender Trail
    ctx.save();
    ctx.globalAlpha = 0.6 * pulse;
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - b.vx*0.03, b.y - b.vy*0.03);
    ctx.stroke();
    ctx.restore();
  } else {
    // Normale Schüsse (Spieler oder normale Gegner)
    const col = friendly ? 'rgba(108,255,154,0.85)' : 'rgba(255,59,107,0.75)';
    drawGlowCircle(ctx, b.x, b.y, b.r, col, 1);
    ctx.save();
    ctx.globalAlpha = friendly ? 0.5 : 0.45;
    ctx.strokeStyle = col;
    ctx.lineWidth = friendly ? 3 : 3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - b.vx*0.02, b.y - b.vy*0.02);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawPickup(ctx, p){
  ctx.save();
  const t = p.t;
  const pulse = 0.55 + 0.45*Math.sin(t*6);

  if (p.kind === 'shield'){
    drawGlowCircle(ctx, p.x, p.y, p.r*1.2, `rgba(77,227,255,${0.20 + pulse*0.10})`, 1);
    drawGlowCircle(ctx, p.x, p.y, p.r*0.75, 'rgba(77,227,255,0.75)', 1);
  } else if (p.kind === 'speed'){
    drawGlowCircle(ctx, p.x, p.y, p.r*1.2, `rgba(255,209,102,${0.20 + pulse*0.10})`, 1);
    drawGlowCircle(ctx, p.x, p.y, p.r*0.75, 'rgba(255,209,102,0.75)', 1);
  } else {
    drawGlowCircle(ctx, p.x, p.y, p.r*1.5, `rgba(108,255,154,${0.22 + pulse*0.12})`, 1);
    drawGlowCircle(ctx, p.x, p.y, p.r*0.85, 'rgba(108,255,154,0.85)', 1);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.x-10, p.y);
    ctx.lineTo(p.x+10, p.y);
    ctx.moveTo(p.x, p.y-10);
    ctx.lineTo(p.x, p.y+10);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawParticle(ctx, p, game = null){
  const t = clamp(p.life, 0, 1);
  const a = clamp(p.life/0.6, 0, 1) * (p.a ?? 1);

  if (p.kind === 'trail'){
    drawGlowCircle(ctx, p.x, p.y, p.r, `hsla(${p.hue}, 100%, 70%, ${0.30*a})`, 1);
    return;
  }

  if (p.kind === 'spark'){
    drawGlowCircle(ctx, p.x, p.y, p.r, `hsla(${p.hue}, 100%, 70%, ${0.42*a})`, 1);
    return;
  }

  if (p.kind === 'ring'){
    ctx.save();
    // Für große Ringe (Boss-Explosion): Helles, blendendes Licht mit rot-orange Anteilen
    // Für kleine Ringe: Normale Transparenz
    const isLargeRing = p.r > 50;
    if (isLargeRing) {
      // Blendendes rot-orange-gelbes Licht für große Explosionsringe mit Flackern
      const intensity = Math.min(1.0, p.a || 1.0);
      const flicker = 0.9 + Math.sin(p.life * 20) * 0.1; // Flackern-Effekt
      
      // Äußerer Glow - rot-orange
      ctx.globalAlpha = 0.5 * a * intensity * flicker;
      ctx.strokeStyle = 'rgba(255,150,50,1.0)'; // Rot-orange
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.stroke();
      
      // Mittlerer Ring - heller rot-orange
      ctx.globalAlpha = 0.7 * a * intensity * flicker;
      ctx.strokeStyle = 'rgba(255,200,100,1.0)'; // Heller rot-orange
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.92, 0, Math.PI*2);
      ctx.stroke();
      
      // Innerer heller Ring - gelb-weiß
      ctx.globalAlpha = 0.8 * a * intensity * flicker;
      ctx.strokeStyle = 'rgba(255,255,180,1.0)'; // Gelb-weiß
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.85, 0, Math.PI*2);
      ctx.stroke();
      
      // Zentrales blendendes Licht - rot-orange-gelb
      ctx.globalAlpha = 0.9 * a * intensity * flicker;
      drawGlowCircle(ctx, p.x, p.y, p.r * 0.3, 'rgba(255,180,80,1.0)', 1); // Rot-orange Glow
      ctx.globalAlpha = 0.7 * a * intensity * flicker;
      drawGlowCircle(ctx, p.x, p.y, p.r * 0.2, 'rgba(255,255,200,1.0)', 1); // Gelb-weiß Glow
    } else {
      // Normale Ringe für kleine Explosionen
      ctx.globalAlpha = 0.25*a;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (p.kind === 'beamCharge'){
    // Level 1 Boss: Original gelb/orange
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = 'rgba(255,209,102,0.8)';
    ctx.fillRect(p.x - p.w/2, 0, p.w, H);
    ctx.globalAlpha = 0.28;
    ctx.fillRect(p.x - 2, 0, 4, H);
    ctx.restore();

    if (p.life <= 0 && p.onDone){
      const fn = p.onDone; p.onDone = null;
      fn();
    }
    return;
  }

  if (p.kind === 'beam'){
    // Level 1 Boss: Original rot
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = 'rgba(255,59,107,0.85)';
    ctx.fillRect(p.x - p.w/2, 0, p.w, H);
    ctx.globalAlpha = 0.40;
    ctx.fillRect(p.x - 2, 0, 4, H);
    ctx.restore();
    return;
  }
}

export function drawPopup(ctx, pp){
  const t = clamp(pp.life / pp.max, 0, 1);
  const alpha = Math.min(1, 0.15 + (1-t)*1.1);

  let col = `rgba(245,250,255,${alpha.toFixed(3)})`;
  if (pp.kind === 'good') col = `rgba(77,227,255,${alpha.toFixed(3)})`;
  if (pp.kind === 'cool') col = `rgba(255,209,102,${alpha.toFixed(3)})`;
  if (pp.kind === 'upgrade') col = `rgba(108,255,154,${alpha.toFixed(3)})`;
  if (pp.kind === 'warn') col = `rgba(255,59,107,${alpha.toFixed(3)})`;
  if (pp.kind === 'muted') col = `rgba(245,250,255,${(alpha*0.62).toFixed(3)})`;

  ctx.save();
  ctx.font = '800 18px ui-sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = col;
  ctx.fillText(pp.text, pp.x, pp.y);
  ctx.restore();
}

export function render(ctx, game){
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.clearRect(0,0,W,H);

  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'rgba(5,8,20,1)');
  bg.addColorStop(1,'rgba(10,18,48,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  game.nebula.render(ctx, drawGlowCircle);
  game.starfield.render(ctx);

  for (const e of game.enemies) drawEnemy(ctx, e, game.hardMode);
  if (game.boss) drawBoss(ctx, game.boss);

  for (const b of game.bullets) drawBullet(ctx, b, true, game.time);
  for (const b of game.enemyBullets) drawBullet(ctx, b, false, game.time);

  for (const p of game.pickups) drawPickup(ctx, p);

  drawPlayer(ctx, game.player, game.time);

  for (const p of game.particles) drawParticle(ctx, p, game);

  for (const pp of game.popups) drawPopup(ctx, pp);

  // Pause-Screen wird jetzt als HTML-Overlay gerendert, nicht mehr im Canvas

  if (game.shake > 0){
    ctx.save();
    ctx.globalAlpha = Math.min(0.22, game.shake/100);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  const v = ctx.createRadialGradient(W/2,H/2, H*0.2, W/2,H/2, H*0.85);
  v.addColorStop(0,'rgba(0,0,0,0)');
  v.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0,0,W,H);

  // Wave-Meldung rendern (wenn aktiv)
  if (game.waveMessage > 0) {
    drawWaveMessage(ctx, game);
  }
}

function drawWaveMessage(ctx, game) {
  const maxTime = 2.5;
  const t = game.waveMessage / maxTime; // 1.0 = Anfang, 0.0 = Ende
  
  // Ein- und Ausfaden: schnell ein, langsam aus
  let alpha = 1.0;
  if (t > 0.8) {
    // Einfaden (erste 20% der Zeit)
    alpha = 1.0 - ((t - 0.8) / 0.2);
  } else if (t < 0.3) {
    // Ausfaden (letzte 30% der Zeit)
    alpha = t / 0.3;
  }
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Große, auffällige Schrift
  ctx.font = '900 64px ui-sans-serif, system-ui';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 24;
  
  // Gradient für den Text (Boss = rot/orange, normale Welle = blau/grün/gelb)
  // Boss-Welle ist abhängig vom Level: 5 + currentLevel
  const bossWave = 5 + game.currentLevel;
  const isBossWave = game.wave >= bossWave;
  const gradient = ctx.createLinearGradient(W/2, H/2 - 40, W/2, H/2 + 40);
  if (isBossWave) {
    // Boss-Welle: Rot-Orange Gradient
    gradient.addColorStop(0, 'rgba(255,59,107,1)');
    gradient.addColorStop(0.5, 'rgba(255,159,28,1)');
    gradient.addColorStop(1, 'rgba(255,209,102,1)');
  } else {
    // Normale Welle: Blau-Grün-Gelb Gradient
    gradient.addColorStop(0, 'rgba(77,227,255,1)');
    gradient.addColorStop(0.5, 'rgba(108,255,154,1)');
    gradient.addColorStop(1, 'rgba(255,209,102,1)');
  }
  ctx.fillStyle = gradient;
  
  // Text: "BOSS WAVE" für Boss, "WAVE X" für normale Wellen
  const text = isBossWave ? 'BOSS WAVE' : `WAVE ${game.wave}`;
  ctx.fillText(text, W/2, H/2);
  
  ctx.restore();
}
