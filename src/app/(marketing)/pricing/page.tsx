import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precios y Planes',
  description: 'Accede a todos los cursos de analisis estructural con planes flexibles. Compra cursos individuales o modulos segun tus necesidades y presupuesto.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    url: '/pricing',
    title: 'Precios | Albert Structural',
    description: 'Planes flexibles para acceder a los mejores cursos de analisis estructural. Certificado incluido.',
  },
};

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function PricingPage() {
  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black relative"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/Fondos%20de%20marketing/Fondo_cm.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
      {/* Hero Section */}
      <section className="relative z-10 pt-24 lg:pt-20 pb-20 lg:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal delay={0.1} className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-black rounded-full px-4 py-2 mt-10 mb-10">
              <span className="text-slate-800 text-sm font-medium">
                Planes y Precios para tu crecimiento profesional
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-10 bg-gradient-to-r from-black via-slate-600 to-cyan-400 bg-clip-text text-transparent">
              Nuestros Precios
            </h1>
            <p className="text-xl text-slate-800 mb-10 max-w-2xl mx-auto leading-relaxed">
              Elige el plan que mejor se adapte a tus necesidades y accede a todos los cursos, herramientas y beneficios exclusivos.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="relative z-10 py-16 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <ScrollReveal delay={0} scale>
              <Card>
                <CardHeader>
                  <CardTitle>Gratuito</CardTitle>
                  <CardDescription>Para comenzar</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Acceso a cursos gratuitos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Acceso a la comunidad x3 días</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Acceso a herramientas y recursos x3 días</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full">
                      Comenzar Gratis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.12} scale>
              <Card className="border-primary relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle>Mensual</CardTitle>
                  <CardDescription>Acceso completo</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>01 Curso por mes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Certificados profesionales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Herramientas y recursos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Comunidad incluida</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Soporte prioritario</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full">
                      Suscribirse
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.24} scale>
              <Card>
                <CardHeader>
                  <CardTitle>Anual</CardTitle>
                  <CardDescription>Ahorra 50%</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$180</span>
                    <span className="text-muted-foreground">/año</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    $15.00/mes facturado anualmente
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Todo lo de Mensual</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Todos los cursos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Ahorro del 50%</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Consultorías con descuento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>Acceso anticipado a cursos</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full">
                      Suscribirse
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
