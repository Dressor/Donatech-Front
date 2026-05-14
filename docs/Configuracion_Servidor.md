# CONFIGURACIÓN DEL SERVIDOR DE DESARROLLO — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

---

## 1. REQUISITOS PREVIOS

### Software Requerido

| Software | Versión | Propósito |
|---------|---------|-----------|
| Node.js | 20.x LTS | Runtime para el frontend |
| npm | 10.x | Gestor de paquetes Node |
| Java JDK | 17+ | Runtime para el backend |
| Maven | 3.8+ | Build tool Java |
| MySQL | 8.x | Base de datos |
| Git | 2.x | Control de versiones |

### Verificación de Instalaciones

```bash
# Verificar versiones instaladas
node --version      # v20.x.x
npm --version       # 10.x.x
java --version      # openjdk 17
mvn --version       # Apache Maven 3.8.x
mysql --version     # 8.0.x
git --version       # 2.x.x
```

---

## 2. CONFIGURACIÓN DE LA BASE DE DATOS

### 2.1 Crear Base de Datos

```sql
-- Conectar a MySQL como root
mysql -u root -p

-- Crear base de datos
CREATE DATABASE donatech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de aplicación (recomendado, no usar root)
CREATE USER 'donatech_user'@'localhost' IDENTIFIED BY 'DonatechPass2026!';
GRANT ALL PRIVILEGES ON donatech.* TO 'donatech_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2.2 Configuración en Backend

Editar `src/main/resources/application.properties` en cada microservicio:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/donatech
spring.datasource.username=donatech_user
spring.datasource.password=DonatechPass2026!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### 2.3 Backup de la Base de Datos

```bash
# Crear backup completo
mysqldump -u donatech_user -p donatech > backup_donatech_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u donatech_user -p donatech < backup_donatech_20260514.sql
```

---

## 3. CONFIGURACIÓN DEL BACKEND

### 3.1 Clonar Repositorio

```bash
git clone https://github.com/OmarNietoc/Donatech
cd Donatech
```

### 3.2 Estructura del Backend

```
Donatech/
├── eureka-server/          # Service Discovery (puerto 8761)
├── api-gateway/            # API Gateway (puerto 8080)
├── auth-service/           # Servicio de Autenticación (puerto 8081)
├── user-service/           # Servicio de Usuarios (puerto 8082)
├── catalog-service/        # Servicio de Catálogo (puerto 8083)
├── order-service/          # Servicio de Órdenes (puerto 8084)
├── support-service/        # Servicio de Soporte (puerto 8085)
└── notification-service/   # Servicio de Notificaciones (puerto 8086)
```

### 3.3 Compilar y Ejecutar cada Microservicio

**Orden de inicio recomendado:**

```bash
# 1. Primero: Eureka Server (Service Discovery)
cd eureka-server
mvn spring-boot:run &

# Esperar ~15 segundos, luego:

# 2. Config Server (si aplica)
cd ../config-server
mvn spring-boot:run &

# 3. Microservicios de negocio (en cualquier orden)
cd ../auth-service
mvn spring-boot:run &

cd ../user-service
mvn spring-boot:run &

cd ../catalog-service
mvn spring-boot:run &

cd ../order-service
mvn spring-boot:run &

cd ../support-service
mvn spring-boot:run &

# 4. Último: API Gateway
cd ../api-gateway
mvn spring-boot:run &
```

### 3.4 Verificar que el Backend Está Activo

```bash
# Verificar API Gateway
curl http://localhost:8080/actuator/health

# Verificar autenticación
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@donatech.cl","password":"Admin123!"}'
```

### 3.5 Configuración de CORS en el Gateway

El API Gateway debe tener CORS habilitado para `http://localhost:5173`:

```yaml
# application.yml del api-gateway
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://localhost:5173"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true
```

### 3.6 Configuración JWT

```properties
# En auth-service/application.properties
jwt.secret=DonatechJwtSecretKey2026SuperSegura
jwt.expiration=86400000
# 86400000 ms = 24 horas
```

---

