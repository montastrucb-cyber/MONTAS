"use client";

// Visionneuse 3D (Three.js via React Three Fiber).
// Les produits sont modélisés directement en code (aucun fichier 3D à télécharger) :
// le marquage est une texture appliquée sur la vraie surface (enroulée autour d'un
// mug, posée sur le devant d'un t-shirt…). Dimensions en unités de 100 mm.

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bounds, ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { MarkingZone, View, VisualKind } from "@/data/catalog";
import { GARMENTS, Garment } from "./garments";
import { Print, useArtTexture } from "./print";

import type { Arts } from "./print";
export type { Arts };

type Props = {
  kind: VisualKind;
  color: string;
  zones: MarkingZone[];
  /** Image du marquage de chaque zone (fond transparent), aux proportions de la zone */
  arts: Arts;
  /** Face tournée vers l'utilisateur (le modèle pivote en douceur) */
  facing?: View;
  /** Angle de présentation (radians) */
  yaw?: number;
  autoRotate?: boolean;
  interactive?: boolean;
  /** Fond transparent et ombre seule : utilisé pour générer les miniatures */
  studio?: boolean;
  /** Appelé quand la première image 3D est affichée */
  onFirstFrame?: () => void;
  className?: string;
};

export default function Product3D({ kind, color, zones, arts, facing = "front", yaw = 0, autoRotate = true, interactive = true, studio, onFirstFrame, className }: Props) {
  return (
    <div className={className}>
      <Canvas
        dpr={studio ? 1 : [1, 2]}
        camera={{ position: [0, 0.6, 6], fov: 32 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        shadows={false}
        // Rendu à la demande : rien n'est recalculé tant que rien ne bouge (économie de batterie)
        frameloop={autoRotate && interactive && !studio ? "always" : "demand"}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#a5b4fc" />
        {/* Éclairage studio généré localement (aucun téléchargement) */}
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[6, 2, 1]} />
          <Lightformer form="ring" intensity={1.4} position={[0, 2, 6]} scale={3} />
          <Lightformer form="rect" intensity={0.8} position={[0, -3, 2]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#7dd3fc" />
          <Lightformer form="rect" intensity={1.2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} color="#5eead4" />
        </Environment>
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={studio ? 1.38 : 1.2}>
            <Turntable facing={facing} yaw={yaw} instant={!!studio}>
              <Model kind={kind} color={color} zones={zones} arts={arts} />
            </Turntable>
          </Bounds>
          {studio && <ReadySignal />}
          {onFirstFrame && <FirstFrame onFirstFrame={onFirstFrame} />}
          <Settle deps={`${kind}|${facing}|${color}`} />
        </Suspense>
        <ContactShadows position={[0, -1.3, 0]} opacity={0.32} scale={10} blur={2.8} far={3.2} resolution={1024} frames={studio ? 1 : Infinity} />
        {interactive && (
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={1.5}
            maxDistance={14}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
          />
        )}
      </Canvas>
    </div>
  );
}

/** Fait pivoter le modèle vers la face demandée (devant / dos). */
function Turntable({ facing, yaw, instant, children }: { facing: View; yaw: number; instant: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const target = yaw + (facing === "back" ? Math.PI : 0);
  useEffect(() => {
    if (instant && ref.current) ref.current.rotation.y = target;
    invalidate();
  }, [instant, target, invalidate]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g || instant) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 6, Math.min(dt, 0.05));
    // Tant que la rotation n'est pas terminée, on demande l'image suivante
    if (Math.abs(g.rotation.y - target) > 0.001) invalidate();
  });
  return (
    <group ref={ref} rotation-y={instant ? target : undefined}>
      {children}
    </group>
  );
}

/** En rendu « à la demande » : continue d'animer ~1,5 s après un changement (cadrage automatique). */
function Settle({ deps }: { deps: string }) {
  const left = useRef(90);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    left.current = 90;
    invalidate();
  }, [deps, invalidate]);
  useFrame(() => {
    if (left.current-- > 0) invalidate();
  });
  return null;
}

/** Signale la première image affichée (pour retirer l'image d'attente). */
function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const n = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    n.current += 1;
    if (n.current < 4) invalidate();
    if (n.current === 3) onFirstFrame();
  });
  return null;
}

