import { type Account, type BudgetStat, type CreditCardStat } from '../types';
import Chart from 'chart.js/auto';

export function renderDashboard(): string {
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="card card-dark">
                    <h3>Patrimonio Neto</h3>
                    <h1 id="net-worth" class="net-worth-amount">$0.00</h1>
                    <div class="fire-widget">
                        <div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;">
                            <span>Progreso FIRE</span><span id="fire-percentage">0%</span>
                        </div>
                        <div class="progress-track"><div id="fire-progress-bar" class="progress-fill" style="width: 0%;"></div></div>
                        <p class="fire-meta-text">Meta: <span id="fire-target-display">$0.00</span> <a href="#" id="edit-fire-btn" class="link-edit">✏️ Editar</a></p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card" style="text-align: center;">
                    <h3 style="margin-top: 0; color: var(--text-muted);">📈 Crecimiento Histórico</h3>
                    <canvas id="net-worth-chart"></canvas>
                </div>
            </div>
            <div class="col-12">
                <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div class="card" style="flex: 1; background: var(--color-success); color: white; text-align: center; margin-bottom: 0; min-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Ingresos (Mes)</h4><h2 id="month-income" style="margin: 0;">$0.00</h2>
                    </div>
                    <div class="card" style="flex: 1; background: var(--color-danger); color: white; text-align: center; margin-bottom: 0; min-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Gastos (Mes)</h4><h2 id="month-expense" style="margin: 0;">$0.00</h2>
                    </div>
                    <div class="card" style="flex: 1; background: #f39c12; color: white; text-align: center; margin-bottom: 0; min-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; font-weight: normal;">Tasa de Ahorro</h4><h2 id="savings-rate" style="margin: 0;">0%</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <div class="card" style="flex: 1; min-width: 300px;">
                    <h3 style="margin-top: 0;">💳 Tarjetas de Crédito</h3>
                    <div id="credit-cards-container"><p class="text-muted">No hay tarjetas registradas.</p></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card" style="text-align: center;">
                    <h3 style="margin-top: 0;">📊 Gastos del Mes</h3>
                    <canvas id="expense-chart"></canvas>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="flex-between">
                        <h3 style="margin-top: 0;">🚦 Presupuestos</h3>
                        <button id="copy-budgets-btn" class="btn btn-primary" style="width: auto; padding: 5px 10px; font-size: 0.8rem;">Copiar Mes Anterior</button>
                    </div>
                    <div id="budgets-container"><p class="text-muted">Cargando...</p></div>
                </div>
            </div>
        </div>
    `;
}

let expenseChart: Chart | null = null;
let netWorthChart: Chart | null = null;

export function initDashboard() {
    document.querySelector('#edit-fire-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const newTarget = prompt("Ingresa tu nueva Meta FIRE (ej. 5000000):");
        if (newTarget && !isNaN(parseFloat(newTarget))) {
            await fetch('/api/user/fire-target', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fire_target: parseFloat(newTarget) }) });
            loadDashboardData(); 
        }
    });

    document.querySelector('#copy-budgets-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm("¿Copiar presupuestos del mes pasado?")) return;
        const res = await fetch('/api/categories/copy-budgets', { method: 'POST' });
        if (res.ok) loadBudgets();
    });

    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const res = await fetch('/api/accounts');
        if (res.status === 401) return;
        const result = await res.json();
        if (result.status === 'success') {
            const accounts: Account[] = result.data;
            const totalNetWorth = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
            document.querySelector<HTMLHeadingElement>('#net-worth')!.innerText = `$${totalNetWorth.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
            
            await fetch('/api/stats/snapshot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ net_worth: totalNetWorth }) });
            
            loadUserProfile(totalNetWorth);
            loadCashFlow();
            loadCreditCards();
            loadStats();
            loadBudgets();
            loadNetWorthHistory();
        }
    } catch (e) { console.error(e); }
}

