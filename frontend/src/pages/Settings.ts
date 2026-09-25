// Archivo: frontend/src/pages/Settings.ts
import { type Group } from '../types';
import { buildAccountsTable, buildGroupsTable, buildCategoriesTable } from '../components/Tables';
import { showToast } from '../components/Toast';
import { showConfirm, showPrompt } from '../components/Modal';

let currentEditAccountId: string | null = null;
let currentEditCategoryId: string | null = null;

export function renderSettings(): string {
    return `
        <div class="row">
            <!-- COLUMNA IZQUIERDA: CUENTAS -->
            <div class="col-md-6">
                <div class="card">
                    <h3 id="title-account">🏦 Mis Cuentas</h3>
                    <form id="add-account-form" class="d-flex gap-2 mb-3 flex-wrap">
                        <input type="text" id="new-account-name" class="form-input m-0" placeholder="Nombre" required style="flex: 1; min-width: 150px;">
                        <select id="new-account-type" class="form-select m-0 w-auto" required><option value="">Tipo</option></select>
                        <input type="number" id="new-account-balance" class="form-input m-0 w-auto" placeholder="Saldo" step="0.01" required>
                        <input type="number" id="new-account-limit" class="form-input m-0 w-auto" placeholder="Límite Crédito" step="0.01" style="display: none;">
                        <button type="submit" id="btn-submit-account" class="btn btn-primary w-auto">Añadir</button>
                        <button type="button" id="btn-cancel-account" class="btn btn-secondary w-auto" style="display:none;">Cancelar</button>
                    </form>
                    <div id="accounts-container">Cargando...</div>
                </div>
            </div>

            <!-- COLUMNA DERECHA: GRUPOS Y CATEGORÍAS -->
            <div class="col-md-6">
                <!-- GRUPOS -->
                <div class="card mb-3">
                    <h3>📁 Grupos de Categorías</h3>
                    <form id="add-group-form" class="d-flex gap-2 mb-3">
                        <input type="text" id="new-group-name" class="form-input m-0" placeholder="Nuevo Grupo (Ej. Hogar)" required>
                        <button type="submit" class="btn btn-primary w-auto">Crear</button>
                    </form>
                    <div id="groups-container">Cargando...</div>
                </div>

                <!-- CATEGORÍAS -->
                <div class="card">
                    <h3 id="title-category">🏷️ Categorías</h3>
                    <form id="add-category-form" class="d-flex gap-2 flex-wrap mb-3">
                        <select id="new-category-group" class="form-select m-0 w-auto" required><option value="">Grupo</option></select>
                        <input type="text" id="new-category-name" class="form-input m-0 flex-grow-1" placeholder="Nombre" required>
                        <select id="new-category-type" class="form-select m-0 w-auto" required>
                            <option value="ingreso">Ingreso</option>
                            <option value="gasto">Gasto</option>
                        </select>
                        <input type="number" id="new-category-budget" class="form-input m-0 w-auto" placeholder="Límite Inicial $" step="0.01">
                        <button type="submit" id="btn-submit-category" class="btn btn-primary w-auto" style="background: #8e44ad;">Añadir</button>
                        <button type="button" id="btn-cancel-category" class="btn btn-secondary w-auto" style="display:none;">Cancelar</button>
                    </form>
                    <div id="categories-container">Cargando...</div>
                </div>
            </div>
        </div>
    `;
}

