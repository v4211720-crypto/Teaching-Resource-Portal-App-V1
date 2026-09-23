// Institutional Brand Theme Palette & Color Utilities

export interface ThemePreset {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const DEFAULT_BRAND_COLOR = "#115e59";

export const INSTITUTIONAL_THEME_PRESETS: ThemePreset[] = [
  {
    id: "cambridge-scholastic-teal",
    name: "Cambridge Scholastic Teal",
    hex: "#115e59",
    description: "Polytechnic & Research Academic Teal, prestigious and scholarly",
  },
  {
    id: "classic-navy",
    name: "Classic Navy",
    hex: "#1e3a8a",
    description: "Traditional collegiate navy blue, authoritative and timeless",
  },
  {
    id: "deep-indigo",
    name: "Deep Indigo",
    hex: "#312e81",
    description: "Modern academic indigo, creative and scholarly",
  },
  {
    id: "royal-blue",
    name: "Royal Blue",
    hex: "#1d4ed8",
    description: "Vibrant high-contrast cobalt for modern academies",
  },
  {
    id: "emerald-green",
    name: "Emerald Green",
    hex: "#064e3b",
    description: "Deep prestigious emerald, representing growth and excellence",
  },
  {
    id: "forest-pine",
    name: "Forest Pine",
    hex: "#065f46",
    description: "Natural pine green, balanced and grounded",
  },
  {
    id: "teal-heritage",
    name: "Teal Heritage",
    hex: "#0f766e",
    description: "Sophisticated ocean teal, distinctive and modern",
  },
  {
    id: "regal-purple",
    name: "Regal Purple",
    hex: "#581c87",
    description: "Distinguished royal purple, historic and prestigious",
  },
  {
    id: "deep-violet",
    name: "Deep Violet",
    hex: "#4c1d95",
    description: "Refined dark violet with intellectual depth",
  },
  {
    id: "crimson-academy",
    name: "Crimson Academy",
    hex: "#881337",
    description: "Classic Ivy League crimson, bold and memorable",
  },
  {
    id: "burgundy-wine",
    name: "Burgundy Wine",
    hex: "#701a75",
    description: "Rich plum and burgundy, scholarly and refined",
  },
  {
    id: "slate-midnight",
    name: "Slate Midnight",
    hex: "#0f172a",
    description: "Ultra-clean dark midnight slate, sleek and focused",
  },
  {
    id: "modern-graphite",
    name: "Modern Graphite",
    hex: "#1e293b",
    description: "Contemporary dark slate graphite, balanced and versatile",
  },
  {
    id: "rich-amber",
    name: "Amber & Bronze",
    hex: "#78350f",
    description: "Warm autumnal bronze, distinguished and energetic",
  },
  {
    id: "charcoal-dark",
    name: "Deep Charcoal",
    hex: "#18181b",
    description: "Neutral deep charcoal for minimal, high-clarity workspaces",
  },
];

/**
 * Calculates the perceived brightness of a hex color using the YIQ formula.
 * Returns true if the color is dark (requiring light/white text for contrast).
 */
export function isDarkColor(hex?: string): boolean {
  if (!hex) return true;
  const clean = hex.replace("#", "").trim();
  let r = 30;
  let g = 58;
  let b = 138;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }

  // YIQ luminance formula: (r*299 + g*587 + b*114) / 1000
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 165;
}

/**
 * Generates a slightly adjusted hex color for subtle accents and borders.
 */
export function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace("#", "").trim();
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }

  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  const newR = clamp(r + amount).toString(16).padStart(2, "0");
  const newG = clamp(g + amount).toString(16).padStart(2, "0");
  const newB = clamp(b + amount).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}
