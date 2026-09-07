// Archivo: frontend/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Necesario para Docker
    proxy: {
      // Todo lo que empiece con /api se va al contenedor de PHP
      '/api': {
        target: 'http://web:80', // 'web' es el nombre de tu servicio en docker-compose
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true
    }
  }
});