"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "./auth";
import { courseSchema } from "@/lib/schemas";
import type { CatalogCourse } from "@/types/database.types";

// ─────────────────────────────────────────────────────────────────────────────
// Fetch the full course catalog from Supabase (ALL courses: published + draft).
// Published courses are shown normally; draft courses get isDraft: true so the
// UI can display them as locked / "en desarrollo".
// ─────────────────────────────────────────────────────────────────────────────
export async function getCatalogCoursesFromDB(): Promise<CatalogCourse[]> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch ALL courses regardless of status
  const { data: courses } = await admin
    .from("courses")
    .select("id, slug, title, description, price, gradient, level, total_duration, total_lessons, image_url, status")
    .order("created_at", { ascending: true });

  if (!courses || courses.length === 0) return [];

  const courseIds = courses.map((c: any) => c.id).filter(Boolean);

  // Fetch modules for all courses
  const { data: dbModulesRaw } = courseIds.length
    ? await admin.from("modules").select("id, course_id, title, order, price").in("course_id", courseIds).order("order")
    : { data: [] };

  // Group modules by course_id
  const modulesByCourseId: Record<string, CatalogCourse["modules"]> = {};
  for (const m of (dbModulesRaw ?? []) as any[]) {
    if (!modulesByCourseId[m.course_id]) modulesByCourseId[m.course_id] = [];
    modulesByCourseId[m.course_id]!.push({
      id: (m.order as number) + 1,
      title: m.title as string,
      description: "",
      price: Number(m.price) || 0,
      lessonsCount: 0,
      duration: "",
      chapters: [],
    });
  }

  return courses.map((c: any) => ({
    slug: (c.slug as string) ?? (c.id as string),
    title: c.title as string,
    description: (c.description as string) ?? "",
    price: Number(c.price),
    gradient: (c.gradient as string) ?? "from-cyan-500 to-blue-600",
    level: ((c.level as string) ?? "Principiante") as CatalogCourse["level"],
    lessonsCount: Number(c.total_lessons) || 0,
    duration: (c.total_duration as string) || "",
    modules: modulesByCourseId[c.id as string] ?? [],
    image_url: (c.image_url as string) ?? undefined,
    inDb: true,
    isDraft: (c.status as string) !== "published",
  }));
}

// Returns a map of course_slug → completion percentage (0-100) for a given profile
export async function getCourseProgressMap(profileId: string): Promise<Record<string, number>> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all completed lesson IDs for this user
  const { data: completedRows } = await admin
    .from("progress")
    .select("lesson_id")
    .eq("user_id", profileId)
    .eq("completed", true);

  if (!completedRows?.length) return {};

  const lessonIds = completedRows.map((r: any) => r.lesson_id as string);

  // Map lesson → course_id
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, course_id")
    .in("id", lessonIds);

  if (!lessons?.length) return {};

  const countByCourseId: Record<string, number> = {};
  for (const l of lessons as any[]) {
    countByCourseId[l.course_id] = (countByCourseId[l.course_id] || 0) + 1;
  }

  // Get slug and total_lessons for those courses
  const courseIds = Object.keys(countByCourseId);
  const { data: courses } = await admin
    .from("courses")
    .select("id, slug, total_lessons")
    .in("id", courseIds);

  const progressMap: Record<string, number> = {};
  for (const c of (courses || []) as any[]) {
    if (c.slug && c.total_lessons > 0) {
      progressMap[c.slug] = Math.min(
        100,
        Math.round((countByCourseId[c.id] / c.total_lessons) * 100)
      );
    }
  }
  return progressMap;
}

