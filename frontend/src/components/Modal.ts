// Archivo: frontend/src/components/Modal.ts
import * as bootstrap from 'bootstrap';

export function showConfirm(title: string, message: string, onConfirm: () => void) {
    const modalId = 'modal-' + Date.now();
    const html = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body"><p class="m-0">${message}</p></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="${modalId}-btn">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const modalEl = document.getElementById(modalId)!;
    const modal = new bootstrap.Modal(modalEl);
    
    document.getElementById(`${modalId}-btn`)!.addEventListener('click', () => {
        modal.hide();
        onConfirm();
    });

    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    modal.show();
}

export function showPrompt(title: string, defaultValue: string, onConfirm: (value: string) => void) {
    const modalId = 'modal-' + Date.now();
    const html = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="${modalId}-input" class="form-control" value="${defaultValue}">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="${modalId}-btn">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const modalEl = document.getElementById(modalId)!;
    const inputEl = document.getElementById(`${modalId}-input`) as HTMLInputElement;
    const modal = new bootstrap.Modal(modalEl);
    
    document.getElementById(`${modalId}-btn`)!.addEventListener('click', () => {
        const val = inputEl.value.trim();
        if (val) { modal.hide(); onConfirm(val); }
    });

    modalEl.addEventListener('shown.bs.modal', () => inputEl.focus());
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    modal.show();
}