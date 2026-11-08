"use client";

// Textile et bagagerie en 3D lisse : chaque pièce est « gonflée » à partir des
// mêmes contours que les gabarits de marquage (repère 400 × 400), donc une zone
// dessinée sur le gabarit tombe exactement au même endroit sur le modèle 3D.
// Le marquage épouse les courbes du tissu (voir decalPatch).

import { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { MarkingZone, VisualKind } from "@/data/catalog";
import { useArtTexture, type Arts } from "./print";
import { decalPatch, inflate, knitNormalMap, polygonPatch, type Inflated } from "./inflate";

export const GARMENTS: VisualKind[] = ["tshirt", "sweat", "casquette", "lanyard", "tote", "sac"];

const PATHS = {
  tshirt:
    "M140 60 L98 74 L40 122 L74 176 L110 156 L110 346 Q200 356 290 346 L290 156 L326 176 L360 122 L302 74 L260 60 Q230 96 200 96 Q170 96 140 60 Z",
  hoodie:
    "M142 72 Q146 34 200 28 Q254 34 258 72 L304 88 L346 160 L362 300 L322 308 L292 196 L292 350 Q200 360 108 350 L108 196 L78 308 L38 300 L54 160 L96 88 Z",
  hoodOpening: "M164 82 Q168 46 200 42 Q232 46 236 82 Q224 108 200 110 Q176 108 164 82 Z",
  hoodiePocket: "M142 262 L258 262 L272 330 L128 330 Z",
  tote: "M110 150 L290 150 Q296 150 296 156 L296 344 Q296 350 290 350 L110 350 Q104 350 104 344 L104 156 Q104 150 110 150 Z",
  bag: "M120 120 Q120 90 150 90 L250 90 Q280 90 280 120 L284 330 Q284 348 266 348 L134 348 Q116 348 116 330 Z",
  bagPocket: "M150 226 L250 226 Q262 226 262 238 L262 312 Q262 326 248 326 L152 326 Q138 326 138 312 L138 238 Q138 226 150 226 Z",
};

/** Contour SVG (repère 400, y vers le bas) → polygone en unités de 100 mm (y vers le haut) */
function polygon(d: string, divisions = 24) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const pts = data.paths[0].subPaths[0].getPoints(divisions).map((p) => new THREE.Vector2((p.x - 200) / 100, (200 - p.y) / 100));
  if (pts.length > 1 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
  return pts;
}

/** Ligne (couture, cordon…) posée sur la surface */
function surfaceTube(d: string, surf: Inflated, side: 1 | -1, offset: number, radius: number) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const pts = data.paths[0].subPaths[0].getPoints(48).map((p) => {
    const x = (p.x - 200) / 100;
    const y = (200 - p.y) / 100;
    return new THREE.Vector3(x, y, side * (surf.heightAt(x, y) + offset));
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, radius, 8, false);
}

/** Pose une pièce gonflée (poche…) sur une autre */
function layerOn(piece: Inflated, base: Inflated, sink = 0.01) {
  const pos = piece.front.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + base.heightAt(pos.getX(i), pos.getY(i)) - sink);
  pos.needsUpdate = true;
  piece.front.computeVertexNormals();
  return piece.front;
}

function Fabric({ color, shade = 1, roughness = 0.9, side }: { color: string; shade?: number; roughness?: number; side?: THREE.Side }) {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(shade), [color, shade]);
  const sheen = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.4), [color]);
  const normalMap = knitNormalMap();
  return (
    <meshPhysicalMaterial
      color={c}
      roughness={roughness}
      sheen={0.35}
      sheenRoughness={0.85}
      sheenColor={sheen}
      normalMap={normalMap ?? undefined}
      normalScale={new THREE.Vector2(0.25, 0.25)}
      side={side}
    />
  );
}

