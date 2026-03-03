export interface CourseLesson {
  id: number;
  /** UUID del lesson en Supabase — presente cuando el classroom carga desde DB */
  dbId?: string;
  title: string;
  duration: string;
  videoUrl: string;
  /** Materiales descargables/links de la lección (columna materials en DB) */
  materials?: { title: string; url: string }[];
}

/** Sesión: agrupa lecciones bajo un capítulo. Puede tener video introductorio (type='session')
 *  o ser solo un contenedor de título (type='taller'). */
export interface CourseSession {
  /** UUID de la sesión en Supabase */
  dbId: string;
  title: string;
  type: 'session' | 'taller';
  /** URL del video introductorio — solo cuando type === 'session' */
  videoUrl?: string;
  lessons: CourseLesson[];
}

export interface CourseChapter {
  id: number;
  /** UUID del capítulo en Supabase */
  dbId?: string;
  title: string;
  /** Lista plana de todas las lecciones del capítulo (para allLessons / progreso) */
  lessons: CourseLesson[];
  /** Sesiones que agrupan las lecciones (disponible cuando se carga desde DB con sessions) */
  sessions?: CourseSession[];
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
  image_url?: string;
  /** true = curso publicado en Supabase DB */
  inDb?: boolean;
  /** true = curso en estado draft (no publicado aún) */
  isDraft?: boolean;
}

// El catálogo estático fue eliminado — todos los cursos se leen directamente desde Supabase.
// Se mantiene este array vacío para compatibilidad con importaciones existentes que aún
// no han sido migradas (profile, checkout, etc.). Pueden ignorarse con seguridad.
export const coursesCatalog: CatalogCourse[] = [];
