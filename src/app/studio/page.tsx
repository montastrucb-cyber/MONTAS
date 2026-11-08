import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StudioClient } from "./StudioClient";

// Page technique pour générer les miniatures 3D (npm run thumbnails).
// Désactivée en production : elle n'existe que si ENABLE_STUDIO=1 au build.
export const metadata = { robots: { index: false } };

export default function StudioPage() {
  if (process.env.ENABLE_STUDIO !== "1") notFound();
  return (
    <Suspense fallback={null}>
      <StudioClient />
    </Suspense>
  );
}
