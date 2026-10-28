# Night City

A city at night, drawn on a canvas. Each element of the scene, from the moon to the traffic, is its own small module, so the city grows one file at a time.

## Run it

Node 20.19 or newer.

```sh
npm install
npm start
```

Open the address it prints. `npm start` also keeps the checkout on the latest `main`, pulling every 5 seconds, so merged changes appear in the open page without a restart. Run it in a clone you don't edit; when a pull can't fast-forward, it pauses and says why. `npm run dev` serves the city without pulling.

## Develop

```sh
npm test        # every element draws cleanly, plus the scene layout
npm run build
```

Each element lives in `src/elements/` and is picked up automatically. [AGENTS.md](AGENTS.md) describes the element contract and the project's rules.

## License

[MIT](LICENSE)
