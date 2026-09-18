import { type Account, type Category } from '../types';
import { buildHistoryTable } from '../components/Tables';
import { showToast } from '../components/Toast';


export function renderTransactions(): string {
    return `
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <h3 style="margin-top: 0;" id="form-title">🔄 Registrar Movimiento</h3>
                    <form id="transfer-form">
                        <label>Concepto:</label><input type="text" id="tx-desc" class="form-input" required>
                        <label>Monto:</label><input type="number" id="amount" class="form-input" step="0.01" required>
                        <label>Fecha:</label><input type="date" id="tx-date" class="form-input" required>
                        <label>Categoría:</label><select id="category" class="form-select" required></select>
                        <label>Periodo (Opcional):</label><input type="month" id="tx-period" class="form-input">
                        <label>Origen:</label><select id="origin" class="form-select"></select>
                        <label>Destino:</label><select id="destination" class="form-select"></select>
                        <div class="mb-3"><input type="checkbox" id="tx-cleared" checked> <label>Liquidado</label></div>
                        <button type="submit" id="btn-submit-tx" class="btn btn-success">Ejecutar</button>
                        <button type="button" id="btn-cancel-edit" class="btn btn-secondary mt-2" style="display:none;">Cancelar Edición</button>
                    </form>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <h3 style="margin-top: 0;">📜 Historial</h3>
                    <div id="history-container">Cargando...</div>
                </div>
            </div>
        </div>
    `;
}

export function initTransactions() {
    const form = document.querySelector<HTMLFormElement>('#transfer-form')!;
    document.querySelector<HTMLInputElement>('#tx-date')!.valueAsDate = new Date();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            monto: parseFloat(document.querySelector<HTMLInputElement>('#amount')!.value),
            categoria: parseInt(document.querySelector<HTMLSelectElement>('#category')!.value),
            origen: document.querySelector<HTMLSelectElement>('#origin')!.value ? parseInt(document.querySelector<HTMLSelectElement>('#origin')!.value) : null,
            destino: document.querySelector<HTMLSelectElement>('#destination')!.value ? parseInt(document.querySelector<HTMLSelectElement>('#destination')!.value) : null,
            fecha: document.querySelector<HTMLInputElement>('#tx-date')!.value,
            descripcion: document.querySelector<HTMLInputElement>('#tx-desc')!.value,
            is_cleared: document.querySelector<HTMLInputElement>('#tx-cleared')!.checked ? 1 : 0,
            payment_period: document.querySelector<HTMLInputElement>('#tx-period')!.value || null
        };
        const res = await fetch('/api/transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { form.reset(); document.querySelector<HTMLInputElement>('#tx-date')!.valueAsDate = new Date(); loadHistory(); }
    });

    loadSelects();
    loadHistory();
}

async function loadSelects() {
    const resAcc = await fetch('/api/accounts'); const dataAcc = await resAcc.json();
    const resCat = await fetch('/api/categories'); const dataCat = await resCat.json();
    
    let accOpts = '<option value="">-- Externo --</option>';
    dataAcc.data.forEach((a: Account) => accOpts += `<option value="${a.id}">${a.nombre}</option>`);
    document.querySelector<HTMLSelectElement>('#origin')!.innerHTML = accOpts;
    document.querySelector<HTMLSelectElement>('#destination')!.innerHTML = accOpts;

    let catOpts = '<option value="">-- Categoría --</option>';
    dataCat.data.forEach((c: Category) => catOpts += `<option value="${c.id}">${c.name}</option>`);
    document.querySelector<HTMLSelectElement>('#category')!.innerHTML = catOpts;
}

async function loadHistory() {
    const res = await fetch('/api/transactions'); const result = await res.json();
    if (result.status === 'success') {
        document.querySelector<HTMLDivElement>('#history-container')!.innerHTML = buildHistoryTable(result.data);

        document.querySelectorAll('.btn-delete-tx').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar (reversar) este movimiento?')) {
                    const delRes = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
                    const delResult = await delRes.json();
                    if (delRes.ok && delResult.status === 'success') {
                        alert('Movimiento eliminado');
                        loadHistory(); // Recargar tabla
                    } else { alert(delResult.message); }
                }
            });
        });
    } else
        showToast(result.message, 'error');
}