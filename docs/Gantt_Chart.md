# DIAGRAMA DE GANTT — DONATECH
## TPY1101 — Taller Aplicado de Programación
## Planificación del Proyecto — 16 Semanas

---

> **Nota:** Para una visualización óptima, importar este documento a Excel/Google Sheets usando la tabla de la Sección 2, o abrir el archivo `Gantt_Chart.xlsx` incluido en la entrega.

---

## 1. CRONOGRAMA RESUMIDO (Vista ASCII)

```
TAREA                               S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14 S15 S16
                                   MAR MAR MAR MAR ABR ABR ABR ABR ABR MAY MAY MAY MAY MAY MAY MAY
─────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 1: PLANIFICACIÓN Y DISEÑO
1.1 Definición de requerimientos    ████
1.2 Arquitectura del sistema        ████████
1.3 Diseño de base de datos             ████████
1.4 Wireframes y diseño UI              ████████
1.5 Documentación EP1               ████████
─────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 2: DESARROLLO BACKEND
2.1 Configuración microservicios            ████████
2.2 Auth Service + JWT                      ████
2.3 User Service                                ████
2.4 Catalog Service (kits/campañas)             ████████
2.5 Order Service (pedidos/carrito)                 ████████
2.6 Support Service (tickets)                           ████
2.7 API Gateway                             ████
2.8 Pruebas backend                                     ████████
─────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 3: DESARROLLO FRONTEND
3.1 Setup Vite + React + Tailwind                           ████
3.2 BFF Layer (Axios + API modules)                        ████
3.3 AuthContext + layout + routing                         ████████
3.4 Páginas públicas (Home, Campaigns)                         ████
3.5 Páginas auth (Login, Register)                             ████
3.6 Módulo donante (Cart, Checkout)                                ████████
3.7 Order Tracking                                                     ████
3.8 Módulo beneficiario                                            ████████
3.9 Panel admin (Dashboard, Backoffice)                                    ████████
3.10 AdminUsers + AdminCatalog                                                 ████
─────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 4: INTEGRACIÓN Y PRUEBAS
4.1 Integración Frontend-Backend                                               ████████
4.2 Pruebas funcionales                                                            ████████
4.3 Corrección de bugs                                                                 ████
4.4 Pruebas de responsividad                                                           ████
─────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 5: DOCUMENTACIÓN Y CIERRE
5.1 Informe EP2                                                                    ████
5.2 UML + WireFrames                                                               ████
5.3 Plan de Pruebas                                                                    ████
5.4 Gantt + MER                                                                        ████
5.5 Preparación entrega final                                                              ████████
─────────────────────────────────────────────────────────────────────────────────────────────────────
HITOS
EP1 Entrega                         ●
EP2 Entrega                                                                                     ●
─────────────────────────────────────────────────────────────────────────────────────────────────────
```

Leyenda:
- `████` = Semana de trabajo activo
- `●` = Hito de entrega

---

## 2. TABLA DETALLADA DE TAREAS (para Excel/Sheets)

