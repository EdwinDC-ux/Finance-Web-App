<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class TransactionController {
    public function transfer() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $monto = $data['monto'] ?? 0;
        $origen = $data['origen'] ?? null;
        $destino = $data['destino'] ?? null;

        // VALIDACIÓN 1: El monto debe ser mayor a cero
        if ($monto <= 0) {
            echo json_encode(["status" => "error", "message" => "El monto debe ser mayor a $0.00"]);
            return;
        }

        // VALIDACIÓN 2: No pueden ser ambos nulos (Transacción fantasma)
        if (empty($origen) && empty($destino)) {
            echo json_encode(["status" => "error", "message" => "Debes seleccionar al menos una cuenta de origen o destino"]);
            return;
        }

        // VALIDACIÓN 3: No puedes transferir a la misma cuenta
        if ($origen === $destino) {
            echo json_encode(["status" => "error", "message" => "El origen y destino no pueden ser la misma cuenta"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            
            // VALIDACIÓN 4: Prevenir saldos negativos (Si hay cuenta de origen)
            if (!empty($origen)) {
                $stmtCheck = $pdo->prepare("SELECT balance FROM accounts WHERE id = :origen");
                $stmtCheck->execute([':origen' => $origen]);
                $cuentaOrigen = $stmtCheck->fetch();

                if (!$cuentaOrigen || $cuentaOrigen['balance'] < $monto) {
                    echo json_encode(["status" => "error", "message" => "Fondos insuficientes en la cuenta de origen"]);
                    return;
                }
            }
            
            // Si pasa todos los cadeneros, llamamos al Stored Procedure
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
        try {
            $pdo = \App\Core\Database::getConnection();
            
            // Usamos LEFT JOIN para traer los nombres de las cuentas
            $sql = "SELECT t.id, t.amount, t.created_at, 
                           o.name AS origin_name, 
                           d.name AS dest_name
                    FROM transactions t
                    LEFT JOIN accounts o ON t.origin_id = o.id
                    LEFT JOIN accounts d ON t.destination_id = d.id
                    ORDER BY t.created_at DESC 
                    LIMIT 10";
                    
            $stmt = $pdo->query($sql);
            $history = $stmt->fetchAll();

            echo json_encode(["status" => "success", "data" => $history]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}