export function renderHelp(): string {
    return `
        <div class="row">
            <div class="col-12 mb-3">
                <div class="card bg-primary text-white p-4">
                    <h2 class="m-0">📖 Manual de Usuario</h2>
                    <p class="m-0 mt-2 opacity-75">Guía rápida para dominar tu imperio financiero y alcanzar la libertad (FIRE).</p>
                </div>
            </div>

            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <h4 class="text-primary">📱 1. Modo App en tu Celular</h4>
                    <p class="text-muted small">Instala Vértice Capital para usarla en pantalla completa sin navegador:</p>
                    <ul>
                        <li><strong>Android:</strong> Toca los 3 puntos en Chrome/Brave y elige <em>"Instalar aplicación"</em>.</li>
                        <li><strong>iPhone:</strong> Toca el botón compartir en Safari y elige <em>"Agregar al inicio"</em>.</li>
                    </ul>
                </div>
            </div>

            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <h4 class="text-primary">⚙️ 2. Estructura Inicial</h4>
                    <p class="text-muted small">Antes de registrar dinero, ve a <strong>Configuración</strong>:</p>
                    <ol>
                        <li>Crea <strong>Grupos</strong> (ej. <em>Alimentación, Vivienda</em>).</li>
                        <li>Crea <strong>Categorías</strong> dentro de esos grupos y define si son <em>Ingreso</em> o <em>Gasto</em>.</li>
                        <li>Da de alta tus <strong>Cuentas</strong> bancarias, tarjetas o efectivo con su saldo real.</li>
                    </ol>
                </div>
            </div>

            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <h4 class="text-primary">🚦 3. Presupuesto Mensual</h4>
                    <p class="text-muted small">El día 1 de cada mes en la pestaña <strong>Presupuestos</strong>:</p>
                    <ul>
                        <li>Asigna límites de gasto a tus categorías.</li>
                        <li>Usa el botón <strong>"Copiar Mes Anterior"</strong> para clonar tu planeación en 1 segundo.</li>
                        <li>Monitorea las barras: Verde (OK), Amarillo (>80%), Rojo (>95%).</li>
                    </ul>
                </div>
            </div>

            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <h4 class="text-primary">📜 4. Movimientos (Partida Doble)</h4>
                    <p class="text-muted small">En la pestaña <strong>Movimientos</strong>:</p>
                    <ul>
                        <li><strong>Ingreso:</strong> Origen: <em>Externo</em> ➔ Destino: <em>Tu Cuenta</em>.</li>
                        <li><strong>Gasto:</strong> Origen: <em>Tu Cuenta</em> ➔ Destino: <em>Externo</em>.</li>
                        <li><strong>Inversión/Traspaso:</strong> Origen: <em>Débito</em> ➔ Destino: <em>Inversión</em>.</li>
                    </ul>
                    <div class="alert alert-info py-2 small m-0">
                        <strong>Check (⏳/✅):</strong> Deja las compras con tarjeta en ⏳. Cuando muevas el dinero a tu cajita de ahorro, cámbialo a ✅.
                    </div>
                </div>
            </div>

            <div class="col-12 mb-3">
                <div class="card">
                    <h4 class="text-primary">📦 5. Inventario Predictivo (Compras Anuales)</h4>
                    <p class="text-muted small">Diseñado para ganarle a la inflación comprando tus artículos de uso diario por volumen en enero:</p>
                    <ol>
                        <li>Añade productos de consumo continuo (ej. <em>Shampoo, Desodorante</em>).</li>
                        <li>Cada vez que abras un envase nuevo, toca <strong>"🔄 Abrí uno nuevo"</strong> y pon la fecha.</li>
                        <li>A partir de la segunda apertura, la app calculará cuántos días te dura cada envase y te dirá <strong>cuántas unidades comprar al año</strong>.</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

export function initHelp(): void {
    // Vista estática de solo lectura
}