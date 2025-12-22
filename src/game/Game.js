import { clamp, rand, lerp } from '../utils/math.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';
import { sfx } from '../systems/AudioSystem.js';
import { Starfield } from '../background/Starfield.js';
import { Nebula } from '../background/Nebula.js';

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;

export class Game {
  constructor() {
    this.hardMode = false;
    this.shake = 0;
    this.hitstop = 0;
    this.state = 'title';
    this.paused = false;
    this.overheatLocked = false;
    
    this.player = {
      x: W*0.5, y: H*0.78,
      vx: 0, vy: 0,
      r: 10,
      collectRadius: 25,
      shieldMax: 100,
      shield: 100,
      lives: 3,
      fireCD: 0,
      heat: 0,
      dashCD: 0,
      inv: 0,
      weaponLevel: 1,
      speedBoost: 1.0,
    };

    this.score = 0;
    this.wave = 1;
    this.time = 0;

    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.pickups = [];
    this.enemyBullets = [];
    this.popups = [];

    this.starfield = new Starfield();
    this.nebula = new Nebula();

    this.boss = null;
  }

  addPopup(text, x, y, life=0.75, kind='normal'){
    this.popups.push({text, x, y, vy: -48, life, max: life, kind});
  }

  resetAll(){
    this.score = 0; this.wave = 1; this.time = 0;
    this.bullets.length = 0; this.enemies.length = 0; this.particles.length = 0; 
    this.pickups.length = 0; this.enemyBullets.length = 0; this.popups.length = 0;
    this.boss = null;

    this.player.x = W*0.5; this.player.y = H*0.78;
    this.player.vx = 0; this.player.vy = 0;
    this.player.shield = this.player.shieldMax;
    this.player.lives = 3;
    this.player.fireCD = 0;
    this.player.heat = 0;
    this.player.dashCD = 0;
    this.player.inv = 0;
    this.player.weaponLevel = 1;
    this.player.speedBoost = 1.0;

    this.overheatLocked = false;
    this.shake = 0; this.hitstop = 0;
  }

  spawnEnemy(kind, x, y){
    const base = {
      x, y, vx: 0, vy: 0, r: 18, hp: 3, kind, t: 0, score: 30,
      shootCD: rand(0.25, 1.2),
      hue: (kind==='tank') ? 350 : (kind==='striker' ? 330 : 340)
    };

    if (kind === 'drone') {
      base.r = 12;
      base.hp = this.hardMode ? 3 : 2;
      base.vy = rand(60, 95);
      base.score = 25;
    }

    if (kind === 'striker') {
      base.r = 14;
      base.hp = this.hardMode ? 6 : 4;
      base.vy = rand(55, 85);
      base.vx = rand(-50, 50);
      base.score = 45;
      base.shootCD = rand(1.2, 2.0);
    }

    if (kind === 'tank') {
      base.r = 18;
      base.hp = this.hardMode ? 14 : 10;
      base.vy = rand(35, 50);
      base.score = 90;
      base.shootCD = rand(1.5, 2.5);
    }

    this.enemies.push(base);
  }

  spawnWave(n){
    const count = 6 + n*2 + (this.hardMode?2:0);
    for (let i=0;i<count;i++){
      const kind = (Math.random()<0.6) ? 'drone' : (Math.random()<0.78 ? 'striker' : 'tank');
      this.spawnEnemy(kind, rand(80, W-80), rand(-520, -120));
    }
  }

  spawnBoss(){
    this.boss = {
      x: W*0.5, y: -160, vx: 0, vy: 85, r: 58,
      hpMax: this.hardMode ? 520 : 420,
      hp: this.hardMode ? 520 : 420,
      t: 0, shootCD: 0.6, rage: 0, phase: 0
    };
  }

