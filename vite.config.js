import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Wird durch build.js überschrieben
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

