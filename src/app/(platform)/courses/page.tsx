import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = await createClient();
  const search = searchParams.search || "";

  // Obtener cursos publicados
  let query = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      price,
      thumbnail,
      status,
      created_at,
      instructor_id,
      profiles!courses_instructor_id_fkey(full_name)
    `
    )
    .eq("status", "published");

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data: courses } = await query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Catálogo de Cursos</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Aprende de los mejores instructores en Ingeniería Civil
          </p>

          {/* Search */}
          <form action="/courses" method="get" className="flex gap-2 max-w-md">
            <Input
              placeholder="Buscar cursos..."
              name="search"
              defaultValue={search}
              className="flex-1"
            />
            <Button type="submit">Buscar</Button>
          </form>
        </div>

        {/* Courses Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {course.thumbnail && (
                  <div className="w-full h-48 bg-muted">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${course.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>150 estudiantes</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Instructor: {course.profiles?.full_name}
                    </p>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full">Ver Curso</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4">No se encontraron cursos</h3>
            <p className="text-muted-foreground mb-8">
              Intenta con otros términos de búsqueda
            </p>
            <Link href="/courses">
              <Button>Ver Todos los Cursos</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
