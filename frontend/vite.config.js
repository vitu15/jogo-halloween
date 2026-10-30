import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: o build funciona na raiz do domínio ou em subpasta (ex.: GitHub Pages).
  base: './',
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
