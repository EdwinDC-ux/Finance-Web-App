<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class StatsController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    public function getExpenses() {
        $userId = $this->checkAuth();
        
        try {
            $pdo = Database::getConnection();
            
            // MAGIA SQL: Sumamos los montos, agrupados por categoría.
            // Un "Gasto" es cuando el origen es una cuenta tuya, y el destino es NULL (Externo).
            $sql = "SELECT c.name as category, SUM(t.amount) as total 
                    FROM transactions t
                    JOIN accounts a ON t.origin_id = a.id
                    JOIN categories c ON t.category_id = c.id
                    WHERE a.user_id = :user_id 
                      AND t.destination_id IS NULL 
                      AND MONTH(t.created_at) = MONTH(CURRENT_DATE())
                      AND YEAR(t.created_at) = YEAR(CURRENT_DATE())
                    GROUP BY c.id";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            $stats = $stmt->fetchAll();

            echo json_encode(["status" => "success", "data" => $stats]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}