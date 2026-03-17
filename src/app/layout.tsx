import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://albertstructural.com';
const CDN = process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Albert Structural | Cursos de Análisis Estructural',
    template: '%s | Albert Structural',
  },
  description:
    'Aprende análisis estructural, métodos matriciales, elementos finitos y diseño sísmico con cursos especializados para ingenieros civiles y estudiantes.',
  keywords: [
    'análisis estructural',
    'ingeniería civil',
    'métodos matriciales',
    'elementos finitos',
    'diseño sísmico',
    'SAP2000',
    'ETABS',
    'cursos online ingeniería',
    'Albert Structural',
    'curso análisis estructural online',
  ],
  authors: [{ name: 'Albert Structural' }],
  creator: 'Albert Structural',
  publisher: 'Albert Structural',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'Albert Structural',
    title: 'Albert Structural | Cursos de Análisis Estructural',
    description:
      'Aprende análisis estructural, métodos matriciales y diseño sísmico con cursos especializados para ingenieros.',
    images: [
      {
        url: `${CDN}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Albert Structural — Cursos de Análisis Estructural',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albert Structural | Cursos de Análisis Estructural',
    description:
      'Cursos especializados en análisis estructural para ingenieros civiles y estudiantes.',
    images: [`${CDN}/images/og-image.jpg`],
    creator: '@Albert_Structural',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${orbitron.variable}`}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
