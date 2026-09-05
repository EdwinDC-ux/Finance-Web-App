<?php
// Archivo: src/Controllers/AccountController.php
namespace App\Controllers;

use PDO;
use PDOException;

class AccountController {
    private $pdo;

    public function __construct() {
        // En un proyecto real, estas credenciales irán en un archivo .env
        $host = 'db'; 
        $dbname = 'finance_db';
        $user = 'app_user';
        $pass = 'app_password';

        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        $this->pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }

    public function getAllAccounts() {
        $stmt = $this->pdo->query("SELECT * FROM accounts");
        return $stmt->fetchAll();
    }
}