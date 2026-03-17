// URL base del CDN (Cloudflare R2). Usada para todos los assets estáticos
// que antes estaban en la carpeta /public.
// Definir NEXT_PUBLIC_CF_R2_PUBLIC_URL en .env.local y en Vercel.
export const CDN = process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL ?? "";
