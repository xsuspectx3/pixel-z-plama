export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotSpeed?: number;
  shape?: 'circle' | 'square' | 'star';
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public reducedMotion: boolean = false;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        this.drawStar(ctx, p.x, p.y, 5, p.size, p.size * 0.4, p.rotation || 0);
      } else if (p.shape === 'square') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    rot: number
  ) {
    let rotAngle = (Math.PI / 2) * 3 + rot;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rotAngle) * outerRadius;
      y = cy + Math.sin(rotAngle) * outerRadius;
      ctx.lineTo(x, y);
      rotAngle += step;

      x = cx + Math.cos(rotAngle) * innerRadius;
      y = cy + Math.sin(rotAngle) * innerRadius;
      ctx.lineTo(x, y);
      rotAngle += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  public emitLandingDust(x: number, y: number, count: number = 8) {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
      const speed = 20 + Math.random() * 60;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5,
        size: 2.5 + Math.random() * 3,
        color: '#ffffff',
        alpha: 0.8,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }
  }

  public emitPerfectStars(x: number, y: number) {
    if (this.reducedMotion) return;
    const colors = ['#fde047', '#fbbf24', '#f472b6', '#c084fc', '#38bdf8'];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 60 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 8,
        shape: 'star',
      });
    }
  }

  public emitMaxChargeSparkles(x: number, y: number) {
    if (this.reducedMotion) return;
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#38bdf8'];
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 40,
        size: 2 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.9,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        shape: 'star',
      });
    }
  }

  public emitCrumbleDebris(x: number, y: number, width: number) {
    if (this.reducedMotion) return;
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: x + Math.random() * width,
        y: y + Math.random() * 8,
        vx: (Math.random() - 0.5) * 50,
        vy: 20 + Math.random() * 100,
        size: 2 + Math.random() * 4,
        color: '#f97316',
        alpha: 0.9,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 6,
        shape: 'square',
      });
    }
  }

  public emitJumpTrail(x: number, y: number) {
    if (this.reducedMotion) return;
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: 10 + Math.random() * 15,
      size: 3 + Math.random() * 2,
      color: '#e0e7ff',
      alpha: 0.6,
      life: 0,
      maxLife: 0.22,
    });
  }

  public clear() {
    this.particles = [];
  }
}
