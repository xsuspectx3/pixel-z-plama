import { JumpTrajectoryPoint, LevelDefinition, PikoCharacter, Platform, WindZone } from '../types/game';

export const PHYSICS = {
  FIXED_DT: 1 / 120, // 120Hz fixed timestep
  GRAVITY: 1250, // units/sec^2
  CHAR_WIDTH: 28,
  CHAR_HEIGHT: 28,
  MIN_CHARGE_TIME: 0.08,
  MAX_CHARGE_TIME: 1.20,
  MIN_HORIZ_VEL: 125,
  MAX_HORIZ_VEL: 410,
  MIN_VERT_VEL: 330,
  MAX_VERT_VEL: 495,
  WORLD_WIDTH: 360,
  WORLD_HEIGHT: 640,
  NEAR_MISS_THRESHOLD: 24, // logical units
  COLLISION_TOLERANCE: 2.5, // logical units
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateLaunchVelocity(chargeTime: number): { vx: number; vy: number; ratio: number } {
  const effectiveCharge = Math.max(PHYSICS.MIN_CHARGE_TIME, chargeTime);
  const ratio = clamp(effectiveCharge / PHYSICS.MAX_CHARGE_TIME, 0, 1);
  const vx = PHYSICS.MIN_HORIZ_VEL + (PHYSICS.MAX_HORIZ_VEL - PHYSICS.MIN_HORIZ_VEL) * ratio;
  const vy = -(PHYSICS.MIN_VERT_VEL + (PHYSICS.MAX_VERT_VEL - PHYSICS.MIN_VERT_VEL) * ratio);
  return { vx, vy, ratio };
}

/**
 * Swept and boundary collision test for landing on a platform
 */
export function checkPlatformLanding(
  prevY: number,
  currY: number,
  currX: number,
  vy: number,
  platform: Platform
): boolean {
  if (vy <= 0) return false; // Must be descending
  if (platform.isCrumbled) return false;
  if (platform.type === 'hazard') return false; // Hazards cannot be landed on
  if (platform.disappearConfig && platform.disappearConfig.isVisible === false) return false;

  const charW = PHYSICS.CHAR_WIDTH;
  const charH = PHYSICS.CHAR_HEIGHT;
  const tol = PHYSICS.COLLISION_TOLERANCE;

  // Horizontal overlap check
  const charLeft = currX;
  const charRight = currX + charW;
  const platLeft = platform.x - tol;
  const platRight = platform.x + platform.width + tol;

  if (charRight < platLeft || charLeft > platRight) {
    return false;
  }

  // Vertical swept crossing check
  const prevFootY = prevY + charH;
  const currFootY = currY + charH;
  const platTop = platform.y;

  // The foot must have crossed or arrived at the top surface from above
  if (prevFootY <= platTop + 4 && currFootY >= platTop - tol && currFootY <= platTop + 14) {
    return true;
  }

  return false;
}

/**
 * Check collision with lethal hazards (lasers, spikes)
 */
export function checkHazardOverlap(
  charX: number,
  charY: number,
  hazard: Platform
): boolean {
  if (hazard.type !== 'hazard') return false;
  const hzW = hazard.hazardConfig?.width || hazard.width;
  const hzH = hazard.hazardConfig?.height || 28;
  const hzX = hazard.x;
  const hzY = hazard.y;

  const charW = PHYSICS.CHAR_WIDTH;
  const charH = PHYSICS.CHAR_HEIGHT;

  // Inset hit box slightly for fair gameplay
  const inset = 3;
  return (
    charX + charW - inset > hzX &&
    charX + inset < hzX + hzW &&
    charY + charH - inset > hzY &&
    charY + inset < hzY + hzH
  );
}

/**
 * Check if character is inside a wind zone
 */
export function checkWindZone(
  charX: number,
  charY: number,
  zone: WindZone
): boolean {
  const charW = PHYSICS.CHAR_WIDTH;
  const charH = PHYSICS.CHAR_HEIGHT;
  return (
    charX + charW > zone.x &&
    charX < zone.x + zone.width &&
    charY + charH > zone.y &&
    charY < zone.y + zone.height
  );
}

/**
 * Calculates landing quality feedback
 */
export function calculateLandingQuality(
  charX: number,
  platform: Platform
): { quality: 'PERFECT' | 'GREAT' | 'EDGE'; offset: number; text: string } {
  const charCenter = charX + PHYSICS.CHAR_WIDTH / 2;
  const platCenter = platform.x + platform.width / 2;
  const offset = Math.abs(charCenter - platCenter);
  const halfPlat = platform.width / 2;

  if (offset <= halfPlat * 0.28) {
    return { quality: 'PERFECT', offset, text: 'MÜKEMMEL!' };
  } else if (offset <= halfPlat * 0.65) {
    return { quality: 'GREAT', offset, text: 'HARİKA!' };
  } else {
    return { quality: 'EDGE', offset, text: 'KENARDAN!' };
  }
}

/**
 * Simulates a full trajectory deterministically with exact physics
 */
export function simulateJumpTrajectory(
  startX: number,
  startY: number,
  chargeTime: number,
  platforms: Platform[],
  windZones: WindZone[] = [],
  maxSteps: number = 320
): { points: JumpTrajectoryPoint[]; hitPlatform: Platform | null; hitPoint: { x: number; y: number } | null } {
  const { vx: initialVx, vy: initialVy } = calculateLaunchVelocity(chargeTime);
  let x = startX;
  let y = startY;
  let vx = initialVx;
  let vy = initialVy;
  const dt = PHYSICS.FIXED_DT;
  const gravity = PHYSICS.GRAVITY;

  const points: JumpTrajectoryPoint[] = [{ x, y }];
  let hitPlatform: Platform | null = null;
  let hitPoint: { x: number; y: number } | null = null;

  for (let i = 0; i < maxSteps; i++) {
    const prevY = y;

    // Apply wind zones
    for (const wind of windZones) {
      if (checkWindZone(x, y, wind)) {
        vy += wind.forceY * dt;
        if (wind.forceX) vx += wind.forceX * dt;
      }
    }

    vy += gravity * dt;
    x += vx * dt;
    y += vy * dt;

    points.push({ x, y });

    // Check collision against all landable platforms
    for (const plat of platforms) {
      if (plat.isCrumbled || plat.type === 'hazard') continue;
      if (plat.disappearConfig && plat.disappearConfig.isVisible === false) continue;

      if (checkPlatformLanding(prevY, y, x, vy, plat)) {
        hitPlatform = plat;
        hitPoint = { x, y: plat.y - PHYSICS.CHAR_HEIGHT };
        points[points.length - 1] = {
          x: hitPoint.x,
          y: hitPoint.y,
          isLanding: true,
          platformHit: plat,
        };
        return { points, hitPlatform, hitPoint };
      }
    }

    // Stop if below bottom boundary
    if (y > PHYSICS.WORLD_HEIGHT + 100) {
      break;
    }
  }

  return { points, hitPlatform, hitPoint };
}

/**
 * Near-miss calculation: calculates closest horizontal distance to the intended next platform
 */
export function calculateNearMissDistance(
  piko: PikoCharacter,
  targetPlatform: Platform
): number {
  if (targetPlatform.type === 'hazard') return 999;
  const charLeft = piko.x;
  const charRight = piko.x + piko.width;
  const platLeft = targetPlatform.x;
  const platRight = targetPlatform.x + targetPlatform.width;

  if (charRight < platLeft) {
    // Fell short
    return platLeft - charRight;
  } else if (charLeft > platRight) {
    // Overshot
    return charLeft - platRight;
  }
  return 0;
}

/**
 * Solvability Validator: mathematically tests all landable jumps for a given level
 */
export function validateLevelSolvability(level: LevelDefinition): {
  isSolvable: boolean;
  jumpsChecked: number;
  unsolvableJumps: string[];
} {
  const unsolvableJumps: string[] = [];
  // Filter only landable platforms
  const landablePlatforms = level.platforms.filter((p) => p.type !== 'hazard');
  let jumpsChecked = 0;

  for (let i = 0; i < landablePlatforms.length - 1; i++) {
    const currentPlat = landablePlatforms[i];
    const targetPlat = landablePlatforms[i + 1];
    jumpsChecked++;

    let jumpSolvable = false;

    // Test character positions across the platform
    const charPositions = [
      currentPlat.x + 4,
      currentPlat.x + currentPlat.width / 2 - PHYSICS.CHAR_WIDTH / 2,
      currentPlat.x + currentPlat.width - PHYSICS.CHAR_WIDTH - 4,
    ];

    // Target positions (for moving platforms, test min, center, max)
    const targetMinX = targetPlat.moveConfig ? targetPlat.moveConfig.minX : targetPlat.x;
    const targetMaxX = targetPlat.moveConfig ? targetPlat.moveConfig.maxX : targetPlat.x;
    const targetSampleXs = targetPlat.moveConfig
      ? [targetMinX, (targetMinX + targetMaxX) / 2, targetMaxX]
      : [targetPlat.x];

    // For vertical moving target platforms, test min and max Y
    const targetMinY = targetPlat.verticalMoveConfig ? targetPlat.verticalMoveConfig.minY : targetPlat.y;
    const targetMaxY = targetPlat.verticalMoveConfig ? targetPlat.verticalMoveConfig.maxY : targetPlat.y;
    const targetSampleYs = targetPlat.verticalMoveConfig
      ? [targetMinY, (targetMinY + targetMaxY) / 2, targetMaxY]
      : [targetPlat.y];

    for (const startX of charPositions) {
      const startY = currentPlat.y - PHYSICS.CHAR_HEIGHT;

      // Sweep charge times from min to max in fine increments
      for (let charge = PHYSICS.MIN_CHARGE_TIME; charge <= PHYSICS.MAX_CHARGE_TIME; charge += 0.02) {
        for (const targetX of targetSampleXs) {
          for (const targetY of targetSampleYs) {
            const testPlat: Platform = {
              ...targetPlat,
              x: targetX,
              y: targetY,
            };

            const sim = simulateJumpTrajectory(startX, startY, charge, [testPlat], level.windZones || []);
            if (sim.hitPlatform) {
              jumpSolvable = true;
              break;
            }
          }
          if (jumpSolvable) break;
        }
        if (jumpSolvable) break;
      }
      if (jumpSolvable) break;
    }

    if (!jumpSolvable) {
      unsolvableJumps.push(`Jump from Platform ${i + 1} (${currentPlat.type}) to ${i + 2} (${targetPlat.type})`);
    }
  }

  return {
    isSolvable: unsolvableJumps.length === 0,
    jumpsChecked,
    unsolvableJumps,
  };
}
