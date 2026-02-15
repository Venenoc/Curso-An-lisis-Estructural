"use server";

import { createClient } from "@/lib/supabase/server";
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
      return { error: validation.error.errors[0].message };
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
      return { error: validation.error.errors[0].message };
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
