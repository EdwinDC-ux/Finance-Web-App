<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class TransactionController {
    
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

    public function transfer() {
        $userId = $this->checkAuth(); // Protegido

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $monto = $data['monto'] ?? 0;
        $origen = $data['origen'] ?? null;
        $destino = $data['destino'] ?? null;

        if ($monto <= 0) {
            echo json_encode(["status" => "error", "message" => "El monto debe ser mayor a $0.00"]);
            return;
        }

        if (empty($origen) && empty($destino)) {
            echo json_encode(["status" => "error", "message" => "Selecciona al menos una cuenta"]);
            return;
        }

        if ($origen === $destino) {
            echo json_encode(["status" => "error", "message" => "Origen y destino no pueden ser iguales"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            
            // Validar fondos si hay cuenta de origen
            if (!empty($origen)) {
                $stmtCheck = $pdo->prepare("SELECT balance FROM accounts WHERE id = :origen AND user_id = :user_id");
                $stmtCheck->execute([':origen' => $origen, ':user_id' => $userId]);
                $cuentaOrigen = $stmtCheck->fetch();

                if (!$cuentaOrigen || $cuentaOrigen['balance'] < $monto) {
                    echo json_encode(["status" => "error", "message" => "Fondos insuficientes o cuenta inválida"]);
                    return;
                }
            }
            
            $stmt = $pdo->prepare("CALL sp_transferir_fondos(:monto, :origen, :destino)");
            $stmt->execute([
                ':monto' => $monto,
                ':origen' => $origen,
                ':destino' => $destino
            ]);

            echo json_encode(["status" => "success", "message" => "Operación exitosa"]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }

    public function getHistory() {
        $userId = $this->checkAuth(); // Protegido

        try {
            $pdo = Database::getConnection();
            
            // Solo traemos transacciones donde el origen o el destino pertenezcan a este usuario
            $sql = "SELECT t.id, t.amount, t.created_at, 
                           o.name AS origin_name, 
                           d.name AS dest_name
                    FROM transactions t
                    LEFT JOIN accounts o ON t.origin_id = o.id
                    LEFT JOIN accounts d ON t.destination_id = d.id
                    WHERE (o.user_id = :user_id OR d.user_id = :user_id)
                    ORDER BY t.created_at DESC 
                    LIMIT 10";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            $history = $stmt->fetchAll();

            echo json_encode(["status" => "success", "data" => $history]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}