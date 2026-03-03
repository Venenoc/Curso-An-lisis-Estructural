"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
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
  Tag,
  Loader2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogCourse, CourseModule } from "@/data/courses-catalog";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CheckoutFormProps {
  course: CatalogCourse;
  userEmail: string;
  selectedModule?: CourseModule | null;
  alreadyOwnedModules?: { id: number; title: string }[];
  remainingModules?: { id: number; title: string; price: number }[];
  effectivePrice?: number;
}

type CheckoutStep = "review" | "processing" | "success" | "pending";

const MP_ERROR_MESSAGES: Record<string, string> = {
  cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta.",
  cc_rejected_bad_filled_other: "Datos de tarjeta incorrectos.",
  cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto.",
  cc_rejected_call_for_authorize: "Llama a tu banco para autorizar el pago.",
  cc_rejected_card_disabled: "Tarjeta inactiva. Comunícate con tu banco.",
  cc_rejected_duplicated_payment: "Pago duplicado detectado.",
  cc_rejected_high_risk: "Pago rechazado por seguridad. Intenta con otra tarjeta.",
  cc_rejected_insufficient_amount: "Fondos insuficientes.",
  cc_rejected_max_attempts: "Límite de intentos alcanzado. Usa otra tarjeta.",
  cc_rejected_other_reason: "Pago rechazado. Verifica los datos e intenta nuevamente.",
};

