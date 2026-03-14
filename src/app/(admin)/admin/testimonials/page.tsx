import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllTestimonialsAdmin } from "@/app/actions/testimonials";
import TestimonialsAdminClient from "@/components/admin/TestimonialsAdminClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export const metadata = { title: "Testimonios | Admin" };

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "instructor") redirect("/dashboard");

  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: "url('/images/Fondos%20de%20marketing/Fondo_ATm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
              <h1 className="text-3xl font-bold text-white">Testimonios</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Aprueba o elimina los testimonios enviados por los estudiantes
            </p>
          </div>
          <Link href="/admin/courses">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Admin
            </Button>
          </Link>
        </div>
        <TestimonialsAdminClient initialTestimonials={testimonials} />
      </div>
    </div>
  );
}
