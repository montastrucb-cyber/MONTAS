"use client";

// Textile et accessoires en 3D, construits à partir des mêmes contours que les
// gabarits de marquage (repère 400 × 400) : une zone de marquage dessinée sur le
// gabarit tombe donc exactement au même endroit sur le modèle 3D.

import { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { MarkingZone, VisualKind } from "@/data/catalog";
import { Print, useArtTexture, type Arts } from "./print";

export const GARMENTS: VisualKind[] = ["tshirt", "sweat", "casquette", "lanyard"];

const OUTLINES = {
  tshirt:
    "M140 60 L98 74 L40 122 L74 176 L110 156 L110 346 Q200 356 290 346 L290 156 L326 176 L360 122 L302 74 L260 60 Q230 96 200 96 Q170 96 140 60 Z",
  sweat:
    "M142 72 L96 88 L54 160 L38 300 L78 308 L108 196 L108 350 Q200 360 292 350 L292 196 L322 308 L362 300 L346 160 L304 88 L258 72 Q230 100 200 100 Q170 100 142 72 Z",
  hoodFront: "M142 72 Q150 30 200 28 Q250 30 258 72 Q230 112 200 112 Q170 112 142 72 Z",
  hoodBack: "M142 72 Q150 40 200 36 Q250 40 258 72 Q250 120 200 128 Q150 120 142 72 Z",
  pocket: "M140 262 L260 262 L276 330 L124 330 Z",
};

/** Convertit un contour SVG (repère 400, y vers le bas) en forme 3D (unités de 100, y vers le haut). */
function shapeFrom(d: string) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const src = SVGLoader.createShapes(data.paths[0])[0];
  const pts = src.getPoints(32).map((p) => new THREE.Vector2((p.x - 200) / 100, (200 - p.y) / 100));
  return new THREE.Shape(pts);
}

function useExtruded(d: string, depth: number, bevel: number) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shapeFrom(d), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel * 0.6,
      bevelSegments: 8,
      curveSegments: 32,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  }, [d, depth, bevel]);
}

function useCurveTube(d: string, z: number, radius: number) {
  return useMemo(() => {
    const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
    const pts = data.paths[0].subPaths[0].getPoints(40).map((p) => new THREE.Vector3((p.x - 200) / 100, (200 - p.y) / 100, z));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, radius, 10, false);
  }, [d, z, radius]);
}

function Fabric({ color, shade = 1 }: { color: string; shade?: number }) {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(shade), [color, shade]);
  const sheenColor = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.35), [color]);
  return <meshPhysicalMaterial color={c} roughness={0.95} sheen={0.25} sheenRoughness={0.9} sheenColor={sheenColor} />;
}

/** Zone de marquage posée à plat sur la face avant ou arrière du vêtement */
function FlatPrint({ zone, art, surfaceZ }: { zone: MarkingZone; art: HTMLCanvasElement | null | undefined; surfaceZ: number }) {
  const tex = useArtTexture(art);
  const b = zone.box;
  const cx = (b.x + b.w / 2 - 200) / 100;
  const cy = (200 - (b.y + b.h / 2)) / 100;
  const back = zone.view === "back";
  return (
    <group position={[back ? -cx : cx, cy, back ? -surfaceZ - 0.003 : surfaceZ + 0.003]} rotation-y={back ? Math.PI : 0}>
      <Print texture={tex}>
        <planeGeometry args={[b.w / 100, b.h / 100]} />
      </Print>
    </group>
  );
}

export function Garment({ kind, color, zones, arts }: { kind: VisualKind; color: string; zones: MarkingZone[]; arts: Arts }) {
  switch (kind) {
    case "tshirt":
      return <TShirt color={color} zones={zones} arts={arts} />;
    case "sweat":
      return <Hoodie color={color} zones={zones} arts={arts} />;
    case "casquette":
      return <Cap color={color} zone={zones[0]} art={arts[zones[0].id]} />;
    case "lanyard":
      return <Lanyard color={color} zone={zones[0]} art={arts[zones[0].id]} />;
    default:
      return null;
  }
}

