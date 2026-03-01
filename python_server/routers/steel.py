"""
Cálculos de diseño en acero estructural (AISC 360-22 LRFD)
Unidades: MPa, mm, kN, kN·m, cm⁴
"""
import math
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ─── Modelos de entrada ────────────────────────────────────────────────────────

class VigaIInput(BaseModel):
    Fy: float       # Fluencia (MPa) — típico A36=250, A572Gr50=345
    Fu: float       # Tensión última (MPa)
    Ix_cm4: float   # Momento de inercia fuerte (cm⁴)
    Sx_cm3: float   # Módulo elástico (cm⁶)
    Zx_cm3: float   # Módulo plástico (cm³)
    L_m: float      # Longitud de la viga (m)
    Mu_kNm: float   # Momento último de diseño (kN·m)
    Vu_kN: float    # Cortante último de diseño (kN)
    # Sección (opcional, para pandeo lateral)
    bf_mm: float = 200.0   # Ancho de ala (mm)
    tf_mm: float = 12.0    # Espesor de ala (mm)
    d_mm: float  = 400.0   # Altura total de la sección (mm)
    tw_mm: float = 8.0     # Espesor de alma (mm)
    Cb: float    = 1.0     # Factor de momento uniforme equivalente

class PandeoInput(BaseModel):
    Fy: float       # MPa
    A_cm2: float    # Área de la sección (cm²)
    rx_cm: float    # Radio de giro eje fuerte (cm)
    ry_cm: float    # Radio de giro eje débil (cm)
    Lx_m: float     # Longitud de pandeo eje fuerte (m)
    Ly_m: float     # Longitud de pandeo eje débil (m)
    Kx: float = 1.0  # Factor de longitud efectiva eje fuerte
    Ky: float = 1.0  # Factor de longitud efectiva eje débil
    Pu_kN: float = 0.0  # Carga axial última (para DCR)

class DeflexionInput(BaseModel):
    E_GPa: float = 200.0   # Módulo de elasticidad (GPa)
    Ix_cm4: float           # cm⁴
    L_m: float              # Longitud (m)
    w_kNm: float = 0.0     # Carga distribuida (kN/m)
    P_kN: float  = 0.0     # Carga puntual en centro (kN)
    limite: str  = "L/360" # Límite de deflexión ("L/240", "L/360", "L/480")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/viga-i")
def diseño_viga_i(data: VigaIInput):
    """
    Diseño de viga I a flexión + cortante con verificación de pandeo lateral
    (AISC 360-22, Capítulo F)
    """
    Fy, Fu = data.Fy, data.Fu
    Sx = data.Sx_cm3 * 1e3   # cm³ → mm³
    Zx = data.Zx_cm3 * 1e3
    L  = data.L_m * 1000      # m → mm
    Lb = L                     # Longitud sin arriostrar lateral (conservador: L completo)
    Cb = data.Cb
    bf, tf, d, tw = data.bf_mm, data.tf_mm, data.d_mm, data.tw_mm
    E = 200000  # MPa

    # ── Flexión (AISC 360-22 §F2) ──────────────────────────────────────────
    phi_b = 0.90
    Mp = Fy * Zx / 1e6         # kN·m (plasticidad)
    My = Fy * Sx / 1e6         # kN·m (primera fluencia)

    # Longitudes límite (sección doblemente simétrica)
    rts = math.sqrt(math.sqrt(Ix_from_bf_tf(bf, tf, d, tw) * (bf * tf**3 / 12)) / Sx) if False else bf / (math.sqrt(6 * (1 + d / (6 * tf))))
    # Simplificado: usar ry de ala comprimida
    ry_ala = bf / math.sqrt(12)
    c = 1.0  # sección doblemente simétrica
    J_cm4 = (1 / 3) * ((2 * bf * tf**3) + (d - 2 * tf) * tw**3) / 1e4  # cm⁴
    J_mm4 = J_cm4 * 1e4
    Cw_mm6 = (tf * bf**3 * (d - tf)**2) / 24  # aprox.
    Sx_mm3 = Sx
    ho = d - tf  # distancia entre centroides de alas

    Lp = 1.76 * ry_ala * math.sqrt(E / Fy)
    Lr = 1.95 * (bf / math.sqrt(6)) * (E / (0.7 * Fy)) * math.sqrt(
        J_mm4 / (Sx_mm3 * ho) + math.sqrt((J_mm4 / (Sx_mm3 * ho))**2 + 6.76 * (0.7 * Fy / E)**2)
    )

    if Lb <= Lp:
        phi_Mn = phi_b * Mp
        zona = "Plasticidad (Lb ≤ Lp)"
    elif Lb <= Lr:
        factor = Cb * (Mp - (Mp - 0.7 * Fy * Sx) * (Lb - Lp) / (Lr - Lp))
        phi_Mn = phi_b * min(factor, Mp)
        zona = "Inestabilidad inelástica (Lp < Lb ≤ Lr)"
    else:
        Fcr = Cb * math.pi**2 * E * math.sqrt(J_mm4 * (Lb / (bf / math.sqrt(6)))**2 / Sx_mm3 + 0.078) / (Lb / (bf / math.sqrt(6)))**2
        phi_Mn = phi_b * min(Fcr * Sx / 1e6, Mp)
        zona = "Inestabilidad elástica (Lb > Lr)"

    # ── Cortante (AISC 360-22 §G2) ─────────────────────────────────────────
    phi_v = 1.0  # Almas sin rigidizadores, h/tw ≤ 2.24√(E/Fy)
    hw = d - 2 * tf
    h_tw = hw / tw
    kv = 5.34
    Aw = hw * tw  # mm²
    cv1 = 1.0 if h_tw <= 2.24 * math.sqrt(E / Fy) else min(1.0, 1.10 * math.sqrt(kv * E / Fy) / h_tw)
    phi_Vn = phi_v * 0.6 * Fy * Aw * cv1 / 1000  # kN

    return {
        "flexion": {
            "Mp_kNm": round(Mp, 2),
            "My_kNm": round(My, 2),
            "phi_Mn_kNm": round(phi_Mn, 2),
            "Lp_mm": round(Lp, 0),
            "Lr_mm": round(Lr, 0),
            "Lb_mm": round(Lb, 0),
            "zona_pandeo": zona,
            "DCR_flexion": round(data.Mu_kNm / phi_Mn, 3),
            "ok_flexion": data.Mu_kNm <= phi_Mn,
        },
        "cortante": {
            "Aw_mm2": round(Aw, 1),
            "h_tw": round(h_tw, 2),
            "Cv1": round(cv1, 4),
            "phi_Vn_kN": round(phi_Vn, 2),
            "DCR_cortante": round(data.Vu_kN / phi_Vn, 3),
            "ok_cortante": data.Vu_kN <= phi_Vn,
        },
        "notas": "AISC 360-22, LRFD, Lb = L (sin arriostramiento intermedio)",
    }