/** Prévient la page (génération des miniatures) quand le rendu est prêt. */
function ReadySignal() {
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (frames.current < 30) invalidate();
    // ~30 images : le cadrage automatique (Bounds) a fini de s'animer
    if (++frames.current === 30) (window as unknown as { __ready3d?: boolean }).__ready3d = true;
  });
  return null;
}

/** Solide de révolution à profil lissé (r, y), comme un objet tourné */
function lathe(profile: [number, number][], segments = 128) {
  const curve = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y)));
  return new THREE.LatheGeometry(curve.getPoints(profile.length * 12), segments);
}

function tube(points: [number, number, number][], radius: number) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 96, radius, 24, false);
}

function Ceramic({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={1} clearcoatRoughness={0.06} side={THREE.DoubleSide} />;
}
function Steel({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.32} metalness={0.75} clearcoat={0.4} clearcoatRoughness={0.2} />;
}
function Plastic({ color, rough = 0.45 }: { color: string; rough?: number }) {
  return <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.3} clearcoatRoughness={0.3} />;
}

function Model({ kind, color, zones, arts }: { kind: VisualKind; color: string; zones: MarkingZone[]; arts: Arts }) {
  const zone = zones[0];
  const tex = useArtTexture(arts[zone.id], kind === "stylo" ? -Math.PI / 2 : 0);
  const geo = useMemo(() => buildRigid(kind), [kind]);
  if (GARMENTS.includes(kind)) return <Garment kind={kind} color={color} zones={zones} arts={arts} />;
  const w = zone.widthMm / 100;
  const h = zone.heightMm / 100;

  switch (kind) {
    case "mug": {
      const R = 0.41;
      return (
        <group position={[0, -0.1, 0]} scale={1.6}>
          <mesh geometry={geo.body}>
            <Ceramic color={color} />
          </mesh>
          <mesh geometry={geo.handle}>
            <Ceramic color={color} />
          </mesh>
          <Print texture={tex}>
            <cylinderGeometry args={[R + 0.003, R + 0.003, h, 128, 1, true, -w / R / 2, w / R]} />
          </Print>
        </group>
      );
    }
    case "tasse-iso": {
      const Rt = 0.43;
      const Rb = 0.37;
      const H = 1.3;
      const r = (y: number) => Rb + ((y + H / 2) / H) * (Rt - Rb) + 0.004;
      return (
        <group position={[0, -0.15, 0]} scale={1.4}>
          <mesh geometry={geo.body}>
            <Steel color={color} />
          </mesh>
          <mesh geometry={geo.lid}>
            <Plastic color="#26272b" rough={0.5} />
          </mesh>
          <Print texture={tex}>
            <cylinderGeometry args={[r(h / 2), r(-h / 2), h, 128, 1, true, -w / ((Rt + Rb) / 2) / 2, w / ((Rt + Rb) / 2)]} />
          </Print>
        </group>
      );
    }
    case "gourde": {
      const R = 0.36;
      return (
        <group position={[0, -0.2, 0]}>
          <mesh geometry={geo.body}>
            <Steel color={color} />
          </mesh>
          <mesh geometry={geo.cap}>
            <Plastic color="#26272b" rough={0.55} />
          </mesh>
          <group position={[0, -0.1, 0]}>
            <Print texture={tex}>
              <cylinderGeometry args={[R + 0.003, R + 0.003, h, 128, 1, true, -w / R / 2, w / R]} />
            </Print>
          </group>
        </group>
      );
    }
    case "stylo": {
      const R = 0.05;
      return (
        <group rotation={[0, 0, Math.PI / 2 - 0.12]} scale={2.2}>
          <mesh geometry={geo.body}>
            <Steel color={color} />
          </mesh>
          <mesh geometry={geo.tip}>
            <meshPhysicalMaterial color="#d7dade" roughness={0.18} metalness={0.95} />
          </mesh>
          <mesh geometry={geo.clip}>
            <meshPhysicalMaterial color="#d7dade" roughness={0.18} metalness={0.95} />
          </mesh>
          <group position={[0, 0.08, 0]}>
            <Print texture={tex}>
              <cylinderGeometry args={[R + 0.002, R + 0.002, w, 64, 1, true, -h / R / 2, h / R]} />
            </Print>
          </group>
        </group>
      );
    }
    case "carnet":
      return (
        <group rotation={[0.05, -0.35, 0]}>
          <RoundedBox args={[1.48, 2.1, 0.03]} radius={0.014} smoothness={6} position={[0, 0, 0.075]}>
            <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.25} />
          </RoundedBox>
          <RoundedBox args={[1.48, 2.1, 0.03]} radius={0.014} smoothness={6} position={[0, 0, -0.075]}>
            <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.25} />
          </RoundedBox>
          <RoundedBox args={[0.06, 2.1, 0.18]} radius={0.028} smoothness={6} position={[-0.73, 0, 0]}>
            <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.25} />
          </RoundedBox>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[1.42, 2.04, 0.12]} />
            <meshStandardMaterial color="#f4f1e8" roughness={0.95} />
          </mesh>
          <RoundedBox args={[0.035, 2.13, 0.2]} radius={0.016} smoothness={4} position={[0.6, 0, 0]}>
            <meshStandardMaterial color="#16171a" roughness={0.7} />
          </RoundedBox>
          <group position={[-0.03, 0.05, 0.0915]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "tapis":
      return (
        <group rotation={[-1.05, 0, 0]}>
          <RoundedBox args={[2.4, 2.0, 0.04]} radius={0.019} smoothness={6}>
            <meshPhysicalMaterial color={color} roughness={0.9} sheen={0.3} sheenColor="#ffffff" />
          </RoundedBox>
          <mesh geometry={geo.stitch}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <group position={[0, 0, 0.0205]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "usb":
      return (
        <group rotation={[0.1, -0.5, 0]} scale={3}>
          <RoundedBox args={[0.2, 0.55, 0.08]} radius={0.035} smoothness={10}>
            <Steel color={color} />
          </RoundedBox>
          <RoundedBox args={[0.125, 0.15, 0.046]} radius={0.012} smoothness={6} position={[0, 0.34, 0]}>
            <meshPhysicalMaterial color="#cfd3d8" roughness={0.3} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, -0.22, 0]}>
            <torusGeometry args={[0.03, 0.009, 16, 48]} />
            <meshPhysicalMaterial color="#cfd3d8" roughness={0.3} metalness={0.8} />
          </mesh>
          <group position={[0, -0.02, 0.0405]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "powerbank":
      return (
        <group rotation={[0.05, -0.45, 0]} scale={1.4}>
          <RoundedBox args={[0.7, 1.4, 0.15]} radius={0.07} smoothness={12}>
            <Plastic color={color} rough={0.35} />
          </RoundedBox>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[-0.09 + i * 0.06, 0.6, 0.076]}>
              <circleGeometry args={[0.012, 24]} />
              <meshBasicMaterial color={i < 3 ? "#5eead4" : "#334155"} />
            </mesh>
          ))}
          <RoundedBox args={[0.14, 0.02, 0.05]} radius={0.009} smoothness={4} position={[0, -0.7, 0]}>
            <meshStandardMaterial color="#0b0c0f" roughness={0.6} />
          </RoundedBox>
          <group position={[0, -0.05, 0.0755]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "pack":
      return (
        <group rotation={[0.25, -0.5, 0]}>
          <RoundedBox args={[3, 1.6, 2]} radius={0.05} smoothness={6} position={[0, -0.2, 0]}>
            <meshPhysicalMaterial color={color} roughness={0.85} sheen={0.2} />
          </RoundedBox>
          <RoundedBox args={[3.1, 0.45, 2.1]} radius={0.05} smoothness={6} position={[0, 0.72, 0]}>
            <meshPhysicalMaterial color={color} roughness={0.8} sheen={0.2} />
          </RoundedBox>
          <group position={[0, 0.951, 0]} rotation-x={-Math.PI / 2}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    default:
      return null;
  }
}

