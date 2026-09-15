export function renderLogin(): string {
    return `
        <div class="auth-card">
            <div id="login-section">
                <h2>Iniciar Sesión</h2>
                <form id="login-form">
                    <input type="email" id="login-email" class="form-input" placeholder="Correo" required>
                    <input type="password" id="login-password" class="form-input" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-primary">Entrar</button>
                </form>
                <p class="mt-3">¿No tienes cuenta? <a href="#" id="show-register">Regístrate aquí</a></p>
            </div>
        </div>
    `;
}

export function renderRegister(): string {
    return `
        <div class="auth-card">
            <div id="register-section">
                <h2>Crear Cuenta</h2>
                <form id="register-form">
                    <input type="email" id="register-email" class="form-input" placeholder="Correo" required>
                    <input type="password" id="register-password" class="form-input" placeholder="Contraseña" required>
                    <button type="submit" class="btn btn-success">Registrarme</button>
                </form>
                <p class="mt-3">¿Ya tienes cuenta? <a href="#" id="show-login">Inicia sesión</a></p>
            </div>
        </div>
    `;
}