export function renderLayout(): string {
    return `
        <div class="d-flex" style="height: 100vh; width: 100vw;">
        
            <!-- SIDEBAR (Menú Lateral) -->
            <div class="d-flex flex-column flex-shrink-0 p-3 text-white" style="width: 250px; background-color: var(--text-main);">
                <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <span class="fs-4 fw-bold">💰 FinanceSaaS</span>
                </a>
                <hr>
                
                <!-- Zona de Páginas (80-90% con Scroll) -->
                <ul class="nav nav-pills flex-column mb-auto" style="overflow-y: auto; overflow-x: hidden;">
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-dashboard" class="nav-link text-white">📊 Resumen</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-budgets" class="nav-link text-white">🚦 Presupuestos</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-transactions" class="nav-link text-white">📜 Movimientos</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-settings" class="nav-link text-white">⚙️ Configuración</a>
                    </li>
                </ul>
                
                <hr>
                <!-- Zona del Botón Salir (10% Fijo al fondo) -->
                <div class="mt-auto">
                <button id="nav-logout" class="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2">
                    🚪 Cerrar Sesión
                </button>
                </div>
            </div>

            <!-- CONTENIDO DE LA PÁGINA (Con su propio scroll) -->
            <div id="page-content" class="flex-grow-1 p-4" style="overflow-y: auto; background-color: var(--bg-body);">
                <!-- Aquí se inyectan las vistas -->
            </div>

        </div>
    `;
}