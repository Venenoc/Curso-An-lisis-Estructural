"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth";
import { courseSchema } from "@/lib/schemas";
import { coursesCatalog } from "@/data/courses-catalog";

export async function createCourse(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { error: "No autenticado" };

    const supabase = await createClient();

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "instructor") {
      return { error: "No tienes permisos para crear cursos" };
    }

    // Validar datos
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      subscriptionOnly: formData.get("subscriptionOnly") === "true",
    };

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Crear curso
    const { error: insertError } = await supabase
      .from("courses")
      .insert({
        ...validation.data,
        instructor_id: profile.id,
        status: "draft",
      });

    if (insertError) {
      return { error: "Error al crear el curso" };
    }

    redirect("/admin/courses");
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { error: "No autenticado" };

    const supabase = await createClient();

    // Validar datos
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      subscriptionOnly: formData.get("subscriptionOnly") === "true",
    };

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Actualizar curso
    const { error: updateError } = await supabase
      .from("courses")
      .update(validation.data)
      .eq("id", courseId);

    if (updateError) {
      return { error: "Error al actualizar el curso" };
    }

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

export async function publishCourse(courseId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .update({ status: "published" })
      .eq("id", courseId);

    if (error) {
      return { error: "Error al publicar el curso" };
    }

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      return { error: "Error al eliminar el curso" };
    }

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

export async function purchaseCourse(slug: string) {
  try {
    const user = await getUser();
    if (!user) return { error: "Debes iniciar sesión para comprar un curso" };

    // Buscar curso por slug directamente en la base de datos
    const supabase = await createClient();

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return { error: "Perfil no encontrado" };

    // Buscar el curso por slug
    let { data: existingCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existingCourse) {
      return { error: "El curso no está disponible para compra. Contacta al administrador." };
    }
    const courseId = existingCourse.id;

    // Verificar que no exista enrollment duplicado
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollment) {
      return { error: "Ya tienes este curso" };
    }

    // Crear enrollment
    const { error: enrollError } = await supabase.from("enrollments").insert({
      user_id: profile.id,
      course_id: courseId,
      payment_type: "one_time",
    });

    if (enrollError) {
      return { error: "Error al procesar la compra" };
    }

    revalidatePath("/courses");
    revalidatePath("/cursos_m");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado al procesar la compra" };
  }
}

export async function markLessonComplete(courseSlug: string, lessonId: number) {
  try {
    const user = await getUser();
    if (!user) return { error: "No autenticado" };

    // Admin client to bypass RLS for lesson creation and progress upsert
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return { error: "Perfil no encontrado" };

    // Find the course in catalog to get its title
    const catalogCourse = coursesCatalog.find((c) => c.slug === courseSlug);
    if (!catalogCourse) return { error: "Curso no encontrado en catálogo" };

    // Find the course in DB — try by slug first, then by title
    let { data: dbCourse } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("slug", courseSlug)
      .single();

    if (!dbCourse) {
      const { data: byTitle } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("title", catalogCourse.title)
        .single();
      dbCourse = byTitle;
    }

    if (!dbCourse) return { error: `Curso no encontrado en BD (slug: ${courseSlug})` };

    // Find or create the lesson in DB
    const lessonTitle = catalogCourse.modules
      ?.flatMap((m) => m.lessons || [])
      .find((l) => l.id === lessonId)?.title;

    if (!lessonTitle) return { error: "Lección no encontrada" };

    let { data: dbLesson } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("course_id", dbCourse.id)
      .eq("title", lessonTitle)
      .single();

    if (!dbLesson) {
      const { data: newLesson, error: lessonError } = await supabaseAdmin
        .from("lessons")
        .insert({
          course_id: dbCourse.id,
          title: lessonTitle,
          order: lessonId,
        })
        .select("id")
        .single();

      if (lessonError || !newLesson) return { error: `Error al registrar lección: ${lessonError?.message}` };
      dbLesson = newLesson;
    }

    // Upsert progress
    const { error: progressError } = await supabaseAdmin
      .from("progress")
      .upsert(
        {
          user_id: profile.id,
          lesson_id: dbLesson.id,
          completed: true,
          watched_duration: 0,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

    if (progressError) return { error: `Error al guardar progreso: ${progressError.message}` };

    revalidatePath(`/classroom/${courseSlug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}
