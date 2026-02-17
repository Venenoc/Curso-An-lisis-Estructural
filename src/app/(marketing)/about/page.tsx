export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-150px)] bg-gradient-to-b from-cyan-50 via-white to-cyan-100 py-40">
      <div className="mx-auto max-w-3xl bg-white/90 border border-cyan-300/40 rounded-2xl p-10 shadow-lg">
        <h1 className="text-5xl font-extrabold mb-8 text-cyan-700 text-center">
          Sobre Nosotros
        </h1>
        <div className="prose prose-gray max-w-none text-slate-700">
          <p className="text-lg mb-6">
            Somos una plataforma dedicada a la educación y capacitación de profesionales
            en ingeniería civil.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Nuestra Misión</h2>
          <p>
            Proporcionar educación de calidad, herramientas profesionales y consultoría
            especializada para impulsar el desarrollo de ingenieros civiles en toda
            Latinoamérica.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-600">Nuestro Equipo</h2>
          <p>
            Contamos con un equipo de instructores certificados con amplia experiencia
            en análisis estructural, diseño sísmico, geotecnia y más áreas de la
            ingeniería civil.
          </p>
        </div>
      </div>
    </div>
  );
}
