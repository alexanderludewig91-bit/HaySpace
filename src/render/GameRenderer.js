import { clamp } from '../utils/math.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config.js';

const H = CANVAS_HEIGHT;
const W = CANVAS_WIDTH;

export function drawGlowCircle(ctx, x, y, r, color, a=1){
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = Math.max(8, r*1.5);
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

export function drawRoundedRect(ctx, x, y, w, h, rad){
  const r = Math.min(rad, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y, x+w,y+h, r);
  ctx.arcTo(x+w,y+h, x,y+h, r);
  ctx.arcTo(x,y+h, x,y, r);
  ctx.arcTo(x,y, x+w,y, r);
  ctx.closePath();
}

export function drawPlayer(ctx, p, time){
  const blink = (p.inv>0) ? ((Math.sin(time*28)>0) ? 0.25 : 1) : 1;
  ctx.save();
  ctx.globalAlpha = blink;

  drawGlowCircle(ctx, p.x, p.y+26, 12, 'rgba(255,209,102,0.55)', 1);

  ctx.save();
  ctx.translate(p.x, p.y);

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

  ctx.restore();
  ctx.restore();
}

export function drawEnemy(ctx, e, hardMode){
  ctx.save();

  // Farben basierend auf Gegner-Typ (hue aus e.hue)
  const hue = e.hue || 340;
  const glowColor = `hsla(${hue}, 100%, 60%, ${e.kind==='tank' || e.kind==='guardian' || e.kind==='destroyer' || e.kind==='reaper' || e.kind==='titan' || e.kind==='void' || e.kind==='apocalypse' ? 0.55 : 0.48})`;
  drawGlowCircle(ctx, e.x, e.y, e.r*1.15, glowColor, 1);

  ctx.translate(e.x, e.y);

  const body = ctx.createLinearGradient(0,-e.r, 0, e.r);
  body.addColorStop(0,'rgba(255,255,255,0.85)');
  body.addColorStop(1,`hsla(${hue}, 100%, 50%, 0.90)`);

  ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.55)`;
  ctx.shadowBlur = 22;

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.r*1.05, e.r*0.85, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(245,250,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -e.r*0.18, e.r*0.65, e.r*0.45, 0, 0, Math.PI*2);
  ctx.stroke();

  drawGlowCircle(ctx, e.r*0.22, -e.r*0.08, e.kind==='tank' || e.kind==='guardian' || e.kind==='destroyer' || e.kind==='reaper' || e.kind==='titan' || e.kind==='void' || e.kind==='apocalypse'? 8 : 6, 'rgba(255,209,102,0.90)', 1);

  // HP-Bar für große Gegner
  if (e.kind === 'tank' || e.kind === 'guardian' || e.kind === 'destroyer' || 
      e.kind === 'reaper' || e.kind === 'titan' || e.kind === 'void' || e.kind === 'apocalypse'){
    const w = 70;
    let maxHP;
    if (e.kind === 'tank') maxHP = hardMode ? 14 : 10;
    else if (e.kind === 'guardian') maxHP = hardMode ? 18 : 14;
    else if (e.kind === 'destroyer') maxHP = hardMode ? 24 : 20;
    else if (e.kind === 'reaper') maxHP = hardMode ? 30 : 26;
    else if (e.kind === 'titan') maxHP = hardMode ? 36 : 30;
    else if (e.kind === 'void') maxHP = hardMode ? 40 : 34;
    else maxHP = hardMode ? 48 : 40; // apocalypse
    
    const hp = clamp(e.hp, 0, maxHP);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    drawRoundedRect(ctx, -w/2, -e.r-22, w, 8, 999);
    ctx.fill();
    ctx.fillStyle = 'rgba(108,255,154,0.85)';
    drawRoundedRect(ctx, -w/2, -e.r-22, w*(hp/maxHP), 8, 999);
    ctx.fill();
  }

  ctx.restore();
}

export function drawBoss(ctx, b){
  ctx.save();
  
  const level = b.level || 1;
  
  if (level === 1) {
    // Level 1 Boss: Rechteckiges Design (Original)
    drawGlowCircle(ctx, b.x, b.y, b.r*1.55, 'rgba(255,59,107,0.45)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.15, 'rgba(255,59,107,0.45)', 1);

    ctx.translate(b.x, b.y);

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
  } else if (level === 2) {
    // Level 2 Boss: Hexagonales/Sechseckiges Design mit mehr Details
    drawGlowCircle(ctx, b.x, b.y, b.r*1.6, 'rgba(200,50,255,0.45)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.2, 'rgba(150,100,255,0.45)', 1);

    ctx.translate(b.x, b.y);
    ctx.rotate(b.t * 0.3); // Langsame Rotation

    // Hauptkörper: Hexagon
    const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
    shell.addColorStop(0,'rgba(245,250,255,0.90)');
    shell.addColorStop(0.5,'rgba(200,50,255,0.85)');
    shell.addColorStop(1,'rgba(100,0,200,0.90)');

    ctx.shadowColor = 'rgba(200,50,255,0.60)';
    ctx.shadowBlur = 32;
    ctx.fillStyle = shell;
    ctx.beginPath();
    // Hexagon zeichnen
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r;
      const y = Math.sin(angle) * b.r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Zusätzliche Details: Eckpunkte
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,209,102,0.75)';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r * 1.1;
      const y = Math.sin(angle) * b.r * 1.1;
      drawGlowCircle(ctx, x, y, 8, 'rgba(255,209,102,0.90)', 1);
    }

    // Zentrum
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 24, 'rgba(200,50,255,0.90)', 1);
    drawGlowCircle(ctx, 0, 0, 12, 'rgba(0,0,0,0.30)', 1);

    // HP-Ring
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*8);
    ctx.strokeStyle = `rgba(108,255,154,${0.20 + (1-hpRatio)*0.20 + pulse*0.10})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.75, 0, Math.PI*2);
    ctx.stroke();
  } else if (level === 3) {
    // Level 3 Boss: Komplexes Design mit mehreren Segmenten und Spikes
    drawGlowCircle(ctx, b.x, b.y, b.r*1.7, 'rgba(255,100,0,0.50)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.3, 'rgba(255,150,0,0.45)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*0.9, 'rgba(255,200,0,0.40)', 1);

    ctx.translate(b.x, b.y);
    ctx.rotate(b.t * 0.5); // Schnellere Rotation

    // Hauptkörper: Achteck (Oktagon)
    const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
    shell.addColorStop(0,'rgba(255,250,245,0.95)');
    shell.addColorStop(0.3,'rgba(255,200,100,0.90)');
    shell.addColorStop(0.6,'rgba(255,150,0,0.85)');
    shell.addColorStop(1,'rgba(255,50,0,0.90)');

    ctx.shadowColor = 'rgba(255,100,0,0.65)';
    ctx.shadowBlur = 36;
    ctx.fillStyle = shell;
    ctx.beginPath();
    // Oktagon zeichnen
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r;
      const y = Math.sin(angle) * b.r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Spikes an den Ecken
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
      const spikeAngle2 = angle - Math.PI / 8;
      ctx.lineTo(Math.cos(spikeAngle1) * b.r * 1.15, Math.sin(spikeAngle1) * b.r * 1.15);
      ctx.closePath();
      ctx.fill();
    }

    // Innere Details: Rotierende Ringe
    ctx.shadowBlur = 16;
    ctx.strokeStyle = 'rgba(255,209,102,0.70)';
    ctx.lineWidth = 3;
    ctx.save();
    ctx.rotate(-b.t * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.6, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Zentrum
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 28, 'rgba(255,100,0,0.95)', 1);
    drawGlowCircle(ctx, 0, 0, 14, 'rgba(0,0,0,0.35)', 1);
    
    // Pulsierendes Zentrum
    const centerPulse = 0.5 + 0.5*Math.sin(b.t*10);
    drawGlowCircle(ctx, 0, 0, 8 + centerPulse * 4, 'rgba(255,255,255,0.90)', 1);

    // HP-Ring
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*10);
    ctx.strokeStyle = `rgba(108,255,154,${0.25 + (1-hpRatio)*0.25 + pulse*0.12})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.8, 0, Math.PI*2);
    ctx.stroke();
  } else if (level === 4) {
    // Level 4 Boss: Sternförmiges Design mit rotierenden Segmenten
    drawGlowCircle(ctx, b.x, b.y, b.r*1.8, 'rgba(100,200,255,0.50)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.4, 'rgba(50,150,255,0.45)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.0, 'rgba(0,100,255,0.40)', 1);

    ctx.translate(b.x, b.y);
    ctx.rotate(b.t * 0.7); // Mittlere Rotation

    // Hauptkörper: Stern (10 Zacken)
    const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
    shell.addColorStop(0,'rgba(255,255,255,0.95)');
    shell.addColorStop(0.3,'rgba(150,200,255,0.90)');
    shell.addColorStop(0.6,'rgba(50,150,255,0.85)');
    shell.addColorStop(1,'rgba(0,100,200,0.90)');

    ctx.shadowColor = 'rgba(50,150,255,0.70)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = shell;
    ctx.beginPath();
    // Stern mit 10 Zacken zeichnen
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

    // Rotierende äußere Segmente
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

    // Zentrum
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 32, 'rgba(50,150,255,0.95)', 1);
    drawGlowCircle(ctx, 0, 0, 16, 'rgba(0,0,0,0.40)', 1);
    
    // Pulsierendes Zentrum
    const centerPulse = 0.5 + 0.5*Math.sin(b.t*12);
    drawGlowCircle(ctx, 0, 0, 10 + centerPulse * 5, 'rgba(255,255,255,0.90)', 1);

    // HP-Ring
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*12);
    ctx.strokeStyle = `rgba(108,255,154,${0.30 + (1-hpRatio)*0.30 + pulse*0.15})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.85, 0, Math.PI*2);
    ctx.stroke();
  } else if (level === 5) {
    // Level 5 Boss: Komplexes Design mit mehreren konzentrischen Ringen und Spikes
    drawGlowCircle(ctx, b.x, b.y, b.r*2.0, 'rgba(255,0,100,0.55)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.6, 'rgba(200,0,150,0.50)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*1.2, 'rgba(150,0,200,0.45)', 1);
    drawGlowCircle(ctx, b.x, b.y, b.r*0.8, 'rgba(100,0,255,0.40)', 1);

    ctx.translate(b.x, b.y);
    ctx.rotate(b.t * 0.9); // Schnelle Rotation

    // Hauptkörper: Zwölfeck (Dodekagon)
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
    // Dodekagon zeichnen
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI / 6) * i - Math.PI / 2;
      const x = Math.cos(angle) * b.r;
      const y = Math.sin(angle) * b.r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Äußere Spikes (länger und aggressiver)
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
      const spikeAngle2 = angle - Math.PI / 12;
      ctx.lineTo(Math.cos(spikeAngle1) * b.r * 1.2, Math.sin(spikeAngle1) * b.r * 1.2);
      ctx.closePath();
      ctx.fill();
    }

    // Rotierende innere Ringe (gegenläufig)
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

    // Zentrum
    ctx.shadowBlur = 0;
    drawGlowCircle(ctx, 0, 0, 36, 'rgba(200,0,150,0.98)', 1);
    drawGlowCircle(ctx, 0, 0, 18, 'rgba(0,0,0,0.45)', 1);
    
    // Stark pulsierendes Zentrum
    const centerPulse = 0.4 + 0.6*Math.sin(b.t*15);
    drawGlowCircle(ctx, 0, 0, 12 + centerPulse * 6, 'rgba(255,255,255,0.95)', 1);
    
    // Innerer Kern
    const innerPulse = 0.3 + 0.7*Math.sin(b.t*20);
    drawGlowCircle(ctx, 0, 0, 6 + innerPulse * 4, 'rgba(255,100,200,0.90)', 1);

    // HP-Ring
    const hpRatio = b.hp/b.hpMax;
    const pulse = 0.4 + 0.6*Math.sin(b.t*15);
    ctx.strokeStyle = `rgba(108,255,154,${0.35 + (1-hpRatio)*0.35 + pulse*0.18})`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, b.r*0.9, 0, Math.PI*2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawBullet(ctx, b, friendly){
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

export function drawParticle(ctx, p){
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
    ctx.globalAlpha = 0.25*a;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (p.kind === 'beamCharge'){
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

  for (const b of game.bullets) drawBullet(ctx, b, true);
  for (const b of game.enemyBullets) drawBullet(ctx, b, false);

  for (const p of game.pickups) drawPickup(ctx, p);

  drawPlayer(ctx, game.player, game.time);

  for (const p of game.particles) drawParticle(ctx, p);

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

