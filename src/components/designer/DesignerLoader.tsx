"use client";

import dynamic from "next/dynamic";

// Konva a besoin du navigateur (canvas) : on le charge uniquement côté client.
const Designer = dynamic(() => import("./Designer"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="aspect-square animate-pulse rounded-[2rem] bg-muted" />
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  ),
});

export function DesignerLoader(props: { initialSlug?: string; initialColor?: string }) {
  return <Designer {...props} />;
}
