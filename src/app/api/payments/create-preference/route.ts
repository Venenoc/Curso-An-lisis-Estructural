import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseSlug, moduleId, isModulePurchase } = body;

    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = getAdmin();

    // ── Profile ─────────────────────────────────────────────────────────────
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) {
      return Response.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    // ── Course ──────────────────────────────────────────────────────────────
    const { data: course } = await admin
      .from("courses")
      .select("id, title, price, slug, status")
      .eq("slug", courseSlug)
      .single();
    if (!course) {
      return Response.json({ error: "Curso no encontrado" }, { status: 404 });
    }
    if (
      course.status !== "published" &&
      process.env.NODE_ENV === "production"
    ) {
      return Response.json({ error: "Curso no disponible" }, { status: 404 });
    }

    // ── Validate amount ─────────────────────────────────────────────────────
    let validatedAmount: number;
    let itemTitle: string;

    if (isModulePurchase && moduleId) {
      const { data: modules } = await admin
        .from("modules")
        .select("id, title, price")
        .eq("course_id", course.id)
        .order("order");
      const mod = (modules ?? [])[moduleId - 1];
      if (!mod) {
        return Response.json(
          { error: "Módulo no encontrado" },
          { status: 404 },
        );
      }
      validatedAmount = Number(mod.price);
      itemTitle = `Módulo ${moduleId} — ${course.title}`;
    } else {
      const { data: modEnrollments } = await admin
        .from("module_enrollments")
        .select("module_id")
        .eq("user_id", profile.id)
        .eq("course_id", course.id);

      if (modEnrollments && modEnrollments.length > 0) {
        const purchasedPositions = modEnrollments.map((me: any) =>
          Number(me.module_id),
        );
        const { data: allModules } = await admin
          .from("modules")
          .select("price, order")
          .eq("course_id", course.id)
          .order("order");
        const remaining = (allModules ?? []).filter(
          (m: any) =>
            !purchasedPositions.includes((m.order as number) + 1),
        );
        validatedAmount = remaining.reduce(
          (sum: number, m: any) => sum + Number(m.price),
          0,
        );
      } else {
        validatedAmount = Number(course.price);
      }
      itemTitle = course.title as string;
    }

    if (!validatedAmount || validatedAmount <= 0) {
      return Response.json(
        { error: "Precio inválido" },
        { status: 400 },
      );
    }

    // ── Create external reference ───────────────────────────────────────────
    const externalRef = crypto.randomUUID();

    // ── Base URL for redirect ───────────────────────────────────────────────
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/[^/]*$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const returnUrl = `${origin}/checkout/${course.slug}`;

    // ── Create MercadoPago preference ───────────────────────────────────────
    const preferenceBody = {
      items: [
        {
          title: itemTitle,
          unit_price: validatedAmount,
          quantity: 1,
          currency_id: "PEN",
        },
      ],
      payer: { email: user.email },
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl,
      },
      auto_return: "approved",
      external_reference: externalRef,
      notification_url: `${origin}/api/payments/webhook`,
    };

    const mpRes = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferenceBody),
      },
    );

    const mpResult = await mpRes.json();

    if (!mpRes.ok) {
      console.error("[create-preference] MP error:", mpResult);
      return Response.json(
        {
          error:
            mpResult.message ||
            mpResult.cause?.[0]?.description ||
            "Error al crear preferencia",
        },
        { status: mpRes.status },
      );
    }

    // ── Save pending payment record ─────────────────────────────────────────
    await admin.from("payments").insert({
      profile_id: profile.id,
      course_id: course.id,
      module_position: isModulePurchase ? moduleId : null,
      amount: validatedAmount,
      mp_payment_id: null,
      mp_status: "pending_wallet",
      mp_status_detail: "preference_created",
      type: isModulePurchase ? "module" : "course",
      external_ref: externalRef,
    });

    return Response.json({
      preferenceId: mpResult.id,
      initPoint: mpResult.init_point,
    });
  } catch (error: any) {
    console.error("[create-preference]", error);
    return Response.json(
      { error: error?.message || "Error interno" },
      { status: 500 },
    );
  }
}
