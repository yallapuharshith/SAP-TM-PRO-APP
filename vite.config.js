import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Use root base in dev and relative asset paths in production builds
  // so deployment works under both domain root and subpaths (e.g. GitHub Pages project sites).
  base: command === 'serve' ? '/' : './',
  plugins: [react()],
}));
