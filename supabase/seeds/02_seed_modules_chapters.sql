-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED: Módulos y Capítulos — Curso 1: Fundamentos de Análisis Estructural
-- ═══════════════════════════════════════════════════════════════════════════════
-- REQUISITOS PREVIOS:
--   1. Migración 20260228_modules_chapters.sql ejecutada (crea tablas modules y chapters)
--   2. Migración 20260228_fix_chapter_fk.sql ejecutada (añade chapter_uuid a lessons)
--   3. Seed 01_seed_catalog.sql ejecutado (cursos y lecciones del catálogo)
--
-- IDEMPOTENTE: elimina y recrea módulos/capítulos del curso 1 en cada ejecución.
--              Actualiza chapter_uuid en lessons para apuntar a los UUIDs correctos.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course1_id UUID;

  -- Módulos
  v_mod1_id UUID; v_mod2_id UUID; v_mod3_id UUID; v_mod4_id UUID;

  -- Capítulos Módulo 1
  v_ch11_id UUID; v_ch12_id UUID; v_ch13_id UUID;
  -- Capítulos Módulo 2
  v_ch21_id UUID; v_ch22_id UUID;
  -- Capítulos Módulo 3
  v_ch31_id UUID; v_ch32_id UUID;
  -- Capítulos Módulo 4
  v_ch41_id UUID; v_ch42_id UUID;

BEGIN

  -- ── 1. Obtener el curso 1 ────────────────────────────────────────────────────
  SELECT id INTO v_course1_id
  FROM courses
  WHERE slug = 'fundamentos-analisis-estructural';

  IF v_course1_id IS NULL THEN
    RAISE EXCEPTION
      'Curso "fundamentos-analisis-estructural" no encontrado. '
      'Ejecuta primero el seed 01_seed_catalog.sql.';
  END IF;

  RAISE NOTICE 'Curso 1 id: %', v_course1_id;

  -- ── 2. Limpiar módulos y capítulos anteriores del curso 1 ────────────────────
  -- Las lecciones no se eliminan; solo se desvincula chapter_uuid (CASCADE NULL)
  DELETE FROM modules WHERE course_id = v_course1_id;
  RAISE NOTICE 'Módulos anteriores eliminados.';

  -- ════════════════════════════════════════════════════════════════════════════
  -- 3. MÓDULO 1: Introducción al Análisis Estructural
  -- ════════════════════════════════════════════════════════════════════════════
  INSERT INTO modules (course_id, title, "order")
  VALUES (v_course1_id, 'Introducción al Análisis Estructural', 0)
  RETURNING id INTO v_mod1_id;
  RAISE NOTICE 'Módulo 1 id: %', v_mod1_id;

  -- Capítulo I
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod1_id, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', 0)
  RETURNING id INTO v_ch11_id;

  -- Capítulo II
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod1_id, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', 1)
  RETURNING id INTO v_ch12_id;

  -- Capítulo III
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod1_id, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', 2)
  RETURNING id INTO v_ch13_id;

  -- ════════════════════════════════════════════════════════════════════════════
  -- 4. MÓDULO 2: Vigas Doblemente Reforzadas: Diseño y Análisis
  -- ════════════════════════════════════════════════════════════════════════════
  INSERT INTO modules (course_id, title, "order")
  VALUES (v_course1_id, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 1)
  RETURNING id INTO v_mod2_id;
  RAISE NOTICE 'Módulo 2 id: %', v_mod2_id;

  -- Capítulo IV
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod2_id, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', 0)
  RETURNING id INTO v_ch21_id;

  -- Capítulo V
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod2_id, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', 1)
  RETURNING id INTO v_ch22_id;

  -- ════════════════════════════════════════════════════════════════════════════
  -- 5. MÓDULO 3: Vigas T & L: Diseño y Análisis
  -- ════════════════════════════════════════════════════════════════════════════
  INSERT INTO modules (course_id, title, "order")
  VALUES (v_course1_id, 'Vigas T & L: Diseño y Análisis', 2)
  RETURNING id INTO v_mod3_id;
  RAISE NOTICE 'Módulo 3 id: %', v_mod3_id;

  -- Capítulo VI
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod3_id, 'Capítulo VI: Diseño a Flexión en Vigas T & L', 0)
  RETURNING id INTO v_ch31_id;

  -- Capítulo VII
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod3_id, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', 1)
  RETURNING id INTO v_ch32_id;

  -- ════════════════════════════════════════════════════════════════════════════
  -- 6. MÓDULO 4: Comportamiento y Diseño a Cortante y Torsión
  -- ════════════════════════════════════════════════════════════════════════════
  INSERT INTO modules (course_id, title, "order")
  VALUES (v_course1_id, 'Comportamiento y Diseño a Cortante y Torsión', 3)
  RETURNING id INTO v_mod4_id;
  RAISE NOTICE 'Módulo 4 id: %', v_mod4_id;

  -- Capítulo VIII
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod4_id, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', 0)
  RETURNING id INTO v_ch41_id;

  -- Capítulo IX
  INSERT INTO chapters (module_id, title, "order")
  VALUES (v_mod4_id, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', 1)
  RETURNING id INTO v_ch42_id;

  -- ════════════════════════════════════════════════════════════════════════════
  -- 7. VINCULAR LECCIONES → chapter_uuid usando catalog_chapter_id (INTEGER)
  --    catalog_chapter_id 11 → Capítulo I   (v_ch11_id)
  --    catalog_chapter_id 12 → Capítulo II  (v_ch12_id)
  --    catalog_chapter_id 13 → Capítulo III (v_ch13_id)
  --    catalog_chapter_id 21 → Capítulo IV  (v_ch21_id)
  --    catalog_chapter_id 22 → Capítulo V   (v_ch22_id)
  --    catalog_chapter_id 31 → Capítulo VI  (v_ch31_id)
  --    catalog_chapter_id 32 → Capítulo VII (v_ch32_id)
  --    catalog_chapter_id 41 → Capítulo VIII(v_ch41_id)
  --    catalog_chapter_id 42 → Capítulo IX  (v_ch42_id)
  -- ════════════════════════════════════════════════════════════════════════════
  UPDATE lessons SET chapter_uuid = v_ch11_id WHERE course_id = v_course1_id AND chapter_id = 11;
  UPDATE lessons SET chapter_uuid = v_ch12_id WHERE course_id = v_course1_id AND chapter_id = 12;
  UPDATE lessons SET chapter_uuid = v_ch13_id WHERE course_id = v_course1_id AND chapter_id = 13;
  UPDATE lessons SET chapter_uuid = v_ch21_id WHERE course_id = v_course1_id AND chapter_id = 21;
  UPDATE lessons SET chapter_uuid = v_ch22_id WHERE course_id = v_course1_id AND chapter_id = 22;
  UPDATE lessons SET chapter_uuid = v_ch31_id WHERE course_id = v_course1_id AND chapter_id = 31;
  UPDATE lessons SET chapter_uuid = v_ch32_id WHERE course_id = v_course1_id AND chapter_id = 32;
  UPDATE lessons SET chapter_uuid = v_ch41_id WHERE course_id = v_course1_id AND chapter_id = 41;
  UPDATE lessons SET chapter_uuid = v_ch42_id WHERE course_id = v_course1_id AND chapter_id = 42;

  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'SEED 02 COMPLETADO:';
  RAISE NOTICE '  Módulos creados: 4';
  RAISE NOTICE '  Capítulos creados: 9';
  RAISE NOTICE '  Lecciones vinculadas a chapter_uuid';
  RAISE NOTICE '═══════════════════════════════════════════════';

END $$;
