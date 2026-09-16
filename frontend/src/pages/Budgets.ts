import { type Category, type BudgetStat } from '../types';
import { showToast } from '../components/Toast';

export function renderBudgets(): string {
    return `
        <div class="row">
            <div class="col-md-5">
                <div class="card mb-3">
                    <h3>🚦 Asignar Presupuesto</h3>
                    <p class="text-muted small">Asigna o modifica el límite para este mes.</p>
                    <form id="set-budget-form">
                        <label>Categoría de Gasto:</label>
                        <select id="budget-category" class="form-select" required></select>
                        
                        <label>Límite Mensual ($):</label>
                        <input type="number" id="budget-amount" class="form-input" step="0.01" required>
                        
                        <button type="submit" class="btn btn-success w-100">Guardar Presupuesto</button>
                    </form>
                </div>
                
                <div class="card">
                    <h3>🔄 Clonar Mes Anterior</h3>
                    <p class="text-muted small">Copia todos los límites que asignaste el mes pasado hacia este mes.</p>
                    <button id="copy-budgets-btn" class="btn btn-primary w-100">Copiar Presupuestos</button>
                </div>
            </div>
            
            <div class="col-md-7">
                <div class="card">
                    <h3>📊 Presupuestos Actuales</h3>
                    <div id="budgets-page-container"><p class="text-muted">Cargando...</p></div>
                </div>
            </div>
        </div>
    `;
}

export function initBudgets() {
    const form = document.querySelector<HTMLFormElement>('#set-budget-form')!;
    const copyBtn = document.querySelector<HTMLButtonElement>('#copy-budgets-btn')!;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            category_id: parseInt(document.querySelector<HTMLSelectElement>('#budget-category')!.value),
            amount: parseFloat(document.querySelector<HTMLInputElement>('#budget-amount')!.value)
        };
        try {
            const res = await fetch('/api/categories/set-budget', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.status === 'success') {
                showToast('Presupuesto actualizado', 'success');
                form.reset();
                loadBudgetsList();
            } else { showToast(result.message, 'error'); }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm("¿Copiar presupuestos del mes pasado? Se sobreescribirán los actuales.")) return;
        try {
            const res = await fetch('/api/categories/copy-budgets', { method: 'POST' });
            const result = await res.json();
            if (result.status === 'success') {
                showToast('Presupuestos clonados', 'success');
                loadBudgetsList();
            } else { showToast(result.message, 'error'); }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    loadCategoriesForBudget();
    loadBudgetsList();
}

async function loadCategoriesForBudget() {
    const res = await fetch('/api/categories'); const result = await res.json();
    if (result.status === 'success') {
        let opts = '<option value="">-- Selecciona --</option>';
        // Solo mostramos categorías de tipo Gasto
        result.data.filter((c: Category) => c.type === 'Gasto').forEach((c: Category) => {
            opts += `<option value="${c.id}">${c.name}</option>`;
        });
        document.querySelector<HTMLSelectElement>('#budget-category')!.innerHTML = opts;
    }
}

async function loadBudgetsList() {
    const res = await fetch('/api/stats/budgets'); const result = await res.json();
    if (result.status === 'success') {
        const container = document.querySelector<HTMLDivElement>('#budgets-page-container')!;
        if (result.data.length === 0) { container.innerHTML = "<p class='text-muted'>No hay presupuestos asignados este mes.</p>"; return; }
        
        let html = '<table class="data-table"><tr><th>Categoría</th><th class="text-right">Límite</th><th class="text-right">Gastado</th></tr>';
        result.data.forEach((b: BudgetStat) => {
            html += `<tr>
                <td>${b.name}</td>
                <td class="text-right fw-bold">$${parseFloat(b.budget_limit).toLocaleString('es-MX')}</td>
                <td class="text-right text-danger">$${parseFloat(b.spent).toLocaleString('es-MX')}</td>
            </tr>`;
        });
        container.innerHTML = html + '</table>';
    }
}