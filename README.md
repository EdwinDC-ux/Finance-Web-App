# 💰 FinanceSaaS (FIRE Edition) v1.0.0

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4.svg?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)

FinanceSaaS es una plataforma de inteligencia financiera diseñada bajo los principios del movimiento **FIRE (Financial Independence, Retire Early)**. 

A diferencia de los rastreadores de gastos tradicionales, esta aplicación utiliza una arquitectura de **Partida Doble** y presupuestos **Base Cero Dinámicos (YNAB style)** para gestionar el flujo de caja, calcular la tasa de ahorro y proyectar el crecimiento del patrimonio neto.

📖 **[Ver el Manual de Usuario aquí](USER_MANUAL.md)**

---

## 🏗️ Arquitectura y Tech Stack

El proyecto está construido con una arquitectura desacoplada (SPA + REST API) y contenerizado para un despliegue predecible.

* **Infraestructura:** Docker & Docker Compose (Multi-container) con zonas horarias configuradas.
* **Base de Datos:** MySQL 8.0.
  * Normalizada a **3NF** (Tercera Forma Normal).
  * Implementación estricta de **Soft Deletes** (`is_active`) para mantener la integridad referencial.
  * Lógica de negocio delegada a **Stored Procedures** (Transacciones ACID y Reversas).
  * Consultas complejas encapsuladas en **Vistas (Views)**.
* **Backend (API):** PHP 8.2 (Vanilla, Arquitectura MVC, PSR-4 Autoloading, Bramus Router).
* **Frontend (SPA):** TypeScript, Vite, Bootstrap 5, Chart.js.
  * Enrutamiento del lado del cliente (History API).
  * Diseño Mobile-First con Offcanvas Sidebar.

---

## 🚀 Instalación y Entorno de Desarrollo

### 1. Requisitos Previos
* Docker Desktop instalado y corriendo.
* Git instalado.

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/finance-app.git
cd finance-app
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
DB_HOST=db
DB_NAME=finance_db
DB_USER=app_user
DB_PASS=app_password
DB_ROOT_PASS=root_super_secreto
```

### 4. Levantar los Contenedores
```bash
docker-compose up -d
```
*(Nota: MySQL ejecutará automáticamente el archivo `db_init/init.sql` para crear las tablas, vistas y stored procedures).*

### 5. Instalar Dependencias del Frontend
```bash
docker-compose exec frontend npm install
```

### 6. ¡Listo!
* **Frontend (Vite con Hot Reload):** [http://localhost:5173](http://localhost:5173)
* **Backend API (PHP):** [http://localhost:8000/api/](http://localhost:8000/api/)

---

## 📦 Despliegue a Producción (Build)

Para compilar la aplicación y prepararla para un servidor de producción:

1. Ejecuta el build del frontend dentro del contenedor:
```bash
docker-compose exec frontend npm run build
```
2. Vite compilará el TypeScript y generará los archivos estáticos directamente en la carpeta `/public`.
3. La aplicación completa será servida por Apache en el puerto 80: [http://localhost:8000](http://localhost:8000).