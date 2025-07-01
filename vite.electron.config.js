import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/electron/main/main.ts'),
      formats: ['cjs'],
      fileName: 'main'
    },
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'fs/promises',
        'os',
        'events',
        'stream',
        'util',
        'child_process',
        'serialport',
        '@serialport/parser-readline',
        'electron-updater',
        'electron-is-dev'
      ]
    },
    outDir: 'dist-electron/main',
    emptyOutDir: true,
    target: 'node14'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});