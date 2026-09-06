<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class AccountController {
    public function getAllAccounts() {
        session_start();
        
        // EL CADENERO: Si no hay sesión, lo rebotamos
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            return;
        }

        $userId = $_SESSION['user_id'];
        $pdo = Database::getConnection();
        
        // MAGIA MULTI-USUARIO: Solo traemos las cuentas de ESTE usuario
        $stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $cuentas = $stmt->fetchAll();

        echo json_encode(["status" => "success", "data" => $cuentas]);
    }
}