  addExplosion(x,y, scale=1, doShake=false){
    if (doShake) {
      this.shake = Math.min(18, this.shake + 7.8*scale);
      this.hitstop = Math.min(0.09, this.hitstop + 0.03*scale);
    }

    const n = 22 + (scale*20|0);
    for (let i=0;i<n;i++){
      this.particles.push({
        x, y,
        vx: rand(-250,250)*scale,
        vy: rand(-250,250)*scale,
        life: rand(0.20,0.62),
        r: rand(1.2, 4.8)*scale,
        kind: 'spark',
        hue: (Math.random()<0.55) ? 145 : 350,
        a: 1
      });
    }

    this.particles.push({x,y, r: 8*scale, life: 0.35*scale, kind:'ring', a: 1});
  }

  addTrail(x,y, vx,vy, hue=145, size=2){
    this.particles.push({
      x, y,
      vx: vx*0.05 + rand(-15,15),
      vy: vy*0.05 + rand(-15,15),
      life: rand(0.10,0.22),
      r: size,
      kind:'trail',
      hue,
      a: 0.7
    });
  }

  dropPickup(x,y){
    const r = Math.random();
    if (r < 0.12){
      this.pickups.push({x,y, vy: rand(55, 85), r: 12, kind: 'shield', t:0});
    } else if (r < 0.20){
      this.pickups.push({x,y, vy: rand(55, 85), r: 12, kind: 'speed', t:0});
    } else if (r < 0.27){
      this.pickups.push({x,y, vy: rand(55, 85), r: 12, kind: 'upgrade', t:0});
    }
  }

  shoot(){
    if (this.player.fireCD > 0) return;
    if (this.overheatLocked) return;
    if (this.player.heat >= 100) {
      this.overheatLocked = true;
      sfx('overheat');
      this.addPopup('OVERHEAT', this.player.x, this.player.y-60, 0.9, 'warn');
      return;
    }

    this.player.fireCD = this.hardMode ? 0.11 : 0.09;

    const heatCost = (this.hardMode ? 9 : 7) + (this.player.weaponLevel-1)*1.4;
    this.player.heat = clamp(this.player.heat + heatCost, 0, 110);
    if (this.player.heat >= 100) {
      this.overheatLocked = true;
      sfx('overheat');
      this.addPopup('OVERHEAT', this.player.x, this.player.y-60, 0.9, 'warn');
    }

    const level = clamp(this.player.weaponLevel, 1, 5);
    const baseDmg = 2 + (level-1);

    const patterns = {
      1: [0],
      2: [-0.06, 0.06],
      3: [-0.085, 0, 0.085],
      4: [-0.105, -0.035, 0.035, 0.105],
      5: [-0.125, -0.06, 0, 0.06, 0.125]
    };

    const offsets = patterns[level] || [0];
    for (const s of offsets){
      this.bullets.push({
        x: this.player.x, y: this.player.y-40,
        vx: s*280, vy: -440, r: 5,
        dmg: baseDmg, life: 1.25, hue: 145
      });
    }

    sfx('shoot');

    for (let i=0;i<10;i++){
      this.particles.push({x: this.player.x+rand(-10,10), y: this.player.y-34+rand(-8,8), vx: rand(-85,85), vy: rand(-200,-80), life: rand(0.06,0.12), r: rand(1,3), kind:'trail', hue: 60, a: 0.8});
    }
  }

  enemyShoot(e){
    const speed = this.hardMode ? 200 : 170;
    const ax = this.player.x - e.x;
    const ay = (this.player.y - e.y);
    const len = Math.hypot(ax,ay) || 1;
    this.enemyBullets.push({x:e.x, y:e.y+e.r, vx: ax/len*speed, vy: ay/len*speed, r: 5, dmg: this.hardMode?18:14, life: 4, hue: 350});
  }

  bossShootPattern(){
    const t = this.boss.t;
    const hpRatio = this.boss.hp / this.boss.hpMax;

    const petals = this.hardMode ? 12 : 10;
    const baseSpeed = lerp(165, 250, 1-hpRatio);
    const rot = t*1.15;

    for (let i=0;i<petals;i++){
      const ang = rot + (i/petals)*Math.PI*2;
      this.enemyBullets.push({
        x: this.boss.x, y: this.boss.y,
        vx: Math.cos(ang)*baseSpeed,
        vy: Math.sin(ang)*baseSpeed,
        r: 5, dmg: this.hardMode?16:12, life: 6, hue: 350
      });
    }

    if (hpRatio < 0.72){
      const bursts = (hpRatio < 0.38) ? 3 : 2;
      for (let j=0;j<bursts;j++){
        const speed = lerp(220, 305, 1-hpRatio);
        const ax = (this.player.x - this.boss.x) + rand(-40,40);
        const ay = (this.player.y - this.boss.y) + rand(-40,40);
        const len = Math.hypot(ax,ay) || 1;
        this.enemyBullets.push({x:this.boss.x, y:this.boss.y, vx: ax/len*speed, vy: ay/len*speed, r: 5, dmg: this.hardMode?18:14, life: 6, hue: 350});
      }
    }
  }

