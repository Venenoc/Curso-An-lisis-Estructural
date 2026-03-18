# Curso de Análisis Estructural — Plataforma Educativa

Plataforma web de educación en ingeniería estructural construida con Next.js 15, Supabase y Tailwind CSS.
Permite a los estudiantes adquirir, consumir y certificarse en cursos de análisis y diseño estructural.
Los instructores gestionan el contenido desde un panel de administración.
La sección de herramientas ofrece calculadoras estructurales impulsadas por un servidor Python (FastAPI).

---

## Arquitectura de infraestructura

```
┌─────────────────────────────────────────────────────────┐
│                        VERCEL                           │
│  Next.js 15 (App Router)                                │
│  - Páginas, animaciones, lógica frontend                │
│  - Server Actions, API Routes                           │
│  - Imágenes estáticas locales (public/images/)          │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│      SUPABASE        │   │       CLOUDFLARE R2          │
│  - PostgreSQL DB     │   │  - Videos de lecciones       │
│  - Auth              │   │  - Avatares de usuario       │
│  - Realtime          │   │  - Imágenes de posts         │
│  (sin Storage)       │   │  - MP3 (intro, platform)     │
└──────────────────────┘   └─────────────────────────────┘
```

### Regla de oro
- **Supabase**: solo texto (DB + Auth + Realtime). Cero archivos.
- **Cloudflare R2**: todos los archivos subidos por usuarios (avatares, imágenes de posts).
- **Vercel `public/`**: imágenes estáticas del sitio (fondos, logos, PDF de temario). Se sirven con caché de 1 año en el navegador.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + Shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Realtime | Supabase Realtime (notificaciones) |
| Storage de archivos | Cloudflare R2 |
| Videos de lecciones | Cloudflare (embed en classroom) |
| Pagos | MercadoPago Checkout API |
| Cálculo estructural | Python 3 + FastAPI + NumPy + SciPy |
| Despliegue | Vercel (Next.js) + Railway/Render (Python) |

---

## Estructura del proyecto

```
Curso-Análisis-Estructural/
├── src/
│   ├── app/
│   │   ├── (marketing)/          ← Páginas públicas (sin autenticación)
│   │   │   ├── page.tsx          ← Landing / Home
│   │   │   ├── cursos_m/         ← Catálogo público de cursos + syllabus
│   │   │   ├── testimonials/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── asesorias_m/
│   │   │   ├── community_m/
│   │   │   └── tools_m/
│   │   ├── (auth)/               ← Login / Registro / Reset password
│   │   ├── (platform)/           ← Área autenticada de estudiantes
│   │   │   ├── dashboard/        ← Dashboard con progreso y certificados
│   │   │   ├── cursos/           ← Catálogo autenticado
│   │   │   ├── classroom/[slug]/ ← Reproductor de video + progreso + quizzes
│   │   │   ├── checkout/[slug]/  ← Pago de cursos/módulos (MercadoPago)
│   │   │   ├── community/        ← Comunidad (posts, DMs, leaderboard)
│   │   │   ├── asesorias/        ← Página de asesorías
│   │   │   ├── certificados/[id]/← Vista e impresión del certificado
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── (tools)/tools/        ← Herramientas estructurales
│   │   │   ├── calculos/
│   │   │   ├── biblioteca/normatividad/
│   │   │   ├── simuladores/
│   │   │   ├── asistente/
│   │   │   └── recursos/
│   │   ├── (admin)/admin/        ← Panel de instructor/admin
│   │   │   ├── page.tsx          ← Dashboard admin con stats
│   │   │   ├── courses/          ← CRUD de cursos, módulos, capítulos y lecciones
│   │   │   └── testimonials/
│   │   ├── actions/              ← Server Actions (lógica de negocio)
│   │   └── api/
│   │       ├── contact/          ← Envío de formulario de contacto
│   │       ├── payments/         ← MercadoPago (create-payment, webhook)
│   │       └── tools/calculate/  ← Proxy al servidor Python
│   ├── components/
│   │   ├── admin/                ← AdminCourseClient.tsx, AdminCoursesClient.tsx
│   │   ├── auth/                 ← RegisterForm, LoginForm, ResetPasswordForm
│   │   ├── classroom/            ← VideoPlayer, ClassroomView, ClassroomTabs, LessonComments
│   │   ├── community/            ← CommunityFeed, PostCard, ReplySection, DirectMessages, ChatWindow
│   │   ├── courses/              ← CourseCard, CheckoutForm
│   │   ├── layout/               ← HomeNavbar, MarketingNavbar, PlatformNavbar, Footer
│   │   ├── profile/              ← ProfilePageClient
│   │   ├── tools/                ← ToolsNav, CalculosTab, CalculatorModal, BibliotecaTab, etc.
│   │   └── ui/                   ← Shadcn/ui (Button, Card, Input, etc.)
│   ├── data/
│   │   └── courses-catalog.ts    ← Array vacío; todos los datos viven en Supabase
│   └── lib/
│       ├── supabase/             ← Clientes server/browser de Supabase
│       ├── r2.ts                 ← Cliente AWS S3 compatible con Cloudflare R2
│       └── schemas.ts            ← Esquemas Zod
├── python_server/                ← Servidor de cálculo estructural
│   ├── main.py
│   ├── requirements.txt
│   └── routers/
│       ├── concrete.py           ← Cálculos ACI 318-19 (concreto)
│       ├── steel.py              ← AISC 360-22 (acero)
│       └── structural.py         ← Propiedades de sección y análisis
├── supabase/
│   └── migrations/               ← Migraciones SQL en orden cronológico
├── public/
│   ├── favicon.svg
│   └── images/                   ← Estáticos del sitio (fondos, logos, PDF temario, MP3)
└── next.config.ts                ← Cache headers + remotePatterns R2
```

