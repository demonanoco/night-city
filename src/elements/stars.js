// Twinkling stars across the upper sky, and a shooting star that streaks across and fades every few seconds.
import { random } from '../city.js';
import { moonPosition } from './moon.js';

export const layer = 'sky';

export const STAR_COUNT = 90;
export const SKY_FRACTION = 0.55; // stars sit in the top part of the sky, above most rooftops
export const SHOOTING_PERIOD = 6; // seconds between shooting stars
export const SHOOTING_DURATION = 1.1; // seconds one is visible

// Stars as fractions of the sky: position, size and twinkle, laid out once.
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  fx: random(i * 5 + 201),
  fy: random(i * 5 + 202),
  size: 0.4 + random(i * 5 + 203) * 0.8,
  speed: 0.8 + random(i * 5 + 204) * 2.2,
  phase: random(i * 5 + 205) * Math.PI * 2,
}));

// Scaled to the canvas once per size.
let placed = null;

export function starPositions(scene) {
  if (placed && placed.width === scene.width && placed.height === scene.height) return placed.list;
  const unit = Math.min(scene.width, scene.height) * 0.0025;
  const top = scene.ground * SKY_FRACTION;
  const list = stars.map((s) => ({ x: s.fx * scene.width, y: s.fy * top, r: Math.max(0.6, s.size * unit), speed: s.speed, phase: s.phase }));
  placed = { width: scene.width, height: scene.height, list };
  return list;
}

export function twinkle(star, time) {
  return 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase));
}

// The shooting star at this moment, or null between them. Each one gets its own seeded path.
export function shootingStar(scene) {
  const time = scene.time || 0;
  const n = Math.floor(time / SHOOTING_PERIOD);
  const t = (time - n * SHOOTING_PERIOD) / SHOOTING_DURATION;
  if (t >= 1) return null;

  const { width } = scene;
  const top = scene.ground * SKY_FRACTION;
  const dir = random(n * 3 + 301) > 0.5 ? 1 : -1;
  const startX = width * (0.15 + random(n * 3 + 302) * 0.7);
  const startY = top * (0.05 + random(n * 3 + 303) * 0.4);
  const travel = width * 0.3;
  const eased = 1 - (1 - t) ** 2;
  const x = startX + dir * travel * eased;
  const y = startY + travel * 0.4 * eased;
  const tail = travel * 0.35 * Math.min(1, t * 3);
  const length = Math.hypot(1, 0.4);
  return {
    x,
    y,
    tailX: x - (dir * tail) / length,
    tailY: y - (tail * 0.4) / length,
    alpha: t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85,
  };
}

export function draw(ctx, scene) {
  // Elements in one layer draw alphabetically, so the moon is already painted: leave its disc clear.
  const moon = moonPosition(scene);
  for (const s of starPositions(scene)) {
    const dx = s.x - moon.x;
    const dy = s.y - moon.y;
    if (dx * dx + dy * dy < moon.r * moon.r * 1.1) continue;
    ctx.globalAlpha = twinkle(s, scene.time || 0);
    ctx.fillStyle = '#f4f1ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const shot = shootingStar(scene);
  if (!shot) return;
  const unit = Math.min(scene.width, scene.height) * 0.0025;
  const g = ctx.createLinearGradient(shot.tailX, shot.tailY, shot.x, shot.y);
  g.addColorStop(0, 'rgba(255, 255, 255, 0)');
  g.addColorStop(1, `rgba(255, 255, 255, ${shot.alpha.toFixed(3)})`);
  ctx.strokeStyle = g;
  ctx.lineWidth = Math.max(1, unit * 1.2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shot.tailX, shot.tailY);
  ctx.lineTo(shot.x, shot.y);
  ctx.stroke();
}