/** Marquage d'une zone, épousant la surface (devant ou dos) */
function ZonePrint({ zone, art, inf }: { zone: MarkingZone; art: HTMLCanvasElement | null | undefined; inf: Inflated }) {
  const tex = useArtTexture(art);
  const geo = useMemo(() => {
    const b = zone.box;
    const back = zone.view === "back";
    // Au dos, le gabarit est vu de derrière : gauche et droite inversées (mirror)
    return decalPatch(back ? inf.back : inf.front, (b.x - 200) / 100, (200 - (b.y + b.h)) / 100, b.w / 100, b.h / 100, back);
  }, [zone, inf]);
  if (!tex) return null;
  return (
    <mesh geometry={geo} renderOrder={2}>
      <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.75} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  );
}

function Prints({ zones, arts, inf }: { zones: MarkingZone[]; arts: Arts; inf: Inflated }) {
  return (
    <>
      {zones.map((z) => (
        <ZonePrint key={z.id} zone={z} art={arts[z.id]} inf={inf} />
      ))}
    </>
  );
}

export function Garment({ kind, color, zones, arts }: { kind: VisualKind; color: string; zones: MarkingZone[]; arts: Arts }) {
  switch (kind) {
    case "tshirt":
      return <TShirt color={color} zones={zones} arts={arts} />;
    case "sweat":
      return <Hoodie color={color} zones={zones} arts={arts} />;
    case "tote":
      return <Tote color={color} zones={zones} arts={arts} />;
    case "sac":
      return <Backpack color={color} zones={zones} arts={arts} />;
    case "casquette":
      return <Cap color={color} zone={zones[0]} art={arts[zones[0].id]} />;
    case "lanyard":
      return <Lanyard color={color} zone={zones[0]} art={arts[zones[0].id]} />;
    default:
      return null;
  }
}

function TShirt({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const parts = useMemo(() => {
    const inf = inflate(polygon(PATHS.tshirt), { height: 0.17, radius: 0.34, wrinkle: 0.012, spacing: 0.03, seed: 2 });
    return {
      inf,
      collarF: surfaceTube("M142 61 Q172 98 200 98 Q228 98 258 61", inf, 1, 0.012, 0.026),
      collarB: surfaceTube("M142 61 Q172 76 200 76 Q228 76 258 61", inf, -1, 0.012, 0.026),
      stitches: [
        "M114 336 Q200 345 286 336",
        "M50 128 L82 170",
        "M350 128 L318 170",
      ].flatMap((d) => [surfaceTube(d, inf, 1, 0.003, 0.0045), surfaceTube(d, inf, -1, 0.003, 0.0045)]),
    };
  }, []);
  return (
    <group>
      <mesh geometry={parts.inf.front}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={parts.inf.back}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={parts.collarF}>
        <Fabric color={color} shade={0.9} />
      </mesh>
      <mesh geometry={parts.collarB}>
        <Fabric color={color} shade={0.9} />
      </mesh>
      {parts.stitches.map((g, i) => (
        <mesh key={i} geometry={g}>
          <Fabric color={color} shade={0.78} />
        </mesh>
      ))}
      <Prints zones={zones} arts={arts} inf={parts.inf} />
    </group>
  );
}

function Hoodie({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const parts = useMemo(() => {
    const inf = inflate(polygon(PATHS.hoodie), { height: 0.22, radius: 0.42, wrinkle: 0.015, spacing: 0.03, seed: 5 });
    const pocketInf = inflate(polygon(PATHS.hoodiePocket), { height: 0.035, radius: 0.12, spacing: 0.03 });
    return {
      inf,
      opening: polygonPatch(inf.front, polygon(PATHS.hoodOpening), 0.004),
      rim: surfaceTube("M164 82 Q168 46 200 42 Q232 46 236 82 Q224 108 200 110 Q176 108 164 82", inf, 1, 0.012, 0.022),
      pocket: layerOn(pocketInf, inf, 0.012),
      cords: ["M190 108 Q188 130 189 152", "M210 108 Q212 130 211 152"].map((d) => surfaceTube(d, inf, 1, 0.022, 0.011)),
      stitches: ["M112 336 Q200 346 288 336", "M44 286 L80 293", "M356 286 L320 293", "M144 268 L256 268"].flatMap((d) => [
        surfaceTube(d, inf, 1, 0.003, 0.0045),
        surfaceTube(d, inf, -1, 0.003, 0.0045),
      ]),
    };
  }, []);
  return (
    <group>
      <mesh geometry={parts.inf.front}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={parts.inf.back}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={parts.opening} renderOrder={1}>
        <Fabric color={color} shade={0.42} />
      </mesh>
      <mesh geometry={parts.rim}>
        <Fabric color={color} shade={0.9} />
      </mesh>
      <mesh geometry={parts.pocket}>
        <Fabric color={color} shade={0.95} />
      </mesh>
      {parts.cords.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#f3f4f6" roughness={0.8} />
        </mesh>
      ))}
      {parts.stitches.map((g, i) => (
        <mesh key={i} geometry={g}>
          <Fabric color={color} shade={0.78} />
        </mesh>
      ))}
      <Prints zones={zones} arts={arts} inf={parts.inf} />
    </group>
  );
}

