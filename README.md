# Plataforma de Cursos - Ingeniería Civil

Plataforma completa de educación en línea especializada en ingeniería civil, con cursos, herramientas profesionales, consultorías y sistema de evaluaciones.

## 🚀 Estado del Proyecto

### ✅ Completado

- **Configuración inicial del proyecto**
  - Next.js 14 con TypeScript
  - Tailwind CSS + Shadcn/ui
  - Estructura de carpetas organizada por rutas
  
- **Dependencias instaladas**
  - Supabase para backend (auth + database + storage)
  - Zustand para estado global
  - React Query para cache de datos
  - React Hook Form + Zod para formularios
  - Framer Motion para animaciones

- **Componentes UI básicos**
  - Button, Card, Input, Label, Form (Shadcn/ui)
  - Navbar y Footer
  - Layout de marketing
  
- **Configuración de Supabase**
  - Clientes (browser y server)
  - Middleware para protección de rutas
  - Esquema completo de base de datos diseñado

### 🔄 Próximos Pasos

1. **Configurar Proyecto en Supabase** (REQUERIDO)
2. Implementar sistema de autenticación
3. Crear páginas de cursos
4. Desarrollar panel de administración
5. Integrar sistema de pagos (Stripe)
6. Implementar foros y chat en vivo

## 📋 Requisitos Previos

- Node.js v18+ ✅
- npm ✅
- Git ✅
- Cuenta Supabase ✅
- VS Code con extensiones recomendadas ✅

## 🔧 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Completa los datos:
   - **Name:** ingecivil-academy (o el nombre que prefieras)
   - **Database Password:** Crea una contraseña segura (guárdala)
   - **Region:** Selecciona la más cercana (South America - Sao Paulo)
   - **Pricing Plan:** Free (suficiente para empezar)
4. Click en "Create new project"
5. Espera 2-3 minutos mientras se crea

### 2. Ejecutar Migración de Base de Datos

Una vez creado el proyecto:

1. En Supabase Dashboard, ve a **SQL Editor**
2. Click en "New Query"
3. Copia y pega TODO el contenido de: `supabase/migrations/20260212_initial_schema.sql`
4. Click en **"Run"** (abajo a la derecha)
5. Deberías ver "Success. No rows returned" ✅

### 3. Obtener Variables de Entorno

1. En Supabase Dashboard, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ve a **Settings** → **API** → **Service Role Key** (click en "Reveal")
   - Copia el key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ NO lo compartas

### 4. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   copy .env.example .env.local
   ```
2. Abre `.env.local` y reemplaza los valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Configurar Storage en Supabase

1. En Supabase Dashboard, ve a **Storage**
2. Crea los siguientes buckets (todos **públicos** por ahora):
   - `course-videos`
   - `course-materials`
   - `tool-files`
   - `avatars`

## 🏃 Ejecutar el Proyecto

```bash
# Si no está corriendo, inicia el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/           # Páginas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (marketing)/      # Páginas públicas con Navbar/Footer
│   │   ├── page.tsx      # Homepage
│   │   ├── about/
│   │   ├── contact/
│   │   └── pricing/
│   ├── (platform)/       # Área de usuarios autenticados
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── tools/
│   │   └── profile/
│   ├── (admin)/          # Panel de administración
│   │   └── admin/
│   └── api/              # API routes
│
├── components/
│   ├── ui/               # Componentes Shadcn/ui
│   ├── auth/             # Componentes de autenticación
│   ├── layout/           # Navbar, Footer, etc.
│   └── course/           # Componentes de cursos
│
├── lib/
│   ├── supabase/         # Configuración de Supabase
│   └── utils.ts          # Utilidades (cn, etc.)
│
├── hooks/                # Custom hooks
├── store/                # Zustand stores
└── types/                # TypeScript types
```

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estado:** Zustand + React Query
- **Formularios:** React Hook Form + Zod
- **Animaciones:** Framer Motion

## 📚 Características Planificadas

### MVP (Fase 1)
- ✅ Configuración inicial
- 🔄 Sistema de autenticación (Login, Registro, OAuth)
- ⏳ Catálogo de cursos con filtros
- ⏳ Reproductor de video con progreso
- ⏳ Sistema de pagos (Stripe)
- ⏳ Panel de administración básico

### Fase 2
- ⏳ Foros de discusión por curso
- ⏳ Sistema de evaluaciones (quizzes)
- ⏳ Chat en vivo para consultorías
- ⏳ Herramientas web interactivas

### Fase 3
- ⏳ Certificados digitales
- ⏳ Sistema de notificaciones
- ⏳ SEO y performance optimization
- ⏳ Dark mode completo

## 🤝 Equipo

Este proyecto está diseñado para un equipo de 2-5 instructores con roles diferenciados:
- **Admin:** Acceso completo
- **Instructor:** Gestiona sus propios cursos y herramientas
- **Student:** Accede a contenido comprado/suscrito

## 📖 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción

# Calidad de código
npm run lint         # Ejecutar ESLint

# Supabase (cuando se configure localmente)
supabase start       # Iniciar Supabase local
supabase status      # Ver estado
supabase stop        # Detener Supabase local
```

## ⚠️ Notas Importantes

1. **Nunca commitees el archivo `.env.local`** - ya está en `.gitignore`
2. **El `SUPABASE_SERVICE_ROLE_KEY`** es sensible - solo úsalo en el servidor
3. **El proyecto usa rutas protegidas** - el middleware redirige usuarios no autenticados
4. **Los roles se asignan al registrarse** - por defecto todos son `student`

## 🐛 Solución de Problemas

### Error: "Could not read package.json"
```bash
# Asegúrate de estar en el directorio correcto
cd "Curso-An-lisis-Estructural"
npm run dev
```

### Error: "Supabase client error"
- Verifica que las variables en `.env.local` sean correctas
- Asegúrate de que el proyecto Supabase esté activo
- Revisa que ejecutaste el SQL de migración

### Puerto 3000 ya en uso
```bash
# Encuentra el proceso
netstat -ano | findstr :3000
# Mata el proceso (reemplaza PID)
taskkill /PID <número_del_proceso> /F
```

## 📞 Soporte

Si encuentras problemas durante la configuración, verifica:
1. ✅ Variables de entorno correctas en `.env.local`
2. ✅ Migración SQL ejecutada en Supabase
3. ✅ Buckets de Storage creados
4. ✅ Node.js v18+ instalado

---

**Estado:** 🟢 Desarrollo activo | **Última actualización:** 12 de Febrero 2026