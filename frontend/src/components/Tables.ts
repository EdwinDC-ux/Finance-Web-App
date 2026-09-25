import { type Account, type Transaction } from '../types';

export function buildAccountsTable(accounts: Account[]): string {
  if (accounts.length === 0) return "<p class='text-muted'>No tienes cuentas registradas.</p>";
  let html = `<div class="table-responsive"><table class="data-table"><tr><th>Cuenta</th><th>Tipo</th><th class="text-right">Saldo</th><th class="text-center">Acciones</th></tr>`;
  accounts.forEach(acc => {
    // NOTA: Guardamos el tipo_cuenta_id en el botón de editar
    html += `<tr>
      <td>${acc.nombre}</td><td><small class="text-muted">${acc.tipo_nombre || ''}</small></td>
      <td class="text-right fw-bold">$${parseFloat(acc.balance).toLocaleString('es-MX')}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning btn-edit-account" data-id="${acc.id}" data-name="${acc.nombre}" data-type="${(acc as any).tipo_cuenta_id || ''}">✏️</button>
        <button class="btn btn-sm btn-danger btn-delete-account" data-id="${acc.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}

export function buildHistoryTable(transactions: Transaction[]): string {
  if (transactions.length === 0) return "<p class='text-muted'>No hay movimientos aún.</p>";
  let html = `<div class="table-responsive"><table class="data-table">
    <tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Origen ➔ Destino</th><th>Periodo</th><th class="text-right">Monto</th><th class="text-center">Acciones</th></tr>`;
  transactions.forEach(tx => {
    const origin = tx.origin_name || '<span class="text-success">Externo</span>';
    const dest = tx.dest_name || '<span class="text-danger">Externo</span>';
    const check = tx.is_cleared 
        ? `<button class="btn-toggle-clear" data-id="${tx.id}" style="background:none; border:none; cursor:pointer;" title="Marcar como pendiente">✅</button>` 
        : `<button class="btn-toggle-clear" data-id="${tx.id}" style="background:none; border:none; cursor:pointer;" title="Marcar como liquidado">⏳</button>`;
    const period = tx.payment_period || '-';
    
    // Inyectamos todos los IDs para poder reconstruir el formulario
    html += `<tr>
      <td><small>${tx.created_at}</small></td>
      <td><strong>${tx.description || '-'}</strong> ${check}</td>
      <td>${tx.category}</td>
      <td><small>${origin} ➔ ${dest}</small></td>
      <td><small class="text-muted">${period}</small></td>
      <td class="text-right text-success fw-bold">$${parseFloat(tx.amount).toLocaleString('es-MX')}</td>
      <td class="text-center" style="min-width: 90px;">
        <button class="btn btn-sm btn-warning btn-edit-tx" 
            data-id="${tx.id}" data-amount="${tx.amount}" data-date="${tx.created_at}" 
            data-desc="${tx.description || ''}" data-cat="${(tx as any).category_id}" 
            data-origin="${(tx as any).origin_id || ''}" data-dest="${(tx as any).destination_id || ''}" 
            data-cleared="${tx.is_cleared}" data-period="${tx.payment_period || ''}">✏️</button>
        <button class="btn btn-sm btn-danger btn-delete-tx" data-id="${tx.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}

export function buildGroupsTable(groups: any[]): string {
  if (groups.length === 0) return "<p class='text-muted'>No hay grupos registrados.</p>";
  let html = `<div class="table-responsive"><table class="data-table">
    <tr><th>Grupo</th><th class="text-center" style="width: 100px;">Acciones</th></tr>`;
  groups.forEach(g => {
    html += `<tr>
      <td>${g.nombre}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning btn-edit-group" data-id="${g.id}" data-name="${g.nombre}">✏️</button>
        <button class="btn btn-sm btn-danger btn-delete-group" data-id="${g.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}

export function buildCategoriesTable(categories: any[]): string {
  if (categories.length === 0) return "<p class='text-muted'>No hay categorías registradas.</p>";
  let html = `<div class="table-responsive"><table class="data-table">
    <tr><th>Categoría</th><th>Grupo</th><th>Tipo</th><th class="text-center" style="width: 100px;">Acciones</th></tr>`;
  categories.forEach(c => {
    const typeColor = c.type === 'Ingreso' ? 'text-success' : 'text-danger';
    html += `<tr>
      <td>${c.name}</td>
      <td><small class="text-muted">${c.grupo}</small></td>
      <td class="${typeColor} fw-bold"><small>${c.type}</small></td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning btn-edit-category" data-id="${c.id}" data-name="${c.name}" data-group="${c.grupo_id}" data-type="${c.type.toLowerCase()}">✏️</button>
        <button class="btn btn-sm btn-danger btn-delete-category" data-id="${c.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}