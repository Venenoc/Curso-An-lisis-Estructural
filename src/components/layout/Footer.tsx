import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-950/60 backdrop-blur-sm border-t border-slate-800/60 text-slate-300 w-full">
      <div className="w-full py-6 md:py-8 px-60">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 w-full text-center">
          <div>
            <h3 className="font-semibold mb-2 text-blue-400 text-sm">Plataforma</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/cursos" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Cursos
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Herramientas
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Precios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-400 text-sm">Empresa</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-400 text-sm">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacidad" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-400 text-sm">Síguenos</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-xs text-blue-100 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-blue-100 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-blue-100 hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-blue-600 pt-4 text-center w-full">
          <p className="text-xs text-blue-100">
            © 2026 Albert_Structural Academy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
