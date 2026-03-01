"""
Cálculos de diseño en concreto reforzado (ACI 318-19)
Unidades: MPa, mm, kN, kN·m
"""
import math
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ─── Modelos de entrada ────────────────────────────────────────────────────────

class MinMaxInput(BaseModel):
    fc: float   # Resistencia del concreto (MPa)
    fy: float   # Fluencia del acero (MPa)
    b: float    # Ancho de la sección (mm)
    d: float    # Peralte efectivo (mm)

class RefuerzoInput(BaseModel):
    fc: float   # MPa
    fy: float   # MPa
    b: float    # mm
    d: float    # mm
    Mu: float   # kN·m (momento último)

class ColumnaPMInput(BaseModel):
    fc: float       # MPa
    fy: float       # MPa
    b: float        # mm (ancho)
    h: float        # mm (altura)
    cover: float    # mm (recubrimiento al centroide del refuerzo)
    As_total: float # mm² (área de acero total, distribuida en 4 esquinas)

class ViperInput(BaseModel):
    fc: float   # MPa
    fy: float   # MPa
    b: float    # mm
    d: float    # mm
    Mu: float   # kN·m
    Vu: float   # kN (cortante último)


# ─── Utilidades ───────────────────────────────────────────────────────────────

def beta1(fc: float) -> float:
    """Factor β1 según ACI 318-19 Tabla 22.2.2.4.3"""
    if fc <= 28:
        return 0.85
    b1 = 0.85 - 0.05 * (fc - 28) / 7
    return max(b1, 0.65)

def phi_flexion() -> float:
    return 0.90

def phi_corte() -> float:
    return 0.75


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/minimos-maximos")
def minimos_maximos(data: MinMaxInput):
    """Calcula el acero mínimo y máximo de refuerzo a flexión (ACI 318-19 §9.6)"""
    fc, fy, b, d = data.fc, data.fy, data.b, data.d

    # Acero mínimo (ACI 318-19 §9.6.1.2)
    As_min_1 = (0.25 * math.sqrt(fc) / fy) * b * d
    As_min_2 = (1.4 / fy) * b * d
    As_min = max(As_min_1, As_min_2)

    # Acero máximo (c_max = 0.003/(0.003+0.005) * d para zona de tensión controlada)
    b1 = beta1(fc)
    c_max = (0.003 / (0.003 + 0.004)) * d   # εt_min = 0.004 para losas/vigas
    a_max = b1 * c_max
    As_max = (0.85 * fc * b * a_max) / fy

    # Cuantías
    rho_min = As_min / (b * d)
    rho_max = As_max / (b * d)
    rho_bal = (0.85 * fc * b1 * 600) / (fy * (600 + fy))  # cuantía balanceada

    return {
        "As_min_mm2": round(As_min, 2),
        "As_max_mm2": round(As_max, 2),
        "rho_min": round(rho_min, 5),
        "rho_max": round(rho_max, 5),
        "rho_bal": round(rho_bal, 5),
        "beta1": round(b1, 4),
        "notas": "ACI 318-19 §9.6.1.2, εt_min=0.004 para zona de tensión controlada",
    }


@router.post("/refuerzo")
def refuerzo_flexion(data: RefuerzoInput):
    """Diseño de refuerzo a flexión para viga rectangular (ACI 318-19)"""
    fc, fy, b, d, Mu = data.fc, data.fy, data.b, data.d, data.Mu
    Mu_Nmm = Mu * 1e6  # kN·m → N·mm

    phi = phi_flexion()
    b1 = beta1(fc)

    # Acero mínimo
    As_min = max(
        (0.25 * math.sqrt(fc) / fy) * b * d,
        (1.4 / fy) * b * d,
    )

    # As requerido por Mu (iteración directa)
    # phi * Mn = phi * As*fy*(d - a/2);  a = As*fy/(0.85*fc*b)
    # Solve quadratic: As^2 * (fy²/(2*0.85*fc*b)) - As*fy*d + Mu_Nmm/phi = 0
    A_coef = fy**2 / (2 * 0.85 * fc * b)
    B_coef = -fy * d
    C_coef = Mu_Nmm / phi

    discriminant = B_coef**2 - 4 * A_coef * C_coef
    if discriminant < 0:
        return {"error": "Sección insuficiente — incrementa b o d"}

    As_req = (-B_coef - math.sqrt(discriminant)) / (2 * A_coef)
    As_design = max(As_req, As_min)

    # Verificación
    a = As_design * fy / (0.85 * fc * b)
    c = a / b1
    et = 0.003 * (d - c) / c  # deformación en acero de tensión
    phi_real = 0.90 if et >= 0.005 else 0.65 + (et - 0.002) * (250 / 3)

    phi_Mn = phi_real * As_design * fy * (d - a / 2) / 1e6  # kN·m

    # Acero máximo
    c_max = (0.003 / 0.007) * d
    a_max = b1 * c_max
    As_max = 0.85 * fc * b * a_max / fy

    # Sugerencia de varillas (Tabla simplificada, México/ACI)
    varillas_disponibles = {
        "#3": 71, "#4": 129, "#5": 199, "#6": 284,
        "#8": 510, "#10": 819, "#12": 1140,
    }
    sugerencia = []
    for varilla, area_1 in varillas_disponibles.items():
        n = math.ceil(As_design / area_1)
        if 2 <= n <= 8:
            sugerencia.append({"varilla": varilla, "cantidad": n, "As_provisto_mm2": round(n * area_1, 1)})
        if len(sugerencia) >= 3:
            break

    return {
        "As_min_mm2": round(As_min, 2),
        "As_req_mm2": round(As_req, 2),
        "As_design_mm2": round(As_design, 2),
        "As_max_mm2": round(As_max, 2),
        "a_mm": round(a, 2),
        "c_mm": round(c, 2),
        "et": round(et, 5),
        "phi": round(phi_real, 3),
        "phi_Mn_kNm": round(phi_Mn, 2),
        "DCR": round(Mu / phi_Mn, 3),
        "sugerencia_varillas": sugerencia,
    }


