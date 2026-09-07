<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class UserController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    public function getProfile() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT email, fire_target FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        echo json_encode(["status" => "success", "data" => $user]);
    }

    public function updateFireTarget() {
        $userId = $this->checkAuth();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $target = $data['fire_target'] ?? 0;

        if ($target < 0) {
            echo json_encode(["status" => "error", "message" => "La meta no puede ser negativa"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE users SET fire_target = :target WHERE id = :id");
            $stmt->execute([':target' => $target, ':id' => $userId]);

            echo json_encode(["status" => "success", "message" => "Meta FIRE actualizada"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}