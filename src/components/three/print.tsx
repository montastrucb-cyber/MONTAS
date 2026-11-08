"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export type Arts = Record<string, HTMLCanvasElement | null | undefined>;

/** Texture du marquage, mise à jour quand le dessin change. */
export function useArtTexture(art: HTMLCanvasElement | null | undefined, rotate = 0) {
  const texture = useMemo(() => {
    if (!art) return null;
    const t = new THREE.CanvasTexture(art);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (rotate) {
      t.center.set(0.5, 0.5);
      t.rotation = rotate;
    }
    return t;
  }, [art, rotate]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

export function Print({ texture, children }: { texture: THREE.Texture | null; children: React.ReactNode }) {
  if (!texture) return null;
  return (
    <mesh renderOrder={2}>
      {children}
      <meshStandardMaterial map={texture} transparent alphaTest={0.02} roughness={0.6} polygonOffset polygonOffsetFactor={-2} side={THREE.FrontSide} />
    </mesh>
  );
}

