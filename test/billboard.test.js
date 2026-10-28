import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { billboardText, pickBuilding, textOffset } from '../src/elements/billboard.js';

describe('billboard', () => {
  it('shows the last merged pull request', () => {
    expect(billboardText({ number: 21, title: 'Add a rising moon' })).toBe('PR #21 merged: Add a rising moon');
  });

  it('shows Night City with no merge yet', () => {
    expect(billboardText(null)).toBe('Night City');
    expect(billboardText({ number: null, title: 'Initial commit' })).toBe('Night City');
  });

  it('stands on the tallest building in the middle third', () => {
    for (const [w, h] of [[1280, 720], [390, 844]]) {
      const scene = layout(w, h);
      const b = pickBuilding(scene);
      const centre = b.x + b.width / 2;
      expect(centre).toBeGreaterThanOrEqual(w / 3);
      expect(centre).toBeLessThanOrEqual((w * 2) / 3);
      for (const other of scene.buildings) {
        const c = other.x + other.width / 2;
        if (c >= w / 3 && c <= (w * 2) / 3) expect(other.height).toBeLessThanOrEqual(b.height);
      }
    }
  });

  it('centres text that fits and keeps it still', () => {
    expect(textOffset(0, 60, 100, 50, 20)).toBe(20);
    expect(textOffset(7, 60, 100, 50, 20)).toBe(20);
  });

  it('scrolls long text left and loops after one text width plus the gap', () => {
    expect(textOffset(0, 300, 100, 50, 20)).toBeCloseTo(0);
    expect(textOffset(1, 300, 100, 50, 20)).toBe(-50);
    expect(textOffset(320 / 50, 300, 100, 50, 20)).toBeCloseTo(0);
  });
});
