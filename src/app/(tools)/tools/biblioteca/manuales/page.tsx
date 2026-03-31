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
type Region = "northamerica" | "peru" | "internacional";
type DocType = "manual" | "libro";
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

interface Manual {
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
  color: string;
  abbr: string;
  docType?: DocType;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LABELS & COLORS
───────────────────────────────────────────────────────────────────────────── */
const REGION_LABELS: Record<Region, string> = {
  northamerica: "Norteamérica (USA)",
  peru: "Perú",
  internacional: "Internacional",
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
const DOCTYPE_LABELS: Record<DocType, string> = {
  manual: "Manual / Guía",
  libro: "Libro de Texto",
};
const DOCTYPE_COLORS: Record<DocType, string> = {
  manual: "bg-violet-100 text-violet-700",
  libro: "bg-indigo-100 text-indigo-700",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const MANUALS: Manual[] = [

  /* ══════════════════════════════════════════════════════════════════════════
     ACI – CONCRETO ARMADO
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "aci318r-19",
    title: "ACI 318R-19",
    fullTitle: "Commentary on Building Code Requirements for Structural Concrete",
    description:
      "Comentario oficial del ACI 318-19. Explica el trasfondo técnico y justificación de cada artículo del código, esencial para la práctica profesional.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["R9.3 – Justificación de espesores mínimos de vigas y losas", "R10.3 – Dimensionamiento de columnas: relaciones slenderness"] },
      { stage: "diseno_elementos", chapters: ["R9.5 – Trasfondo del diseño a cortante en vigas", "R10.6 – Diseño de columnas bajo carga axial y flexión", "R21 – Comentarios al detallado sísmico"] },
      { stage: "diseno_cimentaciones", chapters: ["R15 – Justificación del diseño de zapatas por punzonamiento", "R16 – Criterios de transmisión de cargas entre pilotes"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=31819",
    organization: "ACI",
    year: 2019,
    popular: true,
    color: "#1e40af",
    abbr: "ACI\n318R",
  },
  {
    id: "aci-sp17",
    title: "ACI SP-17(14)",
    fullTitle: "ACI Designing Concrete Structures – Design Aid",
    description:
      "Manual de ayuda para diseño de estructuras de concreto conforme al ACI 318. Tablas de refuerzo, diagramas de interacción y ejemplos resueltos.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Part A – Tablas de selección de sección para vigas", "Part B – Diagramas de esbeltez para columnas"] },
      { stage: "diseno_elementos", chapters: ["Part C – Diagramas de interacción P-M para columnas", "Part D – Tablas de refuerzo a flexión (ρ vs Mu/bd²)", "Part E – Diseño a cortante y torsión"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=SP01714",
    organization: "ACI",
    year: 2014,
    popular: true,
    color: "#1d4ed8",
    abbr: "ACI\nSP-17",
  },
  {
    id: "aci-224r",
    title: "ACI 224R-01",
    fullTitle: "Control of Cracking in Concrete Structures",
    description:
      "Guía ACI para el control de fisuras en estructuras de concreto: causas, mecanismos, detallado de refuerzo de temperatura y contracción.",
    regions: ["northamerica"],
    stages: ["diseno_elementos"],
    stageDetails: [
      { stage: "diseno_elementos", chapters: ["Cap. 3 – Control de fisuras por flexión (criterio z de Gergely-Lutz)", "Cap. 4 – Fisuras por retracción y temperatura", "Cap. 5 – Refuerzo de control de fisuración en losas y muros"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=22401",
    organization: "ACI",
    year: 2001,
    free: true,
    color: "#1e3a8a",
    abbr: "ACI\n224R",
  },

  {
    id: "aci-421r",
    title: "ACI 421.1R-20",
    fullTitle: "Guide to Shear Reinforcement for Slabs",
    description:
      "Guía ACI para el diseño de refuerzo por cortante en losas planas: conectores de cortante tipo stud, verificación de punzonamiento y detalles constructivos.",
    regions: ["northamerica"],
    stages: ["diseno_elementos"],
    stageDetails: [
      { stage: "diseno_elementos", chapters: ["Cap. 3 – Verificación de punzonamiento por cortante (modelo de cono)", "Cap. 4 – Diseño con conectores de cortante tipo stud (ACI 318 §8.4.4)", "Cap. 5 – Detalles constructivos y zonas críticas de losas planas"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=42120",
    organization: "ACI",
    year: 2020,
    color: "#1e3a8a",
    abbr: "ACI\n421R",
  },
  {
    id: "aci-350",
    title: "ACI 350.4R-04",
    fullTitle: "Design Considerations for Environmental Engineering Concrete Structures",
    description:
      "Guía para diseño de estructuras de concreto en ingeniería ambiental: tanques de agua potable, piscinas de tratamiento y estructuras de contención.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Criterios de diseño por durabilidad y estanqueidad", "Cap. 4 – Selección de espesor mínimo de muros y losas de fondo"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de muros de tanque a flexión y cortante", "Cap. 6 – Control de fisuración: factor de exposición a líquidos", "Cap. 7 – Diseño de juntas de impermeabilización y waterstops"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=35004",
    organization: "ACI",
    year: 2004,
    color: "#1d4ed8",
    abbr: "ACI\n350.4R",
  },
  {
    id: "aci-440r",
    title: "ACI 440.1R-15",
    fullTitle: "Guide for the Design and Construction of Structural Concrete Reinforced with FRP Bars",
    description:
      "Guía ACI para diseño de estructuras de concreto reforzadas con barras de FRP (fibra de vidrio/carbono): flexión, cortante, durabilidad y detallado.",
    regions: ["northamerica", "internacional"],
    stages: ["diseno_elementos"],
    stageDetails: [
      { stage: "diseno_elementos", chapters: ["Cap. 7 – Diseño a flexión con barras de GFRP: factor de reducción (ψ)", "Cap. 8 – Diseño a cortante con estribos de FRP", "Cap. 9 – Control de deflexiones y fisuración en elementos con FRP"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=44015",
    organization: "ACI",
    year: 2015,
    color: "#1e40af",
    abbr: "ACI\n440R",
  },
  {
    id: "aci-435r",
    title: "ACI 435R-95",
    fullTitle: "Control of Deflection in Concrete Structures",
    description:
      "Guía ACI para el control de deflexiones en losas, vigas y estructuras preesforzadas: métodos de cálculo, límites admisibles y efectos a largo plazo.",
    regions: ["northamerica"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 3 – Factores que afectan la deflexión: fluencia, retracción y fisuración", "Cap. 4 – Métodos de cálculo de deflexiones (Ie efectivo)"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Límites admisibles de deflexión según uso", "Cap. 6 – Deflexiones en vigas T y losas aligeradas"] },
    ],
    url: "https://www.concrete.org/store/productdetail.aspx?ItemID=43595",
    organization: "ACI",
    year: 1995,
    free: true,
    color: "#1e3a8a",
    abbr: "ACI\n435R",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     AISC – ACERO ESTRUCTURAL
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "aisc-scm16",
    title: "AISC SCM 16ª Ed.",
    fullTitle: "Steel Construction Manual – 16th Edition",
    description:
      "Manual de construcción de acero de AISC. Tablas de secciones, propiedades geométricas, tablas de conexiones y ejemplos de diseño.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Part 1 – Propiedades de perfiles W, S, C, L y HSS", "Part 3 – Tablas de selección de vigas por momento máximo (φMn)", "Part 4 – Tablas de diseño de columnas (φFcr × Ag)"] },
      { stage: "diseno_elementos", chapters: ["Part 5 – Diseño de elementos a flexión y cortante", "Part 6 – Diseño de conexiones a cortante (pernos y soldadura)", "Part 8 – Conexiones rígidas y a momento", "Part 9 – Tablas de soldaduras en filete"] },
    ],
    url: "https://www.aisc.org/products/publication/steel-construction-manual-16th-edition/",
    organization: "AISC",
    year: 2023,
    popular: true,
    color: "#7f1d1d",
    abbr: "AISC\nSCM",
  },
  {
    id: "aisc-design-guide-1",
    title: "AISC DG1 – 3ª Ed.",
    fullTitle: "Design Guide 1: Base Plate and Anchor Rod Design",
    description:
      "Guía de diseño AISC para placas base de columnas de acero y pernos de anclaje: cargas de compresión, tensión y cortante en la interfaz acero–concreto.",
    regions: ["northamerica"],
    stages: ["diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "diseno_elementos", chapters: ["Cap. 2 – Diseño de placa base bajo carga axial de compresión", "Cap. 3 – Diseño de placa base con momento y tensión"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 4 – Diseño de pernos de anclaje (ACI 318 Apéndice D)", "Cap. 5 – Transferencia de cortante en la interfaz placa-pedestal"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-1-base-plate-and-anchor-rod-design-third-edition/",
    organization: "AISC",
    year: 2024,
    color: "#991b1b",
    abbr: "AISC\nDG1",
  },
  {
    id: "aisc-design-guide-9",
    title: "AISC DG9 – 2ª Ed.",
    fullTitle: "Design Guide 9: Torsional Analysis of Structural Steel Members",
    description:
      "Guía de análisis de torsión en elementos de acero: torsión de St. Venant, alabeo, torsión combinada y ejemplos para perfiles abiertos y cerrados.",
    regions: ["northamerica"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 2 – Fundamentos de la teoría de torsión en barras de pared delgada", "Cap. 3 – Torsión de St. Venant y alabeo en perfiles abiertos"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño de vigas W bajo torsión combinada con flexión", "Cap. 5 – Perfiles HSS: torsión pura y criterio de diseño AISC 360"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-9-torsional-analysis-of-structural-steel-members/",
    organization: "AISC",
    year: 2003,
    free: true,
    color: "#b91c1c",
    abbr: "AISC\nDG9",
  },

  {
    id: "aisc-dg2",
    title: "AISC DG2",
    fullTitle: "Design Guide 2: Steel and Composite Beams with Web Openings",
    description:
      "Guía AISC para el diseño de vigas de acero y compuestas con aberturas en el alma: transferencia de cortante en Vierendeel, refuerzo de aberturas y limitaciones.",
    regions: ["northamerica"],
    stages: ["diseno_elementos"],
    stageDetails: [
      { stage: "diseno_elementos", chapters: ["Cap. 3 – Limitaciones geométricas de aberturas en el alma", "Cap. 4 – Diseño del mecanismo Vierendeel en aberturas sin refuerzo", "Cap. 5 – Refuerzo de aberturas: platos y tees"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-2-steel-and-composite-beams-with-web-openings/",
    organization: "AISC",
    year: 2003,
    free: true,
    color: "#991b1b",
    abbr: "AISC\nDG2",
  },
  {
    id: "aisc-dg3",
    title: "AISC DG3",
    fullTitle: "Design Guide 3: Serviceability Design Considerations for Steel Buildings",
    description:
      "Guía de diseño por serviciabilidad en edificios de acero: deflexiones, vibración de pisos, deriva lateral por viento y criterios de confort humano.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "analisis"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Límites de relación vano/peralte para control de deflexión", "Cap. 3 – Criterios de frecuencia natural mínima de pisos"] },
      { stage: "analisis", chapters: ["Cap. 4 – Análisis de vibración de pisos: modelo Bachmann", "Cap. 5 – Deriva lateral por viento: criterio H/400 y H/600", "Cap. 6 – Aceleración de piso: confort humano (ISO 10137)"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-3-serviceability-design-considerations-for-steel-buildings-third-edition/",
    organization: "AISC",
    year: 2003,
    free: true,
    color: "#7f1d1d",
    abbr: "AISC\nDG3",
  },
  {
    id: "aisc-dg11",
    title: "AISC DG11 – 2ª Ed.",
    fullTitle: "Design Guide 11: Vibrations of Steel-Framed Structural Systems Due to Human Activity",
    description:
      "Guía definitiva sobre vibración de pisos en estructuras de acero: análisis de respuesta dinámica, parámetros del modelo de dos masas y criterios de aceptabilidad.",
    regions: ["northamerica"],
    stages: ["analisis"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 4 – Modelo simplificado de dos masas para pisos compuestos", "Cap. 5 – Evaluación de pisos de oficina, caminerías y gimnasios", "Cap. 6 – Criterios de aceptabilidad por uso (ap/g vs. frecuencia)"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-11-vibrations-of-steel-framed-structural-systems-due-to-human-activity-second-edition/",
    organization: "AISC",
    year: 2016,
    popular: true,
    color: "#9f1239",
    abbr: "AISC\nDG11",
  },
  {
    id: "aisc-dg26",
    title: "AISC DG26",
    fullTitle: "Design Guide 26: Design of Blast Resistant Structures",
    description:
      "Guía AISC para diseño de estructuras de acero resistentes a explosiones: cargas de blast, ductilidad requerida y detallado de conexiones bajo carga impulsiva.",
    regions: ["northamerica"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 3 – Carga de onda de presión: parámetros de blast", "Cap. 4 – Análisis dinámico de un grado de libertad (SDOF) bajo blast"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de vigas y columnas a flexión dúctil bajo blast", "Cap. 6 – Detallado de conexiones y anclajes resistentes a explosiones"] },
    ],
    url: "https://www.aisc.org/products/publication/design-guides/design-guide-26-design-of-blast-resistant-structures/",
    organization: "AISC",
    year: 2013,
    free: true,
    color: "#b91c1c",
    abbr: "AISC\nDG26",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     ASCE / FEMA / SEI
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "asce-hazus",
    title: "HAZUS MH 2.1",
    fullTitle: "Hazus Multi-Hazard Loss Estimation Methodology – Earthquake Model",
    description:
      "Manual de estimación de pérdidas sísmicas del FEMA/HAZUS. Metodología para análisis de vulnerabilidad, daño y pérdidas económicas ante sismos.",
    regions: ["northamerica"],
    stages: ["analisis"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 4 – Funciones de fragilidad por tipo de sistema estructural", "Cap. 5 – Estimación de daño directo e indirecto", "Cap. 6 – Pérdidas económicas y funcionales"] },
    ],
    url: "https://www.fema.gov/flood-maps/products-tools/hazus",
    organization: "FEMA / NIBS",
    year: 2020,
    free: true,
    color: "#065f46",
    abbr: "HAZUS\n2.1",
  },
  {
    id: "precast-pci",
    title: "PCI Design Handbook",
    fullTitle: "PCI Design Handbook: Precast and Prestressed Concrete – 8th Edition",
    description:
      "Manual de referencia para diseño de elementos prefabricados y pretensados: vigas, columnas, paneles de muro, conexiones y diseño sísmico.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Tablas de capacidad de vigas doble T y rectangulares pretensadas", "Cap. 4 – Selección de paneles de muro: espesor vs. esbeltez"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño a flexión: cálculo de pérdidas de pretensado", "Cap. 6 – Cortante y torsión en elementos pretensados", "Cap. 11 – Conexiones de elementos prefabricados (cortante y tensión)"] },
    ],
    url: "https://www.pci.org/PCI_Docs/Design_Resources/Handbook/PCIDesignHandbook8thEdition.aspx",
    organization: "PCI",
    year: 2017,
    popular: true,
    color: "#0891b2",
    abbr: "PCI\nDH-8",
  },

  {
    id: "fema-p58",
    title: "FEMA P-58",
    fullTitle: "Seismic Performance Assessment of Buildings – Methodology and Implementation",
    description:
      "Metodología FEMA P-58 para evaluación del desempeño sísmico de edificios: pérdidas monetarias, tiempo de ocupación y probabilidad de colapso por función de fragilidad.",
    regions: ["northamerica", "internacional"],
    stages: ["analisis"],
    stageDetails: [
      { stage: "analisis", chapters: ["Vol. 1, Cap. 3 – Evaluación de demanda sísmica: IDA y análisis no lineal", "Vol. 1, Cap. 4 – Evaluación de daño: curvas de fragilidad por componente", "Vol. 2 – Implementación: base de datos de componentes y pérdidas"] },
    ],
    url: "https://www.fema.gov/sites/default/files/2020-09/fema_p-58_seismic_performance_assessment_of_buildings_methodology.pdf",
    pdfUrl: "https://www.fema.gov/sites/default/files/2020-09/fema_p-58_seismic_performance_assessment_of_buildings_methodology.pdf",
    organization: "FEMA / ATC",
    year: 2018,
    popular: true,
    free: true,
    color: "#065f46",
    abbr: "FEMA\nP-58",
  },
  {
    id: "fema-p1051",
    title: "FEMA P-1051",
    fullTitle: "NEHRP Recommended Seismic Provisions: Design Examples",
    description:
      "Ejemplos de diseño sísmico con las provisiones NEHRP: marcos de concreto, muros de cortante, marcos de acero SMF, estructuras con aislamiento y disipadores.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "modelamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 4 – Selección del sistema y predimensionamiento sísmico", "Cap. 5 – Irregularidades y sus efectos en el diseño"] },
      { stage: "modelamiento", chapters: ["Cap. 6 – Modelado para análisis modal espectral (ASCE 7)", "Cap. 8 – Modelado de estructuras con aislamiento sísmico"] },
      { stage: "analisis", chapters: ["Cap. 7 – Análisis dinámico de respuesta espectral: ejemplo completo", "Cap. 9 – Análisis tiempo-historia no lineal"] },
      { stage: "diseno_elementos", chapters: ["Cap. 10 – Diseño de muros de cortante de concreto (ACI 318 Cap. 18)", "Cap. 11 – Diseño de marcos especiales de acero (AISC 341)"] },
    ],
    url: "https://www.fema.gov/sites/default/files/2020-07/fema-p1051.pdf",
    pdfUrl: "https://www.fema.gov/sites/default/files/2020-07/fema-p1051.pdf",
    organization: "FEMA / BSSC",
    year: 2016,
    popular: true,
    free: true,
    color: "#166534",
    abbr: "FEMA\nP-1051",
  },
  {
    id: "atc-40",
    title: "ATC-40",
    fullTitle: "Seismic Evaluation and Retrofit of Concrete Buildings",
    description:
      "Metodología de evaluación sísmica de edificios de concreto existentes. Define el Método de Espectro de Capacidad (CSM) para diseño basado en desempeño.",
    regions: ["northamerica", "internacional"],
    stages: ["analisis", "modelamiento"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 8 – Modelado no lineal de componentes de concreto", "Cap. 9 – Parámetros de modelado: rigidez efectiva y ductilidad"] },
      { stage: "analisis", chapters: ["Cap. 6 – Análisis estático no lineal (Pushover) de concreto", "Cap. 7 – Método del Espectro de Capacidad (CSM): punto de desempeño", "Cap. 10 – Criterios de aceptación por nivel de desempeño (IO, LS, CP)"] },
    ],
    url: "https://www.atcouncil.org/pdfs/ATC40toc.pdf",
    organization: "ATC",
    year: 1996,
    popular: true,
    color: "#0f766e",
    abbr: "ATC\n40",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     PERÚ – RNE Y PUBLICACIONES NACIONALES
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "manual-rne-peru",
    title: "Manual RNE",
    fullTitle: "Manual de Aplicación del Reglamento Nacional de Edificaciones",
    description:
      "Manual de aplicación práctica del RNE peruano. Guía paso a paso para el uso de las normas E.020, E.030, E.060 y E.050 en proyectos reales.",
    regions: ["peru"],
    stages: ["metrado", "predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "metrado", chapters: ["Cap. 2 – Metrado de cargas gravitacionales según E.020", "Cap. 3 – Carga sísmica según E.030: pasos de cálculo"] },
      { stage: "predimensionamiento", chapters: ["Cap. 4 – Predimensionamiento de vigas, columnas y losas (E.060)", "Cap. 5 – Densidad mínima de muros en albañilería confinada (E.070)"] },
      { stage: "diseno_elementos", chapters: ["Cap. 6 – Diseño de vigas rectangulares y en T (E.060)", "Cap. 7 – Diseño de columnas cortas y esbeltas (E.060 Art. 21)"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 9 – Diseño de zapatas aisladas según E.050 y E.060", "Cap. 10 – Diseño de losas de cimentación"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "SENCICO / MVCS",
    year: 2022,
    popular: true,
    color: "#be123c",
    abbr: "Manual\nRNE",
  },
  {
    id: "manual-concreto-peru",
    title: "Manual de Concreto",
    fullTitle: "Manual de Diseño de Estructuras de Concreto Armado – CAPECO",
    description:
      "Manual técnico para diseño de estructuras de concreto armado adaptado a la práctica peruana. Incluye tablas de diseño, ejemplos y detallado conforme al E.060.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Guía rápida de predimensionamiento de elementos según E.060", "Cap. 3.2 – Tablas de espesor mínimo de losas aligeradas"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño de vigas a flexión y cortante", "Cap. 5 – Diseño de columnas: diagramas de interacción P-M para E.060", "Cap. 6 – Diseño de muros de corte (placas) según E.060 y E.030"] },
    ],
    url: "https://www.capeco.org/publicaciones/",
    organization: "CAPECO",
    year: 2019,
    color: "#c2410c",
    abbr: "Manual\nCAP.",
  },
  {
    id: "manual-sismo-peru",
    title: "Manual Sismo RNE",
    fullTitle: "Manual de Diseño Sismorresistente – Aplicación de la Norma E.030",
    description:
      "Manual de aplicación de la norma E.030:2022. Ejemplos de análisis modal espectral, control de derivas, irregularidades y dimensionamiento de juntas sísmicas.",
    regions: ["peru"],
    stages: ["modelamiento", "analisis"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 2 – Modelado en ETABS/SAP2000 conforme a E.030", "Cap. 3 – Definición del espectro de diseño Sa(T) para zonas peruanas", "Cap. 4 – Asignación de masas sísmicas según E.030 Art. 25"] },
      { stage: "analisis", chapters: ["Cap. 5 – Análisis estático equivalente: paso a paso", "Cap. 6 – Análisis modal espectral: modos, CQC y combinación direccional", "Cap. 7 – Control de derivas (Δ/h ≤ 0.007 concreto / 0.010 acero)", "Cap. 8 – Verificación de irregularidades en planta y altura"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "SENCICO",
    year: 2022,
    popular: true,
    color: "#9f1239",
    abbr: "Manual\nE.030",
  },
  {
    id: "manual-cimentaciones-peru",
    title: "Manual Cimentaciones",
    fullTitle: "Manual de Diseño de Cimentaciones – Aplicación de la Norma E.050",
    description:
      "Guía práctica para diseño de cimentaciones superficiales y profundas según E.050: zapatas, vigas de cimentación, pilotes y losas de fundación.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Lectura del EMS: capacidad portante y nivel de cimentación", "Cap. 3 – Selección del tipo de cimentación según E.050"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 4 – Diseño de zapatas aisladas: dimensionamiento y verificación", "Cap. 5 – Diseño de zapatas combinadas y arriostradas", "Cap. 6 – Vigas de cimentación: predimensionamiento y diseño", "Cap. 7 – Pilotes de concreto: capacidad axial y lateral"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "SENCICO / MVCS",
    year: 2020,
    color: "#92400e",
    abbr: "Manual\nE.050",
  },

  {
    id: "manual-albañileria-peru",
    title: "Manual Albañilería",
    fullTitle: "Manual de Diseño de Albañilería Confinada y Armada – SENCICO",
    description:
      "Manual práctico para el diseño de muros de albañilería confinada y armada conforme a la norma E.070. Incluye cálculo de densidad de muros, diseño por cortante y detalles.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Densidad mínima de muros por zona sísmica (E.070 Art. 19)", "Cap. 3 – Selección de unidades de albañilería y mortero"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño de muros confinados a carga vertical y cortante", "Cap. 5 – Diseño de muros armados con refuerzo horizontal", "Cap. 6 – Detallado de columnas de confinamiento y soleras"] },
    ],
    url: "https://www.sencico.gob.pe/publicaciones.php?id=230",
    organization: "SENCICO",
    year: 2018,
    color: "#854d0e",
    abbr: "Manual\nE.070",
  },
  {
    id: "manual-acero-peru",
    title: "Manual Acero Perú",
    fullTitle: "Manual de Diseño de Estructuras Metálicas – ACERO AREQUIPA",
    description:
      "Manual de diseño de estructuras metálicas adaptado a la norma E.090 y la práctica peruana. Incluye tablas de perfiles, conexiones y ejemplos de edificios industriales.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Tablas de propiedades de perfiles W, C y L producidos en Perú", "Cap. 3 – Predimensionamiento de vigas y columnas de acero (E.090)"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño de vigas a flexión y cortante (LRFD / ASD)", "Cap. 5 – Diseño de columnas a compresión y pandeo", "Cap. 6 – Diseño de conexiones: pernos de alta resistencia A325 y A490", "Cap. 7 – Uniones soldadas: filete y ranura según AWS D1.1"] },
    ],
    url: "https://www.acerosarequipa.com/",
    organization: "Aceros Arequipa",
    year: 2016,
    color: "#475569",
    abbr: "Manual\nAcero",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     INTERNACIONAL – CIMENTACIONES Y GEOTECNIA
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "navfac-dm7",
    title: "NAVFAC DM-7",
    fullTitle: "Design Manual 7: Soil Mechanics, Foundations and Earth Structures",
    description:
      "Manual de mecánica de suelos y cimentaciones de la Marina de EE.UU. Referencia clásica para diseño geotécnico: capacidad portante, asentamientos, empuje de tierras y pilotes.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["DM-7.1 Cap. 4 – Exploración del subsuelo y estratigrafía", "DM-7.1 Cap. 5 – Resistencia al corte y compresibilidad de suelos"] },
      { stage: "diseno_cimentaciones", chapters: ["DM-7.2 Cap. 4 – Capacidad portante de zapatas superficiales (Terzaghi, Meyerhof)", "DM-7.2 Cap. 5 – Asentamientos elásticos e inmediatos", "DM-7.2 Cap. 6 – Diseño de pilotes y grupos de pilotes", "DM-7.2 Cap. 8 – Estabilidad de taludes y empuje de tierras"] },
    ],
    url: "https://www.geotechnicaldirectory.com/navfac-dm7/",
    organization: "NAVFAC / US Navy",
    year: 1986,
    free: true,
    color: "#1e3a5f",
    abbr: "NAVFAC\nDM-7",
  },
  {
    id: "bowles-foundations",
    title: "Bowles – Foundations",
    fullTitle: "Foundation Analysis and Design – 5th Edition",
    description:
      "Texto de referencia mundial de diseño de cimentaciones de Joseph Bowles. Cubre zapatas, pilotes, tablestacas, mejoramiento de suelo y diseño asistido por computadora.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "analisis", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Capacidad portante: teoría de Terzaghi y Meyerhof", "Cap. 4 – Selección del tipo de cimentación según condiciones del suelo"] },
      { stage: "analisis", chapters: ["Cap. 9 – Análisis de asentamientos diferencial e inmediato", "Cap. 11 – Análisis matricial de pilotes y grupos de pilotes"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 7 – Diseño de zapatas aisladas, combinadas y corridas", "Cap. 8 – Diseño de losas de cimentación (mat foundation)", "Cap. 12 – Diseño de muros de sótano y estructuras de retención"] },
    ],
    url: "https://www.mheducation.com/highered/product/foundation-analysis-design-bowles/9780079122477.html",
    organization: "McGraw-Hill",
    year: 1996,
    popular: true,
    color: "#1e3a8a",
    abbr: "Bowles\nFound.",
  },
  {
    id: "das-principles",
    title: "Das – Principios",
    fullTitle: "Principles of Foundation Engineering – 9th Edition",
    description:
      "Texto universitario de referencia para mecánica de suelos y cimentaciones de Braja Das. Cubre capacidad portante, asentamientos, consolidación y empuje lateral.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Capacidad portante de cimentaciones superficiales", "Cap. 4 – Asentamiento de cimentaciones superficiales en arena y arcilla"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 11 – Diseño de pilotes por capacidad portante y fricción lateral", "Cap. 13 – Losas de cimentación: rígida y flexible", "Cap. 15 – Muros de contención: gravedad, en voladizo y anclados"] },
    ],
    url: "https://www.cengage.com/c/principles-of-foundation-engineering-9e-das/9781337705028/",
    organization: "Cengage Learning",
    year: 2019,
    color: "#374151",
    abbr: "Das\nPFE",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     INTERNACIONAL – ANÁLISIS Y DISEÑO ESTRUCTURAL
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "istructe-concrete",
    title: "IStructE Manual",
    fullTitle: "Manual for the Design of Concrete Building Structures to Eurocode 2",
    description:
      "Manual de diseño de estructuras de concreto conforme al Eurocode 2, publicado por la IStructE. Ampliamente usado como referencia internacional.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Predimensionamiento de vigas, losas y columnas", "Cap. 3.4 – Reglas prácticas de espesor/vano para losas"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño de losas macizas y nervadas", "Cap. 5 – Diseño de vigas a flexión y cortante (EC2)", "Cap. 6 – Diseño de columnas bajo carga excéntrica"] },
    ],
    url: "https://www.istructe.org/resources/guidance/manual-for-the-design-of-concrete-building-struc/",
    organization: "IStructE",
    year: 2006,
    color: "#1e40af",
    abbr: "IStruct\nEC2",
  },
  {
    id: "fib-model-code",
    title: "fib MC 2020",
    fullTitle: "fib Model Code for Concrete Structures 2020",
    description:
      "Código modelo FIB 2020 para estructuras de concreto. Base de la próxima generación de normas internacionales: UHPC, FRP, sostenibilidad y concreto reciclado.",
    regions: ["internacional"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 5 – Análisis estructural: lineal, no lineal y plástico", "Cap. 6 – Análisis sísmico y de cargas accidentales"] },
      { stage: "diseno_elementos", chapters: ["Cap. 7 – Estados límite últimos: flexión, cortante y torsión", "Cap. 8 – Estados límite de servicio: fisuración y deflexión", "Cap. 10 – Concreto de ultra-alta resistencia (UHPC)"] },
    ],
    url: "https://www.fib-international.org/publications/fib-model-code-2020.html",
    organization: "fib",
    year: 2023,
    color: "#4338ca",
    abbr: "fib\nMC20",
  },
  {
    id: "chopra-dynamics",
    title: "Chopra – Dynamics",
    fullTitle: "Dynamics of Structures: Theory and Applications to Earthquake Engineering – 5th Ed.",
    description:
      "Texto fundamental de dinámica estructural de Anil Chopra. Cubre SDOF, MDOF, análisis modal, respuesta sísmica, espectros de diseño y análisis no lineal.",
    regions: ["internacional"],
    stages: ["modelamiento", "analisis"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Part I – Sistemas de un grado de libertad (SDOF): ecuación del movimiento", "Part II – Sistemas de múltiples grados de libertad (MDOF): matrices de masa y rigidez"] },
      { stage: "analisis", chapters: ["Part III – Análisis modal: superposición modal y CQC", "Part IV – Respuesta de estructuras ante excitación sísmica", "Part V – Análisis tiempo-historia y espectros de respuesta"] },
    ],
    url: "https://www.pearson.com/en-us/subject-catalog/p/dynamics-of-structures/P200000006553",
    organization: "Pearson / Prentice Hall",
    year: 2017,
    popular: true,
    color: "#4338ca",
    abbr: "Chopra\nDyn.",
  },
  {
    id: "paulay-priestley",
    title: "Paulay & Priestley",
    fullTitle: "Seismic Design of Reinforced Concrete and Masonry Buildings",
    description:
      "Texto clásico de diseño sísmico de Paulay y Priestley. Define la filosofía de diseño por capacidad y el detallado sísmico de muros, columnas y conexiones viga-columna.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Filosofía de diseño por capacidad: jerarquía de resistencias", "Cap. 3 – Selección del sistema estructural y predimensionamiento sísmico"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño dúctil de vigas a flexión y cortante", "Cap. 5 – Diseño de columnas: biaxial y zonas de confinamiento", "Cap. 6 – Uniones viga-columna: mecanismo de puntales y tirantes", "Cap. 7 – Muros de cortante dúctiles: diseño por capacidad"] },
    ],
    url: "https://www.wiley.com/en-us/Seismic+Design+of+Reinforced+Concrete+and+Masonry+Buildings-p-9780471549154",
    organization: "Wiley & Sons",
    year: 1992,
    popular: true,
    color: "#7c3aed",
    abbr: "Paulay\n& P.",
  },
  {
    id: "park-paulay",
    title: "Park & Paulay",
    fullTitle: "Reinforced Concrete Structures",
    description:
      "Texto de referencia de Park y Paulay para diseño de estructuras de concreto: fundamentos de resistencia, ductilidad, detallado sísmico y comportamiento no lineal.",
    regions: ["internacional"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 4 – Análisis de secciones de concreto: curva momento-curvatura", "Cap. 6 – Redistribución de momentos en estructuras continuas de concreto"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de vigas a flexión, cortante y torsión", "Cap. 7 – Diseño de columnas: biaxial y pandeo", "Cap. 12 – Diseño dúctil de marcos y muros de concreto"] },
    ],
    url: "https://www.wiley.com/en-us/Reinforced+Concrete+Structures-p-9780471659174",
    organization: "Wiley & Sons",
    year: 1975,
    color: "#6d28d9",
    abbr: "Park\n& P.",
  },
  {
    id: "nilson-darwin",
    title: "Nilson, Darwin & Dolan",
    fullTitle: "Design of Concrete Structures – 15th Edition",
    description:
      "Texto universitario estándar de diseño de concreto basado en ACI 318. Cubre flexión, cortante, torsión, losas, columnas, cimentaciones y estructuras pretensadas.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Dimensionamiento de secciones rectangulares a flexión", "Cap. 9 – Predimensionamiento de losas macizas y aligeradas"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Diseño a flexión simple y doble refuerzo", "Cap. 5 – Diseño a cortante y torsión (ACI 318)", "Cap. 10 – Diseño de columnas esbeltas: amplificación de momentos", "Cap. 14 – Estructuras preesforzadas: diseño de vigas pretensadas"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 12 – Diseño de zapatas aisladas, combinadas y corridas"] },
    ],
    url: "https://www.mheducation.com/highered/product/design-concrete-structures-nilson-darwin/M9780073397948.html",
    organization: "McGraw-Hill",
    year: 2016,
    color: "#1e40af",
    abbr: "Nilson\nDCS",
  },
  {
    id: "mccormac-brown",
    title: "McCormac & Brown",
    fullTitle: "Design of Reinforced Concrete – ACI 318-14 Code Edition – 9th Ed.",
    description:
      "Texto de diseño de concreto armado conforme al ACI 318-14. Orientado a la práctica con abundantes ejemplos numéricos de vigas, columnas, losas y cimentaciones.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Materiales y propiedades: f'c, fy y módulo de elasticidad", "Cap. 6 – Selección de sección a flexión: tablas de As por bd²"] },
      { stage: "diseno_elementos", chapters: ["Cap. 7 – Diseño de vigas T y doble refuerzo", "Cap. 9 – Diseño a cortante: estribos verticales e inclinados", "Cap. 11 – Diseño de columnas cortas y esbeltas (ACI 318)"] },
    ],
    url: "https://www.wiley.com/en-us/Design+of+Reinforced+Concrete%2C+9th+Edition-p-9781118879528",
    organization: "Wiley & Sons",
    year: 2014,
    color: "#0369a1",
    abbr: "McCorm\n& B.",
  },
  {
    id: "salmon-steel",
    title: "Salmon, Johnson & Malhas",
    fullTitle: "Steel Structures: Design and Behavior – 5th Edition",
    description:
      "Texto de referencia en diseño de estructuras de acero. Cubre LRFD y ASD, pandeo, marcos a momento, conexiones y diseño sísmico conforme al AISC 360.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 6 – Vigas: selección de perfil por momento último (φMn ≥ Mu)", "Cap. 8 – Columnas: tablas de φFcr × Ag por KL/r"] },
      { stage: "analisis", chapters: ["Cap. 14 – Análisis de marcos de acero: método de amplificación B1-B2"] },
      { stage: "diseno_elementos", chapters: ["Cap. 9 – Pandeo lateral-torsional: parámetros Lb, Lp, Lr", "Cap. 12 – Diseño de conexiones a cortante y a momento", "Cap. 13 – Diseño de placas base y anclajes"] },
    ],
    url: "https://www.pearson.com/en-us/subject-catalog/p/steel-structures/P200000006619",
    organization: "Pearson",
    year: 2009,
    color: "#7f1d1d",
    abbr: "Salmon\nSteel",
  },
  {
    id: "seaoc-bluebook",
    title: "SEAOC Blue Book",
    fullTitle: "Recommended Lateral Force Requirements and Commentary",
    description:
      "Libro azul del SEAOC: recomendaciones para fuerzas laterales, sistemas sismorresistentes y fundamento técnico del capítulo sísmico del ASCE 7.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "modelamiento", "analisis"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Sec. C101 – Sistemas estructurales: selección y restricciones por zona sísmica", "Sec. C104 – Factores de reducción R y su justificación"] },
      { stage: "modelamiento", chapters: ["Sec. C107 – Modelado para análisis dinámico: masa, rigidez y amortiguamiento"] },
      { stage: "analisis", chapters: ["Sec. C105 – Análisis estático equivalente", "Sec. C106 – Análisis dinámico modal y tiempo-historia"] },
    ],
    url: "https://www.seaoc.org/page/bluebook",
    organization: "SEAOC",
    year: 2019,
    popular: true,
    color: "#0369a1",
    abbr: "SEAOC\nBlue",
  },
  {
    id: "applied-tech-council-atc-3",
    title: "ATC-3-06",
    fullTitle: "Tentative Provisions for the Development of Seismic Regulations for Buildings",
    description:
      "Documento fundacional del diseño sísmico moderno en EE.UU. Primera propuesta de espectros de diseño suavizados, categorías de riesgo y provisiones de ductilidad.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "analisis"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Clasificación de sitio y mapas de peligro sísmico (1978)", "Cap. 4 – Sistemas estructurales y factores de reducción R"] },
      { stage: "analisis", chapters: ["Cap. 5 – Análisis de fuerzas laterales: distribución vertical de fuerzas sísmicas", "Cap. 7 – Espectro de diseño: forma del espectro suavizado"] },
    ],
    url: "https://www.atcouncil.org/pdfs/atc306.pdf",
    pdfUrl: "https://www.atcouncil.org/pdfs/atc306.pdf",
    organization: "ATC",
    year: 1978,
    free: true,
    color: "#0f766e",
    abbr: "ATC\n3-06",
  },
  {
    id: "eurocode8-guide",
    title: "Guía Eurocode 8",
    fullTitle: "Manual for the Design of Building Structures to Eurocode 8 – IStructE",
    description:
      "Guía práctica de diseño sísmico con el Eurocódigo 8 (EN 1998-1). Cubre espectros de diseño, sistemas sismorresistentes DCM/DCH y detallado de concreto y acero.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "modelamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Espectro elástico y de diseño EC8: parámetros ag, S, TB, TC, TD", "Cap. 4 – Selección del sistema y factor de comportamiento q"] },
      { stage: "modelamiento", chapters: ["Cap. 5 – Modelado del edificio: regularidad en planta y altura (EC8 §4.2)", "Cap. 6 – Análisis lateral simplificado y modal espectral"] },
      { stage: "analisis", chapters: ["Cap. 7 – Combinación sísmica: SRSS y CQC (EC8 §4.3.3)", "Cap. 8 – Control de daño: limitación de derivas inter-piso"] },
      { stage: "diseno_elementos", chapters: ["Cap. 9 – Detallado sísmico de vigas y columnas DCM/DCH (EC8 §5)", "Cap. 10 – Muros dúctiles de concreto: zona crítica y confinamiento"] },
    ],
    url: "https://www.istructe.org/resources/guidance/manual-for-the-design-of-building-structures-to-e/",
    organization: "IStructE",
    year: 2010,
    color: "#1e3a8a",
    abbr: "Manual\nEC8",
  },
  {
    id: "priestley-calvi-kowalsky",
    title: "Priestley, Calvi & Kowalsky",
    fullTitle: "Displacement-Based Seismic Design of Structures",
    description:
      "Texto de referencia para el diseño sísmico basado en desplazamientos (DDBD). Alternativa al diseño basado en fuerzas para concreto, acero, mampostería y puentes.",
    regions: ["internacional"],
    stages: ["predimensionamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Definición del nivel de desempeño: drift objetivo y deformación del material"] },
      { stage: "analisis", chapters: ["Cap. 4 – Método DDBD: rigidez efectiva y amortiguamiento equivalente", "Cap. 5 – Diseño de marcos de concreto por desplazamiento"] },
      { stage: "diseno_elementos", chapters: ["Cap. 6 – Diseño de muros de cortante bajo desplazamiento objetivo", "Cap. 8 – Diseño de sistemas duales por DDBD"] },
    ],
    url: "https://www.iuss.org/displacement-based-seismic-design-of-structures/",
    organization: "IUSS Press",
    year: 2007,
    color: "#6d28d9",
    abbr: "PCK\nDDBD",
  },

  /* ══════════════════════════════════════════════════════════════════════════
     LIBROS DE TEXTO – ANÁLISIS Y DISEÑO ESTRUCTURAL
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "libro-wight-macgregor",
    title: "Wight & MacGregor",
    fullTitle: "Reinforced Concrete: Mechanics and Design – 8th Edition",
    description:
      "Texto universitario de referencia mundial para diseño de concreto armado. Cubre toda la cadena de diseño: secciones, vigas, losas, columnas, muros y cimentaciones conforme al ACI 318.",
    regions: ["northamerica", "internacional"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 9 – Espesores mínimos de vigas y losas: L/d y control de deflexión", "Cap. 11 – Selección de sección transversal de columnas"] },
      { stage: "diseno_elementos", chapters: ["Cap. 4 – Comportamiento y diseño a flexión de vigas rectangulares", "Cap. 5 – Diseño a cortante en vigas y losas", "Cap. 6 – Diseño a torsión", "Cap. 11 – Columnas: excentricidad, curvas P-M y pandeo", "Cap. 14 – Muros de cortante: diseño y detallado sísmico"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 15 – Diseño de zapatas aisladas, combinadas y de muro", "Cap. 16 – Losas de cimentación (mat foundation)"] },
    ],
    url: "https://www.pearson.com/en-us/subject-catalog/p/reinforced-concrete-mechanics-and-design/P200000006567",
    organization: "Pearson",
    year: 2021,
    popular: true,
    color: "#1e3a8a",
    abbr: "Wight\n& McG.",
    docType: "libro",
  },
  {
    id: "libro-mccormac-csernak",
    title: "McCormac & Csernak",
    fullTitle: "Structural Steel Design – 6th Edition",
    description:
      "Texto estándar de diseño de estructuras de acero en EE.UU. Cubre LRFD y ASD, vigas, columnas, conexiones, marcos y diseño sísmico conforme al AISC 360.",
    regions: ["northamerica"],
    stages: ["predimensionamiento", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 5 – Selección de vigas de acero por tablas de φMn", "Cap. 8 – Predimensionamiento de columnas: tablas de carga axial (φFcr·Ag)"] },
      { stage: "diseno_elementos", chapters: ["Cap. 6 – Diseño de vigas a flexión: pandeo lateral-torsional", "Cap. 7 – Diseño de vigas a cortante y deflexión", "Cap. 9 – Columnas: pandeo y esbeltez KL/r", "Cap. 12 – Conexiones a cortante con pernos", "Cap. 13 – Conexiones soldadas y a momento"] },
    ],
    url: "https://www.pearson.com/en-us/subject-catalog/p/structural-steel-design/P200000006579",
    organization: "Pearson",
    year: 2014,
    color: "#7f1d1d",
    abbr: "McCorm\n& Cs.",
    docType: "libro",
  },
  {
    id: "libro-hibbeler-structural",
    title: "Hibbeler – Structural Analysis",
    fullTitle: "Structural Analysis – 10th Edition",
    description:
      "Texto universitario clásico de análisis estructural de Russell Hibbeler. Cubre cargas, vigas, armaduras, marcos, método de rigidez, líneas de influencia y análisis matricial.",
    regions: ["internacional"],
    stages: ["metrado", "modelamiento", "analisis"],
    stageDetails: [
      { stage: "metrado", chapters: ["Cap. 1 – Tipos de cargas estructurales: muertas, vivas, viento y sísmicas", "Cap. 2 – Análisis de cargas: distribución y transmisión al sistema estructural"] },
      { stage: "modelamiento", chapters: ["Cap. 2 – Idealización estructural: tipos de apoyos y conexiones", "Cap. 15 – Método de rigidez: ensamblaje de matrices globales"] },
      { stage: "analisis", chapters: ["Cap. 4 – Análisis de armaduras planas (método de nodos y secciones)", "Cap. 5 – Análisis de vigas: diagramas M, V y N", "Cap. 7 – Deflexiones: método de doble integración y Mohr", "Cap. 11 – Método de distribución de momentos (Hardy Cross)", "Cap. 15 – Método de rigidez directo: MDOF"] },
    ],
    url: "https://www.pearson.com/en-us/subject-catalog/p/structural-analysis/P200000006574",
    organization: "Pearson / Prentice Hall",
    year: 2018,
    popular: true,
    color: "#0369a1",
    abbr: "Hibbeler\nSA",
    docType: "libro",
  },
  {
    id: "libro-leet-uang",
    title: "Leet, Uang & Gilbert",
    fullTitle: "Fundamentals of Structural Analysis – 5th Edition",
    description:
      "Fundamentos de análisis estructural con énfasis en el método de rigidez y su aplicación computacional. Cubre armaduras, marcos, losas y análisis de segundo orden.",
    regions: ["northamerica", "internacional"],
    stages: ["modelamiento", "analisis"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 12 – Método de rigidez directo: grados de libertad y ensamblaje", "Cap. 13 – Modelado de apoyos y conexiones elásticas"] },
      { stage: "analisis", chapters: ["Cap. 3 – Análisis estático de armaduras", "Cap. 5 – Análisis de vigas continuas por rigidez", "Cap. 11 – Líneas de influencia para cargas móviles", "Cap. 14 – Análisis de segundo orden P-Δ"] },
    ],
    url: "https://www.mheducation.com/highered/product/fundamentals-structural-analysis-leet-uang/M9780073398006.html",
    organization: "McGraw-Hill",
    year: 2011,
    color: "#0891b2",
    abbr: "Leet\nFSA",
    docType: "libro",
  },
  {
    id: "libro-kassimali-structural",
    title: "Kassimali – Structural Analysis",
    fullTitle: "Structural Analysis – 6th Edition",
    description:
      "Texto completo de análisis estructural de Kassimali. Cubre desde cargas hasta análisis matricial avanzado: método de rigidez, estructuras espaciales y análisis dinámico básico.",
    regions: ["northamerica", "internacional"],
    stages: ["metrado", "analisis", "modelamiento"],
    stageDetails: [
      { stage: "metrado", chapters: ["Cap. 2 – Cargas en estructuras: combinaciones ASCE 7 y distribución en sistemas de piso"] },
      { stage: "modelamiento", chapters: ["Cap. 15 – Método de rigidez: modelado de marcos planos y espaciales"] },
      { stage: "analisis", chapters: ["Cap. 4 – Análisis de armaduras planas", "Cap. 6 – Análisis de vigas continuas (tres momentos y rigidez)", "Cap. 8 – Deflexiones: energía de deformación y teorema de Castigliano", "Cap. 16 – Análisis matricial de estructuras espaciales 3D"] },
    ],
    url: "https://www.cengage.com/c/structural-analysis-6e-kassimali/9781305289208/",
    organization: "Cengage Learning",
    year: 2015,
    color: "#0f766e",
    abbr: "Kassimali\nSA",
    docType: "libro",
  },
  {
    id: "libro-gere-goodno",
    title: "Gere & Goodno",
    fullTitle: "Mechanics of Materials – 9th Edition",
    description:
      "Texto clásico de resistencia de materiales de Gere y Goodno. Base teórica para el análisis de esfuerzos, deformaciones, flexión, torsión y pandeo en elementos estructurales.",
    regions: ["internacional"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 4 – Esfuerzos y deformaciones en vigas: distribución de tensiones normales", "Cap. 5 – Análisis de esfuerzos en secciones transversales: esfuerzo cortante", "Cap. 11 – Columnas: carga crítica de Euler y fórmulas de pandeo"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de secciones a flexión: módulo de sección (S)", "Cap. 6 – Torsión: secciones circulares y no circulares", "Cap. 11 – Diseño de columnas a pandeo: longitud efectiva KL"] },
    ],
    url: "https://www.cengage.com/c/mechanics-of-materials-9e-gere-goodno/9781337093347/",
    organization: "Cengage Learning",
    year: 2016,
    color: "#374151",
    abbr: "Gere\n& G.",
    docType: "libro",
  },
  {
    id: "libro-beer-johnston",
    title: "Beer, Johnston & DeWolf",
    fullTitle: "Mechanics of Materials – 8th Edition",
    description:
      "Texto de resistencia de materiales de Beer y Johnston. Cubre esfuerzos, deformaciones, torsión, flexión, deflexión de vigas y análisis de esfuerzos en el plano.",
    regions: ["internacional"],
    stages: ["analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "analisis", chapters: ["Cap. 4 – Flexión pura: distribución lineal de esfuerzos (My/I)", "Cap. 6 – Esfuerzo cortante en vigas: fórmula de Zhuravsky (VQ/Ib)", "Cap. 9 – Deflexión de vigas: integración y superposición"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de vigas a flexión: selección de perfil por S = M/σ_adm", "Cap. 10 – Columnas: pandeo de Euler y pandeo inelástico"] },
    ],
    url: "https://www.mheducation.com/highered/product/mechanics-of-materials-beer-johnston/M9781260113273.html",
    organization: "McGraw-Hill",
    year: 2019,
    color: "#1e3a5f",
    abbr: "Beer\n& J.",
    docType: "libro",
  },
  {
    id: "libro-aguiar-sismo",
    title: "Aguiar – Sismo Peru",
    fullTitle: "Análisis Sísmico por Desempeño – Roberto Aguiar",
    description:
      "Libro en español sobre análisis sísmico por desempeño aplicado a la práctica latinoamericana. Cubre pushover, IDA, curvas de fragilidad y diseño basado en desplazamientos.",
    regions: ["peru", "internacional"],
    stages: ["modelamiento", "analisis"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 3 – Modelado no lineal en SAP2000 y ETABS: rótulas plásticas", "Cap. 4 – Definición de curvas fuerza-deformación por componente"] },
      { stage: "analisis", chapters: ["Cap. 5 – Análisis pushover: curva de capacidad y punto de desempeño", "Cap. 6 – Niveles de desempeño: ocupación inmediata, seguridad de vida y prevención de colapso", "Cap. 7 – Análisis incremental dinámico (IDA): procesamiento de resultados"] },
    ],
    url: "https://www.espe.edu.ec/publicaciones/",
    organization: "ESPE / CIEES",
    year: 2015,
    color: "#be123c",
    abbr: "Aguiar\nSismo",
    docType: "libro",
  },
  {
    id: "libro-blanco-blasco",
    title: "Blanco Blasco",
    fullTitle: "Estructuración y Diseño de Edificaciones de Concreto Armado – 2ª Ed.",
    description:
      "Libro de referencia peruano de Antonio Blanco Blasco. Cubre la estructuración, predimensionamiento y diseño de edificios de concreto armado bajo las normas peruanas E.060 y E.030.",
    regions: ["peru"],
    stages: ["metrado", "predimensionamiento", "modelamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "metrado", chapters: ["Cap. 2 – Metrado de cargas gravitacionales en losas, vigas y columnas", "Cap. 3 – Peso sísmico de la edificación según E.030"] },
      { stage: "predimensionamiento", chapters: ["Cap. 4 – Predimensionamiento de losas aligeradas, vigas y columnas (E.060)", "Cap. 5 – Densidad de muros de albañilería confinada (E.070)"] },
      { stage: "modelamiento", chapters: ["Cap. 6 – Estructuración y modelado del edificio: diafragmas rígidos", "Cap. 7 – Centro de masa y centro de rigidez: excentricidad accidental"] },
      { stage: "analisis", chapters: ["Cap. 8 – Análisis sísmico estático y dinámico modal espectral (E.030)", "Cap. 9 – Control de derivas y verificación de irregularidades"] },
      { stage: "diseno_elementos", chapters: ["Cap. 10 – Diseño de vigas, columnas y muros (E.060 y E.030)", "Cap. 11 – Diseño de losas aligeradas y macizas"] },
    ],
    url: "https://civilgeeks.com/2011/11/15/libro-estructuracion-y-diseno-de-edificaciones-de-concreto-armado-de-antonio-blanco-blasco/",
    organization: "Colegio de Ingenieros del Perú",
    year: 1994,
    popular: true,
    color: "#9f1239",
    abbr: "Blanco\nBlasco",
    docType: "libro",
  },
  {
    id: "libro-ottazzi-concreto",
    title: "Ottazzi – Concreto",
    fullTitle: "Material de Apoyo para la Enseñanza de los Cursos de Concreto Armado – PUCP",
    description:
      "Material didáctico de Gianfranco Ottazzi (PUCP) para diseño de estructuras de concreto armado según E.060. Ampliamente usado en universidades peruanas como texto de referencia.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Predimensionamiento de losas, vigas y columnas (E.060)", "Cap. 4 – Parámetros de diseño: f'c, fy y recubrimientos mínimos"] },
      { stage: "diseno_elementos", chapters: ["Cap. 5 – Diseño de vigas a flexión simple y doble (E.060)", "Cap. 6 – Diseño a cortante y estribos", "Cap. 7 – Diseño de columnas cortas y esbeltas", "Cap. 8 – Muros de concreto (placas): diseño y detallado sísmico"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 11 – Diseño de zapatas aisladas y combinadas (E.060 y E.050)"] },
    ],
    url: "https://www.pucp.edu.pe/",
    organization: "PUCP",
    year: 2008,
    popular: true,
    color: "#1e3a5f",
    abbr: "Ottazzi\nPUCP",
    docType: "libro",
  },
  {
    id: "libro-rodriguez-mexico",
    title: "Rodríguez Ortiz",
    fullTitle: "Diseño Sísmico de Estructuras – Fundamentos y Aplicaciones",
    description:
      "Libro en español de referencia latinoamericana para diseño sísmico de estructuras de concreto y acero. Cubre filosofía de diseño por capacidad, ductilidad y detallado sísmico.",
    regions: ["internacional", "peru"],
    stages: ["predimensionamiento", "analisis", "diseno_elementos"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 3 – Sistemas estructurales sismorresistentes y selección del factor R", "Cap. 4 – Predimensionamiento sísmico: criterios de rigidez y resistencia"] },
      { stage: "analisis", chapters: ["Cap. 5 – Análisis sísmico equivalente estático y dinámico", "Cap. 6 – Análisis no lineal: pushover y demanda de ductilidad", "Cap. 7 – Control de derivas y estados límite de desempeño"] },
      { stage: "diseno_elementos", chapters: ["Cap. 8 – Diseño dúctil de vigas de concreto: zonas de rótula plástica", "Cap. 9 – Columnas sísmicas: diseño por capacidad y confinamiento", "Cap. 10 – Muros de cortante: diseño basado en capacidad"] },
    ],
    url: "https://www.limusa.com/",
    organization: "Limusa / Noriega Ed.",
    year: 2010,
    color: "#7c3aed",
    abbr: "Rodríguez\nDSE",
    docType: "libro",
  },
  {
    id: "libro-harmsen-concreto",
    title: "Harmsen – Concreto",
    fullTitle: "Diseño de Estructuras de Concreto Armado – 4ª Ed.",
    description:
      "Libro de referencia peruano de Teodoro Harmsen. Cubre el diseño de estructuras de concreto armado conforme a la norma E.060 con amplia aplicación numérica y ejemplos prácticos.",
    regions: ["peru"],
    stages: ["predimensionamiento", "diseno_elementos", "diseno_cimentaciones"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Materiales: concreto y acero según norma peruana", "Cap. 7 – Predimensionamiento de elementos estructurales de concreto"] },
      { stage: "diseno_elementos", chapters: ["Cap. 3 – Flexión simple: diseño de secciones rectangulares y en T", "Cap. 4 – Cortante: diseño de estribos verticales e inclinados", "Cap. 5 – Torsión combinada con flexión y cortante", "Cap. 8 – Columnas: diagramas de interacción P-M", "Cap. 9 – Muros de corte: placas de concreto armado"] },
      { stage: "diseno_cimentaciones", chapters: ["Cap. 11 – Zapatas aisladas: dimensionamiento y diseño de refuerzo", "Cap. 12 – Zapatas combinadas y vigas de cimentación"] },
    ],
    url: "https://www.pucp.edu.pe/",
    organization: "PUCP",
    year: 2005,
    popular: true,
    color: "#c2410c",
    abbr: "Harmsen\nConc.",
    docType: "libro",
  },
  {
    id: "libro-cassano-predim",
    title: "Cassano – Predim.",
    fullTitle: "Predimensionamiento Estructural de Edificios – Criterios y Tablas",
    description:
      "Libro práctico orientado al predimensionamiento rápido de elementos estructurales en edificios: losas, vigas, columnas y muros según normas ACI, EC2 y RNE.",
    regions: ["internacional", "peru"],
    stages: ["predimensionamiento"],
    stageDetails: [
      { stage: "predimensionamiento", chapters: ["Cap. 2 – Tablas de espesor de losas según vano y carga (ACI / EC2 / E.060)", "Cap. 3 – Predimensionamiento de vigas: relaciones L/d y L/b", "Cap. 4 – Columnas: sección mínima por carga axial acumulada", "Cap. 5 – Muros de albañilería: densidad mínima según zona sísmica"] },
    ],
    url: "https://www.libreriaimagenes.com/",
    organization: "Ed. Técnica",
    year: 2012,
    color: "#854d0e",
    abbr: "Cassano\nPre.",
    docType: "libro",
  },
  {
    id: "libro-smith-analysis",
    title: "Smith – Matrix Analysis",
    fullTitle: "Matrix Analysis of Structures – 2nd Edition",
    description:
      "Texto de análisis matricial de estructuras de Robert Smith. Cubre el método de rigidez directo para armaduras, marcos 2D/3D, elementos de losa y análisis dinámico.",
    regions: ["internacional"],
    stages: ["modelamiento", "analisis"],
    stageDetails: [
      { stage: "modelamiento", chapters: ["Cap. 2 – Ensamblaje de la matriz de rigidez global: grados de libertad", "Cap. 4 – Elementos de viga-columna: matriz de rigidez local y transformación"] },
      { stage: "analisis", chapters: ["Cap. 3 – Resolución de sistemas de ecuaciones: método de Gauss", "Cap. 6 – Análisis de marcos planos y espaciales 3D", "Cap. 8 – Análisis dinámico: matrices de masa y amortiguamiento"] },
    ],
    url: "https://www.pws-kent.com/",
    organization: "PWS-Kent Publishing",
    year: 1988,
    color: "#1e40af",
    abbr: "Smith\nMatrix",
    docType: "libro",
  },
];

const POPULAR_MANUALS = MANUALS.filter((m) => m.popular);

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function ManualesPage() {
  const [search, setSearch] = useState("");
  const [activeRegions, setActiveRegions] = useState<Region[]>([]);
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  const [activeDocTypes, setActiveDocTypes] = useState<DocType[]>([]);
  const [detailManual, setDetailManual] = useState<Manual | null>(null);

  const toggleRegion = (r: Region) =>
    setActiveRegions((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));
  const toggleStage = (s: Stage) =>
    setActiveStages((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleDocType = (d: DocType) =>
    setActiveDocTypes((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const clearAll = () => { setActiveRegions([]); setActiveStages([]); setActiveDocTypes([]); setSearch(""); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MANUALS.filter((m) => {
      const matchSearch = !q || m.title.toLowerCase().includes(q) || m.fullTitle.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.organization.toLowerCase().includes(q);
      const matchRegion = activeRegions.length === 0 || m.regions.some((r) => activeRegions.includes(r));
      const matchStage = activeStages.length === 0 || m.stages.some((s) => activeStages.includes(s));
      const matchDocType = activeDocTypes.length === 0 || activeDocTypes.includes(m.docType ?? "manual");
      return matchSearch && matchRegion && matchStage && matchDocType;
    });
  }, [search, activeRegions, activeStages, activeDocTypes]);

  const hasFilters = activeRegions.length > 0 || activeStages.length > 0 || activeDocTypes.length > 0 || search.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-100 p-2 shrink-0">
            <BookOpen className="h-6 w-6 text-violet-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manuales y Guías Técnicas</h1>
            <p className="mt-1 text-sm text-slate-500">Manuales de diseño estructural — Norteamérica, Perú e Internacional</p>
          </div>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar manual, guía, organización..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
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
            <button key={r} onClick={() => toggleRegion(r)} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200">
              {REGION_LABELS[r]} <X className="h-3 w-3" />
            </button>
          ))}
          {activeStages.map((s) => (
            <button key={s} onClick={() => toggleStage(s)} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200">
              {STAGE_LABELS[s]} <X className="h-3 w-3" />
            </button>
          ))}
          {activeDocTypes.map((d) => (
            <button key={d} onClick={() => toggleDocType(d)} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200">
              {DOCTYPE_LABELS[d]} <X className="h-3 w-3" />
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
                  <input type="checkbox" checked={activeRegions.includes(r)} onChange={() => toggleRegion(r)} className="rounded border-slate-300 text-violet-600 focus:ring-violet-400" />
                  <span className={`text-sm ${activeRegions.includes(r) ? "font-semibold text-violet-700" : "text-slate-600 group-hover:text-violet-600"}`}>{REGION_LABELS[r]}</span>
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
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Publicación</p>
            <div className="space-y-2">
              {(Object.keys(DOCTYPE_LABELS) as DocType[]).map((d) => (
                <label key={d} className="flex cursor-pointer items-center gap-2 group">
                  <input type="checkbox" checked={activeDocTypes.includes(d)} onChange={() => toggleDocType(d)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
                  <span className={`text-sm ${activeDocTypes.includes(d) ? "font-semibold text-indigo-700" : "text-slate-600 group-hover:text-indigo-600"}`}>{DOCTYPE_LABELS[d]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Más Consultados</p>
            <ul className="space-y-2">
              {POPULAR_MANUALS.map((m) => (
                <li key={m.id}>
                  <button onClick={() => setDetailManual(m)} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 hover:underline text-left">
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    {m.title}
                    <span className="text-xs text-slate-400">— {m.organization}</span>
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
              <p className="font-medium text-slate-500">No se encontraron manuales con esos filtros.</p>
              <button onClick={clearAll} className="mt-3 text-sm text-violet-600 hover:underline">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-400">
                {filtered.length} manual{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} onDetails={() => setDetailManual(manual)} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {detailManual && <DetailModal manual={detailManual} onClose={() => setDetailManual(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MANUAL CARD
───────────────────────────────────────────────────────────────────────────── */
function ManualCard({ manual, onDetails }: { manual: Manual; onDetails: () => void }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="flex gap-3 p-4">
        <div
          className="shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-center"
          style={{ backgroundColor: manual.color }}
        >
          <span className="text-white font-bold text-[11px] leading-tight whitespace-pre-line">
            {manual.abbr}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{manual.title}</h3>
            {manual.popular && <Star className="h-3.5 w-3.5 shrink-0 mt-0.5 fill-amber-400 text-amber-400" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{manual.organization} · {manual.year}</p>
          <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-3">{manual.description}</p>
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-1">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DOCTYPE_COLORS[manual.docType ?? "manual"]}`}>
          {DOCTYPE_LABELS[manual.docType ?? "manual"]}
        </span>
        {manual.stages.map((s) => (
          <span key={s} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STAGE_COLORS[s]}`}>
            {STAGE_LABELS[s]}
          </span>
        ))}
        {manual.free && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700">
            Acceso libre
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
        <button
          onClick={onDetails}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          Ver Detalles
        </button>
        {manual.pdfUrl ? (
          <a
            href={manual.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar PDF
          </a>
        ) : (
          <a
            href={manual.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 transition-colors"
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
function DetailModal({ manual, onClose }: { manual: Manual; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 p-5 border-b border-slate-100" style={{ backgroundColor: manual.color + "18" }}>
          <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: manual.color }}>
            <span className="text-white font-bold text-[11px] leading-tight whitespace-pre-line text-center">{manual.abbr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 text-lg">{manual.title}</h2>
            <p className="text-sm text-slate-500 leading-snug">{manual.fullTitle}</p>
            <p className="text-xs text-slate-400 mt-0.5">{manual.organization} · {manual.year}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full p-1.5 hover:bg-slate-200 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {manual.stageDetails.map((sd) => (
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

        <div className="border-t border-slate-100 p-4 flex gap-3">
          <a
            href={manual.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver publicación oficial
          </a>
          {manual.pdfUrl && (
            <a
              href={manual.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
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
