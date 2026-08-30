import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base ("./") keeps assets resolving correctly on GitHub Pages whether
// the site is served from a domain root (behindthepackets.github.io) or a project
// subpath (user.github.io/repo/). Combined with HashRouter, routing never 404s.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
