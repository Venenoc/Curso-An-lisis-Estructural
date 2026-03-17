import { notFound, redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import CheckoutForm from "@/components/courses/CheckoutForm";
import type { CatalogCourse } from "@/types/database.types";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    module?: string;
    collection_status?: string;
    payment_id?: string;
    external_reference?: string;
    status?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    module: moduleIdParam,
    collection_status,
    payment_id,
    external_reference,
    status: walletStatus,
  } = await searchParams;
  const moduleId = moduleIdParam ? parseInt(moduleIdParam, 10) : null;

  // ── Admin client (single instance for all queries) ────────────────────────────
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── Fetch course from Supabase ────────────────────────────────────────────────
  const { data: dbCourse } = await supabaseAdmin
    .from("courses")
    .select("id, slug, title, description, price, gradient, level, total_duration, total_lessons, status")
    .eq("slug", slug)
    .single();

  if (!dbCourse || dbCourse.status !== "published") notFound();

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const user = await getUser();
  if (!user) {
    const returnTo = moduleId ? `/checkout/${slug}?module=${moduleId}` : `/checkout/${slug}`;
    redirect(`/login?redirectTo=${returnTo}`);
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // ── Redirect if user already has full course enrollment ───────────────────────
  if (profile) {
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("course_id", dbCourse.id)
      .single();
    if (existingEnrollment) redirect("/dashboard");
  }

  // ── Fetch all modules for this course from Supabase ───────────────────────────
  const { data: allDbModules } = await supabaseAdmin
    .from("modules")
    .select("id, title, price, order")
    .eq("course_id", dbCourse.id)
    .order("order");

  // ── Fetch which module positions the user has already purchased ───────────────
  let purchasedModulePositions: number[] = [];
  if (profile) {
    const { data: modEnrollments } = await supabaseAdmin
      .from("module_enrollments")
      .select("module_id")
      .eq("user_id", profile.id)
      .eq("course_id", dbCourse.id);
    purchasedModulePositions = (modEnrollments || []).map((me: any) => Number(me.module_id));
  }

  // ── Single module purchase (?module=N) ────────────────────────────────────────
  let selectedModule = null;
  if (moduleId) {
    // Already owns this module → send to classroom
    if (purchasedModulePositions.includes(moduleId)) {
      redirect(`/classroom/${slug}?module=${moduleId}`);
    }

    const dbMod = (allDbModules || [])[moduleId - 1] ?? null;
    if (!dbMod) notFound();

    // Count lessons via chapters → lessons
    const { data: chapterRows } = await supabaseAdmin
      .from("chapters")
      .select("id")
      .eq("module_id", dbMod.id);

    let lessonCount = 0;
    if (chapterRows && chapterRows.length > 0) {
      const chapterIds = chapterRows.map((ch: any) => ch.id as string);
      const { count } = await supabaseAdmin
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .in("chapter_uuid", chapterIds);
      lessonCount = count || 0;
    }

    selectedModule = {
      id: moduleId,
      title: dbMod.title as string,
      description: "",
      price: Number(dbMod.price) || 0,
      lessonsCount: lessonCount,
      duration: "",
      chapters: [],
    };
  }

  // ── Full course purchase: compute remaining modules + effective price ──────────
  let alreadyOwnedModules: { id: number; title: string }[] = [];
  let remainingModules: { id: number; title: string; price: number }[] = [];
  let effectivePrice = Number(dbCourse.price);

  if (!moduleId && purchasedModulePositions.length > 0) {
    const mods = allDbModules || [];
    const allPositions = mods.map((m: any) => (m.order as number) + 1);

    // User already owns everything → send to dashboard
    const ownsAll = allPositions.length > 0 && allPositions.every((pos: number) => purchasedModulePositions.includes(pos));
    if (ownsAll) redirect("/dashboard");

    alreadyOwnedModules = mods
      .filter((m: any) => purchasedModulePositions.includes((m.order as number) + 1))
      .map((m: any) => ({ id: (m.order as number) + 1, title: m.title as string }));

    remainingModules = mods
      .filter((m: any) => !purchasedModulePositions.includes((m.order as number) + 1))
      .map((m: any) => ({
        id: (m.order as number) + 1,
        title: m.title as string,
        price: Number(m.price) || 0,
      }));

    // Effective price = sum of remaining module prices (no full-course discount)
    effectivePrice = remainingModules.reduce((sum, m) => sum + m.price, 0);
  }

  // ── Build CatalogCourse shape for CheckoutForm (from Supabase) ──────────────
  const course: CatalogCourse = {
    slug: dbCourse.slug as string,
    title: dbCourse.title as string,
    description: (dbCourse.description as string) || "",
    price: Number(dbCourse.price),
    gradient: (dbCourse.gradient as string) || "from-cyan-500 to-blue-600",
    level: ((dbCourse.level as string) || "Principiante") as CatalogCourse["level"],
    lessonsCount: (dbCourse.total_lessons as number) || 0,
    duration: (dbCourse.total_duration as string) || "",
    modules: [],
    inDb: true,
  };

  // ── Build wallet return info (if coming back from MP redirect) ──────────────
  const resolvedWalletStatus = collection_status || walletStatus;
  const walletReturn = resolvedWalletStatus
    ? {
        status: resolvedWalletStatus,
        paymentId: payment_id || "",
        externalRef: external_reference || "",
      }
    : null;

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <CheckoutForm
          course={course}
          userEmail={user.email || ""}
          selectedModule={selectedModule}
          alreadyOwnedModules={alreadyOwnedModules}
          remainingModules={remainingModules}
          effectivePrice={effectivePrice}
          walletReturn={walletReturn}
        />
      </div>
    </div>
  );
}
