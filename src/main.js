import { layout, drawSky, drawBuildings, drawStreet } from './city.js';
import { elements } from './elements.js';

const canvas = document.getElementById('city');
const ctx = canvas.getContext('2d');
const failed = new Set();
let scene;
let lastMerge = null;

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  scene = layout(innerWidth, innerHeight);
}

// One broken element must never blank the city: it is skipped and reported once.
function drawLayer(layer) {
  for (const el of elements) {
    if (el.layer !== layer || failed.has(el.name)) continue;
    ctx.save();
    try {
      el.draw(ctx, scene);
    } catch (err) {
      failed.add(el.name);
      console.error(`[night-city] "${el.name}" failed and is skipped`, err);
    }
    ctx.restore();
  }
}

function frame(ms) {
  scene.time = ms / 1000;
  scene.lastMerge = lastMerge;
  drawSky(ctx, scene);
  drawLayer('sky');
  drawBuildings(ctx, scene);
  drawLayer('city');
  drawStreet(ctx, scene);
  drawLayer('street');
  drawLayer('weather');
  requestAnimationFrame(frame);
}

// Written by `npm start` after every pull; absent under plain `vite`.
async function pollLastMerge() {
  try {
    const res = await fetch('/last-merge.json', { cache: 'no-store' });
    if (res.ok) lastMerge = await res.json();
  } catch {}
}

canvas.addEventListener('click', (e) => {
  for (const el of elements) el.onClick?.(e.clientX, e.clientY, scene);
});
addEventListener('resize', resize);
resize();
pollLastMerge();
setInterval(pollLastMerge, 3000);
requestAnimationFrame(frame);
