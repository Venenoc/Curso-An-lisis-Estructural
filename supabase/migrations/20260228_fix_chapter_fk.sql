-- ── Fix lessons.chapter_uuid FK ───────────────────────────────────────────────
-- The previous migration (20260228_modules_chapters.sql) tried to add
-- `chapter_id UUID REFERENCES chapters(id)` but extend_catalog_schema.sql had
-- already added `chapter_id INTEGER` for catalog use.
-- The IF NOT EXISTS clause skipped the UUID column entirely.
-- We add a new column `chapter_uuid` to hold the FK to the chapters table.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter_uuid UUID REFERENCES chapters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_uuid ON lessons(chapter_uuid);

-- ── presentation_video_url for courses ────────────────────────────────────────
-- URL del video de presentación del curso (trailer / intro)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS presentation_video_url TEXT;

-- ── presentation_video_url for modules ────────────────────────────────────────
-- URL del video de presentación del módulo (intro breve al módulo)
ALTER TABLE modules ADD COLUMN IF NOT EXISTS presentation_video_url TEXT;