---

## Base de datos (Supabase / PostgreSQL)

### Tablas principales

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil extendido (full_name, role, bio, avatar_url → URL de R2) |
| `courses` | Cursos publicados (slug, title, price, gradient, status, total_lessons) |
| `modules` | Módulos de un curso (order 0-based, price, title) |
| `chapters` | Capítulos dentro de un módulo |
| `lessons` | Lecciones: video_url (Cloudflare embed), duration, chapter_uuid, materials (JSON) |
| `enrollments` | Inscripción completa a un curso (payment_type: full/free) |
| `module_enrollments` | Inscripción a módulos individuales |
| `progress` | PK compuesta (user_id, lesson_id) + campo `completed` |
| `certificates` | Emitidos automáticamente al completar el 100% del curso |
| `posts` | Posts de comunidad (image_url → URL de R2) |
| `replies` | Respuestas a posts |
| `direct_messages` | Mensajes directos entre usuarios |
| `quizzes` | Preguntas con opciones[] y respuesta correcta (catalog_lesson_id) |
| `quiz_attempts` | Intentos de quiz por usuario |
| `notifications` | Notificaciones en tiempo real (Supabase Realtime) |
| `payments` | Registro de pagos MercadoPago |
| `tool_resources` | Recursos descargables — Biblioteca Técnica y Productividad |
| `contact_messages` | Mensajes del formulario de contacto público |

### Migraciones SQL (ejecutar en orden en Supabase SQL Editor)

```
supabase/migrations/
├── 20260212_initial_schema.sql
├── 20260212_complete_rls_policies.sql
├── 20260212_disable_trigger.sql
├── 20260212_fix_profiles_rls.sql
├── 20260215_create_contact_messages.sql
├── 20260215_contact_messages_rls_policy.sql
├── 20260216_module_enrollments.sql
├── 20260217_profile_extra_fields.sql
├── 20260227_direct_messages.sql
├── 20260227_quiz_catalog_columns.sql
├── 20260227_certificates.sql
├── 20260227_extend_catalog_schema.sql
├── 20260228_modules_chapters.sql
├── 20260228_fix_chapter_fk.sql
├── 20260228_add_total_lessons.sql
├── 20260228_lesson_materials.sql
├── 20260301_tools_resources.sql
├── 20260301_notifications.sql
└── 20260301_payments.sql
```

