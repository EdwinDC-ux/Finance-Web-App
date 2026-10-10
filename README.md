# 💰 Vértice Capital (FIRE Edition) v1.1.0

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-success.svg?logo=pwa)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4.svg?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Zero_Trust-F38020.svg?logo=cloudflare)

**Vértice Capital** es una plataforma web SaaS de inteligencia financiera diseñada bajo los principios del movimiento **FIRE (Financial Independence, Retire Early)**. 

Implementa un motor estricto de **Partida Doble**, presupuestos **Base Cero Dinámicos (YNAB style)** y un módulo de **Inventario Predictivo Just-In-Time (JIT)** para mitigar la inflación mediante compras anuales en volumen.

📖 **[Consultar el Manual de Usuario aquí](USER_MANUAL.md)**

---

## 🏗️ Arquitectura y Pila Tecnológica

El sistema utiliza una arquitectura completamente desacoplada (Frontend SPA/PWA estático + Backend REST API sin estado):

* **Infraestructura:** VPS en la nube (OVHcloud) orquestado con Docker y Docker Compose con zonas horarias sincronizadas (`America/Mexico_City`).
* **Seguridad de Red:** Conexión perimetral sin puertos entrantes públicos mediante **Cloudflare Tunnel (Zero Trust)** y certificados SSL administrados en el borde con HSTS estricto (`.app`).
* **Base de Datos:** MySQL 8.0 normalizada a **3NF**.
  * Soft Deletes transversales (`is_active`) para integridad referencial histórica.
  * Stored Procedures ACID con protocolo de reversa automática (`sp_transferir_fondos`, `sp_reversar_transaccion`).
  * Consultas analíticas y de presupuestos optimizadas en Vistas SQL (`VW_DETALLE_TRANSACCIONES`, `VW_CONTROL_PRESUPUESTOS`).
  * Módulo satélite de inventario: `CAT_PRODUCTOS` y `TBL_CICLOS_PRODUCTO`.
* **Backend:** PHP 8.2 en Apache (MVC, PSR-4 Autoloading, Bramus Router, Dotenv).
* **Frontend:** PWA instalable construida con TypeScript Vanilla, Vite y Bootstrap 5.
  * Service Worker con estrategia Cache-First para assets y Network-First/Exclusión total para la API.
  * Enrutamiento del cliente con History API y Auth Guards de navegación.
  * Notificaciones flotantes (Toasts) y Modales reactivos nativos de Bootstrap.

---

## 🚀 Entorno de Desarrollo Local

### 1. Requisitos Previos
* Docker Desktop y Git instalados.

### 2. Instalación y Puesta en Marcha
```bash
git clone https://github.com/tu-usuario/Finance-Web-App.git
cd Finance-Web-App
```
Configura tu archivo `.env` en la raíz con tus credenciales:
```env
DB_HOST=db
DB_NAME=finance_db
DB_USER=app_user
DB_PASS=app_password
DB_ROOT_PASS=root_super_secreto
```
Levanta los contenedores:
```bash
docker compose up -d
docker compose exec frontend npm install
```
* **Frontend SPA (Vite Dev Server):** [http://localhost:5173](http://localhost:5173)
* **Backend API (Apache/PHP):** [http://localhost:8000/api/](http://localhost:8000/api/)

---

## 📦 Despliegue en Producción (Cloud VPS)

La versión de producción utiliza una compilación multi-etapa (**Docker Multi-Stage Build**):

```bash
# En el servidor de producción:
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

---

## 🛡️ Seguridad y Buenas Prácticas
* **Zero Open Inbound Ports:** El contenedor Apache escucha exclusivamente en `127.0.0.1:80` (inaccesible vía IP pública directa).
* **Firewall Perimetral (UFW):** Todo tráfico bloqueado por defecto a nivel de SO, permitiendo solo el puerto administrativo SSH (22).
* **Prevención de Intrusiones:** Filtro activo de fuerza bruta gestionado por **Fail2ban**.
* **Autenticación:** Contraseñas protegidas mediante algoritmo `BCRYPT`.