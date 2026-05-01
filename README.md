# ADCAMI — Frontend

> **A**gente de **D**ecisión con **C**anal **A**daptado mediante **M**odelos de **I**nteligencia Artificial  
> Interfaz web del sistema de orquestación de marketing bancario impulsado por **Google Gemini**.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 📋 Descripción

ADCAMI Frontend es la SPA (Single Page Application) que permite a los equipos de marketing bancario interactuar con el motor de IA. Provee vistas para los tres módulos del ciclo de vida del cliente — **Onboarding**, **Fidelización** y **Reactivación** — además de paneles de aprobación, métricas, gestión de audiencias y administración de datasets.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                 React SPA (Vite)                     │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │  Pages   │→  │  Hooks / │→  │  services/      │  │
│  │(12 vistas│   │ Contexts │   │  api.ts (Axios) │  │
│  └──────────┘   └──────────┘   └────────┬────────┘  │
│                                          │           │
│                              ┌───────────▼─────────┐ │
│                              │  FastAPI Backend     │ │
│                              │  (ADCAMI API)        │ │
│                              └─────────────────────┘ │
│                                                      │
│  React Router v6 → Rutas protegidas por JWT          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Framework UI | React 18.3 |
| Lenguaje | TypeScript 5.5 |
| Bundler | Vite 5.3 |
| Estilos | TailwindCSS 3.4 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios 1.7 |
| Iconos | Lucide React |

---

## 📁 Estructura del Proyecto

```
frontend/
├── index.html
├── vite.config.ts           # Proxy /api → http://localhost:8000
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
│
└── src/
    ├── main.tsx             # Entry point
    ├── App.tsx              # Router principal + rutas protegidas
    ├── config.ts            # Constantes globales (API URL, etc.)
    ├── index.css            # Estilos base + directivas Tailwind
    │
    ├── components/
    │   ├── Layout.tsx       # Shell principal: sidebar + navbar
    │   └── ProtectedRoute.tsx  # HOC de autenticación JWT
    │
    ├── pages/
    │   ├── LoginPage.tsx           # Autenticación
    │   ├── DashboardPage.tsx       # Resumen ejecutivo de campañas
    │   ├── OnboardingPage.tsx      # Módulo onboarding IA
    │   ├── FidelizacionPage.tsx    # Módulo fidelización IA
    │   ├── ReactivacionPage.tsx    # Módulo reactivación IA
    │   ├── AprobacionPage.tsx      # Revisión y aprobación de campañas
    │   ├── MetricasPage.tsx        # KPIs y análisis de rendimiento
    │   ├── AudienciasPage.tsx      # Segmentos de audiencia
    │   ├── ImportarAudienciaPage.tsx  # Carga de CSV de clientes
    │   ├── DatosPage.tsx           # Gestión de datasets
    │   ├── EsquemasPage.tsx        # Configuración de esquemas
    │   └── AdminDatasetPage.tsx    # Panel de administración
    │
    ├── contexts/            # React Context (auth, estado global)
    ├── hooks/               # Custom hooks reutilizables
    ├── services/            # Clientes API (Axios)
    └── types/               # Interfaces y tipos TypeScript
```

---

## ⚙️ Configuración Local

### 1. Prerrequisitos

- Node.js 18+
- El [backend ADCAMI](https://github.com/acporras/tesis-backend-marketing-gemini) corriendo localmente en el puerto `8000`

### 2. Clonar e instalar

```bash
git clone git@github.com:acporras/tesis-frontend-marketing-gemini.git
cd tesis-frontend-marketing-gemini

npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
# URL base del backend FastAPI (sin trailing slash)
VITE_API_URL=http://localhost:8000
```

> En desarrollo, Vite también redirige automáticamente `/api/*` → `http://localhost:8000/*` mediante el proxy configurado en `vite.config.ts`.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en **http://localhost:3000**

---

## 🌐 Vistas Principales

| Ruta | Página | Descripción |
|---|---|---|
| `/login` | `LoginPage` | Autenticación de usuario |
| `/dashboard` | `DashboardPage` | Resumen de campañas activas y KPIs |
| `/onboarding` | `OnboardingPage` | Generación IA de campañas de onboarding |
| `/fidelizacion` | `FidelizacionPage` | Generación IA de campañas de fidelización |
| `/reactivacion` | `ReactivacionPage` | Generación IA de campañas de reactivación |
| `/aprobacion` | `AprobacionPage` | Revisión y aprobación de campañas pendientes |
| `/metricas` | `MetricasPage` | KPIs y métricas de rendimiento por módulo |
| `/audiencias` | `AudienciasPage` | Segmentos y audiencias disponibles |
| `/audiencias/importar` | `ImportarAudienciaPage` | Carga de audiencias desde CSV |
| `/datos` | `DatosPage` | Gestión de datasets de clientes |
| `/admin/datasets` | `AdminDatasetPage` | Administración avanzada de datasets |

Todas las rutas (excepto `/login`) están protegidas mediante `ProtectedRoute` que valida el JWT almacenado en el cliente.

---

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de producción → dist/
npm run preview    # Previsualizar el build de producción
npm run lint       # Linter ESLint
```

---

## 🔗 Repositorio Backend

Este frontend consume la API del backend ADCAMI:

👉 [tesis-backend-marketing-gemini](https://github.com/acporras/tesis-backend-marketing-gemini)

---

## 📄 Licencia

Proyecto académico — Tesis de Licenciatura. Todos los derechos reservados.