def Ix_from_bf_tf(bf, tf, d, tw):
    """Inercia aprox. de sección I"""
    ho = d - tf
    Ix = 2 * (bf * tf**3 / 12 + bf * tf * (ho / 2)**2) + tw * (d - 2 * tf)**3 / 12
    return Ix


@router.post("/pandeo")
def diseño_pandeo(data: PandeoInput):
    """
    Diseño por pandeo axial (columna/puntal) — AISC 360-22 Capítulo E
    """
    Fy = data.Fy
    A  = data.A_cm2 * 100  # cm² → mm²
    E  = 200000  # MPa

    # Relaciones de esbeltez efectivas
    lambda_x = (data.Kx * data.Lx_m * 1000) / (data.rx_cm * 10)  # KL/r
    lambda_y = (data.Ky * data.Ly_m * 1000) / (data.ry_cm * 10)
    lambda_c  = max(lambda_x, lambda_y)  # governa el mayor

    # Tensión crítica (AISC 360-22 §E3)
    Fe = math.pi**2 * E / lambda_c**2   # Tensión de Euler

    if lambda_c / math.sqrt(E / Fy) <= 4.71:
        Fcr = (0.658 ** (Fy / Fe)) * Fy  # Pandeo inelástico
        modo = "Pandeo inelástico"
    else:
        Fcr = 0.877 * Fe                  # Pandeo elástico
        modo = "Pandeo elástico"

    phi_c = 0.90
    phi_Pn = phi_c * Fcr * A / 1000  # kN

    DCR = round(data.Pu_kN / phi_Pn, 3) if phi_Pn > 0 else None

    return {
        "KL_r_x": round(lambda_x, 2),
        "KL_r_y": round(lambda_y, 2),
        "KL_r_gov": round(lambda_c, 2),
        "Fe_MPa": round(Fe, 2),
        "Fcr_MPa": round(Fcr, 2),
        "phi_Pn_kN": round(phi_Pn, 2),
        "modo_pandeo": modo,
        "DCR": DCR,
        "ok": data.Pu_kN <= phi_Pn if data.Pu_kN > 0 else None,
        "notas": "AISC 360-22 §E3, LRFD",
    }


@router.post("/deflexion")
def deflexion_viga(data: DeflexionInput):
    """Calcula deflexiones en vigas simplemente apoyadas (Euler-Bernoulli)"""
    E  = data.E_GPa * 1e6   # GPa → kN/m²  (= MPa * 1000)
    Ix = data.Ix_cm4 * 1e-8  # cm⁴ → m⁴
    L  = data.L_m
    w  = data.w_kNm
    P  = data.P_kN

    EI = E * Ix  # kN·m²

    # Deflexión máxima (centro vano, apoyos simples)
    delta_w = (5 * w * L**4) / (384 * EI) if w > 0 else 0.0   # m
    delta_P = (P * L**3) / (48 * EI) if P > 0 else 0.0         # m
    delta_total = delta_w + delta_P

    # Límite
    limite_map = {"L/240": 240, "L/360": 360, "L/480": 480}
    denom = limite_map.get(data.limite, 360)
    delta_limite = L / denom

    return {
        "delta_w_m": round(delta_w, 6),
        "delta_P_m": round(delta_P, 6),
        "delta_total_m": round(delta_total, 6),
        "delta_total_mm": round(delta_total * 1000, 3),
        "delta_limite_mm": round(delta_limite * 1000, 3),
        "limite_usado": data.limite,
        "ok": delta_total <= delta_limite,
        "relacion_L_delta": round(L / delta_total, 0) if delta_total > 0 else None,
    }
