export function renderLoader(): string {
  return `
    <div class="d-flex flex-column justify-content-center align-items-center" style="height: 100vh; background: var(--bg-body);">
      <img src="/favicon.svg" width="64" height="64" alt="Vértice Capital" class="mb-3">
      <div class="spinner-border text-primary mb-2" role="status" style="width: 2.5rem; height: 2.5rem;"></div>
      <h4 class="fw-bold m-0" style="color: var(--text-main);">Vértice Capital</h4>
      <p class="text-muted small mt-1">Cargando tu patrimonio...</p>
    </div>
  `;
}