"use client";

import React from "react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
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
  Smartphone,
  Banknote,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogCourse, CourseModule } from "@/types/database.types";

declare global {
  interface Window {
    MercadoPago: any;
    paypal: any;
  }
}

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface CheckoutFormProps {
  course: CatalogCourse;
  userEmail: string;
  selectedModule?: CourseModule | null;
  alreadyOwnedModules?: { id: number; title: string }[];
  remainingModules?: { id: number; title: string; price: number }[];
  effectivePrice?: number;
  walletReturn?: {
    status: string;
    paymentId: string;
    externalRef: string;
  } | null;
}

type PaymentMethod = "card" | "yape" | "cash" | "paypal";
type CheckoutStatus =
  | "idle"
  | "processing"
  | "success"
  | "pending"
  | "cash-pending";

interface CashResult {
  cipCode: string;
  cipUrl: string;
  expiration: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const MP_ERROR_MESSAGES: Record<string, string> = {
  cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta.",
  cc_rejected_bad_filled_other: "Datos de tarjeta incorrectos.",
  cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto.",
  cc_rejected_call_for_authorize: "Llama a tu banco para autorizar el pago.",
  cc_rejected_card_disabled: "Tarjeta inactiva. Comunícate con tu banco.",
  cc_rejected_duplicated_payment: "Pago duplicado detectado.",
  cc_rejected_high_risk:
    "Pago rechazado por seguridad. Intenta con otra tarjeta.",
  cc_rejected_insufficient_amount: "Fondos insuficientes.",
  cc_rejected_max_attempts:
    "Límite de intentos alcanzado. Usa otra tarjeta.",
  cc_rejected_other_reason:
    "Pago rechazado. Verifica los datos e intenta nuevamente.",
};

const STEPS = [
  { num: 1, label: "Resumen" },
  { num: 2, label: "Método" },
  { num: 3, label: "Pago" },
] as const;

/* ─── PayPal SVG icon ────────────────────────────────────────────────────────── */

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.566-5.946.36-1.847.174-3.388-.778-4.471z" />
    </svg>
  );
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  icon: typeof CreditCard | ((p: { className?: string }) => React.ReactElement);
  title: string;
  desc: string;
}[] = [
  {
    id: "card",
    icon: CreditCard,
    title: "Tarjeta de crédito o débito",
    desc: "Visa, Mastercard, American Express",
  },
  {
    id: "yape",
    icon: Smartphone,
    title: "Yape / MercadoPago",
    desc: "Paga con Yape o tu cuenta de MercadoPago",
  },
  {
    id: "paypal",
    icon: PayPalIcon,
    title: "PayPal",
    desc: "Paga de forma segura con tu cuenta PayPal",
  },
  {
    id: "cash",
    icon: Banknote,
    title: "Pago en efectivo",
    desc: "PagoEfectivo — paga en agentes o bancos",
  },
];

