import { defineConfig } from 'vite';
import { cpSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';

// The storefront is plain HTML/CSS/JS (index.html, style.css, main.js).
// This "build" simply assembles those three files into dist/.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: undefined,
    },
  },
  plugins: [
    {
      name: 'copy-plain-store',
      closeBundle() {
        if (!existsSync('dist')) mkdirSync('dist');
        cpSync('index.html', 'dist/index.html');
        cpSync('style.css', 'dist/style.css');
        cpSync('main.js', 'dist/main.js');
        const assets = 'dist/assets';
        if (existsSync(assets)) rmSync(assets, { recursive: true });
      },
    },
  ],
});
