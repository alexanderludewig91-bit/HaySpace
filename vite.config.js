import { defineConfig } from 'vite';

// Base-Pfad für GitHub Pages
// Wird als Umgebungsvariable GITHUB_REPOSITORY_NAME gesetzt
const repositoryName = process.env.GITHUB_REPOSITORY_NAME;
const base = repositoryName ? `/${repositoryName}/` : '/';

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



