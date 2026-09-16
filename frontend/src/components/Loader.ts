export function renderLoader(): string {
    return `
        <div class="d-flex flex-column justify-content-center align-items-center" style="height: 100vh; background: var(--bg-body);">
            <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
            <h3 style="color: var(--color-primary);">⏳ Cargando tu imperio...</h3>
        </div>
    `;
}