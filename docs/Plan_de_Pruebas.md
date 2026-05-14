# PLAN DE PRUEBAS — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

---

| Campo | Detalle |
|-------|---------|
| **Proyecto** | Donatech — Plataforma de Donaciones Humanitarias |
| **Versión** | 1.0 |
| **Fecha** | Mayo 2026 |
| **Responsable de Pruebas** | Equipo Donatech |

---

## 1. OBJETIVOS DEL PLAN DE PRUEBAS

- Verificar que todas las funcionalidades del frontend se comportan según los requerimientos definidos en EP1.
- Asegurar la correcta integración entre el frontend React y el backend de microservicios.
- Validar que el sistema de autenticación y autorización por roles funciona correctamente.
- Confirmar que el flujo completo de donación (explorar → carrito → checkout → tracking) es funcional.
- Verificar la responsividad y usabilidad en distintos dispositivos.

---

## 2. ALCANCE DE LAS PRUEBAS

### 2.1 Incluido
- Pruebas funcionales de todas las páginas y componentes
- Pruebas de autenticación y control de acceso
- Pruebas de integración con la API REST del backend
- Pruebas de responsividad (desktop, tablet, mobile)
- Pruebas de validación de formularios

### 2.2 Excluido
- Pruebas de rendimiento bajo carga (no aplica en entorno universitario)
- Pruebas de seguridad (penetration testing)
- Pruebas automatizadas (se realizan de forma manual)

---

## 3. ENTORNO DE PRUEBAS

### 3.1 Entorno de Desarrollo

| Componente | Descripción |
|-----------|-------------|
| **Frontend** | http://localhost:5173 (Vite dev server) |
| **Backend** | http://localhost:8080 (Spring Boot API Gateway) |
| **Base de Datos** | MySQL en localhost:3306 |
| **Navegadores** | Chrome 120+, Firefox 120+, Edge 120+ |
| **OS** | Windows 11 |

### 3.2 Usuarios de Prueba

| Rol | Email | Contraseña | Propósito |
|-----|-------|-----------|---------|
| Admin | admin@donatech.cl | Admin123! | Pruebas de panel admin |
| Donante | donante@test.cl | Test123! | Pruebas de flujo donación |
| Beneficiario | beneficiario@test.cl | Test123! | Pruebas de creación campaña |
| Voluntario | voluntario@test.cl | Test123! | Pruebas de validación |
| Empresa | empresa@test.cl | Test123! | Pruebas de donante empresarial |

---

## 4. CASOS DE PRUEBA

### 4.1 Módulo de Autenticación

#### CP-AUTH-001: Login exitoso con rol DONANTE
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-001 |
| **Nombre** | Login exitoso - Donante |
| **Precondición** | Usuario donante registrado en BD |
| **Datos de entrada** | email: donante@test.cl, password: Test123! |
| **Pasos** | 1. Navegar a /login; 2. Ingresar credenciales; 3. Click "Ingresar" |
| **Resultado esperado** | Redirige a /campaigns. Token JWT guardado en localStorage |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-002: Login exitoso con rol ADMIN
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-002 |
| **Nombre** | Login exitoso - Admin |
| **Precondición** | Usuario admin registrado en BD |
| **Datos de entrada** | email: admin@donatech.cl, password: Admin123! |
| **Pasos** | 1. Navegar a /login; 2. Ingresar credenciales; 3. Click "Ingresar" |
| **Resultado esperado** | Redirige a /admin/dashboard |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-003: Login con credenciales inválidas
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-003 |
| **Nombre** | Login fallido |
| **Precondición** | Ninguna |
| **Datos de entrada** | email: malo@test.cl, password: wrongpass |
| **Pasos** | 1. Navegar a /login; 2. Ingresar credenciales incorrectas; 3. Click "Ingresar" |
| **Resultado esperado** | Toast de error "Credenciales inválidas". Permanece en /login |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-004: Acceso a ruta protegida sin autenticación
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-004 |
| **Nombre** | Ruta protegida sin token |
| **Precondición** | Sin sesión activa (localStorage vacío) |
| **Datos de entrada** | URL directa: /admin/dashboard |
| **Pasos** | 1. Abrir navegador; 2. Navegar directamente a /admin/dashboard |
| **Resultado esperado** | Redirige a /login |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-005: Acceso con rol insuficiente
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-005 |
| **Nombre** | Rol insuficiente - DONANTE accede a /admin |
| **Precondición** | Sesión activa con rol DONANTE |
| **Datos de entrada** | URL: /admin/dashboard |
| **Pasos** | 1. Login como DONANTE; 2. Navegar a /admin/dashboard |
| **Resultado esperado** | Redirige a /unauthorized |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-006: Registro de donante
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-006 |
| **Nombre** | Registro exitoso - Donante |
| **Precondición** | Email no registrado en BD |
| **Datos de entrada** | Nombre, email nuevo, contraseña, tipo: Donante |
| **Pasos** | 1. Ir a /register; 2. Seleccionar "Donante"; 3. Completar formulario; 4. Click "Crear Cuenta" |
| **Resultado esperado** | Toast de éxito, redirige a /login |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-AUTH-007: Registro de beneficiario con campos extra
| Campo | Detalle |
|-------|---------|
| **ID** | CP-AUTH-007 |
| **Nombre** | Registro exitoso - Beneficiario |
| **Precondición** | Email no registrado en BD |
| **Datos de entrada** | Nombre, email, contraseña, RUT, dirección, región, comuna |
| **Pasos** | 1. Ir a /register; 2. Seleccionar "Beneficiario"; 3. Completar todos los campos incluyendo RUT, región, comuna; 4. Click "Crear Cuenta" |
| **Resultado esperado** | Toast de éxito, usuario creado con rol BENEFICIARIO |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

