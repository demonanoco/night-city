# Night City

A city at night rendered on one canvas. Plain ES modules, Vite for the dev server and build, Vitest for tests, no runtime dependencies.

## Commands

```sh
npm install
npm run dev     # dev server
npm start       # dev server, and keeps this checkout on the latest main (pulls every 5 s)
npm test
npm run build
```

## Layout

| Path | Owns |
|---|---|
| `src/city.js` | Scene layout and base drawing: sky, buildings, windows, street |
| `src/elements/` | One module per scene element, loaded automatically by `src/elements.js` |
| `src/main.js` | Render loop, layer order, click dispatch |
| `scripts/` | The `npm start` server and the last-merge reader |
| `test/` | Vitest suites |

## Elements

An element is a module in `src/elements/`:

```js
export const layer = 'sky'; // 'sky' | 'city' | 'street' | 'weather', drawn back to front

export function draw(ctx, scene) {} // every frame; ctx is saved and restored around the call

export function onClick(x, y, scene) {} // optional
```

`scene` carries `width`, `height` (CSS pixels), `time` (seconds since load), `ground` (y of the street), `buildings` and `windows` (`{ x, y, width, height }`; windows also carry `building`), and `lastMerge` (`{ number, title }` or `null`).

- A new element is a new file. Change `city.js`, `elements.js` or `main.js` only when the scene API itself has to change, since every element depends on them.
- Derive every size and position from `scene`, never fixed pixels: the same canvas runs on a phone and on a projector.
- Place random things with `random(seed)` from `city.js`, not `Math.random()` at draw time, so the city is identical on every reload. Effects started by a click are the exception.
- `draw` runs 60 times a second: precompute what doesn't change, and allocate nothing per frame that can be allocated once.
- An element that throws is skipped and logged, so check the console when something doesn't appear.

## Tests

`test/elements.test.js` draws every element for ten seconds at desktop and phone size. Add a focused test when an element has logic of its own: timing, parsing, state.

## Pull requests

- One change per pull request, titled with what it does ("Add a rising moon"), linking the issue it closes.
- `npm test` and `npm run build` pass locally; CI runs both on every pull request.
- No new dependencies without the reason in the description.
