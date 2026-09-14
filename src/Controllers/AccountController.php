<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class AccountController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    public function getAllAccounts() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM TBL_CUENTAS WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $cuentas = $stmt->fetchAll();

        echo json_encode(["status" => "success", "data" => $cuentas]);
    }

    public function create() {
        $userId = $this->checkAuth();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name = trim($data['name'] ?? '');
        $balance = $data['balance'] ?? 0;
        $tipoCuentaId = 1; // Por defecto 'Débito/Efectivo' para el MVP

        if (empty($name)) {
            echo json_encode(["status" => "error", "message" => "El nombre es obligatorio"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO TBL_CUENTAS (user_id, tipo_cuenta_id, name, balance) VALUES (:user_id, :tipo, :name, :balance)");
            $stmt->execute([
                ':user_id' => $userId,
                ':tipo' => $tipoCuentaId,
                ':name' => $name,
                ':balance' => $balance
            ]);

            echo json_encode(["status" => "success", "message" => "Cuenta creada"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}