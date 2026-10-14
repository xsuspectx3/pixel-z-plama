import { JumpTrajectoryPoint, Platform, WindZone } from '../types/game';
import { PHYSICS } from './physics';

export function drawWorldBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number
) {
  // Pastel purple-violet sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#e0e7ff'); // soft indigo
  grad.addColorStop(0.45, '#ede9fe'); // pastel lavender
  grad.addColorStop(0.85, '#fae8ff'); // soft pink-purple
  grad.addColorStop(1, '#fdf4ff'); // light warm base
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Parallax dreamy background clouds
  ctx.save();
  const cloudParallax1 = cameraX * 0.15;
  const cloudParallax2 = cameraX * 0.28;

  drawCloud(ctx, (80 - cloudParallax1) % (width + 400) - 100, 110, 70, 0.45);
  drawCloud(ctx, (320 - cloudParallax1) % (width + 400) - 100, 160, 90, 0.4);
  drawCloud(ctx, (600 - cloudParallax1) % (width + 400) - 100, 90, 80, 0.4);
  drawCloud(ctx, (850 - cloudParallax1) % (width + 400) - 100, 140, 85, 0.4);

  drawCloud(ctx, (140 - cloudParallax2) % (width + 400) - 100, 230, 110, 0.6);
  drawCloud(ctx, (480 - cloudParallax2) % (width + 400) - 100, 200, 120, 0.65);
  drawCloud(ctx, (800 - cloudParallax2) % (width + 400) - 100, 240, 105, 0.6);
  ctx.restore();
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number
) {
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.65, y - size * 0.05, size * 0.32, 0, Math.PI * 2);
  ctx.arc(x + size * 0.85, y + size * 0.08, size * 0.25, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y + size * 0.15, size * 0.3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawWindZone(ctx: CanvasRenderingContext2D, zone: WindZone, time: number) {
  ctx.save();
  // Translucent wind draft column
  const grad = ctx.createLinearGradient(0, zone.y + zone.height, 0, zone.y);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

  // Floating breeze streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';

  const numStreaks = 4;
  for (let i = 0; i < numStreaks; i++) {
    const streakX = zone.x + 8 + (i * (zone.width - 16)) / (numStreaks - 1);
    const speed = 80 + i * 20;
    const streakY = zone.y + zone.height - ((time * speed + i * 65) % zone.height);

    ctx.beginPath();
    ctx.moveTo(streakX, streakY);
    ctx.lineTo(streakX, streakY - 14);
    // Tiny arrowhead
    ctx.lineTo(streakX - 2.5, streakY - 10);
    ctx.moveTo(streakX, streakY - 14);
    ctx.lineTo(streakX + 2.5, streakY - 10);
    ctx.stroke();
  }

  // Base blower vent
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(zone.x + 4, zone.y + zone.height - 4, zone.width - 8, 4);

  ctx.restore();
}

export function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, time: number = 0) {
  if (plat.isCrumbled) return;

  // HAZARDS: Laser or Spikes
  if (plat.type === 'hazard') {
    drawHazard(ctx, plat, time);
    return;
  }

  const { x, y, width: w, type, isFinish } = plat;
  const h = plat.height || 48;
  const radius = 8;

  ctx.save();

  // Handle disappearing ghost platform opacity
  if (type === 'disappearing' && plat.disappearConfig) {
    if (!plat.disappearConfig.isVisible) {
      // Semi-transparent ghost outline
      ctx.globalAlpha = 0.25;
    } else {
      ctx.globalAlpha = 0.95;
    }
  }

  // Floating platform soft drop shadow
  ctx.fillStyle = 'rgba(30, 41, 59, 0.1)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 8, w * 0.48, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Platform style palettes
  let topColor = '#34d399'; // Mint green
  let bodyColor = '#059669'; // Emerald body
  let edgeColor = '#10b981';
  let labelText = '';

  if (isFinish) {
    topColor = '#fbbf24'; // Golden amber
    bodyColor = '#d97706';
    edgeColor = '#f59e0b';
    labelText = 'BİTİŞ';
  } else if (type === 'narrow') {
    topColor = '#fb7185'; // Coral rose
    bodyColor = '#e11d48';
    edgeColor = '#f43f5e';
  } else if (type === 'moving') {
    topColor = '#60a5fa'; // Bright Cyan / Indigo
    bodyColor = '#2563eb';
    edgeColor = '#3b82f6';
  } else if (type === 'vertical_moving') {
    topColor = '#38bdf8'; // Sky blue elevator
    bodyColor = '#0284c7';
    edgeColor = '#0ea5e9';
  } else if (type === 'crumbling') {
    topColor = '#fb923c'; // Terracotta / warm orange
    bodyColor = '#ea580c';
    edgeColor = '#f97316';
  } else if (type === 'bounce') {
    topColor = '#facc15'; // Trampoline yellow
    bodyColor = '#ca8a04';
    edgeColor = '#eab308';
    labelText = 'YAY';
  } else if (type === 'disappearing') {
    topColor = '#c084fc'; // Ghost purple
    bodyColor = '#7e22ce';
    edgeColor = '#a855f7';
  }

  // BOUNCE SPRING UNDER PLATFORM
  if (type === 'bounce') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const springCompress = plat.bounceAnim ? (1 - plat.bounceAnim) * 8 : 0;
    const cx = x + w / 2;
    ctx.moveTo(cx - 10, y + h - 6);
    ctx.lineTo(cx + 10, y + h + 2 - springCompress);
    ctx.lineTo(cx - 10, y + h + 8 - springCompress);
    ctx.lineTo(cx + 10, y + h + 14 - springCompress);
    ctx.stroke();
  }

  // Draw main 3D platform body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y + 6, w, h - 6, [0, 0, radius, radius]);
  ctx.fill();

  // Draw platform top surface cap
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 12, [radius, radius, 4, 4]);
  ctx.fill();

  // Top highlight strip
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 2, w - 6, 3, 2);
  ctx.fill();

  // Edge border
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Decorative platform specific features
  if (type === 'moving') {
    // Horizontal Kinetic arrows
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const cx = x + w / 2;
    const cy = y + h / 2 + 3;
    const offset = Math.sin(time * 6) * 3;

    ctx.beginPath();
    ctx.moveTo(cx - 10 + offset, cy);
    ctx.lineTo(cx - 6 + offset, cy - 3);
    ctx.moveTo(cx - 10 + offset, cy);
    ctx.lineTo(cx - 6 + offset, cy + 3);

    ctx.moveTo(cx + 10 + offset, cy);
    ctx.lineTo(cx + 6 + offset, cy - 3);
    ctx.moveTo(cx + 10 + offset, cy);
    ctx.lineTo(cx + 6 + offset, cy + 3);
    ctx.stroke();
  } else if (type === 'vertical_moving') {
    // Vertical Elevator arrows
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const cx = x + w / 2;
    const cy = y + h / 2 + 3;
    const offset = Math.sin(time * 6) * 3;

    ctx.beginPath();
    // Up arrow
    ctx.moveTo(cx - 4, cy - offset);
    ctx.lineTo(cx, cy - 4 - offset);
    ctx.lineTo(cx + 4, cy - offset);
    // Down arrow
    ctx.moveTo(cx - 4, cy + 4 + offset);
    ctx.lineTo(cx, cy + 8 + offset);
    ctx.lineTo(cx + 4, cy + 4 + offset);
    ctx.stroke();
  } else if (type === 'bounce') {
    // Trampoline Chevron arrows pointing UP
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 7, y + 8);
    ctx.lineTo(cx, y + 4);
    ctx.lineTo(cx + 7, y + 8);
    ctx.stroke();
  } else if (type === 'disappearing') {
    // Holographic grid / pulse dots
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + w * (0.3 + i * 0.2), y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'crumbling') {
    if (plat.isCracking && plat.crumbleTimer !== undefined && plat.crumbleDelay !== undefined) {
      const progress = 1 - plat.crumbleTimer / plat.crumbleDelay;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y + 2);
      ctx.lineTo(x + w * 0.35, y + 10);
      ctx.lineTo(x + w * 0.42, y + 22);

      if (progress > 0.4) {
        ctx.moveTo(x + w * 0.65, y + 2);
        ctx.lineTo(x + w * 0.6, y + 14);
        ctx.lineTo(x + w * 0.7, y + 26);
      }
      ctx.stroke();

      // Countdown bar under crumbling platform
      const barW = (w - 12) * (1 - progress);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 6, y + h + 2, barW, 3);
    }
  }

  // Finish Platform Beacon / Flag
  if (isFinish) {
    drawFinishBeacon(ctx, x + w / 2, y, time);
  }

  if (labelText) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, x + w / 2, y + 24);
  }

  ctx.restore();
}

