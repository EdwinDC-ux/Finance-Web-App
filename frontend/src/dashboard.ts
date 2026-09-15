import { type Account, type Category, type UserProfile, type BudgetStat, type Group } from './types';
import { showView } from './ui';
import { buildAccountsTable, buildHistoryTable } from './components/Tables';
import Chart from 'chart.js/auto';

const addGroupForm = document.querySelector<HTMLFormElement>('#add-group-form')!;
const newGroupName = document.querySelector<HTMLInputElement>('#new-group-name')!;
const newCategoryGroup = document.querySelector<HTMLSelectElement>('#new-category-group')!;

// Referencias DOM
const netWorthEl = document.querySelector<HTMLHeadingElement>('#net-worth')!;
const accountsContainer = document.querySelector<HTMLDivElement>('#accounts-container')!;
const historyContainer = document.querySelector<HTMLDivElement>('#history-container')!;
const budgetsContainer = document.querySelector<HTMLDivElement>('#budgets-container')!;

const monthIncomeEl = document.querySelector<HTMLHeadingElement>('#month-income')!;
const monthExpenseEl = document.querySelector<HTMLHeadingElement>('#month-expense')!;
const savingsRateEl = document.querySelector<HTMLHeadingElement>('#savings-rate')!;

const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
const originSelect = document.querySelector<HTMLSelectElement>('#origin')!;
const destSelect = document.querySelector<HTMLSelectElement>('#destination')!;
const amountInput = document.querySelector<HTMLInputElement>('#amount')!;
const categorySelect = document.querySelector<HTMLSelectElement>('#category')!;

const addAccountForm = document.querySelector<HTMLFormElement>('#add-account-form')!;
const newAccountName = document.querySelector<HTMLInputElement>('#new-account-name')!;
const newAccountBalance = document.querySelector<HTMLInputElement>('#new-account-balance')!;

const addCategoryForm = document.querySelector<HTMLFormElement>('#add-category-form')!;
const newCategoryName = document.querySelector<HTMLInputElement>('#new-category-name')!;
const newCategoryType = document.querySelector<HTMLSelectElement>('#new-category-type')!;
const newCategoryBudget = document.querySelector<HTMLInputElement>('#new-category-budget')!;

const firePercentageEl = document.querySelector<HTMLSpanElement>('#fire-percentage')!;
const fireProgressBar = document.querySelector<HTMLDivElement>('#fire-progress-bar')!;
const fireTargetDisplay = document.querySelector<HTMLSpanElement>('#fire-target-display')!;
const editFireBtn = document.querySelector<HTMLAnchorElement>('#edit-fire-btn')!;

const newAccountType = document.querySelector<HTMLSelectElement>('#new-account-type')!;
const txDesc = document.querySelector<HTMLInputElement>('#tx-desc')!;
const txDate = document.querySelector<HTMLInputElement>('#tx-date')!;
const txPeriod = document.querySelector<HTMLInputElement>('#tx-period')!;
const txCleared = document.querySelector<HTMLInputElement>('#tx-cleared')!;

const expenseChartCtx = document.querySelector<HTMLCanvasElement>('#expense-chart')!;
const netWorthChartCtx = document.querySelector<HTMLCanvasElement>('#net-worth-chart')!;
let expenseChart: Chart | null = null;
let netWorthChart: Chart | null = null;
txDate.valueAsDate = new Date();

// --- FUNCIONES DE CARGA ---
async function loadAccountTypes() {
  try {
    const res = await fetch('/api/account-types');
    const result = await res.json();
    if (result.status === 'success') {
      let options = '<option value="">-- Tipo --</option>';
      result.data.forEach((t: any) => options += `<option value="${t.id}">${t.nombre}</option>`);
      newAccountType.innerHTML = options;
    }
  } catch (e) { console.error(e); }
}

