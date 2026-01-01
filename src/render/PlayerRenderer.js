/**
 * Player Renderer
 * Rendert den Spieler und alle visuellen Effekte
 */

import { clamp, lerp } from '../utils/math.js';
import { drawGlowCircle } from './RenderUtils.js';
import { Assets } from './AssetManager.js';

// Rotation für sanfte Neigung des Raumschiffs
let currentRotation = 0;

export function drawPlayer(ctx, p, time){
  const blink = (p.inv>0) ? ((Math.sin(time*28)>0) ? 0.25 : 1) : 1;
  ctx.save();
  ctx.globalAlpha = blink;

  // Berechne Geschwindigkeit für Feuer-Intensität
  const speed = Math.hypot(p.vx || 0, p.vy || 0);
  const speedFactor = Math.min(1.0, speed / 200); // Normalisiere auf 0-1 basierend auf max Geschwindigkeit
  const baseIntensity = 0.3 + speedFactor * 0.7; // Mindest-Intensität 0.3, max 1.0
  
  // Subtiles Pulsieren für natürlicheres Feuer (reduzierte Intensität)
  const pulse = 0.95 + 0.05 * Math.sin(time * 6); // Sehr subtile Variation (5% statt 20%)
  const intensity = baseIntensity * pulse;

  // Berechne Rotation basierend auf horizontaler Geschwindigkeit
  // Max Rotation: ±20 Grad (in Radians: ±0.35)
  const maxRotation = 0.35; // ~20 Grad
  const maxSpeed = 300; // Maximale Geschwindigkeit für volle Rotation
  const targetRotation = clamp((p.vx || 0) / maxSpeed, -1, 1) * maxRotation;
  
  // Sanfte Interpolation zur Ziel-Rotation (Lerp-Faktor: 0.15 für sanfte Bewegung)
  const lerpFactor = 0.15;
  currentRotation = lerp(currentRotation, targetRotation, lerpFactor);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(currentRotation); // Rotation anwenden
  
  // Blaues Triebwerksfeuer - zeichne es VOR dem Raumschiff, damit es dahinter erscheint
  // Position: Direkt unter den Triebwerken des Raumschiffs
  const engineY = 30; // Position der Triebwerke (noch näher am Raumschiff)
  const leftEngineX = -15; // Linkes Triebwerk (näher zur Mitte)
  const rightEngineX = 15; // Rechtes Triebwerk (näher zur Mitte)
  
  // Blaues Triebwerksfeuer - zeichne es VOR dem Raumschiff, damit es dahinter erscheint
  // Linkes Triebwerk - mehrschichtiges blaues Feuer
  const flameOffset = Math.sin(time * 20) * 2; // Leichte seitliche Bewegung
  
  // Äußerer Glow (heller, größer)
  drawGlowCircle(ctx, leftEngineX, engineY, 12 * intensity, 'rgba(77,227,255,0.6)', intensity);
  // Mittlerer Ring (mittel)
  drawGlowCircle(ctx, leftEngineX, engineY, 8 * intensity, 'rgba(100,200,255,0.8)', intensity);
  // Innerer Kern (sehr hell)
  drawGlowCircle(ctx, leftEngineX, engineY, 5 * intensity, 'rgba(150,220,255,1.0)', intensity);
  
  // Rechtes Triebwerk - mehrschichtiges blaues Feuer
  drawGlowCircle(ctx, rightEngineX, engineY, 12 * intensity, 'rgba(77,227,255,0.6)', intensity);
  drawGlowCircle(ctx, rightEngineX, engineY, 8 * intensity, 'rgba(100,200,255,0.8)', intensity);
  drawGlowCircle(ctx, rightEngineX, engineY, 5 * intensity, 'rgba(150,220,255,1.0)', intensity);
  
  // Zusätzliche Flammen-Partikel für mehr Dynamik - längere Flammen
  const flameCount = 6; // Mehr Partikel für längere Flammen
  // Linkes Triebwerk - Flammen
  for (let i = 0; i < flameCount; i++) {
    const progress = i / (flameCount - 1); // 0 bis 1
    const yPos = engineY + 2 + i * 4; // Längere Flammen mit mehr Abstand
    const size = (flameCount - i) * 1.5 * intensity; // Größer oben, kleiner unten
    const alpha = (1 - progress * 0.7) * intensity; // Sanftes Ausfaden
    const r = 100 + Math.floor(progress * 30);
    const g = 200 + Math.floor(progress * 20);
    const b = 255;
    drawGlowCircle(ctx, leftEngineX + flameOffset * 0.5, yPos, size, `rgba(${r},${g},${b},${0.6 + progress * 0.2})`, alpha);
  }
  
  // Rechtes Triebwerk - Flammen
  for (let i = 0; i < flameCount; i++) {
    const progress = i / (flameCount - 1); // 0 bis 1
    const yPos = engineY + 2 + i * 4; // Längere Flammen mit mehr Abstand
    const size = (flameCount - i) * 1.5 * intensity; // Größer oben, kleiner unten
    const alpha = (1 - progress * 0.7) * intensity; // Sanftes Ausfaden
    const r = 100 + Math.floor(progress * 30);
    const g = 200 + Math.floor(progress * 20);
    const b = 255;
    drawGlowCircle(ctx, rightEngineX - flameOffset * 0.5, yPos, size, `rgba(${r},${g},${b},${0.6 + progress * 0.2})`, alpha);
  }

  // Wenn das Bild geladen ist, verwende es
  if (Assets.spaceship.loaded() && Assets.spaceship.image()) {
    // Bild-Größe: Original-Zeichnung war etwa 80px hoch (von -38 bis +40)
    // Skaliere das Bild größer für bessere Sichtbarkeit
    const targetHeight = 120; // Zielhöhe in Pixeln (größer als Original)
    const imageWidth = Assets.spaceship.image().width || 80;
    const imageHeight = Assets.spaceship.image().height || 80;
    const scale = targetHeight / imageHeight; // Skalierung basierend auf Höhe
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    // Schatten für das Bild
    ctx.shadowColor = 'rgba(77,227,255,0.45)';
    ctx.shadowBlur = 22;

    // Stelle sicher, dass Image Smoothing aktiviert ist für beste Qualität
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = 'high';
    }

    // Bild zentriert zeichnen (x, y ist bereits der Mittelpunkt)
    ctx.drawImage(
      Assets.spaceship.image(),
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
  } else {
    // Fallback: Original-Zeichnung wenn Bild nicht geladen
    ctx.shadowColor = 'rgba(77,227,255,0.45)';
    ctx.shadowBlur = 22;

    const hull = ctx.createLinearGradient(0,-30,0,34);
    hull.addColorStop(0,'rgba(245,250,255,0.95)');
    hull.addColorStop(1,'rgba(180,200,255,0.40)');

    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(0,-38);
    ctx.quadraticCurveTo(22,-10, 26, 10);
    ctx.quadraticCurveTo(14, 32, 0, 40);
    ctx.quadraticCurveTo(-14, 32, -26, 10);
    ctx.quadraticCurveTo(-22,-10, 0,-38);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    const glass = ctx.createLinearGradient(-8,-20, 10, 18);
    glass.addColorStop(0,'rgba(77,227,255,0.75)');
    glass.addColorStop(1,'rgba(0,90,255,0.25)');
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(0, 2, 9, 16, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = 'rgba(108,255,154,0.85)';
    ctx.beginPath();
    ctx.roundRect(-30, 6, 12, 20, 8);
    ctx.roundRect(18, 6, 12, 20, 8);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}

