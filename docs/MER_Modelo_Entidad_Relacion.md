# MODELO ENTIDAD-RELACIÓN (MER) — DONATECH
## TPY1101 — Taller Aplicado de Programación, EP2

---

## 1. DIAGRAMA ENTIDAD-RELACIÓN

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                          DONATECH — MODELO ENTIDAD-RELACIÓN COMPLETO                       │
└────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      REGION      │         │      COMUNA      │
│ ──────────────── │         │ ──────────────── │
│ PK id_region INT │1────────│ PK id_comuna INT │
│    nombre VARCHAR│       ∞ │ FK id_region INT │
└──────────────────┘         │    nombre VARCHAR│
                              └────────┬─────────┘
                                       │ ∞
                                       │
                              ┌────────┴─────────┐
                              │    BENEFICIARIO  │
          ┌───────────────────│ ──────────────── │
          │                   │ PK id     INT    │
          │               FK  │ FK id_usuario INT│
          │            ┌──────│ FK id_comuna INT │
          │            │      │    rut    VARCHAR│
          │            │      │    direccion VARÇ│
          │            │      └──────────────────┘
          │            │
          │  1     ┌───┴──────────────────────────────┐
          │        │              USUARIO              │
          │        │ ────────────────────────────────── │
          └────────│ PK  id         INT                │
                   │     name       VARCHAR(100)       │
                   │     email      VARCHAR(100) UNIQUE│
                   │     password   VARCHAR(255)       │
                   │     telefono   VARCHAR(20)        │
                   │     status     TINYINT (0/1)      │
                   │ FK  id_rol     INT                │
                   │     created_at DATETIME           │
                   └───────────────┬───────────────────┘
                                   │ ∞
                        ┌──────────┘ └──────────────┐
                        │                            │
               ┌────────▼──────────┐      ┌─────────▼────────┐
               │       ROL         │      │    EMPRESA_INFO   │
               │ ──────────────── │      │ ──────────────── │
               │ PK id   INT       │      │ PK id      INT   │
               │    name VARCHAR   │      │ FK id_usuario INT │
               │ (ROLE_ADMIN,      │      │    rut_empresa VR│
               │  ROLE_DONANTE,    │      │    razon_social VR│
               │  ROLE_BENEFIC.,   │      │    nombre_cont VR │
               │  ROLE_EMPRESA,    │      └──────────────────┘
               │  ROLE_VOLUNTARIO, │
               │  ROLE_ORGANIZAC.) │
               └──────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                        MÓDULO DE CATÁLOGO                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────────────┐
│    CATEGORIA     │      │         PRODUCTO          │
│ ──────────────── │      │ ──────────────────────── │
│ PK id INT        │1─────│ PK  id          INT       │
│    nombre VARCHAR│    ∞ │ FK  id_categoria INT      │
└──────────────────┘      │ FK  id_unidad   INT       │
                           │     nombre      VARCHAR   │
                           │     descripcion TEXT      │
                           │     cantidad_std DECIMAL  │
                           └────────────┬──────────────┘
                                        │ ∞
                           ┌────────────┘
                           │
          ┌────────────────▼─────────────────────────────────┐
          │                    KIT_PRODUCTO                   │
          │ ─────────────────────────────────────────────── │
          │ PK FK id_kit      INT                            │
          │ PK FK id_producto INT                            │
          │        cantidad   DECIMAL                        │
          └──────────────────┬───────────────────────────────┘
                             │ ∞
          ┌──────────────────▼────────────────────────────────┐
          │                      KIT                          │
          │ ──────────────────────────────────────────────── │
          │ PK id          INT                                │
          │    nombre      VARCHAR(150)                       │
          │    descripcion TEXT                               │
          │    precio_base DECIMAL(10,2)                      │
          │    activo      BOOLEAN                            │
          │    created_at  DATETIME                           │
          └───────────────────────────────────────────────────┘

