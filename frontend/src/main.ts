import './style.css';
import { showView } from './ui';
import { initAuth } from './auth';
import { initDashboard, loadAccounts } from './dashboard';

// 1. Inicializamos los eventos de los formularios
initAuth();
initDashboard();

// 2. Arrancamos la app
showView('loading');
loadAccounts();