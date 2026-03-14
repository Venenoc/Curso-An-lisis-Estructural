/**
 * Paleta de colores Albert Structural
 * Refleja las variables CSS --as-* de globals.css
 * Úsala en inline styles o en lógica dinámica de componentes.
 */
export const palette = {
  /** Azul noche — fondo más oscuro (SplashScreen, fondos de sección) */
  navy:   "#0a1628",
  /** Acero oscuro — fondo secundario (SplashScreen mid, cards oscuras) */
  slate:  "#2E3F54",
  /** Azul acero — acento primario (barra navbar, bordes, subrayados) */
  steel:  "#6EBDE9",
  /** Cian vivo — highlights, wave audio, botones de acción */
  cyan:   "#22d3ee",
  /** Azul real — botones, degradados, íconos secundarios */
  blue:   "#3b82f6",
  /** Índigo eléctrico — profundidad, borde foto, gradientes */
  indigo: "#6366f1",
  /** Hielo — texto claro, extremo claro del gradiente AE */
  ice:    "#e2eaf4",
} as const;

export type PaletteKey = keyof typeof palette;

/** Gradiente principal de la marca (AE, SplashScreen) */
export const gradients = {
  brand:  `linear-gradient(135deg, ${palette.ice} 0%, ${palette.steel} 50%, ${palette.cyan} 100%)`,
  splash: `linear-gradient(135deg, ${palette.navy} 0%, ${palette.slate} 55%, #162233 100%)`,
  photo:  `linear-gradient(135deg, ${palette.steel} 0%, ${palette.blue} 60%, ${palette.indigo} 100%)`,
  bar:    `linear-gradient(90deg, ${palette.cyan}, ${palette.blue})`,
} as const;
