-- =============================================================================
-- FULL_SCHEMA.sql
-- Esquema completo consolidado — Plataforma Análisis Estructural
-- Actualizado el 2026-03-16 a partir de 24 migraciones individuales
--
-- INSTRUCCIONES: Ejecutar este archivo en un proyecto Supabase VACÍO.
-- Si ya ejecutaste alguna migración individual, NO ejecutes este archivo.
-- Este archivo reemplaza completamente a todas las migraciones anteriores.
-- =============================================================================

-- ── 0. EXTENSIONES ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ENUMS ──────────────────────────────────────────────────────────────────
CREATE TYPE user_role          AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE course_status      AS ENUM ('draft', 'published', 'archived');
CREATE TYPE payment_type       AS ENUM ('one_time', 'subscription');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE question_type      AS ENUM ('multiple_choice', 'true_false');
CREATE TYPE tool_type          AS ENUM ('download', 'web');
CREATE TYPE subscription_plan  AS ENUM ('monthly', 'annual');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'incomplete');

-- ── 2. FUNCIONES UTILITARIAS ───────────────────────────────────────────────────
-- Actualiza updated_at automáticamente en cada UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: el trigger on_auth_user_created fue deshabilitado; los perfiles
-- se crean manualmente desde el servidor con el cliente admin (service role).

-- ── 3. TABLAS BASE ────────────────────────────────────────────────────────────