/** Géométries des objets rigides (calculées une fois par type de produit) */
function buildRigid(kind: VisualKind): Record<string, THREE.BufferGeometry> {
  switch (kind) {
    case "mug": {
      const R = 0.41;
      const H = 0.95;
      const t = 0.032;
      return {
        body: lathe([
          [0, -H / 2],
          [R - 0.06, -H / 2],
          [R - 0.012, -H / 2 + 0.014],
          [R, -H / 2 + 0.06],
          [R, 0],
          [R, H / 2 - 0.03],
          [R - 0.004, H / 2 - 0.002],
          [R - t / 2, H / 2 + 0.004],
          [R - t + 0.004, H / 2 - 0.002],
          [R - t, H / 2 - 0.03],
          [R - t, -H / 2 + 0.1],
          [R - t - 0.05, -H / 2 + 0.07],
          [0, -H / 2 + 0.065],
        ]),
        handle: tube(
          [
            [R - 0.03, 0.27, 0],
            [R + 0.16, 0.27, 0],
            [R + 0.27, 0.12, 0],
            [R + 0.27, -0.1, 0],
            [R + 0.16, -0.25, 0],
            [R - 0.03, -0.25, 0],
          ],
          0.046,
        ),
      };
    }
    case "tasse-iso": {
      const H = 1.3;
      return {
        body: lathe([
          [0, -H / 2],
          [0.32, -H / 2],
          [0.365, -H / 2 + 0.04],
          [0.37, -H / 2 + 0.1],
          [0.43, H / 2 - 0.02],
          [0.425, H / 2],
          [0, H / 2],
        ]),
        lid: lathe([
          [0, H / 2 + 0.2],
          [0.36, H / 2 + 0.2],
          [0.43, H / 2 + 0.17],
          [0.448, H / 2 + 0.1],
          [0.445, H / 2 - 0.01],
          [0, H / 2 - 0.01],
        ]),
      };
    }
    case "gourde": {
      const H = 1.9;
      return {
        body: lathe([
          [0, -H / 2],
          [0.3, -H / 2],
          [0.35, -H / 2 + 0.04],
          [0.36, -H / 2 + 0.12],
          [0.36, H / 2 - 0.35],
          [0.34, H / 2 - 0.18],
          [0.26, H / 2 - 0.06],
          [0.2, H / 2 + 0.02],
          [0.2, H / 2 + 0.1],
          [0, H / 2 + 0.1],
        ]),
        cap: lathe([
          [0, H / 2 + 0.42],
          [0.17, H / 2 + 0.42],
          [0.215, H / 2 + 0.38],
          [0.225, H / 2 + 0.3],
          [0.225, H / 2 + 0.1],
          [0, H / 2 + 0.1],
        ]),
      };
    }
    case "stylo": {
      const R = 0.05;
      const L = 1.4;
      const clip = new THREE.CapsuleGeometry(0.016, 0.42, 8, 16);
      clip.scale(1, 1, 0.5);
      clip.translate(0, L / 2 - 0.26, R + 0.022);
      return {
        body: lathe(
          [
            [0, L / 2 + 0.04],
            [R * 0.7, L / 2 + 0.035],
            [R, L / 2],
            [R, -L / 2 + 0.25],
            [R * 0.92, -L / 2 + 0.18],
            [R * 0.92, -L / 2 + 0.02],
            [0, -L / 2],
          ],
          64,
        ),
        tip: lathe(
          [
            [R * 0.9, -L / 2 + 0.01],
            [R * 0.6, -L / 2 - 0.12],
            [0.008, -L / 2 - 0.2],
            [0, -L / 2 - 0.205],
          ],
          64,
        ),
        clip,
      };
    }
    case "tapis": {
      const path = new THREE.Shape();
      const W = 1.16;
      const Hh = 0.96;
      const r = 0.06;
      path.moveTo(-W + r, -Hh);
      path.lineTo(W - r, -Hh);
      path.quadraticCurveTo(W, -Hh, W, -Hh + r);
      path.lineTo(W, Hh - r);
      path.quadraticCurveTo(W, Hh, W - r, Hh);
      path.lineTo(-W + r, Hh);
      path.quadraticCurveTo(-W, Hh, -W, Hh - r);
      path.lineTo(-W, -Hh + r);
      path.quadraticCurveTo(-W, -Hh, -W + r, -Hh);
      const pts = path.getPoints(16).map((p) => new THREE.Vector3(p.x, p.y, 0.021));
      return { stitch: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.006, 6, true) };
    }
    default:
      return {};
  }
}