---

## Cloudflare R2 — Gestión de archivos

### Configuración

```typescript
// src/lib/r2.ts
// Cliente S3-compatible con Cloudflare R2
// Credenciales en .env.local:
// CF_R2_ACCOUNT_ID, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY
// CF_R2_BUCKET_NAME, NEXT_PUBLIC_CF_R2_PUBLIC_URL
```

### Estructura de carpetas en el bucket

```
curso-media/
└── public/
    ├── avatars/{profile_id}/{timestamp}.{ext}   ← Avatares de usuario
    ├── community/{user_id}/{timestamp}.{ext}    ← Imágenes de posts
    └── images/                                  ← (Legacy — ya no se usa)
```

### Flujo de subida

- **Avatares** — `src/app/actions/profile.ts` → `uploadToR2()` → guarda URL en `profiles.avatar_url`
- **Imágenes de posts** — `src/app/actions/community.ts` → `uploadToR2()` → guarda URL en `posts.image_url`
- **Videos** — subidos directamente a Cloudflare (no pasan por la app)

### Regla crítica
La URL pública incluye `/public/` en la ruta porque los archivos están bajo `curso-media/public/`.
La `NEXT_PUBLIC_CF_R2_PUBLIC_URL` debe apuntar a `https://pub-xxx.r2.dev/public`.

---

## Caché del navegador

Configurado en `next.config.ts` con la función `headers()`:

| Recurso | Cache-Control | Duración |
|---|---|---|
| `/images/*` (fondos, PDF, webp, mp3) | `public, max-age=31536000, immutable` | 1 año |
| `/_next/static/*` (JS, CSS) | `public, max-age=31536000, immutable` | 1 año |
| `/_next/static/media/*` (fuentes) | `public, max-age=31536000, immutable` | 1 año |
| `/favicon.svg` | `public, max-age=86400` | 1 día |
| Páginas HTML | `public, max-age=0, must-revalidate` | Revalida en cada visita |

Los archivos JS/CSS llevan hash en el nombre (ej. `main-abc123.js`). Al hacer un nuevo deploy en Vercel, Next.js genera hashes nuevos y el navegador descarga automáticamente la versión actualizada.

**Importante:** si se reemplaza una imagen manteniendo el mismo nombre de archivo, renombrarla o agregar sufijo (ej. `Fondo_ATm_v2.webp`) para invalidar el caché del navegador.

---

## Autenticación y roles

- **Supabase Auth** gestiona login/registro/reset con email + contraseña.
- Al registrarse se crea un registro en `profiles` con `role = 'student'`.
- Roles disponibles: `student`, `instructor`, `admin`.
- Los instructores/admins acceden al panel `/admin`.

### Patrón de cliente admin (bypass de RLS)

