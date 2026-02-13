import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["student", "instructor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Course schemas
export const courseSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z
    .number()
    .min(0, "El precio debe ser mayor a 0")
    .or(z.string().refine((val) => !isNaN(parseFloat(val)), "Precio inválido")),
  subscriptionOnly: z.boolean().default(false),
});

export const lessonSchema = z.object({
  title: z.string().min(3, "El título es requerido"),
  description: z.string().optional(),
  videoUrl: z.string().url("URL de video inválida").optional(),
  duration: z.number().optional(),
  order: z.number().default(0),
});

// Contact schema
export const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
