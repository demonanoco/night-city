// Cars driving along the street: the far lane right to left, the near lane left to right,
// each lane at its own speed, with headlight beams ahead and red tail lights behind.
import { random } from '../city.js';

export const layer = 'street';

// `y` is the lane's centre as a fraction of the street height (the centre line sits at 0.42),
// `scale` makes far cars a little smaller, and `crossing` is the seconds to cross the screen.
export const LANES = [
  { dir: -1, y: 0.22, scale: 0.8, crossing: 9 },
  { dir: 1, y: 0.7, scale: 1, crossing: 5.5 },
];

const PER_LANE = 3;
const WHEELS = [0.78, 0.22];
const COLORS = ['#b8323a', '#2f5fa8', '#d9d4c7', '#3f4a5c', '#c98a2b', '#2e7d5b'];

// Evenly spaced around each lane's loop with some jitter, so cars in a lane never overlap.
export const cars = LANES.flatMap((lane, l) =>
  Array.from({ length: PER_LANE }, (_, i) => ({
    lane,
    phase: (i + random(l * 17 + i * 5 + 301) * 0.5) / PER_LANE,
    color: COLORS[Math.floor(random(l * 17 + i * 5 + 302) * COLORS.length)],
  })),
);

// Body size before the lane's scale, from the street height so it fits phones and projectors.
export function carSize(scene) {
  const height = (scene.height - scene.ground) * 0.2;
  const length = height * 2.6;
  return { height, length, beam: length * 1.4 };
}

// Where a car's front bumper is, the lane's centre line, its scale and direction.
// Each car loops over a track one car-and-beam wider than the screen on both sides,
// so it enters and leaves fully out of sight.
export function carPosition(scene, car) {
  const { length, beam } = carSize(scene);
  const { dir, y, scale, crossing } = car.lane;
  const margin = (length + beam) * scale;
  const track = scene.width + margin * 2;
  const travelled = (car.phase * track + ((scene.time || 0) * scene.width) / crossing) % track;
  const front = dir > 0 ? travelled - margin + length * scale : scene.width + margin - travelled - length * scale;
  return { front, y: scene.ground + (scene.height - scene.ground) * y, scale, dir };
}

// The beam gradient is built in car-local units once per canvas size and drawn under a transform.
let cache = null;

function beamPaint(ctx, beam) {
  if (cache && cache.ctx === ctx && cache.beam === beam) return cache.paint;
  const paint = ctx.createLinearGradient(0, 0, beam, 0);
  paint.addColorStop(0, 'rgba(255, 240, 190, 0.45)');
  paint.addColorStop(1, 'rgba(255, 240, 190, 0)');
  cache = { ctx, beam, paint };
  return paint;
}

// Car-local coordinates: the front bumper at x = 0, the body extending back to -length,
// centred vertically on the lane.
function drawCar(ctx, car, height, length, beam) {
  const h = height;

  ctx.fillStyle = beamPaint(ctx, beam);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.02);
  ctx.lineTo(beam, -h * 0.35);
  ctx.lineTo(beam, h * 0.55);
  ctx.lineTo(0, h * 0.18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = car.color;
  ctx.fillRect(-length * 0.72, -h * 0.5, length * 0.5, h * 0.45);
  ctx.fillRect(-length, -h * 0.1, length, h * 0.42);
  ctx.fillStyle = '#1c2436';
  ctx.fillRect(-length * 0.68, -h * 0.42, length * 0.19, h * 0.3);
  ctx.fillRect(-length * 0.45, -h * 0.42, length * 0.19, h * 0.3);

  ctx.fillStyle = '#05060a';
  for (const w of WHEELS) {
    ctx.beginPath();
    ctx.arc(-length * w, h * 0.34, h * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#fff6d8';
  ctx.fillRect(-length * 0.04, 0, length * 0.04, h * 0.14);
  ctx.fillStyle = '#ff2a2a';
  ctx.shadowColor = '#ff2a2a';
  ctx.shadowBlur = h * 0.6;
  ctx.fillRect(-length, 0, length * 0.04, h * 0.14);
  ctx.shadowBlur = 0;
}

export function draw(ctx, scene) {
  const { height, length, beam } = carSize(scene);
  for (const car of cars) {
    const { front, y, scale, dir } = carPosition(scene, car);
    ctx.save();
    ctx.translate(front, y);
    ctx.scale(dir * scale, scale);
    drawCar(ctx, car, height, length, beam);
    ctx.restore();
  }
}
