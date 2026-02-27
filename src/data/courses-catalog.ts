export interface CourseLesson {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface CourseChapter {
  id: number;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessonsCount: number;
  duration: string;
  price: number;
  chapters?: CourseChapter[];
}

export interface CatalogCourse {
  slug: string;
  title: string;
  description: string;
  price: number;
  gradient: string;
  level: "Principiante" | "Intermedio" | "Avanzado" | "Todos los niveles";
  lessonsCount: number;
  duration: string;
  modules?: CourseModule[];
}

export const coursesCatalog: CatalogCourse[] = [
  {
    slug: "fundamentos-analisis-estructural",
    title: "Conceptos Fundamentales en el Comportamiento y Diseño de Vigas",
    description:
      "Aprende los conceptos base del análisis estructural: equilibrio, diagramas de cuerpo libre, reacciones en apoyos y análisis de vigas y marcos isostáticos.",
    price: 29.99,
    gradient: "from-cyan-500 to-blue-600",
    level: "Principiante",
    lessonsCount: 10,
    duration: "4 horas",
    modules: [
      {
        id: 1,
        title: "Introducción al Análisis Estructural",
        description: "Conceptos fundamentales, tipos de estructuras, clasificación de cargas y el rol del ingeniero estructural en proyectos civiles.",
        lessonsCount: 2,
        duration: "45 min",
        price: 7.50,
        chapters: [
          {
            id: 11,
            title: "Capítulo I: Fundamentos para el Diseño: Demanda vs Capacidad",
            lessons: [
              { id: 111, title: "¿Qué es la Demanda en el Diseño?", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 112, title: "Combinaciones para el Diseño: ACI 318 – 2019 & NTP E060", duration: "23 min", videoUrl: "" },
              { id: 113, title: "¿Qué es la Capacidad en el Diseño?", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 114, title: "Estudio del Comportamiento del Concreto", duration: "23 min", videoUrl: "" },
              { id: 115, title: "Relación Esfuerzo – Deformación: Modelo de Hognestad", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 116, title: "Estudio del Comportamiento del Acero de Refuerzo", duration: "23 min", videoUrl: "" },
              { id: 117, title: "Relación Esfuerzo – Deformación: Modelo Elastoplástico", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 118, title: "¿Relación: Demanda/Capacidad?", duration: "23 min", videoUrl: "" },
            ],
          },
          {
            id: 12,
            title: "Capítulo II: Diseño a Flexión en Vigas Simplemente Reforzadas",
            lessons: [
              { id: 121, title: "Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 122, title: "Introducción al Diseño a Flexión ACI 318 – 2019 & NTP E060", duration: "23 min", videoUrl: "" },
              { id: 123, title: "Estudio de las Secciones Controladas a: Compresión & Tracción & Transición", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 124, title: "¿Sección Sub – Reforzada vs Sección Sobre – Reforzada?", duration: "23 min", videoUrl: "" },
              { id: 125, title: "Estudio de la Cuantía Balanceada & Mínima & Máxima", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 126, title: "Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime", duration: "23 min", videoUrl: "" },
              { id: 127, title: "Ejemplo I: Diseño de una Viga Simplemente Reforzada – MathCad Prime & Etabs", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 128, title: "Ejemplo II: Verificación a Flexión en una Viga Simplemente Reforzada – MathCad Prime", duration: "23 min", videoUrl: "" },
            ],
          },
          {
            id: 13,
            title: "Capítulo III: Estudio del Comportamiento en Vigas Simplemente Reforzadas",
            lessons: [
              { id: 131, title: "Estudio del Diagrama Momento Curvatura – Acero en Tracción", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 132, title: "Estado Elástico No Agrietado (EENA)", duration: "23 min", videoUrl: "" },
              { id: 133, title: "Estado Elástico Agrietado (EEA)", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 134, title: "Estado de Fluencia", duration: "23 min", videoUrl: "" },
              { id: 135, title: "Estado de Rotura o Último (EU)", duration: "22 min", videoUrl: "https://res.cloudinary.com/dio3db11v/video/upload/v1771194576/Milky_Chance_-_Picnic_Concert_2020_in_Berlin_Germany_Full_Concert_online-video-cutter.com_vn4njl.mp4" },
              { id: 136, title: "Cálculos en MathCad Prime", duration: "23 min", videoUrl: "" },
            ],
          },
        ],
      },
      {
        id: 2,
        title: "Vigas Doblemente Reforzadas: Diseño y Análisis",
        description: "Repaso de estática: fuerzas, momentos, resultantes, condiciones de equilibrio y principio de superposición.",
        lessonsCount: 3,
        duration: "1h 20min",
        price: 7.50,
        chapters: [
          {
            id: 21,
            title: "Capítulo IV: Diseño a Flexión en Vigas Doblemente Reforzadas",
            lessons: [
              { id: 211, title: "Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060", duration: "28 min", videoUrl: "" },
              { id: 212, title: "¿Qué es una Viga Doblemente Reforzada?", duration: "26 min", videoUrl: "" },
              { id: 213, title: "¿Cuándo usar una Viga Doblemente Reforzada en el Diseño?", duration: "28 min", videoUrl: "" },
              { id: 214, title: "Introducción al Diseño a Flexión: ACI 318 – 2019 & NTP E060", duration: "26 min", videoUrl: "" },
              { id: 215, title: "Cuantía Balanceada & Mínima & Máxima", duration: "28 min", videoUrl: "" },
              { id: 216, title: "Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime", duration: "26 min", videoUrl: "" },
              { id: 217, title: "Ejemplo I: Diseño de una Viga Doblemente Reforzada – MathCad Prime & Etabs", duration: "28 min", videoUrl: "" },
              { id: 218, title: "Ejemplo II: Verificación a Flexión en una Viga Doblemente Reforzada – MathCad Prime", duration: "26 min", videoUrl: "" },
            ],
          },
          {
            id: 22,
            title: "Capítulo V: Estudio del Comportamiento en Vigas Doblemente Reforzadas",
            lessons: [
              { id: 221, title: "Estudio del Diagrama Momento Curvatura - Acero en Tracción & Acero en Compresión", duration: "26 min", videoUrl: "" },
              { id: 222, title: "Estado Elástico No Agrietado (EENA)", duration: "26 min", videoUrl: "" },
              { id: 223, title: "Estado Elástico Agrietado (EEA)", duration: "26 min", videoUrl: "" },
              { id: 224, title: "Estado de Fluencia", duration: "26 min", videoUrl: "" },
              { id: 225, title: "Estado de Rotura o Último (EU)", duration: "26 min", videoUrl: "" },
              { id: 226, title: "Cálculos en MathCad Prime", duration: "26 min", videoUrl: "" },
              { id: 227, title: "Variación de la Ductilidad en Viga Doblemente Reforzada", duration: "26 min", videoUrl: "" },
            ],
          },
        ],
      },
      {
        id: 3,
        title: "Vigas T & L: Diseño y Análisis",
        description: "Apoyos fijos, móviles, empotramientos y articulaciones. Cálculo de reacciones en estructuras isostáticas.",
        lessonsCount: 2,
        duration: "1h 10min",
        price: 7.50,
        chapters: [
          {
            id: 31,
            title: "Capítulo VI: Diseño a Flexión en Vigas T & L",
            lessons: [
              { id: 311, title: "Hipótesis para el Diseño: ACI 318 – 2019 & NTP E060", duration: "35 min", videoUrl: "" },
              { id: 312, title: "Introducción al Diseño a Flexión: ACI 318 – 2019 & NTP E060", duration: "35 min", videoUrl: "" },
              { id: 313, title: "Disposiciones Generales de la Sección para el Diseño", duration: "35 min", videoUrl: "" },
              { id: 314, title: "Cuantía Balanceada & Mínima & Máxima", duration: "35 min", videoUrl: "" },
              { id: 315, title: "Deducción de las Ecuaciones de Diseño a Flexión – MathCad Prime", duration: "35 min", videoUrl: "" },
              { id: 316, title: "Ejemplo I: Diseño de una Viga T Simplemente Reforzada – MathCad Prime & Etabs", duration: "35 min", videoUrl: "" },
              { id: 317, title: "Ejemplo II: Verificación a Flexión de una Viga T Simplemente Reforzada – MathCad Prime & Etabs", duration: "35 min", videoUrl: "" },
              { id: 318, title: "¿Es posible una Viga T Doblemente Reforzada?", duration: "35 min", videoUrl: "" },
              { id: 319, title: "Ejemplo III: Diseño de una Viga T Doblemente Reforzada – MathCad Prime & Etabs", duration: "35 min", videoUrl: "" },
              { id: 320, title: "Ejemplo IV: Verificación a Flexión de una Viga Doblemente Reforzada – MathCad Prime & Etabs", duration: "35 min", videoUrl: "" },
            ],
          },
          {
            id: 32,
            title: "Capítulo VII: Estudio del Comportamiento en Vigas T & L",
            lessons: [
              { id: 321, title: "Estudio del Diagrama Momento Curvatura", duration: "35 min", videoUrl: "" },
              { id: 322, title: "Estado Elástico No Agrietado (EENA)", duration: "35 min", videoUrl: "" },
              { id: 323, title: "Estado Elástico Agrietado (EEA)", duration: "35 min", videoUrl: "" },
              { id: 324, title: "Estado de Fluencia", duration: "35 min", videoUrl: "" },
              { id: 325, title: "Estado de Rotura o Último (EU)", duration: "35 min", videoUrl: "" },
              { id: 326, title: "Cálculos en MathCad Prime", duration: "35 min", videoUrl: "" },
              { id: 327, title: "Variación de la Ductilidad en Vigas T", duration: "35 min", videoUrl: "" },
            ],
          },
        ],
      },
      {
        id: 4,
        title: "Comportamiento y Diseño a Cortante y Torsión",
        description: "Construcción de DCL para vigas, marcos y armaduras. Identificación de fuerzas internas y externas.",
        lessonsCount: 3,
        duration: "1h 30min",
        price: 7.49,
        chapters: [
          {
            id: 41,
            title: "Capítulo VIII: Comportamiento y Diseño a Cortante – ACI 318 – 2019 & NTP E060",
            lessons: [
              { id: 411, title: "Introducción al Diseño a Cortante: ACI 318 – 2019 & NTP E060", duration: "30 min", videoUrl: "" },
              { id: 412, title: "Estudio de la Resistencia a Cortante Proporcionado por el Concreto", duration: "30 min", videoUrl: "" },
              { id: 413, title: "Estudio de la Resistencia a Cortante Proporcionado por el Acero de Refuerzo", duration: "30 min", videoUrl: "" },
              { id: 414, title: "Límites para el Espaciamiento del Refuerzo a Cortante", duration: "30 min", videoUrl: "" },
              { id: 415, title: "Diagrama de Flujo para el Diseño a Cortante – Programación en MathCad Prime", duration: "30 min", videoUrl: "" },
              { id: 416, title: "Diseño de una Viga a Cortante – MathCad Prime & Etabs", duration: "30 min", videoUrl: "" },
              { id: 417, title: "Demanda/Capacidad a Corte", duration: "30 min", videoUrl: "" },
            ],
          },
          {
            id: 42,
            title: "Capítulo IX: Comportamiento y Diseño a Torsión - ACI 318 – 2019 & NTP E060",
            lessons: [
              { id: 421, title: "Introducción al Diseño a Torsión: ACI 318 – 2019 & NTP E060", duration: "30 min", videoUrl: "" },
              { id: 422, title: " ¿Cuándo se debe Diseñar a Torsión?", duration: "30 min", videoUrl: "" },
              { id: 423, title: "Estudio de la Torsión Primaria & Torsión Secundaria", duration: "30 min", videoUrl: "" },
              { id: 424, title: "Límites Máximos a Torsión: Umbral de Torsión & Torsión de Fisuración", duration: "30 min", videoUrl: "" },
              { id: 425, title: "Estudio de las Ecuaciones a Torsión: Resistencia - Caos - Momento", duration: "30 min", videoUrl: "" },
              { id: 426, title: "Diseño de una Viga a Torsión – MathCad Prime & Etabs", duration: "30 min", videoUrl: "" },
              { id: 427, title: "¿Acero Longitudinal y Transversal a Torsión?", duration: "30 min", videoUrl: "" },
              { id: 428, title: "Demanda/Capacidad a Torsión", duration: "30 min", videoUrl: "" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "rigidez-matricial",
    title: "Método de Rigidez Matricial",
    description:
      "Domina el método de rigidez para resolver estructuras hiperestáticas. Matrices de rigidez local, ensamblaje global y resolución de sistemas.",
    price: 39.99,
    gradient: "from-purple-500 to-pink-600",
    level: "Intermedio",
    lessonsCount: 30,
    duration: "18 horas",
  },
  {
    slug: "analisis-dinamico",
    title: "Análisis Dinámico de Estructuras",
    description:
      "Estudio de vibraciones, respuesta dinámica, análisis modal y espectros de respuesta aplicados a edificaciones y estructuras civiles.",
    price: 49.99,
    gradient: "from-orange-500 to-red-600",
    level: "Avanzado",
    lessonsCount: 28,
    duration: "20 horas",
  },
  {
    slug: "diseno-sismico",
    title: "Diseño Sísmico y Normativa",
    description:
      "Aprende a diseñar estructuras sismorresistentes siguiendo las normativas vigentes. Espectros de diseño, ductilidad y detallado sísmico.",
    price: 44.99,
    gradient: "from-green-500 to-emerald-600",
    level: "Intermedio",
    lessonsCount: 26,
    duration: "16 horas",
  },
  {
    slug: "elementos-finitos",
    title: "Método de Elementos Finitos (FEM)",
    description:
      "Introducción al FEM aplicado a estructuras. Formulación de elementos, mallado, condiciones de frontera y análisis de resultados.",
    price: 59.99,
    gradient: "from-blue-500 to-indigo-600",
    level: "Avanzado",
    lessonsCount: 35,
    duration: "25 horas",
  },
  {
    slug: "analisis-puentes",
    title: "Análisis de Puentes y Estructuras Especiales",
    description:
      "Metodologías de análisis para puentes vehiculares, peatonales y estructuras especiales. Cargas móviles, líneas de influencia y diseño.",
    price: 54.99,
    gradient: "from-amber-500 to-orange-600",
    level: "Avanzado",
    lessonsCount: 22,
    duration: "15 horas",
  },
  {
    slug: "patologia-rehabilitacion",
    title: "Patología y Rehabilitación Estructural",
    description:
      "Diagnóstico de daños estructurales, evaluación de capacidad residual, técnicas de reforzamiento y rehabilitación de estructuras existentes.",
    price: 34.99,
    gradient: "from-teal-500 to-cyan-600",
    level: "Intermedio",
    lessonsCount: 20,
    duration: "14 horas",
  },
  {
    slug: "modelado-sap2000-etabs",
    title: "Modelado con SAP2000 y ETABS",
    description:
      "Aprende a modelar, analizar e interpretar resultados en SAP2000 y ETABS. Desde estructuras simples hasta edificios complejos paso a paso.",
    price: 64.99,
    gradient: "from-violet-500 to-purple-600",
    level: "Todos los niveles",
    lessonsCount: 40,
    duration: "30 horas",
  },
];
