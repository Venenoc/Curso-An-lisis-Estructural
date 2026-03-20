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

export default function CursosFreeMarketingPage() {
  return <CursosFreeContent />;
}
