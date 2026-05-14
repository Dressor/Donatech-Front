# REGISTRO DE DEFINICIÓN E IDENTIFICACIÓN DEL PROYECTO
## DONATECH — Plataforma de Donaciones Humanitarias

---

| Campo | Detalle |
|-------|---------|
| **Nombre del Proyecto** | Donatech |
| **Código Asignatura** | TPY1101 |
| **Asignatura** | Taller Aplicado de Programación |
| **Evaluación** | Parcial N°2 (EP2) |
| **Fecha de Inicio** | Marzo 2026 |
| **Fecha de Entrega EP2** | Mayo 2026 |
| **Institución** | [Nombre de la institución] |

---

## 1. DESCRIPCIÓN DEL PROYECTO

**Donatech** es una plataforma web de donaciones humanitarias que conecta donantes (personas naturales, empresas y organizaciones) con beneficiarios que postulan campañas de ayuda. El sistema automatiza el ciclo completo: creación de campaña → donación → validación de transferencia → despacho → entrega confirmada.

### 1.1 Misión
Facilitar el acceso a donaciones de recursos esenciales para personas y comunidades en situación de vulnerabilidad, a través de una plataforma digital segura, transparente y eficiente.

### 1.2 Visión
Ser la plataforma líder en Chile para la gestión de donaciones comunitarias, promoviendo la solidaridad digital y la trazabilidad total de cada aporte.

### 1.3 Valores
- **Transparencia**: Cada donación es rastreable en tiempo real.
- **Inclusión**: Accesible para donantes y beneficiarios de todo Chile.
- **Solidaridad**: Conectar quienes desean ayudar con quienes necesitan ayuda.
- **Eficiencia**: Proceso ágil y automatizado para reducir la burocracia.

---

## 2. ALCANCE DEL PROYECTO

### 2.1 Incluido en el alcance
- Sistema web completo (frontend React + backend Java Spring Boot)
- Gestión de usuarios con roles diferenciados (5 roles: ADMIN, DONANTE, BENEFICIARIO, VOLUNTARIO/VALIDADOR, ORGANIZACION)
- Catálogo de kits de emergencia configurables
- Módulo de campañas con ciclo de vida completo
- Carrito de donaciones y proceso de checkout
- Upload de comprobante de transferencia bancaria
- Validación manual de transferencias y campañas por voluntarios
- Seguimiento de pedidos en tiempo real (7 estados)
- Panel de administración con métricas
- Módulo de soporte (tickets)

### 2.2 Fuera del alcance
- Integración con pasarela de pago electrónico (Transbank, Flow, etc.)
- App móvil nativa
- Integración con SII (validación RUT en tiempo real)
- Notificaciones por SMS
- Sistema de reportería avanzado (BI)

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Arquitectura General
El sistema utiliza una **arquitectura de microservicios** en el backend y una **Single Page Application (SPA)** en el frontend, comunicados a través de un API Gateway.

```
[Frontend React SPA]
        |
   HTTP/REST + JWT
        |
  [API Gateway :8080]
        |
    ┌───┴───────────────────────────────┐
    │                                   │
[Auth Service]  [User Service]  [Catalog Service]
[Order Service] [Support Service] [Campaign Service]
                                  [Notification Service]
```

### 3.2 Patrón BFF (Backend for Frontend)
El frontend implementa el patrón BFF a través de una capa de servicios centralizada en `src/api/`:

| Módulo API | Archivo | Responsabilidad |
|------------|---------|----------------|
| authApi | `src/api/auth.js` | Login, registro, refresh token |
| usersApi | `src/api/users.js` | CRUD usuarios, beneficiarios, regiones/comunas |
| catalogApi | `src/api/catalog.js` | Productos, categorías, kits, campañas |
| ordersApi | `src/api/orders.js` | Pedidos, carrito, donaciones, comprobantes |
| supportsApi | `src/api/supports.js` | Tickets de soporte y validación |

### 3.3 Roles del Sistema

| Rol | Código | Capacidades |
|-----|--------|-------------|
| Administrador | ROLE_ADMIN | Gestión total del sistema |
| Donante | ROLE_DONANTE | Donar, ver historial, rastrear pedidos |
| Empresa | ROLE_EMPRESA | Igual que ROLE_DONANTE |
| Beneficiario | ROLE_BENEFICIARIO | Crear campañas, ver su dashboard |
| Organización | ROLE_ORGANIZACION | Crear campañas y donar |
| Voluntario/Validador | ROLE_VOLUNTARIO | Validar transferencias y campañas |

---

## 4. TECNOLOGÍAS UTILIZADAS

### 4.1 Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.x | Framework UI |
| Vite | 5.x | Build tool y dev server |
| TailwindCSS | 3.x | Estilos utilitarios |
| React Router DOM | 6.x | Navegación SPA |
| @tanstack/react-query | 5.x | Server state management |
| Axios | 1.x | Cliente HTTP con interceptores JWT |
| react-hook-form | 7.x | Manejo de formularios |
| react-hot-toast | 2.x | Notificaciones toast |
| recharts | 2.x | Gráficos para panel admin |
| @heroicons/react | 2.x | Iconografía |
| date-fns | 3.x | Formateo de fechas (locale es) |

### 4.2 Backend
| Tecnología | Propósito |
|-----------|-----------|
| Java 17 + Spring Boot 3 | Framework microservicios |
| Spring Security + JWT | Autenticación y autorización |
| Spring Data JPA | Persistencia de datos |
| MySQL | Base de datos relacional |
| Spring Cloud Gateway | API Gateway |
| Docker | Containerización |

---

## 5. EQUIPO DE TRABAJO

| N° | Nombre | Rol |
|----|--------|-----|
| 1 | [Integrante 1] | Líder / Backend |
| 2 | [Integrante 2] | Frontend Developer |
| 3 | [Integrante 3] | Base de Datos |
| 4 | [Integrante 4] | Frontend / Arquitectura |

---

## 6. METODOLOGÍA

El proyecto utiliza **Scrum adaptado** con sprints de 2 semanas:

- **Sprint 1-2**: Análisis de requerimientos, arquitectura, base de datos
- **Sprint 3-4**: Backend microservicios (Auth, Users, Catalog)
- **Sprint 5-6**: Backend (Orders, Supports, Notifications)
- **Sprint 7-8**: Frontend — páginas públicas y autenticación
- **Sprint 9-10**: Frontend — flujo de donación (carrito, checkout, tracking)
- **Sprint 11-12**: Frontend — dashboards (admin, beneficiario)
- **Sprint 13-14**: Integración, pruebas, corrección de bugs
- **Sprint 15-16**: Documentación, ajustes finales, entrega

---

## 7. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Cambios en API backend | Media | Alto | Usar variables de entorno para URLs |
| Problemas de integración microservicios | Media | Alto | Pruebas de integración tempranas |
| Tiempo insuficiente para documentación | Alta | Medio | Documentar en paralelo al desarrollo |
| Ausencia de integrante | Baja | Alto | Compartir conocimiento del código |
| Problemas de CORS en desarrollo | Alta | Bajo | Configurar proxy en Vite |

---

## 8. APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Docente | [Nombre docente] | ________ | ___/___/2026 |
| Líder de Proyecto | [Nombre integrante] | ________ | ___/___/2026 |

---

*Documento generado para TPY1101 — Taller Aplicado de Programación, EP2, Mayo 2026*
