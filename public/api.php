<?php
// Archivo: public/api.php
header('Content-Type: application/json');

// 1. Cargamos el Autoloader de Composer
require_once __DIR__ . '/../vendor/autoload.php';

// 2. Usamos el Namespace
use App\Controllers\AccountController;

try {
    // 3. Instanciamos el controlador y pedimos los datos
    $controller = new AccountController();
    $cuentas = $controller->getAllAccounts();

    echo json_encode([
        "status" => "success",
        "data" => $cuentas
    ]);

} catch (\Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}