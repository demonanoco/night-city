// A 2D context stand-in: every method is a no-op, properties keep what was set.
export function fakeContext() {
  const gradient = { addColorStop() {} };
  const state = {};
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'measureText') return (text) => ({ width: String(text).length * 7 });
      if (typeof key === 'string' && key.startsWith('create')) return () => gradient;
      if (key === 'getLineDash') return () => [];
      return typeof key === 'string' ? () => {} : undefined;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}
