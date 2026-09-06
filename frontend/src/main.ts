import './style.css';

// --- 1. INTERFACES ---
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

// --- 2. REFERENCIAS AL DOM ---
const loadingView = document.querySelector<HTMLDivElement>('#loading-view')!;
const authView = document.querySelector<HTMLDivElement>('#auth-view')!;
const dashboardView = document.querySelector<HTMLDivElement>('#dashboard-view')!;

const loginSection = document.querySelector<HTMLDivElement>('#login-section')!;
const registerSection = document.querySelector<HTMLDivElement>('#register-section')!;

const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
const emailInput = document.querySelector<HTMLInputElement>('#login-email')!;
const passwordInput = document.querySelector<HTMLInputElement>('#login-password')!;

const registerForm = document.querySelector<HTMLFormElement>('#register-form')!;
const registerEmail = document.querySelector<HTMLInputElement>('#register-email')!;
const registerPassword = document.querySelector<HTMLInputElement>('#register-password')!;

const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn')!;
const netWorthEl = document.querySelector<HTMLHeadingElement>('#net-worth')!;
const accountsContainer = document.querySelector<HTMLDivElement>('#accounts-container')!;
const historyContainer = document.querySelector<HTMLDivElement>('#history-container')!;
const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
const originSelect = document.querySelector<HTMLSelectElement>('#origin')!;
const destSelect = document.querySelector<HTMLSelectElement>('#destination')!;
const amountInput = document.querySelector<HTMLInputElement>('#amount')!;

// --- 3. CONTROL DE VISTAS ---
function showView(view: 'loading' | 'auth' | 'dashboard') {
  loadingView.style.display = view === 'loading' ? 'block' : 'none';
  authView.style.display = view === 'auth' ? 'block' : 'none';
  dashboardView.style.display = view === 'dashboard' ? 'block' : 'none';
}

document.querySelector('#show-register')?.addEventListener('click', (e) => {
  e.preventDefault();
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
});

document.querySelector('#show-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  registerSection.style.display = 'none';
  loginSection.style.display = 'block';
});

// --- 4. LÓGICA DE AUTENTICACIÓN ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showView('loading');
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
    });
    const result = await response.json();
    if (response.ok && result.status === 'success') {
      loadAccounts();
      loadHistory();
    } else {
      showView('auth');
      alert(result.message || 'Error al iniciar sesión');
    }
  } catch (error) {
    showView('auth');
    alert('Error de conexión');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerEmail.value, password: registerPassword.value })
    });
    const result = await response.json();
    if (result.status === 'success') {
      alert('¡Cuenta creada! Ahora inicia sesión.');
      registerForm.reset();
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Error de conexión');
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  showView('auth');
  loginForm.reset();
});

// --- 5. CARGA DE DATOS ---
async function loadAccounts() {
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
      renderAccounts(accounts);
      populateSelects(accounts);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadHistory() {
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

// --- 6. RENDERIZADO HTML ---
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

// --- 7. EJECUCIÓN DE TRANSFERENCIAS ---
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

// --- 8. INICIO DE LA APP ---
showView('loading');
loadAccounts();
loadHistory();