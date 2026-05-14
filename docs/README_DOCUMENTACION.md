# DOCUMENTACIÓN COMPLETA — DONATECH EP2
## TPY1101 — Taller Aplicado de Programación

---

## ÍNDICE DE DOCUMENTOS

| # | Documento | Archivo | Descripción |
|---|-----------|---------|-------------|
| 1 | **Integrantes del Equipo** | [Integrantes.txt](Integrantes.txt) | Lista de integrantes, roles y repositorios |
| 2 | **Registro de Definición del Proyecto** | [Registro_Definicion_Proyecto.md](Registro_Definicion_Proyecto.md) | Misión, visión, alcance, arquitectura, tecnologías, equipo, riesgos |
| 3 | **Informe EP2 — Estado de Avance** | [EP2_Informe_Estado_Avance.md](EP2_Informe_Estado_Avance.md) | Informe completo del avance, módulos implementados, métricas, conclusiones |
| 4 | **Diagramas UML** | [UML_Diagramas.md](UML_Diagramas.md) | Casos de uso, clases, secuencia (donación, validación, login), componentes, deployment |
| 5 | **WireFrames** | [WireFrames.md](WireFrames.md) | Wireframes ASCII de las 12 pantallas principales + guía de estilos |
| 6 | **Plan de Pruebas** | [Plan_de_Pruebas.md](Plan_de_Pruebas.md) | Casos de prueba, entorno, usuarios de prueba, registro de defectos, criterios de aceptación |
| 7 | **Diagrama de Gantt** | [Gantt_Chart.md](Gantt_Chart.md) | Cronograma de 16 semanas, hitos, tabla Excel-exportable, distribución de trabajo |
| 8 | **MER — Modelo Entidad-Relación** | [MER_Modelo_Entidad_Relacion.md](MER_Modelo_Entidad_Relacion.md) | Diagrama ER completo, tablas detalladas, relaciones, scripts SQL de seeds |
| 9 | **Documentación de API** | [API_Documentation.md](API_Documentation.md) | Todos los endpoints REST con request/response bodies, ejemplos con Axios |
| 10 | **Configuración del Servidor** | [Configuracion_Servidor.md](Configuracion_Servidor.md) | Requisitos, instalación, backup BD, CORS, puertos, troubleshooting |
| 11 | **Tablero Kanban y Métricas** | [Kanban_Metricas.md](Kanban_Metricas.md) | Historias de usuario, velocity, burndown chart, retrospectiva, KPIs |

---

## PRODUCTO — CÓDIGO FUENTE

El código fuente del frontend se encuentra en la carpeta raíz del proyecto:

```
Donatech-Front/
├── src/
│   ├── api/          # Capa BFF (Axios + servicios)
│   ├── context/      # AuthContext + CartContext
│   ├── components/   # Navbar, Footer, UI components
│   └── pages/        # Todas las páginas (14 páginas)
├── .env              # VITE_API_URL=http://localhost:8080
├── package.json      # Dependencias
└── tailwind.config.js
```

### Instrucciones de ejecución:
```bash
npm install --legacy-peer-deps
npm run dev
# Abrir http://localhost:5173
```

---

## GESTIÓN — DOCUMENTOS ADICIONALES

- `Integrantes.txt` — Archivo de gestión requerido por la rúbrica EP2
- El registro de definición del proyecto funciona también como documento de gestión inicial

---

*Documentación elaborada para TPY1101 — Evaluación Parcial N°2, Mayo 2026*
*Proyecto Donatech — Plataforma de Donaciones Humanitarias*