| ID | Tarea | Responsable | Inicio | Fin | Duración | Semana Inicio | Semana Fin | Dependencia | Estado |
|----|-------|------------|--------|-----|----------|--------------|-----------|------------|--------|
| 1.1 | Definición de requerimientos | Todos | 03/03/2026 | 13/03/2026 | 2 sem | S1 | S2 | — | ✅ Completado |
| 1.2 | Arquitectura del sistema | Líder | 03/03/2026 | 20/03/2026 | 2.5 sem | S1 | S3 | 1.1 | ✅ Completado |
| 1.3 | Diseño de base de datos | BD Developer | 10/03/2026 | 27/03/2026 | 2.5 sem | S2 | S4 | 1.2 | ✅ Completado |
| 1.4 | Wireframes y diseño UI | Frontend | 10/03/2026 | 27/03/2026 | 2.5 sem | S2 | S4 | 1.1 | ✅ Completado |
| 1.5 | Documentación EP1 | Todos | 03/03/2026 | 20/03/2026 | 2.5 sem | S1 | S3 | 1.1 | ✅ Completado |
| 2.1 | Config microservicios | Backend | 24/03/2026 | 10/04/2026 | 2.5 sem | S4 | S6 | 1.2, 1.3 | ✅ Completado |
| 2.2 | Auth Service + JWT | Backend | 24/03/2026 | 07/04/2026 | 2 sem | S4 | S5 | 2.1 | ✅ Completado |
| 2.3 | User Service | Backend | 31/03/2026 | 14/04/2026 | 2 sem | S5 | S6 | 2.1 | ✅ Completado |
| 2.4 | Catalog Service | Backend | 07/04/2026 | 24/04/2026 | 2.5 sem | S6 | S8 | 2.1 | ✅ Completado |
| 2.5 | Order Service | Backend | 14/04/2026 | 01/05/2026 | 2.5 sem | S7 | S9 | 2.4 | ✅ Completado |
| 2.6 | Support Service | Backend | 21/04/2026 | 07/05/2026 | 2 sem | S8 | S10 | 2.5 | ✅ Completado |
| 2.7 | API Gateway | Backend | 24/03/2026 | 14/04/2026 | 3 sem | S4 | S6 | 2.1 | ✅ Completado |
| 2.8 | Pruebas backend | Backend | 21/04/2026 | 08/05/2026 | 2.5 sem | S8 | S10 | 2.6 | ✅ Completado |
| 3.1 | Setup Vite + React | Frontend | 21/04/2026 | 28/04/2026 | 1 sem | S8 | S8 | 2.7 | ✅ Completado |
| 3.2 | BFF Layer | Frontend | 21/04/2026 | 28/04/2026 | 1 sem | S8 | S8 | 3.1 | ✅ Completado |
| 3.3 | AuthContext + layout | Frontend | 28/04/2026 | 08/05/2026 | 1.5 sem | S9 | S10 | 3.1, 3.2 | ✅ Completado |
| 3.4 | Páginas públicas | Frontend | 28/04/2026 | 05/05/2026 | 1 sem | S9 | S9 | 3.3 | ✅ Completado |
| 3.5 | Páginas auth | Frontend | 28/04/2026 | 05/05/2026 | 1 sem | S9 | S9 | 3.3 | ✅ Completado |
| 3.6 | Cart + Checkout | Frontend | 05/05/2026 | 12/05/2026 | 1.5 sem | S10 | S11 | 3.4 | ✅ Completado |
| 3.7 | Order Tracking | Frontend | 08/05/2026 | 12/05/2026 | 0.5 sem | S10 | S10 | 3.6 | ✅ Completado |
| 3.8 | Módulo beneficiario | Frontend | 05/05/2026 | 12/05/2026 | 1.5 sem | S10 | S11 | 3.3 | ✅ Completado |
| 3.9 | Panel admin | Frontend | 12/05/2026 | 19/05/2026 | 1.5 sem | S11 | S12 | 3.3 | ✅ Completado |
| 3.10 | AdminUsers + Catalog | Frontend | 12/05/2026 | 15/05/2026 | 0.5 sem | S11 | S11 | 3.9 | ✅ Completado |
| 4.1 | Integración FE-BE | Todos | 15/05/2026 | 22/05/2026 | 1.5 sem | S12 | S12 | 3.10, 2.8 | ✅ Completado |
| 4.2 | Pruebas funcionales | Todos | 15/05/2026 | 22/05/2026 | 1.5 sem | S12 | S13 | 4.1 | ✅ Completado |
| 4.3 | Corrección de bugs | Todos | 19/05/2026 | 22/05/2026 | 0.5 sem | S12 | S12 | 4.2 | ✅ Completado |
| 4.4 | Pruebas responsividad | Frontend | 19/05/2026 | 22/05/2026 | 0.5 sem | S12 | S12 | 4.2 | ✅ Completado |
| 5.1 | Informe EP2 | Todos | 15/05/2026 | 22/05/2026 | 1 sem | S12 | S12 | 4.1 | ✅ Completado |
| 5.2 | UML + WireFrames | Frontend | 15/05/2026 | 22/05/2026 | 1 sem | S12 | S12 | — | ✅ Completado |
| 5.3 | Plan de Pruebas | Todos | 19/05/2026 | 23/05/2026 | 0.5 sem | S12 | S13 | 4.2 | ✅ Completado |
| 5.4 | Gantt + MER | BD | 19/05/2026 | 23/05/2026 | 0.5 sem | S12 | S13 | — | ✅ Completado |
| 5.5 | Preparación entrega | Todos | 23/05/2026 | 30/05/2026 | 1 sem | S13 | S14 | 5.1-5.4 | ✅ Completado |

---

## 3. HITOS DEL PROYECTO

| Hito | Descripción | Fecha | Estado |
|------|-------------|-------|--------|
| M1 — EP1 | Entrega Evaluación Parcial 1 | 20/03/2026 | ✅ Completado |
| M2 — Backend Core | Auth + Users + Catalog operativos | 14/04/2026 | ✅ Completado |
| M3 — Backend Completo | Orders + Support + Gateway integrado | 08/05/2026 | ✅ Completado |
| M4 — Frontend Completo | Todas las páginas implementadas | 15/05/2026 | ✅ Completado |
| M5 — Integración | FE-BE integrado y probado | 22/05/2026 | ✅ Completado |
| M6 — EP2 | Entrega Evaluación Parcial 2 | 30/05/2026 | ✅ Completado |

---

## 4. DISTRIBUCIÓN DE TRABAJO POR INTEGRANTE

| Integrante | Área | Responsabilidades | % Dedicación |
|-----------|------|-------------------|-------------|
| [Integrante 1] | Backend | Auth Service, API Gateway, microservicios | 30% |
| [Integrante 2] | Backend | Order Service, Support Service, BD | 25% |
| [Integrante 3] | Frontend | BFF Layer, páginas públicas, autenticación | 25% |
| [Integrante 4] | Frontend/Docs | Módulos donante/admin, documentación | 20% |

---

## 5. CONTROL DE CAMBIOS

| Cambio | Sprint Afectado | Motivo | Impacto |
|--------|----------------|--------|---------|
| Migración a @tanstack/react-query | S8-S9 | Incompatibilidad react-query@3 con React 18 | +0.5 días |
| Agregar región/comuna a registro | S9 | Requerimiento nuevo del evaluador | +1 día |
| Refactorizar BFF para multipart | S10 | Bug en upload de comprobante | +0.5 días |

---

*Gantt elaborado para TPY1101 — EP2, Mayo 2026*
*Para editar: importar la tabla de la Sección 2 a Microsoft Excel o Google Sheets y aplicar formato de barras condicional*
