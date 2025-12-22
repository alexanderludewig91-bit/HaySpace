import { rand } from '../utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class Nebula {
  constructor() {
    this.nebulas = [
      { x: CANVAS_WIDTH * 0.62, y: CANVAS_HEIGHT * 0.22, baseR: 220, color: 'rgba(0,212,255,0.25)', baseAlpha: 0.9, v: rand(8, 15) },
      { x: CANVAS_WIDTH * 0.28, y: CANVAS_HEIGHT * 0.78, baseR: 260, color: 'rgba(108,255,154,0.16)', baseAlpha: 0.85, v: rand(6, 12) },
      { x: CANVAS_WIDTH * 0.82, y: CANVAS_HEIGHT * 0.70, baseR: 220, color: 'rgba(255,59,107,0.12)', baseAlpha: 0.75, v: rand(10, 18) }
    ];
  }

  update(dt) {
    for (const n of this.nebulas) {
      n.y += n.v * dt;
      if (n.y > CANVAS_HEIGHT + n.baseR) {
        n.y = -n.baseR;
        n.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  render(ctx, drawGlowCircle) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (const n of this.nebulas) {
      drawGlowCircle(ctx, n.x, n.y, n.baseR, n.color, n.baseAlpha);
    }
    ctx.restore();
  }
}

