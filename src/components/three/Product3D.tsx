"use client";

// Visionneuse 3D (Three.js via React Three Fiber).
// Les produits sont modélisés directement en code (aucun fichier 3D à télécharger) :
// le marquage est une texture appliquée sur la vraie surface (enroulée autour d'un
// mug, posée sur le devant d'un t-shirt…). Dimensions en unités de 100 mm.

import { Suspense, useEffect, useRef } from "react";
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
        </Suspense>
        <ContactShadows position={[0, -1.3, 0]} opacity={0.3} scale={10} blur={2.4} far={3} frames={studio ? 1 : Infinity} />
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

function Model({ kind, color, zones, arts }: { kind: VisualKind; color: string; zones: MarkingZone[]; arts: Arts }) {
  const zone = zones[0];
  const tex = useArtTexture(arts[zone.id], kind === "stylo" ? -Math.PI / 2 : 0);
  if (GARMENTS.includes(kind)) return <Garment kind={kind} color={color} zones={zones} arts={arts} />;
  const w = zone.widthMm / 100;
  const h = zone.heightMm / 100;
  const body = <meshStandardMaterial color={color} roughness={0.38} metalness={0.05} />;
  const metal = <meshStandardMaterial color={color} roughness={0.28} metalness={0.65} />;

  switch (kind) {
    case "mug": {
      const R = 0.41;
      const H = 0.95;
      return (
        <group position={[0, -0.1, 0]} scale={1.6}>
          <mesh>
            <cylinderGeometry args={[R, R, H, 96, 1, true]} />
            <meshStandardMaterial color={color} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -H / 2, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[R, 64]} />
            {body}
          </mesh>
          <mesh position={[0, -H / 2 + 0.06, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[R * 0.94, 64]} />
            <meshStandardMaterial color="#e9ecef" roughness={0.4} />
          </mesh>
          <mesh position={[0, H / 2, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[R - 0.012, 0.014, 12, 96]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
          <mesh position={[R + 0.02, 0, 0]} rotation-z={-Math.PI / 2}>
            <torusGeometry args={[0.22, 0.045, 20, 48, Math.PI]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
          <Print texture={tex}>
            <cylinderGeometry args={[R + 0.003, R + 0.003, h, 96, 1, true, -w / R / 2, w / R]} />
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
          <mesh>
            <cylinderGeometry args={[Rt, Rb, H, 96]} />
            {metal}
          </mesh>
          <mesh position={[0, H / 2 + 0.09, 0]}>
            <cylinderGeometry args={[Rt + 0.02, Rt + 0.02, 0.2, 96]} />
            <meshStandardMaterial color="#26272b" roughness={0.5} />
          </mesh>
          <Print texture={tex}>
            <cylinderGeometry args={[r(h / 2), r(-h / 2), h, 96, 1, true, -w / ((Rt + Rb) / 2) / 2, w / ((Rt + Rb) / 2)]} />
          </Print>
        </group>
      );
    }
    case "gourde": {
      const R = 0.36;
      const H = 1.9;
      return (
        <group position={[0, -0.2, 0]}>
          <mesh>
            <cylinderGeometry args={[R, R, H, 96]} />
            {metal}
          </mesh>
          <mesh position={[0, H / 2 + 0.08, 0]}>
            <cylinderGeometry args={[0.2, R, 0.16, 64]} />
            {metal}
          </mesh>
          <mesh position={[0, H / 2 + 0.32, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.32, 64]} />
            <meshStandardMaterial color="#26272b" roughness={0.6} />
          </mesh>
          <Print texture={tex}>
            <cylinderGeometry args={[R + 0.003, R + 0.003, h, 96, 1, true, -w / R / 2, w / R]} />
          </Print>
        </group>
      );
    }
    case "stylo": {
      const R = 0.05;
      const L = 1.4;
      return (
        <group rotation={[0, 0, Math.PI / 2 - 0.12]} scale={2.2}>
          <mesh>
            <cylinderGeometry args={[R, R, L, 48]} />
            {metal}
          </mesh>
          <mesh position={[0, -L / 2 - 0.12, 0]}>
            <cylinderGeometry args={[R, 0.008, 0.24, 48]} />
            <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
          </mesh>
          <mesh position={[0, L / 2 - 0.2, R + 0.02]}>
            <boxGeometry args={[0.03, 0.4, 0.015]} />
            <meshStandardMaterial color="#c9cdd2" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Le marquage suit l'axe du stylo */}
          <Print texture={tex}>
            <cylinderGeometry args={[R + 0.002, R + 0.002, w, 48, 1, true, -h / R / 2, h / R]} />
          </Print>
        </group>
      );
    }
    case "carnet":
      return (
        <group rotation={[0.05, -0.35, 0]}>
          <RoundedBox args={[1.48, 2.1, 0.16]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.7} />
          </RoundedBox>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.04, 2.12, 0.18]} />
            <meshStandardMaterial color="#1b1c1f" roughness={0.6} />
          </mesh>
          <group position={[0, 0.05, 0.0815]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "tapis":
      return (
        <group rotation={[-1.05, 0, 0]}>
          <RoundedBox args={[2.4, 2.0, 0.04]} radius={0.015} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.85} />
          </RoundedBox>
          <group position={[0, 0, 0.0215]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "usb":
      return (
        <group rotation={[0.1, -0.5, 0]} scale={3}>
          <RoundedBox args={[0.2, 0.55, 0.08]} radius={0.02} smoothness={4}>
            {metal}
          </RoundedBox>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.12, 0.14, 0.045]} />
            <meshStandardMaterial color="#cfd3d8" roughness={0.4} metalness={0.55} />
          </mesh>
          <group position={[0, -0.03, 0.0405]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "powerbank":
      return (
        <group rotation={[0.05, -0.45, 0]} scale={1.4}>
          <RoundedBox args={[0.7, 1.4, 0.15]} radius={0.06} smoothness={6}>
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
          </RoundedBox>
          <group position={[0, -0.05, 0.0755]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "tote":
      return (
        <group rotation={[0, -0.35, 0]}>
          <RoundedBox args={[3.8, 4.2, 0.06]} radius={0.02} smoothness={3}>
            <meshStandardMaterial color={color} roughness={0.95} />
          </RoundedBox>
          {[-0.75, 0.75].map((x) => (
            <mesh key={x} position={[x, 2.1, 0]} rotation-z={0}>
              <torusGeometry args={[0.55, 0.05, 12, 48, Math.PI]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          ))}
          <group position={[0, -0.3, 0.032]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "sac":
      return (
        <group rotation={[0, -0.4, 0]}>
          <RoundedBox args={[3, 4.2, 1.3]} radius={0.35} smoothness={6}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[2.2, 1.6, 0.4]} radius={0.15} smoothness={6} position={[0, -1.05, 0.7]}>
            <meshStandardMaterial color={color} roughness={0.85} />
          </RoundedBox>
          <mesh position={[0, 2.15, 0]}>
            <torusGeometry args={[0.35, 0.06, 12, 48, Math.PI]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <group position={[0, 0.75, 0.652]}>
            <Print texture={tex}>
              <planeGeometry args={[w, h]} />
            </Print>
          </group>
        </group>
      );
    case "pack":
      return (
        <group rotation={[0.25, -0.5, 0]}>
          <RoundedBox args={[3, 1.6, 2]} radius={0.04} smoothness={3} position={[0, -0.2, 0]}>
            <meshStandardMaterial color={color} roughness={0.85} />
          </RoundedBox>
          <RoundedBox args={[3.1, 0.45, 2.1]} radius={0.04} smoothness={3} position={[0, 0.72, 0]}>
            <meshStandardMaterial color={color} roughness={0.8} />
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
