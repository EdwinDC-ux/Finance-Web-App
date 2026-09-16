export function render404(): string {
    return `
        <div class="d-flex flex-column justify-content-center align-items-center" style="height: 70vh; text-align: center;">
            <h1 style="font-size: 6rem; color: var(--color-danger); margin: 0;">404</h1>
            <h2 style="color: var(--text-main); margin-bottom: 10px;">Página no encontrada</h2>
            <p style="color: var(--text-muted); margin-bottom: 30px;">Parece que te perdiste en el multiverso financiero.</p>
            <button id="btn-home" class="btn btn-primary" style="width: auto; padding: 10px 30px;">Volver a un lugar seguro</button>
        </div>
    `;
}
export function init404(goHome: () => void) {
    document.querySelector('#btn-home')?.addEventListener('click', (e) => { e.preventDefault(); goHome(); });
}