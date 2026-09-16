import { showView } from '../ui';
import { validateSession } from '../auth';
import { showToast } from '../components/Toast';

export function renderLogin(): string {
    return `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h2>Iniciar Sesión</h2>
                <form id="login-form">
                    <input type="email" id="login-email" class="form-input" placeholder="Correo" required>
                    <input type="password" id="login-password" class="form-input" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-primary w-100">Entrar</button>
                </form>
                <p class="mt-3">¿No tienes cuenta? <a href="#" id="btn-go-register">Regístrate aquí</a></p>
            </div>
        </div>
    `;
}

export function initLogin() {
    document.querySelector('#btn-go-register')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showView('register'); 
    });
    
    document.querySelector('#login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. LEER LOS DATOS PRIMERO (Antes de destruir el HTML)
        const email = document.querySelector<HTMLInputElement>('#login-email')!.value;
        const password = document.querySelector<HTMLInputElement>('#login-password')!.value;
        
        // 2. AHORA SÍ, MOSTRAR PANTALLA DE CARGA
        showView('loading', false);
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                validateSession();
            } else { 
                showView('login', false); 
                showToast("Credenciales incorrectas", 'error');
            }
        } catch (error) { 
            showView('login', false); 
            alert('Error de conexión'); 
        }
    });
}

export function renderRegister(): string {
    return `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h2>Crear Cuenta</h2>
                <form id="register-form">
                    <input type="email" id="register-email" class="form-input" placeholder="Correo" required>
                    <input type="password" id="register-password" class="form-input" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-success w-100">Registrarme</button>
                </form>
                <p class="mt-3">¿Ya tienes cuenta? <a href="#" id="btn-go-login">Inicia sesión</a></p>
            </div>
        </div>
    `;
}

export function initRegister() {
    document.querySelector('#btn-go-login')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showView('login'); 
    });
    
    document.querySelector('#register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. LEER LOS DATOS PRIMERO
        const email = document.querySelector<HTMLInputElement>('#register-email')!.value;
        const password = document.querySelector<HTMLInputElement>('#register-password')!.value;
        
        // 2. AHORA SÍ, MOSTRAR PANTALLA DE CARGA
        showView('loading', false);
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await res.json();
            if (result.status === 'success') { 
                alert('¡Cuenta creada!'); 
                showView('login'); 
            } else { 
                showView('register', false); 
                showToast(result.message, 'error');
            }
        } catch (error) { 
            showView('register', false); 
            alert('Error de conexión'); 
        }
    });
}