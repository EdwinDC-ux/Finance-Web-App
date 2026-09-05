<?php
// Archivo: src/Core/Database.php
namespace App\Core;

use PDO;
use PDOException;

class Database {
    public static function getConnection() {
        $host = $_ENV['DB_HOST'];
        $dbname = $_ENV['DB_NAME'];
        $user = $_ENV['DB_USER'];
        $pass = $_ENV['DB_PASS'];

        try {
            $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
            return new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (PDOException $e) {
            die(json_encode(["status" => "error", "message" => "DB Error: " . $e->getMessage()]));
        }
    }
}