  damagePlayer(dmg){
    if (this.player.inv > 0) return;

    this.player.inv = 0.55;
    this.shake = Math.min(28, this.shake + 14);
    this.hitstop = Math.min(0.09, this.hitstop + 0.03);

    let remaining = dmg;
    if (this.player.shield > 0){
      const absorbed = Math.min(this.player.shield, remaining);
      this.player.shield -= absorbed;
      remaining -= absorbed;
    }

    sfx('hit');

    if (remaining > 0){
      this.player.lives -= 1;
      this.player.shield = this.player.shieldMax;
      this.player.x = W*0.5; this.player.y = H*0.78;
      this.player.vx = this.player.vy = 0;
      this.player.inv = 1.0;
      this.addExplosion(this.player.x, this.player.y, 1.3, true);

      if (this.player.lives <= 0){
        this.state = 'dead';
        return true; // Signal für Game Over
      }
    }
    return false;
  }

  update(dt, keys){
    if (this.hitstop > 0){
      this.hitstop -= dt;
      return;
    }

    this.time += dt;

    this.starfield.update(dt);
    this.nebula.update(dt);

    const baseAccel = this.hardMode ? 1800 : 2100;
    const baseMaxV  = this.hardMode ? 600 : 680;
    const accel = baseAccel * this.player.speedBoost;
    const maxV  = baseMaxV * this.player.speedBoost;
    const fric  = 0.88;

    let ax = 0, ay = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) ax -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) ax += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) ay -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) ay += 1;

    const mag = Math.hypot(ax,ay);
    if (mag > 0){ ax/=mag; ay/=mag; }

    this.player.vx = (this.player.vx + ax*accel*dt) * fric;
    this.player.vy = (this.player.vy + ay*accel*dt) * fric;

    const spd = Math.hypot(this.player.vx, this.player.vy);
    if (spd > maxV){
      this.player.vx = (this.player.vx/spd)*maxV;
      this.player.vy = (this.player.vy/spd)*maxV;
    }

    if (this.player.dashCD > 0) this.player.dashCD -= dt;
    if ((keys.has('ShiftLeft') || keys.has('ShiftRight')) && this.player.dashCD <= 0){
      this.player.dashCD = this.hardMode ? 0.55 : 0.45;
      this.player.inv = Math.max(this.player.inv, 0.40);
      const dx = (ax!==0||ay!==0) ? ax : 0;
      const dy = (ax!==0||ay!==0) ? ay : -1;
      const dashSpeed = (this.hardMode?1000:1200) * this.player.speedBoost;
      this.player.vx += dx*dashSpeed;
      this.player.vy += dy*dashSpeed;
      this.addExplosion(this.player.x, this.player.y, 0.6);
    }

    this.player.x += this.player.vx*dt;
    this.player.y += this.player.vy*dt;

    this.player.x = clamp(this.player.x, 60, W-60);
    this.player.y = clamp(this.player.y, 90, H-60);

    if (this.player.fireCD > 0) this.player.fireCD -= dt;

    this.player.heat = clamp(this.player.heat - (this.hardMode?34:40)*dt, 0, 110);
    if (this.overheatLocked && this.player.heat <= 0) this.overheatLocked = false;

    if (this.player.inv > 0) this.player.inv -= dt;

    if (keys.has('Space')) this.shoot();

    for (let i=this.bullets.length-1;i>=0;i--){
      const b = this.bullets[i];
      b.x += b.vx*dt;
      b.y += b.vy*dt;
      b.life -= dt;
      this.addTrail(b.x, b.y, b.vx, b.vy, 145, 2);
      if (b.y < -60 || b.life<=0) this.bullets.splice(i,1);
    }

    for (let i=this.enemies.length-1;i>=0;i--){
      const e = this.enemies[i];
      e.t += dt;

      if (e.kind === 'drone'){
        e.x += Math.sin(e.t*2.2)*70*dt;
        e.y += e.vy*dt;
      } else if (e.kind === 'striker'){
        e.x += (e.vx + Math.sin(e.t*3.1)*85*dt);
        e.y += e.vy*dt;
      } else {
        e.x += Math.sin(e.t*1.6)*45*dt;
        e.y += e.vy*dt;
      }

      e.x = clamp(e.x, 60, W-60);

      e.shootCD -= dt;
      if (e.shootCD <= 0 && e.y > 140){
        this.enemyShoot(e);
        e.shootCD = (e.kind==='tank' ? rand(1.5,2.5) : rand(1.2,2.0)) * (this.hardMode?0.9:1.0);
      }

      if (Math.hypot(e.x-this.player.x, e.y-this.player.y) < e.r + this.player.r){
        this.addExplosion(e.x, e.y, 1.1, true);
        this.enemies.splice(i,1);
        if (this.damagePlayer(this.hardMode?38:30)) return true;
        continue;
      }

      if (e.y > H + 200){
        this.enemies.splice(i,1);
        continue;
      }
    }

    for (let i=this.enemyBullets.length-1;i>=0;i--){
      const b = this.enemyBullets[i];
      b.x += b.vx*dt;
      b.y += b.vy*dt;
      b.life -= dt;
      this.addTrail(b.x, b.y, b.vx, b.vy, 350, 2);

      if (b.life<=0 || b.x<-120 || b.x>W+120 || b.y<-120 || b.y>H+160){
        this.enemyBullets.splice(i,1);
        continue;
      }

      if (Math.hypot(b.x-this.player.x, b.y-this.player.y) < b.r + this.player.r){
        this.enemyBullets.splice(i,1);
        this.addExplosion(b.x, b.y, 0.8, true);
        if (this.damagePlayer(b.dmg)) return true;
      }
    }

    for (let i=this.pickups.length-1;i>=0;i--){
      const p = this.pickups[i];
      p.t += dt;
      p.y += p.vy*dt;
      p.x += Math.sin(p.t*6)*25*dt;

      if (p.y > H+120){ this.pickups.splice(i,1); continue; }

      if (Math.hypot(p.x-this.player.x, p.y-this.player.y) < p.r + this.player.collectRadius){
        if (p.kind === 'shield') {
          this.player.shield = clamp(this.player.shield + 55, 0, this.player.shieldMax);
          sfx('shield');
          this.addPopup('+SHIELD', p.x, p.y-18, 0.75, 'good');
        }
        if (p.kind === 'speed') {
          this.player.speedBoost = clamp(this.player.speedBoost + 0.15, 1.0, 2.0);
          sfx('upgrade');
          this.addPopup('SPEED+', p.x, p.y-18, 0.75, 'cool');
        }
        if (p.kind === 'upgrade') {
          const before = this.player.weaponLevel;
          this.player.weaponLevel = clamp(this.player.weaponLevel + 1, 1, 5);
          sfx('upgrade');
          if (this.player.weaponLevel > before){
            this.addExplosion(p.x, p.y, 1.05);
            this.addPopup('WEAPON UP!', p.x, p.y-22, 0.95, 'upgrade');
          } else {
            this.addExplosion(p.x, p.y, 0.75);
            this.addPopup('MAX', p.x, p.y-18, 0.75, 'muted');
          }
        }

        this.addExplosion(p.x, p.y, 0.7);
        this.pickups.splice(i,1);
      }
    }

    for (let i=this.bullets.length-1;i>=0;i--){
      const b = this.bullets[i];
      let hit = false;

      if (this.boss && Math.hypot(b.x-this.boss.x, b.y-this.boss.y) < b.r + this.boss.r){
        this.boss.hp -= b.dmg;
        this.score += 2;
        this.addExplosion(b.x,b.y, 0.55);
        this.bullets.splice(i,1);
        hit = true;
        if (this.boss.hp <= 0){
          this.addExplosion(this.boss.x,this.boss.y, 2.6);
          for (let k=0;k<14;k++) this.addExplosion(this.boss.x+rand(-90,90), this.boss.y+rand(-70,70), 1.1);
          this.boss = null;
          this.state = 'win';
          return true; // Signal für Win
        }
      }
      if (hit) continue;

      for (let j=this.enemies.length-1;j>=0;j--){
        const e = this.enemies[j];
        if (Math.hypot(b.x-e.x, b.y-e.y) < b.r + e.r){
          e.hp -= b.dmg;
          this.addExplosion(b.x,b.y, 0.55);
          this.bullets.splice(i,1);
          if (e.hp <= 0){
            this.score += e.score;
            this.addExplosion(e.x, e.y, e.kind==='tank'?1.35:1.05);
            this.dropPickup(e.x, e.y);
            this.enemies.splice(j,1);
          }
          break;
        }
      }
    }

    if (!this.boss){
      if (this.enemies.length === 0){
        if (this.wave >= 4){
          this.spawnBoss();
        } else {
          this.wave += 1;
          this.spawnWave(this.wave);
        }
      }
    } else {
      this.boss.t += dt;
      if (this.boss.y < 190){
        this.boss.y += this.boss.vy*dt;
      } else {
        const targetX = W*0.5 + Math.sin(this.boss.t*0.8)*280;
        this.boss.x = lerp(this.boss.x, targetX, 0.04 + (this.hardMode?0.01:0));
        this.boss.y = 190 + Math.sin(this.boss.t*1.1)*18;

        this.boss.shootCD -= dt;
        const hpRatio = this.boss.hp / this.boss.hpMax;
        const rate = lerp(0.85, this.hardMode?0.40:0.50, 1-hpRatio);
        if (this.boss.shootCD <= 0){
          this.bossShootPattern();
          this.boss.shootCD = rate;
        }

        if (hpRatio < 0.55){
          this.boss.rage += dt;
          const cycle = this.hardMode ? 6.0 : 7.2;
          if (this.boss.rage > cycle){
            this.boss.rage = 0;
            const beamX = this.player.x;
            this.addPopup('WARNING', beamX, 220, 0.6, 'warn');
            this.particles.push({x: beamX, y: 0, w: this.hardMode ? 34 : 42, life: this.hardMode ? 0.45 : 0.55, kind:'beamCharge', a: 1, onDone: () => {
              this.shake = Math.min(40, this.shake + 20);
              this.hitstop = Math.min(0.10, this.hitstop + 0.04);
              this.particles.push({x: beamX, y: 0, w: this.hardMode ? 34 : 42, life: 0.22, kind:'beam', a: 1});
              if (Math.abs(this.player.x - beamX) < (this.hardMode ? 34 : 42)*0.5){
                this.damagePlayer(this.hardMode ? 55 : 45);
              }
              for (let i=0;i<46;i++){
                this.particles.push({x: beamX+rand(-60,60), y: rand(120,H), vx: rand(-340,340), vy: rand(-350,350), life: rand(0.18,0.45), r: rand(1.4,4.2), kind:'spark', hue: 350, a: 1});
              }
            }});
          }
        }
      }
    }

    for (let i=this.particles.length-1;i>=0;i--){
      const p = this.particles[i];
      p.life -= dt;
      p.x += (p.vx||0)*dt;
      p.y += (p.vy||0)*dt;
      if (p.kind === 'spark'){
        p.vx *= 0.93;
        p.vy *= 0.93;
      }
      if (p.kind === 'ring') p.r += 200*dt;

      if (p.life <= 0) this.particles.splice(i,1);
    }

    for (let i=this.popups.length-1;i>=0;i--){
      const pp = this.popups[i];
      pp.life -= dt;
      pp.y += (pp.vy||-48)*dt;
      if (pp.life <= 0) this.popups.splice(i,1);
    }

    this.shake = Math.max(0, this.shake - 28*dt);
    return false;
  }
}

