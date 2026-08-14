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
npm run cov:check
```

`npm test` is read-only with respect to tracked source files. Use `npm run lint:fix` or `npm run format` only when you intend to apply automated fixes.
