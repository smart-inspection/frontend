# Smart Inspect Frontend

Frontend del sistema web inteligente para la gestión de inspecciones técnicas, evidencias, OCR, transcripciones e informes.

Este proyecto consume un backend FastAPI y proporciona una interfaz moderna construida con React, TypeScript, Vite, Tailwind CSS v4 y shadcn/ui. La aplicación permite registrar inspecciones, visualizar detalle operativo, cargar evidencias, ejecutar OCR, gestionar transcripciones y trabajar con borradores de informe.

## Tecnologías

- React 19
- TypeScript
- Vite 8
- React Router DOM 7
- TanStack React Query 5
- Tailwind CSS 4
- shadcn/ui
- Axios
- Zod
- Lucide React

## Funcionalidades principales

- Dashboard inicial del sistema
- Listado de inspecciones
- Creación de inspecciones
- Vista detalle por inspección
- Gestión de campos observados
- Carga de evidencias
- Ejecución y extracción OCR
- Gestión de transcripciones
- Generación y consulta de borradores de informe
- Exportación de reportes PDF y DOCX desde el backend

## Estructura del proyecto

```text
src/
  app/
    providers.tsx
    query-client.ts
    router.tsx
  components/
    layout/
    ui/
  features/
    dashboard/
    evidences/
    inspections/
    reports/
  lib/
    api.ts
    api-client.ts
    utils.ts
  types/
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Variables de entorno

Actualmente el proyecto usa dos variables para la URL base del backend. Ambas deben apuntar al mismo valor.

```env
VITEAPIURL=http://127.0.0.1:8000/api/v1
VITEAPIBASEURL=http://127.0.0.1:8000/api/v1
```

Para desarrollo local, crea un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
VITEAPIURL=http://127.0.0.1:8000/api/v1
VITEAPIBASEURL=http://127.0.0.1:8000/api/v1
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Desarrollo

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

### Vista previa del build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Integración con backend

Este frontend espera que el backend exponga endpoints bajo el prefijo:

```text
/api/v1
```

Entre los flujos consumidos actualmente se encuentran:

- Inspecciones
- Campos de inspección
- Evidencias
- OCR
- Transcripciones
- Borradores de informe
- Estado e historial de informes
- Exportación PDF y DOCX

## Rutas principales

- `/`
- `/inspections`
- `/inspections/new`
- `/inspections/:inspectionId`
- `/evidences`
- `/reports`

## Despliegue en Netlify

Este proyecto se despliega como SPA en Netlify.

### Build settings

- Build command: `npm run build`
- Publish directory: `dist`

### Variables de entorno en Netlify

Configurar ambas variables:

```env
VITEAPIURL=https://TU-BACKEND-PUBLICO/api/v1
VITEAPIBASEURL=https://TU-BACKEND-PUBLICO/api/v1
```

### Redirecciones SPA

Como la aplicación usa React Router con `createBrowserRouter`, Netlify debe redirigir las rutas al `index.html`.

Crear el archivo `public/_redirects` con este contenido:

```text
/*    /index.html   200
```

## Estado actual

El proyecto se encuentra en evolución activa. La base de navegación, consumo de API, gestión de inspecciones, evidencias, OCR, transcripciones y reportes ya está estructurada, y se sigue refinando el flujo operativo y la integración con exportaciones del backend.

## Recomendaciones

- Mantener `VITEAPIURL` y `VITEAPIBASEURL` sincronizadas hasta unificar la configuración.
- Validar siempre `npm run build` antes de desplegar.
- Probar rutas internas recargando directamente en producción.
- Verificar previews de archivos y exportaciones PDF/DOCX después de cada despliegue.

## Autor

SERGIO EMANUEL VELÁSQUEZ REYES

HERNAN MAURICCIO GASTÓN BERROSPI REYES