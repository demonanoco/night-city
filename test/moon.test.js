import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { moonPosition, RISE_SECONDS } from '../src/elements/moon.js';

const at = (time, w = 1280, h = 720) => ({ ...layout(w, h), time });

describe('moon', () => {
  it('starts hidden below the street line', () => {
    const scene = at(0);
    const { y, r } = moonPosition(scene);
    expect(y - r).toBeGreaterThanOrEqual(scene.ground);
  });

  it('rises steadily during the rise', () => {
    let last = Infinity;
    for (let t = 0; t <= RISE_SECONDS; t += 0.25) {
      const { y } = moonPosition(at(t));
      expect(y).toBeLessThan(last);
      last = y;
    }
  });

  it('rests in the upper right after about 3 seconds', () => {
    for (const [w, h] of [[1280, 720], [390, 844]]) {
      const end = moonPosition(at(RISE_SECONDS, w, h));
      expect(moonPosition(at(60, w, h))).toEqual(end);
      expect(end.x).toBeGreaterThan(w / 2);
      expect(end.x + end.r).toBeLessThanOrEqual(w);
      expect(end.y - end.r).toBeGreaterThanOrEqual(0);
      expect(end.y).toBeLessThan(h / 3);
    }
  });
});
