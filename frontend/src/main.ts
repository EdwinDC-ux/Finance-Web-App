import './style.css';
import { showView } from './ui';
import { initAuth } from './auth';
import { initDashboard, loadAccounts, loadHistory, loadStats, loadCategories } from './dashboard';

// 1. Inicializamos los eventos de los formularios
initAuth();
initDashboard();

// 2. Arrancamos la app
showView('loading');
loadAccounts();
loadCategories();
loadStats();
loadHistory();