/**
 * Boss Renderer
 * Rendert alle Boss-Level mit ihren spezifischen Designs
 */

import { drawGlowCircle } from './RenderUtils.js';
import { Assets } from './AssetManager.js';

// Level-spezifische Renderer-Funktionen
function drawBossLevel1(ctx, b) {
  ctx.translate(b.x, b.y);

  if (Assets.bossCore1.loaded() && Assets.bossCore1.image()) {
    const targetSize = b.r * 2 * 1.5;
    const imageWidth = Assets.bossCore1.image().width || 116;
    const imageHeight = Assets.bossCore1.image().height || 116;
    const scale = targetSize / Math.max(imageWidth, imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    ctx.shadowColor = 'rgba(255,59,107,0.55)';
    ctx.shadowBlur = 28;
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = 'high';
    }

    ctx.drawImage(Assets.bossCore1.image(), -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  } else {
    // Fallback
    drawGlowCircle(ctx, 0, 0, b.r*1.55, 'rgba(255,59,107,0.45)', 1);
    drawGlowCircle(ctx, 0, 0, b.r*1.15, 'rgba(255,59,107,0.45)', 1);
    const shell = ctx.createLinearGradient(0,-b.r, 0, b.r);
    shell.addColorStop(0,'rgba(245,250,255,0.85)');
    shell.addColorStop(1,'rgba(255,59,107,0.90)');
    ctx.shadowColor = 'rgba(255,59,107,0.55)';
    ctx.shadowBlur = 28;
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.roundRect(-b.r*1.05, -b.r*0.70, b.r*2.10, b.r*1.40, 38);
    ctx.fill();
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(245,250,255,0.45)';
    ctx.beginPath();
    ctx.roundRect(-b.r*1.40, -b.r*0.22, b.r*0.52, b.r*0.44, 26);
    ctx.roundRect(b.r*0.88, -b.r*0.22, b.r*0.52, b.r*0.44, 26);
    ctx.fill();
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 22, 'rgba(255,209,102,0.90)', 1);
    drawGlowCircle(ctx, 0, 0, 10, 'rgba(0,0,0,0.25)', 1);
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*6);
    ctx.strokeStyle = `rgba(108,255,154,${0.18 + (1-hpRatio)*0.18 + pulse*0.08})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.72, 0, Math.PI*2);
    ctx.stroke();
  }
}

function drawBossLevel2(ctx, b) {
  ctx.translate(b.x, b.y);

  if (Assets.bossCore2.loaded() && Assets.bossCore2.image()) {
    const targetSize = b.r * 2 * 1.65;
    const imageWidth = Assets.bossCore2.image().width || 116;
    const imageHeight = Assets.bossCore2.image().height || 116;
    const scale = targetSize / Math.max(imageWidth, imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    ctx.shadowColor = 'rgba(200,50,255,0.60)';
    ctx.shadowBlur = 32;
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = 'high';
    }

    ctx.drawImage(Assets.bossCore2.image(), -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    if (Assets.bossCore2Ring.loaded() && Assets.bossCore2Ring.image()) {
      ctx.save();
      const swingAngle = Math.sin(b.t * 2) * 0.26;
      ctx.rotate(swingAngle);
      const pulse = 1.0 + Math.sin(b.t * 4) * 0.05;
      const ringWidth = Assets.bossCore2Ring.image().width || imageWidth;
      const ringHeight = Assets.bossCore2Ring.image().height || imageHeight;
      const baseRingScale = (targetSize / Math.max(ringWidth, ringHeight)) * 1.5;
      const ringScale = baseRingScale * pulse;
      const ringDrawWidth = ringWidth * ringScale;
      const ringDrawHeight = ringHeight * ringScale;
      const ringRadius = Math.max(ringDrawWidth, ringDrawHeight) / 2 * 0.7;
      const glowCount = 12;
      const glowPulse = 0.7 + Math.sin(b.t * 6) * 0.3;
      const glowPositions = [];
      
      for (let i = 0; i < glowCount; i++) {
        const angle = (i / glowCount) * Math.PI * 2 + b.t * 1.5;
        const glowX = Math.cos(angle) * ringRadius;
        const glowY = Math.sin(angle) * ringRadius;
        glowPositions.push({ x: glowX, y: glowY });
        const glowSize = (10 + Math.sin(b.t * 4 + i) * 3) * glowPulse;
        const glowAlpha = 0.7 + Math.sin(b.t * 5 + i * 0.5) * 0.3;
        drawGlowCircle(ctx, glowX, glowY, glowSize, `rgba(200,50,255,${glowAlpha})`, 1);
        drawGlowCircle(ctx, glowX, glowY, glowSize * 0.6, `rgba(255,150,255,${glowAlpha * 0.9})`, 1);
      }
      
      const laserPulse = 0.5 + Math.sin(b.t * 8) * 0.4;
      ctx.save();
      ctx.globalAlpha = laserPulse;
      ctx.strokeStyle = 'rgba(220,80,255,1.0)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(220,80,255,1.0)';
      ctx.shadowBlur = 12;
      for (let i = 0; i < glowCount; i++) {
        const current = glowPositions[i];
        const next = glowPositions[(i + 1) % glowCount];
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
      ctx.restore();
      
      ctx.imageSmoothingEnabled = true;
      if (ctx.imageSmoothingQuality) {
        ctx.imageSmoothingQuality = 'high';
      }
      ctx.drawImage(Assets.bossCore2Ring.image(), -ringDrawWidth / 2, -ringDrawHeight / 2, ringDrawWidth, ringDrawHeight);
      ctx.restore();
    }
  } else {
    // Fallback
    drawGlowCircle(ctx, 0, 0, b.r*1.6, 'rgba(200,50,255,0.45)', 1);
    drawGlowCircle(ctx, 0, 0, b.r*1.2, 'rgba(150,100,255,0.45)', 1);
    const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
    shell.addColorStop(0,'rgba(245,250,255,0.90)');
    shell.addColorStop(0.5,'rgba(200,50,255,0.85)');
    shell.addColorStop(1,'rgba(100,0,200,0.90)');
    ctx.shadowColor = 'rgba(200,50,255,0.60)';
    ctx.shadowBlur = 32;
    ctx.fillStyle = shell;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r;
      const y = Math.sin(angle) * b.r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,209,102,0.75)';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r * 1.1;
      const y = Math.sin(angle) * b.r * 1.1;
      drawGlowCircle(ctx, x, y, 8, 'rgba(255,209,102,0.90)', 1);
    }
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 24, 'rgba(200,50,255,0.90)', 1);
    drawGlowCircle(ctx, 0, 0, 12, 'rgba(0,0,0,0.30)', 1);
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*8);
    ctx.strokeStyle = `rgba(108,255,154,${0.20 + (1-hpRatio)*0.20 + pulse*0.10})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.75, 0, Math.PI*2);
    ctx.stroke();
  }
}

