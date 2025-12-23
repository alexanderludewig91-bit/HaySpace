import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Wird durch --base Flag im Build-Befehl überschrieben
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