function drawHazard(ctx: CanvasRenderingContext2D, plat: Platform, time: number) {
  const { x, y, width: w } = plat;
  const cfg = plat.hazardConfig || { type: 'laser', width: w, height: 32 };
  const h = cfg.height;

  ctx.save();

  if (cfg.type === 'laser') {
    // Emitter pods top & bottom
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, w + 8, 8, 3);
    ctx.roundRect(x - 4, y + h - 4, w + 8, 8, 3);
    ctx.fill();

    // Pulsing bright red laser beam
    const glow = Math.sin(time * 12) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(239, 68, 68, ${glow * 0.4})`;
    ctx.fillRect(x + 2, y + 4, w - 4, h - 8);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 1.5, y + 4, 3, h - 8);

    // Hazard warning icon
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', x + w / 2, y + h / 2 + 3);
  } else {
    // Sharp metal spikes
    const numSpikes = Math.max(3, Math.floor(w / 12));
    const spikeW = w / numSpikes;

    // Base plate with danger stripes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + h - 6, w, 6);

    // Red sharp triangular teeth
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;

    for (let i = 0; i < numSpikes; i++) {
      const sx = x + i * spikeW;
      ctx.beginPath();
      ctx.moveTo(sx, y + h - 6);
      ctx.lineTo(sx + spikeW / 2, y);
      ctx.lineTo(sx + spikeW, y + h - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawFinishBeacon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Flagpole
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 36);
  ctx.stroke();

  // Little golden ball on pole top
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(x, y - 37, 3, 0, Math.PI * 2);
  ctx.fill();

  // Animated waving flag
  const wave = Math.sin(time * 7) * 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x, y - 36);
  ctx.lineTo(x + 18 + wave, y - 30);
  ctx.lineTo(x, y - 24);
  ctx.closePath();
  ctx.fill();

  // Floating star sparkle above finish
  ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
  const starY = y - 48 + Math.sin(time * 4) * 4;
  ctx.beginPath();
  ctx.arc(x, starY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTrajectoryPreview(
  ctx: CanvasRenderingContext2D,
  points: JumpTrajectoryPoint[],
  hitPoint: { x: number; y: number } | null,
  previewRatio: number = 1.0
) {
  if (points.length < 2) return;

  ctx.save();

  const maxPoints = Math.max(3, Math.floor(points.length * previewRatio));
  const activePoints = points.slice(0, maxPoints);

  // Draw dotted trajectory arc
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)'; // Radiant pink preview
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(activePoints[0].x + PHYSICS.CHAR_WIDTH / 2, activePoints[0].y + PHYSICS.CHAR_HEIGHT / 2);

  for (let i = 1; i < activePoints.length; i++) {
    const pt = activePoints[i];
    ctx.lineTo(pt.x + PHYSICS.CHAR_WIDTH / 2, pt.y + PHYSICS.CHAR_HEIGHT / 2);
  }
  ctx.stroke();

  // Draw landing target indicator if platform is reached
  if (hitPoint && previewRatio >= 0.5) {
    const targetX = hitPoint.x + PHYSICS.CHAR_WIDTH / 2;
    const targetY = hitPoint.y + PHYSICS.CHAR_HEIGHT;

    ctx.setLineDash([]);
    // Outer ripple ring
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, 14, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright landing dot
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
