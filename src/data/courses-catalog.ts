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
