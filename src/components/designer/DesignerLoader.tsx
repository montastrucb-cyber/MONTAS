"use client";

import dynamic from "next/dynamic";

// Konva a besoin du navigateur (canvas) : on le charge uniquement côté client.
/** Emplacement réservé de la même taille que le configurateur (évite que la page « saute »). */
export function DesignerSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label="Chargement du configurateur">
      <div>
        <div className="aspect-square animate-pulse rounded-[2rem] bg-muted" />
        <div className="mt-3 h-9" />
      </div>
      <div className="space-y-7">
        {[110, 90, 260, 420].map((h, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-muted" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}

const Designer = dynamic(() => import("./Designer"), { ssr: false, loading: DesignerSkeleton });

export function DesignerLoader(props: { initialSlug?: string; initialColor?: string }) {
  return <Designer {...props} />;
}
