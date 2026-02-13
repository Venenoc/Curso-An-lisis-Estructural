export default function AboutPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Sobre Nosotros</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Somos una plataforma dedicada a la educación y capacitación de profesionales
            en ingeniería civil.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Nuestra Misión</h2>
          <p className="text-muted-foreground">
            Proporcionar educación de calidad, herramientas profesionales y consultoría
            especializada para impulsar el desarrollo de ingenieros civiles en toda
            Latinoamérica.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nuestro Equipo</h2>
          <p className="text-muted-foreground">
            Contamos con un equipo de instructores certificados con amplia experiencia
            en análisis estructural, diseño sísmico, geotecnia y más áreas de la
            ingeniería civil.
          </p>
        </div>
      </div>
    </div>
  );
}
