import { showView } from './ui';

export async function validateSession(requestedView: string = 'dashboard', pushState: boolean = true) {
    showView('loading', false); 
    try {
        const response = await fetch('/api/user'); 
        if (response.status === 401) {
            if (requestedView === 'register') showView('register', pushState);
            else showView('login', pushState);
        } else {
            if (['login', 'register', 'loading', ''].includes(requestedView)) {
                window.history.replaceState({ view: 'dashboard' }, "", "/dashboard");
                showView('dashboard', false);
            } else {
                showView(requestedView, pushState);
            }
        }
    } catch (error) {
        showView('login', pushState);
    }
}