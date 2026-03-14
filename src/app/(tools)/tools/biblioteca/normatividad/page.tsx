import { Search, BookOpen, ExternalLink, Download } from "lucide-react";

export const metadata = { title: "Normas y Códigos" };

const NORMS = [
  {
    id: "n1",
    title: "ACI 318-19",
    description: "Building Code Requirements for Structural Concrete and Commentary.",
    image: "/images/Herramientas/Librería%20Teécnica/1.Normativa.jpg",
  },
  {
    id: "n2",
    title: "ASCE 7-22",
    description: "Minimum Design Loads for Buildings and Other Structures.",
    image: "/images/Herramientas/Librería%20Teécnica/2.Manuales%20y%20Guias.jpg",
  },
  {
    id: "n3",
    title: "Eurocode 2",
    description: "EN1992-1-1: Design of concrete structures.",
    image: "/images/Herramientas/Librería%20Teécnica/3.Tablas%20y%20Formularios.jpg",
  },
  {
    id: "n4",
    title: "IS 456:2000",
    description: "Indian Standard - Code of Practice for Plain and Reinforced Concrete.",
    image: "/images/Herramientas/Librería%20Teécnica/4.Plantillas%20Excel.jpg",
  },
  {
    id: "n5",
    title: "E.060:2017",
    description: "Norma Técnica Peruana para concreto armado.",
    image: "/images/Herramientas/Librería%20Teécnica/5.Detalles%20estructurales.jpg",
  },
  {
    id: "n6",
    title: "E.030:2022",
    description: "Diseño Sismorresistente - Reglamento Nacional de Edificaciones.",
    image: "/images/Herramientas/Librería%20Teécnica/6.Ejemplo%20de%20modelos.jpg",
  },
];

export default function NormatividadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <BookOpen className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-slate-700">Norms &amp; Codes</h1>
            <p className="mt-1 text-slate-500">
              Building codes and regulations for structural analysis and design applicable to various regions.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search technical library..."
            disabled
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-3">
          <h2 className="text-2xl font-medium text-slate-700">Categories</h2>
          <p className="mt-4 text-sm font-semibold text-blue-700">Filters:</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>North America</li>
            <li>Europe</li>
            <li>Asia</li>
            <li>Peru</li>
            <li>Earthquake</li>
            <li>Concrete Design</li>
            <li>Steel Design</li>
            <li>Seismic</li>
          </ul>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-2xl font-medium text-slate-700">Popular</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>ACI 318-19</li>
              <li>Earthquake Design</li>
              <li>E.030:2022</li>
              <li>Merah Cipas</li>
            </ul>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-600">Related:</h3>
            <ul className="mt-3 space-y-2 text-sm text-blue-700">
              <li>Tables &amp; Fórmulas</li>
              <li>Technical Manuals</li>
              <li>Example Models</li>
            </ul>
          </div>
        </aside>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:col-span-9">
          {NORMS.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-700">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-blue-700">
                  View Details
                </button>
                <button className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-blue-700">
                  Download PDF
                </button>
                <button className="rounded-md bg-slate-100 p-2 text-blue-700">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-700">Normative Pack Download</h3>
              <button className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                <Download className="h-4 w-4" />
                Descargar paquete
              </button>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
