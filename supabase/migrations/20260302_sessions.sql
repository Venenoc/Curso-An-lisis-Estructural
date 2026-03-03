-- ============================================================
-- Sessions: new level between chapters and lessons
-- Módulo → Capítulo → Sesión → Lección
-- ============================================================

-- 1. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id  uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title       text NOT NULL,
  type        text NOT NULL DEFAULT 'session' CHECK (type IN ('session', 'taller')),
  video_url   text,
  "order"     integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- 2. Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_public_read" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "sessions_admin_all" ON sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Add session_id FK to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE SET NULL;

-- 4. Migrate existing data: create 1 default "Sesión 1" per chapter
INSERT INTO sessions (id, chapter_id, title, type, "order")
SELECT
  gen_random_uuid(),
  id,
  'Sesión 1',
  'session',
  0
FROM chapters
WHERE id NOT IN (SELECT DISTINCT chapter_id FROM sessions);

-- 5. Assign all existing lessons (without session_id) to their chapter's default session
UPDATE lessons l
SET session_id = s.id
FROM sessions s
WHERE s.chapter_id = l.chapter_uuid
  AND l.session_id IS NULL;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_chapter_id ON sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_order ON sessions("order");
CREATE INDEX IF NOT EXISTS idx_lessons_session_id ON lessons(session_id);
