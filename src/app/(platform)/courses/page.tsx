import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Star } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
              Nuestros Cursos
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Elige entre nuestros cursos especializados en Análisis Estructural, 
              impartidos por expertos de la industria
            </p>
            
            {/* Search */}
            <form action="/courses" method="get" className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Buscar cursos..."
                name="search"
                defaultValue={search}
                className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 flex-1"
              />
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6">
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="relative py-16 lg:py-24 bg-black flex-1">
        <div className="container mx-auto px-4">
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:shadow-xl hover:shadow-cyan-500/20">
                  {course.thumbnail ? (
                    <div className="h-40 bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">Curso</span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="text-slate-400 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-slate-300 text-sm">
                      <span className="font-semibold">Instructor: {course.profiles?.full_name || 'Sin asignar'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>4.8 (150 estudiantes)</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-white">${course.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                          Ver Curso
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-white mb-4">No se encontraron cursos</h3>
              <p className="text-slate-400 mb-8">
                Intenta con otros términos de búsqueda o vuelve más tarde
              </p>
              <Link href="/courses">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Ver Todos los Cursos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
