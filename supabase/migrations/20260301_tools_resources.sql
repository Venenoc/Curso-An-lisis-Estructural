-- ── tool_resources: recursos descargables (Biblioteca Técnica + Recursos de Productividad) ──
CREATE TABLE IF NOT EXISTS tool_resources (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT        NOT NULL,
  description   TEXT,
  -- Biblioteca Técnica: 'norms_codes' | 'formula_sheets' | 'excel_templates' |
  --   'manuals_guides' | 'manuals_details' | 'column_details' |
  --   'structural_details' | 'example_models'
  -- Recursos Productividad: 'structural_checklist' | 'calculation_templates' |
  --   'report_templates' | 'budget_templates'
  category      TEXT        NOT NULL,
  file_url      TEXT,
  thumbnail_url TEXT,
  is_free       BOOLEAN     NOT NULL DEFAULT true,
  is_published  BOOLEAN     NOT NULL DEFAULT false,
  created_by    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_resources_category ON tool_resources(category);
CREATE INDEX IF NOT EXISTS idx_tool_resources_created_by ON tool_resources(created_by);

ALTER TABLE tool_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published resources viewable by authenticated"
  ON tool_resources FOR SELECT
  USING (
    is_published = true
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Instructors can manage resources"
  ON tool_resources FOR ALL
  USING (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- ── Corregir RLS rota de la tabla 'tools' (referencias columnas inexistentes) ──
DROP POLICY IF EXISTS "Published tools are viewable by everyone" ON tools;
DROP POLICY IF EXISTS "Instructors can create tools" ON tools;
DROP POLICY IF EXISTS "Creators can manage their tools" ON tools;

CREATE POLICY "Published tools viewable by everyone"
  ON tools FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage tools"
  ON tools FOR ALL
  USING (
    instructor_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