export function initSettings() {
    // Referencias Cuentas
    const formAcc = document.querySelector<HTMLFormElement>('#add-account-form')!;
    const typeAcc = document.querySelector<HTMLSelectElement>('#new-account-type')!;
    const limitAcc = document.querySelector<HTMLInputElement>('#new-account-limit')!;
    const btnCancelAcc = document.querySelector<HTMLButtonElement>('#btn-cancel-account')!;
    
    // Referencias Categorías
    const formCat = document.querySelector<HTMLFormElement>('#add-category-form')!;
    const btnCancelCat = document.querySelector<HTMLButtonElement>('#btn-cancel-category')!;
    const budgetCat = document.querySelector<HTMLInputElement>('#new-category-budget')!;

    // Lógica visual para Límite de Crédito
    typeAcc.addEventListener('change', () => {
        if (typeAcc.options[typeAcc.selectedIndex].text.includes('Crédito')) {
            limitAcc.style.display = 'block'; limitAcc.required = true;
        } else {
            limitAcc.style.display = 'none'; limitAcc.required = false; limitAcc.value = '';
        }
    });

    // --- CANCELAR EDICIONES ---
    btnCancelAcc.addEventListener('click', () => {
        currentEditAccountId = null; formAcc.reset();
        document.querySelector<HTMLHeadingElement>('#title-account')!.innerText = '🏦 Mis Cuentas';
        document.querySelector<HTMLButtonElement>('#btn-submit-account')!.innerText = 'Añadir';
        document.querySelector<HTMLButtonElement>('#btn-submit-account')!.className = 'btn btn-primary w-auto';
        btnCancelAcc.style.display = 'none';
        limitAcc.style.display = 'none';
        document.querySelector<HTMLInputElement>('#new-account-balance')!.disabled = false; // Reactivamos saldo
    });

    btnCancelCat.addEventListener('click', () => {
        currentEditCategoryId = null; formCat.reset();
        document.querySelector<HTMLHeadingElement>('#title-category')!.innerText = '🏷️ Categorías';
        document.querySelector<HTMLButtonElement>('#btn-submit-category')!.innerText = 'Añadir';
        document.querySelector<HTMLButtonElement>('#btn-submit-category')!.className = 'btn btn-primary w-auto';
        document.querySelector<HTMLButtonElement>('#btn-submit-category')!.style.background = '#8e44ad';
        btnCancelCat.style.display = 'none';
        budgetCat.style.display = 'block'; // Mostramos el límite inicial de nuevo
    });

    // --- SUBMITS (POST / PUT) ---
    formAcc.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.querySelector<HTMLInputElement>('#new-account-name')!.value,
            balance: parseFloat(document.querySelector<HTMLInputElement>('#new-account-balance')!.value),
            tipo_cuenta_id: parseInt(typeAcc.value),
            credit_limit: parseFloat(limitAcc.value) || 0
        };
        const url = currentEditAccountId ? `/api/accounts/${currentEditAccountId}` : '/api/accounts';
        const method = currentEditAccountId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (result.status === 'success') { showToast(result.message, 'success'); btnCancelAcc.click(); loadAccountsData(); } 
            else { showToast(result.message, 'error'); }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    document.querySelector<HTMLFormElement>('#add-group-form')!.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('#new-group-name')!;
        try {
            const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: input.value }) });
            const result = await res.json();
            if (result.status === 'success') { showToast(result.message, 'success'); input.value = ''; loadGroupsData(); } 
            else { showToast(result.message, 'error'); }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    formCat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.querySelector<HTMLInputElement>('#new-category-name')!.value,
            type: document.querySelector<HTMLSelectElement>('#new-category-type')!.value,
            grupo_id: parseInt(document.querySelector<HTMLSelectElement>('#new-category-group')!.value),
            budget_limit: parseFloat(budgetCat.value) || 0
        };
        const url = currentEditCategoryId ? `/api/categories/${currentEditCategoryId}` : '/api/categories';
        const method = currentEditCategoryId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (result.status === 'success') { showToast(result.message, 'success'); btnCancelCat.click(); loadCategoriesData(); } 
            else { showToast(result.message, 'error'); }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    // Carga inicial
    loadAccountTypes();
    loadAccountsData();
    loadGroupsData();
    loadCategoriesData();
}

// --- FUNCIONES DE CARGA Y EVENTOS DE TABLA ---

async function loadAccountsData() {
    const res = await fetch('/api/accounts'); const result = await res.json();
    if (result.status === 'success') {
        document.querySelector<HTMLDivElement>('#accounts-container')!.innerHTML = buildAccountsTable(result.data);
        
        // EDITAR CUENTA
        document.querySelectorAll('.btn-edit-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                currentEditAccountId = target.getAttribute('data-id');
                document.querySelector<HTMLInputElement>('#new-account-name')!.value = target.getAttribute('data-name')!;
                const typeSelect = document.querySelector<HTMLSelectElement>('#new-account-type')!;
                typeSelect.value = target.getAttribute('data-type')!;
                typeSelect.dispatchEvent(new Event('change')); // Dispara la lógica del límite de crédito
                
                // Bloqueamos el saldo (no se puede editar el saldo directamente por partida doble)
                document.querySelector<HTMLInputElement>('#new-account-balance')!.disabled = true;
                
                document.querySelector<HTMLHeadingElement>('#title-account')!.innerText = '✏️ Editar Cuenta';
                const btnSubmit = document.querySelector<HTMLButtonElement>('#btn-submit-account')!;
                btnSubmit.innerText = 'Actualizar'; btnSubmit.className = 'btn btn-warning w-auto';
                document.querySelector<HTMLButtonElement>('#btn-cancel-account')!.style.display = 'inline-block';
            });
        });

        // ELIMINAR CUENTA
        document.querySelectorAll('.btn-delete-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                showConfirm('Eliminar Cuenta', '¿Estás seguro? Solo se puede eliminar si el saldo es $0.00.', async () => {
                    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.status === 'success') { showToast(result.message, 'success'); loadAccountsData(); } 
                    else { showToast(result.message, 'error'); }
                });
            });
        });
    }
}

