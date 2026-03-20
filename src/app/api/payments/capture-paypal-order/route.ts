import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || "PayPal authentication failed");
  }
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { orderId, externalRef, courseSlug, moduleId, isModulePurchase } =
      await req.json();

    if (!orderId || !externalRef || !courseSlug) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = getAdmin();

    // ── Profile ───────────────────────────────────────────────────────────────
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) {
      return Response.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    // ── Find the pending payment record ───────────────────────────────────────
    const { data: paymentRecord } = await admin
      .from("payments")
      .select("id, profile_id, course_id, module_position, type")
      .eq("external_ref", externalRef)
      .single();

    // Verify the record belongs to the authenticated user
    if (paymentRecord && paymentRecord.profile_id !== profile.id) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }

    // ── Capture the PayPal order ──────────────────────────────────────────────
    console.log("[paypal] capturing order:", orderId);
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": `capture-${externalRef}`,
        },
      }
    );

    const capture = await captureRes.json();
    console.log("[paypal] capture response:", JSON.stringify(capture));

    if (!captureRes.ok || capture.status !== "COMPLETED") {
      const errMsg =
        capture.details?.[0]?.description ||
        capture.message ||
        "El pago no fue completado";
      return Response.json({ error: errMsg }, { status: 400 });
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    console.log("[paypal] capture ID:", captureId);

    // ── Update payment record or create one if missing ────────────────────────
    if (paymentRecord) {
      await admin
        .from("payments")
        .update({
          mp_payment_id: captureId,
          mp_status: "approved",
          mp_status_detail: "paypal_completed",
        })
        .eq("id", paymentRecord.id);
    } else {
      // Fallback: create the record now (shouldn't normally happen)
      const { data: course } = await admin
        .from("courses")
        .select("id, title, price")
        .eq("slug", courseSlug)
        .single();

      if (course) {
        await admin.from("payments").insert({
          profile_id: profile.id,
          course_id: course.id,
          module_position: isModulePurchase ? moduleId : null,
          amount: Number(course.price),
          mp_payment_id: captureId,
          mp_status: "approved",
          mp_status_detail: "paypal_completed",
          type: isModulePurchase ? "module" : "course",
          external_ref: externalRef,
        });
      }
    }

    // ── Get course info for enrollment ────────────────────────────────────────
    const courseId = paymentRecord?.course_id;
    const { data: course } = courseId
      ? await admin.from("courses").select("id, title").eq("id", courseId).single()
      : await admin.from("courses").select("id, title").eq("slug", courseSlug).single();

    if (!course) {
      return Response.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // ── Enroll user ───────────────────────────────────────────────────────────
    if (isModulePurchase && moduleId) {
      await enrollModule(admin, profile.id, course.id, moduleId);
    } else {
      await enrollCourse(admin, profile.id, course.id);
    }

    // ── Notification ──────────────────────────────────────────────────────────
    await admin.from("notifications").insert({
      user_id: profile.id,
      title: "¡Pago confirmado!",
      body: isModulePurchase
        ? `Tu acceso al Módulo ${moduleId} de "${course.title}" está activo.`
        : `Tu acceso completo a "${course.title}" está activo.`,
      type: "info",
    });

    console.log("[paypal] enrollment done for profile:", profile.id);

    return Response.json({ status: "approved", captureId });
  } catch (err: any) {
    console.error("[paypal] capture-paypal-order error:", err);
    return Response.json(
      { error: err.message || "Error al confirmar el pago" },
      { status: 500 }
    );
  }
}

// ── Enrollment helpers (same as create-payment) ───────────────────────────────

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
