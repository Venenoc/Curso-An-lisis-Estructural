import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllTestimonialsAdmin } from "@/app/actions/testimonials";
import TestimonialsAdminClient from "@/components/admin/TestimonialsAdminClient";
import { MessageSquare } from "lucide-react";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonios</h1>
          <p className="text-slate-400 text-sm">
            Aprueba o elimina los testimonios enviados por los estudiantes
          </p>
        </div>
      </div>
      <TestimonialsAdminClient initialTestimonials={testimonials} />
    </div>
  );
}
