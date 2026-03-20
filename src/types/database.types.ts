export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          phone: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          short_description: string | null;
          thumbnail_url: string | null;
          video_preview_url: string | null;
          price: number;
          currency: string;
          status: string;
          level: string | null;
          duration_hours: number | null;
          total_lessons: number | null;
          category: string | null;
          tags: string[] | null;
          instructor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          video_preview_url?: string | null;
          price?: number;
          currency?: string;
          status?: string;
          level?: string | null;
          duration_hours?: number | null;
          total_lessons?: number | null;
          category?: string | null;
          tags?: string[] | null;
          instructor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          video_preview_url?: string | null;
          price?: number;
          currency?: string;
          status?: string;
          level?: string | null;
          duration_hours?: number | null;
          total_lessons?: number | null;
          category?: string | null;
          tags?: string[] | null;
          instructor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order: number;
          price: number | null;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order?: number;
          price?: number | null;
          is_free?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order?: number;
          price?: number | null;
          is_free?: boolean;
          created_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          order?: number;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          chapter_id: string;
          title: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          title: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          title?: string;
          order?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          session_id: string | null;
          chapter_id: string | null;
          module_id: string | null;
          course_id: string | null;
          catalog_lesson_id: number | null;
          title: string;
          description: string | null;
          video_url: string | null;
          duration_seconds: number | null;
          order: number;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          chapter_id?: string | null;
          module_id?: string | null;
          course_id?: string | null;
          catalog_lesson_id?: number | null;
          title: string;
          description?: string | null;
          video_url?: string | null;
          duration_seconds?: number | null;
          order?: number;
          is_free?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          chapter_id?: string | null;
          module_id?: string | null;
          course_id?: string | null;
          catalog_lesson_id?: number | null;
          title?: string;
          description?: string | null;
          video_url?: string | null;
          duration_seconds?: number | null;
          order?: number;
          is_free?: boolean;
          created_at?: string;
        };
      };
      lesson_faqs: {
        Row: {
          id: string;
          lesson_id: string;
          question: string;
          answer: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          question: string;
          answer: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          question?: string;
          answer?: string;
          order?: number;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
          payment_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
          payment_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          payment_id?: string | null;
        };
      };
      module_enrollments: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          course_id: string;
          enrolled_at: string;
          payment_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          course_id: string;
          enrolled_at?: string;
          payment_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          course_id?: string;
          enrolled_at?: string;
          payment_id?: string | null;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string | null;
          completed: boolean;
          completed_at: string | null;
          watch_time_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          watch_time_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          course_id?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          watch_time_seconds?: number | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          module_id: string | null;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          status: string;
          amount: number;
          currency: string;
          payment_method: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          module_id?: string | null;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
          status?: string;
          amount: number;
          currency?: string;
          payment_method?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          module_id?: string | null;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
          status?: string;
          amount?: number;
          currency?: string;
          payment_method?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string | null;
          catalog_lesson_id: number | null;
          course_id: string | null;
          title: string;
          description: string | null;
          passing_score: number;
          time_limit_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          catalog_lesson_id?: number | null;
          course_id?: string | null;
          title: string;
          description?: string | null;
          passing_score?: number;
          time_limit_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          catalog_lesson_id?: number | null;
          course_id?: string | null;
          title?: string;
          description?: string | null;
          passing_score?: number;
          time_limit_minutes?: number | null;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          options: Json;
          correct_answer: number;
          explanation: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          options: Json;
          correct_answer: number;
          explanation?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          options?: Json;
          correct_answer?: number;
          explanation?: string | null;
          order?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          answers: Json | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          answers?: Json | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          passed?: boolean;
          answers?: Json | null;
          completed_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          title: string | null;
          content: string;
          media_url: string | null;
          likes_count: number;
          replies_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          title?: string | null;
          content: string;
          media_url?: string | null;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          title?: string | null;
          content?: string;
          media_url?: string | null;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      post_replies: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      direct_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          issued_at: string;
          certificate_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          issued_at?: string;
          certificate_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          issued_at?: string;
          certificate_url?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          user_id: string | null;
          course_id: string | null;
          author_name: string;
          author_role: string | null;
          content: string;
          rating: number | null;
          avatar_url: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          course_id?: string | null;
          author_name: string;
          author_role?: string | null;
          content: string;
          rating?: number | null;
          avatar_url?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          course_id?: string | null;
          author_name?: string;
          author_role?: string | null;
          content?: string;
          rating?: number | null;
          avatar_url?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
      };
      course_exceptions: {
        Row: {
          id: string;
          auth_user_id: string;
          user_id: string | null;
          course_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          user_id?: string | null;
          course_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          user_id?: string | null;
          course_id?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
      advisory_videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          duration: string | null;
          video_url: string;
          order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          duration?: string | null;
          video_url: string;
          order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          duration?: string | null;
          video_url?: string;
          order?: number;
          is_published?: boolean;
          created_at?: string;
        };
      };
      tool_resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          file_url: string | null;
          external_url: string | null;
          is_free: boolean;
          is_published: boolean;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          file_url?: string | null;
          external_url?: string | null;
          is_free?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          file_url?: string | null;
          external_url?: string | null;
          is_free?: boolean;
          is_published?: boolean;
          order?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types (Supabase generated types pattern)
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// ─── Catalog / classroom runtime types ───────────────────────────────────────
// (previously in src/data/courses-catalog.ts)

export interface CourseLesson {
  id: number;
  /** UUID del lesson en Supabase — presente cuando el classroom carga desde DB */
  dbId?: string;
  title: string;
  duration: string;
  videoUrl: string;
  materials?: { title: string; url: string }[];
}

export interface CourseSession {
  dbId: string;
  title: string;
  type: "session" | "taller";
  videoUrl?: string;
  lessons: CourseLesson[];
}

export interface CourseChapter {
  id: number;
  dbId?: string;
  title: string;
  lessons: CourseLesson[];
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
  presentationUrl?: string;
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
  inDb?: boolean;
  isDraft?: boolean;
}

// ─── Row type aliases ─────────────────────────────────────────────────────────
export type Profile = Tables<"profiles">;
export type Course = Tables<"courses">;
export type Module = Tables<"modules">;
export type Chapter = Tables<"chapters">;
export type Session = Tables<"sessions">;
export type Lesson = Tables<"lessons">;
export type LessonFaq = Tables<"lesson_faqs">;
export type Enrollment = Tables<"enrollments">;
export type ModuleEnrollment = Tables<"module_enrollments">;
export type Progress = Tables<"progress">;
export type Payment = Tables<"payments">;
export type Quiz = Tables<"quizzes">;
export type QuizQuestion = Tables<"quiz_questions">;
export type QuizAttempt = Tables<"quiz_attempts">;
export type Post = Tables<"posts">;
export type PostLike = Tables<"post_likes">;
export type PostReply = Tables<"post_replies">;
export type DirectMessage = Tables<"direct_messages">;
export type ContactMessage = Tables<"contact_messages">;
export type Certificate = Tables<"certificates">;
export type Notification = Tables<"notifications">;
export type Testimonial = Tables<"testimonials">;
export type CourseException = Tables<"course_exceptions">;
export type AdvisoryVideo = Tables<"advisory_videos">;
export type ToolResource = Tables<"tool_resources">;
