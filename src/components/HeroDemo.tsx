"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Ruler } from "lucide-react";
import type { Product } from "@/data/catalog";
import { eur } from "@/lib/pricing";
import Image from "next/image";

// Rendus 3D du t-shirt avec logo (générés par « npm run thumbnails »)
const HERO = ["/thumbs/hero-0.webp", "/thumbs/hero-1.webp", "/thumbs/hero-2.webp"];

/** Mini démonstration animée du configurateur (couleur, palier de prix). */
export function HeroDemo({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(1);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % product.tiers.length), 2600);
    return () => clearInterval(t);
  }, [reduce, product.tiers.length]);

  const tier = product.tiers[i];
  const shown = i % HERO.length;
  const zone = product.zones.find((z) => z.id === "poitrine") ?? product.zones[0];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* halo */}
      <div aria-hidden="true" className="absolute inset-[12%] rounded-full bg-glow/20 blur-3xl" />

      <div className="glass absolute inset-[4%] overflow-hidden rounded-[2.25rem]">
        <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-60" />
        <motion.div
          className="absolute inset-[4%]"
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {HERO.map((src, k) => (
            <Image
              key={src}
              src={src}
              alt={k === 0 ? "T-shirt personnalisé avec un logo, en 3D" : ""}
              aria-hidden={k === 0 ? undefined : true}
              width={720}
              height={720}
              priority={k === 0}
              sizes="(min-width: 1024px) 440px, 80vw"
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
              style={{ opacity: k === shown ? 1 : 0 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Puce : zone */}
      <div className="glass absolute left-0 top-[14%] flex items-center gap-2 rounded-2xl px-3 py-2 text-xs text-white sm:-left-4">
        <Ruler size={14} className="text-glow" aria-hidden="true" />
        Zone {zone.label.toLowerCase()} · {zone.widthMm / 10}×{zone.heightMm / 10} cm
      </div>

      {/* Puce : qualité */}
      <div className="glass absolute bottom-[20%] left-0 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs text-white sm:-left-6">
        <CheckCircle2 size={14} className="text-glow" aria-hidden="true" />
        Résolution du logo vérifiée
      </div>

      {/* Carte prix */}
      <div className="glass absolute -right-1 bottom-[6%] w-[48%] rounded-2xl p-4 text-white sm:-right-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Prix HT / pièce</p>
        <div className="mt-1 flex items-baseline justify-between">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tier.min}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="font-display text-3xl font-semibold tabular-nums"
            >
              {eur(tier.unitPrice)}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs text-white/70">{tier.min}+ pcs</span>
        </div>
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {product.tiers.map((t, k) => (
            <span key={t.min} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= i ? "bg-glow" : "bg-white/15"}`} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/60">Tarif de démonstration</p>
      </div>
    </div>
  );
}
