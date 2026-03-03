import { createClient as createAdminClient } from "@supabase/supabase-js";
import RecursosTab from "@/components/tools/RecursosTab";
import type { ToolResource } from "@/components/tools/BibliotecaTab";

export const metadata = { title: "Recursos de Productividad" };

const RECURSOS_CATEGORIES = [
  "structural_checklist",
  "calculation_templates",
  "report_templates",
  "budget_templates",
];

async function getResources(): Promise<ToolResource[]> {
  try {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await supabase
      .from("tool_resources")
      .select("id, title, description, category, file_url, thumbnail_url, is_free")
      .eq("is_published", true)
      .in("category", RECURSOS_CATEGORIES)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RecursosPage() {
  const resources = await getResources();
  return <RecursosTab resources={resources} />;
}