export default function CheckoutForm({
  course,
  userEmail,
  selectedModule,
  alreadyOwnedModules = [],
  remainingModules = [],
  effectivePrice,
}: CheckoutFormProps) {
  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState<string | null>(null);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [docNumber, setDocNumber] = useState("");
  const docNumberRef = useRef("");
  const [payerEmail, setPayerEmail] = useState(userEmail);
  const payerEmailRef = useRef(userEmail);
  const cardFormRef = useRef<any>(null);
  const router = useRouter();

  const isModulePurchase = !!selectedModule;
  const isUpgrade = !isModulePurchase && remainingModules.length > 0;

  const displayPrice = isModulePurchase
    ? selectedModule!.price
    : effectivePrice !== undefined
    ? effectivePrice
    : course.price;

  const checkoutTitle = isModulePurchase
    ? `Módulo: ${selectedModule!.title}`
    : isUpgrade
    ? `Completar: ${course.title}`
    : course.title;

  const checkoutLessons = isModulePurchase
    ? selectedModule!.lessonsCount
    : course.lessonsCount;
  const checkoutDuration = isModulePurchase
    ? selectedModule!.duration
    : course.duration;

  const mpConfigured =
    typeof process.env.NEXT_PUBLIC_MP_PUBLIC_KEY === "string" &&
    (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY.startsWith("TEST-") ||
      process.env.NEXT_PUBLIC_MP_PUBLIC_KEY.startsWith("APP_USR-"));

  // ── Initialize MP CardForm after SDK loads ────────────────────────────────
  useEffect(() => {
    if (!mpLoaded || !window.MercadoPago || !mpConfigured) return;

    // Cleanup previous instance
    if (cardFormRef.current) {
      try {
        cardFormRef.current.unmount();
      } catch {}
      cardFormRef.current = null;
    }

    try {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, {
        locale: "es-AR",
      });

      cardFormRef.current = mp.cardForm({
        amount: String(displayPrice),
        iframe: true,
        form: {
          id: "mp-form",
          cardNumber: {
            id: "mp-cardNumber",
            placeholder: "1234 5678 9012 3456",
            style: {
              color: "#f1f5f9",
              "font-size": "16px",
              "background-color": "#0d1117",
              "placeholder-color": "#475569",
            },
          },
          expirationDate: {
            id: "mp-expiration",
            placeholder: "MM/YY",
            style: {
              color: "#f1f5f9",
              "font-size": "16px",
              "background-color": "#0d1117",
              "placeholder-color": "#475569",
            },
          },
          securityCode: {
            id: "mp-cvv",
            placeholder: "CVV",
            style: {
              color: "#f1f5f9",
              "font-size": "16px",
              "background-color": "#0d1117",
              "placeholder-color": "#475569",
            },
          },
          cardholderName: {
            id: "mp-holder",
            placeholder: "Nombre como aparece en la tarjeta",
          },
          issuer: { id: "mp-issuer" },
          installments: { id: "mp-installments" },
          // identificationType/Number omitidos: causan fallo cuando MP
          // no puede cargar los tipos de documento del país (no son requeridos
          // para la tokenización con tarjeta).
        },
        callbacks: {
          onFormMounted: (err: any) => {
            if (err) {
              console.error("MP form mount error:", err);
              return;
            }
            setMpReady(true);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            setError(null);

            const {
              token,
              paymentMethodId,
              issuerId,
              installments,
            } = cardFormRef.current.getCardFormData();

            if (!token) {
              setError("No se pudo procesar la tarjeta. Verifica los datos e intenta nuevamente.");
              return;
            }

            if (docNumberRef.current.length < 7) {
              setError("Ingresa tu número de DNI antes de continuar.");
              return;
            }

            setStep("processing");

            try {
              const res = await fetch("/api/payments/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token,
                  paymentMethodId,
                  issuerId,
                  installments,
                  payer: {
                    email: payerEmailRef.current,
                    identification: { type: "DNI", number: docNumberRef.current },
                  },
                  courseSlug: course.slug,
                  moduleId: selectedModule?.id ?? null,
                  isModulePurchase,
                }),
              });

              const data = await res.json();

              if (data.status === "approved") {
                setStep("success");
              } else if (
                data.status === "in_process" ||
                data.status === "pending"
              ) {
                setStep("pending");
              } else {
                const friendlyMsg =
                  MP_ERROR_MESSAGES[data.statusDetail] ||
                  data.error ||
                  "Pago rechazado. Intenta con otra tarjeta.";
                setError(friendlyMsg);
                setStep("review");
              }
            } catch {
              setError("Error de conexión. Intenta nuevamente.");
              setStep("review");
            }
          },
          onError: (errors: any[]) => {
            const first = Array.isArray(errors) ? errors[0] : errors;
            // MP v2 error structure: { field, cause, message, details }
            const field: string = first?.field || "";
            const fieldMessages: Record<string, string> = {
              expirationDate: "Fecha de vencimiento inválida. Usa una fecha futura (ej: 12/27).",
              cardNumber: "Número de tarjeta inválido.",
              securityCode: "Código de seguridad inválido.",
              cardholderName: "Ingresa el nombre del titular de la tarjeta.",
            };
            setError(fieldMessages[field] || first?.message || "Verifica los datos de la tarjeta.");
            setStep("review");
          },
        },
      });
    } catch (e) {
      console.error("Error initializing MP CardForm:", e);
    }

    return () => {
      if (cardFormRef.current) {
        try {
          cardFormRef.current.unmount();
        } catch {}
        cardFormRef.current = null;
        setMpReady(false);
      }
    };
  }, [mpLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">¡Pago Confirmado!</h1>
        <p className="text-slate-400 mb-2">
          Tu acceso a{" "}
          <span className="text-white font-medium">{checkoutTitle}</span> está
          listo.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Confirmación enviada a {userEmail}
        </p>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-3">Resumen de compra</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">{checkoutTitle}</span>
            <span className="text-white">S/. {displayPrice}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
            <span className="text-white font-medium">Total pagado</span>
            <span className="text-green-400 font-bold">S/. {displayPrice}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-700 text-white h-12 text-base font-bold shadow-lg border-2 border-cyan-400/40"
          >
            Ir al Dashboard
          </Button>
          <Button
            onClick={() => router.push("/cursos")}
            className="w-full bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600 h-12"
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    );
  }

  // ── Pending screen ────────────────────────────────────────────────────────
  if (step === "pending") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock3 className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Pago en proceso</h1>
        <p className="text-slate-400 mb-2">
          Tu pago está siendo verificado. Te notificaremos cuando sea confirmado
          y tu acceso será activado automáticamente.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Notificación enviada a {userEmail}
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white h-12 text-base font-bold"
        >
          Ir al Dashboard
        </Button>
      </div>
    );
  }

  // ── Processing screen ─────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="mb-8">
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

  // ── Review / checkout screen ──────────────────────────────────────────────
  return (
    <>
      {/* Load MP SDK only when MP credentials are configured */}
      {mpConfigured && (
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
          onLoad={() => setMpLoaded(true)}
        />
      )}

      <Link
        href={`/cursos/${course.slug}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al curso
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Payment form ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white mb-6">
              Finalizar Compra
            </h1>

            {/* MercadoPago branding */}
            <div className="bg-[#009EE3]/10 border border-[#009EE3]/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#009EE3] rounded-lg flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Pago seguro con MercadoPago
                </p>
                <p className="text-slate-400 text-xs">
                  Tarjetas de crédito y débito — SSL 256 bits
                </p>
              </div>
            </div>

            {/* Buyer email */}
            <div className="mb-5">
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => {
                  setPayerEmail(e.target.value);
                  payerEmailRef.current = e.target.value;
                }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#009EE3]/60 transition-colors text-sm"
              />
            </div>

            {mpConfigured ? (
              /* ── Real MP form ─────────────────────────────────────────────── */
              <form id="mp-form" className="space-y-5">
                {/* DNI — required by MP Argentina */}
                <div>
                  <label
                    htmlFor="identification-number"
                    className="block text-slate-400 text-sm mb-2"
                  >
                    Número de DNI
                  </label>
                  <input
                    id="identification-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    maxLength={9}
                    value={docNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setDocNumber(val);
                      docNumberRef.current = val;
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#009EE3]/60 transition-colors"
                  />
                </div>

                {/* Cardholder name */}
                <div>
                  <label
                    htmlFor="mp-holder"
                    className="block text-slate-400 text-sm mb-2"
                  >
                    Titular de la tarjeta
                  </label>
                  <input
                    id="mp-holder"
                    type="text"
                    autoComplete="cc-name"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#009EE3]/60 transition-colors"
                  />
                </div>

                {/* Card number — MP iframe container */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Número de tarjeta
                  </label>
                  <div
                    id="mp-cardNumber"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden h-[46px]"
                  ></div>
                </div>

                {/* Expiration + CVV — MP iframe containers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Vencimiento
                    </label>
                    <div
                      id="mp-expiration"
                      className="w-full bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden h-[46px]"
                    ></div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      CVV
                    </label>
                    <div
                      id="mp-cvv"
                      className="w-full bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden h-[46px]"
                    ></div>
                  </div>
                </div>

                {/* Hidden selects managed by MP */}
                <select id="mp-issuer" className="hidden"></select>
                <select id="mp-installments" className="hidden"></select>

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!mpReady}
                  className="w-full bg-[#009EE3] hover:bg-[#0087CC] disabled:opacity-50 disabled:cursor-not-allowed text-white h-14 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {!mpReady ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando formulario...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pagar S/. {displayPrice}
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Pago seguro encriptado con SSL de 256 bits
                </p>
              </form>
            ) : (
              /* ── MP not configured ────────────────────────────────────────── */
              <div className="text-center py-8 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium mb-1">
                  Pagos en configuración
                </p>
                <p className="text-slate-500 text-sm">
                  Configura{" "}
                  <code className="text-yellow-400 text-xs">
                    NEXT_PUBLIC_MP_PUBLIC_KEY
                  </code>{" "}
                  en <code className="text-yellow-400 text-xs">.env.local</code>{" "}
                  para activar los pagos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Order summary ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6">
              Resumen del Pedido
            </h2>

            {/* Course / module info */}
            <div className="flex gap-4 mb-6">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center shrink-0`}
              >
                <BookOpen className="w-7 h-7 text-white/80" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {checkoutTitle}
                </h3>
                {(isModulePurchase || isUpgrade) && (
                  <p className="text-slate-500 text-xs mt-0.5">{course.title}</p>
                )}
                {!isUpgrade && (
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    {checkoutLessons > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {checkoutLessons} lecciones
                      </span>
                    )}
                    {checkoutDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {checkoutDuration}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Signal className="w-3 h-3" />
                      {course.level}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade breakdown */}
            {isUpgrade ? (
              <div className="space-y-4">
                {alreadyOwnedModules.length > 0 && (
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Ya tienes
                    </p>
                    <div className="space-y-1.5">
                      {alreadyOwnedModules.map((m) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 shrink-0" />
                          <span className="text-slate-500 text-sm line-through">
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                  <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    A adquirir ahora
                  </p>
                  <div className="space-y-2">
                    {remainingModules.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-300 text-sm">{m.title}</span>
                        <span className="text-white text-sm font-medium">
                          S/. {m.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-3">
                  <div className="flex justify-between text-base">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold">
                      S/. {displayPrice}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo pagas lo que aún no tienes
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-700/50 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {isModulePurchase ? "Módulo individual" : "Curso completo"}
                  </span>
                  <span className="text-white">S/. {displayPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Impuestos</span>
                  <span className="text-slate-500">S/. 0.00</span>
                </div>
                <div className="flex justify-between text-base pt-3 border-t border-slate-700/50">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-bold">
                    S/. {displayPrice}
                  </span>
                </div>
              </div>
            )}

            {/* Benefits */}
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
    </>
  );
}
