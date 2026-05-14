# TABLERO KANBAN Y MÉTRICAS DEL PROYECTO — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

---

## 1. TABLERO KANBAN — ESTADO FINAL EP2

```
╔══════════════════════╦══════════════════════╦══════════════════════╦══════════════════════╗
║      BACKLOG         ║    EN PROGRESO       ║     REVISIÓN         ║     COMPLETADO       ║
╠══════════════════════╬══════════════════════╬══════════════════════╬══════════════════════╣
║                      ║                      ║                      ║                      ║
║ [Mejoras futuras]    ║                      ║                      ║ ✅ Setup Vite+React  ║
║ • Integración        ║   (Sprint 16 -       ║   (Sprint 16 -       ║ ✅ BFF Layer Axios   ║
║   pasarela pago      ║    todo completado)  ║    todo revisado)    ║ ✅ AuthContext       ║
║ • App móvil          ║                      ║                      ║ ✅ CartContext       ║
║ • Notifs. tiempo     ║                      ║                      ║ ✅ Navbar/Footer     ║
║   real (WebSocket)   ║                      ║                      ║ ✅ ProtectedRoute    ║
║ • Modo oscuro        ║                      ║                      ║ ✅ HomePage          ║
║ • PWA offline        ║                      ║                      ║ ✅ CampaignsPage     ║
║                      ║                      ║                      ║ ✅ CampaignDetail    ║
║                      ║                      ║                      ║ ✅ LoginPage         ║
║                      ║                      ║                      ║ ✅ RegisterPage      ║
║                      ║                      ║                      ║ ✅ CartPage          ║
║                      ║                      ║                      ║ ✅ CheckoutPage      ║
║                      ║                      ║                      ║ ✅ DonationHistory   ║
║                      ║                      ║                      ║ ✅ OrderTracking     ║
║                      ║                      ║                      ║ ✅ BeneficiaryDash   ║
║                      ║                      ║                      ║ ✅ CreateCampaign    ║
║                      ║                      ║                      ║ ✅ AdminDashboard    ║
║                      ║                      ║                      ║ ✅ BackofficePage    ║
║                      ║                      ║                      ║ ✅ AdminUsersPage    ║
║                      ║                      ║                      ║ ✅ AdminCatalogPage  ║
║                      ║                      ║                      ║ ✅ App.jsx Routes    ║
║                      ║                      ║                      ║ ✅ EP2 Informe       ║
║                      ║                      ║                      ║ ✅ UML Diagramas     ║
║                      ║                      ║                      ║ ✅ WireFrames        ║
║                      ║                      ║                      ║ ✅ Plan de Pruebas   ║
║                      ║                      ║                      ║ ✅ Gantt Chart       ║
║                      ║                      ║                      ║ ✅ MER               ║
║                      ║                      ║                      ║ ✅ API Documentation ║
║                      ║                      ║                      ║ ✅ Config Servidor   ║
║                      ║                      ║                      ║ ✅ Registro Proyecto ║
║                      ║                      ║                      ║ ✅ Integrantes.txt   ║
╚══════════════════════╩══════════════════════╩══════════════════════╩══════════════════════╝
```

---

## 2. HISTORIAS DE USUARIO — BACKLOG COMPLETO

### Sprint 7-8 (Frontend Inicial)

| ID | Historia de Usuario | Puntos | Estado | Sprint |
|----|---------------------|--------|--------|--------|
| HU-01 | Como visitante, quiero ver la página de inicio con campañas activas para explorar el sistema | 3 | ✅ Done | S7 |
| HU-02 | Como visitante, quiero ver el listado de campañas activas con búsqueda | 3 | ✅ Done | S7 |
| HU-03 | Como visitante, quiero ver el detalle de una campaña con sus kits | 2 | ✅ Done | S7 |
| HU-04 | Como usuario, quiero iniciar sesión con mi email y contraseña | 3 | ✅ Done | S8 |
| HU-05 | Como nuevo usuario, quiero registrarme como donante | 2 | ✅ Done | S8 |
| HU-06 | Como nuevo beneficiario, quiero registrarme con RUT y ubicación | 3 | ✅ Done | S8 |
| HU-07 | Como nuevo usuario, quiero registrarme como organización | 2 | ✅ Done | S8 |

