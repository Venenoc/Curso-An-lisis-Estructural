-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED: Catálogo de Cursos de Análisis Estructural
-- ═══════════════════════════════════════════════════════════════════════════════
-- REQUISITOS PREVIOS:
--   1. Ejecutar migración: 20260227_extend_catalog_schema.sql
--   2. Tener al menos un perfil con role = 'instructor' o 'admin' en la tabla profiles
--
-- CÓMO EJECUTAR:
--   Pega este SQL en el SQL Editor de Supabase Dashboard y ejecuta.
--
-- IDEMPOTENTE: Usa ON CONFLICT DO UPDATE, seguro de ejecutar más de una vez.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_instructor_id  UUID;
  v_course1_id     UUID;
  v_course2_id     UUID;
  v_course3_id     UUID;
  v_course4_id     UUID;
  v_course5_id     UUID;
  v_course6_id     UUID;
  v_course7_id     UUID;
  v_course8_id     UUID;
  v_video          TEXT := 'https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4';
BEGIN

  -- ── 1. Obtener instructor ────────────────────────────────────────────────────
  SELECT id INTO v_instructor_id
  FROM profiles
  WHERE role IN ('instructor', 'admin')
  ORDER BY created_at
  LIMIT 1;

  IF v_instructor_id IS NULL THEN
    RAISE EXCEPTION
      'No se encontró un perfil con rol instructor o admin. '
      'Crea una cuenta y asigna el rol antes de correr este seed.';
  END IF;

  RAISE NOTICE 'Usando instructor_id: %', v_instructor_id;

  -- ════════════════════════════════════════════════════════════════════════════
  -- 2. INSERTAR / ACTUALIZAR LOS 8 CURSOS
  -- ════════════════════════════════════════════════════════════════════════════

  -- Curso 1: Vigas
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'fundamentos-analisis-estructural',
    'Conceptos Fundamentales en el Comportamiento y Diseño de Vigas',
    'Aprende los conceptos base del análisis estructural: equilibrio, diagramas de cuerpo libre, reacciones en apoyos y análisis de vigas y marcos isostáticos.',
    29.99,
    'from-cyan-500 to-blue-600',
    'Principiante',
    '4 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title          = EXCLUDED.title,
    description    = EXCLUDED.description,
    price          = EXCLUDED.price,
    gradient       = EXCLUDED.gradient,
    level          = EXCLUDED.level,
    total_duration = EXCLUDED.total_duration,
    status         = EXCLUDED.status
  RETURNING id INTO v_course1_id;

  -- Si ya existía, recuperar el id
  IF v_course1_id IS NULL THEN
    SELECT id INTO v_course1_id FROM courses WHERE slug = 'fundamentos-analisis-estructural';
  END IF;
  RAISE NOTICE 'Curso 1 id: %', v_course1_id;

  -- Curso 2: Rigidez Matricial
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'rigidez-matricial',
    'Método de Rigidez Matricial',
    'Domina el método de rigidez para resolver estructuras hiperestáticas. Matrices de rigidez local, ensamblaje global y resolución de sistemas.',
    39.99,
    'from-purple-500 to-pink-600',
    'Intermedio',
    '18 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course2_id;
  IF v_course2_id IS NULL THEN
    SELECT id INTO v_course2_id FROM courses WHERE slug = 'rigidez-matricial';
  END IF;

  -- Curso 3: Análisis Dinámico
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'analisis-dinamico',
    'Análisis Dinámico de Estructuras',
    'Estudio de vibraciones, respuesta dinámica, análisis modal y espectros de respuesta aplicados a edificaciones y estructuras civiles.',
    49.99,
    'from-orange-500 to-red-600',
    'Avanzado',
    '20 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course3_id;
  IF v_course3_id IS NULL THEN
    SELECT id INTO v_course3_id FROM courses WHERE slug = 'analisis-dinamico';
  END IF;

  -- Curso 4: Diseño Sísmico
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'diseno-sismico',
    'Diseño Sísmico y Normativa',
    'Aprende a diseñar estructuras sismorresistentes siguiendo las normativas vigentes. Espectros de diseño, ductilidad y detallado sísmico.',
    44.99,
    'from-green-500 to-emerald-600',
    'Intermedio',
    '16 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course4_id;
  IF v_course4_id IS NULL THEN
    SELECT id INTO v_course4_id FROM courses WHERE slug = 'diseno-sismico';
  END IF;

  -- Curso 5: FEM
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'elementos-finitos',
    'Método de Elementos Finitos (FEM)',
    'Introducción al FEM aplicado a estructuras. Formulación de elementos, mallado, condiciones de frontera y análisis de resultados.',
    59.99,
    'from-blue-500 to-indigo-600',
    'Avanzado',
    '25 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course5_id;
  IF v_course5_id IS NULL THEN
    SELECT id INTO v_course5_id FROM courses WHERE slug = 'elementos-finitos';
  END IF;

  -- Curso 6: Puentes
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'analisis-puentes',
    'Análisis de Puentes y Estructuras Especiales',
    'Metodologías de análisis para puentes vehiculares, peatonales y estructuras especiales. Cargas móviles, líneas de influencia y diseño.',
    54.99,
    'from-amber-500 to-orange-600',
    'Avanzado',
    '15 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course6_id;
  IF v_course6_id IS NULL THEN
    SELECT id INTO v_course6_id FROM courses WHERE slug = 'analisis-puentes';
  END IF;

  -- Curso 7: Patología
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'patologia-rehabilitacion',
    'Patología y Rehabilitación Estructural',
    'Diagnóstico de daños estructurales, evaluación de capacidad residual, técnicas de reforzamiento y rehabilitación de estructuras existentes.',
    34.99,
    'from-teal-500 to-cyan-600',
    'Intermedio',
    '14 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course7_id;
  IF v_course7_id IS NULL THEN
    SELECT id INTO v_course7_id FROM courses WHERE slug = 'patologia-rehabilitacion';
  END IF;

  -- Curso 8: SAP2000 / ETABS
  INSERT INTO courses
    (slug, title, description, price, gradient, level, total_duration, instructor_id, status)
  VALUES (
    'modelado-sap2000-etabs',
    'Modelado con SAP2000 y ETABS',
    'Aprende a modelar, analizar e interpretar resultados en SAP2000 y ETABS. Desde estructuras simples hasta edificios complejos paso a paso.',
    64.99,
    'from-violet-500 to-purple-600',
    'Todos los niveles',
    '30 horas',
    v_instructor_id,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    price = EXCLUDED.price, gradient = EXCLUDED.gradient,
    level = EXCLUDED.level, total_duration = EXCLUDED.total_duration
  RETURNING id INTO v_course8_id;
  IF v_course8_id IS NULL THEN
    SELECT id INTO v_course8_id FROM courses WHERE slug = 'modelado-sap2000-etabs';
  END IF;

  RAISE NOTICE 'Cursos insertados/actualizados: 8';

  -- ════════════════════════════════════════════════════════════════════════════
  -- 3. INSERTAR LECCIONES DEL CURSO 1 (69 lecciones, 4 módulos, 8 capítulos)
  --    Se eliminan primero para re-insertar limpio si ya existen
  -- ════════════════════════════════════════════════════════════════════════════
  DELETE FROM lessons WHERE course_id = v_course1_id;

  -- ─────────────────────────────────────────────────────────────────────────
  -- MÓDULO 1: Introducción al Análisis Estructural
  -- ─────────────────────────────────────────────────────────────────────────

  -- Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, '¿Qué es la Demanda en el Diseño?',                                                  v_video, 1320, 1,  111, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '22 min'),
    (v_course1_id, 'Combinaciones para el Diseño: ACI 318 – 2019 & NTP E060',                           NULL,   1380, 2,  112, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '23 min'),
    (v_course1_id, '¿Qué es la Capacidad en el Diseño?',                                                v_video, 1320, 3,  113, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '22 min'),
    (v_course1_id, 'Estudio del Comportamiento del Concreto',                                           NULL,   1380, 4,  114, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '23 min'),
    (v_course1_id, 'Relación Esfuerzo – Deformación: Modelo de Hognestad',                             v_video, 1320, 5,  115, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '22 min'),
    (v_course1_id, 'Estudio del Comportamiento del Acero de Refuerzo',                                  NULL,   1380, 6,  116, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '23 min'),
    (v_course1_id, 'Relación Esfuerzo – Deformación: Modelo Elastoplástico',                           v_video, 1320, 7,  117, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '22 min'),
    (v_course1_id, '¿Relación: Demanda/Capacidad?',                                                     NULL,   1380, 8,  118, 1, 'Introducción al Análisis Estructural', 11, 'Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad', '23 min');

  -- Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060',                              v_video, 1320, 9,  121, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Introducción al Diseño a Flexión ACI 318 – 2019 & NTP E060',                       NULL,   1380, 10, 122, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '23 min'),
    (v_course1_id, 'Estudio de las Secciones Controladas a: Compresión & Tracción & Transición',       v_video, 1320, 11, 123, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, '¿Sección Sub – Reforzada vs Sección Sobre – Reforzada?',                           NULL,   1380, 12, 124, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '23 min'),
    (v_course1_id, 'Estudio de la Cuantía Balanceada & Mínima & Máxima',                               v_video, 1320, 13, 125, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime',                  NULL,   1380, 14, 126, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '23 min'),
    (v_course1_id, 'Ejemplo I: Diseño de una Viga Simplemente Reforzada – MathCad Prime & Etabs',      v_video, 1320, 15, 127, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Ejemplo II: Verificación a Flexión en una Viga Simplemente Reforzada – MathCad Prime', NULL, 1380, 16, 128, 1, 'Introducción al Análisis Estructural', 12, 'Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas', '23 min');

  -- Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Estudio del Diagrama Momento Curvatura – Acero en Tracción',                       v_video, 1320, 17, 131, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Estado Elástico No Agrietado (EENA)',                                               NULL,   1380, 18, 132, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '23 min'),
    (v_course1_id, 'Estado Elástico Agrietado (EEA)',                                                   v_video, 1320, 19, 133, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Estado de Fluencia',                                                                NULL,   1380, 20, 134, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '23 min'),
    (v_course1_id, 'Estado de Rotura o Último (EU)',                                                    v_video, 1320, 21, 135, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '22 min'),
    (v_course1_id, 'Cálculos en MathCad Prime',                                                        NULL,   1380, 22, 136, 1, 'Introducción al Análisis Estructural', 13, 'Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas', '23 min');

  -- ─────────────────────────────────────────────────────────────────────────
  -- MÓDULO 2: Vigas Doblemente Reforzadas: Diseño y Análisis
  -- ─────────────────────────────────────────────────────────────────────────

  -- Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060',                              NULL, 1680, 23, 211, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '28 min'),
    (v_course1_id, '¿Qué es una Viga Doblemente Reforzada?',                                           NULL, 1560, 24, 212, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, '¿Cuándo usar una Viga Doblemente Reforzada en el Diseño?',                        NULL, 1680, 25, 213, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '28 min'),
    (v_course1_id, 'Introducción al Diseño a Flexión: ACI 318 – 2019 & NTP E060',                     NULL, 1560, 26, 214, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Cuantía Balanceada & Mínima & Máxima',                                             NULL, 1680, 27, 215, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '28 min'),
    (v_course1_id, 'Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime',                  NULL, 1560, 28, 216, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Ejemplo I: Diseño de una Viga Doblemente Reforzada – MathCad Prime & Etabs',       NULL, 1680, 29, 217, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '28 min'),
    (v_course1_id, 'Ejemplo II: Verificación a Flexión en una Viga Doblemente Reforzada – MathCad Prime', NULL, 1560, 30, 218, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 21, 'Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas', '26 min');

  -- Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Estudio del Diagrama Momento Curvatura - Acero en Tracción & Acero en Compresión', NULL, 1560, 31, 221, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Estado Elástico No Agrietado (EENA)',                                               NULL, 1560, 32, 222, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Estado Elástico Agrietado (EEA)',                                                   NULL, 1560, 33, 223, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Estado de Fluencia',                                                                NULL, 1560, 34, 224, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Estado de Rotura o Último (EU)',                                                    NULL, 1560, 35, 225, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Cálculos en MathCad Prime',                                                        NULL, 1560, 36, 226, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min'),
    (v_course1_id, 'Variación de la Ductilidad en Viga Doblemente Reforzada',                          NULL, 1560, 37, 227, 2, 'Vigas Doblemente Reforzadas: Diseño y Análisis', 22, 'Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas', '26 min');

  -- ─────────────────────────────────────────────────────────────────────────
  -- MÓDULO 3: Vigas T & L: Diseño y Análisis
  -- ─────────────────────────────────────────────────────────────────────────

  -- Capítulo VI: Diseño a Flexión en Vigas T & L
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060',                              NULL, 2100, 38, 311, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Introducción al Diseño a Flexión: ACI 318 – 2019 & NTP E060',                     NULL, 2100, 39, 312, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Disposiciones Generales de la Sección para el Diseño',                             NULL, 2100, 40, 313, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Cuantía Balanceada & Mínima & Máxima',                                             NULL, 2100, 41, 314, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime',                  NULL, 2100, 42, 315, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Ejemplo I: Diseño de una Viga T Simplemente Reforzada – MathCad Prime & Etabs',    NULL, 2100, 43, 316, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Ejemplo II: Verificación a Flexión de una Viga T Simplemente Reforzada – MathCad Prime & Etabs', NULL, 2100, 44, 317, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, '¿Es posible una Viga T Doblemente Reforzada?',                                     NULL, 2100, 45, 318, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Ejemplo III: Diseño de una Viga T Doblemente Reforzada – MathCad Prime & Etabs',   NULL, 2100, 46, 319, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min'),
    (v_course1_id, 'Ejemplo IV: Verificación a Flexión de una Viga Doblemente Reforzada – MathCad Prime & Etabs', NULL, 2100, 47, 320, 3, 'Vigas T & L: Diseño y Análisis', 31, 'Capítulo VI: Diseño a Flexión en Vigas T & L', '35 min');

  -- Capítulo VII: Estudio del Comportamiento en Vigas T & L
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Estudio del Diagrama Momento Curvatura',                                           NULL, 2100, 48, 321, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Estado Elástico No Agrietado (EENA)',                                               NULL, 2100, 49, 322, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Estado Elástico Agrietado (EEA)',                                                   NULL, 2100, 50, 323, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Estado de Fluencia',                                                                NULL, 2100, 51, 324, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Estado de Rotura o Último (EU)',                                                    NULL, 2100, 52, 325, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Cálculos en MathCad Prime',                                                        NULL, 2100, 53, 326, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min'),
    (v_course1_id, 'Variación de la Ductilidad en Vigas T',                                            NULL, 2100, 54, 327, 3, 'Vigas T & L: Diseño y Análisis', 32, 'Capítulo VII: Estudio del Comportamiento en Vigas T & L', '35 min');

  -- ─────────────────────────────────────────────────────────────────────────
  -- MÓDULO 4: Comportamiento y Diseño a Cortante y Torsión
  -- ─────────────────────────────────────────────────────────────────────────

  -- Capítulo VIII: Comportamiento y Diseño a Cortante
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Introducción al Diseño a Cortante: ACI 318 – 2019 & NTP E060',                    NULL, 1800, 55, 411, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Estudio de la Resistencia a Cortante Proporcionado por el Concreto',               NULL, 1800, 56, 412, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Estudio de la Resistencia a Cortante Proporcionado por el Acero de Refuerzo',      NULL, 1800, 57, 413, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Límites para el Espaciamiento del Refuerzo a Cortante',                            NULL, 1800, 58, 414, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Diagrama de Flujo para el Diseño a Cortante – Programación en MathCad Prime',      NULL, 1800, 59, 415, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Diseño de una Viga a Cortante – MathCad Prime & Etabs',                           NULL, 1800, 60, 416, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Demanda/Capacidad a Corte',                                                        NULL, 1800, 61, 417, 4, 'Comportamiento y Diseño a Cortante y Torsión', 41, 'Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060', '30 min');

  -- Capítulo IX: Comportamiento y Diseño a Torsión
  INSERT INTO lessons
    (course_id, title, video_url, duration, "order", catalog_id, module_id, module_title, chapter_id, chapter_title, duration_text)
  VALUES
    (v_course1_id, 'Introducción al Diseño a Torsión: ACI 318 – 2019 & NTP E060',                     NULL, 1800, 62, 421, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, '¿Cuándo se debe Diseñar a Torsión?',                                               NULL, 1800, 63, 422, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Estudio de la Torsión Primaria & Torsión Secundaria',                              NULL, 1800, 64, 423, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Límites Máximos a Torsión: Umbral de Torsión & Torsión de Fisuración',            NULL, 1800, 65, 424, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Estudio de las Ecuaciones a Torsión: Resistencia – Casos – Momento',               NULL, 1800, 66, 425, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Diseño de una Viga a Torsión – MathCad Prime & Etabs',                            NULL, 1800, 67, 426, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, '¿Acero Longitudinal y Transversal a Torsión?',                                     NULL, 1800, 68, 427, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min'),
    (v_course1_id, 'Demanda/Capacidad a Torsión',                                                      NULL, 1800, 69, 428, 4, 'Comportamiento y Diseño a Cortante y Torsión', 42, 'Capítulo IX: Comportamiento y Diseño a Torsión – ACI 318 – 2019 & NTP E060', '30 min');

  RAISE NOTICE 'Lecciones insertadas para Curso 1: 69';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'SEED COMPLETADO:';
  RAISE NOTICE '  Cursos: 8 (todos publicados)';
  RAISE NOTICE '  Lecciones curso 1: 69 (4 módulos, 8 capítulos)';
  RAISE NOTICE '  Cursos 2-8: solo metadata (lecciones pendientes)';
  RAISE NOTICE '═══════════════════════════════════════════════';

END $$;
