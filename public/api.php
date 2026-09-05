<?php
header('Content-Type: application/json');

// ¡EL SECRETO DE DOCKER! El host no es localhost, es el nombre del servicio en el YAML
$host = 'db'; 
$dbname = 'finance_db';
$user = 'app_user';
$pass = 'app_password';

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Hacemos una consulta de prueba
    $stmt = $pdo->query("SELECT * FROM accounts");
    $cuentas = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => $cuentas
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión: " . $e->getMessage()
    ]);
}