```typescript
import { createClient as createAdminClient } from "@supabase/supabase-js";
const supabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

Usado en: dashboard, classroom, marketplace, certificados, herramientas, perfil.

---

## Funcionalidades por sección

### Landing / Marketing `/(marketing)`
- Hero con video de fondo (`Fondo4.mp4` — local en `public/images/`)
- `/cursos_m/[slug]` — detalle con syllabus completo (módulos → capítulos → lecciones)
- PDF de temario: `/images/Temariodecursos/Curso1tema.pdf` (local, caché 1 año)
- Fondos: imágenes `.webp` locales en `public/images/Fondos de marketing/`

### Dashboard `/(platform)/dashboard`
- Cursos inscritos con progreso por módulo
- Stats: lecciones completadas, tiempo de estudio, certificados
- Auto-emite certificados cuando progreso llega al 100%

### Classroom `/(platform)/classroom/[slug]`
- Video player (Cloudflare embed vía `video_url` de la lección)
- Sidebar: módulos → capítulos → lecciones
- Progreso secuencial bloqueado
- Tab **Ejercicios**: quizzes con feedback inmediato
- Tab **Materiales**: archivos descargables (columna `materials` JSON de la lección — URLs manuales)
- Tab **Comentarios**: por lección

### Comunidad `/(platform)/community`
- Feed de posts con likes, respuestas anidadas
- Imágenes en posts → subidas a Cloudflare R2
- Mensajes directos (tabla `direct_messages`)
- Leaderboard de usuarios más activos
- Notificaciones en tiempo real (Supabase Realtime en PlatformNavbar)

### Checkout `/(platform)/checkout/[slug]`
- Selección de módulos individuales o curso completo
- Integración MercadoPago Checkout API
- Webhook: `POST /api/payments/webhook`
- Crea `enrollment` o `module_enrollment` en Supabase tras pago exitoso

### Certificados `/(platform)/certificados/[id]`
- Vista imprimible
- Auto-emitidos en dashboard al llegar al 100%

### Herramientas `/(tools)/tools`
Ver [README-tools.md](README-tools.md) para documentación completa.
- **Cálculo**: 10 calculadoras (concreto ACI 318-19 + acero AISC 360-22 + secciones)
- **Biblioteca Técnica**: recursos descargables
- **Simuladores**: placeholder
- **Asistente IA**: placeholder
- **Recursos de Productividad**: checklists y plantillas

### Panel Admin `/(admin)/admin`
- Estadísticas globales
- CRUD completo: cursos → módulos → capítulos → lecciones
- Gestión de quizzes por lección
- Gestión de materiales (URLs externas) por lección

---

## Server Actions (`src/app/actions/`)

| Archivo | Funciones principales |
|---|---|
| `auth.ts` | `getUser()`, `signOut()` |
| `courses.ts` | `getCourses()`, `enrollCourse()`, `getEnrollment()`, `updateLessonMaterials()` |
| `certificates.ts` | `getUserCertificates()`, `checkAndIssueCertificate()` |
| `quizzes.ts` | `getQuizzes()`, `submitQuizAttempt()` |
| `community.ts` | `getPosts()`, `createPost()`, `likePost()`, `uploadCommunityImage()`, `sendMessage()` |
| `profile.ts` | `updateProfile()`, `uploadAvatar()` — avatar sube a R2 |
| `admin.ts` | CRUD cursos / módulos / capítulos / lecciones / quizzes |
| `notifications.ts` | `getNotifications()`, `markAsRead()` |

---

## API Routes

| Ruta | Método | Descripción |
|---|---|---|
| `/api/contact` | POST | Guarda mensaje en Supabase |
| `/api/payments/create-payment` | POST | Crea preferencia MercadoPago |
| `/api/payments/webhook` | POST | Webhook MercadoPago → crea enrollment |
| `/api/tools/calculate` | POST | Proxy al servidor Python |
| `/api/tools/calculate` | GET | Verifica estado del servidor Python |

---

## Variables de entorno (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Cloudflare R2
CF_R2_ACCOUNT_ID=<account-id>
CF_R2_ACCESS_KEY_ID=<access-key-id>
CF_R2_SECRET_ACCESS_KEY=<secret-access-key>
CF_R2_BUCKET_NAME=curso-media
NEXT_PUBLIC_CF_R2_PUBLIC_URL=https://pub-xxx.r2.dev/public

# MercadoPago
MP_ACCESS_TOKEN=<access-token>
NEXT_PUBLIC_MP_PUBLIC_KEY=<public-key>

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Servidor Python
PYTHON_API_URL=http://localhost:8000
```

> `SUPABASE_SERVICE_ROLE_KEY`, `CF_R2_SECRET_ACCESS_KEY` y `MP_ACCESS_TOKEN` son secretos de servidor. Nunca en código client-side.

---

## Instalación y ejecución local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crear proyecto en https://supabase.com/dashboard
2. Ejecutar cada archivo de `supabase/migrations/` en orden en el SQL Editor
3. Copiar las keys al `.env.local`

