export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-150px)] bg-gradient-to-b from-slate-950 via-slate-900 to-black py-40">
      <div className="mx-auto max-w-3xl bg-slate-800/80 border border-cyan-500/20 rounded-2xl p-10 shadow-lg">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent text-center">
          Sobre Nosotros
        </h1>
        <div className="prose prose-gray max-w-none text-slate-300">
          <p className="text-lg mb-6">
            Somos una plataforma dedicada a la educación y capacitación de profesionales
            en ingeniería civil.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">Nuestra Misión</h2>
          <p>
            Proporcionar educación de calidad, herramientas profesionales y consultoría
            especializada para impulsar el desarrollo de ingenieros civiles en toda
            Latinoamérica.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400">Nuestro Equipo</h2>
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
