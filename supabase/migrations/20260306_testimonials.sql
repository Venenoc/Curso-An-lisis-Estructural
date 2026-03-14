-- Tabla de testimonios de cursos
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  course_title TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  author_role  TEXT DEFAULT '',
  content      TEXT NOT NULL,
  rating       INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_approved  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer los testimonios aprobados
CREATE POLICY "testimonials_select_approved"
  ON testimonials FOR SELECT
  USING (is_approved = true);

-- El propio usuario puede leer sus testimonios (aprobados o no)
CREATE POLICY "testimonials_select_own"
  ON testimonials FOR SELECT
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- El propio usuario puede insertar/actualizar su testimonio
CREATE POLICY "testimonials_insert_own"
  ON testimonials FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "testimonials_update_own"
  ON testimonials FOR UPDATE
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