---

### 4.2 Módulo Público — Campañas

#### CP-PUB-001: Listado de campañas activas
| Campo | Detalle |
|-------|---------|
| **ID** | CP-PUB-001 |
| **Nombre** | Ver campañas activas |
| **Precondición** | Al menos una campaña ACTIVA en BD |
| **Pasos** | 1. Navegar a /campaigns |
| **Resultado esperado** | Grid con CampaignCards mostrando campañas ACTIVA |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-PUB-002: Búsqueda de campaña
| Campo | Detalle |
|-------|---------|
| **ID** | CP-PUB-002 |
| **Nombre** | Filtrar campañas por texto |
| **Precondición** | Campañas activas en BD |
| **Datos de entrada** | Texto: "Santiago" |
| **Pasos** | 1. Ir a /campaigns; 2. Escribir "Santiago" en búsqueda |
| **Resultado esperado** | Solo se muestran campañas que contengan "Santiago" en título o descripción |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-PUB-003: Ver detalle de campaña
| Campo | Detalle |
|-------|---------|
| **ID** | CP-PUB-003 |
| **Nombre** | Detalle de campaña |
| **Precondición** | Campaña activa con kits asociados |
| **Pasos** | 1. Ir a /campaigns; 2. Click en "Ver campaña" de una campaña |
| **Resultado esperado** | Página de detalle con descripción y kits disponibles |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

---

### 4.3 Módulo Donante — Carrito y Checkout

#### CP-DONOR-001: Agregar kit al carrito
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-001 |
| **Nombre** | Agregar kit - autenticado |
| **Precondición** | Sesión activa como DONANTE. Campaña con kits |
| **Pasos** | 1. Ir a detalle de campaña; 2. Click "Donar" en un kit |
| **Resultado esperado** | Toast "Kit agregado al carrito". Contador en Navbar +1 |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-002: Agregar kit sin autenticación
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-002 |
| **Nombre** | Agregar kit - sin sesión |
| **Precondición** | Sin sesión activa |
| **Pasos** | 1. Ir a detalle de campaña; 2. Click "Donar" |
| **Resultado esperado** | Toast de error indicando que debe iniciar sesión |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-003: Modificar cantidad en carrito
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-003 |
| **Nombre** | Incrementar/decrementar cantidad |
| **Precondición** | Al menos un item en carrito |
| **Pasos** | 1. Ir a /donor/cart; 2. Click en [+] y [−] |
| **Resultado esperado** | Cantidad se actualiza. Total se recalcula automáticamente |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-004: Eliminar item del carrito
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-004 |
| **Nombre** | Remover item carrito |
| **Precondición** | Al menos un item en carrito |
| **Pasos** | 1. Ir a /donor/cart; 2. Click en ícono de papelera |
| **Resultado esperado** | Item eliminado del carrito. Total actualizado |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-005: Proceso de checkout completo
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-005 |
| **Nombre** | Checkout completo con comprobante |
| **Precondición** | Sesión activa DONANTE. Items en carrito. Backend operativo |
| **Pasos** | 1. Ir a /donor/checkout; 2. Revisar pedido (paso 1); 3. Subir comprobante JPG (paso 2); 4. Confirmar |
| **Resultado esperado** | Donación creada, comprobante subido, paso 3 muestra confirmación con ID de donación |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-006: Ver historial de donaciones
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-006 |
| **Nombre** | Historial de donaciones |
| **Precondición** | Al menos una donación previa como DONANTE |
| **Pasos** | 1. Ir a /donor/history |
| **Resultado esperado** | Lista de donaciones con estado, fecha y detalles |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-DONOR-007: Seguimiento de pedido
| Campo | Detalle |
|-------|---------|
| **ID** | CP-DONOR-007 |
| **Nombre** | Timeline de seguimiento |
| **Precondición** | Donación existente accesible por ID |
| **Pasos** | 1. Desde historial, click en "Ver seguimiento" de una donación |
| **Resultado esperado** | Timeline con estados marcados. Estado actual resaltado |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