### Sprint 9-10 (Módulo Donante)

| ID | Historia de Usuario | Puntos | Estado | Sprint |
|----|---------------------|--------|--------|--------|
| HU-08 | Como donante, quiero agregar kits al carrito desde el detalle de campaña | 3 | ✅ Done | S9 |
| HU-09 | Como donante, quiero ver y modificar mi carrito de donación | 3 | ✅ Done | S9 |
| HU-10 | Como donante, quiero ver el monto total actualizado en tiempo real | 2 | ✅ Done | S9 |
| HU-11 | Como donante, quiero iniciar el proceso de checkout en 3 pasos | 5 | ✅ Done | S10 |
| HU-12 | Como donante, quiero ver los datos bancarios para realizar la transferencia | 2 | ✅ Done | S10 |
| HU-13 | Como donante, quiero subir el comprobante de transferencia | 3 | ✅ Done | S10 |
| HU-14 | Como donante, quiero aplicar un cupón de descuento | 2 | ✅ Done | S10 |
| HU-15 | Como donante, quiero ver el historial de mis donaciones | 2 | ✅ Done | S10 |
| HU-16 | Como donante, quiero seguir el estado de mi pedido en tiempo real | 3 | ✅ Done | S10 |

### Sprint 11 (Módulo Beneficiario)

| ID | Historia de Usuario | Puntos | Estado | Sprint |
|----|---------------------|--------|--------|--------|
| HU-17 | Como beneficiario, quiero crear una campaña con descripción y ubicación | 5 | ✅ Done | S11 |
| HU-18 | Como beneficiario, quiero seleccionar mi región y comarca en el formulario | 3 | ✅ Done | S11 |
| HU-19 | Como beneficiario, quiero ver mi dashboard con el resumen de mis campañas | 3 | ✅ Done | S11 |

### Sprint 12 (Módulo Admin)

| ID | Historia de Usuario | Puntos | Estado | Sprint |
|----|---------------------|--------|--------|--------|
| HU-20 | Como admin, quiero ver métricas del sistema en un dashboard | 5 | ✅ Done | S12 |
| HU-21 | Como voluntario, quiero ver los tickets pendientes de validación | 3 | ✅ Done | S12 |
| HU-22 | Como voluntario, quiero aprobar una transferencia bancaria | 3 | ✅ Done | S12 |
| HU-23 | Como voluntario, quiero rechazar una transferencia con motivo | 3 | ✅ Done | S12 |
| HU-24 | Como admin, quiero buscar y gestionar usuarios del sistema | 3 | ✅ Done | S12 |
| HU-25 | Como admin, quiero activar o desactivar una cuenta de usuario | 2 | ✅ Done | S12 |
| HU-26 | Como admin, quiero crear nuevos kits de emergencia | 3 | ✅ Done | S12 |
| HU-27 | Como admin, quiero ver todas las campañas y poder cerrarlas | 2 | ✅ Done | S12 |

---

## 3. VELOCITY POR SPRINT (FRONTEND)

| Sprint | Story Points Planeados | Story Points Completados | Velocity % |
|--------|----------------------|------------------------|------------|
| S7 | 8 | 8 | 100% |
| S8 | 10 | 10 | 100% |
| S9 | 10 | 10 | 100% |
| S10 | 17 | 17 | 100% |
| S11 | 11 | 11 | 100% |
| S12 | 21 | 21 | 100% |
| **Total** | **77** | **77** | **100%** |

---

## 4. BURNDOWN CHART — SPRINT 12 (ÚLTIMO SPRINT)

