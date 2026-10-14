export type GameState =
  | 'BOOT'
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'LEVEL_INTRO'
  | 'PLAYING'
  | 'CHARGING'
  | 'AIRBORNE'
  | 'LANDING'
  | 'FAILURE'
  | 'VICTORY'
  | 'PAUSED';

export type PlatformType =
  | 'standard'
  | 'narrow'
  | 'moving'
  | 'vertical_moving'
  | 'crumbling'
  | 'bounce'
  | 'disappearing'
  | 'hazard';

export interface MovingPlatformConfig {
  minX: number;
  maxX: number;
  speed: number;
  direction?: number;
  phase?: number;
}

export interface VerticalMovingConfig {
  minY: number;
  maxY: number;
  speed: number;
  direction?: number;
}

export interface DisappearConfig {
  visibleDuration: number;
  invisibleDuration: number;
  timer?: number;
  isVisible?: boolean;
}

export interface HazardConfig {
  type: 'laser' | 'spikes';
  width: number;
  height: number;
  active?: boolean;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  type: PlatformType;
  isStart?: boolean;
  isFinish?: boolean;
  
  // Moving platform configs
  moveConfig?: MovingPlatformConfig;
  verticalMoveConfig?: VerticalMovingConfig;

  // Crumbling platform state
  crumbleDelay?: number; // total time in seconds before break (e.g. 1.5)
  crumbleTimer?: number; // remaining seconds
  isCrumbled?: boolean;
  isCracking?: boolean;

  // Bounce platform
  bounceForce?: number; // e.g. 520
  bounceAnim?: number; // 0 to 1 for visual spring compression

  // Disappearing ghost platform
  disappearConfig?: DisappearConfig;

  // Hazard obstacle
  hazardConfig?: HazardConfig;
}

export interface WindZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  forceY: number; // e.g. -450 (upward draft)
  forceX?: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  difficulty: 'Çok Kolay' | 'Kolay' | 'Orta' | 'Zor' | 'Usta';
  tip: string;
  platforms: Platform[];
  windZones?: WindZone[];
  previewLengthRatio: number; // 1.0 (full) to 0.45 (short preview in late levels)
  backgroundColor?: string;
  targetParAttempts?: number;
}

export interface PikoCharacter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  currentPlatformId: string | null;
  squashX: number;
  squashY: number;
  blinkTimer: number;
  isBlinking: boolean;
  lookDir: number;
  speechText: string | null;
  speechTimer: number;
  nearMissDist: number | null;
  isShocked?: boolean;
}

export interface SaveData {
  highestUnlockedLevel: number;
  completedLevels: Record<number, { completed: boolean; bestAttempts: number }>;
  settings: {
    sfx: boolean;
    music: boolean;
    reducedMotion: boolean;
  };
}

export interface JumpTrajectoryPoint {
  x: number;
  y: number;
  isLanding?: boolean;
  platformHit?: Platform | null;
}