---

### 4.4 Módulo Beneficiario

#### CP-BENEF-001: Crear campaña
| Campo | Detalle |
|-------|---------|
| **ID** | CP-BENEF-001 |
| **Nombre** | Crear nueva campaña |
| **Precondición** | Sesión activa como BENEFICIARIO |
| **Datos de entrada** | Título, descripción, motivo, región: Metropolitana, comuna: Santiago |
| **Pasos** | 1. Ir a /beneficiary/campaign; 2. Completar formulario; 3. Click "Enviar campaña" |
| **Resultado esperado** | Toast de éxito. Campaña creada en estado PENDIENTE |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-BENEF-002: Selector de región/comuna en cascada
| Campo | Detalle |
|-------|---------|
| **ID** | CP-BENEF-002 |
| **Nombre** | Dependencia región-comuna |
| **Precondición** | Sesión activa como BENEFICIARIO |
| **Pasos** | 1. Ir a /beneficiary/campaign; 2. Seleccionar región; 3. Verificar que comunas se actualicen |
| **Resultado esperado** | Al cambiar región, dropdown de comunas muestra solo las comunas de esa región |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

---

### 4.5 Módulo Administrador

#### CP-ADMIN-001: Ver dashboard con métricas
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-001 |
| **Nombre** | Dashboard admin |
| **Precondición** | Sesión activa como ADMIN. Datos en BD |
| **Pasos** | 1. Login como ADMIN; 2. Ir a /admin/dashboard |
| **Resultado esperado** | Cards con métricas (tickets, campañas). Gráfico de barras de pedidos por estado |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-ADMIN-002: Aprobar transferencia
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-002 |
| **Nombre** | Validar transferencia positiva |
| **Precondición** | Ticket ABIERTO de tipo VALIDACION_TRANSFERENCIA en BD |
| **Pasos** | 1. Ir a /admin/backoffice; 2. Filtrar por "Transferencias"; 3. Click "Aprobar" en ticket |
| **Resultado esperado** | Toast "Aprobado exitosamente". Ticket desaparece de la vista ABIERTO |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-ADMIN-003: Rechazar campaña con motivo
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-003 |
| **Nombre** | Rechazar campaña con motivo |
| **Precondición** | Ticket ABIERTO de tipo VALIDACION_CAMPAÑA |
| **Pasos** | 1. Ir a /admin/backoffice; 2. Click "Rechazar"; 3. Ingresar motivo; 4. Click "Confirmar rechazo" |
| **Resultado esperado** | Toast "Rechazado". Ticket cerrado. Campaña queda en estado RECHAZADA |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-ADMIN-004: Buscar usuario
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-004 |
| **Nombre** | Búsqueda de usuario |
| **Precondición** | Usuarios registrados en BD |
| **Datos de entrada** | Búsqueda: "Juan" |
| **Pasos** | 1. Ir a /admin/users; 2. Escribir "Juan" en búsqueda |
| **Resultado esperado** | Tabla filtrada mostrando solo usuarios con "Juan" en nombre o email |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-ADMIN-005: Desactivar usuario
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-005 |
| **Nombre** | Desactivar cuenta de usuario |
| **Precondición** | Usuario ACTIVO en BD |
| **Pasos** | 1. Ir a /admin/users; 2. Encontrar usuario activo; 3. Click "Desactivar" |
| **Resultado esperado** | Toast de éxito. Badge cambia a "Inactivo". Botón cambia a "Activar" |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

