// « Gonflage » d'un contour 2D en surface 3D lisse, comme un vêtement rempli.
// On maille l'intérieur du contour (triangulation de Delaunay), puis chaque point
// est soulevé selon sa distance au bord : bords arrondis, centre presque plat,
// avec de légers plis. Le devant et le dos se rejoignent sur le contour (couture).

import Delaunator from "delaunator";
import * as THREE from "three";

export type Inflated = {
  front: THREE.BufferGeometry;
  back: THREE.BufferGeometry;
  /** Hauteur de la surface avant au point (x, y) */
  heightAt: (x: number, y: number) => number;
  /** Teste si un point est à l'intérieur du contour */
  inside: (x: number, y: number) => boolean;
};

type Opts = {
  /** Écart entre les points du maillage (unités de 100 mm) */
  spacing?: number;
  /** Épaisseur maximale d'un côté */
  height: number;
  /** Distance au bord sur laquelle la surface s'arrondit */
  radius: number;
  /** Amplitude des plis (0 = aucun) */
  wrinkle?: number;
  seed?: number;
};

function resample(poly: THREE.Vector2[], step: number) {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const len = a.distanceTo(b);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k < n; k++) out.push(new THREE.Vector2().lerpVectors(a, b, k / n));
  }
  return out;
}

function pointInPoly(x: number, y: number, poly: THREE.Vector2[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function distToPoly(x: number, y: number, poly: THREE.Vector2[]) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    const px = a.x + t * dx - x;
    const py = a.y + t * dy - y;
    best = Math.min(best, px * px + py * py);
  }
  return Math.sqrt(best);
}

export function inflate(polygon: THREE.Vector2[], { spacing = 0.035, height, radius, wrinkle = 0, seed = 1 }: Opts): Inflated {
  const boundary = resample(polygon, spacing * 0.8);
  const xs = boundary.map((p) => p.x);
  const ys = boundary.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];

  const pts: number[] = [];
  boundary.forEach((p) => pts.push(p.x, p.y));
  const nb = boundary.length;
  // Grille intérieure légèrement décalée une ligne sur deux (triangles plus réguliers)
  for (let y = minY + spacing / 2, row = 0; y < maxY; y += spacing * 0.866, row++) {
    for (let x = minX + (row % 2 ? spacing / 2 : 0); x < maxX; x += spacing) {
      if (pointInPoly(x, y, polygon) && distToPoly(x, y, polygon) > spacing * 0.45) pts.push(x, y);
    }
  }

  const tri = new Delaunator(pts).triangles;
  const keep: number[] = [];
  for (let i = 0; i < tri.length; i += 3) {
    const [a, b, c] = [tri[i], tri[i + 1], tri[i + 2]];
    const cx = (pts[2 * a] + pts[2 * b] + pts[2 * c]) / 3;
    const cy = (pts[2 * a + 1] + pts[2 * b + 1] + pts[2 * c + 1]) / 3;
    if (pointInPoly(cx, cy, polygon)) keep.push(a, b, c);
  }

  // Plis doux : somme de sinus orientés, atténués près des bords
  const s = seed * 1.7;
  const folds = (x: number, y: number) =>
    Math.sin(x * 2.1 + y * 0.7 + s) * 0.5 + Math.sin(-x * 1.3 + y * 2.6 + s * 2.3) * 0.35 + Math.sin(x * 4.2 - y * 3.1 + s * 0.6) * 0.15;

  const heightAt = (x: number, y: number) => {
    const d = pointInPoly(x, y, polygon) ? distToPoly(x, y, polygon) : 0;
    const t = Math.min(d / radius, 1);
    const profile = Math.sqrt(1 - (1 - t) * (1 - t));
    return height * profile + wrinkle * folds(x, y) * t;
  };

  const n = pts.length / 2;
  const front = new Float32Array(n * 3);
  const back = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = pts[2 * i];
    const y = pts[2 * i + 1];
    const z = i < nb ? 0 : heightAt(x, y);
    front.set([x, y, z], 3 * i);
    back.set([x, y, -z], 3 * i);
  }
  const make = (pos: Float32Array, flip: boolean) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const idx = flip ? keep.map((_, i) => keep[i - (i % 3) + (2 - (i % 3))]) : keep;
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  // Delaunator produit des triangles dans le sens horaire (repère y vers le haut) :
  // on les retourne pour que la face avant regarde vers +z
  return { front: make(front, true), back: make(back, false), heightAt, inside: (x, y) => pointInPoly(x, y, polygon) };
}

