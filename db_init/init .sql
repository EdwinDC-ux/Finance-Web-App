-- 1. Tabla de Usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fire_target DECIMAL(15,2) DEFAULT 0.00, -- NUEVA COLUMNA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Cuentas (Ahora amarrada a un usuario)
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Tabla de Transacciones (El Libro Mayor)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    origin_id INT NULL,
    destination_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id INT NULL,
    FOREIGN KEY (origin_id) REFERENCES accounts(id),
    FOREIGN KEY (destination_id) REFERENCES accounts(id)
);

-- 4. Tabla de categorias
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- DATOS DUMMY PARA PRUEBAS
-- El password_hash es '123456' encriptado con BCRYPT
INSERT INTO users (email, password_hash) VALUES ('edwin@fire.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Le asignamos las cuentas al usuario 1 (Edwin)
INSERT INTO accounts (user_id, name, balance) VALUES (1, 'GBM VWRA', 38000.00);
INSERT INTO accounts (user_id, name, balance) VALUES (1, 'Cajita Nu', 9000.00);

-- 3. EL STORED PROCEDURE MAESTRO (Partida Doble)
DELIMITER //
CREATE PROCEDURE sp_transferir_fondos(
    IN p_monto DECIMAL(15,2),
    IN p_origen INT,
    IN p_destino INT
)
BEGIN
    -- Si hay un error, MySQL cancela todo automáticamente
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Restamos del origen (Si no es NULL)
    IF p_origen IS NOT NULL THEN
        UPDATE accounts SET balance = balance - p_monto WHERE id = p_origen;
    END IF;

    -- Sumamos al destino (Si no es NULL)
    IF p_destino IS NOT NULL THEN
        UPDATE accounts SET balance = balance + p_monto WHERE id = p_destino;
    END IF;

    -- Registramos el movimiento histórico
    INSERT INTO transactions (amount, origin_id, destination_id) 
    VALUES (p_monto, p_origen, p_destino);

    COMMIT;
END //
DELIMITER ;