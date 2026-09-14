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
    nombre VARCHAR(50) NOT NULL, -- Ej. 'Alimentos', 'Hogar'
    FOREIGN KEY (user_id) REFERENCES TBL_USUARIOS(id)
);

CREATE TABLE CAT_CATEGORIAS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    tipo_categoria_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL, -- Ej. 'Despensa', 'Renta'
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
    FOREIGN KEY (user_id) REFERENCES TBL_USUARIOS(id),
    FOREIGN KEY (tipo_cuenta_id) REFERENCES CAT_TIPOS_CUENTA(id)
);

CREATE TABLE TBL_TRANSACCIONES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    origin_id INT NULL,
    destination_id INT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
-- 5. STORED PROCEDURE (Actualizado a 3NF)
-- ==========================================
DELIMITER //
CREATE PROCEDURE sp_transferir_fondos(
    IN p_monto DECIMAL(15,2),
    IN p_origen INT,
    IN p_destino INT,
    IN p_categoria INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF p_origen IS NOT NULL THEN
        UPDATE TBL_CUENTAS SET balance = balance - p_monto WHERE id = p_origen;
    END IF;

    IF p_destino IS NOT NULL THEN
        UPDATE TBL_CUENTAS SET balance = balance + p_monto WHERE id = p_destino;
    END IF;

    INSERT INTO TBL_TRANSACCIONES (amount, origin_id, destination_id, category_id) 
    VALUES (p_monto, p_origen, p_destino, p_categoria);

    COMMIT;
END //
DELIMITER ;

-- ==========================================
-- 6. VISTAS (VIEWS)
-- ==========================================

CREATE VIEW VW_DETALLE_TRANSACCIONES AS
SELECT 
    t.id AS transaccion_id,
    t.amount AS monto,
    t.created_at AS fecha,
    DATE_FORMAT(t.created_at, '%Y-%m') AS mes_anio,
    t.origin_id,
    o.name AS cuenta_origen,
    t.destination_id,
    d.name AS cuenta_destino,
    t.category_id,
    c.nombre AS categoria,
    g.nombre AS grupo_categoria,
    tc.nombre AS tipo_categoria,
    -- Truco para saber de quién es la transacción (ya sea por origen o destino)
    COALESCE(o.user_id, d.user_id) AS user_id 
FROM TBL_TRANSACCIONES t
LEFT JOIN TBL_CUENTAS o ON t.origin_id = o.id
LEFT JOIN TBL_CUENTAS d ON t.destination_id = d.id
JOIN CAT_CATEGORIAS c ON t.category_id = c.id
JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
JOIN CAT_TIPOS_CATEGORIA tc ON c.tipo_categoria_id = tc.id;

CREATE VIEW VW_CONTROL_PRESUPUESTOS AS
SELECT 
    g.user_id,
    DATE_FORMAT(pm.budget_month, '%Y-%m') AS mes_presupuesto,
    c.id AS categoria_id,
    c.nombre AS categoria,
    g.nombre AS grupo,
    pm.amount AS limite_presupuesto,
    -- Subconsulta para sumar los gastos reales de ese mes exacto
    COALESCE((
        SELECT SUM(t.amount) 
        FROM TBL_TRANSACCIONES t 
        WHERE t.category_id = c.id 
          AND t.destination_id IS NULL -- Solo salidas de dinero
          AND DATE_FORMAT(t.created_at, '%Y-%m') = DATE_FORMAT(pm.budget_month, '%Y-%m')
    ), 0) AS gastado
FROM CAT_CATEGORIAS c
JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
JOIN TBL_PRESUPUESTOS_MENSUALES pm ON c.id = pm.category_id;