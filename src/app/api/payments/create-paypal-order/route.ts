import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// PayPal environment: use PAYPAL_ENV=production for live, otherwise sandbox
const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Currency for PayPal orders.
// - "PEN" works if your PayPal merchant account is registered in Peru.
// - "USD" works globally; set PAYPAL_EXCHANGE_RATE (e.g. 0.27) to convert PEN → USD.
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
const PAYPAL_EXCHANGE_RATE = parseFloat(process.env.PAYPAL_EXCHANGE_RATE || "1");

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
    const { courseSlug, moduleId, isModulePurchase } = await req.json();

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

    // ── Course (server-side validation — never trust client amount) ───────────
    const { data: course } = await admin
      .from("courses")
      .select("id, title, price, status")
      .eq("slug", courseSlug)
      .single();
    if (!course) {
      return Response.json({ error: "Curso no encontrado" }, { status: 404 });
    }
    if (course.status !== "published" && process.env.NODE_ENV === "production") {
      return Response.json({ error: "Curso no disponible" }, { status: 404 });
    }

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
      } else {
        validatedAmount = Number(course.price);
      }
    }

    if (!validatedAmount || validatedAmount <= 0) {
      return Response.json({ error: "Precio inválido" }, { status: 400 });
    }

    // Apply exchange rate if needed (e.g. PEN → USD)
    const paypalAmount = (validatedAmount * PAYPAL_EXCHANGE_RATE).toFixed(2);
    const externalRef = crypto.randomUUID();

    console.log("[paypal] creating order:", {
      courseSlug,
      validatedAmount,
      paypalAmount,
      currency: PAYPAL_CURRENCY,
      externalRef,
    });

    // ── Get PayPal access token ───────────────────────────────────────────────
    const accessToken = await getPayPalAccessToken();

    // ── Create PayPal order ───────────────────────────────────────────────────
    const description = isModulePurchase
      ? `Módulo ${moduleId} — ${course.title}`
      : (course.title as string);

    const siteUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SITE_URL
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": externalRef,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: externalRef,
            description,
            amount: {
              currency_code: PAYPAL_CURRENCY,
              value: paypalAmount,
            },
          },
        ],
        application_context: {
          brand_name: "Análisis Estructural",
          user_action: "PAY_NOW",
          return_url: `${siteUrl}/cursos/${courseSlug}/checkout`,
          cancel_url: `${siteUrl}/cursos/${courseSlug}/checkout`,
        },
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok) {
      console.error("[paypal] create order error:", order);
      return Response.json(
        { error: order.message || "Error al crear la orden de PayPal" },
        { status: 500 }
      );
    }

    console.log("[paypal] order created:", order.id);

    // ── Save pending payment record ───────────────────────────────────────────
    const { error: insertErr } = await admin.from("payments").insert({
      profile_id: profile.id,
      course_id: course.id,
      module_position: isModulePurchase ? moduleId : null,
      amount: validatedAmount,
      mp_payment_id: null,
      mp_status: "pending",
      mp_status_detail: "paypal_created",
      type: isModulePurchase ? "module" : "course",
      external_ref: externalRef,
    });

    if (insertErr) {
      console.error("[paypal] payment insert error:", insertErr);
      // Continue — we still return the order ID so the user can pay
    }

    return Response.json({ orderId: order.id, externalRef });
  } catch (err: any) {
    console.error("[paypal] create-paypal-order error:", err);
    return Response.json(
      { error: err.message || "Error interno al crear la orden" },
      { status: 500 }
    );
  }
}