┌──────────────────┐
│    UNIDAD_MEDIDA │
│ ──────────────── │
│ PK id INT        │
│    nombre VARCHAR│  (ej: kg, litros, unidades, cajas)
└──────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                       MÓDULO DE CAMPAÑAS                             │
└──────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │                  CAMPAÑA                    │
                    │ ─────────────────────────────────────────── │
USUARIO 1 ──────── │ PK  id              INT                     │
(beneficiario)      │ FK  id_beneficiario INT → USUARIO(id)       │
                    │ FK  id_region       INT → REGION(id)        │
                    │ FK  id_comuna       INT → COMUNA(id)        │
                    │     titulo          VARCHAR(200)            │
                    │     descripcion     TEXT                    │
                    │     motivo          TEXT                    │
                    │     status          ENUM('PENDIENTE',       │
                    │                    'ACTIVA','CERRADA',      │
                    │                    'RECHAZADA')             │
                    │     fecha_inicio    DATE                    │
                    │     fecha_fin       DATE                    │
                    │     created_at      DATETIME                │
                    └───────────────────┬─────────────────────────┘
                                        │ 1
                                        │
                                        │ ∞
               ┌────────────────────────▼──────────────────────────────┐
               │                        ORDEN / DONACIÓN               │
               │ ────────────────────────────────────────────────────── │
               │ PK  id              INT                                │
               │ FK  id_campaña      INT → CAMPAÑA(id)                 │
               │ FK  id_donante      INT → USUARIO(id)                 │
               │     status          ENUM('INGRESADA','VALIDANDO',      │
               │                    'VALIDADA','RECHAZADA',             │
               │                    'EN_PREPARACION','EN_CAMINO',       │
               │                    'ENTREGADA')                        │
               │     total           DECIMAL(10,2)                     │
               │     comprobante_url VARCHAR(500)                       │
               │     prueba_entrega  VARCHAR(500)                       │
               │     notas           TEXT                               │
               │     created_at      DATETIME                           │
               │     updated_at      DATETIME                           │
               └─────────────────────┬──────────────────────────────────┘
                                      │ 1
                          ┌───────────┘ └──────────────┐
                          │ ∞                           │ ∞
          ┌───────────────▼──────────┐   ┌─────────────▼────────────────┐
          │       ORDEN_KIT          │   │       ORDEN_HISTORIAL         │
          │ ─────────────────────── │   │ ─────────────────────────── │
          │ PK FK id_orden INT       │   │ PK  id           INT         │
          │ PK FK id_kit   INT       │   │ FK  id_orden     INT         │
          │        cantidad INT      │   │ FK  id_usuario   INT         │
          │        precio   DECIMAL  │   │     estado_prev  VARCHAR     │
          └──────────────────────────┘   │     estado_nuevo VARCHAR     │
                                         │     comentario  TEXT         │
                                         │     created_at  DATETIME     │
                                         └──────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                       MÓDULO DE SOPORTE                              │
└──────────────────────────────────────────────────────────────────────┘

          ┌──────────────────────────────────────────────────────────┐
          │                        TICKET                            │
          │ ────────────────────────────────────────────────────── │
          │ PK  id           INT                                    │
          │ FK  id_creador   INT → USUARIO(id)                     │
          │ FK  id_asignado  INT → USUARIO(id) (nullable)          │
          │ FK  id_orden     INT → ORDEN(id) (nullable)            │
          │     tipo         ENUM('VALIDACION_TRANSFERENCIA',      │
          │                  'VALIDACION_CAMPAÑA',                  │
          │                  'SOPORTE_GENERAL')                    │
          │     estado       ENUM('ABIERTO','EN_PROCESO','RESUELTO')│
          │     descripcion  TEXT                                   │
          │     motivo_rec.  TEXT (si rechazado)                   │
          │     created_at   DATETIME                               │
          │     updated_at   DATETIME                               │
          └──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        MÓDULO DE CUPONES                             │
