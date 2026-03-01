# Curso de Análisis Estructural — Plataforma Educativa

Plataforma web de educación en ingeniería estructural construida con Next.js 15, Supabase y Tailwind CSS.
Permite a los estudiantes adquirir, consumir y certificarse en cursos de análisis y diseño estructural.
Los instructores gestionan el contenido desde un panel de administración.
La sección de herramientas ofrece calculadoras estructurales impulsadas por un servidor Python (FastAPI).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + Shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage |
| Cálculo estructural | Python 3 + FastAPI + NumPy + SciPy |
| Despliegue | Vercel (Next.js) + Railway/Render (Python) |

---

## Estructura del proyecto

```
Curso-Análisis-Estructural/
├── src/
│   ├── app/
│   │   ├── (home)/               ← Landing page pública
│   │   ├── (marketing)/          ← Páginas de marketing (sin autenticación)
│   │   │   ├── cursos_m/         ← Catálogo público de cursos + syllabus
│   │   │   ├── testimonials/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── community_m/
│   │   ├── (auth)/               ← Login / Registro / Reset password
│   │   ├── (platform)/           ← Área autenticada de estudiantes
│   │   │   ├── dashboard/        ← Dashboard con progreso y certificados
│   │   │   ├── cursos/           ← Catálogo autenticado
│   │   │   ├── classroom/[slug]/ ← Reproductor de video + progreso + quizzes
│   │   │   ├── checkout/[slug]/  ← Pago de cursos/módulos
│   │   │   ├── community/        ← Comunidad (posts, DMs, leaderboard)
│   │   │   ├── tools/            ← Herramientas estructurales (5 secciones)
│   │   │   ├── certificados/[id]/← Vista e impresión del certificado
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── (admin)/admin/        ← Panel de instructor/admin
│   │   │   ├── page.tsx          ← Dashboard admin con stats
│   │   │   └── courses/          ← CRUD de cursos, módulos, capítulos y lecciones
│   │   ├── actions/              ← Server Actions (lógica de negocio)
│   │   └── api/
│   │       ├── contact/          ← Envío de formulario de contacto
│   │       └── tools/calculate/  ← Proxy al servidor Python
│   ├── components/
│   │   ├── admin/                ← AdminCourseClient.tsx
│   │   ├── auth/                 ← RegisterForm, LoginForm
│   │   ├── classroom/            ← VideoPlayer, ClassroomView, ClassroomTabs
│   │   ├── community/            ← Feed, DMs, Leaderboard
│   │   ├── courses/              ← CourseCard, CheckoutForm
│   │   ├── layout/               ← HomeNavbar, MarketingNavbar, PlatformNavbar, Footer
│   │   ├── profile/              ← ProfilePageClient
│   │   ├── tools/                ← ToolsNav, CalculosTab, CalculatorModal, etc.
│   │   └── ui/                   ← Shadcn/ui (Button, Card, Input, etc.)
│   ├── data/
│   │   └── courses-catalog.ts    ← Tipos TypeScript (array vacío; datos en Supabase)
│   └── lib/
│       ├── supabase/             ← Clientes server/browser de Supabase
│       └── schemas.ts            ← Esquemas Zod
├── python_server/                ← Servidor de cálculo estructural
│   ├── main.py                   ← FastAPI app + CORS + rutas de salud
│   ├── requirements.txt
│   └── routers/
│       ├── concrete.py           ← Cálculos ACI 318-19 (concreto)
│       ├── steel.py              ← Cálculos AISC 360-22 (acero)
│       └── structural.py         ← Propiedades de sección y análisis
├── supabase/
│   └── migrations/               ← 17 migraciones SQL en orden cronológico
└── public/images/                ← Imágenes y videos estáticos
```

---

## Base de datos (Supabase / PostgreSQL)

