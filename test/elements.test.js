import { describe, expect, it } from 'vitest';
import { layout, LAYERS } from '../src/city.js';
import { elements } from '../src/elements.js';
import { fakeContext } from './fake-canvas.js';

const sizes = [[1280, 720], [390, 844]];

describe('elements', () => {
  it('loads every file in src/elements', () => {
    expect(Array.isArray(elements)).toBe(true);
  });

  for (const el of elements) {
    describe(el.name, () => {
      it('exports draw() and a known layer', () => {
        expect(typeof el.draw).toBe('function');
        expect(LAYERS).toContain(el.layer);
      });

      it('draws ten seconds of frames at desktop and phone size', () => {
        for (const [w, h] of sizes) {
          const ctx = fakeContext();
          const scene = layout(w, h);
          scene.lastMerge = { number: 21, title: 'Add a rising moon' };
          for (let f = 0; f < 600; f++) {
            scene.time = f / 60;
            el.draw(ctx, scene);
          }
        }
      });

      it('copes with no merge yet', () => {
        const scene = { ...layout(1280, 720), time: 1, lastMerge: null };
        expect(() => el.draw(fakeContext(), scene)).not.toThrow();
      });
    });
  }
});
