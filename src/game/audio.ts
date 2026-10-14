class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private isChargingAudio: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (!enabled && this.isChargingAudio) {
      this.stopChargeSound();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public warmUp() {
    this.initCtx();
    if (this.musicEnabled) {
      this.startMusic();
    }
  }

  // --- BUTTON CLICK ---
  public playClick() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- CHARGE SOUND (Continuous pitch rise) ---
  public startChargeSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopChargeSound();

    try {
      this.chargeOsc = ctx.createOscillator();
      this.chargeGain = ctx.createGain();
      const now = ctx.currentTime;

      this.chargeOsc.type = 'triangle';
      this.chargeOsc.frequency.setValueAtTime(220, now);

      this.chargeGain.gain.setValueAtTime(0.01, now);
      this.chargeGain.gain.linearRampToValueAtTime(0.08, now + 0.1);

      this.chargeOsc.connect(this.chargeGain);
      this.chargeGain.connect(ctx.destination);

      this.chargeOsc.start(now);
      this.isChargingAudio = true;
    } catch {
      // safe fallback
    }
  }

  public updateChargeSound(ratio: number) {
    if (!this.sfxEnabled || !this.chargeOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Pitch goes from 220Hz up to 660Hz smoothly
      const targetFreq = 220 + ratio * 460;
      this.chargeOsc.frequency.setTargetAtTime(targetFreq, now, 0.03);
    } catch {
      // ignore
    }
  }

  public stopChargeSound() {
    if (this.chargeOsc) {
      try {
        if (this.ctx && this.chargeGain) {
          const now = this.ctx.currentTime;
          this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
          this.chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          this.chargeOsc.stop(now + 0.04);
        } else {
          this.chargeOsc.stop();
        }
      } catch {
        // ignore
      }
      this.chargeOsc = null;
      this.chargeGain = null;
    }
    this.isChargingAudio = false;
  }

  // --- MAX CHARGE PING ---
  public playMaxChargePing() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      gain.gain.setValueAtTime(0.07, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.16);
    });
  }

  // --- JUMP LAUNCH ---
  public playJump(chargeRatio: number) {
    this.stopChargeSound();
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    const startFreq = 260 + chargeRatio * 180;
    const endFreq = startFreq * 2.2;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // --- LANDING ---
  public playLanding(isPerfect: boolean = false, isEdge: boolean = false) {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Base cute thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    thudGain.gain.setValueAtTime(0.2, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.09);

    if (isPerfect) {
      // Joyful musical chord (C major / G major sparkle)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = 'sine';
        chordOsc.frequency.setValueAtTime(f, now + i * 0.04);
        chordGain.gain.setValueAtTime(0.12, now + i * 0.04);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);

        chordOsc.connect(chordGain);
        chordGain.connect(ctx.destination);
        chordOsc.start(now + i * 0.04);
        chordOsc.stop(now + i * 0.04 + 0.26);
      });
    } else if (isEdge) {
      // Cute wobbly little sound
      const edgeOsc = ctx.createOscillator();
      const edgeGain = ctx.createGain();
      edgeOsc.type = 'sawtooth';
      edgeOsc.frequency.setValueAtTime(320, now);
      edgeOsc.frequency.linearRampToValueAtTime(360, now + 0.05);
      edgeOsc.frequency.linearRampToValueAtTime(280, now + 0.12);
      edgeGain.gain.setValueAtTime(0.08, now);
      edgeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      edgeOsc.connect(edgeGain);
      edgeGain.connect(ctx.destination);
      edgeOsc.start(now);
      edgeOsc.stop(now + 0.13);
    }
  }

  // --- BOUNCE (Spring platform) ---
  public playBounce() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.16);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // --- LASER ZAP (Hazard hit) ---
  public playLaserZap() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // --- CRACK (Crumbling platform) ---
  public playCrack() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // --- NEAR MISS (Suspense note) ---
  public playNearMiss() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // --- FAILURE ---
  public playFailure() {
    this.stopChargeSound();
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  // --- VICTORY ---
  public playVictory() {
    this.stopChargeSound();
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.18, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.36);
    });
  }

  // --- PROCEDURAL GENTLE BACKGROUND AMBIENCE / MUSIC ---
  private startMusic() {
    if (!this.musicEnabled || this.musicInterval !== null) return;
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C pentatonic
    const bass = [130.81, 164.81, 196.00, 146.83];

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.initCtx();
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;

      // Soft bass pad every 4 steps
      if (this.musicStep % 4 === 0) {
        const bassFreq = bass[(this.musicStep / 4) % bass.length];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.04, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 1.25);
      }

      // Soft bell arpeggio
      if (Math.random() > 0.3) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(note, now);

        bellGain.gain.setValueAtTime(0.025, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.6);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);
        bellOsc.start(now);
        bellOsc.stop(now + 0.65);
      }

      this.musicStep = (this.musicStep + 1) % 64;
    }, 450);
  }

  private stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
