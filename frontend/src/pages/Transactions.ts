// Archivo: frontend/src/pages/Transactions.ts
import { type Account, type Category } from '../types';
import { buildHistoryTable } from '../components/Tables';
import { showToast } from '../components/Toast';
import { showConfirm } from '../components/Modal';

let currentEditId: string | null = null;


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
    const btnSubmit = document.querySelector<HTMLButtonElement>('#btn-submit-tx')!;
    const btnCancel = document.querySelector<HTMLButtonElement>('#btn-cancel-edit')!;
    const formTitle = document.querySelector<HTMLHeadingElement>('#form-title')!;
    
    document.querySelector<HTMLInputElement>('#tx-date')!.valueAsDate = new Date();

    // CANCELAR EDICIÓN
    btnCancel.addEventListener('click', () => {
        currentEditId = null;
        form.reset();
        document.querySelector<HTMLInputElement>('#tx-date')!.valueAsDate = new Date();
        formTitle.innerText = '🔄 Registrar Movimiento';
        btnSubmit.innerText = 'Ejecutar';
        btnSubmit.className = 'btn btn-success';
        btnCancel.style.display = 'none';
    });

    // ENVIAR FORMULARIO (POST o PUT)
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

        const url = currentEditId ? `/api/transactions/${currentEditId}` : '/api/transfer';
        const method = currentEditId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (res.ok && result.status === 'success') { 
                showToast(result.message, 'success');
                btnCancel.click(); // Resetea el formulario y el estado
                loadHistory(); 
            } else { showToast(result.message, 'error'); }
        } catch (error) { showToast('Error de conexión', 'error'); }
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
        
        // EVENTO: ELIMINAR
        document.querySelectorAll('.btn-delete-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                showConfirm('Eliminar Movimiento', '¿Estás seguro de reversar este movimiento? El dinero regresará a su cuenta original.', async () => {
                    const delRes = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
                    const delResult = await delRes.json();
                    if (delRes.ok && delResult.status === 'success') {
                        showToast('Movimiento eliminado', 'success');
                        loadHistory();
                    } else { showToast(delResult.message, 'error'); }
                });
            });
        });

        // EVENTO: TOGGLE LIQUIDADO (Atajo)
        document.querySelectorAll('.btn-toggle-clear').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
                try {
                    await fetch(`/api/transactions/${id}/toggle-clear`, { method: 'PATCH' });
                    loadHistory(); // Recargamos la tabla para ver el cambio de icono
                } catch (error) {
                    showToast('Error al actualizar estado', 'error');
                }
            });
        });

        // EVENTO: EDITAR (Fill & Switch)
        document.querySelectorAll('.btn-edit-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                currentEditId = target.getAttribute('data-id');
                
                // Llenar el formulario
                document.querySelector<HTMLInputElement>('#amount')!.value = target.getAttribute('data-amount')!;
                document.querySelector<HTMLInputElement>('#tx-date')!.value = target.getAttribute('data-date')!;
                document.querySelector<HTMLInputElement>('#tx-desc')!.value = target.getAttribute('data-desc')!;
                document.querySelector<HTMLSelectElement>('#category')!.value = target.getAttribute('data-cat')!;
                document.querySelector<HTMLSelectElement>('#origin')!.value = target.getAttribute('data-origin')!;
                document.querySelector<HTMLSelectElement>('#destination')!.value = target.getAttribute('data-dest')!;
                document.querySelector<HTMLInputElement>('#tx-period')!.value = target.getAttribute('data-period')!;
                document.querySelector<HTMLInputElement>('#tx-cleared')!.checked = target.getAttribute('data-cleared') === '1';

                // Cambiar la UI
                document.querySelector<HTMLHeadingElement>('#form-title')!.innerText = '✏️ Editar Movimiento';
                const btnSubmit = document.querySelector<HTMLButtonElement>('#btn-submit-tx')!;
                btnSubmit.innerText = 'Actualizar';
                btnSubmit.className = 'btn btn-warning';
                document.querySelector<HTMLButtonElement>('#btn-cancel-edit')!.style.display = 'inline-block';
                
                // Scroll hacia arriba
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
}