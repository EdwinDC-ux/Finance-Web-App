<?php
namespace App\Controllers;

use App\Core\Database;
use PDO;

class AuthController {
    public function login() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, password_hash FROM TBL_USUARIOS WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(["status" => "success", "message" => "Login exitoso"]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
        }
    }

    public function register() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "message" => "Email inválido"]);
            return;
        }
        if (strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "Mínimo 6 caracteres"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmtCheck = $pdo->prepare("SELECT id FROM TBL_USUARIOS WHERE email = :email");
            $stmtCheck->execute([':email' => $email]);
            if ($stmtCheck->fetch()) {
                echo json_encode(["status" => "error", "message" => "Correo ya registrado"]);
                return;
            }

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO TBL_USUARIOS (email, password_hash) VALUES (:email, :hash)");
            $stmt->execute([':email' => $email, ':hash' => $hash]);

            echo json_encode(["status" => "success", "message" => "Usuario creado"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Sesión cerrada"]);
    }
}