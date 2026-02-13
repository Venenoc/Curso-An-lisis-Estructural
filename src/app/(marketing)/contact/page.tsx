import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
          <p className="text-lg text-muted-foreground">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <textarea
                id="message"
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <Button type="submit" className="w-full">
              Enviar Mensaje
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