└──────────────────────────────────────────────────────────────────────┘

          ┌──────────────────────────────────────────────────────────┐
          │                        CUPON                             │
          │ ────────────────────────────────────────────────────── │
          │ PK  id           INT                                    │
          │     codigo       VARCHAR(50) UNIQUE                     │
          │     descuento    DECIMAL(5,2) (porcentaje 0-100)        │
          │     activo       BOOLEAN                                │
          │     usos_max     INT                                    │
          │     usos_actual  INT                                    │
          │     fecha_exp    DATE                                   │
          └──────────────────────────────────────────────────────────┘
```

---

## 2. TABLAS DE DETALLE

### TABLA: USUARIO

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT AUTO_INCREMENT | NO | PK | Identificador único |
| name | VARCHAR(100) | NO | — | Nombre completo |
| email | VARCHAR(100) | NO | UNIQUE | Correo electrónico |
| password | VARCHAR(255) | NO | — | Hash bcrypt |
| telefono | VARCHAR(20) | SÍ | — | Teléfono de contacto |
| status | TINYINT(1) | NO | — | 1=activo, 0=inactivo |
| id_rol | INT | NO | FK→ROL | Rol del usuario |
| created_at | DATETIME | NO | — | Fecha de creación |

### TABLA: ROL

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT | NO | PK | Identificador |
| name | VARCHAR(50) | NO | UNIQUE | ROLE_ADMIN, ROLE_DONANTE, etc. |

### TABLA: CAMPAÑA

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT AUTO_INCREMENT | NO | PK | Identificador único |
| id_beneficiario | INT | NO | FK→USUARIO | Creador de la campaña |
| id_region | INT | NO | FK→REGION | Región geográfica |
| id_comuna | INT | NO | FK→COMUNA | Comuna específica |
| titulo | VARCHAR(200) | NO | — | Título de la campaña |
| descripcion | TEXT | NO | — | Descripción detallada |
| motivo | TEXT | SÍ | — | Motivo de la solicitud |
| status | ENUM | NO | — | PENDIENTE/ACTIVA/CERRADA/RECHAZADA |
| fecha_inicio | DATE | SÍ | — | Inicio de la campaña |
| fecha_fin | DATE | SÍ | — | Fin de la campaña |
| created_at | DATETIME | NO | — | Fecha de registro |

### TABLA: ORDEN / DONACIÓN

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT AUTO_INCREMENT | NO | PK | Identificador único |
| id_campaña | INT | NO | FK→CAMPAÑA | Campaña asociada |
| id_donante | INT | NO | FK→USUARIO | Donante |
| status | ENUM | NO | — | Estado del ciclo de vida |
| total | DECIMAL(10,2) | NO | — | Monto total donado |
| comprobante_url | VARCHAR(500) | SÍ | — | Ruta al archivo de comprobante |
| prueba_entrega | VARCHAR(500) | SÍ | — | Foto de entrega |
| notas | TEXT | SÍ | — | Observaciones |
| created_at | DATETIME | NO | — | Fecha de creación |
| updated_at | DATETIME | NO | — | Última actualización |

### TABLA: KIT

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT AUTO_INCREMENT | NO | PK | Identificador único |
| nombre | VARCHAR(150) | NO | — | Nombre del kit |
| descripcion | TEXT | SÍ | — | Descripción |
| precio_base | DECIMAL(10,2) | SÍ | — | Precio de referencia en CLP |
| activo | BOOLEAN | NO | — | Si está disponible |
| created_at | DATETIME | NO | — | Fecha de creación |

### TABLA: TICKET

| Columna | Tipo | Nulo | PK/FK | Descripción |
|---------|------|------|-------|-------------|
| id | INT AUTO_INCREMENT | NO | PK | Identificador único |
| id_creador | INT | NO | FK→USUARIO | Quien creó el ticket |
| id_asignado | INT | SÍ | FK→USUARIO | Voluntario asignado |
| id_orden | INT | SÍ | FK→ORDEN | Orden relacionada (si aplica) |
| tipo | ENUM | NO | — | Tipo de ticket |
| estado | ENUM | NO | — | ABIERTO/EN_PROCESO/RESUELTO |
| descripcion | TEXT | NO | — | Descripción del caso |
| motivo_rechazo | TEXT | SÍ | — | Motivo si fue rechazado |
| created_at | DATETIME | NO | — | Fecha de creación |
| updated_at | DATETIME | NO | — | Última actualización |

---

## 3. RELACIONES

| Tabla Origen | Columna | Tipo Relación | Tabla Destino | Columna |
|-------------|---------|--------------|---------------|---------|
| USUARIO | id_rol | N:1 | ROL | id |
| BENEFICIARIO | id_usuario | 1:1 | USUARIO | id |
| BENEFICIARIO | id_comuna | N:1 | COMUNA | id |
| COMUNA | id_region | N:1 | REGION | id |
| EMPRESA_INFO | id_usuario | 1:1 | USUARIO | id |
| CAMPAÑA | id_beneficiario | N:1 | USUARIO | id |
| CAMPAÑA | id_region | N:1 | REGION | id |
| CAMPAÑA | id_comuna | N:1 | COMUNA | id |
| ORDEN | id_campaña | N:1 | CAMPAÑA | id |
| ORDEN | id_donante | N:1 | USUARIO | id |
| ORDEN_KIT | id_orden | N:1 | ORDEN | id |
| ORDEN_KIT | id_kit | N:1 | KIT | id |
| KIT_PRODUCTO | id_kit | N:1 | KIT | id |
| KIT_PRODUCTO | id_producto | N:1 | PRODUCTO | id |
| PRODUCTO | id_categoria | N:1 | CATEGORIA | id |
| PRODUCTO | id_unidad | N:1 | UNIDAD_MEDIDA | id |
| ORDEN_HISTORIAL | id_orden | N:1 | ORDEN | id |
| TICKET | id_creador | N:1 | USUARIO | id |
| TICKET | id_asignado | N:1 | USUARIO | id |
| TICKET | id_orden | N:1 | ORDEN | id |

---

## 4. DATOS DE REFERENCIA (SEEDS)

### Roles
```sql
INSERT INTO rol (name) VALUES
  ('ROLE_ADMIN'),
  ('ROLE_DONANTE'),
  ('ROLE_BENEFICIARIO'),
  ('ROLE_EMPRESA'),
  ('ROLE_VOLUNTARIO'),
  ('ROLE_ORGANIZACION');
