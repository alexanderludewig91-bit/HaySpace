import { rand } from '../utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class Starfield {
  constructor() {
    this.stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      r: Math.random() < 0.85 ? rand(0.6, 1.6) : rand(1.8, 3.0),
      v: rand(14, 55),
      a: rand(0.18, 0.85),
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.5, 1.5)
    }));
  }

  update(dt) {
    for (const s of this.stars) {
      s.y += s.v * dt;
      s.twinklePhase += s.twinkleSpeed * dt;
      if (s.y > CANVAS_HEIGHT + 30) {
        s.y = -30;
        s.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

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
}

