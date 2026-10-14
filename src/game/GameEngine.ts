import { GameState, LevelDefinition, PikoCharacter, Platform } from '../types/game';
import { soundManager } from './audio';
import { LEVELS } from './levels';
import { ParticleSystem } from './particles';
import {
  calculateLandingQuality,
  calculateLaunchVelocity,
  calculateNearMissDistance,
  checkHazardOverlap,
  checkPlatformLanding,
  checkWindZone,
  clamp,
  PHYSICS,
  simulateJumpTrajectory,
} from './physics';
import { drawPiko } from './pikoRenderer';
import { drawPlatform, drawTrajectoryPreview, drawWindZone, drawWorldBackground } from './worldRenderer';

export interface GameEngineCallbacks {
  onStateChange: (state: GameState) => void;
  onChargeUpdate: (ratio: number, currentSeconds: number) => void;
  onLevelComplete: (levelId: number, attempts: number) => void;
  onFailure: (nearMissDistance: number | null, funnyQuote: string, attempts: number) => void;
  onLandingFeedback: (feedback: string) => void;
  onAttemptsChange: (attempts: number) => void;
  onProgressChange?: (currentObstacle: number, totalObstacles: number) => void;
}

const FUNNY_FAILURE_QUOTES = [
  'YOK ARTIK!',
  'BU KADAR MI YAKIN?!',
  'BEN ATLADIM ASLINDA!',
  'BİR DAHA!',
  'AZCIK DAHA!',
  'YER ÇEKİMİ SUÇLU!',
  'Ayyy!',
  'Bu sayılmaz!',
  'Yine mi?!',
];

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public state: GameState = 'BOOT';
  public currentLevel: LevelDefinition = LEVELS[0];
  public platforms: Platform[] = [];
  public piko: PikoCharacter;
  public particles: ParticleSystem;

  // Timers and physics loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private gameTime: number = 0;

  // Charging mechanics
  private isPointerCharging: boolean = false;
  private chargeDuration: number = 0;
  private hasPlayedMaxChargePing: boolean = false;

  // Camera
  public cameraX: number = 0;
  private targetCameraX: number = 0;

  // Stats
  public levelAttempts: number = 1;
  private landingAnimTimer: number = 0;
  private landingQualityText: string | null = null;

  // Near miss & slow-mo
  private slowMoTimer: number = 0;
  private timeScale: number = 1.0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.particles = new ParticleSystem();

    this.piko = {
      x: 60,
      y: 400,
      vx: 0,
      vy: 0,
      width: PHYSICS.CHAR_WIDTH,
      height: PHYSICS.CHAR_HEIGHT,
      grounded: true,
      currentPlatformId: null,
      squashX: 1,
      squashY: 1,
      blinkTimer: 2.5,
      isBlinking: false,
      lookDir: 1,
      speechText: null,
      speechTimer: 0,
      nearMissDist: null,
    };

    this.setupWindowEvents();
  }

  private setupWindowEvents() {
    window.addEventListener('blur', () => {
      if (this.state === 'PLAYING' || this.state === 'CHARGING') {
        this.pause();
      }
    });
  }

  public init() {
    this.loadLevel(1);
    this.setState('MAIN_MENU');
    this.startLoop();
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  public loadLevel(levelId: number) {
    const found = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    this.currentLevel = found;
    this.levelAttempts = 1;
    this.callbacks.onAttemptsChange(this.levelAttempts);

    this.resetLevelState();
  }

  public resetLevelState() {
    // Clone platforms to reset states
    this.platforms = JSON.parse(JSON.stringify(this.currentLevel.platforms));

    // Place Piko on start platform
    const startPlat = this.platforms.find((p) => p.isStart) || this.platforms[0];
    this.piko.x = startPlat.x + startPlat.width / 2 - PHYSICS.CHAR_WIDTH / 2;
    this.piko.y = startPlat.y - PHYSICS.CHAR_HEIGHT;
    this.piko.vx = 0;
    this.piko.vy = 0;
    this.piko.grounded = true;
    this.piko.currentPlatformId = startPlat.id;
    this.piko.squashX = 1;
    this.piko.squashY = 1;
    this.piko.speechText = null;
    this.piko.speechTimer = 0;
    this.piko.nearMissDist = null;
    this.piko.isShocked = false;

    // Reset charging
    this.isPointerCharging = false;
    this.chargeDuration = 0;
    this.hasPlayedMaxChargePing = false;
    soundManager.stopChargeSound();

    // Reset camera & effects
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.particles.clear();
    this.landingAnimTimer = 0;
    this.landingQualityText = null;
    this.slowMoTimer = 0;
    this.timeScale = 1.0;

    this.notifyProgress();
  }

  public restartCurrentLevel() {
    this.levelAttempts++;
    this.callbacks.onAttemptsChange(this.levelAttempts);
    this.resetLevelState();
    this.setState('PLAYING');
  }

  public startCharging() {
    if (this.state !== 'PLAYING') return;
    if (!this.piko.grounded) return;

    this.isPointerCharging = true;
    this.chargeDuration = 0;
    this.hasPlayedMaxChargePing = false;
    this.setState('CHARGING');

    soundManager.warmUp();
    soundManager.startChargeSound();
  }

  public releaseJump() {
    if (this.state !== 'CHARGING' || !this.isPointerCharging) return;

    this.isPointerCharging = false;
    const finalCharge = Math.max(PHYSICS.MIN_CHARGE_TIME, this.chargeDuration);
    const { vx, vy, ratio } = calculateLaunchVelocity(finalCharge);

    // Apply launch
    this.piko.vx = vx;
    this.piko.vy = vy;
    this.piko.grounded = false;
    this.piko.currentPlatformId = null;

    // Squash & Stretch: Stretch along jump
    this.piko.squashX = 0.8;
    this.piko.squashY = 1.35;

    // Particles & Sound
    this.particles.emitLandingDust(this.piko.x + PHYSICS.CHAR_WIDTH / 2, this.piko.y + PHYSICS.CHAR_HEIGHT, 6);
    soundManager.playJump(ratio);

    this.chargeDuration = 0;
    this.callbacks.onChargeUpdate(0, 0);
    this.setState('AIRBORNE');
  }

  public pause() {
    if (this.state === 'PLAYING' || this.state === 'CHARGING') {
      soundManager.stopChargeSound();
      this.isPointerCharging = false;
      this.setState('PAUSED');
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  private notifyProgress() {
    const landable = this.platforms.filter((p) => p.type !== 'hazard');
    const idx = landable.findIndex((p) => p.id === this.piko.currentPlatformId);
    const currentObstacle = idx >= 0 ? idx + 1 : 1;
    this.callbacks.onProgressChange?.(currentObstacle, landable.length);
  }

  private startLoop() {
    this.lastTime = performance.now();
    const frame = (now: number) => {
      const rawDelta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // Clamp frame gap to prevent accumulator explosion
      const delta = Math.min(rawDelta, 0.1);

      this.update(delta);
      this.render();

      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  private update(delta: number) {
    if (this.state === 'PAUSED' || this.state === 'BOOT') return;

    // Slow motion handling for near-miss
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      this.timeScale = 0.3;
      if (this.slowMoTimer <= 0) {
        this.timeScale = 1.0;
      }
    } else {
      this.timeScale = 1.0;
    }

    const scaledDelta = delta * this.timeScale;
    this.gameTime += scaledDelta;

    // Fixed timestep accumulator
    this.accumulator += scaledDelta;
    while (this.accumulator >= PHYSICS.FIXED_DT) {
      this.fixedUpdate(PHYSICS.FIXED_DT);
      this.accumulator -= PHYSICS.FIXED_DT;
    }

    // Visual updates (particles, blinking, camera)
    this.particles.update(delta);

    // Piko blinking
    this.piko.blinkTimer -= delta;
    if (this.piko.blinkTimer <= 0) {
      this.piko.isBlinking = !this.piko.isBlinking;
      this.piko.blinkTimer = this.piko.isBlinking ? 0.15 : 2.5 + Math.random() * 2.5;
    }

    // Speech bubble timer
    if (this.piko.speechTimer > 0) {
      this.piko.speechTimer -= delta;
      if (this.piko.speechTimer <= 0) {
        this.piko.speechText = null;
      }
    }

    // Smooth camera follow with lookahead
    const targetCam = Math.max(0, this.piko.x - 70);
    this.targetCameraX = targetCam;
    this.cameraX += (this.targetCameraX - this.cameraX) * Math.min(1, delta * 7);
  }

  private fixedUpdate(dt: number) {
    // 1. Update platforms: Moving, Vertical Moving, Crumbling, Disappearing, Bounce springs
    for (const plat of this.platforms) {
      // Horizontal Moving Platforms
      if (plat.type === 'moving' && plat.moveConfig) {
        const cfg = plat.moveConfig;
        const dir = cfg.direction ?? 1;
        plat.x += cfg.speed * dir * dt;

        if (plat.x >= cfg.maxX) {
          plat.x = cfg.maxX;
          cfg.direction = -1;
        } else if (plat.x <= cfg.minX) {
          plat.x = cfg.minX;
          cfg.direction = 1;
        }

        // If Piko is grounded on this moving platform, carry Piko
        if (this.piko.grounded && this.piko.currentPlatformId === plat.id) {
          this.piko.x += cfg.speed * (cfg.direction ?? 1) * dt;
        }
      }

      // Vertical Moving Elevator Platforms
      if (plat.type === 'vertical_moving' && plat.verticalMoveConfig) {
        const cfg = plat.verticalMoveConfig;
        const dir = cfg.direction ?? 1;
        plat.y += cfg.speed * dir * dt;

        if (plat.y >= cfg.maxY) {
          plat.y = cfg.maxY;
          cfg.direction = -1;
        } else if (plat.y <= cfg.minY) {
          plat.y = cfg.minY;
          cfg.direction = 1;
        }

        // If Piko is grounded on it, move Piko with the elevator
        if (this.piko.grounded && this.piko.currentPlatformId === plat.id) {
          this.piko.y = plat.y - PHYSICS.CHAR_HEIGHT;
        }
      }

      // Disappearing Ghost Platforms
      if (plat.type === 'disappearing' && plat.disappearConfig) {
        const cfg = plat.disappearConfig;
        cfg.timer = (cfg.timer ?? cfg.visibleDuration) - dt;
        if (cfg.timer <= 0) {
          cfg.isVisible = !cfg.isVisible;
          cfg.timer = cfg.isVisible ? cfg.visibleDuration : cfg.invisibleDuration;

          // If it just disappeared while Piko was standing on it, Piko falls!
          if (!cfg.isVisible && this.piko.grounded && this.piko.currentPlatformId === plat.id) {
            this.piko.grounded = false;
            this.piko.currentPlatformId = null;
            this.piko.vy = 80;
            this.setState('AIRBORNE');
            this.showPikoSpeech('Aaaaa!', 1.2);
          }
        }
      }

      // Bounce Spring Animation Decay
      if (plat.bounceAnim && plat.bounceAnim > 0) {
        plat.bounceAnim = Math.max(0, plat.bounceAnim - dt * 4);
      }

      // Crumbling platforms
      if (plat.type === 'crumbling' && plat.isCracking && !plat.isCrumbled) {
        if (plat.crumbleTimer !== undefined) {
          plat.crumbleTimer -= dt;
          if (plat.crumbleTimer <= 0) {
            plat.isCrumbled = true;
            this.particles.emitCrumbleDebris(plat.x, plat.y, plat.width);
            soundManager.playCrack();

            // If Piko was on it, start falling!
            if (this.piko.grounded && this.piko.currentPlatformId === plat.id) {
              this.piko.grounded = false;
              this.piko.currentPlatformId = null;
              this.piko.vy = 80;
              this.setState('AIRBORNE');
            }
          }
        }
      }
    }

    // 2. Charging mechanics update
    if (this.state === 'CHARGING' && this.isPointerCharging) {
      this.chargeDuration = Math.min(PHYSICS.MAX_CHARGE_TIME, this.chargeDuration + dt);
      const ratio = this.chargeDuration / PHYSICS.MAX_CHARGE_TIME;

      soundManager.updateChargeSound(ratio);
      this.callbacks.onChargeUpdate(ratio, this.chargeDuration);

      // Squash vertically while charging
      this.piko.squashY = 1.0 - ratio * 0.35; // squashes down to 0.65
      this.piko.squashX = 1.0 + ratio * 0.35; // expands horizontally to 1.35

      // At max charge, excited tremble + sparkles
      if (ratio >= 0.99) {
        this.piko.x += (Math.random() - 0.5) * 1.5;
        this.particles.emitMaxChargeSparkles(
          this.piko.x + PHYSICS.CHAR_WIDTH / 2,
          this.piko.y + PHYSICS.CHAR_HEIGHT / 2
        );
        if (!this.hasPlayedMaxChargePing) {
          this.hasPlayedMaxChargePing = true;
          soundManager.playMaxChargePing();
        }
      }
    }

    // 3. Airborne physics
    if (this.state === 'AIRBORNE') {
      const prevY = this.piko.y;

      // Apply Wind Zones
      if (this.currentLevel.windZones) {
        for (const wind of this.currentLevel.windZones) {
          if (checkWindZone(this.piko.x, this.piko.y, wind)) {
            this.piko.vy += wind.forceY * dt;
            if (wind.forceX) this.piko.vx += wind.forceX * dt;
          }
        }
      }

      this.piko.vy += PHYSICS.GRAVITY * dt;
      this.piko.x += this.piko.vx * dt;
      this.piko.y += this.piko.vy * dt;

      // Relax squash towards neutral
      this.piko.squashX += (1 - this.piko.squashX) * dt * 8;
      this.piko.squashY += (1 - this.piko.squashY) * dt * 8;

      // Jump trail
      if (Math.random() > 0.4) {
        this.particles.emitJumpTrail(this.piko.x + PHYSICS.CHAR_WIDTH / 2, this.piko.y + PHYSICS.CHAR_HEIGHT);
      }

      // Check Hazard Collision (Lasers or Spikes)
      for (const plat of this.platforms) {
        if (plat.type === 'hazard') {
          if (checkHazardOverlap(this.piko.x, this.piko.y, plat)) {
            this.handleHazardHit(plat);
            return;
          }
        }
      }

      // Check collision with all landable platforms
      for (const plat of this.platforms) {
        if (plat.isCrumbled || plat.type === 'hazard') continue;
        if (plat.disappearConfig && plat.disappearConfig.isVisible === false) continue;

        if (checkPlatformLanding(prevY, this.piko.y, this.piko.x, this.piko.vy, plat)) {
          this.handleLanding(plat);
          return;
        }
      }

      // Fall off check (fell past bottom)
      if (this.piko.y > PHYSICS.WORLD_HEIGHT + 20) {
        this.handleFallDeath();
      }
    }

    // 4. Landing bounce settling
    if (this.landingAnimTimer > 0) {
      this.landingAnimTimer -= dt;
      this.piko.squashX += (1 - this.piko.squashX) * dt * 12;
      this.piko.squashY += (1 - this.piko.squashY) * dt * 12;
    }
  }

  private handleHazardHit(hazard: Platform) {
    this.setState('FAILURE');
    this.piko.isShocked = true;
    soundManager.playLaserZap();

    const isLaser = hazard.hazardConfig?.type === 'laser';
    const quote = isLaser ? 'ÇARPILDIM!' : 'DİKEN BATTI!';
    this.piko.nearMissDist = null;
    this.showPikoSpeech(quote, 2.0);
    this.callbacks.onFailure(null, quote, this.levelAttempts);
  }

  private handleLanding(plat: Platform) {
    // Snap precisely to platform surface
    this.piko.y = plat.y - PHYSICS.CHAR_HEIGHT;
    this.piko.vy = 0;
    this.piko.vx = 0;
    this.piko.grounded = true;
    this.piko.currentPlatformId = plat.id;

    this.notifyProgress();

    // Check BOUNCE Platform
    if (plat.type === 'bounce') {
      plat.bounceAnim = 1.0;
      const centerX = this.piko.x + PHYSICS.CHAR_WIDTH / 2;
      const footY = plat.y;

      this.particles.emitPerfectStars(centerX, footY - 14);
      soundManager.playBounce();
      this.showPikoSpeech('BOİNG!', 1.2);

      // Launch Piko upwards & forwards automatically!
      this.piko.vy = -(plat.bounceForce || 530);
      this.piko.vx = 220;
      this.piko.grounded = false;
      this.piko.currentPlatformId = null;
      this.piko.squashX = 0.7;
      this.piko.squashY = 1.4;
      this.setState('AIRBORNE');
      return;
    }

    // Landing squash
    this.piko.squashX = 1.35;
    this.piko.squashY = 0.65;
    this.landingAnimTimer = 0.18;

    // Calculate quality
    const { quality, text } = calculateLandingQuality(this.piko.x, plat);
    this.landingQualityText = text;
    this.callbacks.onLandingFeedback(text);

    // Visual & audio feedback
    const centerX = this.piko.x + PHYSICS.CHAR_WIDTH / 2;
    const footY = plat.y;
    this.particles.emitLandingDust(centerX, footY, 10);

    if (quality === 'PERFECT') {
      this.particles.emitPerfectStars(centerX, footY - 14);
      soundManager.playLanding(true, false);
      this.showPikoSpeech(text, 1.2);
    } else if (quality === 'EDGE') {
      soundManager.playLanding(false, true);
      this.showPikoSpeech('Ayyy!', 1.0);
    } else {
      soundManager.playLanding(false, false);
      this.showPikoSpeech(text, 0.9);
    }

    // Finish platform check
    if (plat.isFinish) {
      this.handleVictory();
      return;
    }

    // Crumbling platform trigger
    if (plat.type === 'crumbling' && !plat.isCracking) {
      plat.isCracking = true;
      plat.crumbleTimer = plat.crumbleDelay || 1.5;
      soundManager.playCrack();
      this.showPikoSpeech('Hemen zıpla!', 1.2);
    }

    this.setState('PLAYING');
  }

  private handleVictory() {
    this.setState('VICTORY');
    soundManager.playVictory();
    this.particles.emitPerfectStars(this.piko.x + PHYSICS.CHAR_WIDTH / 2, this.piko.y);
    this.showPikoSpeech('BAŞARDIM!', 2.0);
    this.callbacks.onLevelComplete(this.currentLevel.id, this.levelAttempts);
  }

  private handleFallDeath() {
    this.setState('FAILURE');

    // Find the closest intended target platform to evaluate Signature Near-Miss
    let closestDist: number | null = null;

    for (const plat of this.platforms) {
      if (plat.isStart || plat.type === 'hazard') continue;
      const d = calculateNearMissDistance(this.piko, plat);
      if (closestDist === null || d < closestDist) {
        closestDist = d;
      }
    }

    // Signature Near-Miss feature check:
    if (closestDist !== null && closestDist <= PHYSICS.NEAR_MISS_THRESHOLD && closestDist > 0) {
      const roundedDist = Math.max(1, Math.round(closestDist));
      const missText = `SADECE ${roundedDist} PİKSEL!`;
      this.piko.nearMissDist = roundedDist;
      this.showPikoSpeech(missText, 2.5);

      this.slowMoTimer = 0.45;
      soundManager.playNearMiss();
      this.callbacks.onFailure(roundedDist, missText, this.levelAttempts);
    } else {
      const quote = FUNNY_FAILURE_QUOTES[Math.floor(Math.random() * FUNNY_FAILURE_QUOTES.length)];
      this.piko.nearMissDist = null;
      this.showPikoSpeech(quote, 1.8);
      soundManager.playFailure();
      this.callbacks.onFailure(null, quote, this.levelAttempts);
    }
  }

  public showPikoSpeech(text: string, duration: number = 1.2) {
    this.piko.speechText = text;
    this.piko.speechTimer = duration;
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Save baseline scaling transform
    ctx.save();

    // Scale canvas from logical 360x640 baseline to physical screen
    const scaleX = w / PHYSICS.WORLD_WIDTH;
    const scaleY = h / PHYSICS.WORLD_HEIGHT;
    ctx.scale(scaleX, scaleY);

    // Draw background with soft parallax clouds
    drawWorldBackground(ctx, PHYSICS.WORLD_WIDTH, PHYSICS.WORLD_HEIGHT, this.cameraX);

    // World camera translation
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Draw Wind current streams if any
    if (this.currentLevel.windZones) {
      for (const zone of this.currentLevel.windZones) {
        drawWindZone(ctx, zone, this.gameTime);
      }
    }

    // Draw all platforms & hazards
    for (const plat of this.platforms) {
      drawPlatform(ctx, plat, this.gameTime);
    }

    // Trajectory Preview while charging
    if (this.state === 'CHARGING' && this.isPointerCharging) {
      const currentCharge = Math.max(PHYSICS.MIN_CHARGE_TIME, this.chargeDuration);
      const sim = simulateJumpTrajectory(
        this.piko.x,
        this.piko.y,
        currentCharge,
        this.platforms,
        this.currentLevel.windZones || []
      );

      drawTrajectoryPreview(
        ctx,
        sim.points,
        sim.hitPoint,
        this.currentLevel.previewLengthRatio
      );
    }

    // Particles (behind character)
    this.particles.render(ctx);

    // PIKO Character
    let renderState: 'idle' | 'charging' | 'jumping' | 'falling' | 'perfect' | 'edge' | 'failure' | 'victory' = 'idle';
    if (this.state === 'CHARGING') renderState = 'charging';
    else if (this.state === 'AIRBORNE') {
      renderState = this.piko.vy > 120 ? 'falling' : 'jumping';
    } else if (this.state === 'VICTORY') renderState = 'victory';
    else if (this.state === 'FAILURE') renderState = 'failure';
    else if (this.landingQualityText === 'MÜKEMMEL!') renderState = 'perfect';
    else if (this.landingQualityText === 'KENARDAN!') renderState = 'edge';

    drawPiko(ctx, this.piko, {
      state: renderState,
      chargeRatio: this.chargeDuration / PHYSICS.MAX_CHARGE_TIME,
      time: this.gameTime,
    });

    ctx.restore(); // camera
    ctx.restore(); // baseline scale
  }
}
