import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black py-20">
      <div className="mx-auto max-w-2xl bg-slate-800/80 border border-cyan-500/20 rounded-2xl p-10 shadow-lg">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p className="text-lg text-slate-300">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <Card className="p-8 bg-slate-900/80 border border-cyan-500/10">
          <form className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-cyan-400">Nombre</Label>
                <Input id="name" placeholder="Tu nombre" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-400">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-cyan-400">Asunto</Label>
              <Input id="subject" placeholder="¿En qué podemos ayudarte?" className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-cyan-400">Mensaje</Label>
              <textarea
                id="message"
                className="min-h-[150px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              Enviar Mensaje
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