@router.post("/columna-pm")
def columna_pm(data: ColumnaPMInput):
    """Diagrama de interacción P-M para columna rectangular con acero en 4 esquinas (ACI 318-19)"""
    fc, fy = data.fc, data.fy
    b, h, cover, As_total = data.b, data.h, data.cover, data.As_total
    b1 = beta1(fc)
    As = As_total / 4  # área por barra de esquina

    # Posiciones de acero (2 capas)
    d_prima = cover          # capa de compresión
    d_eff   = h - cover      # capa de tensión

    points = []
    # Barrido de la profundidad del eje neutro c (desde 0.01h hasta 5h)
    c_values = [i * h / 200 for i in range(1, 1001)]  # 200 puntos

    def strain(c, d):
        return 0.003 * (c - d) / c

    def stress(eps):
        return max(-fy, min(fy, eps * 200000))  # Acero elástico-perfecto (Es=200 GPa)

    for c in c_values:
        a = min(b1 * c, h)

        # Fuerzas de concreto
        Cc = 0.85 * fc * b * a  # N

        # Fuerzas de acero (2 capas, 2 barras cada una)
        eps_s1 = strain(c, d_prima)
        eps_s2 = strain(c, d_eff)
        fs1 = stress(eps_s1)
        fs2 = stress(eps_s2)

        Cs1 = 2 * As * (fs1 - 0.85 * fc)  # descuento concreto en compresión
        Cs2 = 2 * As * fs2

        Pn = (Cc + Cs1 + Cs2) / 1000        # kN
        e = h / 2 - a / 2                    # excentricidad de Cc respecto al centroide
        Mn = (Cc * e + Cs1 * (h / 2 - d_prima) - Cs2 * (h / 2 - d_eff)) / 1e6  # kN·m

        points.append({"Pn_kN": round(Pn, 1), "Mn_kNm": round(abs(Mn), 2)})

    # Límites ACI
    Ag = b * h
    Pn_max = 0.80 * (0.85 * fc * (Ag - As_total) + fy * As_total) / 1000  # kN (espiral=0.85, estribos=0.80)
    phi_Pn_max = 0.65 * Pn_max

    # Filtrar: remover puntos duplicados muy cercanos
    sampled = [points[i] for i in range(0, len(points), 5)][:50]

    return {
        "phi": 0.65,
        "Pn_max_kN": round(Pn_max, 1),
        "phi_Pn_max_kN": round(phi_Pn_max, 1),
        "interaccion": sampled,
        "notas": "ACI 318-19, Acero 4 esquinas, sin considerar pandeo",
    }


@router.post("/viga-interaccion")
def viga_interaccion(data: ViperInput):
    """Diseño combinado flexión + cortante para viga rectangular (ACI 318-19)"""
    fc, fy, b, d, Mu, Vu = data.fc, data.fy, data.b, data.d, data.Mu, data.Vu

    # Flexión
    res_flex = refuerzo_flexion(RefuerzoInput(fc=fc, fy=fy, b=b, d=d, Mu=Mu))
    if "error" in res_flex:
        return res_flex

    # Cortante
    phi_v = phi_corte()
    Vc = (0.17 * math.sqrt(fc) * b * d) / 1000  # kN (ACI 318-19 §22.5.5.1)
    phi_Vc = phi_v * Vc
    Vs_req = (Vu / phi_v) - Vc if Vu > phi_Vc / 2 else 0

    # Separación de estribos (varilla #3 o #4)
    Av_estribo = {
        "#3 (2 ramas)": 2 * 71,
        "#4 (2 ramas)": 2 * 129,
    }
    estribos = []
    for varilla, Av in Av_estribo.items():
        if Vs_req > 0:
            s_req = Av * fy * d / (Vs_req * 1000)
        else:
            s_req = min(d / 2, 600)  # s_max
        s_max = min(d / 2, 600)
        s_diseno = min(s_req, s_max)
        phi_Vn = phi_v * (Vc + Av * fy * d / (s_diseno * 1000))
        estribos.append({
            "estribo": varilla,
            "Av_mm2": Av,
            "s_req_mm": round(s_req, 0),
            "s_diseno_mm": round(s_diseno, 0),
            "phi_Vn_kN": round(phi_Vn, 2),
            "DCR_cortante": round(Vu / phi_Vn, 3),
        })

    return {
        "flexion": res_flex,
        "cortante": {
            "phi_Vc_kN": round(phi_Vc, 2),
            "Vs_req_kN": round(Vs_req, 2),
            "requiere_estribos": Vu > phi_Vc / 2,
            "opciones_estribos": estribos,
        },
    }
