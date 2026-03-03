-- Tabla de Preguntas Frecuentes por lección
CREATE TABLE IF NOT EXISTS lesson_faqs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id  uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question   text NOT NULL,
  video_url  text,
  "order"    integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_faqs ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer
CREATE POLICY "lesson_faqs_public_read" ON lesson_faqs
  FOR SELECT USING (true);

-- Solo admins pueden escribir
CREATE POLICY "lesson_faqs_admin_all" ON lesson_faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_lesson_faqs_lesson_id ON lesson_faqs(lesson_id);
