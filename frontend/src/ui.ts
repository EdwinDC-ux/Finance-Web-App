export function showView(view: 'loading' | 'auth' | 'dashboard') {
    document.querySelector<HTMLDivElement>('#loading-view')!.style.display = view === 'loading' ? 'block' : 'none';
    document.querySelector<HTMLDivElement>('#auth-view')!.style.display = view === 'auth' ? 'block' : 'none';
    document.querySelector<HTMLDivElement>('#dashboard-view')!.style.display = view === 'dashboard' ? 'block' : 'none';
}