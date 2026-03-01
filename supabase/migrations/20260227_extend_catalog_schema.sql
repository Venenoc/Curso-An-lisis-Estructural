-- Migration: Extend courses and lessons tables to store catalog metadata
-- Run this BEFORE the seed file (01_seed_catalog.sql)

-- ── COURSES: add catalog metadata columns ──────────────────────────────────────
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug            TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level           TEXT;       -- 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles'
ALTER TABLE courses ADD COLUMN IF NOT EXISTS gradient        TEXT;       -- Tailwind CSS gradient string
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_duration  TEXT;       -- Human-readable e.g. "4 horas"

-- Unique index so lookups by slug are fast and safe
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- ── LESSONS: add catalog hierarchy metadata columns ────────────────────────────
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS catalog_id     INTEGER;    -- Numeric ID from static catalog (111, 112, 211 ...)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id      INTEGER;    -- Module number (1, 2, 3, 4)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_title   TEXT;       -- Name of the module
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter_id     INTEGER;    -- Chapter number (11, 12, 21, 31 ...)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter_title  TEXT;       -- Name of the chapter
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_text  TEXT;       -- Human-readable e.g. "22 min"

-- Index for fast lesson lookup by catalog_id within a course
CREATE INDEX IF NOT EXISTS idx_lessons_catalog ON lessons(course_id, catalog_id);
