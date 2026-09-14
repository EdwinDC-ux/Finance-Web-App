<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class CategoryController {
    private function checkAuth() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "No autorizado"]);
            exit;
        }
        return $_SESSION['user_id'];
    }

    public function getAllCategories() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        
        // Hacemos JOIN para devolver la estructura plana que espera el Frontend
        $sql = "SELECT c.id, c.nombre as name, tc.nombre as type 
                FROM CAT_CATEGORIAS c
                JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
                JOIN CAT_TIPOS_CATEGORIA tc ON c.tipo_categoria_id = tc.id
                WHERE g.user_id = :user_id";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $categorias = $stmt->fetchAll();

        echo json_encode(["status" => "success", "data" => $categorias]);
    }

    public function create() {
        $userId = $this->checkAuth();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name = trim($data['name'] ?? '');
        $typeString = ucfirst(strtolower($data['type'] ?? '')); // 'Ingreso' o 'Gasto'
        $budgetLimit = $data['budget_limit'] ?? 0;

        if (empty($name) || empty($typeString)) {
            echo json_encode(["status" => "error", "message" => "Nombre y tipo obligatorios"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            // 1. Obtener ID del Tipo de Categoría
            $stmtTipo = $pdo->prepare("SELECT id FROM CAT_TIPOS_CATEGORIA WHERE nombre = :tipo");
            $stmtTipo->execute([':tipo' => $typeString]);
            $tipoId = $stmtTipo->fetchColumn();

            // 2. Obtener o crear Grupo "General" para el usuario
            $stmtGrupo = $pdo->prepare("SELECT id FROM CAT_GRUPOS_CATEGORIA WHERE user_id = :uid AND nombre = 'General'");
            $stmtGrupo->execute([':uid' => $userId]);
            $grupoId = $stmtGrupo->fetchColumn();

            if (!$grupoId) {
                $stmtInsertGrupo = $pdo->prepare("INSERT INTO CAT_GRUPOS_CATEGORIA (user_id, nombre) VALUES (:uid, 'General')");
                $stmtInsertGrupo->execute([':uid' => $userId]);
                $grupoId = $pdo->lastInsertId();
            }

            // 3. Insertar Categoría
            $stmtCat = $pdo->prepare("INSERT INTO CAT_CATEGORIAS (grupo_id, tipo_categoria_id, nombre) VALUES (:grupo, :tipo, :nombre)");
            $stmtCat->execute([':grupo' => $grupoId, ':tipo' => $tipoId, ':nombre' => $name]);
            $catId = $pdo->lastInsertId();

            // 4. Insertar Presupuesto del Mes Actual (Modelo YNAB)
            if ($budgetLimit > 0) {
                $mesActual = date('Y-m-01');
                $stmtBudget = $pdo->prepare("INSERT INTO TBL_PRESUPUESTOS_MENSUALES (category_id, budget_month, amount) VALUES (:cat, :mes, :monto)");
                $stmtBudget->execute([':cat' => $catId, ':mes' => $mesActual, ':monto' => $budgetLimit]);
            }

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Categoría creada"]);

        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}