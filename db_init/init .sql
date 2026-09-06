-- 1. Tabla de Cuentas
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00
);

-- 2. Tabla de Transacciones (El Libro Mayor)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    origin_id INT NULL,
    destination_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (origin_id) REFERENCES accounts(id),
    FOREIGN KEY (destination_id) REFERENCES accounts(id)
);

-- Datos iniciales
INSERT INTO accounts (name, balance) VALUES ('GBM VWRA', 38000.00);
INSERT INTO accounts (name, balance) VALUES ('Cajita Nu', 9000.00);

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