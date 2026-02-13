import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Planes y Precios</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades de aprendizaje
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
                <span>Certificados básicos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Foros de la comunidad</span>
              </li>
            </ul>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full">
                Comenzar Gratis
              </Button>
            </Link>
          </CardContent>
        </Card>

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
                <span>Todos los cursos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Certificados profesionales</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Herramientas incluidas</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Anual</CardTitle>
            <CardDescription>Ahorra 30%</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$249</span>
              <span className="text-muted-foreground">/año</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              $20.75/mes facturado anualmente
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
                <span>Ahorro del 30%</span>
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
      </div>
    </div>
  );
}
