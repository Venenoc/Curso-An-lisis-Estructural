"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signout } from "@/app/actions/auth";
import type { User } from "@supabase/supabase-js";

interface PlatformNavbarProps {
  user: User;
}

export default function PlatformNavbar({ user }: PlatformNavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">IngeCivil Academy</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/courses"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                isActive("/courses")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Cursos
            </Link>
            <Link
              href="/tools"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                isActive("/tools") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Herramientas
            </Link>
            <Link
              href="/profile"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                isActive("/profile")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Perfil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {user.email}
          </span>
          <form action={signout}>
            <Button variant="outline" type="submit">
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