function TShirt({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const DEPTH = 0.24;
  const BEVEL = 0.09;
  const body = useExtruded(OUTLINES.tshirt, DEPTH, BEVEL);
  const front = DEPTH / 2 + BEVEL;
  const collarFront = useCurveTube("M144 62 Q200 106 256 62", front + 0.005, 0.03);
  const collarBack = useCurveTube("M144 61 Q200 82 256 61", -front - 0.005, 0.03);
  return (
    <group>
      <mesh geometry={body}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={collarFront}>
        <Fabric color={color} shade={0.88} />
      </mesh>
      <mesh geometry={collarBack}>
        <Fabric color={color} shade={0.88} />
      </mesh>
      {zones.map((z) => (
        <FlatPrint key={z.id} zone={z} art={arts[z.id]} surfaceZ={front} />
      ))}
    </group>
  );
}

function Hoodie({ color, zones, arts }: { color: string; zones: MarkingZone[]; arts: Arts }) {
  const DEPTH = 0.3;
  const BEVEL = 0.1;
  const body = useExtruded(OUTLINES.sweat, DEPTH, BEVEL);
  const hoodFront = useExtruded(OUTLINES.hoodFront, 0.06, 0.05);
  const hoodBack = useExtruded(OUTLINES.hoodBack, 0.2, 0.08);
  const pocket = useExtruded(OUTLINES.pocket, 0.02, 0.025);
  const front = DEPTH / 2 + BEVEL;
  const cuffs = useCurveTube("M112 340 L288 340", front + 0.01, 0.035);
  return (
    <group>
      <mesh geometry={body}>
        <Fabric color={color} />
      </mesh>
      <mesh geometry={hoodFront} position={[0, 0, front - 0.02]}>
        <Fabric color={color} shade={0.82} />
      </mesh>
      <mesh geometry={hoodBack} position={[0, 0.05, -front + 0.02]}>
        <Fabric color={color} shade={0.95} />
      </mesh>
      <mesh geometry={pocket} position={[0, 0, front + 0.01]}>
        <Fabric color={color} shade={0.93} />
      </mesh>
      <mesh geometry={cuffs}>
        <Fabric color={color} shade={0.85} />
      </mesh>
      {zones.map((z) => (
        <FlatPrint key={z.id} zone={z} art={arts[z.id]} surfaceZ={front} />
      ))}
    </group>
  );
}

function Cap({ color, zone, art }: { color: string; zone: MarkingZone; art: HTMLCanvasElement | null | undefined }) {
  const tex = useArtTexture(art);
  const R = 1; // 1 unité ≈ 95 mm (rayon de la calotte)
  const phiLen = zone.widthMm / 95;
  const thetaLen = zone.heightMm / 95;
  const thetaStart = Math.PI / 2 - 0.12 - thetaLen;
  const visor = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 0.95, 0.75, 0, Math.PI, false, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 4, curveSegments: 48 });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  return (
    <group rotation={[0.18, 0, 0]} position={[0, -0.3, 0]}>
      <mesh scale={[1, 0.82, 1]}>
        <sphereGeometry args={[R, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Fabric color={color} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} scale={[1, 0.82, 1]} rotation-y={(i * Math.PI) / 3}>
          <torusGeometry args={[R + 0.002, 0.006, 6, 64, Math.PI]} />
          <Fabric color={color} shade={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.07, 24, 16]} />
        <Fabric color={color} shade={0.9} />
      </mesh>
      <mesh geometry={visor} position={[0, 0.03, 0.6]} rotation-x={0.12}>
        <Fabric color={color} shade={0.92} />
      </mesh>
      {tex && (
        <mesh scale={[1, 0.82, 1]} renderOrder={2}>
          <sphereGeometry args={[R + 0.004, 64, 32, Math.PI / 2 - phiLen / 2, phiLen, thetaStart, thetaLen]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
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
    shape.moveTo(-W / 2, -0.012);
    shape.lineTo(W / 2, -0.012);
    shape.lineTo(W / 2, 0.012);
    shape.lineTo(-W / 2, 0.012);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { steps: 160, bevelEnabled: false, extrudePath: path });
  }, []);
  const printH = (zone.heightMm / 100) * 1.0;
  return (
    <group position={[0, -0.2, 0]}>
      <mesh geometry={strap}>
        <meshStandardMaterial color={color} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {tex && (
        <group position={[-0.55, 0.85, 0.016]}>
          <Print texture={tex}>
            <planeGeometry args={[W * 0.96, printH]} />
          </Print>
        </group>
      )}
      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[0.16, 0.14, 0.05]} />
        <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[0, -1.12, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.07, 0.016, 12, 32]} />
        <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <boxGeometry args={[0.86, 0.56, 0.02]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.1} transmission={0.6} thickness={0.02} />
      </mesh>
    </group>
  );
}
