export function renderLayout(): string {
    return `
        <div class="d-flex" style="height: 100dvh; width: 100vw; overflow: hidden; background-color: var(--bg-body);">
            
            <!-- SIDEBAR (Menú Deslizable en Móvil, Fijo en Desktop) -->
            <div class="offcanvas-md offcanvas-start text-white d-flex flex-column flex-shrink-0 p-3" 
                tabindex="-1" id="sidebarMenu" style="width: 250px; background-color: var(--text-main) !important; z-index: 1050;">
                
                <!-- Cabecera del menú (Móvil) -->
                <div class="offcanvas-header d-md-none">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/favicon.svg" width="28" height="28" alt="Logo">
                        <h5 class="offcanvas-title fw-bold m-0 text-white">Vértice Capital</h5>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
                </div>

                <!-- Cabecera del menú (Desktop) -->
                <div class="d-none d-md-flex align-items-center gap-2 mb-3 me-md-auto text-white">
                    <img src="/favicon.svg" width="32" height="32" alt="Logo">
                    <span class="fs-4 fw-bold">Vértice Capital</span>
                </div>
                <hr class="d-none d-md-block">
                
                <!-- Enlaces de Navegación -->
                <ul class="nav nav-pills flex-column mb-auto" style="overflow-y: auto; overflow-x: hidden;">
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-dashboard" class="nav-link text-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">📊 Resumen</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-budgets" class="nav-link text-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">🚦 Presupuestos</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-transactions" class="nav-link text-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">📜 Movimientos</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-inventory" class="nav-link text-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">📦 Inventario</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a href="#" id="nav-settings" class="nav-link text-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">⚙️ Configuración</a>
                    </li>
                </ul>
                
                <hr>
                <!-- Botón Salir (Fijo al fondo) -->
                <div class="mt-auto">
                    <button id="nav-logout" class="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>

            <!-- CONTENEDOR PRINCIPAL (Navbar Móvil + Contenido) -->
            <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                
                <!-- NAVBAR MÓVIL (Menú de Hamburguesa, solo visible en celulares) -->
                <nav class="navbar navbar-dark d-md-none px-3 flex-shrink-0" style="background-color: var(--text-main);">
                    <a class="navbar-brand fw-bold d-flex align-items-center gap-2 m-0" href="#">
                        <img src="/favicon.svg" width="24" height="24" alt="Logo">
                        <span>Vértice Capital</span>
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                </nav>
                
                <!-- CONTENIDO DE LA PÁGINA (Con su propio scroll) -->
                <div id="page-content" class="flex-grow-1 p-3 p-md-4" style="overflow-y: auto; background-color: var(--bg-body);">
                    <!-- Aquí se inyectan las vistas -->
                </div>
                
            </div>
        </div>
    `;
}