// Archivo: src/main.ts
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import { validateSession } from './auth';

window.addEventListener('popstate', (event) => {
    const view = event.state?.view || window.location.pathname.replace('/', '') || 'login';
    validateSession(view, false); 
});

const currentPath = window.location.pathname.replace('/', '');
validateSession(currentPath);