### Tablas principales

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil extendido del usuario (full_name, role, bio, avatar_url, redes sociales) |
| `courses` | Cursos publicados (slug, title, price, gradient, status, total_lessons) |
| `modules` | Módulos de un curso (order 0-based, price, title) |
| `chapters` | Capítulos dentro de un módulo |
| `lessons` | Lecciones con video URL, duration, duration_text, chapter_uuid, materials (JSON) |
| `enrollments` | Inscripción completa a un curso (payment_type: full/free) |
| `module_enrollments` | Inscripción a módulos individuales (user_id, course_id, module_id) |
| `progress` | PK compuesta (user_id, lesson_id) + campo `completed` |
| `certificates` | Certificados emitidos automáticamente al completar el 100% del curso |
| `posts` | Posts de comunidad (title, body, likes, user_id) |
| `replies` | Respuestas a posts |
| `direct_messages` | Mensajes directos entre usuarios |
| `quizzes` | Preguntas con opciones[] y respuesta correcta (catalog_lesson_id) |
| `quiz_attempts` | Intentos de quiz por usuario |
| `tools` | Herramientas del catálogo (tabla base con RLS corregida) |
| `tool_resources` | Recursos descargables — Biblioteca Técnica y Productividad |
| `contact_messages` | Mensajes del formulario de contacto público |

### Migraciones SQL (ejecutar en orden en Supabase SQL Editor)

```
supabase/migrations/
├── 20260212_initial_schema.sql            ← Tablas base: profiles, courses, enrollments, progress, quizzes, posts
├── 20260212_complete_rls_policies.sql     ← Políticas RLS completas iniciales
├── 20260212_disable_trigger.sql           ← Desactiva trigger de auto-creación de profile
├── 20260212_fix_profiles_rls.sql          ← Corrección de RLS en profiles
├── 20260215_create_contact_messages.sql   ← Tabla contact_messages
├── 20260215_contact_messages_rls_policy.sql
├── 20260216_module_enrollments.sql        ← Tabla module_enrollments para compra por módulo
├── 20260217_profile_extra_fields.sql      ← bio, website, linkedin, expertise, years_experience
├── 20260227_direct_messages.sql           ← Mensajes directos entre usuarios
├── 20260227_quiz_catalog_columns.sql      ← Columna catalog_lesson_id en quizzes
├── 20260227_certificates.sql              ← Tabla certificates con auto-emisión
├── 20260227_extend_catalog_schema.sql     ← Campos extra en courses (gradient, level, etc.)
├── 20260228_modules_chapters.sql          ← Tablas modules y chapters
├── 20260228_fix_chapter_fk.sql            ← FK chapter_uuid (UUID) en lessons
├── 20260228_add_total_lessons.sql         ← Columna total_lessons en courses
├── 20260228_lesson_materials.sql          ← Columna materials JSONB en lessons
└── 20260301_tools_resources.sql           ← Tabla tool_resources + corrección RLS de tools
```

---

## Autenticación y roles

- **Supabase Auth** gestiona login/registro/reset con email + contraseña.
- Al registrarse se crea un registro en `profiles` con `role = 'student'`.
- Roles disponibles: `student`, `instructor`, `admin`.
- Los instructores/admins acceden al panel `/admin`.

### Patrón de cliente admin (bypass de RLS)
Para leer datos restringidos en Server Components y Server Actions se usa el service role key:
```typescript
import { createClient as createAdminClient } from "@supabase/supabase-js";
const supabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```
Este patrón se usa en: dashboard, classroom (progreso), marketplace de cursos (lecciones en marketing), certificados, herramientas.

---

## Funcionalidades por sección

### Landing page `/(home)`
- Hero con video de fondo (FondoPlatform)
- Secciones: propuesta de valor, cursos destacados, testimonios, CTA de registro

### Marketing `/(marketing)`
- `/cursos_m` — catálogo público de todos los cursos con filtros
- `/cursos_m/[slug]` — detalle con syllabus desplegable (módulos → capítulos → lecciones)
  - Usa admin client para leer lecciones (RLS las bloquea para usuarios anónimos)
  - Título, descripción y stats envueltos en box `bg-white/80 backdrop-blur-sm`
- `/pricing` — planes de precios
- `/testimonials`, `/about`, `/contact` — páginas informativas

### Autenticación `/(auth)`
- Login, registro, reset de contraseña
- Formularios con React Hook Form + Zod
- Redirect post-login al dashboard

