// The empty city every element draws on: sky, buildings with dark windows, and the street.

export const LAYERS = ['sky', 'city', 'street', 'weather'];

// Deterministic 0..1 noise, so the skyline is the same on every reload.
export function random(seed) {
  const x = Math.sin(seed * 12.9898 + 1.234) * 43758.5453;
  return x - Math.floor(x);
}

export function layout(width, height) {
  const ground = Math.round(height * 0.84);
  const buildings = [];
  const windows = [];
  const cell = Math.max(3, width * 0.0075);
  const gap = cell * 0.9;

  let x = -0.01;
  for (let i = 0; x < 1.01; i++) {
    const w = 0.045 + random(i * 3 + 1) * 0.05;
    const h = 0.22 + random(i * 3 + 2) * 0.36;
    const b = { x: x * width, width: w * width, height: h * ground };
    b.y = ground - b.height;
    buildings.push(b);

    const cols = Math.floor((b.width - gap) / (cell + gap));
    const rows = Math.floor((b.height - gap * 2) / (cell * 1.3 + gap));
    const left = b.x + (b.width - (cols * (cell + gap) - gap)) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        windows.push({ x: left + c * (cell + gap), y: b.y + gap * 2 + r * (cell * 1.3 + gap), width: cell, height: cell * 1.3, building: i });
      }
    }
    x += w + 0.004;
  }
  return { width, height, ground, buildings, windows };
}

export function drawSky(ctx, scene) {
  const g = ctx.createLinearGradient(0, 0, 0, scene.ground);
  g.addColorStop(0, '#060a1a');
  g.addColorStop(1, '#1d2650');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, scene.width, scene.height);
}

export function drawBuildings(ctx, scene) {
  scene.buildings.forEach((b, i) => {
    ctx.fillStyle = random(i * 3 + 3) > 0.5 ? '#0b0f18' : '#0f141f';
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
  ctx.fillStyle = '#192032';
  for (const w of scene.windows) ctx.fillRect(w.x, w.y, w.width, w.height);
}

export function drawStreet(ctx, scene) {
  const { width, height, ground } = scene;
  ctx.fillStyle = '#090b11';
  ctx.fillRect(0, ground, width, height - ground);
  ctx.strokeStyle = '#2a3142';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([width * 0.02, width * 0.02]);
  ctx.beginPath();
  ctx.moveTo(0, ground + (height - ground) * 0.42);
  ctx.lineTo(width, ground + (height - ground) * 0.42);
  ctx.stroke();
  ctx.setLineDash([]);
}
