# WIREFRAMES — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

> **Nota:** Los wireframes están representados en formato ASCII para la documentación. Para la presentación final, se recomienda crear versiones en Figma o draw.io.

---

## WF-01: PÁGINA DE INICIO (HomePage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR: [Logo Donatech]        [Campañas][Sobre Nosotros]  [Login] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║          HERO SECTION — Gradiente Azul → Rojo               ║  │
│  ║                                                             ║  │
│  ║  Cada donación                                             ║  │
│  ║  transforma una vida    ┌─────────────────────┐           ║  │
│  ║                         │ 🔴 "Dona ahora"    │           ║  │
│  ║  Conectamos donantes    │     [BOTÓN]         │           ║  │
│  ║  con quienes más lo     └─────────────────────┘           ║  │
│  ║  necesitan.                                               ║  │
│  ║  [Explorar Campañas]  [Cómo Funciona ↓]                 ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ 1,234       │  │ 89          │  │ 500+        │  │ 24/7      │ │
│  │ DONACIONES  │  │ CAMPAÑAS    │  │ KITS        │  │ SOPORTE   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│                                                                     │
│  ═══ CÓMO FUNCIONA ═══                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ 1.Regís- │→ │ 2.Explora│→ │ 3.Agrega │→ │ 4.Confirma dona.│   │
│  │  trate   │  │ campañas │  │ al carro │  │ con transferencia│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│  ═══ CAMPAÑAS ACTIVAS ═══                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │  [Imagen]     │  │  [Imagen]     │  │  [Imagen]     │          │
│  │  Campaña A    │  │  Campaña B    │  │  Campaña C    │          │
│  │  📍 Santiago  │  │  📍 Valparaíso│  │  📍 Biobío   │          │
│  │  [Ver campaña]│  │  [Ver campaña]│  │  [Ver campaña]│          │
│  └───────────────┘  └───────────────┘  └───────────────┘          │
│                  [Ver todas las campañas →]                         │
│                                                                     │
│  ═══ ¿ERES BENEFICIARIO? ═══                                        │
│  ╔═════════════════════════════════════════════════════════════╗    │
│  ║  Crea una campaña y recibe donaciones para tu comunidad    ║    │
│  ║                         [Crear campaña]                   ║    │
│  ╚═════════════════════════════════════════════════════════════╝    │
├─────────────────────────────────────────────────────────────────────┤
│  FOOTER: Logo | Links | © 2026 Donatech                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-02: LISTADO DE CAMPAÑAS (CampaignsPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Campañas Activas                                                   │
│  ┌─────────────────────────────────────────────┐                   │
│  │ 🔍 Buscar campaña por nombre o ubicación... │                   │
│  └─────────────────────────────────────────────┘                   │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │ ████████████ │  │ ████████████ │  │ ████████████ │          │
│  │ (gradiente)  │  │ (gradiente)  │  │ (gradiente)  │          │
│  │ ACTIVA 🟢   │  │ ACTIVA 🟢   │  │ ACTIVA 🟢   │          │
│  │ Campaña Alfa │  │ Campaña Beta │  │ Campaña Gamma│          │
│  │ 📍 Santiago  │  │ 📍 Valparaíso│  │ 📍 Concepción│          │
│  │ Descripción  │  │ Descripción  │  │ Descripción  │          │
│  │ breve de la  │  │ breve de la  │  │ breve de la  │          │
│  │ necesidad... │  │ necesidad... │  │ necesidad... │          │
│  │[Ver campaña →]│  │[Ver campaña →]│  │[Ver campaña →]│          │
│  └───────────────┘  └───────────────┘  └───────────────┘          │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │ ...           │  │ ...           │  │ ...           │          │
│  └───────────────┘  └───────────────┘  └───────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-03: DETALLE DE CAMPAÑA (CampaignDetailPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR  [← Volver a campañas]                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  GRADIENTE AZUL — Nombre de la Campaña          ACTIVA 🟢  ║  │
│  ║  📍 Región — Comuna                                          ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Descripción completa de la campaña...                       │  │
│  │                                                              │  │
│  │  Esta campaña tiene como objetivo...                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ═══ KITS DISPONIBLES ═══                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │ 📦           │  │ 📦           │  │ 📦           │          │
│  │ Kit Alimentación│  │ Kit Higiene  │  │ Kit Ropa     │          │
│  │ $25.000 CLP  │  │ $15.000 CLP  │  │ $30.000 CLP  │          │
│  │ Incluye 12   │  │ Incluye 8    │  │ Incluye 15   │          │
│  │ productos    │  │ productos    │  │ productos    │          │
│  │ [+ Agregar]  │  │ [+ Agregar]  │  │ [+ Agregar]  │          │
│  └───────────────┘  └───────────────┘  └───────────────┘          │
│                                                                     │
│  * Debes estar registrado como donante para donar                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-04: LOGIN (LoginPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐   │
│  │                          │ │                                │   │
│  │  ████████████████████   │ │   Iniciar Sesión               │   │
│  │  (Panel gradiente azul) │ │                                │   │
│  │                          │ │  Correo electrónico            │   │
│  │   🤝 Donatech            │ │  ┌────────────────────────┐   │   │
│  │                          │ │  │ correo@ejemplo.cl      │   │   │
│  │   Conectando donantes    │ │  └────────────────────────┘   │   │
│  │   con quienes más lo     │ │                                │   │
│  │   necesitan.             │ │  Contraseña                    │   │
│  │                          │ │  ┌────────────────────────┐   │   │
│  │                          │ │  │ ••••••••               │   │   │
│  │   "Cada donación es una  │ │  └────────────────────────┘   │   │
│  │    esperanza más para    │ │                                │   │
│  │    el mundo"             │ │  ┌────────────────────────┐   │   │
│  │                          │ │  │   INGRESAR             │   │   │
│  │                          │ │  └────────────────────────┘   │   │
│  │                          │ │                                │   │
│  │                          │ │  ¿No tienes cuenta?            │   │
│  │                          │ │  [Registrarse →]               │   │
│  │                          │ │                                │   │
│  └──────────────────────────┘ └────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-05: REGISTRO (RegisterPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              Crear Cuenta en Donatech                               │
│                                                                     │
│  Tipo de cuenta:                                                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │ 🧑 Donante    │ │ 🏠 Beneficiario│ │ 🏢 Organización│         │
│  │ (seleccionado) │ │                │ │                │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │ Nombre completo        │  │ RUT (si beneficiario)  │           │
│  └────────────────────────┘  └────────────────────────┘           │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │ Correo electrónico     │  │ Teléfono               │           │
│  └────────────────────────┘  └────────────────────────┘           │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │ Contraseña             │  │ Confirmar contraseña   │           │
│  └────────────────────────┘  └────────────────────────┘           │
│                                                                     │
│  [Si beneficiario — campos extra:]                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │ Región ▼               │  │ Comuna ▼               │           │
│  └────────────────────────┘  └────────────────────────┘           │
│  ┌─────────────────────────────────────────────────────┐          │
│  │ Dirección completa                                  │          │
│  └─────────────────────────────────────────────────────┘          │
│                                                                     │
│  ☐ Acepto los términos y condiciones (Ley 19.628)                  │
│                                                                     │
│  ┌──────────────────────────────────────┐                          │
│  │           CREAR CUENTA               │                          │
│  └──────────────────────────────────────┘                          │
│  ¿Ya tienes cuenta? [Inicia sesión →]                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-06: CARRITO DE DONACIÓN (CartPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Tu Carrito de Donación                                             │
│                                                                     │
│  ┌────────────────────────────────────────┐  ┌─────────────────┐  │
│  │                                        │  │  RESUMEN        │  │
│  │  📦 Kit Alimentación                  │  │                 │  │
│  │  $25.000 CLP        [−] 2 [+]  [🗑️]  │  │  Subtotal:      │  │
│  │                                        │  │  $50.000 CLP    │  │
│  │  📦 Kit Higiene                       │  │                 │  │
│  │  $15.000 CLP        [−] 1 [+]  [🗑️]  │  │  ─────────────  │  │
│  │                                        │  │  Total:         │  │
│  │                                        │  │  $65.000 CLP    │  │
│  └────────────────────────────────────────┘  │                 │  │
│                                              │  [Proceder al   │  │
│  [← Seguir donando]                          │   pago →]       │  │
│                                              └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-07: CHECKOUT (CheckoutPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [1 Revisión] ──── [2 Transferencia] ──── [3 Confirmación]         │
│   (activo)                                                          │
│                                                                     │
│  ─────── PASO 1: Revisión ─────────────────────────────────────    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 2x Kit Alimentación                           $50.000 CLP  │   │
│  │ 1x Kit Higiene                                $15.000 CLP  │   │
│  │ ─────────────────────────────────────────────────────────  │   │
│  │ Total:                                        $65.000 CLP  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Código de cupón:                                                   │
│  ┌──────────────────────────────────┐ [Aplicar]                    │
│  │                                  │                              │
│  └──────────────────────────────────┘                              │
│                                                                     │
│  ─────── PASO 2: Transferencia ────────────────────────────────    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Banco: BancoEstado                                         │   │
│  │  Tipo: Cuenta Vista                                         │   │
│  │  Número: 000-1234567-89                                     │   │
│  │  RUT: 12.345.678-9                                          │   │
│  │  Nombre: Fundación Donatech                                 │   │
│  │  Email: donaciones@donatech.cl                              │   │
│  │  Monto: $65.000 CLP                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Sube tu comprobante:                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📎  Arrastra o haz clic para subir el comprobante         │   │
│  │      Formatos: JPG, PNG, PDF. Máx. 5MB                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                  [Confirmar Donación →]                             │
│                                                                     │
│  ─────── PASO 3: Confirmación ──────────────────────────────────   │
│  ✅ ¡Donación registrada exitosamente!                              │
│  Pedido #12345 — será procesado en 24-48 hrs hábiles                │
│  [Ver seguimiento del pedido]  [Seguir donando]                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-08: SEGUIMIENTO DE PEDIDO (OrderTrackingPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Seguimiento — Pedido #12345                                        │
│  Campaña: "Ayuda Familia González, Santiago"                        │
│                                                                     │
│  ●── INGRESADA ✅                                                   │
│  │   15 Mayo 2026, 14:32                                            │
│  │                                                                  │
│  ●── VALIDANDO ✅                                                   │
│  │   15 Mayo 2026, 16:45                                            │
│  │                                                                  │
│  ●── VALIDADA ✅                                                    │
│  │   16 Mayo 2026, 09:10                                            │
│  │                                                                  │
│  ◉── EN_PREPARACION 🔵 ← ESTADO ACTUAL                             │
│  │   16 Mayo 2026, 10:00                                            │
│  │                                                                  │
│  ○── EN_CAMINO ⬜ (pendiente)                                       │
│  │                                                                  │
│  ○── ENTREGADA ⬜ (pendiente)                                       │
│                                                                     │
│  ─── Historial ──────────────────────────────────────────────────  │
│  │ 16/05 09:10  VALIDADA por Voluntario Juan P.                 │   │
│  │ 15/05 16:45  VALIDANDO — ticket #456 abierto                 │   │
│  │ 15/05 14:32  INGRESADA — donación creada                     │   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-09: DASHBOARD ADMINISTRADOR (AdminDashboard)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR (con menú Admin)                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Panel de Administración                                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │ 12           │  │ 5            │  │ 89           │  │ 2      │ │
│  │ Tickets      │  │ Transferencias│  │ Campañas     │  │Campañas│ │
│  │ Abiertos     │  │ Pendientes   │  │ Activas      │  │Pendientes│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────┘ │
│                                                                     │
│  ─── Pedidos por Estado ─────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  400 ┤████████████████████████████████                     │   │
│  │  300 ┤══════════════════════════════                       │   │
│  │  200 ┤═══════════════════════                              │   │
│  │  100 ┤══════════                                           │   │
│  │    0 ┼──────────────────────────────────────────────       │   │
│  │      INGRESADA VALIDANDO VALIDADA EN_PREP EN_CAMINO ENTREGADA│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─── Acciones Rápidas ───────────────────────────────────────────  │
│  [Ir a Backoffice]  [Gestionar Usuarios]  [Catálogo de Kits]       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-10: BACKOFFICE DE VALIDACIÓN (BackofficePage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Backoffice de Validación                                           │
│                                                                     │
│  Filtrar por tipo: [Todos] [Transferencias] [Campañas] [Soporte]   │
│  Estado: [ABIERTO] [EN_PROCESO] [RESUELTO]                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Ticket #45          ABIERTO 🟡          VALIDACION_TRANS.  │   │
│  │  Comprobante de transferencia por $65.000 CLP, donación #89 │   │
│  │  Donación: #89                                              │   │
│  │                              [✅ Aprobar]  [❌ Rechazar]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Ticket #44          ABIERTO 🟡          VALIDACION_CAMPAÑA │   │
│  │  Nueva campaña "Familia López, Concepción"                  │   │
│  │                              [✅ Aprobar]  [❌ Rechazar]    │   │
│  │                                                             │   │
│  │  [si se hace click en Rechazar:]                            │   │
│  │  Motivo del rechazo:                                        │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ La documentación aportada es insuficiente...        │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  [Confirmar rechazo]  [Cancelar]                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-11: GESTIÓN DE USUARIOS (AdminUsersPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Gestión de Usuarios    124 usuarios registrados                    │
│                                                                     │
│  ┌──────────────────────────────────────────────┐                  │
│  │ 🔍 Buscar por nombre o correo...             │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Usuario        │ Correo          │ Rol        │ Estado│Acción│  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Juan Pérez     │ juan@mail.cl    │ DONANTE    │ 🟢 Act│[Desc]│  │
│  │ María López    │ maria@mail.cl   │ BENEFIC.   │ 🟢 Act│[Desc]│  │
│  │ Carlos Ruiz    │ carlos@mail.cl  │ VOLUNTARIO │ 🔴 Ina│[Act] │  │
│  │ Ana Torres     │ ana@mail.cl     │ ADMIN      │ 🟢 Act│[Desc]│  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WF-12: CREAR CAMPAÑA (CreateCampaignPage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Crear Nueva Campaña                                                │
│  Tu solicitud será revisada por nuestro equipo                      │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Título de la campaña                                       │    │
│  │ ┌──────────────────────────────────────────────────────┐  │    │
│  │ │ Ej: Ayuda urgente familia González, Santiago         │  │    │
│  │ └──────────────────────────────────────────────────────┘  │    │
│  │                                                            │    │
│  │ Descripción                                                │    │
│  │ ┌──────────────────────────────────────────────────────┐  │    │
│  │ │                                                      │  │    │
│  │ │ Describe la situación, quiénes son beneficiados     │  │    │
│  │ │ y por qué necesitan ayuda...                        │  │    │
│  │ └──────────────────────────────────────────────────────┘  │    │
│  │                                                            │    │
│  │ Motivo principal                                           │    │
│  │ ┌──────────────────────────────────────────────────────┐  │    │
│  │ │ Explica brevemente la urgencia...                    │  │    │
│  │ └──────────────────────────────────────────────────────┘  │    │
│  │                                                            │    │
│  │ Región            ▼   │   Comuna              ▼          │    │
│  │ ┌─────────────────┐   │   ┌─────────────────────┐        │    │
│  │ │ Metropolitana   │   │   │ Santiago             │        │    │
│  │ └─────────────────┘   │   └─────────────────────┘        │    │
│  │                                                            │    │
│  │  [Cancelar]                         [Enviar campaña →]    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## GUÍA DE ESTILOS

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary Blue Dark | `#1e3a8a` | Fondo navbar, botones primarios |
| Primary Blue | `#1d4ed8` | Gradientes, acciones |
| Primary Blue Light | `#3b82f6` | Hover estados |
| Danger Red | `#dc2626` | Botones de peligro, alertas |
| Red Light | `#fee2e2` | Fondos de alerta |
| Success Green | `#16a34a` | Badges activo, botones de confirmación |
| Warning Yellow | `#d97706` | Estado en proceso |
| Gray Light | `#f9fafb` | Fondos de cards |
| White | `#ffffff` | Fondos principales |

### Tipografía
- **Familia:** Inter (Google Fonts)
- **Heading:** `font-bold text-gray-900`
- **Body:** `text-gray-600`
- **Labels:** `text-xs font-medium text-gray-700`

### Componentes Recurrentes
- **Cards:** `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- **Botón Primario:** `bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 py-2`
- **Input:** `border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500`
- **Badge:** `rounded-full px-2 py-0.5 text-xs font-medium`

---

*Wireframes elaborados para TPY1101 — EP2, Mayo 2026*
