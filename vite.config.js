import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDevelopment = command === 'serve';
  const isLocalBuild = process.env.VITE_BUILD_MODE === 'local';
  
  console.log('Build mode:', { command, mode, isDevelopment, isLocalBuild });
  
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      host: 'localhost',
      port: 3000,
      open: true,
      strictPort: true
    },
    preview: {
      host: 'localhost',
      port: 3000,
      open: true,
      strictPort: true
    }
  }
})
