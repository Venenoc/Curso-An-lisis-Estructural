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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{config.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                <label className="text-xs font-medium text-slate-700">
                  {field.label}
                  {field.unit && (
                    <span className="ml-1 text-blue-600">({field.unit})</span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    value={values[field.name]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    placeholder="0"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
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
        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
          <table className="w-full text-sm">
            <tbody>
              {entries.map(([key, val]) => (
                <tr key={key} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-2 text-slate-500 font-mono text-xs">{key}</td>
                  <td className="px-4 py-2 text-slate-800 font-medium text-right">
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
          <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">
            {key}
          </p>
          <ResultTable data={val as Record<string, any>} />
        </div>
      ))}

      {arrays.map(([key, arr]) =>
        (arr as any[]).length > 0 && typeof (arr as any[])[0] === "object" ? (
          <div key={key}>
            <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">
              {key}
            </p>
            <div className="bg-slate-50 rounded-xl overflow-x-auto border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    {Object.keys((arr as any[])[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-slate-500 font-mono text-left">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(arr as any[]).slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-1.5 text-slate-800">
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(arr as any[]).length > 20 && (
                <p className="text-xs text-slate-400 px-3 py-1">
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
