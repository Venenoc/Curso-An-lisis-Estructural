-- Tabla de comentarios por lección
CREATE TABLE IF NOT EXISTS lesson_comments (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id   UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id, created_at DESC);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer comentarios
CREATE POLICY "lesson_comments_select"
  ON lesson_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede crear comentarios
CREATE POLICY "lesson_comments_insert"
  ON lesson_comments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Solo el autor puede eliminar su propio comentario
CREATE POLICY "lesson_comments_delete"
  ON lesson_comments FOR DELETE
  USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
