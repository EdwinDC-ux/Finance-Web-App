import { type Account, type Transaction } from '../types';

export function buildAccountsTable(accounts: Account[]): string {
  if (accounts.length === 0) return "<p class='text-muted'>No tienes cuentas registradas.</p>";
  let html = `<div class="table-responsive"><table class="data-table"><tr><th>Cuenta</th><th>Tipo</th><th class="text-right">Saldo</th><th class="text-center">Acciones</th></tr>`;
  accounts.forEach(acc => {
    html += `<tr>
      <td>${acc.nombre}</td><td><small class="text-muted">${acc.tipo_nombre || ''}</small></td>
      <td class="text-right fw-bold">$${parseFloat(acc.balance).toLocaleString('es-MX')}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-danger btn-delete-account" data-id="${acc.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}

export function buildHistoryTable(transactions: Transaction[]): string {
  if (transactions.length === 0) return "<p class='text-muted'>No hay movimientos aún.</p>";
  let html = `<div class="table-responsive"><table class="data-table">
    <tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Origen ➔ Destino</th><th class="text-right">Monto</th><th class="text-center">Acciones</th></tr>`;
  transactions.forEach(tx => {
    const origin = tx.origin_name || '<span class="text-success">Externo</span>';
    const dest = tx.dest_name || '<span class="text-danger">Externo</span>';
    const check = tx.is_cleared ? '✅' : '⏳';
    html += `<tr>
      <td><small>${tx.created_at}</small></td>
      <td><strong>${tx.description || '-'}</strong> ${check}</td>
      <td>${tx.category}</td>
      <td><small>${origin} ➔ ${dest}</small></td>
      <td class="text-right text-success fw-bold">$${parseFloat(tx.amount).toLocaleString('es-MX')}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-danger btn-delete-tx" data-id="${tx.id}">🗑️</button>
      </td>
    </tr>`;
  });
  return html + `</table></div>`;
}