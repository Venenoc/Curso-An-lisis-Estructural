"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login } from "@/app/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { Mail, Lock } from "lucide-react";
import "./loginform-glow.css";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/Fondologin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay para oscurecer un poco la imagen */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Texto superior izquierdo */}
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
          Desbloquea tu<br/>
          Potencial<br/>
          En la ingeniería
        </h2>
        <p className="text-blue-400 text-lg mt-3 font-semibold">
          Aprende, analiza, construye
        </p>
      </div>

      {/* Texto inferior izquierdo */}
      <div className="absolute bottom-8 right-8 z-20">
        <h2 className="text-white text-2xl font-bold leading-tight">
          Únete a miles de<br/>
          Ingenieros alrededor del mundo
        </h2>
      </div>

      {/* Main container con box transparente y borde animado */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 m-0 rounded-2xl bg-white/5 backdrop-blur-md animate-border-glow shadow-lg overflow-visible">
        {/* Bordes degradados cyan */}
        <span className="gradient-border gradient-border-top z-30" />
        <span className="gradient-border gradient-border-bottom z-30" />
        <span className="gradient-border gradient-border-left z-30" />
        <span className="gradient-border gradient-border-right z-30" />
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="text-6xl font-bold text-cyan-400">
              AS
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ANÁLISIS ESTRUCTURAL
          </h1>
          <p className="text-cyan-300 text-sm font-semibold">
            CURSOS PARA INGENIEROS
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="email"
              placeholder="Email"
              disabled={isSubmitting}
              {...register("email")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.email && (
              <p className="text-sm text-red-300 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              disabled={isSubmitting}
              {...register("password")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.password && (
              <p className="text-sm text-red-300 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Login Button and Forgot Password */}
          <div className="flex flex-col items-center pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2 rounded-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold transition-colors mb-2"
            >
              {isSubmitting ? "Ingresando..." : "INGRESAR"}
            </Button>
            <Link href="/reset-password" className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <span className="text-cyan-200 text-sm">
            ¿No tienes una cuenta?{" "}
          </span>
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
