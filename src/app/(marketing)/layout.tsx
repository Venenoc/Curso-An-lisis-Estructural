import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import HomeNavbar from "@/components/layout/HomeNavbar";
import Footer from "@/components/layout/Footer";
import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Plataforma de cursos especializados en analisis estructural. Aprende metodos matriciales, elementos finitos y diseno sismico con @Albert_Structural.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'Albert Structural | Formacion en Analisis Estructural',
    description: 'Unete a cientos de ingenieros que dominan el analisis estructural con cursos especializados online.',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Albert Structural',
  description: 'Plataforma de cursos especializados en analisis estructural para ingenieros civiles y estudiantes.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://albertstructural.com',
  sameAs: ['https://www.instagram.com/albert_structural'],
  teaches: [
    'Analisis Estructural',
    'Metodos Matriciales',
    'Elementos Finitos',
    'Diseno Sismico',
    'SAP2000',
    'ETABS',
  ],
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  let profileAvatarUrl: string | null = null;
  let profileName: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("user_id", user.id)
      .single();
    profileAvatarUrl = profile?.avatar_url || null;
    profileName = profile?.full_name || null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={organizationSchema} />
      <HomeNavbar user={user} profileAvatarUrl={profileAvatarUrl} profileName={profileName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
