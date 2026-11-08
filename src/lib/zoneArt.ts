// Dessine le marquage d'une zone (logos + textes) dans un canvas à fond transparent.
// Sert de texture pour l'aperçu 3D. Ce n'est PAS le fichier de production :
// celui-ci sera généré côté serveur à partir des fichiers originaux.

import type { MarkingZone } from "@/data/catalog";
import type { DesignElement } from "./design";

const images = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
    images.set(src, p);
  }
  return p;
}

export async function renderZoneArt(elements: DesignElement[], zone: MarkingZone, maxSide = 1024) {
  const b = zone.box;
  const k = maxSide / Math.max(b.w, b.h);
  const c = document.createElement("canvas");
  c.width = Math.round(b.w * k);
  c.height = Math.round(b.h * k);
  const ctx = c.getContext("2d")!;
  for (const el of elements) {
    ctx.save();
    ctx.translate((el.x - b.x + el.width / 2) * k, (el.y - b.y + el.height / 2) * k);
    ctx.rotate(((el.rotation ?? 0) * Math.PI) / 180);
    if (el.type === "image" && el.src) {
      try {
        const img = await loadImage(el.src);
        ctx.drawImage(img, (-el.width / 2) * k, (-el.height / 2) * k, el.width * k, el.height * k);
      } catch {
        /* image illisible : ignorée dans l'aperçu */
      }
    } else if (el.type === "text" && el.text) {
      const fs = (el.fontSize ?? 20) * k;
      ctx.font = `${el.italic ? "italic " : ""}${el.bold === false ? "" : "bold "}${fs}px ${el.fontFamily ?? "Arial, sans-serif"}`;
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(el.letterSpacing ?? 0) * k}px`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (el.stroke) {
        ctx.lineJoin = "round";
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = Math.max(0.6, (el.fontSize ?? 20) * 0.06) * k;
        ctx.strokeText(el.text, 0, 0);
      }
      ctx.fillStyle = el.fill ?? "#0B1220";
      ctx.fillText(el.text, 0, 0);
    }
    ctx.restore();
  }
  // Bordure transparente : le marquage épouse les courbes sans « bavure » sur les bords
  ctx.clearRect(0, 0, c.width, 2);
  ctx.clearRect(0, c.height - 2, c.width, 2);
  ctx.clearRect(0, 0, 2, c.height);
  ctx.clearRect(c.width - 2, 0, 2, c.height);
  return c;
}
