import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ローカル用設定
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist-local',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    open: true,
    port: 3000
  },
  preview: {
    port: 3000
  }
})
