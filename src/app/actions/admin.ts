"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCourse(formData: FormData) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return { error: "No autenticado" };
    }

    // Obtener el profile del instructor
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.user.id)
      .single();

    if (!profile || profile.role !== "instructor") {
      return { error: "Solo los instructores pueden crear cursos" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const subscriptionOnly = formData.get("subscriptionOnly") === "true";

    if (!title || !description) {
      return { error: "Por favor completa todos los campos" };
    }

    // Crear el curso
    const { error: createError } = await supabase.from("courses").insert({
      title,
      description,
      price,
      subscription_only: subscriptionOnly,
      instructor_id: profile.id,
      status: "draft",
    });

    if (createError) {
      return { error: "Error al crear el curso" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/courses");
    redirect("/dashboard");
  } catch (error) {
    return { error: "Ocurrió un error inesperado" };
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return { error: "No autenticado" };
    }

    // Verificar que es el instructor del curso
    const { data: course } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", courseId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.user.id)
      .single();

    if (!course || course.instructor_id !== profile?.id) {
      return { error: "No tienes permisos para editar este curso" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const status = formData.get("status") as string;

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        title,
        description,
        price,
        status,
      })
      .eq("id", courseId);

    if (updateError) {
      return { error: "Error al actualizar el curso" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { error: "Ocurrió un error inesperado" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return { error: "No autenticado" };
    }

    // Verificar que es el instructor del curso
    const { data: course } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", courseId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.user.id)
      .single();

    if (!course || course.instructor_id !== profile?.id) {
      return { error: "No tienes permisos para eliminar este curso" };
    }

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (deleteError) {
      return { error: "Error al eliminar el curso" };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    return { error: "Ocurrió un error inesperado" };
  }
}
