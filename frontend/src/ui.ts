import { renderLoader } from './components/Loader';
import { renderLayout } from './components/Layout';
import { renderLogin, initLogin, renderRegister, initRegister } from './pages/Auth';
import { renderDashboard, initDashboard } from './pages/Dashboard';
import { renderTransactions, initTransactions } from './pages/Transactions';
import { renderSettings, initSettings } from './pages/Settings';
import { renderBudgets, initBudgets } from './pages/Budgets';
import { render404, init404 } from './pages/Error404';
import { validateSession } from './auth';

let layoutRendered = false;

export function showView(view: string, pushState: boolean = true) {
    const app = document.querySelector<HTMLDivElement>('#app')!;

    if (pushState && view !== 'loading') {
        window.history.pushState({ view: view }, "", `/${view}`);
    }

    if (['loading', 'login', 'register'].includes(view)) {
        layoutRendered = false;
        if (view === 'loading') app.innerHTML = renderLoader();
        if (view === 'login') { app.innerHTML = renderLogin(); initLogin(); }
        if (view === 'register') { app.innerHTML = renderRegister(); initRegister(); }
        return;
    }

    if (!layoutRendered) {
        app.innerHTML = renderLayout();
        initNavigation();
        layoutRendered = true;
    }

    const content = document.querySelector<HTMLDivElement>('#page-content')!;
    content.innerHTML = renderLoader(); 

    switch (view) {
        case 'dashboard': content.innerHTML = renderDashboard(); initDashboard(); break;
        case 'budgets': content.innerHTML = renderBudgets(); initBudgets(); break;
        case 'transactions': content.innerHTML = renderTransactions(); initTransactions(); break;
        case 'settings': content.innerHTML = renderSettings(); initSettings(); break;
        case '404':
        default:
            content.innerHTML = render404();
            init404(() => validateSession()); 
            break;
    }
}

function initNavigation() {
    document.querySelector('#nav-dashboard')?.addEventListener('click', (e) => { e.preventDefault(); showView('dashboard'); });
    document.querySelector('#nav-budgets')?.addEventListener('click', (e) => { e.preventDefault(); showView('budgets'); });
    document.querySelector('#nav-transactions')?.addEventListener('click', (e) => { e.preventDefault(); showView('transactions'); });
    document.querySelector('#nav-settings')?.addEventListener('click', (e) => { e.preventDefault(); showView('settings'); });
    document.querySelector('#nav-logout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/logout', { method: 'POST' });
        validateSession(); 
    });
}