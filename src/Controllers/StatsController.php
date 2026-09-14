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
        $mesActual = date('Y-m');
        try {
            $pdo = Database::getConnection();
            // USAMOS LA VISTA
            $sql = "SELECT categoria as category, SUM(monto) as total 
                    FROM VW_DETALLE_TRANSACCIONES 
                    WHERE user_id = :user_id 
                      AND destination_id IS NULL 
                      AND tipo_categoria = 'Gasto'
                      AND mes_anio = :mes
                    GROUP BY categoria";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId, ':mes' => $mesActual]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getCashFlow() {
        $userId = $this->checkAuth();
        $mesActual = date('Y-m');
        try {
            $pdo = Database::getConnection();
            
            $sqlIncome = "SELECT COALESCE(SUM(monto), 0) FROM VW_DETALLE_TRANSACCIONES 
                          WHERE user_id = :uid AND origin_id IS NULL AND tipo_categoria = 'Ingreso' AND mes_anio = :mes";
            $stmtIn = $pdo->prepare($sqlIncome);
            $stmtIn->execute([':uid' => $userId, ':mes' => $mesActual]);
            $income = $stmtIn->fetchColumn();

            $sqlExpense = "SELECT COALESCE(SUM(monto), 0) FROM VW_DETALLE_TRANSACCIONES 
                           WHERE user_id = :uid AND destination_id IS NULL AND tipo_categoria = 'Gasto' AND mes_anio = :mes";
            $stmtEx = $pdo->prepare($sqlExpense);
            $stmtEx->execute([':uid' => $userId, ':mes' => $mesActual]);
            $expense = $stmtEx->fetchColumn();

            echo json_encode(["status" => "success", "data" => ["income" => (float)$income, "expense" => (float)$expense]]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getBudgets() {
        $userId = $this->checkAuth();
        $mesActual = date('Y-m');
        try {
            $pdo = Database::getConnection();
            // USAMOS LA VISTA DE PRESUPUESTOS
            $sql = "SELECT categoria_id as id, categoria as name, limite_presupuesto as budget_limit, gastado as spent 
                    FROM VW_CONTROL_PRESUPUESTOS 
                    WHERE user_id = :user_id AND mes_presupuesto = :mes AND limite_presupuesto > 0";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId, ':mes' => $mesActual]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function saveSnapshot() {
        $userId = $this->checkAuth();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $netWorth = $data['net_worth'] ?? 0;
        $snapshotDate = date('Y-m-01');

        try {
            $pdo = Database::getConnection();
            $sql = "INSERT INTO TBL_HISTORICO_PATRIMONIO (user_id, snapshot_date, net_worth) 
                    VALUES (:user_id, :snapshot_date, :net_worth)
                    ON DUPLICATE KEY UPDATE net_worth = :net_worth";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId, ':snapshot_date' => $snapshotDate, ':net_worth' => $netWorth]);
            echo json_encode(["status" => "success"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getNetWorthHistory() {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            $sql = "SELECT snapshot_date, net_worth FROM TBL_HISTORICO_PATRIMONIO 
                    WHERE user_id = :user_id ORDER BY snapshot_date ASC LIMIT 12";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}