<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class TransactionController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    public function transfer() {
        $userId = $this->checkAuth();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $monto = $data['monto'] ?? 0;
        $categoria = $data['categoria'] ?? null;
        $origen = $data['origen'] ?? null;
        $destino = $data['destino'] ?? null;

        if ($monto <= 0) {
            echo json_encode(["status" => "error", "message" => "Monto inválido"]);
            return;
        }
        if (empty($origen) && empty($destino)) {
            echo json_encode(["status" => "error", "message" => "Selecciona una cuenta"]);
            return;
        }
        if (empty($categoria)) {
            echo json_encode(["status" => "error", "message" => "Selecciona una categoría"]);
            return;
        }
        if ($origen === $destino) {
            echo json_encode(["status" => "error", "message" => "Origen y destino iguales"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            
            if (!empty($origen)) {
                $stmtCheck = $pdo->prepare("SELECT balance FROM TBL_CUENTAS WHERE id = :origen AND user_id = :user_id");
                $stmtCheck->execute([':origen' => $origen, ':user_id' => $userId]);
                $cuentaOrigen = $stmtCheck->fetch();

                if (!$cuentaOrigen || $cuentaOrigen['balance'] < $monto) {
                    echo json_encode(["status" => "error", "message" => "Fondos insuficientes"]);
                    return;
                }
            }
            
            $stmt = $pdo->prepare("CALL sp_transferir_fondos(:monto, :origen, :destino, :categoria)");
            $stmt->execute([
                ':monto' => $monto,
                ':origen' => $origen,
                ':destino' => $destino,
                ':categoria' => $categoria
            ]);

            echo json_encode(["status" => "success", "message" => "Operación exitosa"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getHistory() {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            // USAMOS LA VISTA MAESTRA
            $sql = "SELECT transaccion_id as id, monto as amount, fecha as created_at, 
                           categoria as category, cuenta_origen as origin_name, cuenta_destino as dest_name 
                    FROM VW_DETALLE_TRANSACCIONES 
                    WHERE user_id = :user_id 
                    ORDER BY fecha DESC LIMIT 10";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            $history = $stmt->fetchAll();

            echo json_encode(["status" => "success", "data" => $history]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}