function Tote({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const parts = useMemo(() => {
    const inf = inflate(polygon(PATHS.tote), { height: 0.07, radius: 0.28, wrinkle: 0.02, spacing: 0.03, seed: 3 });
    const strap = (x: number, z: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(x - 0.32, 0.5, z),
          new THREE.Vector3(x - 0.36, 1.05, z * 0.6),
          new THREE.Vector3(x, 1.38, 0),
          new THREE.Vector3(x + 0.36, 1.05, z * 0.6),
          new THREE.Vector3(x + 0.32, 0.5, z),
        ]),
        64,
        0.035,
        10,
        false,
      );
    return { inf, straps: [strap(0, 0.02), strap(0, -0.02)], hem: [surfaceTube("M106 162 L294 162", inf, 1, 0.003, 0.004), surfaceTube("M106 162 L294 162", inf, -1, 0.003, 0.004)] };
  }, []);
  return (
    <group>
      <mesh geometry={parts.inf.front}>
        <Fabric color={color} roughness={0.95} />
      </mesh>
      <mesh geometry={parts.inf.back}>
        <Fabric color={color} roughness={0.95} />
      </mesh>
      {[...parts.straps, ...parts.hem].map((g, i) => (
        <mesh key={i} geometry={g} scale={[1, 1, i < 2 ? 0.45 : 1]}>
          <Fabric color={color} shade={0.9} roughness={0.95} />
        </mesh>
      ))}
      <Prints zones={zones} arts={arts} inf={parts.inf} />
    </group>
  );
}

function Backpack({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const parts = useMemo(() => {
    const inf = inflate(polygon(PATHS.bag), { height: 0.42, radius: 0.55, wrinkle: 0.008, spacing: 0.03, seed: 7 });
    const pocketInf = inflate(polygon(PATHS.bagPocket), { height: 0.09, radius: 0.18, spacing: 0.025 });
    return {
      inf,
      pocket: layerOn(pocketInf, inf, 0.015),
      zipper: surfaceTube("M146 238 Q200 232 254 238", inf, 1, 0.075, 0.009),
      handle: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(-0.3, 1.09, 0), new THREE.Vector3(-0.22, 1.36, 0), new THREE.Vector3(0.22, 1.36, 0), new THREE.Vector3(0.3, 1.09, 0)]),
        48,
        0.045,
        12,
        false,
      ),
      straps: [-0.42, 0.42].map(
        (x) =>
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(x * 0.7, 1.0, -0.2),
              new THREE.Vector3(x, 0.4, -0.5),
              new THREE.Vector3(x * 1.05, -0.6, -0.48),
              new THREE.Vector3(x * 1.1, -1.3, -0.22),
            ]),
            48,
            0.07,
            12,
            false,
          ),
      ),
    };
  }, []);
  return (
    <group>
      <mesh geometry={parts.inf.front}>
        <Fabric color={color} roughness={0.8} />
      </mesh>
      <mesh geometry={parts.inf.back}>
        <Fabric color={color} roughness={0.8} />
      </mesh>
      <mesh geometry={parts.pocket}>
        <Fabric color={color} shade={0.9} roughness={0.8} />
      </mesh>
      <mesh geometry={parts.zipper}>
        <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh geometry={parts.handle} scale={[1, 1, 0.5]}>
        <Fabric color={color} shade={0.85} roughness={0.8} />
      </mesh>
      {parts.straps.map((g, i) => (
        <mesh key={i} geometry={g} scale={[1, 1, 0.45]}>
          <Fabric color={color} shade={0.8} roughness={0.8} />
        </mesh>
      ))}
      <Prints zones={zones} arts={arts} inf={parts.inf} />
    </group>
  );
}