-- 3.1 profiles (extiende auth.users)
CREATE TABLE profiles (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role        user_role   NOT NULL DEFAULT 'student',
    full_name   TEXT,
    avatar_url  TEXT,
    bio         TEXT,
    specialty   TEXT,       -- campo adicional del perfil
    location    TEXT,       -- campo adicional del perfil
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 courses
CREATE TABLE courses (
    id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                   TEXT          NOT NULL,
    description             TEXT,
    thumbnail               TEXT,
    image_url               TEXT,
    slug                    TEXT,
    level                   TEXT,         -- 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles'
    gradient                TEXT,         -- clase CSS Tailwind (ej. "from-blue-600 to-cyan-500")
    total_duration          TEXT,         -- texto legible (ej. "4 horas")
    total_lessons           INTEGER       DEFAULT 0,
    presentation_video_url  TEXT,
    price                   DECIMAL(10,2) NOT NULL DEFAULT 0,
    subscription_only       BOOLEAN       DEFAULT FALSE,
    instructor_id           UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status                  course_status DEFAULT 'draft',
    created_at              TIMESTAMPTZ   DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_courses_slug       ON courses(slug);
CREATE INDEX        idx_courses_instructor ON courses(instructor_id);
CREATE INDEX        idx_courses_status     ON courses(status);

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.3 modules (max 4 por curso)
CREATE TABLE modules (
    id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id              UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title                  TEXT        NOT NULL,
    "order"                INTEGER     NOT NULL DEFAULT 0,
    price                  NUMERIC(10,2) DEFAULT 0,
    presentation_video_url TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX modules_course_id_idx ON modules(course_id);

-- 3.4 chapters
CREATE TABLE chapters (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id  UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    "order"    INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX chapters_module_id_idx ON chapters(module_id);

-- 3.5 lessons
-- Nota: chapter_id (INTEGER) = ID del capítulo en el catálogo estático
--       chapter_uuid (UUID)   = FK a la tabla chapters (estructura DB)
CREATE TABLE lessons (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id     UUID        REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title         TEXT        NOT NULL,
    description   TEXT,
    video_url     TEXT,
    duration      INTEGER,    -- duración en segundos
    "order"       INTEGER     NOT NULL DEFAULT 0,
    resources_urls TEXT[],
    materials     JSONB       DEFAULT '[]'::jsonb,  -- [{ title, url }]
    -- Metadatos del catálogo estático (para enlazar con /src/data/courses-catalog.ts)
    catalog_id    INTEGER,    -- ID numérico del catálogo (111, 112, 211 ...)
    module_id     INTEGER,    -- número de módulo (1, 2, 3, 4)
    module_title  TEXT,       -- nombre del módulo
    chapter_id    INTEGER,    -- número de capítulo (11, 12, 21 ...)
    chapter_title TEXT,       -- nombre del capítulo
    duration_text TEXT,       -- texto legible (ej. "22 min")
    -- FK a la tabla chapters (estructura DB)
    chapter_uuid  UUID        REFERENCES chapters(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_course   ON lessons(course_id);
CREATE INDEX idx_lessons_catalog  ON lessons(course_id, catalog_id);
CREATE INDEX idx_lessons_chapter_uuid ON lessons(chapter_uuid);

-- 3.6 enrollments (curso completo)
CREATE TABLE enrollments (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID         REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id    UUID         REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    payment_type payment_type NOT NULL,
    enrolled_at  TIMESTAMPTZ  DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user   ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- 3.7 module_enrollments (compra por módulo)
CREATE TABLE module_enrollments (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID         REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id    UUID         REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    module_id    INTEGER      NOT NULL,
    module_title TEXT         NOT NULL,
    price        DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_type payment_type NOT NULL DEFAULT 'one_time',
    enrolled_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

CREATE INDEX idx_module_enrollments_user   ON module_enrollments(user_id);
CREATE INDEX idx_module_enrollments_course ON module_enrollments(course_id);
CREATE INDEX idx_module_enrollments_module ON module_enrollments(user_id, course_id, module_id);

-- 3.8 progress (PK compuesta, sin columna id)
CREATE TABLE progress (
    user_id          UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id        UUID        REFERENCES lessons(id)  ON DELETE CASCADE NOT NULL,
    completed        BOOLEAN     DEFAULT FALSE,
    watched_duration INTEGER     DEFAULT 0,    -- en segundos
    last_watched_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_progress_user   ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);

-- 3.9 subscriptions
CREATE TABLE subscriptions (
    id                    UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID                REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT               UNIQUE,
    plan                  subscription_plan   NOT NULL,
    status                subscription_status DEFAULT 'active',
    current_period_end    TIMESTAMPTZ,
    created_at            TIMESTAMPTZ         DEFAULT NOW(),
    updated_at            TIMESTAMPTZ         DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.10 payments
CREATE TABLE payments (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    type              TEXT        NOT NULL,  -- 'course' | 'subscription' | 'consultation' | 'tool'
    stripe_payment_id TEXT,
    status            TEXT        DEFAULT 'pending',
    metadata          JSONB,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 tools (herramientas descargables/web del instructor)
CREATE TABLE tools (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT        NOT NULL,
    description   TEXT,
    type          tool_type   NOT NULL,
    file_url      TEXT,
    thumbnail     TEXT,
    price         DECIMAL(10,2) NOT NULL DEFAULT 0,
    instructor_id UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.12 consultations
CREATE TABLE consultations (
    id            UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID                 REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    student_id    UUID                 REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title         TEXT                 NOT NULL,
    description   TEXT,
    price         DECIMAL(10,2)        NOT NULL,
    status        consultation_status  DEFAULT 'scheduled',
    scheduled_at  TIMESTAMPTZ          NOT NULL,
    duration      INTEGER              NOT NULL,   -- minutos
    created_at    TIMESTAMPTZ          DEFAULT NOW()
);

-- 3.13 chat_messages (para consultations, no para comunidad)
CREATE TABLE chat_messages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID        REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
    sender_id       UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    message         TEXT        NOT NULL,
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    read            BOOLEAN     DEFAULT FALSE
);

CREATE INDEX idx_chat_messages_consultation ON chat_messages(consultation_id);

-- 3.14 forum_threads
CREATE TABLE forum_threads (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id  UUID        REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title      TEXT        NOT NULL,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_threads_course ON forum_threads(course_id);

-- 3.15 forum_replies
CREATE TABLE forum_replies (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id  UUID        REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
    user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);

-- 3.16 quizzes
-- lesson_id es nullable; se usa course_slug + catalog_lesson_id para enlazar al catálogo
CREATE TABLE quizzes (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id         UUID        REFERENCES lessons(id) ON DELETE CASCADE,  -- nullable
    title             TEXT        NOT NULL,
    passing_score     INTEGER     NOT NULL DEFAULT 70,
    course_slug       TEXT,
    catalog_lesson_id INTEGER,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_course_slug    ON quizzes(course_slug);
CREATE INDEX idx_quizzes_catalog_lesson ON quizzes(course_slug, catalog_lesson_id);

-- 3.17 quiz_questions
CREATE TABLE quiz_questions (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id        UUID          REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    question       TEXT          NOT NULL,
    type           question_type NOT NULL,
    options        JSONB,        -- array de opciones para multiple_choice
    correct_answer TEXT          NOT NULL,
    points         INTEGER       DEFAULT 1,
    created_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- 3.18 quiz_attempts
CREATE TABLE quiz_attempts (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id      UUID        REFERENCES quizzes(id)  ON DELETE CASCADE NOT NULL,
    score        INTEGER     NOT NULL,
    answers      JSONB       NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.19 direct_messages (mensajería privada de la comunidad)
CREATE TABLE direct_messages (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content     TEXT        NOT NULL,
    read        BOOLEAN     DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_direct_messages_sender   ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_created  ON direct_messages(created_at);

-- 3.20 contact_messages (formulario público de contacto)
CREATE TABLE contact_messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL,
    subject    TEXT        NOT NULL,
    message    TEXT        NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3.21 certificates (certificados de finalización)
CREATE TABLE certificates (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_slug  TEXT        NOT NULL,
    course_title TEXT        NOT NULL,
    issued_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_slug)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);

-- 3.22 tool_resources (recursos descargables de Biblioteca Técnica y Productividad)
-- Categorías Biblioteca: 'norms_codes' | 'formula_sheets' | 'excel_templates' |
--   'manuals_guides' | 'manuals_details' | 'column_details' |
--   'structural_details' | 'example_models'
-- Categorías Recursos:  'structural_checklist' | 'calculation_templates' |
--   'report_templates' | 'budget_templates'
CREATE TABLE tool_resources (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT        NOT NULL,
    description   TEXT,
    category      TEXT        NOT NULL,
    file_url      TEXT,
    thumbnail_url TEXT,
    is_free       BOOLEAN     NOT NULL DEFAULT true,
    is_published  BOOLEAN     NOT NULL DEFAULT false,
    created_by    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tool_resources_category   ON tool_resources(category);
CREATE INDEX idx_tool_resources_created_by ON tool_resources(created_by);

-- 3.23 lesson_comments (comentarios por lección en el classroom)
CREATE TABLE lesson_comments (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id  UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lesson_comments_lesson ON lesson_comments(lesson_id, created_at DESC);

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_resources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_comments   ENABLE ROW LEVEL SECURITY;

-- ── 4.1 profiles ──────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "profiles_update"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Los perfiles se crean desde el servidor (admin client), esta política
-- permite también la creación manual si es necesario.
CREATE POLICY "profiles_insert"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- ── 4.2 courses ───────────────────────────────────────────────────────────────
CREATE POLICY "courses_select"
    ON courses FOR SELECT
    USING (
        status = 'published'
        OR instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "courses_insert"
    ON courses FOR INSERT
    WITH CHECK (
        instructor_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'instructor'
        )
    );

CREATE POLICY "courses_update"
    ON courses FOR UPDATE
    USING (instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "courses_delete"
    ON courses FOR DELETE
    USING (instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.3 modules ───────────────────────────────────────────────────────────────
CREATE POLICY "modules_select"
    ON modules FOR SELECT USING (true);

CREATE POLICY "modules_insert"
    ON modules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN profiles p ON p.id = c.instructor_id
            WHERE c.id = modules.course_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "modules_update"
    ON modules FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN profiles p ON p.id = c.instructor_id
            WHERE c.id = modules.course_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "modules_delete"
    ON modules FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN profiles p ON p.id = c.instructor_id
            WHERE c.id = modules.course_id AND p.user_id = auth.uid()
        )
    );

-- ── 4.4 chapters ──────────────────────────────────────────────────────────────
CREATE POLICY "chapters_select"
    ON chapters FOR SELECT USING (true);

CREATE POLICY "chapters_insert"
    ON chapters FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN courses c ON c.id = m.course_id
            JOIN profiles p ON p.id = c.instructor_id
            WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "chapters_update"
    ON chapters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN courses c ON c.id = m.course_id
            JOIN profiles p ON p.id = c.instructor_id
            WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "chapters_delete"
    ON chapters FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN courses c ON c.id = m.course_id
            JOIN profiles p ON p.id = c.instructor_id
            WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
        )
    );

-- ── 4.5 lessons ───────────────────────────────────────────────────────────────
CREATE POLICY "lessons_select"
    ON lessons FOR SELECT
    USING (
        course_id IN (
            SELECT course_id FROM enrollments
            WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
        OR course_id IN (
            SELECT id FROM courses
            WHERE instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "lessons_all_instructor"
    ON lessons FOR ALL
    USING (
        course_id IN (
            SELECT id FROM courses
            WHERE instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- ── 4.6 enrollments ───────────────────────────────────────────────────────────
CREATE POLICY "enrollments_select_own"
    ON enrollments FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "enrollments_insert_own"
    ON enrollments FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "enrollments_select_instructor"
    ON enrollments FOR SELECT
    USING (
        course_id IN (
            SELECT id FROM courses
            WHERE instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- ── 4.7 module_enrollments ────────────────────────────────────────────────────
CREATE POLICY "module_enrollments_select"
    ON module_enrollments FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "module_enrollments_insert"
    ON module_enrollments FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.8 progress ──────────────────────────────────────────────────────────────
CREATE POLICY "progress_select"
    ON progress FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "progress_insert_update"
    ON progress FOR INSERT, UPDATE
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.9 subscriptions ─────────────────────────────────────────────────────────
CREATE POLICY "subscriptions_select"
    ON subscriptions FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "subscriptions_insert"
    ON subscriptions FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.10 payments ─────────────────────────────────────────────────────────────
CREATE POLICY "payments_select"
    ON payments FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "payments_insert"
    ON payments FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.11 tools ────────────────────────────────────────────────────────────────
-- Políticas correctas (las de complete_rls_policies.sql referenciaban
-- columnas inexistentes is_published y created_by; el fix viene de
-- 20260301_tools_resources.sql que usa instructor_id)
CREATE POLICY "tools_select"
    ON tools FOR SELECT
    USING (true);

CREATE POLICY "tools_all_instructor"
    ON tools FOR ALL
    USING (instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.12 consultations ────────────────────────────────────────────────────────
CREATE POLICY "consultations_select_student"
    ON consultations FOR SELECT
    USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "consultations_select_instructor"
    ON consultations FOR SELECT
    USING (instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "consultations_insert"
    ON consultations FOR INSERT
    WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.13 chat_messages ────────────────────────────────────────────────────────
CREATE POLICY "chat_messages_select"
    ON chat_messages FOR SELECT
    USING (
        consultation_id IN (
            SELECT id FROM consultations
            WHERE student_id    IN (SELECT id FROM profiles WHERE user_id = auth.uid())
               OR instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "chat_messages_insert"
    ON chat_messages FOR INSERT
    WITH CHECK (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.14 forum_threads ────────────────────────────────────────────────────────
CREATE POLICY "forum_threads_select"
    ON forum_threads FOR SELECT USING (true);

-- Nota: la política original en complete_rls_policies.sql usaba author_id
-- (que no existe en la tabla); la columna correcta es user_id.
CREATE POLICY "forum_threads_insert"
    ON forum_threads FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.15 forum_replies ────────────────────────────────────────────────────────
CREATE POLICY "forum_replies_select"
    ON forum_replies FOR SELECT USING (true);

CREATE POLICY "forum_replies_insert"
    ON forum_replies FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.16 quizzes ──────────────────────────────────────────────────────────────
-- Acceso abierto a usuarios autenticados (los datos sensibles [correct_answer]
-- solo se devuelven al corregir el intento, vía admin client en el servidor)
CREATE POLICY "quizzes_select"
    ON quizzes FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ── 4.17 quiz_questions ───────────────────────────────────────────────────────
CREATE POLICY "quiz_questions_select"
    ON quiz_questions FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ── 4.18 quiz_attempts ────────────────────────────────────────────────────────
CREATE POLICY "quiz_attempts_select"
    ON quiz_attempts FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "quiz_attempts_insert"
    ON quiz_attempts FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.19 direct_messages ─────────────────────────────────────────────────────
CREATE POLICY "direct_messages_select"
    ON direct_messages FOR SELECT
    USING (
        sender_id   IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "direct_messages_insert"
    ON direct_messages FOR INSERT
    WITH CHECK (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "direct_messages_update"
    ON direct_messages FOR UPDATE
    USING (receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 4.20 contact_messages ─────────────────────────────────────────────────────
-- Solo permite INSERT público (sin autenticación); no se puede leer/modificar
-- excepto desde el panel de admin usando el service role key.
CREATE POLICY "contact_messages_insert"
    ON contact_messages FOR INSERT
    TO public
    WITH CHECK (true);

-- ── 4.21 certificates ─────────────────────────────────────────────────────────
CREATE POLICY "certificates_select"
    ON certificates FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
-- INSERT solo vía admin client (service role); no se expone política de INSERT.

-- ── 4.22 tool_resources ───────────────────────────────────────────────────────
CREATE POLICY "tool_resources_select"
    ON tool_resources FOR SELECT
    USING (
        is_published = true
        OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "tool_resources_all_instructor"
    ON tool_resources FOR ALL
    USING (
        created_by IN (
            SELECT id FROM profiles
            WHERE user_id = auth.uid() AND role IN ('instructor', 'admin')
        )
    );

-- ── 4.23 lesson_comments ──────────────────────────────────────────────────────
CREATE POLICY "lesson_comments_select"
    ON lesson_comments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "lesson_comments_insert"
    ON lesson_comments FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "lesson_comments_delete"
    ON lesson_comments FOR DELETE
    USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── 5. TABLAS ADICIONALES (migraciones post 2026-03-01) ───────────────────────

-- 5.1 notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT,
  type       TEXT        NOT NULL DEFAULT 'info',
  -- Tipos: 'certificate' | 'quiz_passed' | 'quiz_failed' | 'info'
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select"
  ON notifications FOR SELECT
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "notifications_update"
  ON notifications FOR UPDATE
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
-- INSERT solo vía admin client (service role)

-- 5.2 sessions (nivel entre chapters y lessons)
CREATE TABLE IF NOT EXISTS sessions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid        NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  type       text        NOT NULL DEFAULT 'session' CHECK (type IN ('session', 'taller')),
  video_url  text,
  "order"    integer     NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_public_read" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "sessions_admin_all" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- FK de lessons → sessions
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_chapter_id  ON sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_order       ON sessions("order");
CREATE INDEX IF NOT EXISTS idx_lessons_session_id   ON lessons(session_id);

-- 5.3 lesson_faqs
CREATE TABLE IF NOT EXISTS lesson_faqs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  uuid        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question   text        NOT NULL,
  video_url  text,
  "order"    integer     NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_faqs_public_read" ON lesson_faqs
  FOR SELECT USING (true);

CREATE POLICY "lesson_faqs_admin_all" ON lesson_faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_lesson_faqs_lesson_id ON lesson_faqs(lesson_id);

-- 5.4 testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_title TEXT        NOT NULL,
  author_name  TEXT        NOT NULL,
  author_role  TEXT        DEFAULT '',
  content      TEXT        NOT NULL,
  rating       INTEGER     DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_approved  BOOLEAN     DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_approved"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "testimonials_select_own"
  ON testimonials FOR SELECT
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "testimonials_insert_own"
  ON testimonials FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "testimonials_update_own"
  ON testimonials FOR UPDATE
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 5.5 course_exceptions
CREATE TABLE IF NOT EXISTS course_exceptions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auth_user_id UUID,        -- auth.users.id — check directo sin join
  course_slug  TEXT        NOT NULL,
  user_email   TEXT,        -- denormalizado para mostrar en admin
  note         TEXT,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_slug)
);

-- Solo service_role puede operar esta tabla
ALTER TABLE course_exceptions ENABLE ROW LEVEL SECURITY;

-- 5.6 advisory_videos
CREATE TABLE IF NOT EXISTS advisory_videos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  duration     text,
  video_url    text        NOT NULL,
  "order"      integer     NOT NULL DEFAULT 0,
  is_published boolean     NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE advisory_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisory_videos_public_read" ON advisory_videos
  FOR SELECT USING (is_published = true);

CREATE POLICY "advisory_videos_admin_all" ON advisory_videos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE INDEX IF NOT EXISTS idx_advisory_videos_order ON advisory_videos("order");


-- Agrega presentation_url a la tabla modules (por módulo, no por curso)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS presentation_url TEXT DEFAULT NULL;

COMMENT ON COLUMN modules.presentation_url IS 'URL del archivo de presentación descargable del módulo (PDF, PPTX, etc.)';


-- =============================================================================
-- FIN DEL ESQUEMA
-- Tablas creadas: 29
-- Políticas RLS: 57
-- Triggers: 4
-- Índices: ~35
-- Última actualización: 2026-03-16
-- =============================================================================

