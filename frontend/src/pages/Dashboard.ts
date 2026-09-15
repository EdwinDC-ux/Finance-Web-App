export function renderDashboard(): string {
    return `
        <div class="row">
            <div class="col-12">
                <div class="flex-between" style="margin-bottom: 20px;">
                    <h2 style="margin: 0;">Mi Imperio Financiero</h2>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-dark">
                    <h3>Patrimonio Neto</h3>
                    <h1 id="net-worth" class="net-worth-amount">$0.00</h1>

                    <div class="fire-widget">
                        <div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;">
                            <span>Progreso FIRE</span>
                            <span id="fire-percentage">0%</span>
                        </div>
                        <div class="progress-track">
                            <div id="fire-progress-bar" class="progress-fill" style="width: 0%;"></div>
                        </div>
                        <p class="fire-meta-text">
                            Meta: <span id="fire-target-display">$0.00</span> 
                            <a id="edit-fire-btn" class="link-edit">✏️ Editar</a>
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card" style="text-align: center;">
                    <h3 style="margin-top: 0; color: var(--text-muted);">📈 Crecimiento Histórico</h3>
                    <div style="width: 100%; max-width: 600px; margin: 0 auto;">
                        <canvas id="net-worth-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div class="card" style="flex: 1; background: var(--color-success); color: white; text-align: center; margin-bottom: 0;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Ingresos (Mes)</h4>
                        <h2 id="month-income" style="margin: 0;">$0.00</h2>
                    </div>
                    <div class="card" style="flex: 1; background: var(--color-danger); color: white; text-align: center; margin-bottom: 0;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Gastos (Mes)</h4>
                        <h2 id="month-expense" style="margin: 0;">$0.00</h2>
                    </div>
                    <div class="card" style="flex: 1; background: #f39c12; color: white; text-align: center; margin-bottom: 0;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Tasa de Ahorro</h4>
                        <h2 id="savings-rate" style="margin: 0;">0%</h2>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card" style="flex: 1; text-align: center; min-width: 300px;">
                    <h3 style="margin-top: 0;">📊 Gastos del Mes</h3>
                    <div style="max-width: 250px; margin: 0 auto;">
                        <canvas id="expense-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card" style="flex: 1; min-width: 300px;">
                    <div class="flex-between">
                        <h3 style="margin-top: 0;">🚦 Presupuestos</h3>
                        <button id="copy-budgets-btn" class="btn btn-primary" style="width: auto; padding: 5px 10px; font-size: 0.8rem;">Copiar Mes Anterior</button>
                    </div>
                    <div id="budgets-container"><p class="text-muted">Cargando...</p></div>
                </div>
            </div>
            <div class="col-12">
                <div class="card">
                    <h3 style="margin-top: 0;">🏦 Mis Cuentas</h3>
                    <div id="accounts-container"></div>
            </div>
            <div class="col-12">
                <div class="card">
                    <h3 style="margin-top: 0;">📜 Últimos Movimientos</h3>
                    <div id="history-container"></div>
                </div>
            </div>
        </div>
    `;
}