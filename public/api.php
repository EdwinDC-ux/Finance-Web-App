<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$router = new \Bramus\Router\Router();

// Auth
$router->post('/api/login', '\App\Controllers\AuthController@login');
$router->post('/api/register', '\App\Controllers\AuthController@register');
$router->post('/api/logout', '\App\Controllers\AuthController@logout');

// User
$router->get('/api/user', '\App\Controllers\UserController@getProfile');
$router->post('/api/user/fire-target', '\App\Controllers\UserController@updateFireTarget');

// Accounts & Categories
$router->get('/api/accounts', '\App\Controllers\AccountController@getAllAccounts');
$router->post('/api/accounts', '\App\Controllers\AccountController@create');
$router->get('/api/categories', '\App\Controllers\CategoryController@getAllCategories');
$router->post('/api/categories', '\App\Controllers\CategoryController@create');

// Transactions
$router->post('/api/transfer', '\App\Controllers\TransactionController@transfer');
$router->get('/api/transactions', '\App\Controllers\TransactionController@getHistory');

// Stats & BI
$router->get('/api/stats/expenses', '\App\Controllers\StatsController@getExpenses');
$router->get('/api/stats/cashflow', '\App\Controllers\StatsController@getCashFlow');
$router->get('/api/stats/budgets', '\App\Controllers\StatsController@getBudgets');
$router->post('/api/stats/snapshot', '\App\Controllers\StatsController@saveSnapshot');
$router->get('/api/stats/history', '\App\Controllers\StatsController@getNetWorthHistory');

$router->run();