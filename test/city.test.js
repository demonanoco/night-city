import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';

describe('layout', () => {
  it('fills the full width with buildings', () => {
    const { buildings } = layout(1280, 720);
    expect(buildings[0].x).toBeLessThanOrEqual(0);
    const last = buildings[buildings.length - 1];
    expect(last.x + last.width).toBeGreaterThanOrEqual(1280);
  });

  it('stands every building on the ground', () => {
    const { buildings, ground } = layout(1280, 720);
    for (const b of buildings) expect(b.y + b.height).toBeCloseTo(ground);
  });

  it('keeps every window inside its building', () => {
    const { buildings, windows } = layout(1280, 720);
    expect(windows.length).toBeGreaterThan(100);
    for (const w of windows) {
      const b = buildings[w.building];
      expect(w.x).toBeGreaterThanOrEqual(b.x);
      expect(w.x + w.width).toBeLessThanOrEqual(b.x + b.width + 0.001);
      expect(w.y).toBeGreaterThanOrEqual(b.y);
    }
  });

  it('draws the same skyline on every reload', () => {
    expect(layout(1280, 720)).toEqual(layout(1280, 720));
  });
});
