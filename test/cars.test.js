import { describe, expect, it } from 'vitest';
import { layout } from '../src/city.js';
import { carPosition, carSize, cars, LANES } from '../src/elements/cars.js';

const sizes = [[1280, 720], [390, 844]];
const at = (time, w = 1280, h = 720) => ({ ...layout(w, h), time });
const [far, near] = LANES;

describe('cars', () => {
  it('drive the far lane right to left and the near lane left to right', () => {
    for (const car of cars) {
      const a = carPosition(at(1), car).front;
      const b = carPosition(at(1.1), car).front;
      expect(Math.sign(b - a)).toBe(car.lane.dir);
    }
    expect(far.dir).toBe(-near.dir);
  });

  it('run the two lanes at different speeds', () => {
    expect(far.crossing).not.toBe(near.crossing);
  });

  it('keep to their lane on either side of the centre line', () => {
    for (const [w, h] of sizes) {
      const scene = at(0, w, h);
      const street = h - scene.ground;
      const line = scene.ground + street * 0.42;
      const { height } = carSize(scene);
      for (const lane of LANES) {
        const { y } = carPosition(scene, { lane, phase: 0 });
        const half = (height * lane.scale) / 2;
        if (lane.dir < 0) expect([y - half >= scene.ground, y + half <= line]).toEqual([true, true]);
        else expect([y - half >= line, y + half <= h]).toEqual([true, true]);
      }
    }
  });

  it('never overlap another car in the same lane', () => {
    for (const [w, h] of sizes) {
      for (let t = 0; t < 30; t += 0.5) {
        const scene = at(t, w, h);
        const { length } = carSize(scene);
        for (const lane of LANES) {
          const fronts = cars.filter((c) => c.lane === lane).map((c) => carPosition(scene, c).front).sort((a, b) => a - b);
          for (let i = 1; i < fronts.length; i++) expect(fronts[i] - fronts[i - 1]).toBeGreaterThan(length * lane.scale);
        }
      }
    }
  });

  it('loop around, re-entering from off screen', () => {
    for (const car of cars) {
      const scene = at(0);
      const { length, beam } = carSize(scene);
      const margin = (length + beam) * car.lane.scale;
      const period = ((scene.width + margin * 2) * car.lane.crossing) / scene.width;
      expect(carPosition(at(3 + period), car).front).toBeCloseTo(carPosition(at(3), car).front, 6);
      // At some point the whole car and its beam are past each edge, so it wraps out of sight.
      const ahead = car.lane.dir > 0 ? beam : length;
      const behind = car.lane.dir > 0 ? length : beam;
      let leftOff = false;
      let rightOff = false;
      for (let t = 0; t < period; t += 0.005) {
        const { front } = carPosition(at(t), car);
        if (front + ahead * car.lane.scale <= 1) leftOff = true;
        if (front - behind * car.lane.scale >= scene.width - 1) rightOff = true;
      }
      expect([leftOff, rightOff]).toEqual([true, true]);
    }
  });
});
