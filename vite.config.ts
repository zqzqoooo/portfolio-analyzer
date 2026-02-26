import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/qt': {
        target: 'https://qt.gtimg.cn',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/qt/, ''),
      },
    },
  },
})