async function loadGroupsData() {
    const res = await fetch('/api/groups'); const result = await res.json();
    if (result.status === 'success') {
        // Llenar Select
        let opts = '<option value="">Grupo</option>';
        result.data.forEach((g: Group) => opts += `<option value="${g.id}">${g.nombre}</option>`);
        document.querySelector<HTMLSelectElement>('#new-category-group')!.innerHTML = opts;
        
        // Llenar Tabla
        document.querySelector<HTMLDivElement>('#groups-container')!.innerHTML = buildGroupsTable(result.data);

        // EDITAR GRUPO (Con Prompt)
        document.querySelectorAll('.btn-edit-group').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const id = target.getAttribute('data-id');
                const oldName = target.getAttribute('data-name')!;
                showPrompt('Renombrar Grupo', oldName, async (newName) => {
                    const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: newName }) });
                    const result = await res.json();
                    if (result.status === 'success') { showToast(result.message, 'success'); loadGroupsData(); loadCategoriesData(); } 
                    else { showToast(result.message, 'error'); }
                });
            });
        });

        // ELIMINAR GRUPO
        document.querySelectorAll('.btn-delete-group').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                showConfirm('Eliminar Grupo', '¿Estás seguro? No debe tener categorías activas.', async () => {
                    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.status === 'success') { showToast(result.message, 'success'); loadGroupsData(); } 
                    else { showToast(result.message, 'error'); }
                });
            });
        });
    }
}

async function loadCategoriesData() {
    const res = await fetch('/api/categories'); const result = await res.json();
    if (result.status === 'success') {
        document.querySelector<HTMLDivElement>('#categories-container')!.innerHTML = buildCategoriesTable(result.data);

        // EDITAR CATEGORÍA
        document.querySelectorAll('.btn-edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                currentEditCategoryId = target.getAttribute('data-id');
                document.querySelector<HTMLInputElement>('#new-category-name')!.value = target.getAttribute('data-name')!;
                document.querySelector<HTMLSelectElement>('#new-category-group')!.value = target.getAttribute('data-group')!;
                document.querySelector<HTMLSelectElement>('#new-category-type')!.value = target.getAttribute('data-type')!;
                
                // Ocultamos el límite de presupuesto porque eso se edita en la pestaña "Presupuestos"
                document.querySelector<HTMLInputElement>('#new-category-budget')!.style.display = 'none';

                document.querySelector<HTMLHeadingElement>('#title-category')!.innerText = '✏️ Editar Categoría';
                const btnSubmit = document.querySelector<HTMLButtonElement>('#btn-submit-category')!;
                btnSubmit.innerText = 'Actualizar'; btnSubmit.className = 'btn btn-warning w-auto'; btnSubmit.style.background = '';
                document.querySelector<HTMLButtonElement>('#btn-cancel-category')!.style.display = 'inline-block';
            });
        });

        // ELIMINAR CATEGORÍA
        document.querySelectorAll('.btn-delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                showConfirm('Eliminar Categoría', '¿Estás seguro? Se ocultará para futuros movimientos.', async () => {
                    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.status === 'success') { showToast(result.message, 'success'); loadCategoriesData(); } 
                    else { showToast(result.message, 'error'); }
                });
            });
        });
    }
}

async function loadAccountTypes() {
    const res = await fetch('/api/account-types'); const result = await res.json();
    if (result.status === 'success') {
        let opts = '<option value="">Tipo</option>';
        result.data.forEach((t: any) => opts += `<option value="${t.id}">${t.nombre}</option>`);
        document.querySelector<HTMLSelectElement>('#new-account-type')!.innerHTML = opts;
    }
}