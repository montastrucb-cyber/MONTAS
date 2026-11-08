import type { VisualKind } from "@/data/catalog";

// Liste légère (sans Three.js) des produits disponibles en 3D.
export const KINDS_3D: VisualKind[] = ["mug", "tasse-iso", "gourde", "carnet", "stylo", "tapis", "usb", "powerbank", "tote", "sac", "pack"];

export function supports3D(kind: VisualKind) {
  return KINDS_3D.includes(kind);
}
