import type { Metadata } from "next";
import CursosFreeContent from "@/components/cursos-free/CursosFreeContent";

export const metadata: Metadata = {
  title: "Cursos Gratuitos de Análisis Estructural | Albert Structural",
  description: "Aprende análisis estructural gratis con nuestros videos de YouTube: SAP2000, ETABS, método matricial, diseño sísmico y más.",
  alternates: { canonical: "/cursos_free" },
  openGraph: {
    url: "/cursos_free",
    title: "Cursos Gratuitos | Albert Structural",
    description: "Recursos gratuitos de análisis estructural disponibles en YouTube.",
  },
};

async function getPlaylistThumbnail(playlistId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.thumbnail_url as string) ?? null;
  } catch { return null; }
}

export default async function CursosFreeMarketingPage() {
  const thumbnail = await getPlaylistThumbnail("PLVALQwAjVSqVPjCpY-ybviIaQoqMqy0jF");
  return <CursosFreeContent courseThumbnails={{ "1": thumbnail ?? "" }} />;
}