```

### Unidades de Medida
```sql
INSERT INTO unidad_medida (nombre) VALUES
  ('Kilogramos'), ('Litros'), ('Unidades'), ('Cajas'),
  ('Paquetes'), ('Metros'), ('Bolsas');
```

### Categorías
```sql
INSERT INTO categoria (nombre) VALUES
  ('Alimentación'), ('Higiene Personal'), ('Ropa y Abrigo'),
  ('Medicamentos'), ('Artículos del Hogar'), ('Útiles Escolares');
```

### Kits Base
```sql
INSERT INTO kit (nombre, descripcion, precio_base, activo) VALUES
  ('Kit Alimentación Básico', 'Canasta con alimentos no perecibles para 1 semana', 25000, 1),
  ('Kit Higiene Personal', 'Productos de aseo e higiene personal', 15000, 1),
  ('Kit Invierno', 'Ropa de abrigo para adulto talla M', 35000, 1),
  ('Kit Bebé', 'Pañales, leche y artículos de cuidado', 45000, 1),
  ('Kit Escolar', 'Útiles escolares para educación básica', 20000, 1);
```

---

*MER elaborado para TPY1101 — EP2, Mayo 2026*
*Para visualización gráfica, importar a MySQL Workbench > Reverse Engineering desde el script SQL*
