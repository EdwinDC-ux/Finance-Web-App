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
}