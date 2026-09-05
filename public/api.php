<?php
// Archivo: public/index.php

require_once __DIR__ . '/../vendor/autoload.php';

// 1. Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// 2. Inicializar el Router
$router = new \Bramus\Router\Router();

// 3. Definir las Rutas (Endpoints)
$router->get('/', function() {
    echo "Bienvenido a la API de FinanceApp";
});

// Ruta RESTful para obtener cuentas
$router->get('/api/accounts', '\App\Controllers\AccountController@getAllAccounts');

// 4. Ejecutar el Router
$router->run();