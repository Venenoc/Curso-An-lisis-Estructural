import { getUser } from "@/app/actions/auth";
import Navbar from "@/components/layout/Navbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function TestimonialsPage() {
  const user = await getUser();
  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Ingeniero Estructural",
      content: "Los cursos de Análisis Estructural me ayudaron a dominar SAP2000 y conseguir un mejor puesto. Contenido excelente y muy práctico.",
      rating: 5,
      image: "👨‍💼"
    },
    {
      name: "María González",
      role: "Estudiante de Ingeniería Civil",
      content: "Excelente plataforma para aprender. Los instructores explican de manera clara y los ejercicios son muy útiles para la práctica.",
      rating: 5,
      image: "👩‍🎓"
    },
    {
      name: "José Ramírez",
      role: "Ingeniero Civil Senior",
      content: "Después de 15 años en la industria, estos cursos me ayudaron a actualizar mis conocimientos en métodos modernos de análisis.",
      rating: 5,
      image: "👨‍💻"
    },
    {
      name: "Ana Torres",
      role: "Ingeniera Estructural",
      content: "La calidad del contenido es excepcional. He aprendido más aquí que en muchos cursos presenciales. Totalmente recomendado.",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "Luis Herrera",
      role: "Estudiante de Posgrado",
      content: "Perfecto para complementar mis estudios de maestría. Los temas están muy bien explicados y actualizados.",
      rating: 5,
      image: "👨‍🎓"
    },
    {
      name: "Patricia Silva",
      role: "Ingeniera de Proyectos",
      content: "Los cursos de análisis dinámico y sísmico son increíbles. Ahora puedo modelar estructuras complejas con confianza.",
      rating: 5,
      image: "👩‍💻"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Navbar user={user} />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Lo que dicen nuestros estudiantes
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Miles de ingenieros han transformado su carrera con nuestros cursos de Análisis Estructural
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{testimonial.name}</h3>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                      <div className="flex gap-1 mt-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 pt-16 border-t border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">4.9/5</div>
                <div className="text-slate-400">Calificación promedio</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
                <div className="text-slate-400">Estudiantes activos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">1,200+</div>
                <div className="text-slate-400">Reseñas positivas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
                <div className="text-slate-400">Recomendarían</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
