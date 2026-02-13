import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default async function AdminCoursesPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Verificar que sea instructor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect("/dashboard");
  }

  // Obtener cursos del instructor
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", profile.id)
    .order("created_at", { ascending: false });

  const draftCount = courses?.filter((c) => c.status === "draft").length || 0;
  const publishedCount = courses?.filter((c) => c.status === "published").length || 0;

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Panel de Instructor</h1>
          <p className="text-muted-foreground mt-2">Crea y gestiona tus cursos</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Curso
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tus Cursos</CardTitle>
          <CardDescription>
            Gestiona el contenido y estado de tus cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses && courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-muted-foreground">
                        Precio: ${course.price.toFixed(2)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          course.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aún no has creado ningún curso
              </p>
              <Link href="/admin/courses/new">
                <Button>Crear Tu Primer Curso</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
