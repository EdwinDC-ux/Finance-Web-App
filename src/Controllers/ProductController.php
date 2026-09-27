<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class ProductController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    // 1. Crear un nuevo producto
    public function createProduct() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $nombre = trim($data['nombre'] ?? '');

        if (empty($nombre)) {
            echo json_encode(["status" => "error", "message" => "El nombre es obligatorio"]); return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO CAT_PRODUCTOS (user_id, nombre) VALUES (:uid, :nombre)");
            $stmt->execute([':uid' => $userId, ':nombre' => $nombre]);
            echo json_encode(["status" => "success", "message" => "Producto añadido al tracker"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // 2. Registrar que abriste un producto nuevo hoy
    public function logCycle() {
        $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $productoId = $data['producto_id'] ?? null;
        $fecha = $data['fecha'] ?? date('Y-m-d');

        if (!$productoId) {
            echo json_encode(["status" => "error", "message" => "Producto inválido"]); return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO TBL_CICLOS_PRODUCTO (producto_id, fecha_inicio) VALUES (:prod, :fecha)");
            $stmt->execute([':prod' => $productoId, ':fecha' => $fecha]);
            echo json_encode(["status" => "success", "message" => "Nuevo ciclo registrado"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // 3. El Motor Matemático: Obtener productos y calcular cuánto comprar al año
    public function getInventoryStats() {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            
            // Traemos el producto, cuántas veces lo ha abierto, la primera y la última fecha
            $sql = "SELECT 
                        p.id, p.nombre,
                        COUNT(c.id) as total_ciclos,
                        MIN(c.fecha_inicio) as primera_fecha,
                        MAX(c.fecha_inicio) as ultima_fecha,
                        DATEDIFF(MAX(c.fecha_inicio), MIN(c.fecha_inicio)) as dias_totales
                    FROM CAT_PRODUCTOS p
                    LEFT JOIN TBL_CICLOS_PRODUCTO c ON p.id = c.producto_id
                    WHERE p.user_id = :uid AND p.is_active = 1
                    GROUP BY p.id, p.nombre";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $userId]);
            $productos = $stmt->fetchAll();

            // Procesamos la matemática en PHP
            $resultados = [];
            foreach ($productos as $p) {
                $promedio_dias = 0;
                $anual_necesario = 0;
                $status = "Faltan datos";

                if ($p['total_ciclos'] > 1) {
                    // Si lo ha abierto 3 veces, hay 2 intervalos de tiempo
                    $intervalos = $p['total_ciclos'] - 1;
                    $promedio_dias = $p['dias_totales'] / $intervalos;
                    $anual_necesario = ceil(365 / $promedio_dias); // Redondeamos hacia arriba
                    $status = "Calculado";
                } elseif ($p['total_ciclos'] == 1) {
                    $status = "En progreso (1er ciclo)";
                }

                $resultados[] = [
                    "id" => $p['id'],
                    "nombre" => $p['nombre'],
                    "total_ciclos" => $p['total_ciclos'],
                    "ultima_fecha" => $p['ultima_fecha'],
                    "promedio_dias" => round($promedio_dias),
                    "anual_necesario" => $anual_necesario,
                    "status" => $status
                ];
            }

            echo json_encode(["status" => "success", "data" => $resultados]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}