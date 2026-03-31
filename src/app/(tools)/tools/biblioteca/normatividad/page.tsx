"use client";

import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  ExternalLink,
  Download,
  Filter,
  X,
  Star,
  ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type Region = "northamerica" | "peru" | "canada";
type Stage =
  | "metrado"
  | "predimensionamiento"
  | "modelamiento"
  | "analisis"
  | "diseno_elementos"
  | "diseno_cimentaciones";

interface StageDetail {
  stage: Stage;
  chapters: string[];
}

interface Norm {
  id: string;
  title: string;
  fullTitle: string;
  description: string;
  regions: Region[];
  stages: Stage[];
  stageDetails: StageDetail[];
  url: string;
  pdfUrl?: string;
  organization: string;
  year: number;
  popular?: boolean;
  free?: boolean;
  /** color CSS para el thumbnail generado */
  color: string;
  /** sigla corta para mostrar en el thumb */
  abbr: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LABELS & COLORS
───────────────────────────────────────────────────────────────────────────── */
const REGION_LABELS: Record<Region, string> = {
  northamerica: "Norteamérica (USA)",
  peru: "Perú (RNE)",
  canada: "Canadá",
};
const STAGE_LABELS: Record<Stage, string> = {
  metrado: "Metrado de Cargas",
  predimensionamiento: "Predimensionamiento",
  modelamiento: "Modelamiento Estructural",
  analisis: "Análisis Estructural",
  diseno_elementos: "Diseño de Elementos",
  diseno_cimentaciones: "Diseño de Cimentaciones",
};
const STAGE_COLORS: Record<Stage, string> = {
  metrado: "bg-yellow-100 text-yellow-700",
  predimensionamiento: "bg-purple-100 text-purple-700",
  modelamiento: "bg-cyan-100 text-cyan-700",
  analisis: "bg-green-100 text-green-700",
  diseno_elementos: "bg-pink-100 text-pink-700",
  diseno_cimentaciones: "bg-amber-100 text-amber-700",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const NORMS: Norm[] = [
  /* ── USA ─────────────────────────────────────────────────────────────────── */
  {
    id: "aci318-19",
    title: "ACI 318-19",
    fullTitle: "Building Code Requirements for Structural Concrete and Commentary",
    description: "Código de diseño de concreto armado más utilizado en Norteamérica. Cubre diseño por resistencia, ductilidad sísmica, cimentaciones y concreto especial.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 9 – Vigas: espesor mínimo (h = L/16)", "Cap. 10 – Columnas: sección mínima por carga axial", "Cap. 13 – Losas: espesor mínimo por deflexión"] },
      { stage: "diseno_elementos", chapters: ["Cap. 9 – Diseño de vigas a flexión y corte", "Cap. 10 – Diseño de columnas (carga axial + flexión)", "Cap. 11 – Muros estructurales", "Cap. 12 – Diafragmas y colectores de diafragma"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 13 – Losas de cimentación", "Cap. 15 – Zapatas aisladas y combinadas", "Cap. 16 – Pilotes y cabezales de pilotes"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=31819",
    organization: "ACI",
    year: 2019,
    popular: true,
    color: "#1e40af",
    abbr: "ACI\n318",
  },
  {
    id: "asce7-22",
    title: "ASCE 7-22",
    fullTitle: "Minimum Design Loads and Associated Criteria for Buildings and Other Structures",
    description: "Estándar fundamental para cargas de diseño en EE.UU.: cargas vivas, muertas, viento, sismo, nieve y combinaciones.",
    regions: ["northamerica"],
    stages: ["metrado", "predimensionamiento", "modelamiento", "analisis"],
    stageDetails: [
      { stage: "metrado", chapters: ["Cap. 3 – Cargas muertas (peso propio, acabados)", "Cap. 4 – Cargas vivas por uso y ocupación", "Cap. 26–31 – Carga de viento (procedimiento analítico)", "Cap. 11–12 – Fuerza sísmica de diseño"] },
      { stage: "predimensionamiento", chapters: ["Cap. 12.3 – Sistemas y subsistemas estructurales", "Cap. 12.8 – Método de fuerza lateral equivalente", "Tabla 12.2-1 – Factor R, Cd, Ω0 por sistema"] },
      { stage: "modelamiento", chapters: ["Cap. 12.7 – Modelado del sistema estructural", "Cap. 12.9 – Análisis modal espectral", "Cap. 12.14 – Procedimiento simplificado"] },
      { stage: "analisis", chapters: ["Cap. 12.8 – Fuerza lateral equivalente (ELF)", "Cap. 12.9 – Análisis modal de respuesta espectral", "Cap. 16 – Análisis tiempo-historia no lineal", "Cap. 17 – Aislamiento sísmico"] },
    ],
    url: "https://www.asce.org/publications-and-news/asce-7",
    organization: "ASCE",
    year: 2022,
    popular: true,
    color: "#0f766e",
    abbr: "ASCE\n7-22",
  },
  {
    id: "aisc360-22",
    title: "AISC 360-22",
    fullTitle: "Specification for Structural Steel Buildings",
    description: "Especificación para diseño de estructuras de acero: LRFD y ASD, secciones compactas, pandeo, conexiones y estados límite.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. B – Clasificación de secciones (compacta / no compacta)", "Cap. F – Predimensionamiento de vigas a flexión", "Cap. H – Columnas con carga axial y flexión combinadas"] },
      { stage: "diseno_elementos", chapters: ["Cap. D – Diseño de elementos a tensión", "Cap. E – Diseño de columnas (pandeo)", "Cap. F – Diseño de vigas a flexión y cortante", "Cap. J – Diseño de conexiones (soldadura y pernos)", "Cap. K – Conexiones HSS y cajón"] },
    ],
    url: "https://www.aisc.org/globalassets/aisc/publications/standards/a360-22w.pdf",
    pdfUrl: "https://www.aisc.org/globalassets/aisc/publications/standards/a360-22w.pdf",
    organization: "AISC",
    year: 2022,
    popular: true,
    free: true,
    color: "#9f1239",
    abbr: "AISC\n360",
  },
  {
    id: "aisc341-22",
    title: "AISC 341-22",
    fullTitle: "Seismic Provisions for Structural Steel Buildings",
    description: "Provisiones sísmicas para estructuras de acero: SMF, IMF, EBF, BRBF y sistemas de arriostramiento sísmico.",
    regions: ["northamerica"],
    stages: ["modelamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. A – Alcance y sistemas sismorresistentes de acero", "Cap. C – Análisis y deformabilidad en marcos de acero"] },
      { stage: "analisis", chapters: ["Cap. D – Deformabilidad de miembros y conexiones", "Cap. E – Marcos a momento (SMF, IMF, OMF)"] },
      { stage: "diseno_elementos", chapters: ["Cap. E – SMF: diseño de vigas, columnas y zonas panel", "Cap. F – Marcos arriostrados concéntricos (SCBF, OCBF)", "Cap. G – Marcos arriostrados excéntricos (EBF)", "Cap. H – Marcos con pandeo restringido (BRBF)"] },
    ],
    url: "https://www.aisc.org/globalassets/aisc/publications/standards/a341-22w.pdf",
    pdfUrl: "https://www.aisc.org/globalassets/aisc/publications/standards/a341-22w.pdf",
    organization: "AISC",
    year: 2022,
    free: true,
    color: "#7c2d12",
    abbr: "AISC\n341",
  },
  {
    id: "ibc2021",
    title: "IBC 2021",
    fullTitle: "International Building Code",
    description: "Código de construcción adoptado en la mayoría de estados de EE.UU. Integra ASCE 7, ACI y AISC.",
    regions: ["northamerica"],
    stages: ["metrado", "predimensionamiento"],
    stageDetails: [
      { stage: "metrado", chapters: ["Sec. 1606 – Cargas vivas mínimas", "Sec. 1607 – Cargas de ocupación y uso", "Sec. 1609 – Carga de viento", "Sec. 1613 – Carga sísmica (referencia ASCE 7)"] },
      { stage: "predimensionamiento", chapters: ["Sec. 1604 – Criterios generales de resistencia", "Sec. 1605 – Combinaciones de carga (LRFD/ASD)", "Sec. 1615 – Categoría de riesgo sísmico"] },
    ],
    url: "https://codes.iccsafe.org/content/IBC2021P2",
    organization: "ICC",
    year: 2021,
    free: true,
    color: "#374151",
    abbr: "IBC\n2021",
  },
  {
    id: "asce41-17",
    title: "ASCE 41-17",
    fullTitle: "Seismic Evaluation and Retrofit of Existing Buildings",
    description: "Evaluación sísmica y rehabilitación de edificios existentes: análisis lineal, no lineal estático (pushover) y dinámico.",
    regions: ["northamerica"],
    stages: ["analisis", "modelamiento"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 7 – Modelado y procedimientos de análisis", "Cap. 8 – Concreto: parámetros de modelado y criterios de aceptación", "Cap. 9 – Acero: parámetros de modelado no lineal"] },
      { stage: "analisis", chapters: ["Cap. 7.3 – Análisis estático lineal (LSP)", "Cap. 7.4 – Análisis dinámico lineal (LDP)", "Cap. 7.5 – Análisis estático no lineal (NSP / Pushover)", "Cap. 7.6 – Análisis dinámico no lineal (NDP)"] },
    ],
    url: "https://www.asce.org/publications-and-news/asce-41",
    organization: "ASCE",
    year: 2017,
    color: "#1d4ed8",
    abbr: "ASCE\n41",
  },
  {
    id: "femap695",
    title: "FEMA P-695",
    fullTitle: "Quantification of Building Seismic Performance Factors",
    description: "Metodología para cuantificar R, Cd, Ω₀ mediante análisis no lineal incremental para nuevos sistemas estructurales.",
    regions: ["northamerica"],
    stages: ["analisis", "modelamiento"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 5 – Desarrollo de modelos no lineales", "Cap. 6 – Caracterización del desempeño sísmico (conjunto de registros)"] },
      { stage: "analisis", chapters: ["Cap. 6 – Análisis incremental dinámico (IDA)", "Cap. 7 – Evaluación estadística de resultados y ajuste por SSF"] },
    ],
    url: "https://www.fema.gov/sites/default/files/2020-07/fema_p695.pdf",
    pdfUrl: "https://www.fema.gov/sites/default/files/2020-07/fema_p695.pdf",
    organization: "FEMA",
    year: 2009,
    free: true,
    color: "#065f46",
    abbr: "FEMA\nP-695",
  },
  {
    id: "femap750",
    title: "FEMA P-750",
    fullTitle: "NEHRP Recommended Seismic Provisions for New Buildings",
    description: "Provisiones sísmicas NEHRP. Base técnica del ASCE 7 para requisitos de diseño sísmico en EE.UU.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "analisis", "modelamiento"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Part 1, Cap. 4 – Criterios generales de diseño sísmico", "Part 1, Cap. 4.2 – Sistemas y factores R"] },
      { stage: "modelamiento", chapters: ["Part 1, Cap. 5 – Modelado estructural para análisis sísmico"] },
      { stage: "analisis", chapters: ["Part 1, Cap. 5.2 – Análisis de fuerza lateral equivalente", "Part 1, Cap. 5.4 – Análisis modal de respuesta espectral", "Part 1, Cap. 7 – Aislamiento sísmico y disipadores"] },
    ],
    url: "https://www.fema.gov/sites/default/files/2020-07/fema_p750.pdf",
    pdfUrl: "https://www.fema.gov/sites/default/files/2020-07/fema_p750.pdf",
    organization: "FEMA / BSSC",
    year: 2009,
    free: true,
    color: "#166534",
    abbr: "FEMA\nP-750",
  },
  {
    id: "nds2018",
    title: "NDS 2018",
    fullTitle: "National Design Specification for Wood Construction",
    description: "Especificación para diseño de estructuras de madera en EE.UU.: madera aserrada, laminada, CLT y conexiones.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3.2 – Deflexión admisible y pandeo lateral", "Cap. 4.3 – Vigas de madera: relaciones L/d"] },
      { stage: "diseno_elementos", chapters: ["Cap. 3 – Diseño de elementos a flexión (vigas)", "Cap. 4 – Diseño de columnas (compresión axial)", "Cap. 10–12 – Diseño de conexiones metálicas y pernos"] },
    ],
    url: "https://awc.org/publications/2018-nds/",
    organization: "AWC",
    year: 2018,
    color: "#713f12",
    abbr: "NDS\n2018",
  },

  /* ── CANADÁ ───────────────────────────────────────────────────────────────── */
  {
    id: "nbc2020",
    title: "NBC 2020",
    fullTitle: "National Building Code of Canada",
    description: "Código nacional de construcción de Canadá: cargas, sismo canadiense, resistencia al fuego y diseño general.",
    regions: ["canada"],
    stages: ["metrado", "predimensionamiento", "modelamiento", "analisis"],
    stageDetails: [
      { stage: "metrado", chapters: ["Div. B, Part 4 – Cargas muertas y vivas", "4.1.6 – Cargas de viento", "4.1.8 – Cargas sísmicas (peligro sísmico canadiense)"] },
      { stage: "predimensionamiento", chapters: ["4.1.3 – Combinaciones de carga y factores de resistencia"] },
      { stage: "modelamiento", chapters: ["4.1.8.3 – Métodos de análisis sísmico", "4.1.8.7 – Dinámica del edificio y análisis modal"] },
      { stage: "analisis", chapters: ["4.1.8 – Diseño sísmico: fuerza lateral equivalente y análisis dinámico"] },
    ],
    url: "https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications/national-building-code-canada-2020",
    organization: "NRC Canada",
    year: 2020,
    color: "#b91c1c",
    abbr: "NBC\n2020",
  },
  {
    id: "csaa233-19",
    title: "CSA A23.3-19",
    fullTitle: "Design of Concrete Structures",
    description: "Norma canadiense de concreto. Complementa el NBC con resistencia, ductilidad y detalles sísmicos.",
    regions: ["canada"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 9 – Dimensionamiento mínimo de vigas y losas", "Cap. 10 – Columnas: relaciones de esbeltez"] },
      { stage: "diseno_elementos", chapters: ["Cap. 8 – Diseño a flexión y cortante", "Cap. 10 – Columnas sujetas a carga axial y flexión", "Cap. 11 – Muros de cortante (ductilidad moderada y alta)"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 15 – Zapatas aisladas, combinadas y pilotes", "Cap. 22 – Muros de sótano y retención"] },
    ],
    url: "https://www.csagroup.org/store/product/2430469/",
    organization: "CSA",
    year: 2019,
    color: "#c2410c",
    abbr: "CSA\nA23.3",
  },

  /* ── PERÚ (RNE) ──────────────────────────────────────────────────────────── */
  {
    id: "e020",
    title: "E.020",
    fullTitle: "Norma E.020 – Cargas",
    description: "Norma técnica peruana que define cargas mínimas: cargas vivas por uso, muertas, tabiques y combinaciones para edificaciones.",
    regions: ["peru"],
    stages: ["metrado", "predimensionamiento"],
    stageDetails: [
      { stage: "metrado", chapters: ["Art. 3 – Cargas muertas (peso propio y acabados)", "Art. 4 – Cargas vivas mínimas por tipo de uso", "Art. 5 – Reducción de carga viva en entrepisos", "Art. 7 – Cargas por lluvia en azoteas"] },
      { stage: "predimensionamiento", chapters: ["Art. 4 – Tabla 1: Cargas vivas de diseño por ocupación", "Art. 3.3 – Peso de tabiques y particiones"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2006,
    popular: true,
    color: "#b45309",
    abbr: "E.020",
  },
  {
    id: "e030",
    title: "E.030",
    fullTitle: "Norma E.030 – Diseño Sismorresistente (2022)",
    description: "Principal norma sísmica peruana: zonificación, categoría de edificaciones, sistemas estructurales y factores R.",
    regions: ["peru"],
    stages: ["metrado", "predimensionamiento", "modelamiento", "analisis"],
    stageDetails: [
      { stage: "metrado", chapters: ["Art. 25 – Peso sísmico (CM + porcentaje CV por categoría)", "Art. 26 – Combinación de carga para diseño sísmico"] },
      { stage: "predimensionamiento", chapters: ["Art. 19 – Sistemas estructurales y factor R", "Art. 22 – Irregularidades en planta y altura", "Tabla N°7 – Coeficientes de reducción R"] },
      { stage: "modelamiento", chapters: ["Art. 26 – Modelo para análisis dinámico", "Art. 27 – Análisis modal espectral: modos y masas participativas", "Art. 28 – Espectro de diseño Sa(T)"] },
      { stage: "analisis", chapters: ["Art. 25 – Análisis estático o de fuerzas equivalentes", "Art. 27 – Análisis dinámico modal espectral", "Art. 31 – Control de derivas (Δ/h)", "Art. 33 – Junta de separación sísmica"] },
    ],
    url: "https://busquedas.elperuano.pe/normaslegales/decreto-supremo-que-modifica-la-norma-tecnica-e030-diseno-si-decreto-supremo-n-011-2022-vivienda-2064832-2/",
    organization: "MVCS",
    year: 2022,
    popular: true,
    color: "#be123c",
    abbr: "E.030",
  },
  {
    id: "e050",
    title: "E.050",
    fullTitle: "Norma E.050 – Suelos y Cimentaciones",
    description: "Norma peruana de suelos: EMS, capacidad portante admisible, tipos de cimentación y diseño geotécnico.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Art. 18 – Presión admisible del suelo (EMS)", "Art. 20 – Profundidad mínima de cimentación", "Art. 22 – Selección del tipo de cimentación"] },
      { stage: "diseno_cimentaciones", chapters: ["Art. 24 – Zapatas aisladas y corridas", "Art. 25 – Zapatas combinadas y losas de cimentación", "Art. 26 – Pilotes y pilastras", "Art. 28 – Muros de contención y sótanos"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2018,
    popular: true,
    color: "#92400e",
    abbr: "E.050",
  },
  {
    id: "e060",
    title: "E.060",
    fullTitle: "Norma E.060 – Concreto Armado",
    description: "Norma técnica peruana para concreto armado. Basada en ACI 318 con adaptaciones para la práctica peruana.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 9 – Espesor mínimo de losas y vigas (h mín)", "Cap. 10 – Sección mínima de columnas por carga axial"] },
      { stage: "diseno_elementos", chapters: ["Cap. 9 – Diseño de vigas a flexión, cortante y torsión", "Cap. 10 – Diseño de columnas (M + P)", "Cap. 11 – Muros de corte (Placas)", "Cap. 13 – Losas aligeradas y macizas", "Cap. 21 – Detallado sísmico para zonas de alta ductilidad"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 15 – Zapatas aisladas y combinadas", "Cap. 16 – Pilotes de concreto armado"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2009,
    popular: true,
    color: "#1e3a5f",
    abbr: "E.060",
  },
  {
    id: "e070",
    title: "E.070",
    fullTitle: "Norma E.070 – Albañilería",
    description: "Diseño de albañilería confinada y armada: densidad de muros, resistencia y detallado de columnas de confinamiento.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Art. 19 – Densidad mínima de muros por zona sísmica", "Art. 14 – Espesor mínimo de muros portantes"] },
      { stage: "diseno_elementos", chapters: ["Art. 18 – Diseño a carga vertical (resistencia a compresión)", "Art. 19 – Diseño a fuerza cortante (muros de albañilería)", "Art. 20 – Detalle de columnas de confinamiento y vigas soleras"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2006,
    popular: true,
    color: "#854d0e",
    abbr: "E.070",
  },
  {
    id: "e090",
    title: "E.090",
    fullTitle: "Norma E.090 – Estructuras Metálicas",
    description: "Norma peruana para estructuras metálicas: LRFD y ASD, vigas, columnas, conexiones e industriales.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Art. 5 – Clasificación de secciones y relaciones h/t", "Art. 6 – Limitaciones de esbeltez (L/r) para compresión"] },
      { stage: "diseno_elementos", chapters: ["Art. 7 – Diseño a tensión", "Art. 8 – Diseño a compresión (pandeo global y local)", "Art. 9 – Diseño a flexión y corte", "Art. 10 – Diseño de conexiones (pernos y soldadura)"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2006,
    color: "#475569",
    abbr: "E.090",
  },
  {
    id: "e031",
    title: "E.031",
    fullTitle: "Norma E.031 – Aislamiento Sísmico",
    description: "Norma para estructuras con aislamiento sísmico en la base: dispositivos, análisis y verificación de desempeño.",
    regions: ["peru"],
    stages: ["modelamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Art. 10 – Modelado del sistema de aislamiento", "Art. 12 – Propiedades de los dispositivos de aislamiento"] },
      { stage: "analisis", chapters: ["Art. 13 – Procedimiento estático equivalente", "Art. 14 – Análisis dinámico modal espectral", "Art. 15 – Análisis tiempo-historia"] },
      { stage: "diseno_elementos", chapters: ["Art. 16 – Diseño de la interfaz de aislamiento (placa de soporte)", "Art. 18 – Requisitos de conexión entre aisladores y estructura"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2019,
    color: "#7c3aed",
    abbr: "E.031",
  },
  {
    id: "ce020",
    title: "CE.020",
    fullTitle: "Norma CE.020 – Suelos y Taludes",
    description: "Diseño geotécnico: estabilización de suelos, taludes, muros de contención y estabilidad de laderas en Perú.",
    regions: ["peru"],
    stages: ["diseno_cimentaciones"],
    stageDetails: [
      { stage: "diseno_cimentaciones", chapters: ["Cap. 3 – Análisis de estabilidad de taludes (Bishop, Fellenius)", "Cap. 4 – Muros de contención: criterios geotécnicos", "Cap. 5 – Estabilización de suelos con geosintéticos"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "MVCS / SENCICO",
    year: 2012,
    color: "#78350f",
    abbr: "CE.020",
  },
];

const POPULAR_NORMS = NORMS.filter((n) => n.popular);

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function NormatividadPage() {
  const [search, setSearch] = useState("");
  const [activeRegions, setActiveRegions] = useState<Region[]>([]);
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  const [detailNorm, setDetailNorm] = useState<Norm | null>(null);

  const toggleRegion = (r: Region) =>
    setActiveRegions((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));
  const toggleStage = (s: Stage) =>
    setActiveStages((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const clearAll = () => { setActiveRegions([]); setActiveStages([]); setSearch(""); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NORMS.filter((n) => {
      const matchSearch = !q || n.title.toLowerCase().includes(q) || n.fullTitle.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || n.organization.toLowerCase().includes(q);
      const matchRegion = activeRegions.length === 0 || n.regions.some((r) => activeRegions.includes(r));
      const matchStage = activeStages.length === 0 || n.stages.some((s) => activeStages.includes(s));
      return matchSearch && matchRegion && matchStage;
    });
  }, [search, activeRegions, activeStages]);

  const hasFilters = activeRegions.length > 0 || activeStages.length > 0 || search.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 shrink-0">
            <BookOpen className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Normas y Códigos Estructurales</h1>
            <p className="mt-1 text-sm text-slate-500">Reglamentos de análisis y diseño estructural — Norteamérica y Perú</p>
          </div>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar norma, código, organización..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Filtros:</span>
          {activeRegions.map((r) => (
            <button key={r} onClick={() => toggleRegion(r)} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
              {REGION_LABELS[r]} <X className="h-3 w-3" />
            </button>
          ))}
          {activeStages.map((s) => (
            <button key={s} onClick={() => toggleStage(s)} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200">
              {STAGE_LABELS[s]} <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs text-slate-400 underline hover:text-slate-600">Limpiar todo</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-3 lg:self-start lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-700">Filtros</h2>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Región</p>
            <div className="space-y-2">
              {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 group">
                  <input type="checkbox" checked={activeRegions.includes(r)} onChange={() => toggleRegion(r)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
                  <span className={`text-sm ${activeRegions.includes(r) ? "font-semibold text-blue-700" : "text-slate-600 group-hover:text-blue-600"}`}>{REGION_LABELS[r]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Etapa de Diseño</p>
            <div className="space-y-2">
              {(Object.keys(STAGE_LABELS) as Stage[]).map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 group">
                  <input type="checkbox" checked={activeStages.includes(s)} onChange={() => toggleStage(s)} className="rounded border-slate-300 text-purple-600 focus:ring-purple-400" />
                  <span className={`text-sm leading-snug ${activeStages.includes(s) ? "font-semibold text-purple-700" : "text-slate-600 group-hover:text-purple-600"}`}>{STAGE_LABELS[s]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Más Buscados</p>
            <ul className="space-y-2">
              {POPULAR_NORMS.map((n) => (
                <li key={n.id}>
                  <button onClick={() => setDetailNorm(n)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline text-left">
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    {n.title}
                    <span className="text-xs text-slate-400">— {n.organization}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Cards */}
        <section className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-500">No se encontraron normas con esos filtros.</p>
              <button onClick={clearAll} className="mt-3 text-sm text-blue-600 hover:underline">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-400">{filtered.length} norma{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((norm) => (
                  <NormCard key={norm.id} norm={norm} onDetails={() => setDetailNorm(norm)} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {detailNorm && <DetailModal norm={detailNorm} onClose={() => setDetailNorm(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NORM CARD  (image left + info right + 2 buttons)
───────────────────────────────────────────────────────────────────────────── */
function NormCard({ norm, onDetails }: { norm: Norm; onDetails: () => void }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      {/* Top row: thumbnail + title/desc */}
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div
          className="shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-center"
          style={{ backgroundColor: norm.color }}
        >
          <span className="text-white font-bold text-[11px] leading-tight whitespace-pre-line">
            {norm.abbr}
          </span>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{norm.title}</h3>
            {norm.popular && (
              <Star className="h-3.5 w-3.5 shrink-0 mt-0.5 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{norm.organization} · {norm.year}</p>
          <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-3">{norm.description}</p>
        </div>
      </div>

      {/* Stage tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {norm.stages.map((s) => (
          <span key={s} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STAGE_COLORS[s]}`}>
            {STAGE_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-auto border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
        <button
          onClick={onDetails}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          Ver Detalles
        </button>
        {norm.pdfUrl ? (
          <a
            href={norm.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar PDF
          </a>
        ) : (
          <a
            href={norm.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ir al sitio
          </a>
        )}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAIL MODAL
───────────────────────────────────────────────────────────────────────────── */
function DetailModal({ norm, onClose }: { norm: Norm; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center gap-4 p-5 border-b border-slate-100" style={{ backgroundColor: norm.color + "18" }}>
          <div
            className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: norm.color }}
          >
            <span className="text-white font-bold text-[11px] leading-tight whitespace-pre-line text-center">
              {norm.abbr}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 text-lg">{norm.title}</h2>
            <p className="text-sm text-slate-500 leading-snug">{norm.fullTitle}</p>
            <p className="text-xs text-slate-400 mt-0.5">{norm.organization} · {norm.year}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full p-1.5 hover:bg-slate-200 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {norm.stageDetails.map((sd) => (
            <div key={sd.stage}>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2 ${STAGE_COLORS[sd.stage]}`}>
                {STAGE_LABELS[sd.stage]}
              </div>
              <ul className="space-y-1.5 pl-1">
                {sd.chapters.map((ch, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                    {ch}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Modal footer */}
        <div className="border-t border-slate-100 p-4 flex gap-3">
          <a
            href={norm.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver norma oficial
          </a>
          {norm.pdfUrl && (
            <a
              href={norm.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
