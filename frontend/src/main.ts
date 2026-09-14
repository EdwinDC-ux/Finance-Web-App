import './style.css';
import { showView } from './ui';
import { initAuth } from './auth';
import { initDashboard, loadAccounts } from './dashboard';

initAuth();
initDashboard();

showView('loading');
loadAccounts();