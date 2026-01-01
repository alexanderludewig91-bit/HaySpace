/**
 * Utility-Funktionen für Rendering
 * Wiederverwendbare Zeichenfunktionen
 */

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

