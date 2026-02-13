# 🎯 Próximos Pasos - Configuración Rápida

## ⚡ Acción Inmediata Requerida

Para que la aplicación funcione completamente, necesitas configurar Supabase:

### Paso 1: Crear Proyecto en Supabase (5 minutos)

1. Abre [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Datos del proyecto:
   - Name: `ingecivil-academy`
   - Database Password: (crea una fuerte y **guárdala**)
   - Region: South America (Sao Paulo)
4. Click **"Create new project"**
5. ☕ Espera 2-3 minutos

### Paso 2: Ejecutar Script de Base de Datos (2 minutos)

1. En tu proyecto de Supabase, ve a **SQL Editor** (menú izquierda)
2. Click **"New Query"**
3. Abre el archivo: `supabase/migrations/20260212_initial_schema.sql`
4. **Copia TODO el contenido** del archivo
5. **Pega** en el editor SQL de Supabase
6. Click **"Run"** (botón verde abajo a la derecha)
7. ✅ Deberías ver: "Success. No rows returned"

### Paso 3: Obtener Credenciales (1 minuto)

En Supabase Dashboard:

1. Ve a **Settings** (⚙️) → **API**
2. Copia estos 2 valores:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Scroll down y click **"Reveal"** en **service_role key**
   ```
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Paso 4: Crear Archivo .env.local (1 minuto)

1. En VS Code, crea un archivo llamado `.env.local` en la raíz del proyecto
2. Copia este contenido y **reemplaza los valores**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_largo_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_largo_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 5: Crear Buckets de Storage (2 minutos)

1. En Supabase, ve a **Storage** (menú izquierda)
2. Click **"Create a new bucket"** y crea estos 4 buckets (uno por uno):
   - Name: `course-videos` | Public: ✅ ON
   - Name: `course-materials` | Public: ✅ ON
   - Name: `tool-files` | Public: ✅ ON
   - Name: `avatars` | Public: ✅ ON

### Paso 6: Reiniciar Servidor (30 segundos)

En la terminal de VS Code:
1. Presiona `Ctrl + C` para detener el servidor
2. Ejecuta de nuevo:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000)

## ✅ Verificación

Si todo está bien:
- ✅ La página carga sin errores en consola
- ✅ Puedes navegar a las diferentes secciones
- ✅ El servidor muestra: "Ready in Xms"

## 🚀 Después de Configurar

Una vez completada la configuración de Supabase, continuaremos con:

1. **Sistema de Autenticación**
   - Crear formularios de Login y Registro
   - Configurar OAuth con Google
   - Implementar recuperación de contraseña

2. **Primera Versión del Catálogo de Cursos**
   - Vista de lista de cursos
   - Página de detalle de curso
   - Sistema de inscripción

3. **Panel de Administración**
   - Dashboard con estadísticas
   - CRUD de cursos
   - Subida de videos

## ❓ ¿Problemas?

### No cargó el servidor después de crear .env.local
- Asegúrate de haber detenido el servidor (`Ctrl + C`)
- Vuelve a iniciarlo: `npm run dev`
- Las variables de entorno solo se leen al iniciar

### Error en la migración SQL
- Asegúrate de copiar TODO el contenido del archivo
- Verifica que no haya caracteres extraños
- El script debe ejecutarse una sola vez

### ¿Cómo verifico que la base de datos se creó bien?
1. En Supabase, ve a **Database** → **Tables**
2. Deberías ver tablas como: `profiles`, `courses`, `lessons`, etc.

---

**⏱️ Tiempo total estimado:** 10-15 minutos

Cuando termines, avísame y continuamos con el desarrollo del sistema de autenticación. 🚀
