# UML DIAGRAMAS — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

---

## 1. DIAGRAMA DE CASOS DE USO

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DONATECH                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                MÓDULO PÚBLICO                            │   │
│  │  (UC01) Ver campañas activas                             │   │
│  │  (UC02) Ver detalle de campaña                           │   │
│  │  (UC03) Ver kits disponibles                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               MÓDULO AUTH                                │   │
│  │  (UC04) Iniciar sesión                                   │   │
│  │  (UC05) Registrarse como donante                         │   │
│  │  (UC06) Registrarse como beneficiario                    │   │
│  │  (UC07) Registrarse como organización                    │   │
│  │  (UC08) Cerrar sesión                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               MÓDULO DONANTE                             │   │
│  │  (UC09)  Agregar kit al carrito                          │   │
│  │  (UC10)  Ver y modificar carrito                         │   │
│  │  (UC11)  Iniciar proceso de checkout                     │   │
│  │  (UC12)  Ingresar datos de transferencia                 │   │
│  │  (UC13)  Subir comprobante de transferencia              │   │
│  │  (UC14)  Ver historial de donaciones                     │   │
│  │  (UC15)  Seguir estado de pedido en tiempo real          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             MÓDULO BENEFICIARIO                          │   │
│  │  (UC16) Crear nueva campaña                              │   │
│  │  (UC17) Ver dashboard con campañas propias               │   │
│  │  (UC18) Ver estado de donaciones recibidas               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               MÓDULO ADMIN                               │   │
│  │  (UC19) Ver dashboard con métricas                       │   │
│  │  (UC20) Aprobar transferencia bancaria                   │   │
│  │  (UC21) Rechazar transferencia con motivo                │   │
│  │  (UC22) Aprobar campaña de beneficiario                  │   │
│  │  (UC23) Rechazar campaña con motivo                      │   │
│  │  (UC24) Gestionar usuarios (activar/desactivar)          │   │
│  │  (UC25) Crear kit de emergencia                          │   │
│  │  (UC26) Cerrar campaña activa                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │          │           │          │          │
    ┌────┤     ┌────┤      ┌────┤     ┌────┤     ┌────┤
    │    │     │    │      │    │     │    │     │    │
 Visitante Donante Beneficiario Admin  Voluntario
 (anónimo)
```

### Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Visitante** | Usuario no autenticado, puede ver campañas públicas |
| **Donante** | Usuario registrado que realiza donaciones (ROLE_DONANTE, ROLE_EMPRESA) |
| **Beneficiario** | Usuario que crea campañas de ayuda (ROLE_BENEFICIARIO) |
| **Organización** | Puede crear campañas y donar (ROLE_ORGANIZACION) |
| **Administrador** | Control total del sistema (ROLE_ADMIN) |
| **Voluntario** | Valida transferencias y campañas (ROLE_VOLUNTARIO) |

---

## 2. DIAGRAMA DE CLASES — FRONTEND

```
┌──────────────────────────────────────────────────────────────┐
│                        App.jsx                               │
│ ─────────────────────────────────────────────────────────── │
│ + QueryClientProvider                                        │
│ + AuthProvider                                               │
│ + CartProvider                                               │
│ + BrowserRouter                                              │
│ + Routes (todos los routes)                                  │
└──────────────────────────────────────────────────────────────┘
                              │ usa
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   AuthContext    │ │   CartContext    │ │  QueryClient     │
│ ─────────────── │ │ ─────────────── │ │ ─────────────── │
│ - user: Object  │ │ - items: Array  │ │ - staleTime: 60s │
│ - token: String │ │ - total: Number │ │ - retry: 1       │
│ - loading: Bool │ │ ─────────────── │ └──────────────────┘
│ ─────────────── │ │ + addItem()     │
│ + login()       │ │ + removeItem()  │
│ + logout()      │ │ + updateQty()   │
│ + hasRole()     │ │ + clear()       │
│ + isAdmin       │ └──────────────────┘
│ + isDonante     │
│ + isBeneficiario│
│ + isValidador   │
└──────────────────┘
         │ usa
         ▼
