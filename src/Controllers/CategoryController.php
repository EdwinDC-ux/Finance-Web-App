<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class CategoryController {
    
    // Función auxiliar para el cadenero
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit; // Detiene la ejecución inmediatamente
        }
        return $_SESSION['user_id'];
    }

    // Obtener categorías (GET)
    public function getAllCategories() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $categorias = $stmt->fetchAll();

        echo json_encode(["status" => "success", "data" => $categorias]);
    }

    // Crear nueva categoría (POST)
    public function create() {
        $userId = $this->checkAuth();
        
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name = trim($data['name'] ?? '');
        $type = $data['type'] ?? '';

        if (empty($name)) {
            echo json_encode(["status" => "error", "message" => "El nombre de la cuenta es obligatorio"]);
            return;
        }

        if (empty($type)) {
            echo json_encode(["status" => "error", "message" => "El tipo de la categoría es obligatorio"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO categories (user_id, name, type) VALUES (:user_id, :name, :type)");
            $stmt->execute([
                ':user_id' => $userId,
                ':name' => $name,
                ':type' => $type
            ]);

            echo json_encode(["status" => "success", "message" => "Categoría creada exitosamente"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al crear categoría: " . $e->getMessage()]);
        }
    }
}