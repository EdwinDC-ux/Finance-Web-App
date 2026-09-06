import './style.css';

// 1. EL CONTRATO (Interface)
interface Account {
  id: number;
  name: string;
  balance: string;
}

// 2. REFERENCIAS AL DOM (Como el $('#id') de jQuery, pero tipado)
const accountsContainer = document.querySelector<HTMLDivElement>('#accounts-container')!;
const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
const originSelect = document.querySelector<HTMLSelectElement>('#origin')!;
const destSelect = document.querySelector<HTMLSelectElement>('#destination')!;
const amountInput = document.querySelector<HTMLInputElement>('#amount')!;

// 3. FUNCIÓN PARA CARGAR DATOS (GET)
async function loadAccounts() {
  try {
    const response = await fetch('/api/accounts');
    const result = await response.json();

    if (result.status === 'success') {
      renderAccounts(result.data);
      populateSelects(result.data);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
}

// 4. PINTAR LA TABLA
function renderAccounts(accounts: Account[]) {
  let html = `<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%; max-width: 500px;">
    <tr style="background: #eee;"><th>Cuenta</th><th>Saldo</th></tr>`;
  
  accounts.forEach(acc => {
    html += `<tr>
      <td>${acc.name}</td>
      <td style="text-align: right;">$${parseFloat(acc.balance).toLocaleString('es-MX')}</td>
    </tr>`;
  });
  
  html += `</table>`;
  accountsContainer.innerHTML = html;
}

// 5. LLENAR LOS SELECTS DEL FORMULARIO
function populateSelects(accounts: Account[]) {
  let options = `<option value="">-- Selecciona --</option>`;
  accounts.forEach(acc => {
    options += `<option value="${acc.id}">${acc.name}</option>`;
  });
  originSelect.innerHTML = options;
  destSelect.innerHTML = options;
}

// 6. EL EVENTO POST (La magia de la SPA)
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ¡VITAL! Evita que el navegador recargue la página

  // Armamos el JSON que PHP espera
  const payload = {
    monto: parseFloat(amountInput.value),
    origen: originSelect.value ? parseInt(originSelect.value) : null,
    destino: destSelect.value ? parseInt(destSelect.value) : null
  };

  try {
    // Hacemos el POST a tu API
    const response = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      alert('¡Transferencia exitosa!');
      form.reset(); // Limpiamos el formulario
      loadAccounts(); // Recargamos la tabla para ver el nuevo saldo (Reactividad)
    } else {
      alert('Error del servidor: ' + result.message);
    }
  } catch (error) {
    alert('Error de conexión con la API');
  }
});

// 7. INICIAR LA APP
loadAccounts();