export async function loadAccounts() {
  try {
    const response = await fetch('/api/accounts');
    if (response.status === 401) {
      showView('auth');
      return;
    }
    const result = await response.json();
    if (result.status === 'success') {
      showView('dashboard');
      const accounts: Account[] = result.data;
      
      const totalNetWorth = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      netWorthEl.innerText = `$${totalNetWorth.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      
      accountsContainer.innerHTML = buildAccountsTable(accounts);
      populateSelects(accounts);

      // Disparamos el resto de las cargas
      saveNetWorthSnapshot(totalNetWorth);
      loadUserProfile(totalNetWorth);
      loadAccountTypes();
      loadGroups();
      loadCategories();
      loadHistory();
      loadCashFlow();
      loadStats();
      loadBudgets();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function saveNetWorthSnapshot(netWorth: number) {
  try {
    await fetch('/api/stats/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ net_worth: netWorth })
    });
    loadNetWorthHistory();
  } catch (error) {
    console.error("Error guardando snapshot:", error);
  }
}

async function loadUserProfile(currentNetWorth: number) {
  try {
    const response = await fetch('/api/user');
    const result = await response.json();
    if (result.status === 'success') {
      const user: UserProfile = result.data;
      const target = parseFloat(user.fire_target);
      fireTargetDisplay.innerText = `$${target.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      
      if (target > 0) {
        let percentage = (currentNetWorth / target) * 100;
        if (percentage > 100) percentage = 100; 
        firePercentageEl.innerText = `${percentage.toFixed(2)}%`;
        fireProgressBar.style.width = `${percentage}%`;
      } else {
        firePercentageEl.innerText = `0%`;
        fireProgressBar.style.width = `0%`;
      }
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

async function loadHistory() {
  try {
    const response = await fetch('/api/transactions');
    if (response.status === 401) return;
    const result = await response.json();
    if (result.status === 'success') {
      historyContainer.innerHTML = buildHistoryTable(result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function loadGroups() {
  try {
    const response = await fetch('/api/groups');
    if (response.status === 401) return;
    const result = await response.json();
    if (result.status === 'success') {
      const groups: Group[] = result.data;
      let options = `<option value="">-- Grupo --</option>`;
      groups.forEach(g => {
        options += `<option value="${g.id}">${g.nombre}</option>`;
      });
      newCategoryGroup.innerHTML = options;
    }
  } catch (error) {
    console.error("Error cargando grupos:", error);
  }
}

async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.status === 401) return;
    const result = await response.json();
    if (result.status === 'success') {
      const categories: Category[] = result.data;
      let options = `<option value="">-- Selecciona Categoría --</option>`;
      categories.forEach(cat => {
        const icon = cat.type === 'Ingreso' ? '📈' : '📉';
        options += `<option value="${cat.id}">${icon} ${cat.name}</option>`;
      });
      categorySelect.innerHTML = options;
    }
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

async function loadCashFlow() {
  try {
    const response = await fetch('/api/stats/cashflow');
    if (response.status === 401) return;
    const result = await response.json();
    if (result.status === 'success') {
      const income = result.data.income;
      const expense = result.data.expense;
      
      monthIncomeEl.innerText = `$${income.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      monthExpenseEl.innerText = `$${expense.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      
      if (income > 0) {
        const savings = income - expense;
        const rate = (savings / income) * 100;
        savingsRateEl.innerText = `${rate.toFixed(1)}%`;
      } else {
        savingsRateEl.innerText = `0.0%`;
      }
    }
  } catch (error) {
    console.error("Error cargando flujo de caja:", error);
  }
}

async function loadStats() {
  try {
    const response = await fetch('/api/stats/expenses');
    if (response.status === 401) return;
    const result = await response.json();
    
    if (result.status === 'success') {
      const data = result.data;
      const labels = data.map((item: any) => item.category);
      const totals = data.map((item: any) => parseFloat(item.total));

      if (expenseChart) expenseChart.destroy();

      expenseChart = new Chart(expenseChartCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: totals,
            backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'],
            borderWidth: 1
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    }
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
}

async function loadBudgets() {
  try {
    const response = await fetch('/api/stats/budgets');
    if (response.status === 401) return;
    const result = await response.json();
    
    if (result.status === 'success') {
      const budgets: BudgetStat[] = result.data;
      
      if (budgets.length === 0) {
        budgetsContainer.innerHTML = "<p class='text-muted'><small>No has asignado límites a tus categorías de gasto.</small></p>";
        return;
      }

      let html = '';
      budgets.forEach(b => {
        const limit = parseFloat(b.budget_limit);
        const spent = parseFloat(b.spent);
        let percentage = (spent / limit) * 100;
        if (percentage > 100) percentage = 100;

        let colorClass = 'background-color: var(--color-success);'; 
        if (percentage >= 80) colorClass = 'background-color: var(--color-warning);'; 
        if (percentage >= 95) colorClass = 'background-color: var(--color-danger);'; 

        html += `
          <div style="margin-bottom: 15px;">
            <div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;">
              <strong>${b.name}</strong>
              <span>$${spent.toLocaleString('es-MX')} / $${limit.toLocaleString('es-MX')}</span>
            </div>
            <div style="width: 100%; background: #ecf0f1; height: 10px; border-radius: 5px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; transition: width 0.5s ease; ${colorClass}"></div>
            </div>
          </div>
        `;
      });
      budgetsContainer.innerHTML = html;
    }
  } catch (error) {
    console.error("Error cargando presupuestos:", error);
  }
}

async function loadNetWorthHistory() {
  try {
    const response = await fetch('/api/stats/history');
    if (response.status === 401) return;
    const result = await response.json();
    
    if (result.status === 'success') {
      const data = result.data;
      const labels = data.map((item: any) => {
        const date = new Date(item.snapshot_date);
        date.setDate(date.getDate() + 1); 
        return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
      });
      const totals = data.map((item: any) => parseFloat(item.net_worth));

      if (netWorthChart) netWorthChart.destroy();

      netWorthChart = new Chart(netWorthChartCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Patrimonio Neto ($)',
            data: totals,
            borderColor: '#1abc9c',
            backgroundColor: 'rgba(26, 188, 156, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true }
      });
    }
  } catch (error) {
    console.error("Error cargando gráfica histórica:", error);
  }
}

function populateSelects(accounts: Account[]) {
  let options = '';
  accounts.forEach(acc => {
    options += `<option value="${acc.id}">${acc.nombre}</option>`;
  });
  originSelect.innerHTML = `<option value="">-- Ingreso (Externo) --</option>` + options;
  destSelect.innerHTML = `<option value="">-- Gasto (Externo) --</option>` + options;
}

// --- INICIALIZADOR DE EVENTOS ---

export function initDashboard() {
  addAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newAccountName.value, 
        balance: parseFloat(newAccountBalance.value),
        tipo_cuenta_id: parseInt(newAccountType.value) // NUEVO
      })
    });
    const result = await response.json();
    if (result.status === 'success') { addAccountForm.reset(); loadAccounts(); } 
    else { alert(result.message); }
  } catch (error) { alert('Error al crear la cuenta'); }
});

  // Evento Crear Grupo
  addGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newGroupName.value })
      });
      const result = await response.json();
      if (result.status === 'success') {
        addGroupForm.reset();
        loadGroups(); 
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error al crear grupo');
    }
  });

  // Evento Crear Categoría (Actualizado)
  addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCategoryName.value, 
          type: newCategoryType.value,
          grupo_id: parseInt(newCategoryGroup.value), // NUEVO
          budget_limit: parseFloat(newCategoryBudget.value) || 0
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        addCategoryForm.reset();
        loadCategories(); 
        loadBudgets();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error al crear categoría');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      monto: parseFloat(amountInput.value),
      categoria: parseInt(categorySelect.value),
      origen: originSelect.value ? parseInt(originSelect.value) : null,
      destino: destSelect.value ? parseInt(destSelect.value) : null,
      fecha: txDate.value, // NUEVO
      descripcion: txDesc.value, // NUEVO
      is_cleared: txCleared.checked ? 1 : 0, // NUEVO
      payment_period: txPeriod.value || null // NUEVO
    };

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') {
        form.reset();
        txDate.valueAsDate = new Date(); // Restaurar fecha de hoy
        loadAccounts(); 
      } else { alert('Error: ' + result.message); }
    } catch (error) { alert('Error de conexión'); }
  });

  editFireBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const newTarget = prompt("Ingresa tu nueva Meta FIRE (ej. 5000000):");
    if (newTarget && !isNaN(parseFloat(newTarget))) {
      await fetch('/api/user/fire-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fire_target: parseFloat(newTarget) })
      });
      loadAccounts(); 
    }
  });
}