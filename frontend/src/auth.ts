import { showView } from './ui';
import { loadAccounts } from './dashboard';

const loginSection = document.querySelector<HTMLDivElement>('#login-section')!;
const registerSection = document.querySelector<HTMLDivElement>('#register-section')!;
const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
const emailInput = document.querySelector<HTMLInputElement>('#login-email')!;
const passwordInput = document.querySelector<HTMLInputElement>('#login-password')!;
const registerForm = document.querySelector<HTMLFormElement>('#register-form')!;
const registerEmail = document.querySelector<HTMLInputElement>('#register-email')!;
const registerPassword = document.querySelector<HTMLInputElement>('#register-password')!;
const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn')!;

export function initAuth() {
    document.querySelector('#show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    document.querySelector('#show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showView('loading');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                loadAccounts(); 
            } else {
                showView('auth');
                alert(result.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            showView('auth');
            alert('Error de conexión');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: registerEmail.value, password: registerPassword.value })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('¡Cuenta creada! Ahora inicia sesión.');
                registerForm.reset();
                registerSection.style.display = 'none';
                loginSection.style.display = 'block';
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        showView('auth');
        loginForm.reset();
    });
}