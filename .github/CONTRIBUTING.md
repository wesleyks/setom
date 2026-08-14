# Contributing

## Prerequisites

- Node.js 22 or later. Run `nvm use` to select the repository's default Node version when using nvm.
- npm 11.2.0, as declared in `package.json`.

## Setup and validation

Install the locked dependency graph with:

```sh
npm ci
```

Before opening a pull request, run:

```sh
npm test
npm run test:coverage
```

`npm test` is read-only with respect to tracked source files. Use `npm run check:fix` only when you intend to apply Biome's automated fixes.
