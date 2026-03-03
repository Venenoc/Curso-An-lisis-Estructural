"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Bell,
  Lock,
  CreditCard,
  ShoppingBag,
  User,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Package,
  LogOut,
  Trash2,
  Monitor,
  Mail,
  Calendar,
  DollarSign,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { changePassword, deleteAccount, signOutAllDevices } from "@/app/actions/settings";
import { signout } from "@/app/actions/auth";

type Tab =
  | "cuenta"
  | "seguridad"
  | "notificaciones"
  | "privacidad"
  | "pagos"
  | "historial";

interface Purchase {
  id: string;
  date: string;
  type: "course" | "module";
  itemName: string;
  courseName: string;
  courseSlug: string;
  price: number;
  paymentType: string;
}

interface Props {
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  purchases: Purchase[];
  totalSpent: number;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "cuenta", label: "Mi Cuenta", icon: <User className="w-4 h-4" /> },
  { id: "seguridad", label: "Seguridad", icon: <Shield className="w-4 h-4" /> },
  { id: "notificaciones", label: "Notificaciones", icon: <Bell className="w-4 h-4" /> },
  { id: "privacidad", label: "Privacidad", icon: <Lock className="w-4 h-4" /> },
  { id: "pagos", label: "Método de Pago", icon: <CreditCard className="w-4 h-4" /> },
  { id: "historial", label: "Historial de Compras", icon: <ShoppingBag className="w-4 h-4" /> },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h3 className="text-white font-semibold">{title}</h3>
        {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onToggle, label, description }: { enabled: boolean; onToggle: () => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        {description && <div className="text-slate-500 text-xs mt-0.5">{description}</div>}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? "bg-cyan-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* ── TAB: CUENTA ── */
function CuentaTab({ email, fullName, role, createdAt }: { email: string; fullName: string; role: string; createdAt: string }) {
  const memberSince = new Date(createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const roleLabel = role === "instructor" ? "Instructor" : role === "admin" ? "Administrador" : "Estudiante";

  return (
    <div className="space-y-5">
      <SectionCard title="Información de la Cuenta">
        <div className="space-y-4">
          {[
            { icon: <Mail className="w-4 h-4 text-slate-400" />, label: "Correo electrónico", value: email },
            { icon: <User className="w-4 h-4 text-slate-400" />, label: "Nombre completo", value: fullName || "Sin nombre" },
            { icon: <Shield className="w-4 h-4 text-slate-400" />, label: "Tipo de cuenta", value: roleLabel },
            { icon: <Calendar className="w-4 h-4 text-slate-400" />, label: "Miembro desde", value: memberSince },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
              {item.icon}
              <div className="flex-1 min-w-0">
                <div className="text-slate-500 text-xs">{item.label}</div>
                <div className="text-white text-sm font-medium truncate">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/profile">
          <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white w-full">
            Editar Perfil
          </Button>
        </Link>
      </SectionCard>

      <SectionCard title="Sesión" description="Gestiona el acceso a tu cuenta">
        <div className="space-y-3">
          <form action={signout}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 rounded-lg text-slate-300 hover:text-white transition-colors">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Cerrar sesión</span>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />
            </button>
          </form>
          <SignOutAllButton />
        </div>
      </SectionCard>

      <DangerZone />
    </div>
  );
}

function SignOutAllButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    await signOutAllDevices();
    setDone(true);
    setLoading(false);
  };
  return (
    <button
      onClick={handleClick}
      disabled={loading || done}
      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-60"
    >
      <Monitor className="w-4 h-4 text-slate-400" />
      <span className="text-sm font-medium">
        {done ? "Sesiones cerradas" : loading ? "Cerrando sesiones..." : "Cerrar sesión en todos los dispositivos"}
      </span>
      {done ? <CheckCircle2 className="w-4 h-4 ml-auto text-green-400" /> : <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />}
    </button>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteAccount();
    if (result?.error) { setError(result.error); setLoading(false); }
    else { window.location.href = "/"; }
  };

  return (
    <SectionCard title="Zona de Peligro">
      <p className="text-slate-400 text-sm mb-4">
        Al eliminar tu cuenta se borrarán permanentemente todos tus datos, progreso e historial de compras. Esta acción no se puede deshacer.
      </p>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {!confirm ? (
        <Button
          onClick={() => setConfirm(true)}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar mi cuenta
        </Button>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm font-medium">¿Confirmas que deseas eliminar tu cuenta? Esta acción es irreversible.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setConfirm(false)} variant="outline" className="border-slate-600 text-slate-300 flex-1">
              Cancelar
            </Button>
            <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sí, eliminar"}
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ── TAB: SEGURIDAD ── */
function SeguridadTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = (() => {
    const p = form.next;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Muy débil", "Débil", "Regular", "Buena", "Fuerte"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  const handleSubmit = async () => {
    setError(null);
    if (!form.current || !form.next || !form.confirm) return setError("Completa todos los campos");
    if (form.next !== form.confirm) return setError("Las contraseñas nuevas no coinciden");
    if (form.next.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setLoading(true);
    const result = await changePassword(form.current, form.next);
    if (result?.error) { setError(result.error); }
    else { setSuccess(true); setForm({ current: "", next: "", confirm: "" }); setTimeout(() => setSuccess(false), 4000); }
    setLoading(false);
  };

  const Field = ({ id, label, value, onChange }: { id: keyof typeof showPw; label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPw[id] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 pr-10 text-sm"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShowPw((s) => ({ ...s, [id]: !s[id] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          {showPw[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionCard title="Cambiar Contraseña" description="Elige una contraseña segura de al menos 6 caracteres">
        <div className="space-y-4">
          <Field id="current" label="Contraseña actual" value={form.current} onChange={(v) => setForm({ ...form, current: v })} />
          <Field id="next" label="Nueva contraseña" value={form.next} onChange={(v) => setForm({ ...form, next: v })} />

          {form.next && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Seguridad de la contraseña</span>
                <span className={`text-xs font-medium ${strength >= 4 ? "text-green-400" : strength >= 3 ? "text-blue-400" : "text-orange-400"}`}>{strengthLabel}</span>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= i ? strengthColor : "bg-slate-700"}`} />
                ))}
              </div>
            </div>
          )}

          <Field id="confirm" label="Confirmar nueva contraseña" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} />

          {form.confirm && form.next && form.confirm !== form.next && (
            <p className="text-orange-400 text-xs">Las contraseñas no coinciden</p>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Contraseña actualizada correctamente</p>}

          <Button onClick={handleSubmit} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Actualizando...</> : "Actualizar contraseña"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Autenticación" description="Estado de seguridad de tu cuenta">
        <div className="space-y-3">
          {[
            { label: "Verificación de correo", ok: true, desc: "Tu correo electrónico ha sido verificado" },
            { label: "Autenticación de dos factores", ok: false, desc: "Añade una capa extra de seguridad (próximamente)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-green-500/20" : "bg-slate-700/60"}`}>
                {item.ok ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Shield className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{item.label}</div>
                <div className="text-slate-500 text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ── TAB: NOTIFICACIONES ── */
function NotificacionesTab() {
  const [prefs, setPrefs] = useState({
    emailComunidad: true,
    emailCursos: true,
    emailOfertas: false,
    emailBoletin: false,
    browserPush: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <SectionCard title="Notificaciones por Correo" description="Controla qué emails recibes de la plataforma">
        <div className="divide-y divide-slate-700/30">
          <Toggle enabled={prefs.emailComunidad} onToggle={() => toggle("emailComunidad")} label="Actividad en Comunidad" description="Respuestas a tus posts y menciones" />
          <Toggle enabled={prefs.emailCursos} onToggle={() => toggle("emailCursos")} label="Novedades de Cursos" description="Nuevos módulos y actualizaciones de contenido" />
          <Toggle enabled={prefs.emailOfertas} onToggle={() => toggle("emailOfertas")} label="Ofertas y Promociones" description="Descuentos exclusivos y ofertas especiales" />
          <Toggle enabled={prefs.emailBoletin} onToggle={() => toggle("emailBoletin")} label="Boletín Mensual" description="Resumen mensual de la plataforma" />
        </div>
      </SectionCard>

      <SectionCard title="Notificaciones del Navegador" description="Alertas en tiempo real mientras navegas">
        <Toggle enabled={prefs.browserPush} onToggle={() => toggle("browserPush")} label="Notificaciones Push" description="Recibe alertas instantáneas en tu navegador" />
      </SectionCard>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-slate-400 text-sm">
          Las preferencias de notificaciones se aplican inmediatamente. Siempre puedes cambiarlas aquí.
        </p>
      </div>
    </div>
  );
}

/* ── TAB: PRIVACIDAD ── */
function PrivacidadTab() {
  const [prefs, setPrefs] = useState({
    publicProfile: true,
    showEmail: false,
    showProgress: true,
    showCommunityLevel: true,
    allowDMs: true,
    analytics: true,
  });
  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <SectionCard title="Visibilidad del Perfil" description="Controla qué información es visible para otros usuarios">
        <div className="divide-y divide-slate-700/30">
          <Toggle enabled={prefs.publicProfile} onToggle={() => toggle("publicProfile")} label="Perfil público" description="Otros usuarios pueden ver tu perfil en la comunidad" />
          <Toggle enabled={prefs.showEmail} onToggle={() => toggle("showEmail")} label="Mostrar correo" description="Mostrar tu email en el perfil público" />
          <Toggle enabled={prefs.showProgress} onToggle={() => toggle("showProgress")} label="Mostrar progreso de cursos" description="Visible en tu perfil público" />
          <Toggle enabled={prefs.showCommunityLevel} onToggle={() => toggle("showCommunityLevel")} label="Mostrar nivel de comunidad" description="Mostrar tu nivel (Bachiller, Ingeniero, etc.) en posts" />
        </div>
      </SectionCard>

      <SectionCard title="Comunicación" description="Quién puede contactarte dentro de la plataforma">
        <div className="divide-y divide-slate-700/30">
          <Toggle enabled={prefs.allowDMs} onToggle={() => toggle("allowDMs")} label="Mensajes directos" description="Permitir que otros usuarios te envíen mensajes" />
        </div>
      </SectionCard>

      <SectionCard title="Datos y Análisis" description="Cómo usamos tus datos para mejorar la plataforma">
        <div className="divide-y divide-slate-700/30">
          <Toggle enabled={prefs.analytics} onToggle={() => toggle("analytics")} label="Análisis de uso" description="Ayúdanos a mejorar compartiendo datos de uso anónimos" />
        </div>
        <div className="mt-4 p-3 bg-slate-900/40 rounded-lg">
          <p className="text-slate-500 text-xs">
            Tus datos personales están protegidos según nuestra{" "}
            <Link href="/privacidad" className="text-cyan-400 hover:text-cyan-300">Política de Privacidad</Link>.
            Nunca vendemos tu información a terceros.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

/* ── TAB: MÉTODO DE PAGO ── */
function PagosTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Método de Pago Guardado" description="Gestiona tu información de pago">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-5 mb-4 border border-slate-600/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1">
              <div className="w-8 h-5 bg-red-500 rounded-sm opacity-90" />
              <div className="w-8 h-5 bg-orange-400 rounded-sm opacity-70 -ml-4" />
            </div>
            <CreditCard className="w-6 h-6 text-slate-400" />
          </div>
          <div className="font-mono text-white text-base tracking-widest mb-4">•••• •••• •••• 4242</div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>TITULAR DE LA TARJETA</span>
            <span>VENCE</span>
          </div>
          <div className="flex justify-between text-white text-sm font-medium mt-1">
            <span>John Doe</span>
            <span>12/27</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-2 border-blue-700 text-blue-400 hover:bg-blue-800 hover:text-white transition-colors shadow-md"
          >
            Cambiar tarjeta
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-700 hover:text-white transition-colors shadow-md"
          >
            Eliminar
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Métodos Aceptados" description="Formas de pago disponibles en la plataforma">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Visa", color: "from-blue-600 to-blue-800", text: "VISA" },
            { name: "Mastercard", color: "from-red-600 to-orange-700", text: "MC" },
            { name: "PayPal", color: "from-blue-500 to-indigo-700", text: "PP" },
          ].map((m) => (
            <div key={m.name} className={`bg-gradient-to-br ${m.color} rounded-lg p-3 text-center`}>
              <div className="text-white font-bold text-sm">{m.text}</div>
              <div className="text-white/70 text-xs mt-0.5">{m.name}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Facturación" description="Información para facturas y recibos">
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1.5">País de facturación</label>
            <input className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Perú" />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1.5">Nombre o razón social</label>
            <input className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Tu nombre completo o empresa" />
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white w-full">Guardar datos de facturación</Button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ── TAB: HISTORIAL ── */
function HistorialTab({ purchases, totalSpent }: { purchases: Purchase[]; totalSpent: number }) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const formatPrice = (n: number) => n === 0 ? "Gratis" : `S/. ${n.toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Compras totales", value: purchases.length, icon: <ShoppingBag className="w-5 h-5 text-cyan-400" /> },
          { label: "Cursos completos", value: purchases.filter((p) => p.type === "course").length, icon: <BookOpen className="w-5 h-5 text-blue-400" /> },
          { label: "Módulos sueltos", value: purchases.filter((p) => p.type === "module").length, icon: <Package className="w-5 h-5 text-purple-400" /> },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="mb-2">{s.icon}</div>
            <div className="text-white font-bold text-2xl">{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <span className="text-white font-semibold">Total invertido en educación</span>
        </div>
        <span className="text-amber-400 font-bold text-xl">${totalSpent.toFixed(2)}</span>
      </div>

      {/* List */}
      <SectionCard title="Detalle de Compras">
        {purchases.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tienes compras todavía</p>
            <Link href="/cursos">
              <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white">Explorar Cursos</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {purchases.map((p) => (
              <div key={p.id} className="py-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  p.type === "course" ? "bg-cyan-500/20" : "bg-purple-500/20"
                }`}>
                  {p.type === "course"
                    ? <BookOpen className={`w-5 h-5 text-cyan-400`} />
                    : <Package className="w-5 h-5 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">{p.itemName}</div>
                  {p.type === "module" && (
                    <div className="text-slate-500 text-xs truncate">{p.courseName}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-500 text-xs">{formatDate(p.date)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.type === "course"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {p.type === "course" ? "Curso completo" : "Módulo"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white font-semibold text-sm">{formatPrice(p.price)}</div>
                  {p.courseSlug && (
                    <Link href={`/classroom/${p.courseSlug}`} className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 mt-1">
                      Ir al curso <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ── MAIN ── */
export default function SettingsPageClient({ email, fullName, role, avatarUrl, createdAt, purchases, totalSpent }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("cuenta");

  const initials = (fullName || email || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <div className="border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Configuración</h1>
                <p className="text-slate-400 text-sm">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <aside className="lg:w-60 shrink-0">
            <nav className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-slate-700/30 last:border-0 ${
                    activeTab === tab.id
                      ? "bg-cyan-600/20 text-cyan-400 border-l-2 border-l-cyan-500 pl-4"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "cuenta" && <CuentaTab email={email} fullName={fullName} role={role} createdAt={createdAt} />}
            {activeTab === "seguridad" && <SeguridadTab />}
            {activeTab === "notificaciones" && <NotificacionesTab />}
            {activeTab === "privacidad" && <PrivacidadTab />}
            {activeTab === "pagos" && <PagosTab />}
            {activeTab === "historial" && <HistorialTab purchases={purchases} totalSpent={totalSpent} />}
          </main>
        </div>
      </div>
    </div>
  );
}
