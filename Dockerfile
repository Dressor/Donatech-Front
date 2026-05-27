# ================================================================
# Donatech Frontend — Dockerfile
# Stage 1: Compila React con Vite
# Stage 2: Sirve los estáticos con nginx + proxea /api al backend
# ================================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias primero (cache layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Build de producción
# VITE_API_URL vacío → axios usa URLs relativas → nginx proxea /api al backend
RUN pnpm build

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:1.27-alpine

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar template de nginx (usa envsubst para reemplazar $BACKEND_URL)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# El entrypoint oficial de nginx:alpine procesa automáticamente
# los templates en /etc/nginx/templates/ con envsubst al iniciar.
# Variable requerida: BACKEND_URL (ej: http://54.123.45.67:8080)

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
