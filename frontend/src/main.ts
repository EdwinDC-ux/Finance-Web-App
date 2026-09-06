import './style.css';

// 1. INTERFACES
interface Account {
  id: number;
  name: string;
  balance: string;
}

interface Transaction {
  id: number;
  amount: string;
  created_at: string;
  origin_name: string | null;
  dest_name: string | null;
}

// 2. REFERENCIAS DOM
const netWorthEl = document.querySelector<HTMLHeadingElement>('#net-worth')!;
const accountsContainer = document.querySelector<HTMLDivElement>('#accounts-container')!;
const historyContainer = document.querySelector<HTMLDivElement>('#history-container')!;
const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
const originSelect = document.querySelector<HTMLSelectElement>('#origin')!;
const destSelect = document.querySelector<HTMLSelectElement>('#destination')!;
const amountInput = document.querySelector<HTMLInputElement>('#amount')!;

// 3. CARGAR CUENTAS Y CALCULAR PATRIMONIO
async function loadAccounts() {
  try {
    const response = await fetch('/api/accounts');
    const result = await response.json();

    if (result.status === 'success') {
      const accounts: Account[] = result.data;
      
      // Magia FIRE: Calcular Patrimonio Neto
      const totalNetWorth = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      netWorthEl.innerText = `$${totalNetWorth.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

      renderAccounts(accounts);
      populateSelects(accounts);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 4. CARGAR HISTORIAL
async function loadHistory() {
  try {
    const response = await fetch('/api/transactions');
    const result = await response.json();

    if (result.status === 'success') {
      renderHistory(result.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 5. RENDERIZAR TABLAS
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
    const origin = tx.origin_name || '---';
    const dest = tx.dest_name || '---';
    
    html += `<tr>
      <td><small>${date}</small></td>
      <td>${origin}</td>
      <td>${dest}</td>
      <td align="right" style="color: #27ae60; font-weight: bold;">$${parseFloat(tx.amount).toLocaleString('es-MX')}</td>
    </tr>`;
  });
  historyContainer.innerHTML = html + `</table>`;
}

// ... (Deja tu función populateSelects exactamente igual) ...
function populateSelects(accounts: Account[]) {
  let options = `<option value="">-- Selecciona --</option>`;
  accounts.forEach(acc => {
    options += `<option value="${acc.id}">${acc.name}</option>`;
  });
  originSelect.innerHTML = options;
  destSelect.innerHTML = options;
}

// 6. EL EVENTO POST (Actualizado)
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
      // RECARGAMOS AMBAS VISTAS
      loadAccounts(); 
      loadHistory();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error de conexión');
  }
});

// 7. INICIAR LA APP
loadAccounts();
loadHistory();