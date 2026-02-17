import { notFound, redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { coursesCatalog } from "@/data/courses-catalog";
import CheckoutForm from "@/components/courses/CheckoutForm";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { slug } = await params;
  const { module: moduleIdParam } = await searchParams;
  const course = coursesCatalog.find((c) => c.slug === slug);

  if (!course) notFound();

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if already purchased
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(title)")
      .eq("user_id", profile.id);

    const alreadyPurchased = enrollments?.some(
      (e: any) => e.courses?.title === course.title
    );

    if (alreadyPurchased) {
      redirect("/dashboard");
    }
  }

  // Find module if purchasing individually
  const moduleId = moduleIdParam ? parseInt(moduleIdParam) : null;
  const selectedModule = moduleId
    ? course.modules?.find((m) => m.id === moduleId) || null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <CheckoutForm
          course={course}
          userEmail={user.email || ""}
          selectedModule={selectedModule}
        />
      </div>
    </div>
  );
}
