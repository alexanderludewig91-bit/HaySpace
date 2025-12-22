import { clamp } from '../utils/math.js';
import { CANVAS_HEIGHT } from '../config.js';

const H = CANVAS_HEIGHT;

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

  const glow = `rgba(255,59,107,${e.kind==='tank' ? 0.55 : 0.48})`;
  drawGlowCircle(ctx, e.x, e.y, e.r*1.15, glow, 1);

  ctx.translate(e.x, e.y);

  const body = ctx.createLinearGradient(0,-e.r, 0, e.r);
  body.addColorStop(0,'rgba(255,255,255,0.85)');
  body.addColorStop(1,'rgba(255,59,107,0.90)');

  ctx.shadowColor = 'rgba(255,59,107,0.55)';
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

  drawGlowCircle(ctx, e.r*0.22, -e.r*0.08, e.kind==='tank'? 8 : 6, 'rgba(255,209,102,0.90)', 1);

  if (e.kind === 'tank'){
    const w = 70;
    const hp = clamp(e.hp, 0, hardMode?14:10);
    const max = hardMode?14:10;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    drawRoundedRect(ctx, -w/2, -e.r-22, w, 8, 999);
    ctx.fill();
    ctx.fillStyle = 'rgba(108,255,154,0.85)';
    drawRoundedRect(ctx, -w/2, -e.r-22, w*(hp/max), 8, 999);
    ctx.fill();
  }

  ctx.restore();
}

export function drawBoss(ctx, b){
  ctx.save();

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

  if (game.paused && game.state==='play'){
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = 'rgba(245,250,255,.92)';
    ctx.font = '700 22px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', W/2, H/2);
    ctx.font = '500 14px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(245,250,255,.68)';
    ctx.fillText('Press P to resume', W/2, H/2 + 26);
    ctx.restore();
  }

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
}