/**
 * Extrait la partie d'une surface comprise dans un rectangle et lui donne des
 * coordonnées de texture : le marquage épouse ainsi les courbes du tissu.
 * `mirror` : pour le dos, vu de derrière (gauche et droite inversées).
 */
export function decalPatch(surface: THREE.BufferGeometry, x0: number, y0: number, w: number, h: number, mirror = false, lift = 0.004) {
  const pos = surface.getAttribute("position") as THREE.BufferAttribute;
  const nor = surface.getAttribute("normal") as THREE.BufferAttribute;
  const index = surface.getIndex()!.array;
  const m = 0.04;
  const inRect = (i: number) => {
    const x = mirror ? -pos.getX(i) : pos.getX(i);
    const y = pos.getY(i);
    return x >= x0 - m && x <= x0 + w + m && y >= y0 - m && y <= y0 + h + m;
  };
  const out: number[] = [];
  const uv: number[] = [];
  const nrm: number[] = [];
  for (let i = 0; i < index.length; i += 3) {
    const tri = [index[i], index[i + 1], index[i + 2]];
    if (!tri.every(inRect)) continue;
    for (const v of tri) {
      const nx = nor.getX(v);
      const ny = nor.getY(v);
      const nz = nor.getZ(v);
      out.push(pos.getX(v) + nx * lift, pos.getY(v) + ny * lift, pos.getZ(v) + nz * lift);
      nrm.push(nx, ny, nz);
      const x = mirror ? -pos.getX(v) : pos.getX(v);
      uv.push((x - x0) / w, (pos.getY(v) - y0) / h);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

/** Même principe, avec un contour quelconque (poche, ouverture de capuche…) */
export function polygonPatch(surface: THREE.BufferGeometry, poly: THREE.Vector2[], lift = 0.003) {
  const pos = surface.getAttribute("position") as THREE.BufferAttribute;
  const nor = surface.getAttribute("normal") as THREE.BufferAttribute;
  const index = surface.getIndex()!.array;
  const out: number[] = [];
  const nrm: number[] = [];
  for (let i = 0; i < index.length; i += 3) {
    const tri = [index[i], index[i + 1], index[i + 2]];
    const cx = tri.reduce((s, v) => s + pos.getX(v), 0) / 3;
    const cy = tri.reduce((s, v) => s + pos.getY(v), 0) / 3;
    if (!pointInPoly(cx, cy, poly)) continue;
    for (const v of tri) {
      out.push(pos.getX(v) + nor.getX(v) * lift, pos.getY(v) + nor.getY(v) * lift, pos.getZ(v) + nor.getZ(v) * lift);
      nrm.push(nor.getX(v), nor.getY(v), nor.getZ(v));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

/** Texture de maille (relief fin du tissu), générée une seule fois */
let knit: THREE.Texture | null = null;
export function knitNormalMap() {
  if (knit || typeof document === "undefined") return knit;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // Petites mailles en V + grain aléatoire
      const v = Math.sin((x / S) * Math.PI * 32 + Math.abs(((y % 8) - 4) / 4) * 2) * 0.5;
      const n = (Math.random() - 0.5) * 0.6;
      const nx = Math.round(128 + (v + n) * 22);
      const ny = Math.round(128 + (Math.random() - 0.5) * 18);
      const i = (y * S + x) * 4;
      img.data.set([nx, ny, 255, 255], i);
    }
  }
  ctx.putImageData(img, 0, 0);
  knit = new THREE.CanvasTexture(c);
  knit.wrapS = knit.wrapT = THREE.RepeatWrapping;
  knit.repeat.set(10, 10);
  return knit;
}
