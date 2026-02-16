import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Verificar que es instructor
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect("/dashboard");
  }

  // Obtener curso
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", profile.id)
    .single();

  if (!course) {
    redirect("/admin/courses");
  }

  // Obtener lecciones
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order");

  return (
    <div className="container py-12">
      {/* Header */}
      <Link
        href="/admin/courses"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a Mis Cursos
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {/* Course Info */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{course.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${course.price.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lessons?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-8">
        <Button variant="outline" disabled>
          Editar Información
        </Button>
        <Button variant="outline" disabled>
          {course.status === "draft" ? "Publicar" : "Despublicar"}
        </Button>
        <Button variant="destructive" disabled>
          Eliminar Curso
        </Button>
      </div>

      {/* Lessons Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lecciones</CardTitle>
            <Button disabled>+ Agregar Lección</Button>
          </div>
        </CardHeader>
        <CardContent>
          {lessons && lessons.length > 0 ? (
            <div className="space-y-2">
              {lessons.map((lesson: any) => (
                <div
                  key={lesson.id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition"
                >
                  <div>
                    <h4 className="font-semibold">{lesson.title}</h4>
                    {lesson.duration && (
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(lesson.duration / 60)} min
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" disabled>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aún no hay lecciones en este curso
              </p>
              <Button disabled>Crear Primera Lección</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
