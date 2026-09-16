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

    public function getTypes() {
        $this->checkAuth();
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM CAT_TIPOS_CUENTA");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    public function getAllAccounts() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT c.*, tc.nombre as tipo_nombre FROM TBL_CUENTAS c JOIN CAT_TIPOS_CUENTA tc ON c.tipo_cuenta_id = tc.id WHERE c.user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    public function create() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $name = trim($data['name'] ?? '');
        $balance = $data['balance'] ?? 0;
        $tipoCuentaId = $data['tipo_cuenta_id'] ?? null;
        $creditLimit = $data['credit_limit'] ?? 0; 

        if (empty($name) || empty($tipoCuentaId)) {
            echo json_encode(["status" => "error", "message" => "Nombre y Tipo son obligatorios"]); return;
        }
        try {
            $pdo = \App\Core\Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO TBL_CUENTAS (user_id, tipo_cuenta_id, name, balance, credit_limit) VALUES (:user_id, :tipo, :name, :balance, :limit)");
            $stmt->execute([
                ':user_id' => $userId, 
                ':tipo' => $tipoCuentaId, 
                ':name' => $name, 
                ':balance' => $balance,
                ':limit' => $creditLimit
            ]);
            echo json_encode(["status" => "success", "message" => "Cuenta creada"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}