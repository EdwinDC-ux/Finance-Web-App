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
        $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        // Verificamos si el usuario existe y la contraseña coincide con el Hash
        if ($user && password_verify($password, $user['password_hash'])) {
            // Iniciamos sesión segura
            session_start();
            $_SESSION['user_id'] = $user['id'];

            echo json_encode(["status" => "success", "message" => "Login exitoso"]);
        } else {
            http_response_code(401); // Código HTTP de No Autorizado
            echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Sesión cerrada"]);
    }

    public function register() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Validaciones básicas
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "message" => "Email inválido"]);
            return;
        }
        if (strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "La contraseña debe tener al menos 6 caracteres"]);
            return;
        }

        try {
            $pdo = Database::getConnection();
            
            // 1. Verificar si el correo ya existe
            $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $stmtCheck->execute([':email' => $email]);
            if ($stmtCheck->fetch()) {
                echo json_encode(["status" => "error", "message" => "Este correo ya está registrado"]);
                return;
            }

            // 2. LA MAGIA DE BCRYPT (PHP lo hace por ti, olvida CryptoJS)
            $hash = password_hash($password, PASSWORD_BCRYPT);

            // 3. Insertar el nuevo usuario
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (:email, :hash)");
            $stmt->execute([
                ':email' => $email,
                ':hash' => $hash
            ]);

            echo json_encode(["status" => "success", "message" => "Usuario creado exitosamente. Ya puedes iniciar sesión."]);

        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }
}