### 3. Configurar Cloudflare R2
1. Crear bucket `curso-media` en Cloudflare R2
2. Habilitar acceso público (Public URL)
3. Crear API Token con permisos de lectura/escritura
4. Copiar credenciales al `.env.local`
5. Subir la carpeta `public/images/` al bucket bajo la ruta `public/images/`

### 4. Ejecutar Next.js
```bash
npm run dev          # http://localhost:3000
```

### 5. Ejecutar servidor Python (herramientas de cálculo)
```bash
cd python_server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Decisiones de arquitectura

### Sin Supabase Storage
Supabase Storage genera "Cached Egress" que consume el plan gratuito rápidamente.
**Todos los archivos van a Cloudflare R2**, que tiene egress gratuito ilimitado hacia Internet.
Supabase solo almacena texto (URLs de R2 en los campos `avatar_url`, `image_url`).

### Imágenes estáticas locales
Los fondos de página (`.webp`) y archivos del sitio (PDF de temario, MP3) están en `public/images/` y se sirven desde Vercel con caché de 1 año en el navegador. Esto evita latencia de red y costo de egress de R2 para archivos que nunca cambian.

### Progreso y certificados
- La tabla `progress` tiene PK compuesta `(user_id, lesson_id)`.
- Solo se cuentan lecciones con `chapter_uuid IS NOT NULL`.
- Los certificados se auto-emiten en el dashboard al llegar al 100%.

### Client vs Server Components
- Por defecto todas las páginas son Server Components.
- `"use client"` solo para: event handlers, hooks de React, APIs del navegador.

### Módulos y order
- `modules.order` es 0-based en DB. La posición visible es `order + 1`.

---

## Estado de implementación (Marzo 2026)

### Completo
- Auth (login / registro / logout / reset)
- Catálogo de cursos (datos en Supabase)
- Dashboard con progreso real y certificados
- Classroom: video, progreso secuencial, quizzes, materiales, comentarios
- Comunidad: posts, likes, replies, DMs, leaderboard
- Notificaciones en tiempo real (Supabase Realtime)
- Panel admin: CRUD completo cursos / módulos / capítulos / lecciones / quizzes
- Certificados imprimibles
- MercadoPago Checkout API Phase 1 (cursos y módulos)
- Herramientas de cálculo (10 calculadoras + Biblioteca + Recursos)
- Cloudflare R2 para avatares e imágenes de posts
- Caché del navegador configurado (1 año para estáticos)
- API `/api/contact` funcional

### Pendiente
- MercadoPago Phase 2: suscripciones
- Asistente IA en `/tools/asistente` — UI lista, falta motor IA
- Simuladores visuales — UI lista, falta lógica interactiva
- Materiales de lecciones con subida a R2 (actualmente URLs manuales)

---

## Solución de problemas frecuentes

### Las lecciones no aparecen en la página de marketing
RLS bloquea usuarios anónimos. Usar `createAdminClient` (service role) para esa query.

### Los certificados no se emiten aunque el progreso es 100%
Verificar que las lecciones tengan `chapter_uuid IS NOT NULL` y que la query de progreso use `lesson_id` (no `id`).

### Avatar subido a R2 devuelve 404
Verificar que `NEXT_PUBLIC_CF_R2_PUBLIC_URL` termine en `/public` (ej. `https://pub-xxx.r2.dev/public`).
El archivo se sube a `avatars/{id}/...` y la URL pública resulta en `https://pub-xxx.r2.dev/public/avatars/{id}/...`.

### El servidor Python no responde
Verificar que `uvicorn main:app --reload --port 8000` esté corriendo desde `/python_server/`.
La API route devuelve 503 si `ECONNREFUSED`.

### Imagen de fondo no se actualiza tras reemplazarla
El navegador tiene la imagen en caché 1 año por su nombre. Renombrar el archivo o agregar sufijo de versión (ej. `Fondo_ATm_v2.webp`) y actualizar la referencia en el código.

---

**Última actualización:** Marzo 2026
