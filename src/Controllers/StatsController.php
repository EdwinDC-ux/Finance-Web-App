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

    public function getCashFlow() {
        $userId = $this->checkAuth();
        
        try {
            $pdo = Database::getConnection();
            
            // 1. Calcular Ingresos del Mes (Origen es NULL, Destino es una cuenta del usuario)
            $sqlIncome = "SELECT COALESCE(SUM(t.amount), 0) as total_income 
                          FROM transactions t
                          JOIN accounts d ON t.destination_id = d.id
                          WHERE d.user_id = :user_id 
                            AND t.origin_id IS NULL 
                            AND MONTH(t.created_at) = MONTH(CURRENT_DATE())
                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE())";
            $stmtIn = $pdo->prepare($sqlIncome);
            $stmtIn->execute([':user_id' => $userId]);
            $income = $stmtIn->fetchColumn();

            // 2. Calcular Gastos del Mes (Origen es cuenta del usuario, Destino es NULL)
            $sqlExpense = "SELECT COALESCE(SUM(t.amount), 0) as total_expense 
                           FROM transactions t
                           JOIN accounts o ON t.origin_id = o.id
                           WHERE o.user_id = :user_id 
                             AND t.destination_id IS NULL 
                             AND MONTH(t.created_at) = MONTH(CURRENT_DATE())
                             AND YEAR(t.created_at) = YEAR(CURRENT_DATE())";
            $stmtEx = $pdo->prepare($sqlExpense);
            $stmtEx->execute([':user_id' => $userId]);
            $expense = $stmtEx->fetchColumn();

            echo json_encode([
                "status" => "success", 
                "data" => [
                    "income" => (float)$income,
                    "expense" => (float)$expense
                ]
            ]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}