// Superman makes a fly-by across the upper sky every few seconds, cape flapping, in front of the moon.
export const layer = 'sky';

export const FIRST_PASS = 2; // seconds after load, once the moon is on its way up
export const FLIGHT_SECONDS = 7;
export const PERIOD_SECONDS = 15;

export function supermanSize(scene) {
  return Math.min(scene.width, scene.height) * 0.09;
}

// Where he is and which way he's heading, or null while he's off screen between passes.
export function supermanPosition(scene) {
  const t = (scene.time || 0) - FIRST_PASS;
  if (t < 0) return null;
  const phase = t % PERIOD_SECONDS;
  if (phase >= FLIGHT_SECONDS) return null;

  const s = supermanSize(scene);
  const p = phase / FLIGHT_SECONDS;
  const startX = -s * 2;
  const endX = scene.width + s * 2;
  const x = startX + (endX - startX) * p;
  // A gentle wave through the upper sky, well above the tallest roofs.
  const wave = scene.height * 0.03;
  const y = scene.height * 0.16 + Math.sin(p * Math.PI * 2) * wave;
  const dy = Math.cos(p * Math.PI * 2) * Math.PI * 2 * wave;
  const angle = Math.atan2(dy, endX - startX);
  return { x, y, s, angle };
}

// Drawn facing +x at the origin, in units of the body length s.
export function draw(ctx, scene) {
  const pos = supermanPosition(scene);
  if (!pos) return;
  const { x, y, s, angle } = pos;
  const flap = Math.sin(scene.time * 14) * 0.08;
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Cape, streaming back from the shoulders.
  ctx.fillStyle = '#c8202c';
  ctx.beginPath();
  ctx.moveTo(s * 0.25, -s * 0.07);
  ctx.quadraticCurveTo(-s * 0.2, -s * (0.2 + flap), -s * 0.75, -s * (0.12 - flap));
  ctx.lineTo(-s * 0.6, s * (0.04 + flap));
  ctx.quadraticCurveTo(-s * 0.15, s * 0.02, s * 0.25, s * 0.02);
  ctx.closePath();
  ctx.fill();

  // Legs and boots.
  ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.1;
  ctx.strokeStyle = '#1f4fbf';
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, 0);
  ctx.lineTo(-s * 0.42, -s * 0.03);
  ctx.moveTo(-s * 0.05, s * 0.03);
  ctx.lineTo(-s * 0.4, s * 0.06);
  ctx.stroke();
  ctx.strokeStyle = '#c8202c';
  ctx.beginPath();
  ctx.moveTo(-s * 0.42, -s * 0.03);
  ctx.lineTo(-s * 0.52, -s * 0.04);
  ctx.moveTo(-s * 0.4, s * 0.06);
  ctx.lineTo(-s * 0.5, s * 0.07);
  ctx.stroke();

  // Torso.
  ctx.lineWidth = s * 0.16;
  ctx.strokeStyle = '#1f4fbf';
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, s * 0.01);
  ctx.lineTo(s * 0.25, -s * 0.02);
  ctx.stroke();

  // Fist forward.
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.moveTo(s * 0.22, -s * 0.04);
  ctx.lineTo(s * 0.5, -s * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#f1c9a5';
  ctx.beginPath();
  ctx.arc(s * 0.52, -s * 0.08, s * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Head and hair.
  ctx.beginPath();
  ctx.arc(s * 0.34, -s * 0.06, s * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(s * 0.33, -s * 0.09, s * 0.07, Math.PI, Math.PI * 2);
  ctx.fill();

  // The S shield on the chest.
  ctx.fillStyle = '#f4d03f';
  ctx.beginPath();
  ctx.moveTo(s * 0.12, -s * 0.07);
  ctx.lineTo(s * 0.2, -s * 0.06);
  ctx.lineTo(s * 0.16, s * 0.0);
  ctx.closePath();
  ctx.fill();
}
