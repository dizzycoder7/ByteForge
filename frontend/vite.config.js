import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    /**
     * Proxy — any request from the React app that starts with /api
     * is forwarded to the Spring Boot backend at localhost:8080.
     *
     * This solves CORS during development: the browser thinks it's
     * talking to the same origin (5173), so no preflight is needed.
     * In production, a real reverse proxy (Nginx / API Gateway) handles this.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Uncomment below if backend uses self-signed HTTPS cert in dev:
        // secure: false,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1000,
  },
})