function Cap({ color, zone, art }: { color: string; zone: MarkingZone; art: HTMLCanvasElement | null | undefined }) {
  const tex = useArtTexture(art);
  const R = 1; // 1 unité ≈ 95 mm (rayon de la calotte)
  const phiLen = zone.widthMm / 95;
  const thetaLen = zone.heightMm / 95;
  const thetaStart = Math.PI / 2 - 0.14 - thetaLen;
  const visor = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 0.95, 0.78, 0, Math.PI, false, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.022, bevelSegments: 6, curveSegments: 64 });
    g.rotateX(Math.PI / 2);
    // Visière cintrée, comme une vraie casquette
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - 0.22 * p.getX(i) * p.getX(i));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group rotation={[0.2, 0, 0]} position={[0, -0.3, 0]}>
      <mesh scale={[1, 0.84, 1.04]}>
        <sphereGeometry args={[R, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Fabric color={color} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} scale={[1, 0.84, 1.04]} rotation-y={(i * Math.PI) / 3}>
          <torusGeometry args={[R + 0.003, 0.006, 8, 96, Math.PI]} />
          <Fabric color={color} shade={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 0.84, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.07, 32, 16]} />
        <Fabric color={color} shade={0.9} />
      </mesh>
      {/* Bandeau intérieur : referme la base de la calotte */}
      <mesh position={[0, 0.03, 0]} rotation-x={Math.PI / 2} scale={[1, 1.04, 1]}>
        <torusGeometry args={[R - 0.01, 0.035, 16, 96]} />
        <Fabric color={color} shade={0.7} />
      </mesh>
      <mesh geometry={visor} position={[0, 0.11, 0.5]} rotation-x={-0.02}>
        <Fabric color={color} shade={0.95} roughness={0.85} />
      </mesh>
      {tex && (
        <mesh scale={[1, 0.84, 1.04]} renderOrder={2}>
          <sphereGeometry args={[R + 0.005, 96, 48, Math.PI / 2 - phiLen / 2, phiLen, thetaStart, thetaLen]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.75} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )}
    </group>
  );
}

function Lanyard({ color, zone, art }: { color: string; zone: MarkingZone; art: HTMLCanvasElement | null | undefined }) {
  const tex = useArtTexture(art);
  const W = 0.2; // sangle de 20 mm
  const strap = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, 1.6, 0),
      new THREE.Vector3(-0.55, 0.2, 0),
      new THREE.Vector3(-0.42, -0.55, 0),
      new THREE.Vector3(0, -0.85, 0),
      new THREE.Vector3(0.42, -0.55, 0),
      new THREE.Vector3(0.55, 0.2, 0),
      new THREE.Vector3(0.55, 1.6, 0),
    ]);
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, -0.01);
    shape.lineTo(W / 2, -0.01);
    shape.lineTo(W / 2, 0.01);
    shape.lineTo(-W / 2, 0.01);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { steps: 200, bevelEnabled: false, extrudePath: path });
  }, []);
  return (
    <group position={[0, -0.2, 0]}>
      <mesh geometry={strap}>
        <meshStandardMaterial color={color} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {tex && (
        <mesh position={[-0.55, 0.85, 0.014]} renderOrder={2}>
          <planeGeometry args={[W * 0.96, zone.heightMm / 100]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )}
      <mesh position={[0, -0.95, 0]}>
        <capsuleGeometry args={[0.06, 0.08, 8, 16]} />
        <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[0, -1.12, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.07, 0.016, 16, 48]} />
        <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <boxGeometry args={[0.86, 0.56, 0.02]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.08} transmission={0.6} thickness={0.02} clearcoat={1} />
      </mesh>
    </group>
  );
}
