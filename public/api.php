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

// Rutas de Autenticación
$router->post('/api/login', '\App\Controllers\AuthController@login');
$router->post('/api/logout', '\App\Controllers\AuthController@logout');
$router->post('/api/register', '\App\Controllers\AuthController@register');

// Ruta GET (La que ya tenías)
$router->get('/api/accounts', '\App\Controllers\AccountController@getAllAccounts');
// Debajo de tu ruta GET de accounts, añade esta:
$router->post('/api/accounts', '\App\Controllers\AccountController@create');

// NUEVA RUTA POST (Para transferir dinero)
$router->post('/api/transfer', '\App\Controllers\TransactionController@transfer');

// Añade esta línea debajo de tus otras rutas
$router->get('/api/transactions', '\App\Controllers\TransactionController@getHistory');

// 4. Ejecutar el Router
$router->run();