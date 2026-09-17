SET NAMES utf8mb4;
-- ==========================================
-- 1. CATÁLOGOS UNIVERSALES (Diccionarios del Sistema)
-- ==========================================
CREATE TABLE CAT_TIPOS_CUENTA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO CAT_TIPOS_CUENTA (nombre) VALUES ('Débito/Efectivo'), ('Crédito'), ('Inversión');

CREATE TABLE CAT_TIPOS_CATEGORIA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO CAT_TIPOS_CATEGORIA (nombre) VALUES ('Ingreso'), ('Gasto');

-- ==========================================
-- 2. TABLAS CORE (Usuarios)
-- ==========================================
CREATE TABLE TBL_USUARIOS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fire_target DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. CATÁLOGOS DEL USUARIO
-- ==========================================
CREATE TABLE CAT_GRUPOS_CATEGORIA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES TBL_USUARIOS(id)
);

CREATE TABLE CAT_CATEGORIAS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    tipo_categoria_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (grupo_id) REFERENCES CAT_GRUPOS_CATEGORIA(id),
    FOREIGN KEY (tipo_categoria_id) REFERENCES CAT_TIPOS_CATEGORIA(id)
);

-- ==========================================
-- 3.5 TABLA DE PRESUPUESTOS MENSUALES (El Modelo YNAB)
-- ==========================================
CREATE TABLE TBL_PRESUPUESTOS_MENSUALES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    budget_month DATE NOT NULL, -- Siempre será el día 1 del mes (Ej. '2026-09-01')
    amount DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (category_id) REFERENCES CAT_CATEGORIAS(id),
    UNIQUE KEY unique_month_cat (category_id, budget_month) -- Evita duplicar el presupuesto de la misma categoría en el mismo mes
);

-- ==========================================
-- 4. TABLAS TRANSACCIONALES
-- ==========================================
CREATE TABLE TBL_CUENTAS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo_cuenta_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES TBL_USUARIOS(id),
    FOREIGN KEY (tipo_cuenta_id) REFERENCES CAT_TIPOS_CUENTA(id)
);

CREATE TABLE TBL_TRANSACCIONES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    origin_id INT NULL,
    destination_id INT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NULL,
    is_cleared BOOLEAN DEFAULT 1,
    payment_period VARCHAR(7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (origin_id) REFERENCES TBL_CUENTAS(id),
    FOREIGN KEY (destination_id) REFERENCES TBL_CUENTAS(id),
    FOREIGN KEY (category_id) REFERENCES CAT_CATEGORIAS(id)
);

CREATE TABLE TBL_HISTORICO_PATRIMONIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    snapshot_date DATE NOT NULL,
    net_worth DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES TBL_USUARIOS(id),
    UNIQUE KEY unique_user_month (user_id, snapshot_date)
);


-- ==========================================
-- 5. VISTAS (VIEWS)
-- ==========================================

CREATE VIEW VW_DETALLE_TRANSACCIONES AS
SELECT 
    t.id AS transaccion_id, t.amount AS monto, t.transaction_date AS fecha,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS mes_anio,
    t.origin_id, o.nombre AS cuenta_origen, t.destination_id, d.nombre AS cuenta_destino,
    t.category_id, c.nombre AS categoria, g.nombre AS grupo_categoria, tc.nombre AS tipo_categoria,
    t.description AS descripcion, t.is_cleared AS conciliado, t.payment_period AS periodo_pago,
    COALESCE(o.user_id, d.user_id) AS user_id 
FROM TBL_TRANSACCIONES t
LEFT JOIN TBL_CUENTAS o ON t.origin_id = o.id
LEFT JOIN TBL_CUENTAS d ON t.destination_id = d.id
JOIN CAT_CATEGORIAS c ON t.category_id = c.id
JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
JOIN CAT_TIPOS_CATEGORIA tc ON c.tipo_categoria_id = tc.id
WHERE t.is_active = 1;

CREATE VIEW VW_CONTROL_PRESUPUESTOS AS
SELECT 
    g.user_id, DATE_FORMAT(pm.budget_month, '%Y-%m') AS mes_presupuesto,
    c.id AS categoria_id, c.nombre AS categoria, g.nombre AS grupo, pm.amount AS limite_presupuesto,
    COALESCE((
        SELECT SUM(t.amount) FROM TBL_TRANSACCIONES t 
        WHERE t.category_id = c.id AND t.destination_id IS NULL AND t.is_active = 1
            AND DATE_FORMAT(t.transaction_date, '%Y-%m') = DATE_FORMAT(pm.budget_month, '%Y-%m')
    ), 0) AS gastado
FROM CAT_CATEGORIAS c
JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
JOIN CAT_TIPOS_CATEGORIA tc ON c.tipo_categoria_id = tc.id
JOIN TBL_PRESUPUESTOS_MENSUALES pm ON c.id = pm.category_id
WHERE tc.nombre = 'Gasto' 
    AND c.is_active = 1
    AND g.is_active = 1;

-- ==========================================
-- 6. STORED PROCEDURE (Actualizado a 3NF)
-- ==========================================
DROP PROCEDURE IF EXISTS sp_transferir_fondos;
DELIMITER //
CREATE PROCEDURE sp_transferir_fondos(
    IN p_monto DECIMAL(15,2), IN p_fecha DATE, IN p_origen INT, IN p_destino INT,
    IN p_categoria INT, IN p_descripcion VARCHAR(255), IN p_cleared BOOLEAN, IN p_periodo VARCHAR(7)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;
    IF p_origen IS NOT NULL THEN UPDATE TBL_CUENTAS SET balance = balance - p_monto WHERE id = p_origen; END IF;
    IF p_destino IS NOT NULL THEN UPDATE TBL_CUENTAS SET balance = balance + p_monto WHERE id = p_destino; END IF;
    
    INSERT INTO TBL_TRANSACCIONES (amount, transaction_date, origin_id, destination_id, category_id, description, is_cleared, payment_period) 
    VALUES (p_monto, p_fecha, p_origen, p_destino, p_categoria, p_descripcion, p_cleared, p_periodo);
    COMMIT;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_reversar_transaccion(
    IN p_transaccion_id INT
)
BEGIN
    DECLARE v_monto DECIMAL(15,2);
    DECLARE v_origen INT;
    DECLARE v_destino INT;
    DECLARE v_is_active BOOLEAN;

    -- Si hay error, abortamos
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 1. Leemos los datos originales de la transacción
    SELECT amount, origin_id, destination_id, is_active 
    INTO v_monto, v_origen, v_destino, v_is_active
    FROM TBL_TRANSACCIONES WHERE id = p_transaccion_id;

    -- 2. Solo procedemos si la transacción existe y está activa
    IF v_is_active = 1 THEN
        START TRANSACTION;

        -- 3. Reversamos el Origen (Le sumamos lo que le habíamos restado)
        IF v_origen IS NOT NULL THEN
            UPDATE TBL_CUENTAS SET balance = balance + v_monto WHERE id = v_origen;
        END IF;

        -- 4. Reversamos el Destino (Le restamos lo que le habíamos sumado)
        IF v_destino IS NOT NULL THEN
            UPDATE TBL_CUENTAS SET balance = balance - v_monto WHERE id = v_destino;
        END IF;

        -- 5. Aplicamos el Soft Delete
        UPDATE TBL_TRANSACCIONES SET is_active = 0 WHERE id = p_transaccion_id;

        COMMIT;
    END IF;
END //
DELIMITER ;