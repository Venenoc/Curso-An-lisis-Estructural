"""
Cálculos de propiedades de sección y análisis estructural básico
Unidades: mm para dimensiones, resultados en mm², mm⁴, etc.
"""
import math
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal, List

router = APIRouter()

# ─── Modelos ──────────────────────────────────────────────────────────────────

class SeccionRectInput(BaseModel):
    tipo: Literal["rectangulo"] = "rectangulo"
    b: float   # mm (ancho)
    h: float   # mm (altura)

class SeccionCircInput(BaseModel):
    tipo: Literal["circulo"] = "circulo"
    d: float   # mm (diámetro)

class SeccionIInput(BaseModel):
    tipo: Literal["I"] = "I"
    bf: float  # mm (ancho de ala)
    tf: float  # mm (espesor de ala)
    d: float   # mm (altura total)
    tw: float  # mm (espesor de alma)

class SeccionCajonInput(BaseModel):
    tipo: Literal["cajon"] = "cajon"
    B: float   # mm (ancho exterior)
    H: float   # mm (altura exterior)
    t: float   # mm (espesor de pared)

class VigaSimpleInput(BaseModel):
    L_m: float          # Longitud (m)
    EI_kNm2: float      # Rigidez a flexión (kN·m²)
    cargas: List[dict]  # [{"tipo":"dist","w":10},{"tipo":"puntual","P":50,"a":2.5}]

# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/seccion")
def propiedades_seccion(data: dict):
    """
    Propiedades geométricas de sección transversal.
    Pasa 'tipo': 'rectangulo' | 'circulo' | 'I' | 'cajon' junto con las dimensiones.
    """
    tipo = data.get("tipo", "rectangulo")

    if tipo == "rectangulo":
        b, h = data["b"], data["h"]
        A = b * h
        Ix = b * h**3 / 12
        Iy = h * b**3 / 12
        Sx = Ix / (h / 2)
        Sy = Iy / (b / 2)
        rx = math.sqrt(Ix / A)
        ry = math.sqrt(Iy / A)
        return _props("Sección Rectangular", A, Ix, Iy, Sx, Sy, rx, ry, extra={
            "Zx_mm3": round(b * h**2 / 4, 2),
            "Zy_mm3": round(h * b**2 / 4, 2),
        })

    elif tipo == "circulo":
        d = data["d"]
        r = d / 2
        A = math.pi * r**2
        I = math.pi * r**4 / 4
        S = I / r
        rg = r / 2
        return _props("Sección Circular", A, I, I, S, S, rg, rg)

    elif tipo == "I":
        bf, tf, d, tw = data["bf"], data["tf"], data["d"], data["tw"]
        hw = d - 2 * tf
        A = 2 * bf * tf + hw * tw
        Ix = (bf * d**3 - (bf - tw) * hw**3) / 12
        Iy = (2 * tf * bf**3 + hw * tw**3) / 12
        Sx = Ix / (d / 2)
        Sy = Iy / (bf / 2)
        rx = math.sqrt(Ix / A)
        ry = math.sqrt(Iy / A)
        Zx = bf * tf * (d - tf) + tw * hw**2 / 4
        Zy = tf * bf**2 / 2 + hw * tw**2 / 8  # aprox
        return _props("Perfil I", A, Ix, Iy, Sx, Sy, rx, ry, extra={
            "Zx_mm3": round(Zx, 2),
            "Zy_mm3": round(Zy, 2),
            "hw_mm": round(hw, 2),
            "hw_tw": round(hw / tw, 2),
            "bf_2tf": round(bf / (2 * tf), 2),
        })

    elif tipo == "cajon":
        B, H, t = data["B"], data["H"], data["t"]
        Bi, Hi = B - 2 * t, H - 2 * t
        A = B * H - Bi * Hi
        Ix = (B * H**3 - Bi * Hi**3) / 12
        Iy = (H * B**3 - Hi * Bi**3) / 12
        Sx = Ix / (H / 2)
        Sy = Iy / (B / 2)
        rx = math.sqrt(Ix / A)
        ry = math.sqrt(Iy / A)
        return _props("Sección Cajón (HSS)", A, Ix, Iy, Sx, Sy, rx, ry)

    return {"error": f"Tipo de sección desconocido: {tipo}"}


def _props(nombre, A, Ix, Iy, Sx, Sy, rx, ry, extra=None):
    result = {
        "nombre": nombre,
        "A_mm2": round(A, 2),
        "A_cm2": round(A / 100, 3),
        "Ix_mm4": round(Ix, 1),
        "Ix_cm4": round(Ix / 1e4, 4),
        "Iy_mm4": round(Iy, 1),
        "Iy_cm4": round(Iy / 1e4, 4),
        "Sx_mm3": round(Sx, 2),
        "Sx_cm3": round(Sx / 1000, 4),
        "Sy_mm3": round(Sy, 2),
        "Sy_cm3": round(Sy / 1000, 4),
        "rx_mm": round(rx, 3),
        "ry_mm": round(ry, 3),
    }
    if extra:
        result.update(extra)
    return result


@router.post("/viga-simple")
def analisis_viga_simple(data: VigaSimpleInput):
    """
    Análisis de viga biapoyada: reacciones, momento máximo y deflexión.
    Cargas soportadas: distribuida uniforme (w en kN/m) y puntual (P en kN, a en m desde apoyo izq.)
    """
    L = data.L_m
    EI = data.EI_kNm2

    RA = RB = 0.0
    Mmax = 0.0
    delta_max_mm = 0.0

    for carga in data.cargas:
        tipo = carga.get("tipo")

        if tipo == "dist":
            w = carga.get("w", 0)
            RA += w * L / 2
            RB += w * L / 2
            Mmax += w * L**2 / 8       # kN·m
            delta_max_mm += 5 * w * L**4 / (384 * EI) * 1000  # mm

        elif tipo == "puntual":
            P = carga.get("P", 0)
            a = carga.get("a", L / 2)
            b = L - a
            RA_p = P * b / L
            RB_p = P * a / L
            RA += RA_p
            RB += RB_p
            M_p = RA_p * a   # kN·m (momento bajo la carga)
            Mmax += M_p
            if abs(a - L / 2) < 0.01:
                delta_max_mm += P * L**3 / (48 * EI) * 1000
            else:
                # Aprox: posición de Mmax
                delta_max_mm += (P * b * (L**2 - b**2)**1.5) / (9 * math.sqrt(3) * EI * L) * 1000

    return {
        "RA_kN": round(RA, 3),
        "RB_kN": round(RB, 3),
        "Mmax_kNm": round(Mmax, 3),
        "delta_max_mm": round(delta_max_mm, 4),
        "notas": "Superposición lineal, viga biapoyada, Euler-Bernoulli",
    }
