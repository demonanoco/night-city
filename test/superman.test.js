import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { supermanPosition, FIRST_PASS, FLIGHT_SECONDS, PERIOD_SECONDS } from '../src/elements/superman.js';

const at = (time, w = 1280, h = 720) => ({ ...layout(w, h), time });

describe('superman', () => {
  it('waits for the first pass after load', () => {
    expect(supermanPosition(at(0))).toBeNull();
    expect(supermanPosition(at(FIRST_PASS - 0.1))).toBeNull();
  });

  it('flies left to right across the whole sky', () => {
    let last = -Infinity;
    for (let t = FIRST_PASS; t < FIRST_PASS + FLIGHT_SECONDS; t += 0.25) {
      const { x } = supermanPosition(at(t));
      expect(x).toBeGreaterThan(last);
      last = x;
    }
    const start = supermanPosition(at(FIRST_PASS));
    expect(start.x + start.s).toBeLessThan(0);
    const end = supermanPosition(at(FIRST_PASS + FLIGHT_SECONDS - 0.01));
    expect(end.x - end.s).toBeGreaterThan(1280);
  });

  it('is off screen between passes and comes back every period', () => {
    expect(supermanPosition(at(FIRST_PASS + FLIGHT_SECONDS + 0.1))).toBeNull();
    expect(supermanPosition(at(FIRST_PASS + PERIOD_SECONDS + 1))).toEqual(supermanPosition(at(FIRST_PASS + 1)));
  });

  it('stays in the sky above every roof at desktop and phone size', () => {
    for (const [w, h] of [[1280, 720], [390, 844]]) {
      const top = Math.min(...layout(w, h).buildings.map((b) => b.y));
      for (let t = FIRST_PASS; t < FIRST_PASS + FLIGHT_SECONDS; t += 0.1) {
        const { y, s } = supermanPosition(at(t, w, h));
        expect(y - s * 0.3).toBeGreaterThanOrEqual(0);
        expect(y + s * 0.3).toBeLessThan(top);
      }
    }
  });
});
