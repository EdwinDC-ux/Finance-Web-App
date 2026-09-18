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

    // --- GRUPOS ---
    public function getGroups() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM CAT_GRUPOS_CATEGORIA WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    public function createGroup() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $nombre = trim($data['nombre'] ?? '');

        if (empty($nombre)) {
            echo json_encode(["status" => "error", "message" => "El nombre del grupo es obligatorio"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO CAT_GRUPOS_CATEGORIA (user_id, nombre) VALUES (:uid, :nombre)");
            $stmt->execute([':uid' => $userId, ':nombre' => $nombre]);
            echo json_encode(["status" => "success", "message" => "Grupo creado"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // --- CATEGORÍAS ---
    public function getAllCategories() {
        $userId = $this->checkAuth();
        $pdo = Database::getConnection();
        $sql = "SELECT c.id, c.nombre as name, tc.nombre as type, g.nombre as grupo, c.grupo_id 
                FROM CAT_CATEGORIAS c
                JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
                JOIN CAT_TIPOS_CATEGORIA tc ON c.tipo_categoria_id = tc.id
                WHERE g.user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    public function create() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['name'] ?? '');
        $typeString = ucfirst(strtolower($data['type'] ?? ''));
        $grupoId = $data['grupo_id'] ?? null;
        $budgetLimit = $data['budget_limit'] ?? 0;

        if (empty($name) || empty($typeString) || empty($grupoId)) {
            echo json_encode(["status" => "error", "message" => "Nombre, Tipo y Grupo son obligatorios"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            $stmtTipo = $pdo->prepare("SELECT id FROM CAT_TIPOS_CATEGORIA WHERE nombre = :tipo");
            $stmtTipo->execute([':tipo' => $typeString]);
            $tipoId = $stmtTipo->fetchColumn();

            $stmtCat = $pdo->prepare("INSERT INTO CAT_CATEGORIAS (grupo_id, tipo_categoria_id, nombre) VALUES (:grupo, :tipo, :nombre)");
            $stmtCat->execute([':grupo' => $grupoId, ':tipo' => $tipoId, ':nombre' => $name]);
            $catId = $pdo->lastInsertId();

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

    public function copyLastMonthBudgets() {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            
            $sql = "INSERT INTO TBL_PRESUPUESTOS_MENSUALES (category_id, budget_month, amount)
                    SELECT pm.category_id, DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), pm.amount
                    FROM TBL_PRESUPUESTOS_MENSUALES pm
                    JOIN CAT_CATEGORIAS c ON pm.category_id = c.id
                    JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id
                    WHERE g.user_id = :uid 
                      AND pm.budget_month = DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                    ON DUPLICATE KEY UPDATE amount = pm.amount";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $userId]);

            echo json_encode(["status" => "success", "message" => "Presupuestos clonados con éxito"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function setBudget() {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $categoryId = $data['category_id'] ?? null;
        $amount = $data['amount'] ?? 0;

        if (!$categoryId) {
            echo json_encode(["status" => "error", "message" => "Selecciona una categoría"]); return;
        }

        try {
            $pdo = Database::getConnection();
            
            // Validar que la categoría pertenezca al usuario
            $stmtCheck = $pdo->prepare("SELECT c.id FROM CAT_CATEGORIAS c JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id WHERE c.id = :cat AND g.user_id = :uid");
            $stmtCheck->execute([':cat' => $categoryId, ':uid' => $userId]);
            if (!$stmtCheck->fetch()) {
                echo json_encode(["status" => "error", "message" => "Categoría inválida"]); return;
            }

            // Insertar o Actualizar el presupuesto del mes actual
            $mesActual = date('Y-m-01');
            $sql = "INSERT INTO TBL_PRESUPUESTOS_MENSUALES (category_id, budget_month, amount) 
                    VALUES (:cat, :mes, :monto) 
                    ON DUPLICATE KEY UPDATE amount = :monto";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':cat' => $categoryId, ':mes' => $mesActual, ':monto' => $amount]);

            echo json_encode(["status" => "success", "message" => "Presupuesto actualizado"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function updateGroup($id) {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE CAT_GRUPOS_CATEGORIA SET nombre = :nombre WHERE id = :id AND user_id = :uid");
            $stmt->execute([':nombre' => $data['nombre'], ':id' => $id, ':uid' => $userId]);
            echo json_encode(["status" => "success", "message" => "Grupo actualizado"]);
        } catch (\Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }

    public function deleteGroup($id) {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            // Validar que no tenga categorías activas
            $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM CAT_CATEGORIAS WHERE grupo_id = :id AND is_active = 1");
            $stmtCheck->execute([':id' => $id]);
            if ($stmtCheck->fetchColumn() > 0) {
                echo json_encode(["status" => "error", "message" => "No puedes eliminar un grupo con categorías activas"]); return;
            }
            $stmt = $pdo->prepare("UPDATE CAT_GRUPOS_CATEGORIA SET is_active = 0 WHERE id = :id AND user_id = :uid");
            $stmt->execute([':id' => $id, ':uid' => $userId]);
            echo json_encode(["status" => "success", "message" => "Grupo eliminado"]);
        } catch (\Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }

    public function updateCategory($id) {
        $userId = $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $pdo = Database::getConnection();
            $stmtTipo = $pdo->prepare("SELECT id FROM CAT_TIPOS_CATEGORIA WHERE nombre = :tipo");
            $stmtTipo->execute([':tipo' => ucfirst(strtolower($data['type']))]);
            $tipoId = $stmtTipo->fetchColumn();

            $stmt = $pdo->prepare("UPDATE CAT_CATEGORIAS c JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id 
                                   SET c.nombre = :nombre, c.grupo_id = :grupo, c.tipo_categoria_id = :tipo 
                                   WHERE c.id = :id AND g.user_id = :uid");
            $stmt->execute([':nombre' => $data['name'], ':grupo' => $data['grupo_id'], ':tipo' => $tipoId, ':id' => $id, ':uid' => $userId]);
            echo json_encode(["status" => "success", "message" => "Categoría actualizada"]);
        } catch (\Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }

    public function deleteCategory($id) {
        $userId = $this->checkAuth();
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE CAT_CATEGORIAS c JOIN CAT_GRUPOS_CATEGORIA g ON c.grupo_id = g.id 
                                   SET c.is_active = 0 WHERE c.id = :id AND g.user_id = :uid");
            $stmt->execute([':id' => $id, ':uid' => $userId]);
            echo json_encode(["status" => "success", "message" => "Categoría eliminada"]);
        } catch (\Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }
}