import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { plan, isLit } from '../src/elements/windows.js';

const sizes = [[1280, 720], [390, 844]];

function litAt(p, n, time) {
  const lit = [];
  for (let i = 0; i < n; i++) lit.push(isLit(p, i, time));
  return lit;
}

describe('windows', () => {
  for (const [w, h] of sizes) {
    describe(`${w}x${h}`, () => {
      const { windows } = layout(w, h);
      const p = plan(windows);
      const n = windows.length;

      it('lights about half of the windows', () => {
        for (const t of [0, 30, 300]) {
          const share = litAt(p, n, t).filter(Boolean).length / n;
          expect(share).toBeGreaterThan(0.4);
          expect(share).toBeLessThan(0.6);
        }
      });

      it('makes a few windows brighter', () => {
        const share = p.bright.reduce((a, b) => a + b, 0) / n;
        expect(share).toBeGreaterThan(0.05);
        expect(share).toBeLessThan(0.2);
      });

      it('is the same on every reload', () => {
        const again = plan(layout(w, h).windows);
        expect(litAt(again, n, 42)).toEqual(litAt(p, n, 42));
      });

      it('switches a handful of windows every few seconds', () => {
        let total = 0;
        let quiet = 0;
        const steps = 100;
        for (let s = 0; s < steps; s++) {
          const a = litAt(p, n, s * 3);
          const b = litAt(p, n, s * 3 + 3);
          const changed = a.filter((lit, i) => lit !== b[i]).length;
          total += changed;
          if (changed === 0) quiet++;
          expect(changed).toBeLessThan(20);
        }
        expect(total / steps).toBeGreaterThan(3);
        expect(total / steps).toBeLessThan(10);
        expect(quiet).toBeLessThan(steps * 0.1);
      });
    });
  }
});
