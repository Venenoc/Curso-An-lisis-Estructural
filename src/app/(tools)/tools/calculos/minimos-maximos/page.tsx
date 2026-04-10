"use client";

/**
 * ============================================================
 * Calculadora: Mínimos y Máximos de Acero — Viga Rectangular
 * Normas: NTP E.060-2009 | ACI 318-19 | ACI 318-25
 * Unidades de trabajo: kgf/cm² y cm
 * ============================================================
 *
 * ARQUITECTURA:
 *   Todos los cálculos son funciones JS puras en el cliente.
 *   No usa el servidor Python — respuesta instantánea.
 *   useMemo recalcula cuando cambian parámetros o capas de acero.
 *
 * DÓNDE EDITAR:
 *   Fórmulas NTP          → calcNTP()
 *   Fórmulas ACI          → calcACI()
 *   Factor β₁             → calcBeta1()
 *   Procedimiento visual  → componente Procedimiento
 *   Visualizador sección  → SectionSVG
 *   Reporte PDF           → generarReporte()
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Plus, Trash2,
  CheckCircle, XCircle, AlertCircle, Info,
} from "lucide-react";

// ─── VARILLAS ESTÁNDAR ASTM A615 ──────────────────────────────────────────────
// área en cm²
const VARILLAS = [
  { label: "#3  (Ø 9.5 mm)",   area: 0.71  },
  { label: "#4  (Ø 12.7 mm)",  area: 1.29  },
  { label: "#5  (Ø 15.9 mm)",  area: 1.99  },
  { label: "#6  (Ø 19.1 mm)",  area: 2.84  },
  { label: "#8  (Ø 25.4 mm)",  area: 5.10  },
  { label: "#10 (Ø 31.8 mm)",  area: 8.19  },
  { label: "#12 (Ø 38.1 mm)",  area: 11.40 },
];

type ACIVersion = "318-19" | "318-25";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface Params {
  fc: number;   // kgf/cm² — resistencia a compresión del concreto
  fy: number;   // kgf/cm² — fluencia del acero de refuerzo
  b: number;    // cm      — ancho de la sección
  h: number;    // cm      — altura total
  r: number;    // cm      — recubrimiento al centroide del acero en tensión
}

interface Capa {
  id: number;
  varilla: number;   // índice en VARILLAS
  cantidad: number;
}

interface CalcResult {
  // Geometría
  d: number;
  // β₁
  beta1: number;
  // As mínimo
  k1: number; k2: number;          // constantes de cada norma
  As_min1: number; As_min2: number;
  As_min: number;
  governa: 1 | 2;
  // As máximo
  c_max: number; a_max: number;
  As_max: number;
  // Cuantías
  rho_min: number; rho_max: number; rho_bal: number;
  rho_prov: number | null;
  // Acero provisto
  As_prov: number | null;
  // Verificación
  cumple_min: boolean | null;
  cumple_max: boolean | null;
  cumple: boolean | null;
}

// ─── CÁLCULO DE β₁ ────────────────────────────────────────────────────────────
// Factor del bloque equivalente de compresión.
// NTP E.060 §10.2.7.3 / ACI 318 §22.2.2.4.3
// En kgf/cm²: límite = 280 kgf/cm² (≡ 28 MPa), paso = 70 kgf/cm² (≡ 7 MPa)
function calcBeta1(fc: number): number {
  if (fc <= 280) return 0.85;
  return Math.max(0.65, 0.85 - 0.05 * (fc - 280) / 70);
}

// ─── CÁLCULO NTP E.060-2009 ───────────────────────────────────────────────────
// Todas las operaciones en kgf/cm² y cm → resultado en cm²
//
// As_min (§10.5.1):
//   Criterio 1: As₁ = (0.7·√f'c / fy) · b·d
//   Criterio 2: As₂ = (14 / fy) · b·d
//   As_min = max(As₁, As₂)
//
// As_max (§10.3.3, zona de tensión controlada εt ≥ 0.004):
//   c_max = [0.003/(0.003+0.004)] · d = (3/7)·d
//   a_max = β₁ · c_max
//   As_max = (0.85·f'c·b·a_max) / fy
//
// ρ_bal: cuantía que agota simultáneamente concreto (εc=0.003) y acero (εs=εy)
//   ρ_bal = 0.85·β₁·f'c/fy · 6120/(6120+fy)
//   (6120 = 0.003·Es en kgf/cm², Es = 2,040,000 kgf/cm²)
function calcNTP(p: Params, As_prov: number | null): CalcResult {
  const { fc, fy, b } = p;
  const d = p.h - p.r;
  const beta1 = calcBeta1(fc);
  const k1 = 0.7, k2 = 14;
  const As_min1 = k1 * Math.sqrt(fc) / fy * b * d;
  const As_min2 = k2 / fy * b * d;
  const As_min = Math.max(As_min1, As_min2);
  const governa: 1 | 2 = As_min1 >= As_min2 ? 1 : 2;
  const c_max = (0.003 / 0.007) * d;
  const a_max = beta1 * c_max;
  const As_max = 0.85 * fc * b * a_max / fy;
  const rho_min = As_min / (b * d);
  const rho_max = As_max / (b * d);
  const rho_bal = 0.85 * beta1 * fc / fy * 6120 / (6120 + fy);
  const rho_prov = As_prov !== null ? As_prov / (b * d) : null;
  const cumple_min = As_prov !== null ? As_prov >= As_min : null;
  const cumple_max = As_prov !== null ? As_prov <= As_max : null;
  const cumple = cumple_min !== null && cumple_max !== null ? cumple_min && cumple_max : null;
  return { d, beta1, k1, k2, As_min1, As_min2, As_min, governa, c_max, a_max, As_max,
    rho_min, rho_max, rho_bal, rho_prov, As_prov, cumple_min, cumple_max, cumple };
}

// ─── CÁLCULO ACI 318-19 / ACI 318-25 ─────────────────────────────────────────
// Las fórmulas del ACI están originalmente en MPa y mm.
// Se convierten a kgf/cm² y cm usando:
//   1 MPa = 10.197 kgf/cm²   →   k1_MPa=0.25 → k1_kg = 0.25·√10.197 = 0.7982
//                              →   k2_MPa=1.4  → k2_kg = 1.4·10.197  = 14.276
//
// ACI 318-19 §9.6.1.2 / ACI 318-25 §9.6.1.2 (misma fórmula de mínimos):
//   Criterio 1: As₁ = (0.7982·√f'c / fy) · b·d  [kgf/cm², cm]
//   Criterio 2: As₂ = (14.276 / fy) · b·d
//
// As_max: misma lógica que NTP (εt_min = 0.004 no cambió en 318-25 para vigas ordinarias)
// ACI 318-25 §21.2.2: εt ≥ 0.004 → mismo c_max = (3/7)·d
//
// Diferencias ACI 318-25 vs 318-19: reorganización de capítulos, nuevas disposiciones
// sísmicas y para elementos especiales. Para vigas ordinarias, los mínimos y máximos
// de refuerzo a flexión son prácticamente iguales.
function calcACI(p: Params, As_prov: number | null): CalcResult {
  const { fc, fy, b } = p;
  const d = p.h - p.r;
  const beta1 = calcBeta1(fc);
  const k1 = 0.7982, k2 = 14.276;
  const As_min1 = k1 * Math.sqrt(fc) / fy * b * d;
  const As_min2 = k2 / fy * b * d;
  const As_min = Math.max(As_min1, As_min2);
  const governa: 1 | 2 = As_min1 >= As_min2 ? 1 : 2;
  const c_max = (0.003 / 0.007) * d;
  const a_max = beta1 * c_max;
  const As_max = 0.85 * fc * b * a_max / fy;
  const rho_min = As_min / (b * d);
  const rho_max = As_max / (b * d);
  const rho_bal = 0.85 * beta1 * fc / fy * 6120 / (6120 + fy);
  const rho_prov = As_prov !== null ? As_prov / (b * d) : null;
  const cumple_min = As_prov !== null ? As_prov >= As_min : null;
  const cumple_max = As_prov !== null ? As_prov <= As_max : null;
  const cumple = cumple_min !== null && cumple_max !== null ? cumple_min && cumple_max : null;
  return { d, beta1, k1, k2, As_min1, As_min2, As_min, governa, c_max, a_max, As_max,
    rho_min, rho_max, rho_bal, rho_prov, As_prov, cumple_min, cumple_max, cumple };
}

// ─── COMPONENTES DE FÓRMULA ───────────────────────────────────────────────────
// Muestran fórmulas con formato matemático sin librería externa.

function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-0.5 leading-none">
      <span className="border-b border-current px-1 pb-px text-[11px] leading-tight">{num}</span>
      <span className="px-1 pt-px text-[11px] leading-tight">{den}</span>
    </span>
  );
}
function Sqrt({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-end gap-px">
      <span className="text-base leading-none">√</span>
      <span className="border-t border-current px-0.5 text-[11px]">{children}</span>
    </span>
  );
}
function FormulaBox({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const bg = color === "emerald" ? "bg-emerald-50 border-emerald-200" : color === "blue" ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200";
  return (
    <div className={`rounded-lg border px-4 py-2.5 font-mono text-[12px] text-slate-700 ${bg} overflow-x-auto`}>
      {children}
    </div>
  );
}

// ─── PROCEDIMIENTO PASO A PASO ────────────────────────────────────────────────

function Paso({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 mb-2">{title}</p>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Resultado({ label, value, unit, highlight }: { label: React.ReactNode; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 px-2.5 rounded-md text-xs ${highlight ? "bg-white border border-slate-300 font-semibold" : "bg-white border border-slate-100"}`}>
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-bold">{value}{unit ? <span className="text-slate-400 font-normal ml-1">{unit}</span> : null}</span>
    </div>
  );
}

function Tag({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-medium"><CheckCircle className="w-3 h-3" />Cumple</span>
    : <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 font-medium"><XCircle className="w-3 h-3" />No cumple</span>;
}

function n(v: number, d = 2) { return v.toFixed(d); }

// ─── PROCEDIMIENTO NTP ────────────────────────────────────────────────────────

function ProcedimientoNTP({ p, r }: { p: Params; r: CalcResult }) {
  return (
    <div className="space-y-0 text-slate-700">

      <Paso n={1} title="Peralte efectivo">
        <FormulaBox>
          d = h − r = {n(p.h)} − {n(p.r)} = <strong>{n(r.d)} cm</strong>
        </FormulaBox>
        <p className="text-[11px] text-slate-400">Distancia del borde comprimido al centroide del acero en tensión</p>
      </Paso>

      <Paso n={2} title="Factor β₁  (NTP E.060 §10.2.7.3)">
        {p.fc <= 280
          ? <FormulaBox>f&apos;c = {n(p.fc, 0)} kgf/cm² ≤ 280 kgf/cm²  →  β₁ = <strong>0.85</strong></FormulaBox>
          : <>
              <FormulaBox>
                β₁ = 0.85 − 0.05 · <Frac num={`f'c − 280`} den="70" /> = 0.85 − 0.05 · <Frac num={`${n(p.fc,0)} − 280`} den="70" /> = <strong>{n(r.beta1, 4)}</strong>
              </FormulaBox>
              <p className="text-[11px] text-slate-400">β₁ ≥ 0.65 ✓ (valor mínimo permitido)</p>
            </>
        }
      </Paso>

      <Paso n={3} title="Acero mínimo de flexión  (NTP E.060 §10.5.1)">
        <p className="text-[11px] text-slate-500 mb-1">Criterio 1 — función de la resistencia del concreto:</p>
        <FormulaBox color="emerald">
          As₁ = <Frac num={<>0.7 · <Sqrt>f&apos;c</Sqrt></>} den="fy" /> · b · d
          {" = "}<Frac num={<>0.7 · <Sqrt>{n(p.fc,0)}</Sqrt></>} den={n(p.fy,0)} /> · {n(p.b)} · {n(r.d)}
          {" = "}<strong>{n(r.As_min1)} cm²</strong>
        </FormulaBox>
        <p className="text-[11px] text-slate-500 mt-2 mb-1">Criterio 2 — mínimo absoluto:</p>
        <FormulaBox color="emerald">
          As₂ = <Frac num="14" den="fy" /> · b · d
          {" = "}<Frac num="14" den={n(p.fy,0)} /> · {n(p.b)} · {n(r.d)}
          {" = "}<strong>{n(r.As_min2)} cm²</strong>
        </FormulaBox>
        <FormulaBox>
          As,min = max(As₁, As₂) = max({n(r.As_min1)}, {n(r.As_min2)}) = <strong>{n(r.As_min)} cm²</strong>
          {"  ← Rige criterio "}{r.governa}
        </FormulaBox>
      </Paso>

      <Paso n={4} title="Acero máximo — zona de tensión controlada  (NTP E.060 §10.3.3)">
        <p className="text-[11px] text-slate-400 mb-1">Deformación mínima en acero: εt = 0.004 (falla dúctil)</p>
        <FormulaBox>
          c,max = <Frac num="εcu" den="εcu + εt,min" /> · d = <Frac num="0.003" den="0.003 + 0.004" /> · {n(r.d)} = <strong>{n(r.c_max)} cm</strong>
        </FormulaBox>
        <FormulaBox>
          a,max = β₁ · c,max = {n(r.beta1,4)} · {n(r.c_max)} = <strong>{n(r.a_max)} cm</strong>
        </FormulaBox>
        <FormulaBox color="emerald">
          As,max = <Frac num="0.85 · f'c · b · a,max" den="fy" />
          {" = "}<Frac num={`0.85 · ${n(p.fc,0)} · ${n(p.b)} · ${n(r.a_max)}`} den={n(p.fy,0)} />
          {" = "}<strong>{n(r.As_max)} cm²</strong>
        </FormulaBox>
      </Paso>

      <Paso n={5} title="Cuantías de refuerzo">
        <div className="grid grid-cols-2 gap-1.5">
          <Resultado label="ρ mínimo" value={(r.rho_min * 100).toFixed(4)} unit="%" />
          <Resultado label="ρ máximo" value={(r.rho_max * 100).toFixed(4)} unit="%" />
          <Resultado label="ρ balanceado" value={(r.rho_bal * 100).toFixed(4)} unit="%" />
          {r.rho_prov !== null && <Resultado label="ρ provisto" value={(r.rho_prov * 100).toFixed(4)} unit="%" highlight />}
        </div>
        <FormulaBox>
          ρ,bal = <Frac num="0.85 · β₁ · f'c" den="fy" /> · <Frac num="6120" den="6120 + fy" />
          {" = "}{n(r.rho_bal, 5)}
        </FormulaBox>
        <p className="text-[11px] text-slate-400">ρ,bal es referencial. El diseño exige ρ ≤ ρ,max para garantizar ductilidad.</p>
      </Paso>

      {r.As_prov !== null && (
        <Paso n={6} title="Verificación del acero provisto">
          <FormulaBox>
            As,prov = <strong>{n(r.As_prov)} cm²</strong>
          </FormulaBox>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2">
              <span className="text-[11px] text-slate-600">As,prov ≥ As,min  →  {n(r.As_prov)} ≥ {n(r.As_min)} cm²</span>
              <Tag ok={r.cumple_min!} />
            </div>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2">
              <span className="text-[11px] text-slate-600">As,prov ≤ As,max  →  {n(r.As_prov)} ≤ {n(r.As_max)} cm²</span>
              <Tag ok={r.cumple_max!} />
            </div>
          </div>
        </Paso>
      )}
    </div>
  );
}

// ─── PROCEDIMIENTO ACI ────────────────────────────────────────────────────────

function ProcedimientoACI({ p, r, version }: { p: Params; r: CalcResult; version: ACIVersion }) {
  const sec = version === "318-19" ? "§9.6.1.2" : "§9.6.1.2";
  const secMax = version === "318-19" ? "§21.2.2" : "§21.2.2";
  return (
    <div className="space-y-0 text-slate-700">

      <Paso n={1} title="Peralte efectivo">
        <FormulaBox>
          d = h − r = {n(p.h)} − {n(p.r)} = <strong>{n(r.d)} cm</strong>
        </FormulaBox>
      </Paso>

      <Paso n={2} title={`Factor β₁  (ACI 318-${version} §22.2.2.4.3)`}>
        {p.fc <= 280
          ? <FormulaBox>f&apos;c = {n(p.fc,0)} kgf/cm² ≤ 280 kgf/cm²  →  β₁ = <strong>0.85</strong></FormulaBox>
          : <FormulaBox>
              β₁ = 0.85 − 0.05 · <Frac num="f'c − 280" den="70" /> = <strong>{n(r.beta1,4)}</strong> ≥ 0.65 ✓
            </FormulaBox>
        }
      </Paso>

      <Paso n={3} title={`Acero mínimo  (ACI 318-${version} ${sec})`}>
        <div className="flex items-start gap-2 text-[11px] text-slate-400 mb-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <span>Las constantes 0.7982 y 14.276 son la conversión exacta de los coeficientes ACI (0.25 y 1.4 en MPa) al sistema kgf/cm². k₁ = 0.25·√10.197 ≈ 0.7982; k₂ = 1.4·10.197 ≈ 14.276</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-1">Criterio 1:</p>
        <FormulaBox color="blue">
          As₁ = <Frac num={<>0.7982 · <Sqrt>f&apos;c</Sqrt></>} den="fy" /> · b · d
          {" = "}<Frac num={<>0.7982 · <Sqrt>{n(p.fc,0)}</Sqrt></>} den={n(p.fy,0)} /> · {n(p.b)} · {n(r.d)}
          {" = "}<strong>{n(r.As_min1)} cm²</strong>
        </FormulaBox>
        <p className="text-[11px] text-slate-500 mt-2 mb-1">Criterio 2:</p>
        <FormulaBox color="blue">
          As₂ = <Frac num="14.276" den="fy" /> · b · d
          {" = "}<Frac num="14.276" den={n(p.fy,0)} /> · {n(p.b)} · {n(r.d)}
          {" = "}<strong>{n(r.As_min2)} cm²</strong>
        </FormulaBox>
        <FormulaBox>
          As,min = max({n(r.As_min1)}, {n(r.As_min2)}) = <strong>{n(r.As_min)} cm²</strong>
          {"  ← Rige criterio "}{r.governa}
        </FormulaBox>
      </Paso>

      <Paso n={4} title={`Acero máximo  (ACI 318-${version} ${secMax})`}>
        <p className="text-[11px] text-slate-400 mb-1">εt,min = 0.004 (zona de tensión controlada, falla dúctil)</p>
        <FormulaBox>
          c,max = <Frac num="0.003" den="0.007" /> · {n(r.d)} = <strong>{n(r.c_max)} cm</strong>
        </FormulaBox>
        <FormulaBox>
          a,max = {n(r.beta1,4)} · {n(r.c_max)} = <strong>{n(r.a_max)} cm</strong>
        </FormulaBox>
        <FormulaBox color="blue">
          As,max = <Frac num="0.85 · f'c · b · a,max" den="fy" />
          {" = "}<strong>{n(r.As_max)} cm²</strong>
        </FormulaBox>
      </Paso>

      <Paso n={5} title="Cuantías de refuerzo">
        <div className="grid grid-cols-2 gap-1.5">
          <Resultado label="ρ mínimo" value={(r.rho_min * 100).toFixed(4)} unit="%" />
          <Resultado label="ρ máximo" value={(r.rho_max * 100).toFixed(4)} unit="%" />
          <Resultado label="ρ balanceado" value={(r.rho_bal * 100).toFixed(4)} unit="%" />
          {r.rho_prov !== null && <Resultado label="ρ provisto" value={(r.rho_prov * 100).toFixed(4)} unit="%" highlight />}
        </div>
      </Paso>

      {r.As_prov !== null && (
        <Paso n={6} title="Verificación del acero provisto">
          <FormulaBox>As,prov = <strong>{n(r.As_prov)} cm²</strong></FormulaBox>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2">
              <span className="text-[11px] text-slate-600">As,prov ≥ As,min  →  {n(r.As_prov)} ≥ {n(r.As_min)} cm²</span>
              <Tag ok={r.cumple_min!} />
            </div>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2">
              <span className="text-[11px] text-slate-600">As,prov ≤ As,max  →  {n(r.As_prov)} ≤ {n(r.As_max)} cm²</span>
              <Tag ok={r.cumple_max!} />
            </div>
          </div>
        </Paso>
      )}
    </div>
  );
}

// ─── CONCLUSIÓN ───────────────────────────────────────────────────────────────

function Conclusion({ r, norma }: { r: CalcResult; norma: string }) {
  if (r.As_prov === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 flex-shrink-0" />
        Ingresa capas de acero para evaluar si el diseño cumple con {norma}.
      </div>
    );
  }
  if (r.cumple) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle className="w-5 h-5" /> CUMPLE — {norma}
        </div>
        <p className="text-xs text-emerald-700">
          El acero provisto ({n(r.As_prov)} cm²) está dentro del rango permitido:
          As,min = {n(r.As_min)} cm² ≤ <strong>{n(r.As_prov)} cm²</strong> ≤ As,max = {n(r.As_max)} cm²
        </p>
        <p className="text-xs text-emerald-600">La viga tiene suficiente refuerzo para evitar falla frágil y no está sobrereforzada.</p>
      </div>
    );
  }
  const msgs: string[] = [];
  if (!r.cumple_min)
    msgs.push(`Acero insuficiente: As,prov = ${n(r.As_prov)} cm² < As,min = ${n(r.As_min)} cm². Riesgo de falla frágil sin previo aviso.`);
  if (!r.cumple_max)
    msgs.push(`Acero excesivo: As,prov = ${n(r.As_prov)} cm² > As,max = ${n(r.As_max)} cm². La sección fallaría por aplastamiento del concreto antes de que fluya el acero.`);
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
        <XCircle className="w-5 h-5" /> NO CUMPLE — {norma}
      </div>
      {msgs.map((m, i) => <p key={i} className="text-xs text-red-700">• {m}</p>)}
    </div>
  );
}

// ─── VISUALIZADOR SVG ─────────────────────────────────────────────────────────
// Dibuja sección transversal con barras agrupadas por capas.

function SectionSVG({ b, h, r, capas }: { b: number; h: number; r: number; capas: Capa[] }) {
  const W = 210, H = 270;
  const scale = Math.min((W - 40) / b, (H - 60) / h);
  const rw = b * scale, rh = h * scale;
  const ox = (W - rw) / 2, oy = (H - rh) / 2;
  const rv = r * scale;

  // Distribuir capas de abajo hacia arriba
  const layerOffset = 1.5; // cm entre capas
  const bars: { cx: number; cy: number; rx: number; label: string }[] = [];

  capas.forEach((capa, ci) => {
    const varilla = VARILLAS[capa.varilla];
    const diam_cm = Math.sqrt(varilla.area / Math.PI) * 2; // diámetro estimado en cm
    const barR_px = Math.max(2.5, (diam_cm / 2) * scale);
    const yOffset = rv + ci * layerOffset * scale;
    const spacing = (rw - 2 * rv) / (capa.cantidad + 1);
    for (let i = 0; i < capa.cantidad; i++) {
      bars.push({
        cx: ox + rv + spacing * (i + 1),
        cy: oy + rh - yOffset,
        rx: barR_px,
        label: VARILLAS[capa.varilla].label.split(" ")[0],
      });
    }
  });

  return (
    <svg width={W} height={H} className="mx-auto">
      {/* Concreto */}
      <rect x={ox} y={oy} width={rw} height={rh} fill="#dbeafe" stroke="#1e40af" strokeWidth="2" />
      {/* Recubrimiento */}
      <rect x={ox + rv} y={oy + rv} width={rw - 2 * rv} height={rh - 2 * rv}
        fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="4 3" />
      {/* Ejes de centroide por capa */}
      {capas.map((_, ci) => {
        const yOff = rv + ci * 1.5 * scale;
        return (
          <line key={ci} x1={ox + rv} x2={ox + rw - rv}
            y1={oy + rh - yOff} y2={oy + rh - yOff}
            stroke="#ef4444" strokeWidth="0.8" strokeDasharray="4 3" opacity={0.6} />
        );
      })}
      {/* Barras */}
      {bars.map((bar, i) => (
        <circle key={i} cx={bar.cx} cy={bar.cy} r={bar.rx}
          fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1" />
      ))}
      {/* Cota b */}
      <line x1={ox} x2={ox + rw} y1={oy + rh + 12} y2={oy + rh + 12} stroke="#475569" strokeWidth="1" />
      <text x={ox + rw / 2} y={oy + rh + 24} textAnchor="middle" fontSize="10" fill="#475569">b = {n(b)} cm</text>
      {/* Cota h */}
      <line x1={ox - 12} x2={ox - 12} y1={oy} y2={oy + rh} stroke="#475569" strokeWidth="1" />
      <text x={ox - 18} y={oy + rh / 2} textAnchor="middle" fontSize="10" fill="#475569"
        transform={`rotate(-90,${ox - 18},${oy + rh / 2})`}>h = {n(h)} cm</text>
      {/* d efectivo */}
      <line x1={ox + rw + 10} x2={ox + rw + 10} y1={oy} y2={oy + rh - rv}
        stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
      <text x={ox + rw + 20} y={oy + (rh - rv) / 2} fontSize="9" fill="#ef4444">d</text>
    </svg>
  );
}

