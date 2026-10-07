# 💰 Vértice Capital (FIRE Edition) v1.0.2

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4.svg?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Zero_Trust-F38020.svg?logo=cloudflare)

**Vértice Capital** es una plataforma web SaaS de inteligencia financiera diseñada bajo los principios del movimiento **FIRE (Financial Independence, Retire Early)**. 

A diferencia de los gestores de gastos tradicionales, esta aplicación implementa un motor estricto de **Partida Doble** y presupuestos **Base Cero Dinámicos (filosofía YNAB)** para auditar el flujo de efectivo, automatizar fondos de amortización (provisiones), calcular la tasa de ahorro real y proyectar el crecimiento del patrimonio neto hacia la libertad financiera.

📖 **[Consultar el Manual de Usuario aquí](USER_MANUAL.md)**

---

## 🏗️ Arquitectura y Pila Tecnológica

El sistema utiliza una arquitectura completamente desacoplada (Frontend SPA estático + Backend REST API sin estado):

* **Infraestructura:** VPS en la nube (OVHcloud) orquestado con Docker y Docker Compose.
* **Seguridad de Red:** Conexión perimetral sin puertos de entrada abiertos mediante **Cloudflare Tunnel (Zero Trust)** y certificados SSL administrados en el borde bajo dominio con HSTS forzado (`.app`).
* **Base de Datos:** MySQL 8.0 normalizada a **Tercera Forma Normal (3NF)**.
  * Implementación transversal de **Soft Deletes** (`is_active`) para integridad referencial histórica.
  * Lógica transaccional delegada al motor mediante **Stored Procedures** ACID (`sp_transferir_fondos`, `sp_reversar_transaccion`).
  * Consultas analíticas y de presupuestos optimizadas en **Vistas SQL** (`VW_DETALLE_TRANSACCIONES`, `VW_CONTROL_PRESUPUESTOS`).
* **Backend:** PHP 8.2 en contenedor Apache.
  * Arquitectura MVC / API First orientada a controladores.
  * Enrutador ligero RESTful (Bramus Router) y autocarga PSR-4 con Composer.
  * Variables de entorno leídas de forma segura vía `Dotenv`.
* **Frontend:** Single Page Application (SPA) modular construida con TypeScript Vanilla y empaquetada con **Vite**.
  * Enrutamiento del lado del cliente basado en la API de History (`pushState`/`popstate`).
  * Sistema de diseño responsivo basado en Bootstrap 5 (Layout con Sidebar Offcanvas y Design Tokens en CSS).
  * Visualización analítica de datos mediante **Chart.js** (gráficas de dona y líneas temporales).

---

## 🚀 Entorno de Desarrollo Local

Sigue estos pasos para ejecutar el proyecto en tu máquina de desarrollo con recarga en vivo (Hot Module Replacement):

### 1. Requisitos Previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y activo.
* Git instalado.

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Finance-Web-App.git
cd Finance-Web-App
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
DB_HOST=db
DB_NAME=finance_db
DB_USER=app_user
DB_PASS=app_password
DB_ROOT_PASS=root_super_secreto
```

### 4. Iniciar los Contenedores de Desarrollo
```bash
docker compose up -d
```
*(MySQL ejecutará automáticamente el script inicial `db_init/init.sql` durante el primer arranque).*

### 5. Instalar Dependencias del Frontend
```bash
docker compose exec frontend npm install
```

### 6. Puntos de Acceso Local
* **Frontend SPA (Vite Dev Server):** [http://localhost:5173](http://localhost:5173)
* **Backend API (Apache/PHP):** [http://localhost:8000/api/](http://localhost:8000/api/)

---

## 📦 Despliegue en Producción (Cloud VPS)

La versión de producción utiliza una compilación multi-etapa (**Docker Multi-Stage Build**) que ejecuta Node temporalmente para compilar TypeScript/CSS, desecha las herramientas de desarrollo y monta los artefactos estáticos dentro de un contenedor optimizado de Apache/PHP.

### Pasos para Despliegue:

1. **Construir y levantar servicios productivos:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
2. **Restaurar base de datos productiva (si aplica):**
   ```bash
   docker compose -f docker-compose.prod.yml exec -T db mysql -u root -p${DB_ROOT_PASS} finance_db < backup.sql
   ```
3. **Conectar el túnel seguro de Cloudflare:**
   ```bash
   docker run -d --network host --restart=always cloudflare/cloudflared:latest tunnel --no-autoupdate run --token TU_TOKEN_DE_CLOUDFLARE
   ```

---

## 🛡️ Seguridad y Buenas Prácticas (v1.0.2)

* **Zero Open Inbound Ports:** En producción, el servicio web de Apache escucha exclusivamente en la interfaz local (`127.0.0.1:80`), impidiendo el acceso directo a la IP pública del VPS y canalizando el 100% del tráfico por el túnel cifrado de Cloudflare.
* **Firewall Perimetral (UFW):** Política estricta de denegación de tráfico entrante a nivel de sistema operativo en Linux, permitiendo únicamente el puerto administrativo SSH.
* **Protección contra Fuerza Bruta:** Monitoreo activo de conexiones no autorizadas e intentos fallidos de autenticación en el puerto 22 gestionado por **Fail2ban**.
* **Cifrado de Credenciales:** Autenticación protegida con hashes generados mediante el algoritmo nativo `BCRYPT`.
* **Aislamiento Multi-Tenant:** Toda consulta de lectura y escritura valida la identidad de sesión del usuario en sesión (`user_id`).
* **Privacidad de Dominio:** Datos personales ocultos mediante WHOIS Redaction y firmas criptográficas anti-suplantación activas vía DNSSEC.