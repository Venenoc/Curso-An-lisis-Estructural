import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function TestimonialsPage() {
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
    <div
      className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100"
      style={{
        backgroundImage: 'url(/images/Fondos%20de%20marketing/Fondo_ATm.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <main className="pt-20 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <ScrollReveal delay={0.1} className="text-center mb-16 mt-20">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-slate-800">
              Lo que dicen nuestros estudiantes
            </h1>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Miles de ingenieros han transformado su carrera con nuestros cursos de Análisis Estructural
            </p>
          </ScrollReveal>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={Math.min(index * 0.08, 0.3)} scale>
                <Card className="bg-white border-slate-800 backdrop-blur-sm transition-all h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{testimonial.image}</div>
                      <div className="flex-1">
                        <h3 className="text-black font-semibold text-lg">{testimonial.name}</h3>
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
                    <p className="text-slate-800">&ldquo;{testimonial.content}&rdquo;</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 pt-16 border-t border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "4.9/5", label: "Calificación promedio", color: "text-slate-800" },
                { value: "500+", label: "Estudiantes activos", color: "text-slate-800" },
                { value: "1,200+", label: "Reseñas positivas", color: "text-slate-800" },
                { value: "98%", label: "Recomendarían", color: "text-slate-800" },
              ].map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 0.1} className="text-center">
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-white">{stat.label}</div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