// ─── GENERADOR PDF ────────────────────────────────────────────────────────────

function generarReporte(p: Params, ntp: CalcResult, aci: CalcResult, capas: Capa[], aciVersion: ACIVersion) {
  const As_prov = ntp.As_prov;
  const capasList = capas.map(c =>
    `${c.cantidad} var. ${VARILLAS[c.varilla].label.split(" ")[0]} (${n(c.cantidad * VARILLAS[c.varilla].area)} cm²)`
  ).join(", ");

  const row = (lbl: string, val: string) => `<tr><td>${lbl}</td><td>${val}</td></tr>`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Reporte — Mínimos y Máximos de Acero</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;margin:28px;line-height:1.6}
  h1{font-size:16px;color:#1e3a8a;border-bottom:2px solid #1e3a8a;padding-bottom:6px;margin-bottom:4px}
  h2{font-size:12px;color:#1e40af;margin-top:18px;margin-bottom:6px}
  .sub{color:#64748b;font-size:10px;margin-bottom:14px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:12px}
  .card{border:1px solid #cbd5e1;border-radius:6px;padding:12px}
  .card-hdr{font-weight:700;font-size:11px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;margin-bottom:8px}
  table{width:100%;border-collapse:collapse}
  td{padding:4px 6px;border-bottom:1px solid #f1f5f9;vertical-align:top}
  td:last-child{text-align:right;font-weight:600}
  .ok{color:#059669;font-weight:700} .fail{color:#dc2626;font-weight:700}
  .concl{border-radius:6px;padding:10px;margin-top:10px;font-size:11px}
  .concl-ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}
  .concl-fail{background:#fef2f2;border:1px solid #fca5a5;color:#991b1b}
  .params{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px}
  .param{text-align:center} .param span{display:block;font-size:9px;color:#64748b} .param strong{font-size:13px;color:#1e3a8a}
  .footer{margin-top:24px;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:6px}
  @media print{body{margin:14px}}
</style></head><body>
<h1>Mínimos y Máximos de Acero — Viga Rectangular</h1>
<div class="sub">Comparativa NTP E.060-2009 / ACI ${aciVersion} · Unidades: kgf/cm² y cm</div>

<h2>Datos de la viga</h2>
<div class="params">
  <div class="param"><span>f'c</span><strong>${n(p.fc,0)} kgf/cm²</strong></div>
  <div class="param"><span>fy</span><strong>${n(p.fy,0)} kgf/cm²</strong></div>
  <div class="param"><span>b</span><strong>${n(p.b)} cm</strong></div>
  <div class="param"><span>h</span><strong>${n(p.h)} cm</strong></div>
  <div class="param"><span>r</span><strong>${n(p.r)} cm</strong></div>
  <div class="param"><span>d efectivo</span><strong>${n(ntp.d)} cm</strong></div>
</div>
${As_prov !== null ? `<p><strong>Acero provisto:</strong> ${capasList} → <strong>As,prov = ${n(As_prov)} cm²</strong></p>` : ""}

<div class="grid">
  <div class="card">
    <div class="card-hdr">NTP E.060-2009</div>
    <table>
      ${row("β₁", n(ntp.beta1, 4))}
      ${row("As,min (cm²)", n(ntp.As_min))}
      ${row("As,max (cm²)", n(ntp.As_max))}
      ${row("ρ mínimo", (ntp.rho_min*100).toFixed(4)+" %")}
      ${row("ρ máximo", (ntp.rho_max*100).toFixed(4)+" %")}
      ${row("ρ balanceado", (ntp.rho_bal*100).toFixed(4)+" %")}
      ${As_prov !== null ? row("As provisto (cm²)", `<strong>${n(As_prov)}</strong>`) : ""}
    </table>
    ${As_prov !== null ? `<div class="concl ${ntp.cumple ? "concl-ok" : "concl-fail"}">
      <strong>${ntp.cumple ? "✓ CUMPLE" : "✗ NO CUMPLE"} — NTP E.060-2009</strong><br>
      ${ntp.cumple_min ? "✓" : "✗"} As ≥ As,min: ${n(As_prov)} ≥ ${n(ntp.As_min)} cm²<br>
      ${ntp.cumple_max ? "✓" : "✗"} As ≤ As,max: ${n(As_prov)} ≤ ${n(ntp.As_max)} cm²
    </div>` : ""}
  </div>
  <div class="card">
    <div class="card-hdr">ACI ${aciVersion}</div>
    <table>
      ${row("β₁", n(aci.beta1, 4))}
      ${row("As,min (cm²)", n(aci.As_min))}
      ${row("As,max (cm²)", n(aci.As_max))}
      ${row("ρ mínimo", (aci.rho_min*100).toFixed(4)+" %")}
      ${row("ρ máximo", (aci.rho_max*100).toFixed(4)+" %")}
      ${row("ρ balanceado", (aci.rho_bal*100).toFixed(4)+" %")}
      ${As_prov !== null ? row("As provisto (cm²)", `<strong>${n(As_prov)}</strong>`) : ""}
    </table>
    ${As_prov !== null ? `<div class="concl ${aci.cumple ? "concl-ok" : "concl-fail"}">
      <strong>${aci.cumple ? "✓ CUMPLE" : "✗ NO CUMPLE"} — ACI ${aciVersion}</strong><br>
      ${aci.cumple_min ? "✓" : "✗"} As ≥ As,min: ${n(As_prov)} ≥ ${n(aci.As_min)} cm²<br>
      ${aci.cumple_max ? "✓" : "✗"} As ≤ As,max: ${n(As_prov)} ≤ ${n(aci.As_max)} cm²
    </div>` : ""}
  </div>
</div>

<div class="footer">
  Generado por Curso Análisis Estructural · ${new Date().toLocaleDateString("es-PE",{year:"numeric",month:"long",day:"numeric"})}
  · Solo para fines educativos. Verificar con normativa vigente antes de usar en proyecto real.
</div>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

const DEFAULTS: Params = { fc: 280, fy: 4200, b: 30, h: 60, r: 6.5 };

export default function MinimosMaximosPage() {
  const router = useRouter();
  const [p, setP] = useState<Params>(DEFAULTS);
  const [capas, setCapas] = useState<Capa[]>([]);
  const [nextId, setNextId] = useState(1);
  const [aciVersion, setAciVersion] = useState<ACIVersion>("318-19");

  const set = (k: keyof Params) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }));

  // Área de acero total provista por todas las capas
  const As_prov = useMemo(() =>
    capas.length > 0
      ? capas.reduce((sum, c) => sum + c.cantidad * VARILLAS[c.varilla].area, 0)
      : null,
    [capas]
  );

  const ntp = useMemo(() => calcNTP(p, As_prov), [p, As_prov]);
  const aci = useMemo(() => calcACI(p, As_prov), [p, As_prov]);

  const valid = p.fc > 0 && p.fy > 0 && p.b > 0 && p.h > p.r && p.r > 0;

  function agregarCapa() {
    setCapas(prev => [...prev, { id: nextId, varilla: 1, cantidad: 3 }]);
    setNextId(n => n + 1);
  }
  function quitarCapa(id: number) { setCapas(prev => prev.filter(c => c.id !== id)); }
  function setCapa(id: number, field: keyof Omit<Capa, "id">, val: number) {
    setCapas(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-blue-900 leading-tight">Mínimos y Máximos de Acero — Viga Rectangular</h1>
          <p className="text-xs text-slate-400">NTP E.060-2009 · ACI 318  |  Unidades: kgf/cm² · cm</p>
        </div>
        {/* Selector versión ACI */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs font-semibold">
          {(["318-19", "318-25"] as ACIVersion[]).map(v => (
            <button key={v} onClick={() => setAciVersion(v)}
              className={`px-3 py-1 rounded-md transition-colors ${aciVersion === v ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              ACI {v}
            </button>
          ))}
        </div>
        <button onClick={() => valid && generarReporte(p, ntp, aci, capas, aciVersion)}
          disabled={!valid}
          className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors">
          <FileText className="w-3.5 h-3.5" /> Reporte PDF
        </button>
      </div>

      {/* ── LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="space-y-4">

          {/* Geometría */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Datos de la viga
            </h2>
            <div className="space-y-3">
              {[
                { k: "fc", label: "f'c — Resistencia concreto", unit: "kgf/cm²", step: 10, min: 140 },
                { k: "fy", label: "fy — Fluencia del acero",    unit: "kgf/cm²", step: 100, min: 2000 },
                { k: "b",  label: "b — Ancho de la sección",    unit: "cm", step: 1, min: 10 },
                { k: "h",  label: "h — Altura total",           unit: "cm", step: 1, min: 10 },
                { k: "r",  label: "r — Recubrimiento a centroide", unit: "cm", step: 0.5, min: 3 },
              ].map(({ k, label, unit, step, min }) => (
                <div key={k}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={p[k as keyof Params]} onChange={set(k as keyof Params)}
                      step={step} min={min}
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
                    <span className="text-[11px] text-slate-400 w-16 text-right">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {!valid && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> h debe ser mayor que r
              </div>
            )}
          </div>

          {/* Capas de acero */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Acero provisto por capas
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">Ingresa las capas de refuerzo de tracción (de abajo hacia arriba)</p>

            <div className="space-y-2">
              {capas.map((capa, ci) => (
                <div key={capa.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Capa {ci + 1}</span>
                    <button onClick={() => quitarCapa(capa.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Varilla</label>
                      <select value={capa.varilla}
                        onChange={e => setCapa(capa.id, "varilla", parseInt(e.target.value))}
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white">
                        {VARILLAS.map((v, i) => (
                          <option key={i} value={i}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Cantidad</label>
                      <input type="number" min={1} max={20} value={capa.cantidad}
                        onChange={e => setCapa(capa.id, "cantidad", parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 bg-white border border-slate-100 rounded-md px-2 py-1.5 text-right">
                    As capa {ci+1} = {capa.cantidad} × {n(VARILLAS[capa.varilla].area)} = <strong>{n(capa.cantidad * VARILLAS[capa.varilla].area)} cm²</strong>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={agregarCapa}
              className="mt-3 flex items-center gap-2 w-full justify-center py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-400 hover:text-blue-600 text-xs rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar capa
            </button>

            {As_prov !== null && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <span className="text-xs text-blue-700 font-medium">As total provisto</span>
                <span className="text-sm font-bold text-blue-800">{n(As_prov)} cm²</span>
              </div>
            )}
          </div>

          {/* SVG */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Sección transversal
            </h2>
            <SectionSVG b={p.b} h={p.h} r={p.r} capas={capas} />
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-slate-400 block text-[10px]">d efectivo</span>
                <span className="font-bold text-slate-800">{n(ntp.d)} cm</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-slate-400 block text-[10px]">β₁</span>
                <span className="font-bold text-slate-800">{n(ntp.beta1, 3)}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-slate-400 block text-[10px]">As prov.</span>
                <span className="font-bold text-slate-800">{As_prov !== null ? n(As_prov)+" cm²" : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── TARJETA NTP ── */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-emerald-700 px-5 py-3">
                <p className="text-white font-bold text-sm">NTP E.060-2009</p>
                <p className="text-emerald-200 text-xs">Reglamento Nacional de Edificaciones — kgf/cm², cm</p>
              </div>
              <div className="p-5">
                {/* Resultados rápidos */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <span className="block text-[10px] text-emerald-600 mb-1">As,min</span>
                    <span className="text-lg font-bold text-emerald-800">{n(ntp.As_min)}</span>
                    <span className="text-xs text-emerald-600 ml-1">cm²</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <span className="block text-[10px] text-emerald-600 mb-1">As,max</span>
                    <span className="text-lg font-bold text-emerald-800">{n(ntp.As_max)}</span>
                    <span className="text-xs text-emerald-600 ml-1">cm²</span>
                  </div>
                </div>

                {/* Procedimiento */}
                <div className="border-t border-slate-100 pt-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Procedimiento paso a paso</p>
                  <ProcedimientoNTP p={p} r={ntp} />
                </div>

                {/* Conclusión */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Conclusión</p>
                  <Conclusion r={ntp} norma="NTP E.060-2009" />
                </div>
              </div>
            </div>

            {/* ── TARJETA ACI ── */}
            <div className="bg-white border-2 border-blue-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">ACI {aciVersion}</p>
                  <p className="text-blue-200 text-xs">Building Code Requirements — kgf/cm², cm</p>
                </div>
                <div className="flex items-center gap-1 bg-blue-800 rounded-md p-0.5 text-[11px]">
                  {(["318-19", "318-25"] as ACIVersion[]).map(v => (
                    <button key={v} onClick={() => setAciVersion(v)}
                      className={`px-2 py-0.5 rounded transition-colors ${aciVersion === v ? "bg-white text-blue-700 font-bold" : "text-blue-300 hover:text-white"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <span className="block text-[10px] text-blue-600 mb-1">As,min</span>
                    <span className="text-lg font-bold text-blue-800">{n(aci.As_min)}</span>
                    <span className="text-xs text-blue-600 ml-1">cm²</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <span className="block text-[10px] text-blue-600 mb-1">As,max</span>
                    <span className="text-lg font-bold text-blue-800">{n(aci.As_max)}</span>
                    <span className="text-xs text-blue-600 ml-1">cm²</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Procedimiento paso a paso</p>
                  <ProcedimientoACI p={p} r={aci} version={aciVersion} />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Conclusión</p>
                  <Conclusion r={aci} norma={`ACI ${aciVersion}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ── TABLA COMPARATIVA ── */}
          {valid && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Comparativa NTP E.060 vs ACI {aciVersion}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Parámetro</th>
                      <th className="text-right py-2 px-3 text-emerald-700 font-semibold">NTP E.060</th>
                      <th className="text-right py-2 px-3 text-blue-700 font-semibold">ACI {aciVersion}</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Δ%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { label: "As,min (cm²)",    ntpV: ntp.As_min,        aciV: aci.As_min, dec: 2 },
                      { label: "As,max (cm²)",    ntpV: ntp.As_max,        aciV: aci.As_max, dec: 2 },
                      { label: "ρ mínimo (%)",    ntpV: ntp.rho_min*100,   aciV: aci.rho_min*100, dec: 4 },
                      { label: "ρ máximo (%)",    ntpV: ntp.rho_max*100,   aciV: aci.rho_max*100, dec: 4 },
                      { label: "ρ balanceado (%)",ntpV: ntp.rho_bal*100,   aciV: aci.rho_bal*100, dec: 4 },
                    ].map(({ label, ntpV, aciV, dec }) => {
                      const diff = ((ntpV - aciV) / aciV * 100).toFixed(1);
                      const isPos = ntpV > aciV;
                      return (
                        <tr key={label}>
                          <td className="py-2 px-3 text-slate-600">{label}</td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-700">{ntpV.toFixed(dec)}</td>
                          <td className="py-2 px-3 text-right font-semibold text-blue-700">{aciV.toFixed(dec)}</td>
                          <td className={`py-2 px-3 text-right font-medium ${isPos ? "text-orange-500" : "text-slate-400"}`}>
                            {isPos ? "+" : ""}{diff}%
                          </td>
                        </tr>
                      );
                    })}
                    {As_prov !== null && (
                      <tr className="bg-slate-50">
                        <td className="py-2 px-3 text-slate-700 font-semibold">As provisto (cm²)</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800" colSpan={2}>{n(As_prov)}</td>
                        <td className="py-2 px-3 text-right">
                          {ntp.cumple === aci.cumple
                            ? (ntp.cumple ? <span className="text-emerald-600 font-bold">Cumple ambas</span> : <span className="text-red-500 font-bold">No cumple</span>)
                            : <span className="text-orange-500 font-bold">Ver por norma</span>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                NTP usa constantes en kgf/cm² (0.7 y 14) que difieren de ACI (equivalentes a 0.7982 y 14.276 en kgf/cm²). Las diferencias reflejan el redondeo histórico de cada código.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
