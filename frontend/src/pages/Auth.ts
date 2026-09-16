import { showView } from '../ui';
import { validateSession } from '../auth';

// ==========================================
// LOGIN
// ==========================================
export function renderLogin(): string {
    return `
        <div class="auth-card">
            <h2>Iniciar Sesión</h2>
            <form id="login-form">
                <input type="email" id="login-email" class="form-input" placeholder="Correo" required>
                <input type="password" id="login-password" class="form-input" placeholder="Contraseña" required>
                <button type="submit" class="btn btn-primary">Entrar</button>
            </form>
            <p class="mt-3">¿No tienes cuenta? <a href="#" id="btn-go-register">Regístrate aquí</a></p>
        </div>
    `;
}

export function initLogin() {
    const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
    const emailInput = document.querySelector<HTMLInputElement>('#login-email')!;
    const passwordInput = document.querySelector<HTMLInputElement>('#login-password')!;

    // NAVEGACIÓN: Destruye el Login y pinta el Registro
    document.querySelector('#btn-go-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        showView('register'); 
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showView('loading'); // UX: Mostramos que estamos procesando
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });
            
            if (res.ok) {
                validateSession(); // El validador central decide a dónde ir
            } else {
                showView('login'); // Regresamos la vista
                alert('Credenciales incorrectas');
            }
        } catch (error) {
            showView('login');
            alert('Error de conexión');
        }
    });
}

// ==========================================
// REGISTRO
// ==========================================
export function renderRegister(): string {
    return `
        <div class="auth-card">
            <h2>Crear Cuenta</h2>
            <form id="register-form">
                <input type="email" id="register-email" class="form-input" placeholder="Correo" required>
                <input type="password" id="register-password" class="form-input" placeholder="Contraseña" required>
                <button type="submit" class="btn btn-success">Registrarme</button>
            </form>
            <p class="mt-3">¿Ya tienes cuenta? <a href="#" id="btn-go-login">Inicia sesión</a></p>
        </div>
    `;
}

export function initRegister() {
    const registerForm = document.querySelector<HTMLFormElement>('#register-form')!;
    const emailInput = document.querySelector<HTMLInputElement>('#register-email')!;
    const passwordInput = document.querySelector<HTMLInputElement>('#register-password')!;

    // NAVEGACIÓN: Destruye el Registro y pinta el Login
    document.querySelector('#btn-go-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        showView('login'); 
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showView('loading');
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });
            
            const result = await res.json();
            if (result.status === 'success') {
                alert('¡Cuenta creada! Ahora inicia sesión.');
                showView('login'); // Lo mandamos a loguearse
            } else {
                showView('register');
                alert(result.message);
            }
        } catch (error) {
            showView('register');
            alert('Error de conexión');
        }
    });
}