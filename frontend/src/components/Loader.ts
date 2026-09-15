export function renderLoader(): string {
    return `
        <div class="d-flex flex-column justify-content-center align-items-center" style="height: 100vh; background: var(--bg-body);">
            <h2 style="color: var(--color-primary);">⏳ Cargando tu imperio...</h2>
        </div>
    `;
}