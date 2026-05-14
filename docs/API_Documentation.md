# DOCUMENTACIÓN DE API — DONATECH
## Backend REST API — Referencia Completa
### TPY1101 — Taller Aplicado de Programación, EP2

---

**Base URL:** `http://localhost:8080`  
**Autenticación:** Bearer Token JWT en header `Authorization: Bearer {token}`  
**Content-Type:** `application/json` (excepto uploads: `multipart/form-data`)

---

## 1. AUTENTICACIÓN (`/api/auth`)

### POST /api/auth/login
Autentica un usuario y retorna el token JWT.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.cl",
  "password": "MiPassword123!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.cl",
    "roles": ["ROLE_DONANTE"]
  }
}
```

**Response 401:**
```json
{ "message": "Credenciales inválidas" }
```

---

### POST /api/auth/register
Registra un nuevo usuario donante.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.cl",
  "password": "MiPassword123!",
  "telefono": "+56912345678"
}
```

**Response 201:**
```json
{ "message": "Usuario registrado exitosamente", "id": 42 }
```

---

### POST /api/auth/register/beneficiario
Registra un beneficiario con datos adicionales.

**Request Body:**
```json
{
  "name": "María González",
  "email": "maria@ejemplo.cl",
  "password": "MiPassword123!",
  "rut": "12345678-9",
  "direccion": "Av. Principal 123",
  "idComuna": 15,
  "telefono": "+56987654321"
}
```

**Response 201:**
```json
{ "message": "Beneficiario registrado exitosamente", "id": 43 }
```

---

### POST /api/auth/register/organizacion
Registra una organización.

**Request Body:**
```json
{
  "name": "Fundación Esperanza",
  "email": "fundacion@ejemplo.cl",
  "password": "MiPassword123!",
  "rutEmpresa": "76123456-7",
  "razonSocial": "Fundación Esperanza Chile",
  "nombreContacto": "Pedro López"
}
```

**Response 201:**
```json
{ "message": "Organización registrada exitosamente" }
```

---

### GET /api/auth/validate
Valida el token JWT actual.  
**Requiere:** Bearer token  
**Response 200:** `{ "valid": true, "user": {...} }`

---

## 2. USUARIOS (`/api/users`)

### GET /api/users
Lista todos los usuarios del sistema.  
**Requiere:** ROLE_ADMIN

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.cl",
    "status": 1,
    "role": { "id": 2, "name": "ROLE_DONANTE" }
  }
]
```

---

### PUT /api/users/{id}/status
Actualiza el estado de un usuario (activar/desactivar).  
**Requiere:** ROLE_ADMIN

**Request Body:**
```json
{ "status": 0 }
```

**Response 200:**
```json
{ "message": "Estado actualizado exitosamente" }
```

---

### GET /api/regiones
Lista todas las regiones de Chile.  
**Público (no requiere auth)**

**Response 200:**
```json
[
  { "id": 13, "nombre": "Región Metropolitana de Santiago" },
  { "id": 5, "nombre": "Región de Valparaíso" }
]
```

---

### GET /api/comunas?idRegion={id}
Lista las comunas de una región específica.  
**Público**

**Response 200:**
```json
[
  { "id": 101, "nombre": "Santiago", "idRegion": 13 },
  { "id": 102, "nombre": "Providencia", "idRegion": 13 }
]
```

---

## 3. CATÁLOGO — KITS (`/api/kits`)

### GET /api/kits
Lista todos los kits disponibles.  
**Requiere:** Autenticado

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "Kit Alimentación Básico",
    "descripcion": "Canasta con alimentos no perecibles",
    "precioBase": 25000,
    "activo": true,
    "items": [
      { "producto": { "id": 1, "nombre": "Arroz" }, "cantidad": 2 }
    ]
  }
]
```

---

### POST /api/kits
Crea un nuevo kit.  
**Requiere:** ROLE_ADMIN

**Request Body:**
```json
{
  "nombre": "Kit Invierno",
  "descripcion": "Ropa de abrigo para adulto",
  "precioBase": 35000
}
```

**Response 201:**
```json
{ "id": 6, "nombre": "Kit Invierno", "precioBase": 35000 }
```

---

## 4. CATÁLOGO — CAMPAÑAS (`/api/campaigns`)

### GET /api/campaigns
Lista todas las campañas (admin).  
**Requiere:** ROLE_ADMIN

---

### GET /api/campaigns/active
Lista campañas con status ACTIVA.  
**Público**

**Response 200:**
```json
[
  {
    "id": 1,
    "titulo": "Ayuda Familia González",
    "descripcion": "Familia de 4 personas...",
    "motivo": "Incendio en vivienda",
    "status": "ACTIVA",
    "region": { "id": 13, "nombre": "Región Metropolitana" },
    "comuna": { "id": 101, "nombre": "Santiago" },
    "kits": [...]
  }
]
```

---

### GET /api/campaigns/{id}
Obtiene detalle de una campaña por ID.  
**Público**

---

### GET /api/campaigns/beneficiario/{id}
Obtiene campañas de un beneficiario específico.  
**Requiere:** ROLE_BENEFICIARIO, ROLE_ADMIN

---

### POST /api/campaigns
Crea una nueva campaña.  
**Requiere:** ROLE_BENEFICIARIO, ROLE_ORGANIZACION

**Request Body:**
```json
{
  "titulo": "Ayuda urgente familia López",
  "descripcion": "La familia necesita...",
  "motivo": "Cesantía del jefe de hogar",
  "idRegion": 13,
  "idComuna": 101
}
```

