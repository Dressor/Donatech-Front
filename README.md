[README.md](https://github.com/user-attachments/files/29659376/README.md)
# Donatech — Frontend

Plataforma web de donaciones humanitarias que conecta donantes (personas naturales, empresas y organizaciones) con beneficiarios que postulan campañas de ayuda. Este repositorio contiene el **frontend**, desarrollado como una Single Page Application en React que consume el backend de microservicios de Donatech a través de un API Gateway.

El sistema cubre el ciclo completo de una donación: creación de campaña → donación → validación de transferencia → despacho → entrega confirmada, con paneles diferenciados por rol (donante, beneficiario, administrador, voluntario/validador).

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles del sistema](#roles-del-sistema)
- [Requisitos previos](#requisitos-previos)
- [Configuración del entorno](#configuración-del-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue con Docker](#despliegue-con-docker)
- [Capa de servicios (BFF)](#capa-de-servicios-bff)
- [Documentación adicional](#documentación-adicional)

## Stack tecnológico

| Tecnología | Propósito |
|---|---|
| React 18 + Vite | Framework de UI y build tool / dev server |
| TailwindCSS 3 | Estilos utilitarios |
| React Router DOM 6/7 | Enrutamiento SPA y rutas protegidas por rol |
| @tanstack/react-query | Manejo de estado de servidor (caching, refetching) |
| Axios | Cliente HTTP con interceptores de JWT |
| react-hook-form | Manejo y validación de formularios |
| react-hot-toast | Notificaciones tipo toast |
| recharts | Gráficos del panel de administración |
| @headlessui/react + @heroicons/react | Componentes accesibles e iconografía |
| framer-motion | Animaciones de interfaz |
| date-fns | Formateo de fechas (locale `es`) |

## Estructura del proyecto

```
src/
├── api/                  # Capa BFF: un módulo por dominio del backend
│   ├── axios.js          # Instancia base de axios + interceptores JWT
│   ├── auth.js           # Login, registro, refresh token
│   ├── users.js          # CRUD usuarios, beneficiarios, regiones/comunas
│   ├── catalog.js        # Productos, categorías, kits, campañas
│   ├── orders.js         # Pedidos, carrito, donaciones, comprobantes
│   └── supports.js       # Tickets de soporte y validación
├── components/
│   ├── layout/           # MainLayout, Navbar, Footer, ProtectedRoute
│   ├── shared/            # Componentes reutilizables (ej. CampaignCard)
│   └── ui/                # Componentes de UI genéricos (badges, spinners, empty states)
├── context/               # AuthContext y CartContext (React Context API)
├── pages/
│   ├── public/            # Home, listado y detalle de campañas
│   ├── auth/               # Login, registro
│   ├── donor/              # Carrito, checkout, historial y tracking de donaciones
│   ├── beneficiary/         # Dashboard y creación de campañas
│   └── admin/               # Dashboard, backoffice, gestión de usuarios/catálogo/beneficiarios
├── utils/                  # Utilidades (ej. validador de RUT)
├── App.jsx                  # Definición de rutas
└── main.jsx                  # Punto de entrada de la aplicación
```

## Roles del sistema

| Rol | Código | Acceso principal |
|---|---|---|
| Administrador | `ROLE_ADMIN` | Gestión total: usuarios, catálogo, campañas, beneficiarios |
| Donante | `ROLE_DONANTE` | Donar, carrito, checkout, historial y tracking |
| Empresa | `ROLE_EMPRESA` | Igual que donante |
| Beneficiario | `ROLE_BENEFICIARIO` | Crear campañas, dashboard propio |
| Organización | `ROLE_ORGANIZACION` | Crear campañas y donar |
| Voluntario/Validador | `ROLE_VOLUNTARIO` | Validar transferencias y campañas (backoffice) |

Las rutas protegidas por rol se definen en [src/App.jsx](src/App.jsx) mediante el componente `ProtectedRoute`.

## Requisitos previos

| Software | Versión recomendada |
|---|---|
| Node.js | 20.x LTS |
| pnpm | 9.x (gestor de paquetes usado por el proyecto) |
| Backend de Donatech | API Gateway corriendo en `http://localhost:8080` (o remoto) |

> El proyecto incluye `pnpm-lock.yaml`, por lo que se recomienda `pnpm` como gestor de paquetes. Si prefieres `npm`, puede ser necesario instalar con `npm install --legacy-peer-deps` debido a versiones menores de peer dependencies.

## Configuración del entorno

Copia el archivo de ejemplo y ajusta los valores según tu entorno:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Uso | Valor en desarrollo |
|---|---|---|
| `VITE_API_URL` | URL base del API en tiempo de build. Si se deja vacío, Axios usa rutas relativas (`/api/...`) y el proxy de Vite (dev) o nginx (prod) se encarga de reenviarlas al backend. | vacío |
| `BACKEND_URL` | IP o dominio del API Gateway del backend, usada por nginx en el contenedor de producción para el proxy de `/api`. | `http://localhost:8080` |

En desarrollo, el proxy configurado en [vite.config.js](vite.config.js) redirige automáticamente `/api/**` hacia `http://localhost:8080`, evitando problemas de CORS sin necesidad de configurar `VITE_API_URL`.

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Donatech-Front

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno (ver sección anterior)
cp .env.example .env

# 4. Levantar el servidor de desarrollo
pnpm dev
```

La aplicación quedará disponible en `http://localhost:5173`.

> Asegúrate de que el backend (API Gateway y microservicios) esté activo antes de iniciar sesión o consumir datos. Si el gateway está en otra IP, ajusta el proxy en `vite.config.js` o define `VITE_API_URL` en `.env`.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo con HMR en `http://localhost:5173` |
| `pnpm build` | Genera el build de producción en `dist/` |
| `pnpm preview` | Sirve localmente el build de producción para verificarlo |
| `pnpm lint` | Ejecuta ESLint sobre todo el proyecto |

## Despliegue con Docker

El proyecto incluye un `Dockerfile` multi-stage (build con Vite + servido con nginx) y un `docker-compose.yml` listos para producción.

```bash
# Definir la IP/dominio real del backend
export BACKEND_URL=http://<ip-o-dominio-del-backend>:8080

# Construir y levantar el contenedor
docker compose up -d --build
```

El contenedor expone el puerto `80` y nginx ([nginx.conf.template](nginx.conf.template)) reemplaza `${BACKEND_URL}` en tiempo de arranque para proxear todas las llamadas a `/api/*` hacia el backend, además de servir los archivos estáticos de React con soporte para client-side routing.

## Capa de servicios (BFF)

El frontend implementa un patrón *Backend for Frontend* centralizando toda la comunicación con el API Gateway en `src/api/`. Cada módulo agrupa las llamadas de un dominio específico y se apoya en la instancia de Axios de `src/api/axios.js`, que:

- Adjunta automáticamente el JWT almacenado (`donatech_token`) a cada request.
- Intercepta respuestas `401` y redirige a `/login`, limpiando la sesión local.

## Documentación adicional

En la carpeta [docs/](docs/) se encuentra la documentación completa del proyecto, incluyendo:

- Registro de definición del proyecto y arquitectura general
- Diagramas UML y modelo entidad-relación (MER)
- WireFrames y plan de pruebas
- Carta Gantt y métricas de Kanban
- Guía detallada de configuración del servidor (backend + frontend + base de datos)
- Documentación de la API consumida