## 4. CONFIGURACIÓN DEL FRONTEND

### 4.1 Clonar Repositorio

```bash
git clone https://www.github.com/Dressor/Donatech-Front
cd Donatech-Front
```

### 4.2 Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

> **Nota:** Se requiere `--legacy-peer-deps` debido a incompatibilidades de versiones menores entre algunas dependencias transitivas.

### 4.3 Variables de Entorno

Crear/verificar el archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080
```

Para producción, crear `.env.production`:
```env
VITE_API_URL=https://api.donatech.cl
```

### 4.4 Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:5173`

### 4.5 Build para Producción

```bash
npm run build
```

Los archivos compilados se generarán en `dist/`

### 4.6 Preview del Build de Producción

```bash
npm run preview
```

---

## 5. CONFIGURACIÓN DE VITE

El archivo `vite.config.js` incluye configuración de proxy para evitar CORS en desarrollo:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

---

## 6. USUARIO ADMINISTRADOR INICIAL

Para iniciar el sistema con un usuario administrador:

```sql
-- Insertar usuario admin (password: Admin123! en bcrypt)
INSERT INTO usuario (name, email, password, status, id_rol) VALUES
('Administrador Donatech', 'admin@donatech.cl', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjTsmi06n3.', 
 1, 
 (SELECT id FROM rol WHERE name = 'ROLE_ADMIN'));
```

---

## 7. SCRIPTS DE MANTENIMIENTO

### Limpiar base de datos (solo datos de prueba)
```sql
-- ⚠️  PRECAUCIÓN: Solo en entorno de desarrollo
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE orden_historial;
TRUNCATE TABLE orden_kit;
TRUNCATE TABLE orden;
TRUNCATE TABLE ticket;
TRUNCATE TABLE campaña;
SET FOREIGN_KEY_CHECKS = 1;
```

### Verificar estado de los servicios
```bash
# Script verificacion.sh
echo "=== Estado de Microservicios Donatech ==="
services=(8080 8081 8082 8083 8084 8085)
names=("API Gateway" "Auth" "Users" "Catalog" "Orders" "Support")
for i in "${!services[@]}"; do
  if curl -s http://localhost:${services[$i]}/actuator/health > /dev/null; then
    echo "✅ ${names[$i]} (:${services[$i]}) — ACTIVO"
  else
    echo "❌ ${names[$i]} (:${services[$i]}) — INACTIVO"
  fi
done
```

---

## 8. POSIBLES ERRORES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|---------|
| `ECONNREFUSED localhost:8080` | Backend no iniciado | Verificar que todos los microservicios están en ejecución |
| `401 Unauthorized` en todas las peticiones | Token expirado o inválido | Cerrar sesión y volver a hacer login |
| CORS error en navegador | Gateway CORS no configurado | Agregar `http://localhost:5173` a allowedOrigins en gateway |
| `npm install` falla | Conflicto de peer deps | Usar `npm install --legacy-peer-deps` |
| Error al subir comprobante | Tamaño del archivo > 5MB | Comprimir imagen antes de subir |
| BD no conecta | Credenciales incorrectas | Verificar `application.properties` de cada microservicio |
| Puerto 5173 ocupado | Otro proceso usando el puerto | `npm run dev -- --port 5174` |
| `java.lang.OutOfMemoryError` | Heap insuficiente | Iniciar con `mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m"` |

---

## 9. ESTRUCTURA DE PUERTOS

| Servicio | Puerto | URL |
|---------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| API Gateway | 8080 | http://localhost:8080 |
| Eureka Server | 8761 | http://localhost:8761 |
| Auth Service | 8081 | http://localhost:8081 |
| User Service | 8082 | http://localhost:8082 |
| Catalog Service | 8083 | http://localhost:8083 |
| Order Service | 8084 | http://localhost:8084 |
| Support Service | 8085 | http://localhost:8085 |
| Notification Service | 8086 | http://localhost:8086 |
| MySQL | 3306 | localhost:3306/donatech |

---

*Documento de Configuración elaborado para TPY1101 — EP2, Mayo 2026*
