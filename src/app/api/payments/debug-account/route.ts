// TEMPORARY — solo para desarrollo. Eliminar antes de producción.
export async function GET() {
  const testToken = process.env.MP_ACCESS_TOKEN;
  if (!testToken) {
    return Response.json({ error: "MP_ACCESS_TOKEN no configurado" }, { status: 400 });
  }

  const res = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${testToken}` },
  });

  const data = await res.json();

  return Response.json({
    http_status: res.status,
    token_prefix: testToken.slice(0, 12) + "...",
    raw: data,
  });
}
