// Every file in src/elements/ is one thing in the city. Adding a file adds it to the scene.
const modules = import.meta.glob('./elements/*.js', { eager: true });

export const elements = Object.entries(modules)
  .map(([path, mod]) => ({ name: path.split('/').pop().replace(/\.js$/, ''), layer: 'city', ...mod }))
  .sort((a, b) => a.name.localeCompare(b.name));
