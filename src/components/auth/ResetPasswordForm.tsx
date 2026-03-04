"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Mail, Lock, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import "./loginform-glow.css";

type Step = "request" | "update" | "done";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect recovery state from URL — handles all Supabase auth flows
  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    const qp = new URLSearchParams(search.slice(1));
    const hp = new URLSearchParams(hash.slice(1));

    // ── Arrived from /auth/callback after successful exchange ──
    // The callback route sets ?recovery=1 after exchanging the PKCE code server-side
    if (qp.get("recovery") === "1") {
      setStep("update");
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    // ── Error from /auth/callback (invalid or expired link) ──
    if (qp.get("error") === "invalid_link") {
      setError("El enlace no es válido o ya expiró. Solicita uno nuevo.");
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    // ── Error from Supabase directly (e.g. otp_expired in the email link) ──
    const hasError = qp.get("error") || hp.get("error");
    const errorCode = qp.get("error_code") || hp.get("error_code");
    if (hasError || errorCode) {
      const desc = qp.get("error_description") || hp.get("error_description") || "";
      if (errorCode === "otp_expired" || desc.toLowerCase().includes("expired")) {
        setError("El enlace expiró. Los links de recuperación son válidos por 1 hora. Solicita uno nuevo.");
      } else {
        setError("El enlace no es válido. Por favor solicita uno nuevo.");
      }
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    // ── Legacy implicit flow: #access_token=...&type=recovery ──
    const accessToken = hp.get("access_token");
    const tokenType = hp.get("type");
    if (accessToken && tokenType === "recovery") {
      setStep("update");
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    // ── Fallback: listen to Supabase auth state change ──
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("update");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Step 1: Request email ──
  // Uses the BROWSER client so the PKCE verifier is stored client-side.
  // Using a server action would store the verifier on the server, making
  // exchangeCodeForSession (called client-side) unable to find it → "invalid link".
  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const next = encodeURIComponent("/reset-password?recovery=1");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
    });
    setLoading(false);
    if (error) {
      setError("No pudimos enviar el correo. Verifica el email ingresado.");
    } else {
      setStep("done");
    }
  }

  // ── Step 2: Set new password ──
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await updatePassword(password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/FondoAut/FondoLog.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Texto superior izquierdo */}
      <motion.div
        className="absolute top-8 left-8 z-20"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
          Recupera tu<br />
          Acceso<br />
          A la plataforma
        </h2>
        <p className="text-cyan-300 text-lg mt-3 font-semibold">
          Aprende, analiza, construye
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6 py-12 m-0 rounded-2xl bg-white/5 backdrop-blur-md animate-border-glow shadow-lg overflow-visible"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="gradient-border gradient-border-top z-30" />
        <span className="gradient-border gradient-border-bottom z-30" />
        <span className="gradient-border gradient-border-left z-30" />
        <span className="gradient-border gradient-border-right z-30" />

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-bold text-white">@Albert_Structural</div>
          </div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">
            ANÁLISIS ESTRUCTURAL
          </h1>
          <p className="text-white text-sm font-semibold">
            {step === "update"
              ? "NUEVA CONTRASEÑA"
              : step === "done"
              ? "CORREO ENVIADO"
              : error
              ? "ENLACE INVÁLIDO"
              : "RECUPERAR CONTRASEÑA"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Loading (exchanging code) ── */}
        {loading && step === "request" && !error && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-cyan-200 text-sm">Verificando enlace...</p>
          </div>
        )}

        {/* ── Step 1: Request ── */}
        {step === "request" && !(loading && !error) && (
          <form onSubmit={handleRequest} className="space-y-4 mb-6">
            <p className="text-cyan-200 text-sm text-center mb-4">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
            <div className="flex flex-col items-center pt-2 gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-2 rounded-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold transition-colors"
              >
                {loading ? "Enviando..." : "ENVIAR ENLACE"}
              </Button>
              <Link
                href="/login"
                className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2: New password ── */}
        {step === "update" && (
          <form onSubmit={handleUpdate} className="space-y-4 mb-6">
            <p className="text-cyan-200 text-sm text-center mb-4">
              Elige una nueva contraseña para tu cuenta.
            </p>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-12 pr-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-200"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
                className="pl-12 py-3 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-white placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="px-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= i * 3
                          ? password.length < 6
                            ? "bg-red-500"
                            : password.length < 10
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {password.length < 6
                    ? "Muy corta (mínimo 6 caracteres)"
                    : password.length < 10
                    ? "Contraseña aceptable"
                    : "Contraseña fuerte"}
                </p>
              </div>
            )}
            <div className="flex flex-col items-center pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-2 rounded-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold transition-colors"
              >
                {loading ? "Guardando..." : "ACTUALIZAR CONTRASEÑA"}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 3: Done (email sent) ── */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <p className="text-white font-semibold">¡Correo enviado!</p>
            <p className="text-cyan-200 text-sm">
              Revisa tu bandeja de entrada en <span className="font-semibold">{email}</span> y haz clic en el enlace para restablecer tu contraseña.
            </p>
            <p className="text-slate-400 text-xs">
              Si no lo ves, revisa la carpeta de spam.
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-cyan-300 hover:text-cyan-200 text-sm transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </Link>
          </div>
        )}

        {/* Sign up link */}
        {step === "request" && !(loading && !error) && (
          <div className="text-center">
            <span className="text-cyan-200 text-sm">¿No tienes una cuenta? </span>
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors">
              Regístrate
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
