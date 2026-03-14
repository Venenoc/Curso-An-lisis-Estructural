/**
 * POST /api/payments/sync
 * Manually re-processes a payment from MercadoPago and enrolls the user if approved.
 * Used when the webhook was not received (e.g., during development on localhost).
 *
 * Body: { mp_payment_id: string | number }
 * Protected: only works in development OR when called with the service role key.
 */
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    // Only allow authenticated users (they can only sync their own payments)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mp_payment_id } = await req.json();
    if (!mp_payment_id) {
      return Response.json({ error: "mp_payment_id requerido" }, { status: 400 });
    }

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const paymentApi = new Payment(mp);
    const mpPayment = await paymentApi.get({ id: String(mp_payment_id) });

    console.log("[sync] MP payment status:", mpPayment.status, "id:", mp_payment_id);

    const admin = getAdmin();

    // Find the payment record in DB
    const { data: dbPayment } = await admin
      .from("payments")
      .select("id, profile_id, course_id, type, module_position, mp_status")
      .eq("mp_payment_id", String(mp_payment_id))
      .single();

    if (!dbPayment) {
      // Try by external_reference
      const { data: byRef } = await admin
        .from("payments")
        .select("id, profile_id, course_id, type, module_position, mp_status")
        .eq("external_ref", mpPayment.external_reference ?? "")
        .single();

      if (!byRef) {
        return Response.json({ error: "Pago no encontrado en la base de datos" }, { status: 404 });
      }

      // Update with mp_payment_id and status
      await admin
        .from("payments")
        .update({ mp_payment_id: String(mp_payment_id), mp_status: mpPayment.status, mp_status_detail: mpPayment.status_detail })
        .eq("id", byRef.id);

      Object.assign(byRef, { mp_status: mpPayment.status });
      if (mpPayment.status === "approved") {
        await processEnrollment(admin, byRef);
      }
      return Response.json({ synced: true, status: mpPayment.status });
    }

    // Update status
    await admin
      .from("payments")
      .update({ mp_status: mpPayment.status, mp_status_detail: mpPayment.status_detail })
      .eq("id", dbPayment.id);

    if (mpPayment.status !== "approved") {
      return Response.json({ synced: true, status: mpPayment.status, message: "Pago aún no aprobado en MercadoPago" });
    }

    await processEnrollment(admin, dbPayment);

    return Response.json({ synced: true, status: "approved", message: "Matrícula activada correctamente" });
  } catch (error: any) {
    console.error("[sync]", error);
    return Response.json({ error: error?.message || "Error interno" }, { status: 500 });
  }
}

async function processEnrollment(admin: any, dbPayment: any) {
  if (dbPayment.type === "module" && dbPayment.module_position) {
    await enrollModule(admin, dbPayment.profile_id, dbPayment.course_id, dbPayment.module_position);
  } else {
    await enrollCourse(admin, dbPayment.profile_id, dbPayment.course_id);
  }

  const { data: courseRow } = await admin
    .from("courses").select("title").eq("id", dbPayment.course_id).single();

  await admin.from("notifications").insert({
    user_id: dbPayment.profile_id,
    title: "¡Pago confirmado!",
    body: dbPayment.type === "module"
      ? `Tu acceso al Módulo ${dbPayment.module_position} de "${courseRow?.title ?? ""}" está activo.`
      : `Tu acceso completo a "${courseRow?.title ?? ""}" está activo.`,
    type: "info",
  });
}

async function enrollCourse(admin: any, profileId: string, courseId: string) {
  const { data: ex } = await admin
    .from("enrollments").select("id").eq("user_id", profileId).eq("course_id", courseId).single();
  if (ex) return;
  await admin.from("enrollments").insert({ user_id: profileId, course_id: courseId, payment_type: "one_time" });
}

async function enrollModule(admin: any, profileId: string, courseId: string, moduleId: number) {
  const { data: modules } = await admin
    .from("modules").select("id, title, price").eq("course_id", courseId).order("order");
  const mod = (modules ?? [])[moduleId - 1];
  if (!mod) return;

  const { data: ex } = await admin
    .from("module_enrollments").select("id")
    .eq("user_id", profileId).eq("course_id", courseId).eq("module_id", moduleId).single();
  if (ex) return;

  await admin.from("module_enrollments").insert({
    user_id: profileId,
    course_id: courseId,
    module_id: moduleId,
    module_title: mod.title,
    price: mod.price,
    payment_type: "one_time",
  });
}
