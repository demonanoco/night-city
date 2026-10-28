import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { billboardText, flickerAlpha, pickBuilding, place, textOffset } from '../src/elements/billboard.js';

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

  it('stands both struts on the roof at every size', () => {
    for (const [w, h] of [[1280, 720], [390, 844], [1920, 1080]]) {
      const { b, struts, line, y, height, legs } = place(layout(w, h));
      for (const sx of struts) {
        expect(sx - line).toBeGreaterThanOrEqual(b.x);
        expect(sx + line).toBeLessThanOrEqual(b.x + b.width);
      }
      expect(y + height + legs).toBeCloseTo(b.y);
    }
  });

  it('flickers briefly once every few seconds', () => {
    const fps = 60;
    let dips = 0;
    let dimFrames = 0;
    let prev = 1;
    for (let f = 0; f < 60 * fps; f++) {
      const a = flickerAlpha(f / fps);
      if (a < 1) dimFrames++;
      if (a < 1 && prev === 1) dips++;
      prev = a;
    }
    expect(dips).toBeGreaterThanOrEqual(10);
    expect(dips).toBeLessThanOrEqual(20);
    expect(dimFrames / dips).toBeLessThanOrEqual(10);
  });
});