/* ─── Stepper ────────────────────────────────────────────────────────────────── */

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-slate-800 border-slate-600 text-slate-400"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  active
                    ? "text-cyan-400"
                    : done
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 rounded transition-colors duration-300 ${
                  current > s.num ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function CheckoutForm({
  course,
  userEmail,
  selectedModule,
  alreadyOwnedModules = [],
  remainingModules = [],
  effectivePrice,
  walletReturn,
}: CheckoutFormProps) {
  const router = useRouter();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // MP SDK
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [mpMountError, setMpMountError] = useState(false);
  const cardFormRef = useRef<any>(null);

  // PayPal SDK
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalExternalRefRef = useRef<string>("");

  // Yape
  const [yapePhone, setYapePhone] = useState("");
  const [yapeLoading, setYapeLoading] = useState(false);

  // Cash / PagoEfectivo
  const [cashResult, setCashResult] = useState<CashResult | null>(null);
  const [cipCopied, setCipCopied] = useState(false);

  // Form fields
  const [payerEmail, setPayerEmail] = useState(userEmail);
  const payerEmailRef = useRef(userEmail);
  const [docNumber, setDocNumber] = useState("");
  const docNumberRef = useRef("");
  const [payerName, setPayerName] = useState("");

  /* ── Derived values ──────────────────────────────────────────────────────── */
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
  const formattedPrice = displayPrice.toFixed(2);
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

  const paypalConfigured =
    typeof process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === "string" &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.length > 0;

  const paypalRate = parseFloat(process.env.NEXT_PUBLIC_PAYPAL_EXCHANGE_RATE || "0.27");
  const usdEquivalent = (displayPrice * paypalRate).toFixed(2);

  // Can continue from step 2 based on selected method + available providers
  const canContinue =
    paymentMethod !== null &&
    ((paymentMethod === "paypal" && paypalConfigured) ||
      (paymentMethod !== "paypal" && mpConfigured));

  /* ── Handle wallet return (from MP redirect) ─────────────────────────────── */
  useEffect(() => {
    if (!walletReturn) return;
    if (walletReturn.status === "approved") {
      setStatus("success");
    } else if (
      walletReturn.status === "pending" ||
      walletReturn.status === "in_process"
    ) {
      setStatus("pending");
    } else {
      setError("El pago no fue completado. Intenta nuevamente.");
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Initialize MP CardForm (step 3 + card) ──────────────────────────────── */
  useEffect(() => {
    if (
      step !== 3 ||
      paymentMethod !== "card" ||
      !mpLoaded ||
      !window.MercadoPago ||
      !mpConfigured
    )
      return;

    // Cleanup previous instance
    if (cardFormRef.current) {
      try {
        cardFormRef.current.unmount();
      } catch {
        /* */
      }
      cardFormRef.current = null;
      setMpReady(false);
    }

    setMpMountError(false);

    // Timeout: if form doesn't mount in 12s, show error
    const mountTimeout = setTimeout(() => {
      if (!cardFormRef.current) setMpMountError(true);
    }, 12000);

    try {
      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        { locale: "es-PE" },
      );

      cardFormRef.current = mp.cardForm({
        amount: String(displayPrice),
        iframe: false,
        form: {
          id: "mp-form",
          cardNumber: {
            id: "mp-cardNumber",
            placeholder: "1234 5678 9012 3456",
          },
          expirationDate: {
            id: "mp-expiration",
            placeholder: "MM/YY",
          },
          securityCode: {
            id: "mp-cvv",
            placeholder: "CVV",
          },
          cardholderName: {
            id: "mp-holder",
            placeholder: "Nombre como aparece en la tarjeta",
          },
          issuer: { id: "mp-issuer" },
          installments: { id: "mp-installments" },
        },
        callbacks: {
          onFormMounted: (err: any) => {
            clearTimeout(mountTimeout);
            if (err) {
              console.error("MP form mount error:", err);
              setMpMountError(true);
              return;
            }
            setMpReady(true);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            setError(null);

            const { token, paymentMethodId, issuerId, installments } =
              cardFormRef.current.getCardFormData();

            if (!token) {
              setError(
                "No se pudo procesar la tarjeta. Verifica los datos e intenta nuevamente.",
              );
              return;
            }
            if (docNumberRef.current.length < 7) {
              setError("Ingresa tu número de DNI antes de continuar.");
              return;
            }

            setStatus("processing");

            try {
              const res = await fetch("/api/payments/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentType: "card",
                  token,
                  paymentMethodId,
                  issuerId,
                  installments,
                  payer: {
                    email: payerEmailRef.current,
                    identification: {
                      type: "DNI",
                      number: docNumberRef.current,
                    },
                  },
                  courseSlug: course.slug,
                  moduleId: selectedModule?.id ?? null,
                  isModulePurchase,
                }),
              });

              const data = await res.json();

              if (data.status === "approved" || data.status === "authorized") {
                setStatus("success");
              } else if (
                data.status === "in_process" ||
                data.status === "pending"
              ) {
                setStatus("pending");
              } else {
                setError(
                  MP_ERROR_MESSAGES[data.statusDetail] ||
                    data.error ||
                    "Pago rechazado. Intenta con otra tarjeta.",
                );
                setStatus("idle");
              }
            } catch {
              setError("Error de conexión. Intenta nuevamente.");
              setStatus("idle");
            }
          },
          onError: (errors: any[]) => {
            const first = Array.isArray(errors) ? errors[0] : errors;
            const field: string = first?.field || "";
            const fieldMessages: Record<string, string> = {
              expirationDate:
                "Fecha de vencimiento inválida. Usa una fecha futura.",
              cardNumber: "Número de tarjeta inválido.",
              securityCode: "Código de seguridad inválido.",
              cardholderName:
                "Ingresa el nombre del titular de la tarjeta.",
            };
            setError(
              fieldMessages[field] ||
                first?.message ||
                "Verifica los datos de la tarjeta.",
            );
          },
        },
      });
    } catch (e) {
      console.error("Error initializing MP CardForm:", e);
      setMpMountError(true);
    }

    return () => {
      clearTimeout(mountTimeout);
      if (cardFormRef.current) {
        try {
          cardFormRef.current.unmount();
        } catch {
          /* */
        }
        cardFormRef.current = null;
        setMpReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, mpLoaded]);

  /* ── PayPal: render SDK buttons ──────────────────────────────────────────── */
  useEffect(() => {
    if (step !== 3 || paymentMethod !== "paypal" || !paypalLoaded) return;
    if (!window.paypal) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    container.innerHTML = ""; // clear any previous render

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "pay",
        height: 48,
      },
      createOrder: async () => {
        setError(null);
        const res = await fetch("/api/payments/create-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseSlug: course.slug,
            moduleId: selectedModule?.id ?? null,
            isModulePurchase,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          throw new Error(data.error);
        }
        paypalExternalRefRef.current = data.externalRef;
        return data.orderId;
      },
      onApprove: async (data: any) => {
        setStatus("processing");
        try {
          const res = await fetch("/api/payments/capture-paypal-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderID,
              externalRef: paypalExternalRefRef.current,
              courseSlug: course.slug,
              moduleId: selectedModule?.id ?? null,
              isModulePurchase,
            }),
          });
          const result = await res.json();
          if (result.status === "approved") {
            setStatus("success");
          } else {
            setError(result.error || "Error al procesar el pago.");
            setStatus("idle");
          }
        } catch {
          setError("Error de conexión. Intenta nuevamente.");
          setStatus("idle");
        }
      },
      onCancel: () => {
        setError("Pago cancelado. Puedes intentarlo nuevamente.");
      },
      onError: (err: any) => {
        console.error("PayPal error:", err);
        setError("Error al procesar el pago con PayPal. Intenta nuevamente.");
        setStatus("idle");
      },
    });

    if (buttons.isEligible()) {
      buttons.render("#paypal-button-container");
    } else {
      setError("PayPal no está disponible. Intenta con otro método de pago.");
    }

    return () => {
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, paypalLoaded]);

  /* ── Yape: phone + OTP → token → payment ─────────────────────────────────── */
  const [yapeOtp, setYapeOtp] = useState("");

  async function handleYapeSubmit() {
    setError(null);
    if (yapePhone.length < 9) {
      setError("Ingresa tu número de celular Yape (9 dígitos).");
      return;
    }
    if (yapeOtp.length !== 6) {
      setError("El código OTP debe tener 6 dígitos (encuéntralo en tu app Yape).");
      return;
    }
    if (!window.MercadoPago || !mpLoaded) {
      setError("El SDK de pago aún no está listo. Espera un momento.");
      return;
    }
    setYapeLoading(true);
    try {
      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        { locale: "es-PE" },
      );
      const yapeToken = await mp.yape({ otp: yapeOtp, phoneNumber: yapePhone }).create();

      const res = await fetch("/api/payments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: "yape",
          token: yapeToken.id,
          payer: { email: payerEmailRef.current },
          courseSlug: course.slug,
          moduleId: selectedModule?.id ?? null,
          isModulePurchase,
        }),
      });
      const data = await res.json();
      if (data.status === "approved") {
        setStatus("success");
      } else if (data.status === "in_process" || data.status === "pending") {
        setStatus("pending");
      } else {
        setError(data.error || "Pago rechazado. Verifica tus datos e intenta nuevamente.");
      }
    } catch (e: any) {
      setError(e?.message || "Error al procesar el pago con Yape.");
    }
    setYapeLoading(false);
  }

  /* ── Cash payment handler ────────────────────────────────────────────────── */
  async function handleCashPayment() {
    setError(null);
    if (!payerName.trim() || payerName.trim().split(" ").length < 2) {
      setError("Ingresa tu nombre completo (nombre y apellido).");
      return;
    }
    if (docNumberRef.current.length < 7) {
      setError("Ingresa tu número de DNI.");
      return;
    }

    setStatus("processing");

    const nameParts = payerName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      const res = await fetch("/api/payments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: "cash",
          payer: {
            email: payerEmailRef.current,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "DNI",
              number: docNumberRef.current,
            },
          },
          courseSlug: course.slug,
          moduleId: selectedModule?.id ?? null,
          isModulePurchase,
        }),
      });

      const data = await res.json();

      if (data.cipCode || data.cipUrl) {
        setCashResult({
          cipCode: data.cipCode || "",
          cipUrl: data.cipUrl || "",
          expiration: data.expiration || "",
        });
        setStatus("cash-pending");
      } else {
        setError(data.error || "Error al generar el código de pago.");
        setStatus("idle");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setStatus("idle");
    }
  }

  /* ── Step navigation ─────────────────────────────────────────────────────── */
  function goToStep2() {
    setStep(2);
    setError(null);
  }

  function goToStep3() {
    if (!paymentMethod) return;
    setStep(3);
    setError(null);
  }

  function goBack() {
    setError(null);
    if (step === 3) {
      if (cardFormRef.current) {
        try {
          cardFormRef.current.unmount();
        } catch {
          /* */
        }
        cardFormRef.current = null;
        setMpReady(false);
        setMpMountError(false);
      }
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  }

  function copyCip() {
    if (cashResult?.cipCode) {
      navigator.clipboard.writeText(cashResult.cipCode);
      setCipCopied(true);
      setTimeout(() => setCipCopied(false), 2000);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* ── Status screens ──────────────────────────────────────────────────────── */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          ¡Pago Confirmado!
        </h1>
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
            <span className="text-white">S/. {formattedPrice}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
            <span className="text-white font-medium">Total pagado</span>
            <span className="text-green-400 font-bold">
              S/. {formattedPrice}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-600 hover:to-blue-700 text-white h-12 font-bold shadow-lg"
          >
            Ir al Dashboard
          </Button>
          <Button
            onClick={() => router.push("/cursos")}
            variant="outline"
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock3 className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Pago en proceso
        </h1>
        <p className="text-slate-400 mb-2">
          Tu pago está siendo verificado. Te notificaremos cuando sea confirmado
          y tu acceso será activado automáticamente.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Notificación enviada a {userEmail}
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white h-12 font-bold"
        >
          Ir al Dashboard
        </Button>
      </div>
    );
  }

  if (status === "cash-pending" && cashResult) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Banknote className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Código de pago generado
          </h1>
          <p className="text-slate-400">
            Presenta este código en cualquier agente o banco para completar tu
            pago.
          </p>
        </div>

        <div className="bg-slate-800/60 border border-amber-500/30 rounded-2xl p-6 mb-6 space-y-4">
          {cashResult.cipCode && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Código CIP
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-bold text-amber-400 tracking-wider">
                  {cashResult.cipCode}
                </span>
                <button
                  onClick={copyCip}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                  title="Copiar código"
                >
                  {cipCopied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Monto a pagar
              </p>
              <p className="text-white font-bold text-lg">
                S/. {formattedPrice}
              </p>
            </div>
            {cashResult.expiration && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Vence
                </p>
                <p className="text-white font-medium text-sm">
                  {new Date(cashResult.expiration).toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {cashResult.cipUrl && (
            <a
              href={cashResult.cipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver instrucciones de pago
            </a>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-6">
          <p className="text-slate-400 text-sm">
            <strong className="text-white">¿Dónde pagar?</strong> En cualquier
            agente BCP, BBVA, Interbank, Scotiabank, Caja Arequipa, Western
            Union, Tambo+, o por banca por internet/app.
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center mb-4">
          Tu acceso se activará automáticamente una vez confirmado el pago.
        </p>

        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white h-12 font-bold"
        >
          Ir al Dashboard
        </Button>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-cyan-500" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Procesando pago
        </h2>
        <p className="text-slate-400">
          Confirmando tu transacción, por favor espera...
        </p>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* ── Main checkout UI ────────────────────────────────────────────────────── */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <>
      <style>{`
        #mp-cardNumber,
        #mp-expiration,
        #mp-cvv {
          width: 100% !important;
          height: 46px !important;
          background: rgba(15, 23, 42, 0.5) !important;
          color: #f1f5f9 !important;
          font-size: 14px !important;
          border: 1px solid #334155 !important;
          border-radius: 0.5rem !important;
          outline: none !important;
          padding: 0 16px !important;
          box-sizing: border-box !important;
          display: block !important;
          cursor: text !important;
          transition: border-color 0.2s !important;
        }
        #mp-cardNumber:focus,
        #mp-expiration:focus,
        #mp-cvv:focus {
          border-color: rgba(6, 182, 212, 0.6) !important;
          outline: none !important;
        }
        #mp-cardNumber::placeholder,
        #mp-expiration::placeholder,
        #mp-cvv::placeholder {
          color: #475569 !important;
        }
      `}</style>
      {mpConfigured && (
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
          onLoad={() => setMpLoaded(true)}
        />
      )}
      {paypalConfigured && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD"}&locale=es_PE&intent=capture`}
          strategy="afterInteractive"
          onLoad={() => setPaypalLoaded(true)}
        />
      )}

      <Link
        href={`/cursos/${course.slug}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al curso
      </Link>

      {/* Stepper */}
      <Stepper current={step} />

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Left panel (step content) ────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
            {/* ═══ STEP 1: Review ════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">
                  Resumen del pedido
                </h1>

                {/* Item card */}
                <div className="flex gap-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <BookOpen className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">
                      {checkoutTitle}
                    </h3>
                    {(isModulePurchase || isUpgrade) && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {course.title}
                      </p>
                    )}
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
                  </div>
                  <span className="text-white font-bold text-lg shrink-0">
                    S/. {formattedPrice}
                  </span>
                </div>

                {/* Upgrade breakdown */}
                {isUpgrade && (
                  <div className="space-y-3">
                    {alreadyOwnedModules.length > 0 && (
                      <div className="bg-slate-900/40 rounded-lg p-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          Ya tienes
                        </p>
                        {alreadyOwnedModules.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 py-0.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 shrink-0" />
                            <span className="text-slate-500 text-sm line-through">
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                      <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />A adquirir ahora
                      </p>
                      {remainingModules.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between py-0.5"
                        >
                          <span className="text-slate-300 text-sm">
                            {m.title}
                          </span>
                          <span className="text-white text-sm font-medium">
                            S/. {m.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div className="border-t border-slate-700/50 pt-4 space-y-2">
                  {[
                    "Acceso inmediato de por vida",
                    "Certificado de finalización",
                    "Garantía de 7 días",
                  ].map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-2 text-sm text-slate-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={goToStep2}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base"
                >
                  Continuar al pago <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* ═══ STEP 2: Payment method ═════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">
                  Elige tu método de pago
                </h1>
                <p className="text-slate-400 text-sm">
                  Selecciona cómo deseas pagar tu compra.
                </p>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    const selected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selected
                            ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                            : "border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            selected
                              ? "bg-cyan-500 text-white"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm ${
                              selected ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {pm.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {pm.desc}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected
                              ? "border-cyan-500 bg-cyan-500"
                              : "border-slate-600"
                          }`}
                        >
                          {selected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!mpConfigured && (
                  <div className="text-center py-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                    <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">
                      Pagos en configuración. Configura{" "}
                      <code className="text-yellow-400 text-xs">
                        NEXT_PUBLIC_MP_PUBLIC_KEY
                      </code>{" "}
                      en{" "}
                      <code className="text-yellow-400 text-xs">
                        .env.local
                      </code>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={goBack}
                    variant="outline"
                    className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                  </Button>
                  <Button
                    onClick={goToStep3}
                    disabled={!canContinue}
                    className="flex-[2] h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold disabled:opacity-50"
                  >
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ STEP 3: Payment details ════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === "card"
                        ? "bg-cyan-500"
                        : paymentMethod === "yape"
                        ? "bg-purple-500"
                        : paymentMethod === "paypal"
                        ? "bg-blue-600"
                        : "bg-amber-500"
                    }`}
                  >
                    {paymentMethod === "card" && (
                      <CreditCard className="w-5 h-5 text-white" />
                    )}
                    {paymentMethod === "yape" && (
                      <Smartphone className="w-5 h-5 text-white" />
                    )}
                    {paymentMethod === "paypal" && (
                      <PayPalIcon className="w-5 h-5 text-white" />
                    )}
                    {paymentMethod === "cash" && (
                      <Banknote className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {paymentMethod === "card" && "Pagar con tarjeta"}
                      {paymentMethod === "yape" &&
                        "Pagar con Yape / MercadoPago"}
                      {paymentMethod === "paypal" && "Pagar con PayPal"}
                      {paymentMethod === "cash" && "Pago en efectivo"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                      {paymentMethod === "card" &&
                        "Ingresa los datos de tu tarjeta"}
                      {paymentMethod === "yape" &&
                        "Serás redirigido a MercadoPago para completar el pago"}
                      {paymentMethod === "paypal" &&
                        "Haz clic en el botón para continuar con PayPal"}
                      {paymentMethod === "cash" &&
                        "Genera tu código CIP para pagar en agentes"}
                    </p>
                  </div>
                </div>

                {/* ── Card form ──────────────────────────────────────────── */}
                {paymentMethod === "card" && (
                  <form id="mp-form" className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => {
                          setPayerEmail(e.target.value);
                          payerEmailRef.current = e.target.value;
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                    {/* DNI */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Número de DNI
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="12345678"
                        maxLength={9}
                        value={docNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setDocNumber(v);
                          docNumberRef.current = v;
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                    {/* Cardholder name */}
                    <div>
                      <label
                        htmlFor="mp-holder"
                        className="block text-slate-400 text-sm mb-1.5"
                      >
                        Titular de la tarjeta
                      </label>
                      <input
                        id="mp-holder"
                        type="text"
                        autoComplete="cc-name"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                    {/* Card number */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Número de tarjeta
                      </label>
                      <input
                        id="mp-cardNumber"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4152 3138 0000 1234"
                      />
                    </div>
                    {/* Expiration + CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-1.5">
                          Vencimiento
                        </label>
                        <input
                          id="mp-expiration"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="12/28"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-1.5">
                          CVV
                        </label>
                        <input
                          id="mp-cvv"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    {/* Hidden selects for MP */}
                    <select id="mp-issuer" className="hidden" />
                    <select id="mp-installments" className="hidden" />

                    {/* Mount error */}
                    {mpMountError && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                        <p className="text-amber-300 text-sm font-medium">
                          No se pudo cargar el formulario de tarjeta
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Verifica tu conexión e intenta nuevamente
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMpMountError(false);
                            setMpReady(false);
                            setMpLoaded(false);
                            setTimeout(() => setMpLoaded(true), 100);
                          }}
                          className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={goBack}
                        variant="outline"
                        className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <button
                        type="submit"
                        disabled={!mpReady || mpMountError}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        {!mpReady && !mpMountError ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Cargando formulario...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Pagar S/. {formattedPrice}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── PayPal ─────────────────────────────────────────────── */}
                {paymentMethod === "paypal" && (
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-1">
                      <p className="text-white text-sm font-semibold flex items-center gap-2">
                        <PayPalIcon className="w-4 h-4 text-blue-400" />
                        Pago seguro con PayPal
                      </p>
                      <p className="text-slate-300 text-sm">
                        Haz clic en el botón de PayPal. Se abrirá una ventana
                        para que inicies sesión o pagues con tarjeta a través de
                        PayPal. Tu acceso se activará automáticamente.
                      </p>
                    </div>

                    {/* Precio en USD */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">
                        Resumen del cobro
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Precio en soles</span>
                        <span className="text-white font-semibold">S/. {formattedPrice}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-slate-300 text-sm">PayPal cobra en USD</span>
                        <span className="text-blue-300 font-bold text-base">${usdEquivalent} USD</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Tipo de cambio referencial: 1 PEN ≈ {paypalRate} USD. El monto exacto puede
                        variar según tu banco o la tasa de PayPal al momento del pago.
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    {/* PayPal SDK renders buttons here */}
                    <div id="paypal-button-container" className="min-h-[56px]">
                      {!paypalLoaded && (
                        <div className="flex items-center justify-center gap-2 h-14 text-slate-400 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cargando PayPal...
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                    </Button>
                  </div>
                )}

                {/* ── Yape ───────────────────────────────────────────────── */}
                {paymentMethod === "yape" && (
                  <div className="space-y-4">
                    {/* Instructions */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-2">
                      <p className="text-white text-sm font-semibold flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        Cómo pagar con Yape
                      </p>
                      <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Abre tu app Yape</li>
                        <li>Toca el ícono de escáner / código OTP</li>
                        <li>Copia el código de 6 dígitos que aparece</li>
                        <li>Ingresa tu número y ese código aquí abajo</li>
                      </ol>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Número de celular Yape
                      </label>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 text-sm whitespace-nowrap">
                          +51
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="999 999 999"
                          maxLength={9}
                          value={yapePhone}
                          onChange={(e) =>
                            setYapePhone(e.target.value.replace(/\D/g, ""))
                          }
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    {/* OTP */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Código OTP de Yape{" "}
                        <span className="text-slate-500">(6 dígitos)</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="123456"
                        maxLength={6}
                        value={yapeOtp}
                        onChange={(e) =>
                          setYapeOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors text-sm tracking-[0.3em] font-mono"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={goBack}
                        variant="outline"
                        className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <button
                        onClick={handleYapeSubmit}
                        disabled={
                          yapePhone.length < 9 ||
                          yapeOtp.length !== 6 ||
                          yapeLoading
                        }
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        {yapeLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5" />
                            Pagar S/. {formattedPrice} con Yape
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Cash / PagoEfectivo ─────────────────────────────────── */}
                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <p className="text-slate-300 text-sm">
                        Se generará un código{" "}
                        <strong className="text-amber-300">
                          CIP de PagoEfectivo
                        </strong>{" "}
                        que podrás pagar en agentes bancarios, bodegas,
                        farmacias, y por banca online. Tu acceso se activará
                        automáticamente al confirmar el pago.
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => {
                          setPayerEmail(e.target.value);
                          payerEmailRef.current = e.target.value;
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                    {/* Full name */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        placeholder="Carlos García Pérez"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                    {/* DNI */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-1.5">
                        Número de DNI
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="12345678"
                        maxLength={9}
                        value={docNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setDocNumber(v);
                          docNumberRef.current = v;
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors text-sm"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={goBack}
                        variant="outline"
                        className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold border-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <button
                        type="button"
                        onClick={handleCashPayment}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Banknote className="w-5 h-5" />
                        Generar código de pago
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security badge */}
          <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Pago seguro encriptado con SSL de 256 bits
          </p>
        </div>

        {/* ── Right panel: Order summary (sticky) ──────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-5">Tu pedido</h2>

            <div className="flex gap-3 mb-5">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${course.gradient} rounded-xl flex items-center justify-center shrink-0`}
              >
                <BookOpen className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {checkoutTitle}
                </h3>
                {(isModulePurchase || isUpgrade) && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    {course.title}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {isModulePurchase
                    ? "Módulo"
                    : isUpgrade
                    ? "Upgrade"
                    : "Curso completo"}
                </span>
                <span className="text-white">S/. {formattedPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Impuestos</span>
                <span className="text-slate-500">S/. 0.00</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-slate-700/50">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold">
                  S/. {formattedPrice}
                </span>
              </div>
            </div>

            {/* Payment method indicator */}
            {paymentMethod && step >= 2 && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {paymentMethod === "card" && (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Tarjeta de crédito/débito
                    </>
                  )}
                  {paymentMethod === "yape" && (
                    <>
                      <Smartphone className="w-3.5 h-3.5" />
                      Yape / MercadoPago
                    </>
                  )}
                  {paymentMethod === "paypal" && (
                    <>
                      <PayPalIcon className="w-3.5 h-3.5" />
                      PayPal
                    </>
                  )}
                  {paymentMethod === "cash" && (
                    <>
                      <Banknote className="w-3.5 h-3.5" />
                      Pago en efectivo
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-5 pt-5 border-t border-slate-700/50 space-y-2">
              {[
                "Acceso inmediato de por vida",
                "Certificado de finalización",
                "Garantía de 7 días",
              ].map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {b}
                </div>
              ))}
            </div>

            {/* Upgrade summary */}
            {isUpgrade && (
              <div className="mt-5 pt-5 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Desglose de módulos
                </p>
                {alreadyOwnedModules.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {alreadyOwnedModules.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 py-0.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-green-500/70 shrink-0" />
                        <span className="text-slate-500 text-xs line-through">
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {remainingModules.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-0.5"
                  >
                    <span className="text-slate-300 text-xs">{m.title}</span>
                    <span className="text-white text-xs font-medium">
                      S/. {m.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-700/50 mt-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-cyan-400 font-bold">
                      S/. {formattedPrice}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo pagas lo que aún no tienes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
