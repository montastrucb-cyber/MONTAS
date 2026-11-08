// Logo d'exemple dessiné à la volée, pour montrer le rendu 3D avant import.
import type { MarkingZone } from "@/data/catalog";

export function makeSampleArt(zone: MarkingZone, ink = "#0B1220", label = "VOTRE LOGO") {
  const ratio = zone.widthMm / zone.heightMm;
  const W = 1024;
  const H = Math.round(W / ratio);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const font = (size: number) => `700 ${size}px Arial, Helvetica, sans-serif`;

  const emblem = (cx: number, cy: number, r: number) => {
    x.fillStyle = "#0F766E";
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#5EEAD4";
    x.beginPath();
    x.moveTo(cx - r * 0.5, cy + r * 0.32);
    x.lineTo(cx, cy - r * 0.5);
    x.lineTo(cx + r * 0.5, cy + r * 0.32);
    x.closePath();
    x.fill();
  };

  x.fillStyle = ink;
  x.textBaseline = "middle";

  if (ratio >= 3) {
    // Zone très allongée (stylo, sangle) : texte seul, centré
    let fs = H * 0.62;
    x.font = font(fs);
    const tw = x.measureText(label).width;
    if (tw > W * 0.9) fs *= (W * 0.9) / tw;
    x.font = font(fs);
    x.textAlign = "center";
    x.fillText(label, W / 2, H / 2);
  } else if (ratio >= 1) {
    // Zone horizontale : emblème à gauche, texte à droite, l'ensemble centré
    let r = H * 0.28;
    let fs = H * 0.2;
    x.font = font(fs);
    let tw = x.measureText(label).width;
    const gap = r * 0.5;
    const total = 2 * r + gap + tw;
    const k = Math.min(1, (W * 0.88) / total);
    r *= k;
    fs *= k;
    x.font = font(fs);
    tw = x.measureText(label).width;
    const start = (W - (2 * r + gap * k + tw)) / 2;
    emblem(start + r, H / 2, r);
    x.textAlign = "left";
    x.fillStyle = ink;
    x.fillText(label, start + 2 * r + gap * k, H / 2);
  } else {
    // Zone verticale : emblème au-dessus, texte sur deux lignes
    const r = Math.min(W * 0.3, H * 0.2);
    emblem(W / 2, H / 2 - r * 0.9, r);
    const fs = Math.min(W * 0.16, H * 0.09);
    x.font = font(fs);
    x.textAlign = "center";
    x.fillStyle = ink;
    label.split(" ").forEach((word, i) => x.fillText(word, W / 2, H / 2 + r * 0.7 + i * fs * 1.15, W * 0.92));
  }
  return c;
}
