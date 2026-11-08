"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";

// La 3D (Three.js) est lourde : on ne la télécharge que lorsqu'elle devient visible
// et que le navigateur est au repos. En attendant, on montre le rendu 3D en image.
const Product3D = dynamic(() => import("./Product3D"), { ssr: false, loading: () => null });

function Loading() {
  return (
    <div className="grid h-full w-full place-items-center text-sm text-ink-faint">
      <span className="inline-flex items-center gap-2">
        <Box size={16} className="animate-pulse" aria-hidden="true" /> Chargement de la 3D…
      </span>
    </div>
  );
}

// Retient, pour toute la page, que le visiteur a déjà interagi
let userInteracted = false;

type Props = React.ComponentProps<typeof Product3D> & {
  label: string;
  /** Image affichée avant le chargement de la 3D (rendu 3D pré-calculé) */
  poster?: string;
  /** Charger l'image d'attente en priorité (vue principale de la page) */
  posterPriority?: boolean;
};

export function Viewer3D(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = false;
    let interacted = userInteracted;
    const maybeStart = () => visible && interacted && setActive(true);
    // 1) la vue doit être (presque) à l'écran…
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        maybeStart();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    // 2) …et le visiteur doit avoir interagi avec la page (souris, toucher, défilement, clavier).
    // En attendant, l'image du rendu 3D est affichée : la page reste rapide à charger.
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const onInteract = () => {
      interacted = true;
      userInteracted = true;
      events.forEach((ev) => window.removeEventListener(ev, onInteract));
      maybeStart();
    };
    events.forEach((ev) => window.addEventListener(ev, onInteract, { passive: true }));
    return () => {
      io.disconnect();
      events.forEach((ev) => window.removeEventListener(ev, onInteract));
    };
  }, []);

  const { label, className, poster, posterPriority, ...rest } = props;
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={ref} role="img" aria-label={label} className={className}>
      {!drawn &&
        (poster ? (
          <Image src={poster} alt="" aria-hidden width={720} height={720} priority={posterPriority} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain" />
        ) : (
          !active && <Loading />
        ))}
      {active && (
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: drawn ? 1 : 0 }}>
          <Product3D
            {...rest}
            onFirstFrame={() => setDrawn(true)}
            autoRotate={rest.autoRotate !== false && !reduce}
            className="h-full w-full cursor-grab active:cursor-grabbing"
          />
        </div>
      )}
    </div>
  );
}
