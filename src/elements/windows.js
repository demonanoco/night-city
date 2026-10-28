// Lit windows: about half glow warm yellow, a few brighter, and every few seconds a handful switch.
import { random } from '../city.js';

export const layer = 'city';

const LIT_SHARE = 0.5;
const BRIGHT_SHARE = 0.12;
// Window state changes per second across the whole city, so a few seconds shows a handful.
const SWITCHES_PER_SECOND = 2;

const plans = new WeakMap();

// Per window: its own re-roll interval and phase, so switches are spread out rather than in sync.
// Each re-roll keeps the window lit with LIT_SHARE odds, so half of re-rolls flip it.
export function plan(windows) {
  let p = plans.get(windows);
  if (p) return p;
  const n = windows.length;
  const meanInterval = (n * LIT_SHARE) / SWITCHES_PER_SECOND;
  const interval = new Float32Array(n);
  const phase = new Float32Array(n);
  const bright = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    interval[i] = meanInterval * (0.5 + random(i * 7 + 101));
    phase[i] = interval[i] * random(i * 7 + 102);
    bright[i] = random(i * 7 + 103) < BRIGHT_SHARE ? 1 : 0;
  }
  p = { interval, phase, bright };
  plans.set(windows, p);
  return p;
}

export function isLit(p, i, time) {
  const epoch = Math.floor((time + p.phase[i]) / p.interval[i]);
  return random(i * 7 + 104 + epoch * 0.618) < LIT_SHARE;
}

export function draw(ctx, scene) {
  const { windows } = scene;
  const p = plan(windows);
  const time = scene.time || 0;

  ctx.fillStyle = '#f2c14e';
  for (let i = 0; i < windows.length; i++) {
    if (p.bright[i] || !isLit(p, i, time)) continue;
    const w = windows[i];
    ctx.fillRect(w.x, w.y, w.width, w.height);
  }

  // Bright windows get a faint halo first, then a paler core.
  for (let i = 0; i < windows.length; i++) {
    if (!p.bright[i] || !isLit(p, i, time)) continue;
    const w = windows[i];
    const pad = w.width * 0.35;
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffd877';
    ctx.fillRect(w.x - pad, w.y - pad, w.width + pad * 2, w.height + pad * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff1b8';
    ctx.fillRect(w.x, w.y, w.width, w.height);
  }
}
