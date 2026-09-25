import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'],  // ← AGREGA ESTA LÍNEA
    proxy: {
      '/api': {
        target: 'http://web:80',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true
    }
  },
  // NUEVA SECCIÓN DE BUILD
  build: {
    outDir: '../public', // Escupe los archivos en la carpeta de Apache
    emptyOutDir: false,  // ¡VITAL! Para que no borre tu index.php ni tu .htaccess
  }
});