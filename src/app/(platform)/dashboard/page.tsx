import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BarChart3, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Obtener datos del perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Obtener cursos inscritos
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      payment_type,
      course_id,
      courses(title, description, price)
    `)
    .eq("user_id", profile?.id);

  // Obtener cursos creados (si es instructor)
  const { data: createdCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", profile?.id);

  // Obtener progreso
  const { data: progress } = await supabase
    .from("progress")
    .select("*, lessons(title)")
    .eq("user_id", profile?.id)
    .eq("completed", true);

  const isInstructor = profile?.role === "instructor";
  const enrolledCount = enrollments?.length || 0;
  const completedLessons = progress?.length || 0;
  const createdCoursesCount = createdCourses?.length || 0;

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Bienvenido, {profile?.full_name || user.email}</h1>
        <p className="text-muted-foreground">
          {isInstructor 
            ? "Panel de instructor - Gestiona tus cursos" 
            : "Continúa tu aprendizaje"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {!isInstructor && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cursos Inscritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{enrolledCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {enrolledCount === 1 ? "curso activo" : "cursos activos"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lecciones Completadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedLessons}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedLessons === 1 ? "lección" : "lecciones"}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isInstructor && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tus Cursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{createdCoursesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {createdCoursesCount === 1 ? "curso creado" : "cursos creados"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {enrollments?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  inscripciones en total
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">
              {profile?.role === "instructor" ? "Instructor" : "Estudiante"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.role === "instructor" 
                ? "Tutor/Creador" 
                : "Aprendiz"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Cursos Inscritos / Mis Cursos */}
        {!isInstructor ? (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Mis Cursos
                </CardTitle>
                <CardDescription>
                  Continúa con tus cursos en progreso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollments && enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition"
                      >
                        <h4 className="font-semibold">
                          {enrollment.courses?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrollment.courses?.description}
                        </p>
                        <Link href={`/courses/${enrollment.course_id}`}>
                          <Button variant="outline" size="sm" className="mt-3">
                            Continuar aprendiendo
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Aún no estás inscrito en ningún curso
                    </p>
                    <Link href="/courses">
                      <Button>Explorar Cursos</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Mis Cursos
                </CardTitle>
                <CardDescription>
                  Gestiona y crea tus cursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {createdCourses && createdCourses.length > 0 ? (
                  <div className="space-y-4">
                    {createdCourses.map((course: any) => (
                      <div
                        key={course.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition"
                      >
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Link href={`/admin/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </Link>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {course.status}
                          </span>
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
                      <Button>Crear Nuevo Curso</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium capitalize">
                  {profile?.role === "instructor" ? "Instructor" : "Estudiante"}
                </p>
              </div>
              <Link href="/settings" className="w-full">
                <Button variant="outline" className="w-full">
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isInstructor && (
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </Button>
                </Link>
              )}
              {isInstructor && (
                <Link href="/admin/courses/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Crear Curso
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
