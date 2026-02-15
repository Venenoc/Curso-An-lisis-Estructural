"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle2,
  Lock,
  BookOpen,
  Clock,
  Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { purchaseCourse } from "@/app/actions/courses";
import type { CatalogCourse } from "@/data/courses-catalog";

interface CheckoutFormProps {
  course: CatalogCourse;
  userEmail: string;
}

type CheckoutStep = "review" | "processing" | "success";

export default function CheckoutForm({ course, userEmail }: CheckoutFormProps) {
  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async () => {
    setStep("processing");
    setError(null);

    // Simular delay de procesamiento de MercadoPago
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const result = await purchaseCourse(course.slug);
      if (result?.error) {
        setError(result.error);
        setStep("review");
      } else {
        setStep("success");
      }
    } catch {
      setError("Error al procesar el pago");
      setStep("review");
    }
  };

  // Pantalla de éxito
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Pago Confirmado
        </h1>
        <p className="text-slate-400 mb-2">
          Tu compra de <span className="text-white font-medium">{course.title}</span> se ha procesado exitosamente.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Se envió un recibo a {userEmail}
        </p>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-3">Resumen de compra</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">{course.title}</span>
            <span className="text-white">${course.price} USD</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
            <span className="text-white font-medium">Total pagado</span>
            <span className="text-green-400 font-bold">${course.price} USD</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base"
          >
            Ir al Dashboard
          </Button>
          <Button
            onClick={() => router.push("/courses")}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-12"
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    );
  }

  // Pantalla de procesamiento
  if (step === "processing") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="mb-8">
          {/* MercadoPago logo spinner */}
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-[#009EE3] border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-[#009EE3]" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Procesando pago con MercadoPago
        </h2>
        <p className="text-slate-400">
          Confirmando tu transacción, por favor espera...
        </p>
      </div>
    );
  }

  // Pantalla de review / checkout
  return (
    <div>
      <Link
        href={`/cursos/${course.slug}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al curso
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Formulario de pago */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white mb-6">
              Finalizar Compra
            </h1>

            {/* MercadoPago branding */}
            <div className="bg-[#009EE3]/10 border border-[#009EE3]/30 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#009EE3] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">MercadoPago</h3>
                  <p className="text-slate-400 text-xs">Pago seguro y protegido</p>
                </div>
              </div>
              <p className="text-[#009EE3]/80 text-sm">
                Tu pago será procesado de forma segura a través de MercadoPago.
                Aceptamos tarjetas de crédito, débito y transferencias.
              </p>
            </div>

            {/* Datos del comprador */}
            <div className="space-y-5 mb-8">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Datos del comprador
              </h3>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Email</label>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white">
                  {userEmail}
                </div>
              </div>
            </div>

            {/* Método de pago simulado */}
            <div className="space-y-5 mb-8">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Método de Pago
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-slate-900/50 border-2 border-[#009EE3] rounded-lg p-4 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-[#009EE3] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#009EE3]" />
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <span className="text-white text-sm">Tarjeta de crédito / débito</span>
                </label>

                <label className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4 cursor-pointer opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                  <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M12 9v6M9 12h6" />
                  </svg>
                  <span className="text-slate-400 text-sm">Transferencia bancaria</span>
                </label>
              </div>
            </div>

            {/* Campos de tarjeta simulados */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Número de tarjeta</label>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 text-sm flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  •••• •••• •••• 4242
                  <Lock className="w-3 h-3 text-slate-600 ml-auto" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Vencimiento</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 text-sm">
                    12/28
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">CVV</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 text-sm flex items-center">
                    •••
                    <Lock className="w-3 h-3 text-slate-600 ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Botón de pago */}
            <Button
              onClick={handlePayment}
              className="w-full bg-[#009EE3] hover:bg-[#0087CC] text-white h-14 text-lg font-semibold rounded-xl"
            >
              <Lock className="w-5 h-5 mr-2" />
              Pagar ${course.price} USD
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
              <Shield className="w-4 h-4" />
              Pago seguro encriptado con SSL de 256 bits
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6">
              Resumen del Pedido
            </h2>

            {/* Curso */}
            <div className="flex gap-4 mb-6">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center shrink-0`}
              >
                <BookOpen className="w-7 h-7 text-white/80" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {course.title}
                </h3>
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.lessonsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Signal className="w-3 h-3" />
                    {course.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">${course.price} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Impuestos</span>
                <span className="text-slate-500">$0.00</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-slate-700/50">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold">${course.price} USD</span>
              </div>
            </div>

            {/* Beneficios */}
            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                Acceso inmediato de por vida
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                Certificado de finalización
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                Garantía de 7 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
