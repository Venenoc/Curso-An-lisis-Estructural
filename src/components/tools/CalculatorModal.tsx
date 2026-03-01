"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export interface FieldDef {
  name: string;
  label: string;
  unit?: string;
  type?: "number" | "select";
  options?: { value: string; label: string }[];
  defaultValue?: number | string;
  min?: number;
  step?: number;
}

export interface CalculatorConfig {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  fields: FieldDef[];
  renderResult?: (data: any) => React.ReactNode;
}

interface Props {
  config: CalculatorConfig;
  onClose: () => void;
}

export default function CalculatorModal({ config, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    config.fields.forEach((f) => {
      init[f.name] = f.defaultValue !== undefined ? String(f.defaultValue) : "";
    });
    return init;
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    setResult(null);

    const params: Record<string, any> = {};
    for (const field of config.fields) {
      const val = values[field.name];
      if (field.type === "select") {
        params[field.name] = val;
      } else {
        const n = parseFloat(val);
        if (isNaN(n)) {
          setError(`El campo "${field.label}" debe ser un número.`);
          setLoading(false);
          return;
        }
        params[field.name] = n;
      }
    }

    try {
      const res = await fetch("/api/tools/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: config.endpoint, params }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Error al calcular");
      } else {
        setResult(data);
      }
    } catch {
      setError("No se pudo conectar con el servidor de cálculo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/60">
          <div>
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {field.label}
                  {field.unit && (
                    <span className="ml-1 text-cyan-400">({field.unit})</span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    value={values[field.name]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={values[field.name]}
                    min={field.min}
                    step={field.step ?? "any"}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                    placeholder="0"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Resultados del cálculo
              </div>
              {config.renderResult ? (
                config.renderResult(result)
              ) : (
                <ResultTable data={result} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/40 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Calculando..." : "Calcular"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tabla genérica de resultados key-value */
function ResultTable({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data).filter(
    ([, v]) => typeof v !== "object" || v === null
  );
  const nested = Object.entries(data).filter(
    ([, v]) => v !== null && typeof v === "object" && !Array.isArray(v)
  );
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <div className="bg-slate-800/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {entries.map(([key, val]) => (
                <tr key={key} className="border-b border-slate-700/50 last:border-0">
                  <td className="px-4 py-2 text-slate-400 font-mono text-xs">{key}</td>
                  <td className="px-4 py-2 text-white font-medium text-right">
                    {typeof val === "boolean"
                      ? val
                        ? "✓ OK"
                        : "✗ No cumple"
                      : String(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nested.map(([key, val]) => (
        <div key={key}>
          <p className="text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wide">
            {key}
          </p>
          <ResultTable data={val as Record<string, any>} />
        </div>
      ))}

      {arrays.map(([key, arr]) =>
        (arr as any[]).length > 0 && typeof (arr as any[])[0] === "object" ? (
          <div key={key}>
            <p className="text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wide">
              {key}
            </p>
            <div className="bg-slate-800/60 rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    {Object.keys((arr as any[])[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-slate-400 font-mono text-left">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(arr as any[]).slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-slate-700/40 last:border-0">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-1.5 text-white">
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(arr as any[]).length > 20 && (
                <p className="text-xs text-slate-500 px-3 py-1">
                  ... y {(arr as any[]).length - 20} filas más
                </p>
              )}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
