import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Ogni chiamata a /api/... dal frontend viene inoltrata al backend Express
      '/api': 'http://localhost:3001'
    }
  }
});
