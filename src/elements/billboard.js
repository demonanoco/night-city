// A neon billboard on a rooftop near the middle of the city, showing the last merged pull request.

import { random } from '../city.js';

export const layer = 'city';

const FALLBACK = 'Night City';

// `PR #<number> merged: <title>`, or the city's name until something has been merged.
export function billboardText(lastMerge) {
  if (!lastMerge || lastMerge.number == null) return FALLBACK;
  return `PR #${lastMerge.number} merged: ${lastMerge.title ?? ''}`.trim();
}

// The tallest building whose centre sits in the middle third of the skyline.
export function pickBuilding(scene) {
  let best = null;
  for (const b of scene.buildings) {
    const centre = b.x + b.width / 2;
    if (centre < scene.width / 3 || centre > (scene.width * 2) / 3) continue;
    if (!best || b.height > best.height) best = b;
  }
  return best;
}

// Left edge of the text inside a box `boxWidth` wide: centred when it fits, otherwise
// scrolling right to left. A second copy drawn `textWidth + gap` further right closes the loop.
export function textOffset(time, textWidth, boxWidth, speed, gap) {
  if (textWidth <= boxWidth) return (boxWidth - textWidth) / 2;
  return -((time * speed) % (textWidth + gap));
}

// A brief dip in brightness once per FLICKER_PERIOD seconds, at a different moment in each period.
const FLICKER_PERIOD = 4;
const FLICKER_LENGTH = 0.12;
export function flickerAlpha(time) {
  const period = Math.floor(time / FLICKER_PERIOD);
  const start = random(period) * (FLICKER_PERIOD - FLICKER_LENGTH);
  const t = time - period * FLICKER_PERIOD;
  return t >= start && t < start + FLICKER_LENGTH ? 0.6 : 1;
}

let board = null;
let measured = { text: null, font: null, width: 0 };

// Board geometry: a panel overhanging the roof slightly, on two struts that stand on the roof.
export function place(scene) {
  const b = pickBuilding(scene);
  if (!b) return null;
  const width = b.width * 1.2;
  const height = width * 0.38;
  const x = b.x + b.width / 2 - width / 2;
  const legs = height * 0.45;
  const y = b.y - legs - height;
  const pad = height * 0.14;
  const fontSize = Math.round(height * 0.5);
  const struts = [b.x + b.width * 0.25, b.x + b.width * 0.75];
  return {
    scene, b, x, y, width, height, legs, pad, struts,
    font: `bold ${fontSize}px "Courier New", monospace`,
    speed: fontSize * 4,
    gap: fontSize * 3,
    line: Math.max(1, height * 0.05),
  };
}

export function draw(ctx, scene) {
  if (board?.scene !== scene) board = place(scene);
  if (!board) return;
  const { x, y, width, height, legs, pad, struts, font, speed, gap, line } = board;

  // Struts down to the roof, with a cross brace between them.
  ctx.fillStyle = '#1a1f2c';
  for (const sx of struts) ctx.fillRect(sx - line, y + height, line * 2, legs);
  ctx.fillRect(struts[0], y + height + legs * 0.45, struts[1] - struts[0], line);

  // Panel and neon frame.
  ctx.fillStyle = '#07080f';
  ctx.fillRect(x, y, width, height);
  ctx.shadowColor = '#ff2fd0';
  ctx.shadowBlur = height * 0.25;
  ctx.strokeStyle = '#ff5ce0';
  ctx.lineWidth = line;
  ctx.strokeRect(x, y, width, height);

  // Text, clipped to the panel.
  const text = billboardText(scene.lastMerge);
  ctx.font = font;
  if (measured.text !== text || measured.font !== font) {
    measured = { text, font, width: ctx.measureText(text).width };
  }
  const inner = width - pad * 2;
  const left = x + pad + textOffset(scene.time, measured.width, inner, speed, gap);
  ctx.beginPath();
  ctx.rect(x + pad, y, inner, height);
  ctx.clip();
  // A faint flicker now and then, like a real tube.
  ctx.globalAlpha = flickerAlpha(scene.time);
  ctx.shadowColor = '#2ff3ff';
  ctx.fillStyle = '#b8fbff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left, y + height / 2);
  if (measured.width > inner) ctx.fillText(text, left + measured.width + gap, y + height / 2);
}
