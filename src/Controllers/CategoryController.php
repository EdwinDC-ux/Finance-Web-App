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
        $sql = "SELECT c.id, c.nombre as name, tc.nombre as type, g.nombre as grupo 
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
}