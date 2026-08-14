import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: {
    cjsReexport: false,
  },
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  platform: 'node',
  target: 'node22',
});
