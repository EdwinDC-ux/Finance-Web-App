import { type Group } from '../types';
import { buildAccountsTable } from '../components/Tables';

export function renderSettings(): string {
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <h3>🏦 Mis Cuentas</h3>
                    <form id="add-account-form" class="d-flex gap-2 mb-3">
                        <input type="text" id="new-account-name" class="form-input m-0" placeholder="Nombre" required>
                        <select id="new-account-type" class="form-select m-0" required><option value="">Tipo</option></select>
                        <input type="number" id="new-account-balance" class="form-input m-0" placeholder="Saldo" step="0.01" required>
                        <button type="submit" class="btn btn-primary w-auto">Añadir</button>
                    </form>
                    <div id="accounts-container"></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <h3>📁 Crear Grupo</h3>
                    <form id="add-group-form" class="d-flex gap-2">
                        <input type="text" id="new-group-name" class="form-input m-0" placeholder="Nombre del Grupo" required>
                        <button type="submit" class="btn btn-primary w-auto">Crear</button>
                    </form>
                </div>
                <div class="card">
                    <h3>🏷️ Crear Categoría</h3>
                    <form id="add-category-form" class="d-flex gap-2 flex-wrap">
                        <select id="new-category-group" class="form-select m-0 w-auto" required><option value="">Grupo</option></select>
                        <input type="text" id="new-category-name" class="form-input m-0 flex-grow-1" placeholder="Nombre" required>
                        <select id="new-category-type" class="form-select m-0 w-auto" required><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option></select>
                        <input type="number" id="new-category-budget" class="form-input m-0 w-auto" placeholder="Límite $" step="0.01">
                        <button type="submit" class="btn btn-primary w-auto">Añadir</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export function initSettings() {
    const addAccountForm = document.querySelector<HTMLFormElement>('#add-account-form')!;
    const addGroupForm = document.querySelector<HTMLFormElement>('#add-group-form')!;
    const addCategoryForm = document.querySelector<HTMLFormElement>('#add-category-form')!;

    addAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetch('/api/accounts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: document.querySelector<HTMLInputElement>('#new-account-name')!.value, 
                balance: parseFloat(document.querySelector<HTMLInputElement>('#new-account-balance')!.value),
                tipo_cuenta_id: parseInt(document.querySelector<HTMLSelectElement>('#new-account-type')!.value)
            })
        });
        addAccountForm.reset(); loadAccountsData();
    });

    addGroupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetch('/api/groups', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: document.querySelector<HTMLInputElement>('#new-group-name')!.value })
        });
        addGroupForm.reset(); loadGroupsData();
    });

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetch('/api/categories', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: document.querySelector<HTMLInputElement>('#new-category-name')!.value, 
                type: document.querySelector<HTMLSelectElement>('#new-category-type')!.value,
                grupo_id: parseInt(document.querySelector<HTMLSelectElement>('#new-category-group')!.value),
                budget_limit: parseFloat(document.querySelector<HTMLInputElement>('#new-category-budget')!.value) || 0
            })
        });
        addCategoryForm.reset();
    });

    loadAccountsData();
    loadGroupsData();
    loadAccountTypes();
}

async function loadAccountsData() {
    const res = await fetch('/api/accounts'); const result = await res.json();
    if (result.status === 'success') document.querySelector<HTMLDivElement>('#accounts-container')!.innerHTML = buildAccountsTable(result.data);
}

async function loadGroupsData() {
    const res = await fetch('/api/groups'); const result = await res.json();
    if (result.status === 'success') {
        let opts = '<option value="">Grupo</option>';
        result.data.forEach((g: Group) => opts += `<option value="${g.id}">${g.nombre}</option>`);
        document.querySelector<HTMLSelectElement>('#new-category-group')!.innerHTML = opts;
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