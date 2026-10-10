// Archivo: src/main.ts
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import { validateSession } from './auth';

window.addEventListener('popstate', (event) => {
    const view = event.state?.view || window.location.pathname.replace('/', '') || 'login';
    validateSession(view, false); 
});

const currentPath = window.location.pathname.replace('/', '');
validateSession(currentPath);

// REGISTRO DEL SERVICE WORKER (PWA)
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA: Service Worker activo'))
      .catch((err) => console.error('PWA: Error al registrar Service Worker', err));
  });
}