┌──────────────────────────────┐
│       ProtectedRoute         │
│ ──────────────────────────── │
│ - allowedRoles: String[]     │
│ ──────────────────────────── │
│ + verifica isAuthenticated   │
│ + verifica roles             │
│ + redirige a /login          │
│ + redirige a /unauthorized   │
└──────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐
│     authApi      │     │    usersApi      │
│ ─────────────── │     │ ─────────────── │
│ + login()       │     │ + getAll()       │
│ + register()    │     │ + updateStatus() │
│ + registerBenef.│     │ + getRegiones()  │
│ + registerOrg() │     │ + getComunas()   │
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   catalogApi     │     │    ordersApi     │
│ ─────────────── │     │ ─────────────── │
│ + getKits()     │     │ + createDonation()│
│ + getCampaigns()│     │ + getDonations() │
│ + getActive()   │     │ + getHistory()   │
│ + getById()     │     │ + uploadProof()  │
│ + createKit()   │     │ + applyConpón()  │
│ + createCampaign│     └──────────────────┘
│ + closeCampaign │
└──────────────────┘     ┌──────────────────┐
                         │   supportsApi    │
                         │ ─────────────── │
                         │ + getAll()       │
                         │ + getByStatus()  │
                         │ + getByType()    │
                         │ + validateTrans()│
                         │ + validateCampa()│
                         └──────────────────┘
```

---

## 3. DIAGRAMA DE SECUENCIA — FLUJO DE DONACIÓN

```
Donante     CampaignDetailPage   CartContext   CheckoutPage   ordersApi   Backend
   │                │                │              │             │          │
   │  click "Donar" │                │              │             │          │
   │───────────────>│                │              │             │          │
   │                │ addItem(kit,id)│              │             │          │
   │                │───────────────>│              │             │          │
   │                │                │ items updated│             │          │
   │                │<───────────────│              │             │          │
   │   navega /donor/cart            │              │             │          │
   │<───────────────│                │              │             │          │
   │                                 │              │             │          │
   │  click "Proceder al pago"       │              │             │          │
   │─────────────────────────────────────────────>│              │          │
   │                                 │              │             │          │
   │  paso 1: revisión del pedido    │              │             │          │
   │  paso 2: datos transferencia    │              │             │          │
   │  sube comprobante              │              │             │          │
   │─────────────────────────────────────────────>│              │          │
   │                                 │              │             │          │
   │                                 │              │createDonation(data)    │
   │                                 │              │────────────>│          │
   │                                 │              │             │POST /api/donations
   │                                 │              │             │─────────>│
   │                                 │              │             │ {id:123} │
   │                                 │              │             │<─────────│
   │                                 │              │<────────────│          │
   │                                 │              │             │          │
   │                                 │              │uploadProof(id,file)    │
   │                                 │              │────────────>│          │
   │                                 │              │             │POST /api/donations/123/comprobante
   │                                 │              │             │─────────>│
   │                                 │              │             │ 200 OK   │
   │                                 │              │             │<─────────│
   │                                 │              │<────────────│          │
   │                                 │              │             │          │
   │  paso 3: confirmación           │              │             │          │
   │<─────────────────────────────────────────────│              │          │
   │  CartContext.clear()            │              │             │          │
   │─────────────────────────────────────────────>│              │          │
```

---

## 4. DIAGRAMA DE SECUENCIA — VALIDACIÓN DE TRANSFERENCIA

```
Voluntario  BackofficePage   supportsApi    Backend   ordersApi  Backend
    │               │              │            │          │        │
    │  carga página │              │            │          │        │
    │──────────────>│              │            │          │        │
    │               │ getByStatus('ABIERTO')    │          │        │
    │               │─────────────>│            │          │        │
    │               │              │GET /api/tickets?status=ABIERTO │
    │               │              │───────────>│          │        │
    │               │              │ [tickets]  │          │        │
    │               │              │<───────────│          │        │
    │               │<─────────────│            │          │        │
    │  click "Aprobar" ticket #45  │            │          │        │
    │──────────────>│              │            │          │        │
    │               │ validateTransfer(45, true)│          │        │
    │               │─────────────>│            │          │        │
    │               │              │POST /api/tickets/45/validate   │
    │               │              │───────────>│          │        │
    │               │              │            │ actualiza donación │
    │               │              │            │──────────>│        │
    │               │              │            │           │ PUT /api/orders/{id}/status
    │               │              │            │           │───────>│
    │               │              │            │           │ 200 OK │
    │               │              │            │           │<───────│
    │               │              │            │<──────────│        │
    │               │              │ 200 OK     │          │        │
    │               │              │<───────────│          │        │
    │               │ invalidateQueries(['tickets'])        │        │
    │               │ toast.success('Aprobado exitosamente')│        │
    │               │<─────────────│            │          │        │
    │  vista actualizada           │            │          │        │
    │<──────────────│              │            │          │        │
