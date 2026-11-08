"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";

// La 3D (Three.js) est lourde : on ne la télécharge que lorsqu'elle devient visible.
const Product3D = dynamic(() => import("./Product3D"), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  return (
    <div className="grid h-full w-full place-items-center text-sm text-ink-faint">
      <span className="inline-flex items-center gap-2">
        <Box size={16} className="animate-pulse" aria-hidden="true" /> Chargement de la 3D…
      </span>
    </div>
  );
}

export function Viewer3D(props: React.ComponentProps<typeof Product3D> & { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { label, className, ...rest } = props;
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={ref} role="img" aria-label={label} className={className}>
      {visible ? <Product3D {...rest} autoRotate={rest.autoRotate !== false && !reduce} className="h-full w-full cursor-grab active:cursor-grabbing" /> : <Loading />}
    </div>
  );
}
