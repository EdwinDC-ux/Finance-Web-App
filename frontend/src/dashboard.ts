import { type Account, type Transaction, type UserProfile, type Category } from './types';
import { showView } from './ui';
import Chart from 'chart.js/auto'; // NUEVO IMPORT


const addCategoryForm = document.querySelector<HTMLFormElement>('#add-category-form')!;
const newCategoryName = document.querySelector<HTMLInputElement>('#new-category-name')!;
const newCategoryType = document.querySelector<HTMLSelectElement>('#new-category-type')!;
const categorySelect = document.querySelector<HTMLSelectElement>('#category')!;
const netWorthEl = document.querySelector<HTMLHeadingElement>('#net-worth')!;
const accountsContainer = document.querySelector<HTMLDivElement>('#accounts-container')!;
const historyContainer = document.querySelector<HTMLDivElement>('#history-container')!;
const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
const originSelect = document.querySelector<HTMLSelectElement>('#origin')!;
const destSelect = document.querySelector<HTMLSelectElement>('#destination')!;
const amountInput = document.querySelector<HTMLInputElement>('#amount')!;
const addAccountForm = document.querySelector<HTMLFormElement>('#add-account-form')!;
const newAccountName = document.querySelector<HTMLInputElement>('#new-account-name')!;
const newAccountBalance = document.querySelector<HTMLInputElement>('#new-account-balance')!;
const firePercentageEl = document.querySelector<HTMLSpanElement>('#fire-percentage')!;
const fireProgressBar = document.querySelector<HTMLDivElement>('#fire-progress-bar')!;
const fireTargetDisplay = document.querySelector<HTMLSpanElement>('#fire-target-display')!;
const editFireBtn = document.querySelector<HTMLAnchorElement>('#edit-fire-btn')!;
const expenseChartCtx = document.querySelector<HTMLCanvasElement>('#expense-chart')!;
let myChart: Chart | null = null; // Guardamos la instancia para poder destruirla al recargar

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
            loadUserProfile(totalNetWorth);
            renderAccounts(accounts);
            populateSelects(accounts);

            // AQUÍ DISPARAMOS EL RESTO (Solo si el login fue exitoso)
            loadCategories();
            loadStats();
            loadHistory();
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function loadHistory() {
    try {
        const response = await fetch('/api/transactions');
        if (response.status === 401) return;
        const result = await response.json();
        if (result.status === 'success') {
            renderHistory(result.data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function loadUserProfile(currentNetWorth: number) {
    try {
        const response = await fetch('/api/user');
        const result = await response.json();
        
        if (result.status === 'success') {
            const user: UserProfile = result.data;
            const target = parseFloat(user.fire_target);
            
            fireTargetDisplay.innerText = `$${target.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
            
            if (target > 0) {
                let percentage = (currentNetWorth / target) * 100;
                if (percentage > 100) percentage = 100; // Topamos al 100% visualmente
                
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

export async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (response.status === 401) return;
        const result = await response.json();
        if (result.status === 'success') {
            const categories: Category[] = result.data;
        
            // Llenar el select del formulario de transferencias
            let options = `<option value="">-- Selecciona Categoría --</option>`;
            categories.forEach(cat => {
                const icon = cat.type === 'ingreso' ? '📈' : '📉';
                options += `<option value="${cat.id}">${icon} ${cat.name}</option>`;
            });
            categorySelect.innerHTML = options;
        }
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

export async function loadStats() {
    try {
        const response = await fetch('/api/stats/expenses');
        if (response.status === 401) return;
        const result = await response.json();
        
        if (result.status === 'success') {
            const data = result.data;
        
            // Extraemos los nombres y los totales para Chart.js
            const labels = data.map((item: any) => item.category);
            const totals = data.map((item: any) => parseFloat(item.total));

            // Si ya existe una gráfica, la destruimos antes de pintar la nueva (Reactividad)
            if (myChart) {
                myChart.destroy();
            }

            // Pintamos la nueva gráfica
            myChart = new Chart(expenseChartCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: totals,
                        backgroundColor: [
                        '#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

function renderAccounts(accounts: Account[]) {
    let html = `<table width="100%" border="1" cellpadding="8" style="border-collapse: collapse;">
        <tr style="background: #eee;"><th>Cuenta</th><th>Saldo</th></tr>`;
    accounts.forEach(acc => {
        html += `<tr><td>${acc.name}</td><td align="right">$${parseFloat(acc.balance).toLocaleString('es-MX')}</td></tr>`;
    });
    accountsContainer.innerHTML = html + `</table>`;
}

function renderHistory(transactions: Transaction[]) {
    if (transactions.length === 0) {
        historyContainer.innerHTML = "<p>No hay movimientos aún.</p>";
        return;
    }
    let html = `<table width="100%" border="1" cellpadding="8" style="border-collapse: collapse;">
        <tr style="background: #eee;"><th>Fecha</th><th>Categoría</th><th>Origen</th><th>Destino</th><th>Monto</th></tr>`;
    transactions.forEach(tx => {
        const date = new Date(tx.created_at).toLocaleString('es-MX');
        const origin = tx.origin_name || '<span style="color:green">Externo</span>';
        const dest = tx.dest_name || '<span style="color:red">Externo</span>';
        const cat = tx.category || 'Transferencia'; // Muestra la categoría
        
        html += `<tr>
        <td><small>${date}</small></td>
        <td><strong>${cat}</strong></td>
        <td>${origin}</td>
        <td>${dest}</td>
        <td align="right"><strong>$${parseFloat(tx.amount).toLocaleString('es-MX')}</strong></td>
        </tr>`;
    });
    historyContainer.innerHTML = html + `</table>`;
}

function populateSelects(accounts: Account[]) {
    let options = '';
    accounts.forEach(acc => {
        options += `<option value="${acc.id}">${acc.name}</option>`;
    });
    originSelect.innerHTML = `<option value="">-- Ingreso (Externo) --</option>` + options;
    destSelect.innerHTML = `<option value="">-- Gasto (Externo) --</option>` + options;
}

export function initDashboard() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            monto: parseFloat(amountInput.value),
            categoria: parseInt(categorySelect.value), // NUEVO
            origen: originSelect.value ? parseInt(originSelect.value) : null,
            destino: destSelect.value ? parseInt(destSelect.value) : null
        };

        try {
            const response = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                form.reset();
                loadAccounts(); 
                loadHistory();
                loadStats();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });

    // Evento para Crear Cuenta
    addAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newAccountName.value,
                    balance: parseFloat(newAccountBalance.value)
                })
            });
            const result = await response.json();

            if (result.status === 'success') {
                addAccountForm.reset();
                loadAccounts(); // Recargamos para ver la nueva cuenta
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Error al crear la cuenta');
        }
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
        loadAccounts(); // Recargamos para recalcular el porcentaje
        }
    });

    // NUEVO: Evento para crear categoría
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName.value,
                    type: newCategoryType.value
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                addCategoryForm.reset();
                loadCategories(); // Recargamos el select
            } else {
                alert(result.message);
            }
        } catch (error) {
        alert('Error al crear categoría');
        }
    });
}