```

---

## 5. DIAGRAMA DE SECUENCIA — AUTENTICACIÓN JWT

```
Usuario     LoginPage    AuthContext    authApi    Backend   localStorage
   │             │             │           │          │            │
   │ ingresa     │             │           │          │            │
   │ credenciales│             │           │          │            │
   │────────────>│             │           │          │            │
   │             │ login(email,pass)       │          │            │
   │             │────────────>│           │          │            │
   │             │             │ authApi.login(data)  │            │
   │             │             │──────────>│          │            │
   │             │             │           │POST /api/auth/login   │
   │             │             │           │─────────>│            │
   │             │             │           │{token,user}           │
   │             │             │           │<─────────│            │
   │             │             │<──────────│          │            │
   │             │             │           │          │            │
   │             │             │setItem('token', token)            │
   │             │             │───────────────────────────────────>
   │             │             │setItem('user', JSON.stringify(user))
   │             │             │───────────────────────────────────>
   │             │             │           │          │            │
   │             │ redirect según rol      │          │            │
   │             │<────────────│           │          │            │
   │<────────────│             │           │          │            │
   │             │             │           │          │            │
   │ ... más tarde, nueva petición         │          │            │
   │             │             │           │          │            │
   │             │ useEffect() lee localStorage       │            │
   │             │────────────>│           │          │            │
   │             │             │getItem('token')       │            │
   │             │             │<──────────────────────────────────│
   │             │             │ axios interceptor agrega Bearer   │
   │             │             │──────────>│          │            │
```

---

## 6. DIAGRAMA DE COMPONENTES FRONTEND

```
                        ┌─────────────────┐
                        │   index.html    │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   main.jsx      │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │    App.jsx      │
                        │ (Router + CTX)  │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼───────┐ ┌────────▼───────┐ ┌────────▼────────┐
     │  AuthContext   │ │  CartContext   │ │  MainLayout     │
     └────────────────┘ └────────────────┘ └────────┬────────┘
                                                      │
                         ┌────────────────────────────┤
                         │              │             │
               ┌─────────▼──────┐ ┌────▼────┐ ┌─────▼─────┐
               │    Navbar      │ │ Outlet  │ │  Footer   │
               └────────────────┘ └────┬────┘ └───────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │           │               │           │               │
   ┌────────▼────┐ ┌────▼─────┐ ┌──────▼────┐ ┌───▼──────┐ ┌──────▼────┐
   │  Páginas   │ │  Auth    │ │  Donor   │ │Benefic.  │ │  Admin   │
   │  Públicas  │ │  Pages   │ │  Pages   │ │  Pages   │ │  Pages   │
   └────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
         │               │           │           │              │
   ┌─────▼─────┐  ┌──────▼──────┐  ┌▼──────────────────────────▼─────┐
   │CampaignCard│  │ProtectedRoute│ │        UI Components              │
   │LoadingSpinner│ └─────────────┘ │  StatusBadge, LoadingSpinner,    │
   │EmptyState  │                   │  EmptyState                      │
   └────────────┘                   └──────────────────────────────────┘
```

---

## 7. DIAGRAMA DE ESTADOS — CICLO DE VIDA DE UNA DONACIÓN

```
                    ┌─────────────────┐
                    │   INGRESADA     │  ← Creada por el donante
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   VALIDANDO     │  ← Voluntario revisa comprobante
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐         ┌──────────────────┐
     │    RECHAZADA    │         │    VALIDADA      │
     │ (con motivo)    │         │                  │
     └─────────────────┘         └────────┬─────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │ EN_PREPARACION  │  ← Equipo prepara el kit
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   EN_CAMINO     │  ← Despacho al beneficiario
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   ENTREGADA     │  ← Confirmación de entrega
                                 └─────────────────┘
```

---

## 8. DIAGRAMA DE DEPLOYMENT

```
┌──────────────────────────────────────────────────────────────┐
│                    ENTORNO DE DESARROLLO                       │
│                                                               │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │   Navegador Web     │    │      Servidor Local         │  │
│  │   (Chrome/Firefox)  │    │                             │  │
│  │                     │    │  ┌─────────────────────┐    │  │
│  │  React SPA (Vite)   │    │  │  API Gateway :8080  │    │  │
│  │  localhost:5173     │───>│  │  Spring Cloud GW    │    │  │
│  │                     │    │  └──────────┬──────────┘    │  │
│  └─────────────────────┘    │             │               │  │
│                              │  ┌──────────┴──────────┐   │  │
│                              │  │   Microservicios    │   │  │
│                              │  │  :8081 :8082 :8083  │   │  │
│                              │  │  :8084 :8085 :8086  │   │  │
│                              │  └──────────┬──────────┘   │  │
│                              │             │               │  │
│                              │  ┌──────────▼──────────┐   │  │
│                              │  │    MySQL :3306      │   │  │
│                              │  └─────────────────────┘   │  │
│                              └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

*Diagramas UML elaborados para TPY1101 — EP2, Mayo 2026*
*Nota: Para implementación visual, se recomienda usar draw.io, Lucidchart o PlantUML*
