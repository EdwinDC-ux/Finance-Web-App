<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class AccountController {
    
    // El Cadenero
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    // Obtener cuentas (GET)
    public function getAllAccounts() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $cuentas = $stmt->fetchAll();

        echo json_encode(["status" => "success", "data" => $cuentas]);
    }

    // Crear nueva cuenta (POST)
    public function create() {
        $userId = $this->checkAuth();
        
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name = trim($data['name'] ?? '');
        $balance = $data['balance'] ?? 0;

        if (empty($name)) {
            echo json_encode(["status" => "error", "message" => "El nombre de la cuenta es obligatorio"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO accounts (user_id, name, balance) VALUES (:user_id, :name, :balance)");
            $stmt->execute([
                ':user_id' => $userId,
                ':name' => $name,
                ':balance' => $balance
            ]);

            echo json_encode(["status" => "success", "message" => "Cuenta creada exitosamente"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al crear cuenta: " . $e->getMessage()]);
        }
    }
}