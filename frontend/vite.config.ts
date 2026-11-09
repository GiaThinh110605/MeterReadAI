import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://192.168.252.2',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://192.168.252.2',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
