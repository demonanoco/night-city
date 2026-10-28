// A full moon that rises from behind the skyline after load and settles in the upper right.
import { random } from '../city.js';

export const layer = 'sky';

export const RISE_SECONDS = 3;

// Craters as fractions of the radius: offset from the centre and size.
const craters = Array.from({ length: 3 }, (_, i) => {
  const angle = random(i * 7 + 101) * Math.PI * 2;
  const dist = 0.25 + random(i * 7 + 102) * 0.4;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, r: 0.1 + random(i * 7 + 103) * 0.1 };
});

export function moonRadius(scene) {
  return Math.min(scene.width, scene.height) * 0.055;
}

// Starts just below the street line, hidden by buildings and street, and eases out to its resting place.
export function moonPosition(scene) {
  const r = moonRadius(scene);
  const x = scene.width * 0.8;
  const startY = scene.ground + r;
  const endY = scene.height * 0.18;
  const t = Math.min(1, Math.max(0, (scene.time || 0) / RISE_SECONDS));
  const eased = 1 - (1 - t) ** 3;
  return { x, y: startY + (endY - startY) * eased, r };
}

// Gradients are built at the origin once per canvas size and drawn under a translate.
let cache = null;

function paints(ctx, r) {
  if (cache && cache.ctx === ctx && cache.r === r) return cache;
  const glow = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 3);
  glow.addColorStop(0, 'rgba(255, 244, 214, 0.35)');
  glow.addColorStop(1, 'rgba(255, 244, 214, 0)');
  const face = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  face.addColorStop(0, '#fffaf0');
  face.addColorStop(1, '#efe4c4');
  cache = { ctx, r, glow, face };
  return cache;
}

export function draw(ctx, scene) {
  const { x, y, r } = moonPosition(scene);
  if (y - r * 3 > scene.ground) return;
  const { glow, face } = paints(ctx, r);
  ctx.translate(x, y);

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(170, 160, 135, 0.22)';
  for (const c of craters) {
    ctx.beginPath();
    ctx.arc(c.dx * r, c.dy * r, c.r * r, 0, Math.PI * 2);
    ctx.fill();
  }
}