function drawBossLevel3(ctx, b) {
  ctx.translate(b.x, b.y);

  if (Assets.bossCore3.loaded() && Assets.bossCore3.image()) {
    const targetSize = b.r * 2 * 1.7;
    const imageWidth = Assets.bossCore3.image().width || 116;
    const imageHeight = Assets.bossCore3.image().height || 116;
    const scale = targetSize / Math.max(imageWidth, imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    ctx.shadowColor = 'rgba(255,100,0,0.65)';
    ctx.shadowBlur = 36;
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = 'high';
    }

    ctx.drawImage(Assets.bossCore3.image(), -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    const ringElements = b.ringElements || [];
    const allRingElementsDestroyed = ringElements.length === 0 || ringElements.every(e => e.destroyed);
    
    if (!allRingElementsDestroyed) {
      const glowRingRadius = b.r * 1.8;
      const glowCount = 12;
      const glowPulse = 0.8 + Math.sin(b.t * 6) * 0.2;
      const glowPositions = [];
      
      for (let i = 0; i < glowCount; i++) {
        const angle = (i / glowCount) * Math.PI * 2 + b.t * 1.5;
        const glowX = Math.cos(angle) * glowRingRadius;
        const glowY = Math.sin(angle) * glowRingRadius;
        glowPositions.push({ x: glowX, y: glowY });
        const glowSize = (12 + Math.sin(b.t * 4 + i) * 4) * glowPulse;
        const glowAlpha = 0.9 + Math.sin(b.t * 5 + i * 0.5) * 0.1;
        drawGlowCircle(ctx, glowX, glowY, glowSize, `rgba(255,50,50,${glowAlpha})`, 1);
        drawGlowCircle(ctx, glowX, glowY, glowSize * 0.7, `rgba(255,100,80,${glowAlpha})`, 1);
        drawGlowCircle(ctx, glowX, glowY, glowSize * 0.4, `rgba(255,200,150,${glowAlpha})`, 1);
      }
      
      const laserPulse = 0.7 + Math.sin(b.t * 8) * 0.3;
      ctx.save();
      ctx.globalAlpha = laserPulse;
      ctx.strokeStyle = 'rgba(255,60,60,1.0)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255,60,60,1.0)';
      ctx.shadowBlur = 16;
      for (let i = 0; i < glowCount; i++) {
        const current = glowPositions[i];
        const next = glowPositions[(i + 1) % glowCount];
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    if (Assets.bossCore3RingElement.loaded() && Assets.bossCore3RingElement.image()) {
      const elementPulse = 1.0 + Math.sin(b.t * 6) * 0.12;
      const elementWidth = Assets.bossCore3RingElement.image().width || imageWidth;
      const elementHeight = Assets.bossCore3RingElement.image().height || imageHeight;
      const baseElementScale = (targetSize / Math.max(elementWidth, elementHeight)) * 0.65;
      const elementScale = baseElementScale * elementPulse;
      const elementDrawWidth = elementWidth * elementScale;
      const elementDrawHeight = elementHeight * elementScale;
      const ringRadius = b.r * 1.5;
      
      ctx.imageSmoothingEnabled = true;
      if (ctx.imageSmoothingQuality) {
        ctx.imageSmoothingQuality = 'high';
      }
      
      for (let j = 0; j < ringElements.length; j++) {
        const element = ringElements[j];
        if (element && element.destroyed) continue;
        ctx.save();
        const rotationDirection = element.ringIndex === 0 ? -1 : 1;
        ctx.rotate(rotationDirection * b.t * 1.2 + (element.index * Math.PI / 4));
        ctx.translate(ringRadius, 0);
        ctx.rotate(Math.PI / 4);
        ctx.drawImage(Assets.bossCore3RingElement.image(), -elementDrawWidth / 2, -elementDrawHeight / 2, elementDrawWidth, elementDrawHeight);
        ctx.restore();
      }
    }
  } else {
    // Fallback
    drawGlowCircle(ctx, 0, 0, b.r*1.7, 'rgba(255,100,0,0.50)', 1);
    drawGlowCircle(ctx, 0, 0, b.r*1.3, 'rgba(255,150,0,0.45)', 1);
    drawGlowCircle(ctx, 0, 0, b.r*0.9, 'rgba(255,200,0,0.40)', 1);
    ctx.rotate(b.t * 0.5);
    const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
    shell.addColorStop(0,'rgba(255,250,245,0.95)');
    shell.addColorStop(0.3,'rgba(255,200,100,0.90)');
    shell.addColorStop(0.6,'rgba(255,150,0,0.85)');
    shell.addColorStop(1,'rgba(255,50,0,0.90)');
    ctx.shadowColor = 'rgba(255,100,0,0.65)';
    ctx.shadowBlur = 36;
    ctx.fillStyle = shell;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r;
      const y = Math.sin(angle) * b.r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255,200,0,0.85)';
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r * 1.25;
      const y = Math.sin(angle) * b.r * 1.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const spikeX = Math.cos(angle) * b.r * 1.45;
      const spikeY = Math.sin(angle) * b.r * 1.45;
      ctx.lineTo(spikeX, spikeY);
      const spikeAngle1 = angle + Math.PI / 8;
      ctx.lineTo(Math.cos(spikeAngle1) * b.r * 1.15, Math.sin(spikeAngle1) * b.r * 1.15);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 16;
    ctx.strokeStyle = 'rgba(255,209,102,0.70)';
    ctx.lineWidth = 3;
    ctx.save();
    ctx.rotate(-b.t * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.6, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 28, 'rgba(255,100,0,0.95)', 1);
    drawGlowCircle(ctx, 0, 0, 14, 'rgba(0,0,0,0.35)', 1);
    const centerPulse = 0.5 + 0.5*Math.sin(b.t*10);
    drawGlowCircle(ctx, 0, 0, 8 + centerPulse * 4, 'rgba(255,255,255,0.90)', 1);
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*10);
    ctx.strokeStyle = `rgba(108,255,154,${0.25 + (1-hpRatio)*0.25 + pulse*0.12})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.8, 0, Math.PI*2);
    ctx.stroke();
  }
}

function drawBossLevel4(ctx, b) {
  drawGlowCircle(ctx, b.x, b.y, b.r*1.8, 'rgba(100,200,255,0.50)', 1);
  drawGlowCircle(ctx, b.x, b.y, b.r*1.4, 'rgba(50,150,255,0.45)', 1);
  drawGlowCircle(ctx, b.x, b.y, b.r*1.0, 'rgba(0,100,255,0.40)', 1);
  ctx.translate(b.x, b.y);
  ctx.rotate(b.t * 0.7);
  const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
  shell.addColorStop(0,'rgba(255,255,255,0.95)');
  shell.addColorStop(0.3,'rgba(150,200,255,0.90)');
  shell.addColorStop(0.6,'rgba(50,150,255,0.85)');
  shell.addColorStop(1,'rgba(0,100,200,0.90)');
  ctx.shadowColor = 'rgba(50,150,255,0.70)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = shell;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = (i % 2 === 0) ? b.r : b.r * 0.6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(100,200,255,0.80)';
  ctx.save();
  ctx.rotate(-b.t * 1.2);
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const x = Math.cos(angle) * b.r * 1.3;
    const y = Math.sin(angle) * b.r * 1.3;
    drawGlowCircle(ctx, x, y, 12, 'rgba(100,200,255,0.90)', 1);
  }
  ctx.restore();
  ctx.shadowBlur = 0;
  drawGlowCircle(ctx, 0, 0, 32, 'rgba(50,150,255,0.95)', 1);
  drawGlowCircle(ctx, 0, 0, 16, 'rgba(0,0,0,0.40)', 1);
  const centerPulse = 0.5 + 0.5*Math.sin(b.t*12);
  drawGlowCircle(ctx, 0, 0, 10 + centerPulse * 5, 'rgba(255,255,255,0.90)', 1);
  const hpRatio = b.hp/b.hpMax;
  const pulse = 0.4 + 0.6*Math.sin(b.t*12);
  ctx.strokeStyle = `rgba(108,255,154,${0.30 + (1-hpRatio)*0.30 + pulse*0.15})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, b.r*0.85, 0, Math.PI*2);
  ctx.stroke();
}

function drawBossLevel5(ctx, b) {
  drawGlowCircle(ctx, b.x, b.y, b.r*2.0, 'rgba(255,0,100,0.55)', 1);
  drawGlowCircle(ctx, b.x, b.y, b.r*1.6, 'rgba(200,0,150,0.50)', 1);
  drawGlowCircle(ctx, b.x, b.y, b.r*1.2, 'rgba(150,0,200,0.45)', 1);
  drawGlowCircle(ctx, b.x, b.y, b.r*0.8, 'rgba(100,0,255,0.40)', 1);
  ctx.translate(b.x, b.y);
  ctx.rotate(b.t * 0.9);
  const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
  shell.addColorStop(0,'rgba(255,255,255,0.98)');
  shell.addColorStop(0.2,'rgba(255,100,200,0.95)');
  shell.addColorStop(0.4,'rgba(200,0,150,0.90)');
  shell.addColorStop(0.6,'rgba(150,0,200,0.85)');
  shell.addColorStop(1,'rgba(100,0,255,0.90)');
  ctx.shadowColor = 'rgba(200,0,150,0.75)';
  ctx.shadowBlur = 44;
  ctx.fillStyle = shell;
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i - Math.PI / 2;
    const x = Math.cos(angle) * b.r;
    const y = Math.sin(angle) * b.r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 28;
  ctx.fillStyle = 'rgba(255,100,200,0.90)';
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i - Math.PI / 2;
    const x = Math.cos(angle) * b.r * 1.3;
    const y = Math.sin(angle) * b.r * 1.3;
    const spikeX = Math.cos(angle) * b.r * 1.6;
    const spikeY = Math.sin(angle) * b.r * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(spikeX, spikeY);
    const spikeAngle1 = angle + Math.PI / 12;
    ctx.lineTo(Math.cos(spikeAngle1) * b.r * 1.2, Math.sin(spikeAngle1) * b.r * 1.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(255,209,102,0.80)';
  ctx.lineWidth = 4;
  ctx.save();
  ctx.rotate(-b.t * 1.0);
  ctx.beginPath();
  ctx.arc(0, 0, b.r*0.7, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.rotate(b.t * 1.5);
  ctx.beginPath();
  ctx.arc(0, 0, b.r*0.5, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
  ctx.shadowBlur = 0;
  drawGlowCircle(ctx, 0, 0, 36, 'rgba(200,0,150,0.98)', 1);
  drawGlowCircle(ctx, 0, 0, 18, 'rgba(0,0,0,0.45)', 1);
  const centerPulse = 0.4 + 0.6*Math.sin(b.t*15);
  drawGlowCircle(ctx, 0, 0, 12 + centerPulse * 6, 'rgba(255,255,255,0.95)', 1);
  const innerPulse = 0.3 + 0.7*Math.sin(b.t*20);
  drawGlowCircle(ctx, 0, 0, 6 + innerPulse * 4, 'rgba(255,100,200,0.90)', 1);
  const hpRatio = b.hp/b.hpMax;
  const pulse = 0.4 + 0.6*Math.sin(b.t*15);
  ctx.strokeStyle = `rgba(108,255,154,${0.35 + (1-hpRatio)*0.35 + pulse*0.18})`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, b.r*0.9, 0, Math.PI*2);
  ctx.stroke();
}

export function drawBoss(ctx, b) {
  ctx.save();
  const level = b.level || 1;
  
  if (level === 1) {
    drawBossLevel1(ctx, b);
  } else if (level === 2) {
    drawBossLevel2(ctx, b);
  } else if (level === 3) {
    drawBossLevel3(ctx, b);
  } else if (level === 4) {
    drawBossLevel4(ctx, b);
  } else if (level === 5) {
    drawBossLevel5(ctx, b);
  }
  
  ctx.restore();
}
