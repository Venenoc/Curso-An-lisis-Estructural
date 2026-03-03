// TEMPORARY — solo para desarrollo. Eliminar antes de producción.
// Crea un usuario de prueba usando el token de producción (APP_USR-...)
// que es el requerido por MP para crear test users válidos.
export async function GET() {
  const prodToken = process.env.MP_PROD_ACCESS_TOKEN;
  if (!prodToken) {
    return Response.json(
      { error: "Agrega MP_PROD_ACCESS_TOKEN=APP_USR-... en .env.local" },
      { status: 400 }
    );
  }

  // Auto-detect site_id desde el token de producción
  const meRes = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${prodToken}` },
  });
  const me = await meRes.json();
  const siteId: string = me.site_id ?? "MLA";

  const res = await fetch("https://api.mercadopago.com/users/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${prodToken}`,
    },
    body: JSON.stringify({
      site_id: siteId,
      description: "Buyer test user",
    }),
  });

  const data = await res.json();

  // Si MP no devuelve email en la creación, lo obtenemos del perfil del usuario
  let email = data.email;
  if (!email && data.id) {
    const userRes = await fetch(`https://api.mercadopago.com/users/${data.id}`, {
      headers: { Authorization: `Bearer ${prodToken}` },
    });
    const userData = await userRes.json();
    email = userData.email;
  }

  return Response.json({
    seller_site_id: siteId,
    status: res.status,
    ...data,
    email,
    password: data.password,
    ...(email
      ? { next_step: `Agrega en .env.local: MP_TEST_BUYER_EMAIL=${email}` }
      : { next_step: "No se pudo obtener el email. Intenta de nuevo." }),
  });
}
