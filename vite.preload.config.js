import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/electron/preload/preload.ts'),
      formats: ['cjs'],
      fileName: 'preload'
    },
    rollupOptions: {
      external: [
        'electron'
      ]
    },
    outDir: 'dist-electron/preload',
    emptyOutDir: true,
    target: 'node14'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});