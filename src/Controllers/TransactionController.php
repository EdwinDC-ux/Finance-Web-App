<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class TransactionController {
    public function transfer() {
        // 1. Leer el JSON que manda TypeScript
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $monto = $data['monto'] ?? 0;
        $origen = $data['origen'] ?? null;
        $destino = $data['destino'] ?? null;

        if ($monto <= 0) {
            echo json_encode(["status" => "error", "message" => "Monto inválido"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            
            // 2. Llamar a tu Stored Procedure
            $stmt = $pdo->prepare("CALL sp_transferir_fondos(:monto, :origen, :destino)");
            $stmt->execute([
                ':monto' => $monto,
                ':origen' => $origen,
                ':destino' => $destino
            ]);

            echo json_encode(["status" => "success", "message" => "Transferencia exitosa"]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}