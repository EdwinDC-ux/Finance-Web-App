// Archivo: frontend/src/pages/Inventory.ts
import { type ProductStat } from '../types';
import { showToast } from '../components/Toast';
import { showDatePrompt } from '../components/Modal';

export function renderInventory(): string {
    return `
        <div class="row">
            <div class="col-md-4">
                <div class="card mb-3">
                    <h3 style="margin-top: 0;">📦 Nuevo Producto</h3>
                    <p class="text-muted small">Añade un producto de uso continuo (Ej. Shampoo, Desodorante, Pasta dental).</p>
                    <form id="add-product-form">
                        <input type="text" id="new-product-name" class="form-input" placeholder="Nombre del producto" required>
                        <button type="submit" class="btn btn-primary w-100">Añadir al Tracker</button>
                    </form>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <h3 style="margin-top: 0;">🛒 Proyección de Compras Anuales</h3>
                    <p class="text-muted small">Registra cada vez que abras un producto nuevo. La app calculará cuántos necesitas comprar a inicio de año para ganarle a la inflación.</p>
                    <div id="inventory-container"><p class="text-muted">Cargando...</p></div>
                </div>
            </div>
        </div>
    `;
}

export function initInventory() {
    const form = document.querySelector<HTMLFormElement>('#add-product-form')!;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.querySelector<HTMLInputElement>('#new-product-name')!.value;
        try {
            const res = await fetch('/api/inventory/products', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            });
            const result = await res.json();
            if (result.status === 'success') {
                showToast(result.message, 'success');
                form.reset();
                loadInventoryStats();
            } else {
                showToast(result.message, 'error');
            }
        } catch (e) { showToast('Error de conexión', 'error'); }
    });

    loadInventoryStats();
}

async function loadInventoryStats() {
    try {
        const res = await fetch('/api/inventory/stats');
        if (res.status === 401) return;
        const result = await res.json();
        
        if (result.status === 'success') {
            const container = document.querySelector<HTMLDivElement>('#inventory-container')!;
            if (result.data.length === 0) {
                container.innerHTML = "<p class='text-muted'>No hay productos en el tracker.</p>";
                return;
            }

            let html = `<div class="table-responsive"><table class="data-table" style="white-space: nowrap;">
                <tr><th>Producto</th><th>Estado</th><th>Última Apertura</th><th class="text-center">Promedio (Días)</th><th class="text-center">Compra Anual</th><th class="text-center">Acción</th></tr>`;
            
            result.data.forEach((p: ProductStat) => {
                const date = p.ultima_fecha ? p.ultima_fecha.split('-').reverse().join('/') : '-';
                const anual = p.anual_necesario > 0 ? `<span class="text-success fw-bold">${p.anual_necesario} uds.</span>` : '-';
                
                let badgeClass = 'bg-secondary';
                if (p.status === 'Calculado') badgeClass = 'bg-success';
                if (p.status.includes('progreso')) badgeClass = 'bg-warning text-dark';
                
                html += `<tr>
                    <td><strong>${p.nombre}</strong></td>
                    <td><span class="badge ${badgeClass}">${p.status}</span></td>
                    <td><small>${date}</small></td>
                    <td class="text-center">${p.promedio_dias > 0 ? p.promedio_dias : '-'}</td>
                    <td class="text-center" style="font-size: 1.1rem;">${anual}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-warning btn-log-cycle" data-id="${p.id}" style="width:auto; padding: 5px 10px; background-color: #f39c12;">🔄 Abrí uno nuevo</button>
                    </td>
                </tr>`;
            });
            html += '</table></div>';
            container.innerHTML = html;

            // Evento para registrar que abriste un producto
            document.querySelectorAll('.btn-log-cycle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = (e.target as HTMLButtonElement).getAttribute('data-id');
                    const today = new Date().toISOString().split('T')[0];
                    
                    // LA MAGIA: Usamos nuestro nuevo Modal de Bootstrap
                    showDatePrompt("Registrar Nuevo Ciclo", today, async (fecha) => {
                        try {
                            const res = await fetch('/api/inventory/cycles', {
                                method: 'POST', 
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ producto_id: parseInt(id!), fecha: fecha })
                            });
                            const result = await res.json();
                            if (result.status === 'success') {
                                showToast('Ciclo registrado', 'success');
                                loadInventoryStats();
                            } else {
                                showToast(result.message, 'error');
                            }
                        } catch (error) {
                            showToast('Error de conexión', 'error');
                        }
                    });
                });
            });
        }
    } catch (e) { console.error(e); }
}