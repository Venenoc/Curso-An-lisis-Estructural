"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Error handling más específico
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email o contraseña incorrectos" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Por favor confirma tu email" };
    }
    return { error: error.message || "Error al iniciar sesión" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = (formData.get("role") as string) || "student";

    // Validación básica
    if (!email || !password || !fullName) {
      return { error: "Por favor completa todos los campos requeridos" };
    }

    // Crear usuario
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
      }
    });

    if (signUpError) {
      // Manejo específico de errores
      if (signUpError.message.includes("duplicate")) {
        return { error: "Este email ya está registrado" };
      }
      if (signUpError.message.includes("password")) {
        return { error: "La contraseña no es segura" };
      }
      return { error: signUpError.message || "Error al crear la cuenta" };
    }

    if (!authData.user) {
      return { error: "Error al crear el usuario" };
    }

    // Esperar brevemente para sincronización
    await new Promise(resolve => setTimeout(resolve, 500));

    // Crear perfil si no existe
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          role: role,
        });

      if (profileError) {
        return { error: "Error al crear el perfil" };
      }
    }

    // Login
    const supabase = await createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return { error: "Error al iniciar sesión después del registro" };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error: any) {
    return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
