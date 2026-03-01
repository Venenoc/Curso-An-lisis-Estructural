import { redirect } from "next/navigation";

export default function CertificadosRootPage() {
  // Redirige a dashboard o muestra un mensaje personalizado
  redirect("/dashboard");
  // Alternativamente, puedes mostrar un mensaje:
  // return <div className="text-center py-20 text-xl text-white">Selecciona un certificado para ver detalles.</div>;
}