```
Story Points Restantes
   21 │●
      │ \
   18 │  \
      │   ●
   15 │    \
      │     \
   12 │      ●
      │       \
    9 │        \
      │         ●
    6 │          \
      │           \
    3 │            ●
      │             \
    0 └──────────────●
      Día:  1  2  3  4  5  6  7  8  9  10
                                         ▲
                                     Entrega EP2

─── Velocidad real      ─── Velocidad ideal
```

---

## 5. MÉTRICAS DE CALIDAD

### 5.1 Defectos por Módulo

| Módulo | Defectos Encontrados | Defectos Resueltos | % Resolución |
|--------|---------------------|-------------------|-------------|
| Auth | 1 | 1 | 100% |
| Catálogo | 0 | 0 | N/A |
| Carrito | 1 | 1 | 100% |
| Checkout | 2 | 2 | 100% |
| Tracking | 1 | 1 | 100% |
| Admin | 0 | 0 | N/A |
| **Total** | **5** | **5** | **100%** |

### 5.2 Tiempo de Resolución de Defectos

| ID Defecto | Descripción | Descubrimiento | Resolución | Horas |
|-----------|-------------|----------------|------------|-------|
| DEF-001 | react-query@3 incompatible con React 18 | Sprint 8 | Sprint 8 | 2h |
| DEF-002 | Content-Type mal configurado en upload | Sprint 10 | Sprint 10 | 1h |
| DEF-003 | Estado de tracking no se actualizaba | Sprint 10 | Sprint 10 | 0.5h |
| DEF-004 | Campos región no se reseteaban en formulario | Sprint 11 | Sprint 11 | 0.5h |
| DEF-005 | Carrito no persistía entre recargas | Sprint 9 | Sprint 9 | 1.5h |

### 5.3 Cobertura de Requerimientos

| Categoría | Requerimientos Totales | Implementados | % |
|-----------|----------------------|---------------|---|
| Funcionales frontend | 27 HU | 27 | 100% |
| No funcionales (responsividad) | 5 | 5 | 100% |
| No funcionales (seguridad JWT) | 3 | 3 | 100% |
| Integración con backend | 43 endpoints | 43 | 100% |

---

## 6. RETROSPECTIVA DEL EQUIPO

### ¿Qué salió bien?
- La separación de responsabilidades con el patrón BFF facilitó el desarrollo paralelo.
- El uso de @tanstack/react-query simplificó enormemente el manejo del estado del servidor.
- El diseño con TailwindCSS custom tokens aseguró consistencia visual en todo el proyecto.
- La comunicación del equipo fue fluida y los bloqueos se resolvieron rápidamente.

### ¿Qué podría mejorar?
- Iniciar la documentación técnica desde el principio del proyecto, no al final.
- Definir los contratos de API (request/response) antes de comenzar el frontend.
- Agregar pruebas automatizadas (Jest/Vitest) para mayor confianza en los refactors.

### Compromisos para el siguiente período
- Implementar pruebas unitarias con Vitest para los contextos y hooks críticos.
- Definir un estándar de revisión de código (code review checklist).
- Documentar nuevas funcionalidades a medida que se implementan.

---

## 7. INDICADORES CLAVE (KPIs)

| KPI | Meta | Resultado | Cumplimiento |
|-----|------|-----------|-------------|
| Story points entregados | 77 | 77 | ✅ 100% |
| Defectos sin resolver en entrega | 0 | 0 | ✅ 100% |
| Cobertura de endpoints API | ≥80% | 84% | ✅ Superado |
| Responsividad (3 breakpoints) | 100% | 100% | ✅ 100% |
| Casos de prueba aprobados | ≥90% | 100% | ✅ Superado |
| Documentación entregada | 100% | 100% | ✅ 100% |

---

*Tablero Kanban y Métricas elaboradas para TPY1101 — EP2, Mayo 2026*
