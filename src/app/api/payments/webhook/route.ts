import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// MP always expects a 200 response to stop retrying
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment" || !data?.id) {
      return Response.json({ received: true });
    }

    const mp = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
    const paymentApi = new Payment(mp);

    // Fetch full payment details from MP
    const mpPayment = await paymentApi.get({ id: String(data.id) });

    const admin = getAdmin();

    // Try to update payment record by mp_payment_id first
    const { data: updatedRows } = await admin
      .from("payments")
      .update({
        mp_status: mpPayment.status,
        mp_status_detail: mpPayment.status_detail,
        updated_at: new Date().toISOString(),
      })
      .eq("mp_payment_id", data.id)
      .select("id");

    // If no rows updated, this may be a wallet/Yape payment where mp_payment_id
    // was null. Try finding by external_ref from the preference.
    if ((!updatedRows || updatedRows.length === 0) && mpPayment.external_reference) {
      await admin
        .from("payments")
        .update({
          mp_payment_id: data.id,
          mp_status: mpPayment.status,
          mp_status_detail: mpPayment.status_detail,
          updated_at: new Date().toISOString(),
        })
        .eq("external_ref", mpPayment.external_reference)
        .is("mp_payment_id", null);
    }

    // Only enroll on approved/authorized status
    if (mpPayment.status !== "approved" && mpPayment.status !== "authorized") {
      return Response.json({ received: true });
    }

    // Get payment record to find profile and course
    let dbPayment: any = null;

    const { data: byMpId } = await admin
      .from("payments")
      .select("id, profile_id, course_id, type, module_position, mp_status")
      .eq("mp_payment_id", data.id)
      .single();

    if (byMpId) {
      dbPayment = byMpId;
    } else if (mpPayment.external_reference) {
      // Fallback: wallet/Yape payments — find by external_ref
      const { data: byRef } = await admin
        .from("payments")
        .select("id, profile_id, course_id, type, module_position, mp_status")
        .eq("external_ref", mpPayment.external_reference)
        .single();
      dbPayment = byRef;
    }

    if (!dbPayment) {
      return Response.json({ received: true });
    }

    // Enroll (idempotent — checks for existing enrollment)
    if (dbPayment.type === "module" && dbPayment.module_position) {
      await enrollModule(
        admin,
        dbPayment.profile_id,
        dbPayment.course_id,
        dbPayment.module_position
      );
    } else if (dbPayment.type === "course") {
      await enrollCourse(admin, dbPayment.profile_id, dbPayment.course_id);
    }

    // Notify user via in-app notification
    const { data: courseRow } = await admin
      .from("courses")
      .select("title")
      .eq("id", dbPayment.course_id)
      .single();

    await admin.from("notifications").insert({
      user_id: dbPayment.profile_id,
      title: "¡Pago confirmado!",
      body: dbPayment.type === "module"
        ? `Tu acceso al Módulo ${dbPayment.module_position} de "${courseRow?.title ?? ""}" está activo.`
        : `Tu acceso completo a "${courseRow?.title ?? ""}" está activo.`,
      type: "info",
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error("[webhook]", error);
    return Response.json({ received: true }); // Always 200 so MP stops retrying
  }
}

async function enrollCourse(admin: any, profileId: string, courseId: string) {
  const { data: ex } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", profileId)
    .eq("course_id", courseId)
    .single();
  if (ex) return;
  await admin.from("enrollments").insert({
    user_id: profileId,
    course_id: courseId,
    payment_type: "one_time",
  });
}

async function enrollModule(
  admin: any,
  profileId: string,
  courseId: string,
  moduleId: number
) {
  const { data: modules } = await admin
    .from("modules")
    .select("id, title, price")
    .eq("course_id", courseId)
    .order("order");
  const mod = (modules ?? [])[moduleId - 1];
  if (!mod) return;

  const { data: ex } = await admin
    .from("module_enrollments")
    .select("id")
    .eq("user_id", profileId)
    .eq("course_id", courseId)
    .eq("module_id", moduleId)
    .single();
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
