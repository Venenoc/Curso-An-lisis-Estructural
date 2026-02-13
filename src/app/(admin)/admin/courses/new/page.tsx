import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreateCourseForm from "@/components/admin/CreateCourseForm";
import { ChevronLeft } from "lucide-react";

export default async function CreateCoursePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Verificar que es instructor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
        <h1 className="text-4xl font-bold">Crear Nuevo Curso</h1>
        <p className="text-muted-foreground mt-2">
          Completa los detalles de tu nuevo curso
        </p>
      </div>

      <CreateCourseForm />
    </div>
  );
}
