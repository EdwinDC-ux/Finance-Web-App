import { type Account, type Transaction } from '../types';

export function buildAccountsTable(accounts: Account[]): string {
  if (accounts.length === 0) return "<p class='text-muted'>No tienes cuentas registradas.</p>";

  let html = `<table class="data-table">
    <tr><th>Cuenta</th><th class="text-right">Saldo</th></tr>`;
    
  accounts.forEach(acc => {
    html += `<tr>
      <td>${acc.nombre}</td>
      <td class="text-right fw-bold">$${parseFloat(acc.balance).toLocaleString('es-MX')}</td>
    </tr>`;
  });
  
  return html + `</table>`;
}

export function buildHistoryTable(transactions: Transaction[]): string {
  if (transactions.length === 0) return "<p class='text-muted'>No hay movimientos aún.</p>";

  let html = `<table class="data-table">
    <tr><th>Fecha</th><th>Categoría</th><th>Origen</th><th>Destino</th><th class="text-right">Monto</th></tr>`;
    
  transactions.forEach(tx => {
    const date = new Date(tx.created_at).toLocaleString('es-MX');
    const origin = tx.origin_name || '<span class="text-success">Externo</span>';
    const dest = tx.dest_name || '<span class="text-danger">Externo</span>';
    const cat = tx.category || 'Transferencia';
    
    html += `<tr>
      <td><small>${date}</small></td>
      <td><strong>${cat}</strong></td>
      <td>${origin}</td>
      <td>${dest}</td>
      <td class="text-right text-success">$${parseFloat(tx.amount).toLocaleString('es-MX')}</td>
    </tr>`;
  });
  
  return html + `</table>`;
}