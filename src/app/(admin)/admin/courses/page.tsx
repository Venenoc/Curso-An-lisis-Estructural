import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminCoursesPage() {
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

  // Obtener cursos del instructor
  const { data: courses } = await supabase
    .from("courses")
    .select("*, lessons(count)")
    .eq("instructor_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y edita tus cursos
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Button>
        </Link>
      </div>

      {/* Courses Table */}
      {courses && courses.length > 0 ? (
        <div className="grid gap-6">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    course.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {course.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-semibold">${course.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lecciones</p>
                    <p className="font-semibold">{course.lessons?.[0]?.count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-semibold">
                      {course.subscription_only ? "Suscripción" : "Compra única"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex-1 justify-start"
                    disabled
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No tienes cursos aún</CardTitle>
            <CardDescription>
              Crea tu primer curso para comenzar a compartir tu conocimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