**Response 201:**
```json
{ "id": 10, "titulo": "...", "status": "PENDIENTE" }
```

---

### PUT /api/campaigns/{id}/close
Cierra una campaña activa.  
**Requiere:** ROLE_ADMIN

---

## 5. ÓRDENES / DONACIONES (`/api/orders`)

### POST /api/orders
Crea una nueva donación/orden.  
**Requiere:** ROLE_DONANTE, ROLE_EMPRESA, ROLE_ORGANIZACION

**Request Body:**
```json
{
  "idCampaña": 1,
  "items": [
    { "idKit": 1, "cantidad": 2 },
    { "idKit": 3, "cantidad": 1 }
  ],
  "codigoCupon": "DESCUENTO10"
}
```

**Response 201:**
```json
{
  "id": 89,
  "status": "INGRESADA",
  "total": 85000,
  "createdAt": "2026-05-15T14:32:00"
}
```

---

### POST /api/orders/{id}/comprobante
Sube el comprobante de transferencia bancaria.  
**Requiere:** ROLE_DONANTE, ROLE_EMPRESA  
**Content-Type:** `multipart/form-data`

**Form fields:**
- `file`: Archivo JPG/PNG/PDF (máx. 5MB)

**Response 200:**
```json
{ "message": "Comprobante subido exitosamente", "url": "/uploads/comp_89.jpg" }
```

---

### GET /api/orders/donante/{email}
Lista las donaciones de un donante por email.  
**Requiere:** ROLE_DONANTE (propio email)

**Response 200:**
```json
[
  {
    "id": 89,
    "status": "EN_PREPARACION",
    "total": 85000,
    "campaña": { "titulo": "Ayuda Familia González" },
    "createdAt": "2026-05-15T14:32:00"
  }
]
```

---

### GET /api/orders/{id}
Obtiene detalle de una orden.  
**Requiere:** Propietario de la orden o ROLE_ADMIN

---

### GET /api/orders/{id}/history
Obtiene el historial de cambios de estado de una orden.  
**Requiere:** Autenticado

**Response 200:**
```json
[
  {
    "estadoPrev": "VALIDANDO",
    "estadoNuevo": "VALIDADA",
    "comentario": "Transferencia verificada",
    "usuario": "Juan Voluntario",
    "createdAt": "2026-05-16T09:10:00"
  }
]
```

---

### PUT /api/orders/{id}/status
Actualiza el estado de una orden.  
**Requiere:** ROLE_ADMIN, ROLE_VOLUNTARIO

**Request Body:**
```json
{ "status": "EN_PREPARACION", "comentario": "Iniciando preparación del kit" }
```

---

### POST /api/orders/{id}/prueba-entrega
Sube la prueba fotográfica de entrega.  
**Requiere:** ROLE_VOLUNTARIO, ROLE_ADMIN  
**Content-Type:** `multipart/form-data`

---

### POST /api/orders/coupons/apply
Aplica un cupón de descuento.  
**Requiere:** Autenticado

**Request Body:**
```json
{ "codigo": "DESCUENTO10", "total": 85000 }
```

**Response 200:**
```json
{ "descuento": 10, "totalFinal": 76500 }
```

---

## 6. SOPORTE / TICKETS (`/api/tickets`)

### GET /api/tickets
Lista todos los tickets.  
**Requiere:** ROLE_ADMIN, ROLE_VOLUNTARIO

---

### GET /api/tickets?status={status}
Filtra tickets por estado (ABIERTO, EN_PROCESO, RESUELTO).  
**Requiere:** ROLE_ADMIN, ROLE_VOLUNTARIO

---

### GET /api/tickets?tipo={tipo}
Filtra tickets por tipo (VALIDACION_TRANSFERENCIA, VALIDACION_CAMPAÑA, SOPORTE_GENERAL).  
**Requiere:** ROLE_ADMIN, ROLE_VOLUNTARIO

---

### POST /api/tickets/{id}/validate/transfer
Valida o rechaza una transferencia bancaria.  
**Requiere:** ROLE_VOLUNTARIO, ROLE_ADMIN

**Request Body:**
```json
{
  "aprobado": true,
  "motivo": null
}
```

O para rechazar:
```json
{
  "aprobado": false,
  "motivo": "El comprobante no coincide con el monto"
}
```

---

### POST /api/tickets/{id}/validate/campaign
Valida o rechaza una campaña.  
**Requiere:** ROLE_VOLUNTARIO, ROLE_ADMIN

**Request Body:**
```json
{
  "aprobado": true,
  "motivo": null
}
```

---

### PUT /api/tickets/{id}/assign
Asigna un ticket a un voluntario.  
**Requiere:** ROLE_ADMIN

---

## 7. CÓDIGOS DE RESPUESTA HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|--------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado correctamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token ausente o inválido |
| 403 | Forbidden | Token válido pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 500 | Server Error | Error interno del servidor |

---

## 8. EJEMPLOS DE USO CON AXIOS (FRONTEND)

```javascript
// Login
const response = await authApi.login({ email, password });
const { token, user } = response.data;

// Listar campañas activas
const { data } = await catalogApi.getActiveCampaigns();
// data es un array de campañas

// Crear donación
const order = await ordersApi.createDonation({
  idCampaña: 1,
  items: [{ idKit: 1, cantidad: 2 }]
});

// Upload comprobante
const formData = new FormData();
formData.append('file', file);
await ordersApi.uploadTransferProof(order.data.id, formData);

// Obtener tickets abiertos
const tickets = await supportsApi.getByStatus('ABIERTO');
```

---

*Documentación de API elaborada para TPY1101 — EP2, Mayo 2026*
