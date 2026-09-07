import { type Account, type Transaction, type UserProfile } from './types';
import { showView } from './ui';

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
        <tr style="background: #eee;"><th>Fecha</th><th>Origen</th><th>Destino</th><th>Monto</th></tr>`;
    transactions.forEach(tx => {
        const date = new Date(tx.created_at).toLocaleString('es-MX');
        const origin = tx.origin_name || '<span style="color:green">Ingreso Externo</span>';
        const dest = tx.dest_name || '<span style="color:red">Gasto Externo</span>';
        html += `<tr>
        <td><small>${date}</small></td>
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
}