// Helper used by enrollment lookup: returns slugs of courses enrolled by a profile
export async function getEnrolledSlugs(profileId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("courses(slug)")
    .eq("user_id", profileId);
  return (data ?? []).map((e: any) => e.courses?.slug).filter(Boolean) as string[];
}

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
      title: formData.get("title") ?? undefined,
      description: formData.get("description") ?? undefined,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
      subscription_only: formData.get("subscriptionOnly") === "true",
    };

    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Generar slug desde el título
    const slug = (validation.data as any).title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 80);

    // Crear curso
    const { error: insertError } = await supabase
      .from("courses")
      .insert({
        ...validation.data,
        slug,
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

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const price = parseFloat(formData.get("price") as string) || 0;
    const level = (formData.get("level") as string) || "Principiante";
    const subscription_only = formData.get("subscription_only") === "true";
    const image_url = (formData.get("image_url") as string)?.trim() || null;
    const presentation_video_url = (formData.get("presentation_video_url") as string)?.trim() || null;

    if (!title || title.length < 3)
      return { error: "El título debe tener al menos 3 caracteres" };
    if (!description || description.length < 10)
      return { error: "La descripción debe tener al menos 10 caracteres" };

    // Actualizar curso — total_duration y total_lessons se calculan automáticamente en syncCourseStats
    const { error: updateError } = await supabase
      .from("courses")
      .update({ title, description, price, level, subscription_only, image_url, presentation_video_url })
      .eq("id", courseId);

    if (updateError) {
      return { error: "Error al actualizar el curso" };
    }

    // Sincronizar total_duration y total_lessons desde las lecciones reales en DB
    await syncCourseStats(courseId);

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

export async function publishCourse(courseId: string, publish: boolean = true) {
  try {
    const supabase = await createClient();
    const newStatus = publish ? "published" : "draft";
    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", courseId);

    if (error) {
      return { error: publish ? "Error al publicar el curso" : "Error al despublicar el curso" };
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

// ── syncCourseStats: recalculates total_duration and total_lessons from lessons ──
async function syncCourseStats(courseId: string): Promise<void> {
  if (!courseId) return;
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: lessons } = await admin
    .from("lessons")
    .select("duration")
    .eq("course_id", courseId);

  const totalLessons = lessons?.length ?? 0;
  const totalMinutes = (lessons ?? []).reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
  const formattedDuration =
    totalMinutes >= 60
      ? `${(totalMinutes / 60).toFixed(1)}h`
      : totalMinutes > 0
      ? `${totalMinutes} min`
      : "";

  await admin
    .from("courses")
    .update({ total_duration: formattedDuration, total_lessons: totalLessons })
    .eq("id", courseId);
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

export async function purchaseModule(slug: string, moduleId: number) {
  try {
    const user = await getUser();
    if (!user) return { error: "Debes iniciar sesión para comprar un módulo" };

    const supabase = await createClient();

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return { error: "Perfil no encontrado" };

    // Buscar el curso por slug en DB
    const { data: existingCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existingCourse) {
      return { error: "El curso no está disponible. Contacta al administrador." };
    }

    // Buscar el módulo por posición: moduleId es índice 1-based del catálogo, NO un UUID
    const adminForModule = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: allModules } = await adminForModule
      .from("modules")
      .select("id, title, price")
      .eq("course_id", existingCourse.id)
      .order("order", { ascending: true });
    const dbModule = (allModules ?? [])[moduleId - 1] ?? null;
    if (!dbModule) return { error: "Módulo no encontrado" };

    // Verificar que el usuario no tenga el curso completo
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", existingCourse.id)
      .single();

    if (existingEnrollment) {
      return { error: "Ya tienes acceso al curso completo" };
    }

    // Verificar que no haya comprado este módulo antes
    const { data: existingModuleEnrollment } = await supabase
      .from("module_enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", existingCourse.id)
      .eq("module_id", moduleId)
      .single();

    if (existingModuleEnrollment) {
      return { error: "Ya tienes este módulo" };
    }

    // Crear module enrollment
    const { error: enrollError } = await supabase
      .from("module_enrollments")
      .insert({
        user_id: profile.id,
        course_id: existingCourse.id,
        module_id: moduleId,
        module_title: dbModule.title,
        price: dbModule.price,
        payment_type: "one_time",
      });

    if (enrollError) {
      return { error: "Error al procesar la compra del módulo" };
    }

    revalidatePath("/cursos");
    revalidatePath(`/cursos/${slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    return { error: "Error inesperado al procesar la compra" };
  }
}

export async function markLessonComplete(courseSlug: string, _lessonId: number, lessonDbId?: string) {
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

    // ── Fast path: lesson UUID provided directly (Supabase-based classroom) ──
    if (lessonDbId) {
      const { error: progressError } = await supabaseAdmin
        .from("progress")
        .upsert(
          {
            user_id: profile.id,
            lesson_id: lessonDbId,
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
    }

    // ── Legacy path: lessonDbId not provided — no longer supported ───────────
    // All classrooms now pass lessonDbId directly from DB. If this path is hit,
    // it means the call is from outdated code.
    return { error: "Identificador de lección requerido (lessonDbId)" };
  } catch (error: any) {
    return { error: "Error inesperado" };
  }
}

// ── Lesson Management ──

async function getInstructorProfile() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();
  return data;
}

// ── createLesson: now takes chapterId — also sets course_id for classroom compat ──
export async function createLesson(
  chapterId: string,
  formData: FormData,
  sessionId?: string
): Promise<{ lesson?: { id: string; title: string; video_url: string | null; order: number; duration: number | null; chapter_uuid: string; session_id: string | null }; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };

    const title = (formData.get("title") as string)?.trim();
    const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
    const durationStr = formData.get("duration") as string;
    const duration = durationStr ? parseInt(durationStr, 10) : null;
    const resolvedSessionId = sessionId || (formData.get("sessionId") as string) || null;

    if (!title) return { error: "El título es obligatorio" };

    const supabase = await createClient();

    // Resolve chapter → module → course_id
    const { data: chapter } = await supabase
      .from("chapters")
      .select("module_id")
      .eq("id", chapterId)
      .single();
    if (!chapter) return { error: "Capítulo no encontrado" };

    const { data: module } = await supabase
      .from("modules")
      .select("course_id")
      .eq("id", chapter.module_id)
      .single();
    if (!module) return { error: "Módulo no encontrado" };

    // Get next order within the session (or chapter if no session)
    const orderQuery = resolvedSessionId
      ? supabase.from("lessons").select("order").eq("session_id", resolvedSessionId)
      : supabase.from("lessons").select("order").eq("chapter_uuid", chapterId);
    const { data: last } = await orderQuery.order("order", { ascending: false }).limit(1);
    const order = (last?.[0]?.order ?? -1) + 1;

    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        course_id: module.course_id,
        chapter_uuid: chapterId,
        session_id: resolvedSessionId,
        title,
        video_url: videoUrl,
        duration,
        order,
      })
      .select("id, title, video_url, order, duration, chapter_uuid, session_id")
      .single();

    if (error || !lesson) return { error: "Error al crear la lección" };

    revalidatePath(`/admin/courses/${module.course_id}`);
    await syncCourseStats(module.course_id);
    return { lesson };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateLesson(
  lessonId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };

    const title = (formData.get("title") as string)?.trim();
    const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
    const durationStr = formData.get("duration") as string;
    const duration = durationStr ? parseInt(durationStr, 10) : null;

    if (!title) return { error: "El título es obligatorio" };

    const supabase = await createClient();

    // Look up course_id before update so we can sync stats after
    const { data: lessonRef } = await supabase
      .from("lessons")
      .select("course_id")
      .eq("id", lessonId)
      .single();

    const { error } = await supabase
      .from("lessons")
      .update({ title, video_url: videoUrl, duration })
      .eq("id", lessonId);

    if (error) return { error: "Error al actualizar la lección" };

    revalidatePath("/admin/courses");
    if (lessonRef?.course_id) await syncCourseStats(lessonRef.course_id);
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function deleteLesson(
  lessonId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };

    const supabase = await createClient();

    // Look up course_id before deleting
    const { data: lessonRef } = await supabase
      .from("lessons")
      .select("course_id")
      .eq("id", lessonId)
      .single();
    const courseId = lessonRef?.course_id;

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) return { error: "Error al eliminar la lección" };

    revalidatePath("/admin/courses");
    if (courseId) await syncCourseStats(courseId);
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateLessonMaterials(
  lessonId: string,
  materials: { title: string; url: string }[]
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("lessons")
      .update({ materials })
      .eq("id", lessonId);

    if (error) return { error: "Error al actualizar los materiales" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

// ── Module Management ────────────────────────────────────────────────────────

export async function createModule(
  courseId: string,
  title: string,
  presentationVideoUrl?: string,
  price?: number
): Promise<{ module?: { id: string; course_id: string; title: string; order: number; presentation_video_url: string | null; price: number }; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };

    const supabase = await createClient();

    const { data: course } = await supabase
      .from("courses").select("id").eq("id", courseId).eq("instructor_id", profile.id).single();
    if (!course) return { error: "Curso no encontrado o sin permisos" };

    const { count } = await supabase
      .from("modules").select("id", { count: "exact", head: true }).eq("course_id", courseId);
    if ((count ?? 0) >= 4) return { error: "Máximo 4 módulos por curso" };

    const { data: last } = await supabase
      .from("modules").select("order").eq("course_id", courseId)
      .order("order", { ascending: false }).limit(1);
    const order = (last?.[0]?.order ?? -1) + 1;

    const { data: mod, error } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title: title.trim(), order, presentation_video_url: presentationVideoUrl?.trim() || null, price: price ?? 0 })
      .select("id, course_id, title, order, presentation_video_url, price")
      .single();

    if (error || !mod) return { error: "Error al crear el módulo" };
    revalidatePath(`/admin/courses/${courseId}`);
    return { module: mod };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateModule(
  moduleId: string,
  title: string,
  presentationVideoUrl?: string,
  price?: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("modules")
      .update({ title: title.trim(), presentation_video_url: presentationVideoUrl?.trim() || null, price: price ?? 0 })
      .eq("id", moduleId);
    if (error) return { error: "Error al actualizar el módulo" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function deleteModule(
  moduleId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const supabase = await createClient();

    // Look up course_id before cascade delete
    const { data: mod } = await supabase
      .from("modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();
    const courseId = mod?.course_id;

    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) return { error: "Error al eliminar el módulo" };

    if (courseId) await syncCourseStats(courseId);
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

// ── Chapter Management ───────────────────────────────────────────────────────

export async function createChapter(
  moduleId: string,
  title: string
): Promise<{ chapter?: { id: string; module_id: string; title: string; order: number }; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const supabase = await createClient();

    const { data: last } = await supabase
      .from("chapters").select("order").eq("module_id", moduleId)
      .order("order", { ascending: false }).limit(1);
    const order = (last?.[0]?.order ?? -1) + 1;

    const { data: chapter, error } = await supabase
      .from("chapters")
      .insert({ module_id: moduleId, title: title.trim(), order })
      .select("id, module_id, title, order")
      .single();

    if (error || !chapter) return { error: "Error al crear el capítulo" };
    return { chapter };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateChapter(
  chapterId: string,
  title: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const supabase = await createClient();
    const { error } = await supabase.from("chapters").update({ title: title.trim() }).eq("id", chapterId);
    if (error) return { error: "Error al actualizar el capítulo" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function deleteChapter(
  chapterId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const supabase = await createClient();

    // Look up course_id via chapter → module before cascade delete
    const { data: ch } = await supabase
      .from("chapters")
      .select("module_id")
      .eq("id", chapterId)
      .single();
    let courseId: string | undefined;
    if (ch?.module_id) {
      const { data: mod } = await supabase
        .from("modules")
        .select("course_id")
        .eq("id", ch.module_id)
        .single();
      courseId = mod?.course_id;
    }

    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
    if (error) return { error: "Error al eliminar el capítulo" };

    if (courseId) await syncCourseStats(courseId);
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

// ── Session Management ───────────────────────────────────────────────────────

export async function createSession(
  chapterId: string,
  title: string,
  type: 'session' | 'taller',
  videoUrl?: string
): Promise<{ session?: { id: string; chapter_id: string; title: string; type: string; video_url: string | null; order: number }; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: last } = await admin
      .from("sessions")
      .select("order")
      .eq("chapter_id", chapterId)
      .order("order", { ascending: false })
      .limit(1);
    const order = (last?.[0]?.order ?? -1) + 1;

    const { data: session, error } = await admin
      .from("sessions")
      .insert({
        chapter_id: chapterId,
        title: title.trim(),
        type,
        video_url: type === 'session' ? (videoUrl?.trim() || null) : null,
        order,
      })
      .select("id, chapter_id, title, type, video_url, order")
      .single();

    if (error || !session) return { error: "Error al crear la sesión" };
    return { session };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateSession(
  sessionId: string,
  title: string,
  type: 'session' | 'taller',
  videoUrl?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await admin
      .from("sessions")
      .update({
        title: title.trim(),
        type,
        video_url: type === 'session' ? (videoUrl?.trim() || null) : null,
      })
      .eq("id", sessionId);

    if (error) return { error: "Error al actualizar la sesión" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function deleteSession(
  sessionId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await admin
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) return { error: "Error al eliminar la sesión" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

// ── Lesson FAQs ───────────────────────────────────────────────────────────────

export interface LessonFaq {
  id: string;
  lesson_id: string;
  question: string;
  video_url: string | null;
  order: number;
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getFaqsByLessonIds(
  lessonIds: string[]
): Promise<Record<string, LessonFaq[]>> {
  if (!lessonIds.length) return {};
  const { data } = await adminClient()
    .from("lesson_faqs")
    .select("id, lesson_id, question, video_url, order")
    .in("lesson_id", lessonIds)
    .order("order", { ascending: true });
  const map: Record<string, LessonFaq[]> = {};
  for (const faq of data || []) {
    if (!map[faq.lesson_id]) map[faq.lesson_id] = [];
    map[faq.lesson_id].push(faq as LessonFaq);
  }
  return map;
}

export async function createFaq(
  lessonId: string,
  question: string,
  videoUrl?: string
): Promise<{ faq?: LessonFaq; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const admin = adminClient();
    const { data: last } = await admin
      .from("lesson_faqs")
      .select("order")
      .eq("lesson_id", lessonId)
      .order("order", { ascending: false })
      .limit(1);
    const order = (last?.[0]?.order ?? -1) + 1;
    const { data, error } = await admin
      .from("lesson_faqs")
      .insert({ lesson_id: lessonId, question: question.trim(), video_url: videoUrl?.trim() || null, order })
      .select("id, lesson_id, question, video_url, order")
      .single();
    if (error || !data) return { error: "Error al crear la pregunta" };
    return { faq: data as LessonFaq };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function updateFaq(
  faqId: string,
  question: string,
  videoUrl?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const { error } = await adminClient()
      .from("lesson_faqs")
      .update({ question: question.trim(), video_url: videoUrl?.trim() || null })
      .eq("id", faqId);
    if (error) return { error: "Error al actualizar la pregunta" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}

export async function deleteFaq(
  faqId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const profile = await getInstructorProfile();
    if (!profile) return { error: "No autenticado" };
    const { error } = await adminClient()
      .from("lesson_faqs")
      .delete()
      .eq("id", faqId);
    if (error) return { error: "Error al eliminar la pregunta" };
    return { success: true };
  } catch {
    return { error: "Error inesperado" };
  }
}
