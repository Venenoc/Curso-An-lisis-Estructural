"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, BookOpen, Monitor, Bot, FolderDown } from "lucide-react";

const tabs = [
  {
    label: "Herramientas de Cálculo",
    href: "/tools/calculos",
    icon: Calculator,
  },
  {
    label: "Biblioteca Técnica",
    href: "/tools/biblioteca",
    icon: BookOpen,
  },
  {
    label: "Simuladores Visuales",
    href: "/tools/simuladores",
    icon: Monitor,
  },
  {
    label: "Asistente IA",
    href: "/tools/asistente",
    icon: Bot,
  },
  {
    label: "Recursos",
    href: "/tools/recursos",
    icon: FolderDown,
  },
];

export default function ToolsNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
