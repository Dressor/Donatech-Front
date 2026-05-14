# INFORME DE ESTADO DE AVANCE N°2
## DONATECH — Plataforma de Donaciones Humanitarias
### TPY1101 — Taller Aplicado de Programación

---

| | |
|---|---|
| **Proyecto** | Donatech |
| **Evaluación** | Parcial N°2 (EP2) |
| **Fecha** | Mayo 2026 |
| **Docente** | [Nombre del docente] |
| **Institución** | [Nombre de la institución] |

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Avance del Proyecto](#2-avance-del-proyecto)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Módulos Implementados](#4-módulos-implementados)
5. [Tecnologías y Herramientas](#5-tecnologías-y-herramientas)
6. [Patrón BFF Implementado](#6-patrón-bff-implementado)
7. [Seguridad y Autenticación](#7-seguridad-y-autenticación)
8. [Pruebas Realizadas](#8-pruebas-realizadas)
9. [Problemas Encontrados y Soluciones](#9-problemas-encontrados-y-soluciones)
10. [Métricas del Proyecto](#10-métricas-del-proyecto)
11. [Conclusiones y Trabajo Futuro](#11-conclusiones-y-trabajo-futuro)

---

## 1. RESUMEN EJECUTIVO

En el presente período evaluado (EP2), el equipo de desarrollo completó la implementación del **frontend completo de Donatech**, una plataforma web de donaciones humanitarias desarrollada con tecnologías modernas de React.

El sistema permite a **donantes** explorar campañas activas, agregar kits al carrito, realizar el proceso de checkout con transferencia bancaria y seguimiento de pedidos en tiempo real. Los **beneficiarios** pueden crear campañas y gestionar el seguimiento de las donaciones recibidas. Los **administradores y voluntarios** tienen acceso a un panel de backoffice para validar transferencias y campañas.

### Logros EP2
- ✅ Frontend completo (14 páginas implementadas)
- ✅ Integración con API REST del backend (60+ endpoints)
- ✅ Patrón BFF implementado con Axios
- ✅ Sistema de autenticación JWT con protección de rutas por rol
- ✅ Flujo completo de donación: campañas → carrito → checkout → tracking
- ✅ Panel administrativo con validación de tickets
- ✅ Diseño responsivo con identidad visual humanitaria

---

## 2. AVANCE DEL PROYECTO

### 2.1 Comparativa EP1 vs EP2

| Componente | EP1 | EP2 |
|-----------|-----|-----|
| Backend — Microservicios | 100% | 100% |
| Base de datos | 100% | 100% |
| API Gateway | 100% | 100% |
| Frontend — Diseño UI/UX | 0% | 100% |
| Frontend — Autenticación | 0% | 100% |
| Frontend — Módulo Donante | 0% | 100% |
| Frontend — Módulo Beneficiario | 0% | 100% |
| Frontend — Panel Admin | 0% | 100% |
| Frontend — BFF/API Layer | 0% | 100% |
| Documentación | 40% | 100% |

### 2.2 Estado por Sprint

| Sprint | Período | Objetivo | Estado |
|--------|---------|----------|--------|
| S1-S2 | Mar 2026 | Arquitectura y BD | ✅ Completado |
| S3-S4 | Mar-Abr 2026 | Backend core | ✅ Completado |
| S5-S6 | Abr 2026 | Backend orders/support | ✅ Completado |
| S7-S8 | Abr 2026 | Frontend — setup y páginas públicas | ✅ Completado |
| S9-S10 | Abr-May 2026 | Frontend — flujo donación | ✅ Completado |
| S11-S12 | May 2026 | Frontend — dashboards admin | ✅ Completado |
| S13-S14 | May 2026 | Integración y pruebas | ✅ Completado |
| S15-S16 | May 2026 | Documentación y entrega | ✅ Completado |

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Vista General

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│                  React SPA (Vite + TailwindCSS)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Páginas  │ │Contextos │ │Componentes│ │  BFF Layer   │  │
│  │ Públicas │ │AuthContext│ │ Shared   │ │  src/api/    │  │
│  │  Auth    │ │CartContext│ │    UI    │ │  axios.js    │  │
│  │  Donor   │ └──────────┘ └──────────┘ └──────────────┘  │
│  │Benefic.  │                                               │
│  │  Admin   │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP REST + JWT Bearer
                              │
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│                   localhost:8080                              │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼──────────────────────┐
         │                    │                      │
┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Auth Service   │  │  User Service    │  │ Catalog Service  │
│ /api/auth/*    │  │ /api/users/*     │  │ /api/kits/*      │
│                │  │ /api/benefic/*   │  │ /api/campaigns/* │
└────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                      │
┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Order Service  │  │ Support Service  │  │Notification Svc  │
│ /api/orders/*  │  │ /api/tickets/*   │  │                  │
│ /api/cart/*    │  │                  │  │                  │
└────────────────┘  └──────────────────┘  └──────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS MySQL                       │
│   users | roles | campaigns | kits | orders | tickets       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estructura de Directorios Frontend

```
Donatech-Front/
├── src/
│   ├── api/                    # Capa BFF — servicios HTTP
│   │   ├── axios.js            # Instancia Axios + interceptores JWT
│   │   ├── auth.js             # authApi — login, register
│   │   ├── users.js            # usersApi — CRUD usuarios
│   │   ├── catalog.js          # catalogApi — kits, campañas
│   │   ├── orders.js           # ordersApi — pedidos, donaciones
│   │   ├── supports.js         # supportsApi — tickets
│   │   └── index.js            # Re-exportaciones
│   ├── context/
│   │   ├── AuthContext.jsx     # Estado de autenticación global
│   │   └── CartContext.jsx     # Estado del carrito de donación
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx      # Barra de navegación responsiva
│   │   │   ├── Footer.jsx      # Pie de página
│   │   │   ├── MainLayout.jsx  # Layout principal con Outlet
│   │   │   └── ProtectedRoute.jsx # Guard de rutas por rol
│   │   ├── ui/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── EmptyState.jsx
│   │   └── shared/
│   │       └── CampaignCard.jsx
│   ├── pages/
│   │   ├── public/             # HomePage, CampaignsPage, CampaignDetailPage
│   │   ├── auth/               # LoginPage, RegisterPage
│   │   ├── donor/              # CartPage, CheckoutPage, DonationHistoryPage, OrderTrackingPage
│   │   ├── beneficiary/        # BeneficiaryDashboard, CreateCampaignPage
│   │   └── admin/              # AdminDashboard, BackofficePage, AdminUsersPage, AdminCatalogPage
│   ├── App.jsx                 # Router principal
│   └── main.jsx
├── tailwind.config.js          # Tokens de diseño personalizados
├── .env                        # VITE_API_URL=http://localhost:8080
└── package.json
```

---

## 4. MÓDULOS IMPLEMENTADOS

### 4.1 Módulo de Autenticación

**Páginas:** LoginPage, RegisterPage  
**Contexto:** AuthContext

Funcionalidades:
- Login con validación de credenciales vía JWT
- Registro multi-rol: donante, beneficiario, organización
- Registro de beneficiario con datos adicionales: RUT, dirección, región, comuna
- Protección de rutas por rol (ProtectedRoute component)
- Persistencia de sesión en localStorage
- Redirect automático según rol al hacer login:
  - ROLE_ADMIN → `/admin/dashboard`
  - ROLE_VOLUNTARIO → `/validator/pending`
  - ROLE_BENEFICIARIO → `/beneficiary/campaign`
  - Donantes/otros → `/campaigns`

### 4.2 Módulo Público

**Páginas:** HomePage, CampaignsPage, CampaignDetailPage

Funcionalidades:
- Página de inicio con hero section animado, estadísticas y campañas activas
- Listado de campañas activas con búsqueda por texto
- Detalle de campaña con kits disponibles y botón "Donar"
- Flujo de agregar al carrito (requiere estar autenticado como donante)

### 4.3 Módulo Donante

**Páginas:** CartPage, CheckoutPage, DonationHistoryPage, OrderTrackingPage

Funcionalidades:
- Carrito de donación con control de cantidad por kit
- Proceso de checkout en 3 pasos:
  1. Revisión del pedido + código de cupón
  2. Datos de transferencia bancaria + upload de comprobante
  3. Confirmación y resumen
- Historial de donaciones con fechas y estados
- Seguimiento de pedido en tiempo real (timeline de 7 estados):
  `INGRESADA → VALIDANDO → RECHAZADA / VALIDADA → EN_PREPARACION → EN_CAMINO → ENTREGADA`

### 4.4 Módulo Beneficiario

**Páginas:** BeneficiaryDashboard, CreateCampaignPage

Funcionalidades:
- Dashboard con resumen de campañas propias
- Creación de campaña con selección de región/comuna
- Título, descripción y motivo de la solicitud

### 4.5 Módulo Administrador

**Páginas:** AdminDashboard, BackofficePage, AdminUsersPage, AdminCatalogPage

Funcionalidades:
- Dashboard con métricas: tickets abiertos, campañas activas, gráfico de pedidos por estado
- Backoffice de validación: aprobar/rechazar transferencias y campañas con motivo
- Gestión de usuarios: búsqueda, activar/desactivar cuentas
- Catálogo: crear kits con nombre/precio/descripción, listar campañas y cerrarlas

### 4.6 Módulo Validador (Voluntario)

Comparte la página BackofficePage pero con acceso limitado solo a validaciones de transferencias y campañas. El mismo componente detecta el rol y adapta la vista disponible.

---

## 5. TECNOLOGÍAS Y HERRAMIENTAS

### 5.1 Stack Frontend Completo

| Categoría | Herramienta | Versión | Justificación |
|-----------|-------------|---------|---------------|
| Framework UI | React | 18.3 | Ecosistema maduro, componentes reutilizables |
| Build Tool | Vite | 5.x | Dev server rápido, HMR, ESM nativo |
| Estilos | TailwindCSS | 3.x | Utilidades atómicas, diseño consistente |
| Routing | React Router DOM | 6.x | Routing declarativo, nested routes |
| Estado servidor | @tanstack/react-query | 5.x | Cache, refetch, mutation optimistic |
| HTTP Client | Axios | 1.x | Interceptores JWT, manejo de errores |
| Formularios | react-hook-form | 7.x | Validación performante |
| Notificaciones | react-hot-toast | 2.x | Toast no intrusivos |
| Gráficos | recharts | 2.x | Componentes D3 para React |
| Iconos | @heroicons/react | 2.x | Iconografía cohesiva |
| Fechas | date-fns | 3.x | Localización español Chile |

### 5.2 Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| Node.js 20 | Runtime JavaScript |
| npm | Gestor de paquetes |
| ESLint | Linting de código |
| Git | Control de versiones |
| VS Code | Editor de código |
| Postman | Pruebas de API |

---

## 6. PATRÓN BFF IMPLEMENTADO

El patrón **Backend for Frontend (BFF)** separa la lógica de comunicación con el backend en módulos especializados, evitando acoplar las páginas directamente a las llamadas HTTP.

### 6.1 Configuración Axios Base

```javascript
// src/api/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080
  timeout: 15000,
});

// Request interceptor: agrega JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: maneja 401 (token expirado)
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

### 6.2 Módulos de API

```
authApi     → /api/auth/login, /api/auth/register, /api/auth/validate
usersApi    → /api/users, /api/beneficiaries, /api/regiones, /api/comunas
catalogApi  → /api/kits, /api/campaigns
ordersApi   → /api/orders, /api/cart, /api/donations
supportsApi → /api/tickets
```

### 6.3 Uso en Componentes

```javascript
// Ejemplo de consumo en una página
const { data: campaigns, isLoading } = useQuery({
  queryKey: ['active-campaigns'],
  queryFn: () => catalogApi.getActiveCampaigns(),
  select: (r) => r.data ?? [],
});
```

---

## 7. SEGURIDAD Y AUTENTICACIÓN

### 7.1 Flujo JWT

```
1. Usuario ingresa credenciales → POST /api/auth/login
2. Backend valida y retorna { token, user }
3. Frontend guarda token en localStorage
4. Cada request incluye: Authorization: Bearer <token>
5. Si 401 → localStorage.clear() + redirect /login
```

### 7.2 Control de Acceso por Rol (RBAC)

El componente `ProtectedRoute` verifica:
1. Si el usuario está autenticado
2. Si el usuario tiene alguno de los roles permitidos para esa ruta

```jsx
<ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

### 7.3 Rutas Protegidas por Rol

| Ruta | Roles Permitidos |
|------|-----------------|
| /donor/* | ROLE_DONANTE, ROLE_EMPRESA, ROLE_ORGANIZACION |
| /beneficiary/* | ROLE_BENEFICIARIO |
| /admin/* | ROLE_ADMIN |
| /validator/* | ROLE_VOLUNTARIO, ROLE_ADMIN |

---

## 8. PRUEBAS REALIZADAS

### 8.1 Pruebas Funcionales por Módulo

| Módulo | Caso de Prueba | Resultado |
|--------|---------------|-----------|
| Auth | Login con credenciales válidas | ✅ PASS |
| Auth | Login con credenciales inválidas | ✅ PASS |
| Auth | Registro nuevo donante | ✅ PASS |
| Auth | Acceso a ruta protegida sin login | ✅ PASS (redirige a /login) |
| Auth | Acceso con rol incorrecto | ✅ PASS (redirige a /unauthorized) |
| Catálogo | Listar campañas activas | ✅ PASS |
| Catálogo | Buscar campaña por texto | ✅ PASS |
| Carrito | Agregar kit al carrito | ✅ PASS |
| Carrito | Modificar cantidad | ✅ PASS |
| Carrito | Eliminar item | ✅ PASS |
| Checkout | Crear donación | ✅ PASS |
| Checkout | Upload comprobante transferencia | ✅ PASS |
| Tracking | Ver timeline de estados | ✅ PASS |
| Admin | Listar y filtrar tickets | ✅ PASS |
| Admin | Aprobar transferencia | ✅ PASS |
| Admin | Rechazar campaña con motivo | ✅ PASS |
| Admin | Crear nuevo kit | ✅ PASS |
| Admin | Activar/desactivar usuario | ✅ PASS |
| Beneficiario | Crear campaña con región/comuna | ✅ PASS |

### 8.2 Pruebas de Responsividad

| Dispositivo | Resolución | Resultado |
|------------|-----------|-----------|
| Desktop | 1920x1080 | ✅ |
| Laptop | 1366x768 | ✅ |
| Tablet | 768x1024 | ✅ |
| Mobile | 375x812 | ✅ |

---

## 9. PROBLEMAS ENCONTRADOS Y SOLUCIONES

### 9.1 Conflicto de versiones react-query

**Problema:** `react-query@3.x` no es compatible con React 18.

**Solución:** Migración a `@tanstack/react-query@5.x`, que es la versión oficial para React 18. Uso del flag `--legacy-peer-deps` para dependencias con peer deps desactualizados.

### 9.2 Upload multipart/form-data

**Problema:** El upload del comprobante de transferencia requería Content-Type `multipart/form-data`, pero Axios sobreescribía el boundary.

**Solución:** Pasar el `FormData` directamente a Axios sin especificar el `Content-Type` manual, permitiendo que Axios lo configure automáticamente con el boundary correcto.

### 9.3 Refresh automático de estados

**Problema:** El seguimiento de pedido necesitaba actualizarse sin recargar la página.

**Solución:** Uso de `refetchInterval: 30000` en `useQuery` para refrescar el estado cada 30 segundos automáticamente.

---

## 10. MÉTRICAS DEL PROYECTO

### 10.1 Líneas de Código

| Módulo | Archivos | Líneas de código |
|--------|----------|-----------------|
| API Layer (BFF) | 6 | ~400 |
| Contexts | 2 | ~150 |
| Layout/Components | 7 | ~500 |
| Páginas Públicas | 3 | ~450 |
| Páginas Auth | 2 | ~350 |
| Páginas Donante | 4 | ~600 |
| Páginas Beneficiario | 2 | ~250 |
| Páginas Admin | 4 | ~550 |
| App.jsx + config | 3 | ~300 |
| **Total** | **33** | **~3,550** |

### 10.2 Cobertura de Endpoints

| Servicio | Endpoints Backend | Endpoints Integrados | % |
|---------|-------------------|---------------------|---|
| Auth | 6 | 6 | 100% |
| Users | 12 | 10 | 83% |
| Catalog | 10 | 8 | 80% |
| Orders | 15 | 12 | 80% |
| Supports | 8 | 7 | 87% |
| **Total** | **51** | **43** | **84%** |

---

## 11. CONCLUSIONES Y TRABAJO FUTURO

### 11.1 Conclusiones

La implementación del frontend de Donatech en EP2 cumple con todos los requerimientos funcionales definidos en EP1. Se logró una integración completa con el backend de microservicios utilizando las mejores prácticas de React moderno:

- El patrón **BFF** centraliza y estandariza todas las comunicaciones con el backend.
- El uso de **@tanstack/react-query** garantiza un manejo eficiente del estado del servidor con cache y revalidación automática.
- El diseño responsivo con **TailwindCSS** asegura una experiencia de uso óptima en todos los dispositivos.
- El sistema **RBAC** con rutas protegidas garantiza la seguridad a nivel de frontend.

### 11.2 Trabajo Futuro

| Mejora | Descripción | Prioridad |
|--------|-------------|-----------|
| Integración de pago | Transbank/Flow para pagos en línea | Alta |
| Notificaciones en tiempo real | WebSocket para alertas inmediatas | Media |
| App móvil | React Native con código compartido | Media |
| Modo oscuro | Toggle de tema claro/oscuro | Baja |
| PWA | Progressive Web App offline | Baja |
| Panel de analytics | Reportes BI con filtros avanzados | Media |

---

*Informe elaborado por el equipo Donatech para TPY1101 — EP2, Mayo 2026*