#### CP-ADMIN-006: Crear kit de emergencia
| Campo | Detalle |
|-------|---------|
| **ID** | CP-ADMIN-006 |
| **Nombre** | Crear nuevo kit |
| **Precondición** | Sesión activa como ADMIN |
| **Datos de entrada** | Nombre: "Kit Invierno", Precio: 35000, Descripción: "Kit de abrigo" |
| **Pasos** | 1. Ir a /admin/catalog; 2. Click "Nuevo Kit"; 3. Completar formulario; 4. Click "Crear kit" |
| **Resultado esperado** | Toast de éxito. Kit aparece en el grid |
| **Resultado obtenido** | ✅ PASS |
| **Estado** | Aprobado |

---

## 5. PRUEBAS DE RESPONSIVIDAD

| ID | Componente | Mobile (375px) | Tablet (768px) | Desktop (1920px) |
|----|-----------|---------------|---------------|-----------------|
| CR-001 | Navbar | ✅ Hamburger menu | ✅ Compacto | ✅ Completo |
| CR-002 | HomePage Hero | ✅ Stack vertical | ✅ Adaptado | ✅ Grid completo |
| CR-003 | CampaignsPage Grid | ✅ 1 columna | ✅ 2 columnas | ✅ 3 columnas |
| CR-004 | CartPage | ✅ Stack vertical | ✅ Adaptado | ✅ Side-by-side |
| CR-005 | CheckoutPage | ✅ Stepper simplificado | ✅ Normal | ✅ Normal |
| CR-006 | AdminDashboard | ✅ Stack cards | ✅ 2 columnas | ✅ 4 columnas |
| CR-007 | AdminUsersPage | ✅ Scroll horizontal | ✅ Tabla normal | ✅ Tabla normal |

---

## 6. PRUEBAS DE VALIDACIÓN DE FORMULARIOS

| ID | Formulario | Campo | Validación | Resultado |
|----|-----------|-------|-----------|---------|
| CV-001 | Login | Email | Formato email válido | ✅ |
| CV-002 | Login | Password | No vacío | ✅ |
| CV-003 | Register | Email | Formato + no duplicado | ✅ |
| CV-004 | Register | Password | Mínimo 8 caracteres | ✅ |
| CV-005 | Register Beneficiario | RUT | Formato chileno XX.XXX.XXX-X | ✅ |
| CV-006 | Register Beneficiario | Región/Comuna | Requeridos al ser beneficiario | ✅ |
| CV-007 | CreateCampaign | Título | No vacío, mínimo 10 chars | ✅ |
| CV-008 | CreateCampaign | Región | Requerido | ✅ |
| CV-009 | CreateKit | Nombre | Requerido | ✅ |
| CV-010 | Checkout | Comprobante | Formato JPG/PNG/PDF, máx 5MB | ✅ |

---

## 7. REGISTRO DE DEFECTOS

| ID | Módulo | Descripción | Severidad | Estado |
|----|--------|-------------|-----------|--------|
| DEF-001 | Auth | react-query incompatible con React 18 | Alta | ✅ Resuelto — migrar a @tanstack/react-query |
| DEF-002 | Checkout | Content-Type multipart mal configurado en Axios | Media | ✅ Resuelto — no setear Content-Type manualmente |
| DEF-003 | Tracking | Estado no se actualizaba automáticamente | Baja | ✅ Resuelto — usar refetchInterval: 30000 |
| DEF-004 | Register | Campos de región/comuna no se reseteaban al cambiar rol | Baja | ✅ Resuelto — reset() al cambiar tipo de registro |

---

## 8. CRITERIOS DE ACEPTACIÓN

El sistema se considera aprobado cuando:

1. ✅ El 100% de los casos de prueba críticos (AUTH, DONOR-005) están en estado PASS.
2. ✅ El 90% o más del total de casos de prueba están en estado PASS.
3. ✅ No existen defectos de severidad Alta sin resolver.
4. ✅ El sistema es responsivo en los 3 breakpoints definidos.
5. ✅ El flujo completo de donación (campaña → carrito → checkout → confirmación) funciona end-to-end.

**Resultado EP2:** ✅ TODOS LOS CRITERIOS CUMPLIDOS

---

*Plan de Pruebas elaborado para TPY1101 — EP2, Mayo 2026*
