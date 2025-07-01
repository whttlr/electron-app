import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'MachineStatusMonitor',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@cnc-jog-controls/plugin-api'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@cnc-jog-controls/plugin-api': 'PluginAPI'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  server: {
    port: 3001,
    open: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})