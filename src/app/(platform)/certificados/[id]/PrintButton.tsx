"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
