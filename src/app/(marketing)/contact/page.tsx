"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("¡Mensaje enviado correctamente!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("Error al enviar el mensaje. Intenta de nuevo.");
      }
    } catch {
      setStatus("Error de red. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40">
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-cyan-400">Nombre</Label>
                <Input id="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-400">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-cyan-400">Asunto</Label>
              <Input id="subject" value={form.subject} onChange={handleChange} placeholder="¿En qué podemos ayudarte?" className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-cyan-400">Mensaje</Label>
              <textarea
                id="message"
                value={form.message}
                onChange={handleChange}
                className="min-h-[150px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Mensaje"}
            </Button>
            {status && (
              <div className="text-center text-sm mt-2 text-cyan-300">{status}</div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
