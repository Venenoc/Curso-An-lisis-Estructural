import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { endpoint, params } = await req.json();

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });
    }

    const url = `${PYTHON_API_URL}/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params ?? {}),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    // Python server not running or connection refused
    if (err?.cause?.code === "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Servidor de cálculo no disponible. Inicia el servidor Python con: uvicorn main:app --reload" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_API_URL}/health`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "offline" }, { status: 503 });
  }
}
