import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './', // Use relative paths for Electron compatibility
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    open: true,
    headers: {
      // Allow external requests during development
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file: https: http:; connect-src 'self' https: http: ws: wss:;"
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './config'),
      '@locales': path.resolve(__dirname, './locales'),
      // UI Library source mappings
      '@whttlr/ui-core': path.resolve(__dirname, '../ui-library/packages/core/src'),
      '@whttlr/ui-cnc': path.resolve(__dirname, '../ui-library/packages/cnc/src'),
      '@whttlr/ui-theme': path.resolve(__dirname, '../ui-library/packages/theme/src'),
      '@whttlr/ui-adapters': path.resolve(__dirname, '../ui-library/packages/adapters/src'),
      // Replace moment with dayjs for Ant Design
      'moment': 'dayjs'
    }
  }
})