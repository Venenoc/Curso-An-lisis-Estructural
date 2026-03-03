"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, BookOpen, Monitor, Bot, FolderDown, House } from "lucide-react";
import "./tools-style.css";

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
    <nav className="tools-nav-outer sticky top-0 z-30">
      <div className="tools-nav-bar max-w-7xl mx-auto">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <Link
            href="/dashboard"
            className="tools-tab tools-tab-icon"
            title="Ir al Dashboard"
          >
            <House className="w-4 h-4 shrink-0" />
          </Link>
          <div className="w-px h-6 bg-white/20 shrink-0 mx-1" />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`tools-tab${isActive ? " tools-tab-active" : ""}`}
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
