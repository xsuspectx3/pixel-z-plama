import { PikoCharacter } from '../types/game';

export interface PikoRenderOptions {
  state: 'idle' | 'charging' | 'jumping' | 'falling' | 'perfect' | 'edge' | 'failure' | 'victory';
  chargeRatio?: number;
  time?: number;
}

export function drawPiko(
  ctx: CanvasRenderingContext2D,
  piko: PikoCharacter,
  options: PikoRenderOptions
) {
  ctx.save();

  // Position at character center for squash & stretch scaling
  const centerX = piko.x + piko.width / 2;
  const centerY = piko.y + piko.height / 2;

  ctx.translate(centerX, centerY);

  // Apply squash and stretch
  ctx.scale(piko.squashX, piko.squashY);

  const w = piko.width;
  const h = piko.height;
  const r = 6; // rounded corner radius

  // Subtle contact shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 3, (w / 2) * 1.1, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // PIKO Body (Crisp white cube with subtle inner shadow/border)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.fill();
  ctx.stroke();

  // Subtle 3D top shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 2, -h / 2 + 2, w - 4, 4, 2);
  ctx.fill();

  // Pink cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-w / 2 + 5, 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(w / 2 - 5, 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes and Mouth based on state
  drawFace(ctx, w, h, piko, options);

  ctx.restore();

  // Speech bubble if active
  if (piko.speechText && piko.speechTimer > 0) {
    drawSpeechBubble(ctx, centerX, piko.y - 12, piko.speechText, piko.speechTimer);
  }
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  piko: PikoCharacter,
  options: PikoRenderOptions
) {
  const { state } = options;
  const eyeY = -2;
  const leftEyeX = -w / 2 + 8;
  const rightEyeX = w / 2 - 8;

  // Eye blinking
  if (piko.isBlinking && state !== 'falling' && state !== 'failure') {
    // Closed happy eye slit
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(leftEyeX - 3, eyeY);
    ctx.lineTo(leftEyeX + 3, eyeY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightEyeX - 3, eyeY);
    ctx.lineTo(rightEyeX + 3, eyeY);
    ctx.stroke();

    // Tiny closed smile
    ctx.beginPath();
    ctx.arc(0, 3, 2.5, 0, Math.PI);
    ctx.stroke();
    return;
  }

  // State-specific facial expressions
  if (state === 'victory' || state === 'perfect') {
    // Joyful arched eyes (^^)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY + 1, 3.2, Math.PI, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rightEyeX, eyeY + 1, 3.2, Math.PI, 0);
    ctx.stroke();

    // Big happy open mouth
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 3, 4, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (state === 'falling') {
    // Surprised wide eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 3.5, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shines
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX + 1, eyeY - 1, 1.2, 0, Math.PI * 2);
    ctx.arc(rightEyeX + 1, eyeY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Surprised round "O" mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 4, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (state === 'failure') {
    // Comic dizzy or tearful eyes (X X or disappointed look)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left eye X
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 2.5, eyeY - 2.5);
    ctx.lineTo(leftEyeX + 2.5, eyeY + 2.5);
    ctx.moveTo(leftEyeX + 2.5, eyeY - 2.5);
    ctx.lineTo(leftEyeX - 2.5, eyeY + 2.5);
    ctx.stroke();

    // Right eye X
    ctx.beginPath();
    ctx.moveTo(rightEyeX - 2.5, eyeY - 2.5);
    ctx.lineTo(rightEyeX + 2.5, eyeY + 2.5);
    ctx.moveTo(rightEyeX + 2.5, eyeY - 2.5);
    ctx.lineTo(rightEyeX - 2.5, eyeY + 2.5);
    ctx.stroke();

    // Wavy / sad mouth
    ctx.beginPath();
    ctx.arc(0, 6, 3, Math.PI, 0);
    ctx.stroke();
  } else if (state === 'charging') {
    // Determined, concentrated squinting eyes looking right
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(leftEyeX + 1, eyeY, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(rightEyeX + 1, eyeY, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny white highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX + 1.8, eyeY - 0.5, 0.9, 0, Math.PI * 2);
    ctx.arc(rightEyeX + 1.8, eyeY - 0.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Determined small mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-2, 3);
    ctx.lineTo(2, 3);
    ctx.stroke();
  } else if (state === 'edge') {
    // Panicked wobbly look
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY - 1, 3.5, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Wobbly mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.quadraticCurveTo(0, 5, 3, 3);
    ctx.stroke();
  } else {
    // IDLE or JUMPING
    const lookX = piko.lookDir * 1.5;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(leftEyeX + lookX, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(rightEyeX + lookX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Shiny highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX + lookX + 0.8, eyeY - 0.8, 1.2, 0, Math.PI * 2);
    ctx.arc(rightEyeX + lookX + 0.8, eyeY - 0.8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute soft smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 2.5, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  timer: number
) {
  ctx.save();

  // Fade out during last 0.3s
  const alpha = Math.min(1, timer / 0.3);
  ctx.globalAlpha = Math.max(0, alpha);

  ctx.font = 'bold 12px "Fredoka", "Outfit", sans-serif';
  const metrics = ctx.measureText(text);
  const paddingX = 10;
  const paddingY = 6;
  const bubbleW = metrics.width + paddingX * 2;
  const bubbleH = 22;

  const bx = x - bubbleW / 2;
  const by = y - bubbleH;

  // Bubble background with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
  ctx.fill();
  ctx.stroke();

  // Little tail pointing to Piko
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x - 4, by + bubbleH - 0.5);
  ctx.lineTo(x + 4, by + bubbleH - 0.5);
  ctx.lineTo(x, by + bubbleH + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cover tail seam
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 3, by + bubbleH - 2, 6, 2);

  // Text
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, by + bubbleH / 2);

  ctx.restore();
}
