<?php
namespace App\Controllers;
use App\Core\Database;
use PDO;

class TransactionController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) { http_response_code(401); echo json_encode(["status" => "error"]); exit; }
        return $_SESSION['user_id'];
    }

    public function transfer() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);

        $monto = $data['monto'] ?? 0;
        $categoria = $data['categoria'] ?? null;
        $origen = $data['origen'] ?? null;
        $destino = $data['destino'] ?? null;
        $fecha = $data['fecha'] ?? date('Y-m-d');
        $descripcion = $data['descripcion'] ?? null;
        $cleared = $data['is_cleared'] ?? 1;
        $periodo = $data['payment_period'] ?? null;

        if ($monto <= 0) { echo json_encode(["status" => "error", "message" => "Monto inválido"]); return; }
        if (empty($origen) && empty($destino)) { echo json_encode(["status" => "error", "message" => "Selecciona una cuenta"]); return; }
        if (empty($categoria)) { echo json_encode(["status" => "error", "message" => "Selecciona una categoría"]); return; }
        if ($origen === $destino) { echo json_encode(["status" => "error", "message" => "Origen y destino iguales"]); return; }

        try {
            $pdo = Database::getConnection();
            // Validar fondos o límite de crédito si hay cuenta de origen
            if (!empty($origen)) {
                // CORRECCIÓN: Usamos 'nombre' y traemos el tipo y el límite
                $stmtCheck = $pdo->prepare("SELECT balance, tipo_cuenta_id, credit_limit FROM TBL_CUENTAS WHERE id = :origen AND user_id = :user_id");
                $stmtCheck->execute([':origen' => $origen, ':user_id' => $userId]);
                $cuentaOrigen = $stmtCheck->fetch();

                if (!$cuentaOrigen) {
                    echo json_encode(["status" => "error", "message" => "Cuenta inválida"]);
                    return;
                }

                // Lógica para Tarjetas de Crédito (Asumiendo que el ID 2 es Crédito)
                if ($cuentaOrigen['tipo_cuenta_id'] == 2) {
                    // La deuda es el valor absoluto del balance (ej. si balance es -500, la deuda es 500)
                    $deudaActual = abs($cuentaOrigen['balance']);
                    if (($deudaActual + $monto) > $cuentaOrigen['credit_limit']) {
                        echo json_encode(["status" => "error", "message" => "Límite de crédito excedido"]);
                        return;
                    }
                } 
                // Lógica para Débito/Inversión
                else {
                    if ($cuentaOrigen['balance'] < $monto) {
                        echo json_encode(["status" => "error", "message" => "Fondos insuficientes en la cuenta"]);
                        return;
                    }
                }
            }
            
            $stmt = $pdo->prepare("CALL sp_transferir_fondos(:monto, :fecha, :origen, :destino, :categoria, :desc, :cleared, :periodo)");
            $stmt->execute([
                ':monto' => $monto, ':fecha' => $fecha, ':origen' => $origen, ':destino' => $destino,
                ':categoria' => $categoria, ':desc' => $descripcion, ':cleared' => $cleared, ':periodo' => $periodo
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
            $sql = "SELECT transaccion_id as id, monto as amount, fecha as created_at, 
                           categoria as category, cuenta_origen as origin_name, cuenta_destino as dest_name,
                           descripcion as description, conciliado as is_cleared, periodo_pago as payment_period
                    FROM VW_DETALLE_TRANSACCIONES 
                    WHERE user_id = :user_id ORDER BY fecha DESC, transaccion_id DESC LIMIT 15";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}