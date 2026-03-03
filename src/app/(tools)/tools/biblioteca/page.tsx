import { createClient as createAdminClient } from "@supabase/supabase-js";
import BibliotecaTab from "@/components/tools/BibliotecaTab";
import type { ToolResource } from "@/components/tools/BibliotecaTab";

export const metadata = { title: "Biblioteca Técnica" };

const BIBLIOTECA_CATEGORIES = [
  "norms_codes",
  "formula_sheets",
  "excel_templates",
  "manuals_guides",
  "manuals_details",
  "column_details",
  "structural_details",
  "example_models",
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
      .in("category", BIBLIOTECA_CATEGORIES)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function BibliotecaPage() {
  const resources = await getResources();
  return <BibliotecaTab resources={resources} />;
}
