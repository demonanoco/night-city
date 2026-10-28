import { describe, expect, it, vi } from 'vitest';
import { fakeContext } from './fake-canvas.js';
import { layout } from '../src/city.js';
import { draw, SHOOTING_DURATION, SHOOTING_PERIOD, shootingStar, STAR_COUNT, starPositions, twinkle } from '../src/elements/stars.js';

const at = (time, w = 1280, h = 720) => ({ ...layout(w, h), time });

describe('stars', () => {
  it('places about 90 stars in the upper sky, inside the canvas', () => {
    for (const [w, h] of [[1280, 720], [390, 844]]) {
      const scene = at(0, w, h);
      const list = starPositions(scene);
      expect(list).toHaveLength(STAR_COUNT);
      for (const s of list) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(w);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThan(scene.ground * 0.6);
      }
    }
  });

  it('is the same on every reload', async () => {
    const before = starPositions(at(0, 800, 600));
    vi.resetModules();
    const reloaded = await import('../src/elements/stars.js');
    const after = reloaded.starPositions(at(0, 800, 600));
    expect(after).not.toBe(before);
    expect(after).toEqual(before);
  });

  it('builds the shooting-star gradient once, not every frame', () => {
    const ctx = fakeContext();
    let created = 0;
    const create = ctx.createLinearGradient;
    ctx.createLinearGradient = (...args) => (created++, create(...args));
    for (let f = 0; f < 120; f++) draw(ctx, at(f / 60));
    expect(created).toBe(1);
  });

  it('twinkles between dim and bright', () => {
    const [star] = starPositions(at(0));
    const values = Array.from({ length: 200 }, (_, i) => twinkle(star, i / 20));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0.35);
    expect(Math.max(...values)).toBeLessThanOrEqual(1);
    expect(Math.max(...values) - Math.min(...values)).toBeGreaterThan(0.4);
  });
});

describe('shooting star', () => {
  it('appears every few seconds and is gone in between', () => {
    for (let n = 0; n < 4; n++) {
      expect(shootingStar(at(n * SHOOTING_PERIOD + SHOOTING_DURATION / 2))).not.toBeNull();
      expect(shootingStar(at(n * SHOOTING_PERIOD + SHOOTING_DURATION + 0.1))).toBeNull();
    }
  });

  it('streaks across the sky and fades out', () => {
    const start = shootingStar(at(0.2));
    const end = shootingStar(at(SHOOTING_DURATION * 0.95));
    expect(Math.abs(end.x - start.x)).toBeGreaterThan(1280 * 0.1);
    expect(end.y).toBeGreaterThan(start.y);
    expect(end.alpha).toBeLessThan(0.1);
    expect(shootingStar(at(SHOOTING_DURATION * 0.15)).alpha).toBeCloseTo(1);
  });

  it('stays in the upper sky', () => {
    for (let t = 0; t < 60; t += 0.1) {
      const s = shootingStar(at(t));
      if (s) expect(s.y).toBeLessThan(at(t).ground * 0.6);
    }
  });
});
