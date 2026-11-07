// Modèle d'un projet de personnalisation.
// Les coordonnées sont exprimées dans le repère du visuel (0–400) ET peuvent être
// converties en millimètres réels grâce à la zone de marquage. Ce sont ces
// paramètres (+ le fichier original) qui serviront à générer le fichier de
// production HD côté serveur — jamais l'aperçu à l'écran.

import type { MarkingZone, View } from "@/data/catalog";

export type DesignElement = {
  id: string;
  type: "image" | "text";
  view: View;
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // image
  src?: string;
  fileName?: string;
  fileSize?: number;
  mime?: string;
  naturalWidth?: number;
  naturalHeight?: number;
  // texte
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
};

export type DesignProject = {
  productSlug: string;
  colorHex: string;
  elements: DesignElement[];
  savedAt?: string;
};

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 Mo

/** Taille réelle de l'élément en millimètres */
export function sizeMm(el: DesignElement, zone: MarkingZone) {
  return {
    w: (el.width / zone.box.w) * zone.widthMm,
    h: (el.height / zone.box.h) * zone.heightMm,
  };
}

export type Quality = { level: "vector" | "good" | "ok" | "low"; dpi: number | null; label: string };

/** Résolution effective à l'impression (points par pouce) */
export function imageQuality(el: DesignElement, zone: MarkingZone): Quality {
  if (el.mime === "image/svg+xml") return { level: "vector", dpi: null, label: "Vectoriel : qualité parfaite à toute taille" };
  if (!el.naturalWidth) return { level: "ok", dpi: null, label: "" };
  const { w } = sizeMm(el, zone);
  const dpi = Math.round(el.naturalWidth / (w / 25.4));
  if (dpi >= 250) return { level: "good", dpi, label: "Excellente qualité d'impression" };
  if (dpi >= 150) return { level: "ok", dpi, label: "Qualité correcte" };
  return { level: "low", dpi, label: "Résolution insuffisante : risque de flou à l'impression" };
}

const KEY = "demo-designs-v1";

export function saveProject(p: DesignProject): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    all[p.productSlug] = { ...p, savedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function loadProject(slug: string): DesignProject | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")[slug] ?? null;
  } catch {
    return null;
  }
}
