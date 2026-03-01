-- Add image URL column to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── Modules table (max 4 per course) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  "order"      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS modules_course_id_idx ON modules (course_id);
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select"
  ON modules FOR SELECT USING (true);

CREATE POLICY "modules_insert"
  ON modules FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN profiles p ON p.id = c.instructor_id
      WHERE c.id = modules.course_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "modules_update"
  ON modules FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN profiles p ON p.id = c.instructor_id
      WHERE c.id = modules.course_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "modules_delete"
  ON modules FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN profiles p ON p.id = c.instructor_id
      WHERE c.id = modules.course_id AND p.user_id = auth.uid()
    )
  );

-- ── Chapters table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id  UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  "order"    INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chapters_module_id_idx ON chapters (module_id);
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chapters_select"
  ON chapters FOR SELECT USING (true);

CREATE POLICY "chapters_insert"
  ON chapters FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      JOIN profiles p ON p.id = c.instructor_id
      WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "chapters_update"
  ON chapters FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      JOIN profiles p ON p.id = c.instructor_id
      WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "chapters_delete"
  ON chapters FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      JOIN profiles p ON p.id = c.instructor_id
      WHERE m.id = chapters.module_id AND p.user_id = auth.uid()
    )
  );

-- ── Add chapter_id to lessons (optional FK for hierarchical structure) ───────
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;
