import { defineConfig } from 'vite';

// Base-Pfad für GitHub Pages
// Wird als Umgebungsvariable VITE_BASE_PATH gesetzt (im GitHub Actions Workflow)
// Falls nicht gesetzt (lokale Entwicklung), bleibt es '/'
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base: base,
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

