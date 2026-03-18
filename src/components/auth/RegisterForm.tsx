"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signup } from "@/app/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { Mail, Lock, User, UserCircle } from "lucide-react";
import "./loginform-glow.css";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const role = watch("role");
  const instructorCode = watch("instructorCode");

  async function onSubmit(data: RegisterInput) {
    setError(null);
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);
    if (data.role === "instructor") {
      formData.append("instructorCode", data.instructorCode || "");
    }

    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-y-auto sm:overflow-hidden py-4 sm:py-0"
      style={{
        backgroundImage: `url('/images/FondoAut/FondoReg.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay para oscurecer un poco la imagen */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Texto superior izquierdo */}
      <motion.div
        className="absolute top-8 left-8 z-20 hidden lg:block"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
          Únete a la<br/>
          Comunidad<br/>
          De Ingenieros
        </h2>
        <p className="text-blue-400 text-lg mt-3 font-semibold">
          Crea tu cuenta y comienza
        </p>
      </motion.div>

      {/* Texto inferior derecho */}
      <motion.div
        className="absolute bottom-8 right-24 z-20 hidden lg:block"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <h2 className="text-white text-2xl font-bold leading-tight">
          La mejor manera de aprender<br/>
          Es enseñando
        </h2>
      </motion.div>

      {/* Main container con box transparente y borde animado */}
      <motion.div
        className="relative z-10 w-full max-w-[90vw] sm:max-w-md px-4 sm:px-6 py-6 sm:py-12 my-auto rounded-2xl bg-white/5 backdrop-blur-md animate-border-glow shadow-lg overflow-visible"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Bordes degradados cyan */}
        <span className="gradient-border gradient-border-top z-30" />
        <span className="gradient-border gradient-border-bottom z-30" />
        <span className="gradient-border gradient-border-left z-30" />
        <span className="gradient-border gradient-border-right z-30" />

        {/* Logo and Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              @Albert_Structural
            </div>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-cyan-400 mb-1 sm:mb-2">
            CREAR CUENTA
          </h1>
          <p className="text-white text-xs sm:text-sm font-semibold">
            COMPLETA TUS DATOS
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Full Name Input */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="fullName"
              placeholder="Nombre completo"
              disabled={isSubmitting}
              {...register("fullName")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.fullName && (
              <p className="text-sm text-red-300 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              disabled={isSubmitting}
              {...register("email")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.email && (
              <p className="text-sm text-red-300 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <UserCircle className="w-5 h-5 text-cyan-300" />
              <span className="text-cyan-200 text-sm font-semibold">¿Eres estudiante o instructor?</span>
            </div>
            <div className="flex gap-4 justify-center">
              <label className="flex items-center gap-2 cursor-pointer bg-cyan-900/30 border border-cyan-500/50 rounded-full px-4 py-2 hover:bg-cyan-900/50 transition-colors">
                <input
                  type="radio"
                  value="student"
                  disabled={isSubmitting}
                  className="w-4 h-4 accent-cyan-400"
                  {...register("role")}
                />
                <span className="text-white text-sm">Estudiante</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-cyan-900/30 border border-cyan-500/50 rounded-full px-4 py-2 hover:bg-cyan-900/50 transition-colors">
                <input
                  type="radio"
                  value="instructor"
                  disabled={isSubmitting}
                  className="w-4 h-4 accent-cyan-400"
                  {...register("role")}
                />
                <span className="text-white text-sm">Instructor</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-sm text-red-300 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Código Instructor (solo si selecciona instructor) */}
          {role === "instructor" && (
            <div className="relative">
              <Input
                id="instructorCode"
                placeholder="Código de instructor"
                disabled={isSubmitting}
                {...register("instructorCode")}
                className="pl-4 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              {errors.instructorCode && (
                <p className="text-sm text-red-300 mt-1">{errors.instructorCode.message}</p>
              )}
            </div>
          )}
          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="password"
              type="password"
              placeholder="Contraseña"
              disabled={isSubmitting}
              {...register("password")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.password && (
              <p className="text-sm text-red-300 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmar contraseña"
              disabled={isSubmitting}
              {...register("confirmPassword")}
              className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-300 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Register Button */}
          <div className="flex flex-col items-center pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 rounded-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold transition-colors"
            >
              {isSubmitting ? "Creando cuenta..." : "REGISTRARSE"}
            </Button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-cyan-200 text-sm">
            ¿Ya tienes una cuenta?{" "}
          </span>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors">
            Inicia sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