### Dashboard `/(platform)/dashboard`
- Cursos inscritos (completos y por módulo) con progreso por módulo
- Stats: lecciones completadas, tiempo de estudio, certificados obtenidos
- **Auto-emite certificados** cuando el progreso llega al 100%
- Cursos recomendados: publicados en Supabase y no inscritos aún
- Acciones rápidas: Explorar Cursos, Comunidad, Herramientas

### Classroom `/(platform)/classroom/[slug]`
- Reproductor de video (Vimeo / YouTube embed)
- Sidebar con árbol de navegación: módulos → capítulos → lecciones
- Marcado de lección como completada (`upsert` a tabla `progress`)
- Navegación secuencial bloqueada: no se puede saltar sin completar la anterior
- Tab **Ejercicios**: quizzes con React Hook Form y feedback inmediato
- Tab **Recursos**: materiales descargables (columna `materials` JSON de la lección)

### Checkout `/(platform)/checkout/[slug]`
- Selección de módulos individuales o curso completo
- Pago simulado (sin pasarela real integrada)
- Crea `enrollment` (curso completo) o `module_enrollment` en Supabase

### Comunidad `/(platform)/community`
- Feed de posts con likes y respuestas anidadas
- Leaderboard de usuarios más activos
- Mensajes directos (tabla `direct_messages`, separada de `chat_messages`)

### Herramientas `/(platform)/tools`
5 secciones con navegación por tabs:
- **Cálculo**: 10 calculadoras (concreto ACI 318-19 + acero AISC 360-22 + propiedades de sección)
- **Biblioteca Técnica**: recursos descargables desde Supabase (normas, formularios, plantillas Excel, manuales)
- **Simuladores Visuales**: 5 simuladores interactivos (placeholder "Próximamente")
- **Asistente IA**: chat UI placeholder (sin motor IA aún)
- **Recursos de Productividad**: checklists, plantillas de memoria y presupuesto
Ver [README-tools.md](README-tools.md) para la documentación completa de implementación.

### Certificados `/(platform)/certificados/[id]`
- Vista imprimible del certificado de finalización
- Datos: nombre, título del curso, fecha de emisión, ID de verificación
- `PrintButton.tsx` como Client Component separado para `window.print()`

### Panel Admin `/(admin)/admin`
- Dashboard con estadísticas globales
- CRUD completo de cursos (título, descripción, precio, gradient, status)
- Gestión anidada: curso → módulos → capítulos → lecciones
- Gestión de quizzes por lección
- Gestión de materiales descargables por lección

---

## Server Actions (`src/app/actions/`)

| Archivo | Funciones principales |
|---|---|
| `auth.ts` | `getUser()`, `signOut()` |
| `courses.ts` | `getCourses()`, `enrollCourse()`, `getEnrollment()`, `getModuleEnrollment()` |
| `certificates.ts` | `getUserCertificates()`, `getCertificate()`, `checkAndIssueCertificate()` |
| `quizzes.ts` | `getQuizzes()`, `submitQuizAttempt()` |
| `community.ts` | `getPosts()`, `createPost()`, `likePost()`, `getReplies()`, `getDirectMessages()`, `sendMessage()` |
| `admin.ts` | `createCourse()`, `updateCourse()`, `deleteCourse()`, `createLesson()`, `updateLesson()`, `deleteLesson()`, `createQuiz()` |
| `profile.ts` | `updateProfile()`, `getProfile()` |
| `settings.ts` | `updateSettings()` |

---

## API Routes

| Ruta | Método | Descripción |
|---|---|---|
| `/api/contact` | POST | Guarda mensaje de contacto en Supabase |
| `/api/tools/calculate` | POST | Proxy al servidor Python (estructural) |
| `/api/tools/calculate` | GET | Verificación de estado del servidor Python |

---

## Variables de entorno (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Servidor Python de cálculo estructural
PYTHON_API_URL=http://localhost:8000
```

> **Importante**: `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (Server Components, Server Actions, API Routes). Nunca en código client-side.

---

## Instalación y ejecución local

