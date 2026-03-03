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
    const body = await req.json();
    const {
      token,
      paymentMethodId,
      issuerId,
      installments,
      payer,
      courseSlug,
      moduleId,
      isModulePurchase,
    } = body;

    console.log("[create-payment] body received:", {
      token: token ? `${token.slice(0, 8)}...` : null,
      paymentMethodId,
      issuerId,
      installments,
      courseSlug,
      moduleId,
      isModulePurchase,
    });

    // ── Auth ─────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    console.log("[create-payment] user:", user.id);

    const admin = getAdmin();

    // ── Profile ───────────────────────────────────────────────────────────────
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (profileErr || !profile) {
      console.error("[create-payment] profile error:", profileErr);
      return Response.json({ error: "Perfil no encontrado" }, { status: 404 });
    }
    console.log("[create-payment] profile:", profile.id);

    // ── Course (server-side validation — never trust client amount) ───────────
    const { data: course, error: courseErr } = await admin
      .from("courses")
      .select("id, title, price, status")
      .eq("slug", courseSlug)
      .single();

    if (courseErr || !course) {
      console.error("[create-payment] course error:", courseErr, "slug:", courseSlug);
      return Response.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Allow draft courses in development so you can test without publishing
    if (course.status !== "published" && process.env.NODE_ENV === "production") {
      return Response.json({ error: "Curso no disponible" }, { status: 404 });
    }

    console.log("[create-payment] course:", course.id, course.title, "price:", course.price, "status:", course.status);

    // ── Validate amount from DB ───────────────────────────────────────────────
    let validatedAmount: number;
    if (isModulePurchase && moduleId) {
      const { data: modules } = await admin
        .from("modules")
        .select("id, price")
        .eq("course_id", course.id)
        .order("order");
      const mod = (modules ?? [])[moduleId - 1];
      if (!mod) {
        return Response.json({ error: "Módulo no encontrado" }, { status: 404 });
      }
      validatedAmount = Number(mod.price);
    } else {
      // Check if user is upgrading (already has some modules) → charge remaining sum
      const { data: modEnrollments } = await admin
        .from("module_enrollments")
        .select("module_id")
        .eq("user_id", profile.id)
        .eq("course_id", course.id);

      if (modEnrollments && modEnrollments.length > 0) {
        const purchasedPositions = modEnrollments.map((me: any) => Number(me.module_id));
        const { data: allModules } = await admin
          .from("modules")
          .select("price, order")
          .eq("course_id", course.id)
          .order("order");
        const remaining = (allModules ?? []).filter(
          (m: any) => !purchasedPositions.includes((m.order as number) + 1)
        );
        validatedAmount = remaining.reduce((sum: number, m: any) => sum + Number(m.price), 0);
        console.log("[create-payment] upgrade mode — remaining modules sum:", validatedAmount);
      } else {
        validatedAmount = Number(course.price);
      }
    }

    console.log("[create-payment] validatedAmount:", validatedAmount);

    if (!validatedAmount || validatedAmount <= 0) {
      return Response.json({ error: "Precio inválido: el curso tiene precio 0" }, { status: 400 });
    }

    // ── Create MercadoPago payment (direct fetch for full error visibility) ──
    const externalRef = crypto.randomUUID();

    // ── DEV MOCK MODE ─────────────────────────────────────────────────────────
    // MP Argentina sandbox requires production credentials to create valid test
    // users. Set MP_MOCK_PAYMENTS=true in .env.local to bypass MP entirely and
    // simulate an approved payment for end-to-end flow testing.
    if (process.env.MP_MOCK_PAYMENTS === "true") {
      console.log("[create-payment] MOCK MODE — simulating approved payment");
      const mockId = Date.now();

      await admin.from("payments").insert({
        profile_id: profile.id,
        course_id: course.id,
        module_position: isModulePurchase ? moduleId : null,
        amount: validatedAmount,
        mp_payment_id: mockId,
        mp_status: "approved",
        mp_status_detail: "accredited",
        type: isModulePurchase ? "module" : "course",
        external_ref: externalRef,
      });

      if (isModulePurchase) {
        await enrollModule(admin, profile.id, course.id, moduleId);
      } else {
        await enrollCourse(admin, profile.id, course.id);
      }

      await admin.from("notifications").insert({
        user_id: profile.id,
        title: "¡Pago confirmado!",
        body: isModulePurchase
          ? `Tu acceso al Módulo ${moduleId} de "${course.title}" está activo.`
          : `Tu acceso completo a "${course.title}" está activo.`,
        type: "info",
      });

      return Response.json({
        status: "approved",
        statusDetail: "accredited",
        paymentId: mockId,
      });
    }

    // ── Real MP payment ────────────────────────────────────────────────────────
    const cleanPayer = {
      ...payer,
      ...(payer?.identification?.number
        ? {}
        : { identification: undefined }),
    };

    console.log("[create-payment] payer email from frontend:", payer?.email);
    console.log("[create-payment] MP_TEST_BUYER_EMAIL override:", process.env.MP_TEST_BUYER_EMAIL ?? "(none)");

    const resolvedPayer = process.env.MP_TEST_BUYER_EMAIL
      ? { ...cleanPayer, email: process.env.MP_TEST_BUYER_EMAIL }
      : cleanPayer;

    console.log("[create-payment] resolved payer email →", resolvedPayer.email);

    const mpBody = {
      token,
      transaction_amount: validatedAmount,
      description: isModulePurchase
        ? `Módulo ${moduleId} — ${course.title}`
        : course.title,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId,
      ...(issuerId ? { issuer_id: Number(issuerId) } : {}),
      // binary_mode: true,  // desactivado temporalmente para sandbox con cuentas reales
      payer: resolvedPayer,
      external_reference: externalRef,
    };

    console.log("[create-payment] mpBody:", JSON.stringify({
      ...mpBody,
      token: token ? `${token.slice(0, 8)}...` : null,
    }));

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": externalRef,
      },
      body: JSON.stringify(mpBody),
    });

    const mpResult = await mpRes.json();
    console.log("[create-payment] MP raw response:", JSON.stringify(mpResult));

    if (!mpRes.ok) {
      return Response.json(
        { error: mpResult.message || mpResult.cause?.[0]?.description || "Error de MercadoPago" },
        { status: mpRes.status }
      );
    }

    // ── Persist payment record ────────────────────────────────────────────────
    const { error: insertErr } = await admin.from("payments").insert({
      profile_id: profile.id,
      course_id: course.id,
      module_position: isModulePurchase ? moduleId : null,
      amount: validatedAmount,
      mp_payment_id: mpResult.id,
      mp_status: mpResult.status,
      mp_status_detail: mpResult.status_detail,
      type: isModulePurchase ? "module" : "course",
      external_ref: externalRef,
    });

    if (insertErr) {
      // Log but don't throw — payment was processed, enrollment still needs to happen
      console.error("[create-payment] payments insert error:", insertErr);
    } else {
      console.log("[create-payment] payment record saved");
    }

    // ── Enroll immediately if approved ────────────────────────────────────────
    if (mpResult.status === "approved") {
      if (isModulePurchase) {
        await enrollModule(admin, profile.id, course.id, moduleId);
      } else {
        await enrollCourse(admin, profile.id, course.id);
      }
      await admin.from("notifications").insert({
        user_id: profile.id,
        title: "¡Pago confirmado!",
        body: isModulePurchase
          ? `Tu acceso al Módulo ${moduleId} de "${course.title}" está activo.`
          : `Tu acceso completo a "${course.title}" está activo.`,
        type: "info",
      });
      console.log("[create-payment] enrollment done");
    }

    return Response.json({
      status: mpResult.status,
      statusDetail: mpResult.status_detail,
      paymentId: mpResult.id,
    });
  } catch (error: any) {
    // Extract MP SDK error details
    console.error("[create-payment] CAUGHT ERROR:", error);
    console.error("[create-payment] error.message:", error?.message);
    console.error("[create-payment] error.cause:", JSON.stringify(error?.cause));

    // MP SDK wraps API errors: error.cause is an array of { code, description }
    // or error.message has the text
    const mpCause = Array.isArray(error?.cause) ? error.cause[0] : null;
    const detail =
      mpCause?.description ||
      error?.message ||
      "Error al procesar el pago";

    return Response.json({ error: detail }, { status: 500 });
  }
}

// ── Enrollment helpers ────────────────────────────────────────────────────────

async function enrollCourse(admin: any, profileId: string, courseId: string) {
  const { data: ex } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", profileId)
    .eq("course_id", courseId)
    .single();
  if (ex) return; // already enrolled

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
  if (ex) return; // already enrolled

  await admin.from("module_enrollments").insert({
    user_id: profileId,
    course_id: courseId,
    module_id: moduleId,
    module_title: mod.title,
    price: mod.price,
    payment_type: "one_time",
  });
}
