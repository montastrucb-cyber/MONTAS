"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getProduct } from "@/data/catalog";
import { isDark } from "@/lib/color";
import { makeSampleArt } from "@/components/three/sampleArt";

const Product3D = dynamic(() => import("@/components/three/Product3D"), { ssr: false });

export function StudioClient() {
  const q = useSearchParams();
  const product = getProduct(q.get("slug") ?? "");
  const colorIndex = Number(q.get("color") ?? 0);
  const withLogo = q.get("logo") === "1";
  const yaw = Number(q.get("yaw") ?? -0.4);
  const color = product?.colors[colorIndex] ?? product?.colors[0];
  const arts = useMemo(() => {
    if (!product || !withLogo || typeof document === "undefined") return {};
    const z = product.zones[0];
    return { [z.id]: makeSampleArt(z, isDark(color!.hex) ? "#FFFFFF" : "#0B1220") };
  }, [product, withLogo, color]);
  if (!product || !color) return <p>Produit inconnu</p>;
  return (
    <div id="studio" style={{ position: "fixed", inset: 0, zIndex: 100, background: "transparent" }}>
      {/* Page technique : on masque tout le reste du site */}
      <style>{`header, footer, [role="dialog"], a[href="#contenu"] { display: none !important; } html, body { background: transparent !important; }`}</style>
      <Product3D kind={product.kind} color={color.hex} zones={product.zones} arts={arts} yaw={yaw} studio interactive={false} autoRotate={false} className="h-full w-full" />
    </div>
  );
}
