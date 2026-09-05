<?php
// Archivo: src/Controllers/AccountController.php
namespace App\Controllers;

use App\Core\Database;

class AccountController {
    public function getAllAccounts() {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM accounts");
        $cuentas = $stmt->fetchAll();

        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "data" => $cuentas
        ]);
    }
}