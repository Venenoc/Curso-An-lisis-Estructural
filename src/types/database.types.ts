export type UserRole = 'student' | 'instructor' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  subscription_only: boolean;
  instructor_id: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: number | null;
  order: number;
  resources_urls: string[] | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_type: 'one_time' | 'subscription';
  enrolled_at: string;
  expires_at: string | null;
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_duration: number;
  last_watched_at: string;
}