### 1. Clonar e instalar dependencias
```bash
git clone <repo-url>
cd Curso-Análisis-Estructural
npm install
```

### 2. Configurar Supabase
1. Crear proyecto en https://supabase.com/dashboard
2. Ir a **SQL Editor** y ejecutar cada archivo de `supabase/migrations/` en orden cronológico
3. Copiar las keys al archivo `.env.local`

### 3. Configurar Storage (Supabase)
Crear los siguientes buckets públicos en Storage:
- `course-videos`
- `course-materials`
- `tool-files`
- `avatars`

### 4. Ejecutar Next.js
```bash
npm run dev          # http://localhost:3000
```

### 5. Ejecutar servidor Python (para herramientas de cálculo)
```bash
cd python_server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Verificar: GET http://localhost:8000/health → {"status":"ok"}
```

---

## Decisiones de arquitectura importantes

### Progreso y certificados
- La tabla `progress` tiene **PK compuesta** `(user_id, lesson_id)` — sin columna `id` propia.
- Solo se cuentan lecciones con `chapter_uuid IS NOT NULL` para el cálculo de progreso (coincide exactamente con lo visible en classroom).
- Los certificados se **auto-emiten** en el dashboard mediante `checkAndIssueCertificate(slug)` cuando `progress === 100`.

### Catálogo de cursos
- El catálogo estático fue eliminado. Todos los cursos se leen directamente desde Supabase.
- El array `coursesCatalog` en `courses-catalog.ts` queda vacío por compatibilidad de importaciones.

### Client vs Server Components (Next.js 15)
- Por defecto, todas las páginas son **Server Components** (sin `"use client"`).
- Se usa `"use client"` solo cuando se requieren: event handlers (`onClick`), hooks de React (`useState`, `useEffect`), APIs del navegador (`window`, `document`).
- **Los event handlers nunca van en Server Components** — se extraen a componentes Client separados (ejemplo: `PrintButton.tsx`).

### Módulos y order
- `modules.order` es **0-based** en la DB. La posición visible para el usuario es `order + 1`.
- Los `module_enrollments` almacenan `module_id` como el `order` del módulo, no el UUID.

---

## Estado de implementación (Marzo 2026)

### Completo
- Autenticación (login / registro / logout / reset de contraseña)
- Catálogo de cursos completo (datos en Supabase)
- Dashboard con progreso real por módulo y certificados
- Classroom con video, progreso secuencial, quizzes y materiales
- Comunidad: posts, likes, replies, mensajes directos, leaderboard
- Panel admin: CRUD cursos / módulos / capítulos / lecciones / quizzes
- Certificados de finalización imprimibles
- API `/api/contact` funcional
- Herramientas de cálculo estructural (10 calculadoras + Biblioteca + Simuladores + Asistente + Recursos)
- Profile y Settings

### Pendiente
- Pagos reales (Stripe / MercadoPago) — actualmente simulados
- Asistente IA en `/tools/asistente` — UI placeholder lista, falta motor IA
- Simuladores visuales en `/tools/simuladores` — UI placeholder lista, falta lógica interactiva
- Notificaciones en tiempo real (Supabase Realtime)

---

## Solución de problemas frecuentes

### Las lecciones no aparecen en la página de marketing
El RLS de `lessons` bloquea usuarios anónimos. Usar `createAdminClient` (service role) para esa query.

### Los certificados no se emiten aunque el progreso es 100%
Verificar que:
1. Las lecciones tienen `chapter_uuid IS NOT NULL`
2. La query de progreso usa `.select("lesson_id", { count: "exact", head: true })` (no `"id"`)

### El servidor Python no responde
Verificar que `uvicorn main:app --reload --port 8000` esté corriendo desde `/python_server/`.
La API route Next.js devuelve 503 con mensaje descriptivo si `ECONNREFUSED`.

### Footer no visible / transparencia no funciona
El `backdrop-filter` requiere contexto de apilamiento. El footer debe tener `relative z-10`.
El body debe tener `background-color: #020617` (slate-950) en `globals.css`.

---

**Última actualización:** Marzo 2026
