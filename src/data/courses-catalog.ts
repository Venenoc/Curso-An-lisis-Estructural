export interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessonsCount: number;
  duration: string;
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
    title: "Fundamentos de Análisis Estructural",
    description:
      "Aprende los conceptos base del análisis estructural: equilibrio, diagramas de cuerpo libre, reacciones en apoyos y análisis de vigas y marcos isostáticos.",
    price: 29.99,
    gradient: "from-cyan-500 to-blue-600",
    level: "Principiante",
    lessonsCount: 24,
    duration: "12 horas",
    modules: [
      {
        id: 1,
        title: "Introducción al Análisis Estructural",
        description: "Conceptos fundamentales, tipos de estructuras, clasificación de cargas y el rol del ingeniero estructural en proyectos civiles.",
        lessonsCount: 2,
        duration: "45 min",
      },
      {
        id: 2,
        title: "Estática y Equilibrio de Cuerpos Rígidos",
        description: "Repaso de estática: fuerzas, momentos, resultantes, condiciones de equilibrio y principio de superposición.",
        lessonsCount: 3,
        duration: "1h 20min",
      },
      {
        id: 3,
        title: "Tipos de Apoyos y Reacciones",
        description: "Apoyos fijos, móviles, empotramientos y articulaciones. Cálculo de reacciones en estructuras isostáticas.",
        lessonsCount: 2,
        duration: "1h 10min",
      },
      {
        id: 4,
        title: "Diagramas de Cuerpo Libre (DCL)",
        description: "Construcción de DCL para vigas, marcos y armaduras. Identificación de fuerzas internas y externas.",
        lessonsCount: 3,
        duration: "1h 30min",
      },
      {
        id: 5,
        title: "Análisis de Vigas Isostáticas",
        description: "Cálculo de reacciones, fuerzas cortantes y momentos flectores en vigas simplemente apoyadas y en voladizo.",
        lessonsCount: 3,
        duration: "1h 45min",
      },
      {
        id: 6,
        title: "Diagramas de Cortante y Momento",
        description: "Construcción e interpretación de diagramas V y M. Relaciones entre carga, cortante y momento. Puntos de inflexión.",
        lessonsCount: 2,
        duration: "1h 15min",
      },
      {
        id: 7,
        title: "Análisis de Armaduras",
        description: "Método de los nodos y método de las secciones para armaduras planas. Identificación de barras de fuerza cero.",
        lessonsCount: 3,
        duration: "1h 30min",
      },
      {
        id: 8,
        title: "Análisis de Marcos Isostáticos",
        description: "Cálculo de fuerzas internas en marcos de dos y tres articulaciones. Diagramas de fuerza axial, cortante y momento.",
        lessonsCount: 2,
        duration: "1h 20min",
      },
      {
        id: 9,
        title: "Deformaciones y Método de la Doble Integración",
        description: "Cálculo de deflexiones en vigas mediante integración directa de la ecuación diferencial de la elástica.",
        lessonsCount: 2,
        duration: "1h 10min",
      },
      {
        id: 10,
        title: "Proyecto Final: Análisis Completo de una Estructura",
        description: "Aplicación integral de todos los conceptos. Análisis de una estructura real con cálculo de reacciones, diagramas y deflexiones.",
        lessonsCount: 2,
        duration: "1h 15min",
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