async function loadUserProfile(currentNetWorth: number) {
    const res = await fetch('/api/user'); const result = await res.json();
    if (result.status === 'success') {
        const target = parseFloat(result.data.fire_target);
        document.querySelector<HTMLSpanElement>('#fire-target-display')!.innerText = `$${target.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        const percentageEl = document.querySelector<HTMLSpanElement>('#fire-percentage')!;
        const progressBar = document.querySelector<HTMLDivElement>('#fire-progress-bar')!;
        if (target > 0) {
            let percentage = Math.min((currentNetWorth / target) * 100, 100);
            percentageEl.innerText = `${percentage.toFixed(2)}%`; progressBar.style.width = `${percentage}%`;
        } else { percentageEl.innerText = `0%`; progressBar.style.width = `0%`; }
    }
}

async function loadCashFlow() {
    const res = await fetch('/api/stats/cashflow'); const result = await res.json();
    if (result.status === 'success') {
        const { income, expense } = result.data;
        document.querySelector<HTMLHeadingElement>('#month-income')!.innerText = `$${income.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        document.querySelector<HTMLHeadingElement>('#month-expense')!.innerText = `$${expense.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        const savingsRateEl = document.querySelector<HTMLHeadingElement>('#savings-rate')!;
        savingsRateEl.innerText = income > 0 ? `${((income - expense) / income * 100).toFixed(1)}%` : `0.0%`;
    }
}

async function loadStats() {
    const res = await fetch('/api/stats/expenses'); const result = await res.json();
    if (result.status === 'success') {
        const labels = result.data.map((i: any) => i.category); const totals = result.data.map((i: any) => parseFloat(i.total));
        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(document.querySelector<HTMLCanvasElement>('#expense-chart')!, {
            type: 'doughnut', data: { labels, datasets: [{ data: totals, backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'] }] }
        });
    }
}

async function loadBudgets() {
    const res = await fetch('/api/stats/budgets'); const result = await res.json();
    if (result.status === 'success') {
        const container = document.querySelector<HTMLDivElement>('#budgets-container')!;
        if (result.data.length === 0) { container.innerHTML = "<p class='text-muted'>No hay presupuestos.</p>"; return; }
        let html = '';
        result.data.forEach((b: BudgetStat) => {
            const limit = parseFloat(b.budget_limit); const spent = parseFloat(b.spent);
            const percentage = Math.min((spent / limit) * 100, 100);
            let color = 'var(--color-success)'; if (percentage >= 80) color = 'var(--color-warning)'; if (percentage >= 95) color = 'var(--color-danger)';
            html += `<div style="margin-bottom: 15px;"><div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;"><strong>${b.name}</strong><span>$${spent.toLocaleString('es-MX')} / $${limit.toLocaleString('es-MX')}</span></div><div style="width: 100%; background: #ecf0f1; height: 10px; border-radius: 5px; overflow: hidden;"><div style="width: ${percentage}%; height: 100%; background-color: ${color}; transition: width 0.5s ease;"></div></div></div>`;
        });
        container.innerHTML = html;
    }
}

async function loadNetWorthHistory() {
    const res = await fetch('/api/stats/history'); const result = await res.json();
    if (result.status === 'success') {
        const labels = result.data.map((i: any) => { const d = new Date(i.snapshot_date); d.setDate(d.getDate() + 1); return d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }); });
        const totals = result.data.map((i: any) => parseFloat(i.net_worth));
        if (netWorthChart) netWorthChart.destroy();
        netWorthChart = new Chart(document.querySelector<HTMLCanvasElement>('#net-worth-chart')!, {
            type: 'line', data: { labels, datasets: [{ label: 'Patrimonio', data: totals, borderColor: '#1abc9c', backgroundColor: 'rgba(26, 188, 156, 0.2)', fill: true, tension: 0.4 }] }
        });
    }
}

async function loadCreditCards() {
    try {
        const res = await fetch('/api/stats/credit-cards');
        if (res.status === 401) return;
        const result = await res.json();
        
        if (result.status === 'success') {
            const container = document.querySelector<HTMLDivElement>('#credit-cards-container')!;
            if (result.data.length === 0) {
                container.innerHTML = "<p class='text-muted'><small>No tienes tarjetas de crédito con límite asignado.</small></p>";
                return;
            }

            let html = '';
            result.data.forEach((cc: CreditCardStat) => {
                const limit = parseFloat(cc.credit_limit);
                // En partida doble, si gastas con TC, el saldo se vuelve negativo. 
                // Tomamos el valor absoluto para saber la deuda real.
                const debt = Math.abs(parseFloat(cc.balance)); 
                let percentage = (debt / limit) * 100;
                if (percentage > 100) percentage = 100;

                // Semáforo de deuda: Verde (<30%), Amarillo (<70%), Rojo (>70%)
                let colorClass = 'background-color: var(--color-success);'; 
                if (percentage >= 30) colorClass = 'background-color: var(--color-warning);'; 
                if (percentage >= 70) colorClass = 'background-color: var(--color-danger);'; 

                html += `
                    <div style="margin-bottom: 15px;">
                        <div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;">
                            <strong>${cc.nombre}</strong>
                            <span>$${debt.toLocaleString('es-MX')} / $${limit.toLocaleString('es-MX')}</span>
                        </div>
                        <div style="width: 100%; background: #ecf0f1; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; transition: width 0.5s ease; ${colorClass}"></div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    } catch (error) { console.error("Error cargando tarjetas:", error); }
}