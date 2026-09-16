export function renderLayout(): string {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: var(--text-main);">
            <div class="container">
                <a class="navbar-brand" href="#">💰 FinanceSaaS</a>
                <div class="d-flex gap-2">
                    <button id="nav-dashboard" class="btn btn-sm btn-outline-light">📊 Resumen</button>
                    <button id="nav-transactions" class="btn btn-sm btn-outline-light">📜 Movimientos</button>
                    <button id="nav-settings" class="btn btn-sm btn-outline-light">⚙️ Configuración</button>
                    <button id="nav-logout" class="btn btn-sm btn-danger">Salir</button>
                </div>
            </div>
        </nav>
        <div id="page-content" class="container mt-4 pb-5"></div>
    `;
}