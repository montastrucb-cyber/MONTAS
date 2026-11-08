"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { MousePointer2, Move3d } from "lucide-react";
import { getProduct } from "@/data/catalog";
import { isDark } from "@/components/ProductVisual";
import { Viewer3D } from "./Viewer3D";
import { makeSampleArt } from "./sampleArt";

const SLUGS = ["mug-ceramique", "tasse-isotherme", "carnet-a5", "batterie-externe", "gourde-inox", "stylo-metal"];

/** Vitrine 3D de la page d'accueil : on fait tourner les produits avec un logo d'exemple. */
export function Showcase3D() {
  const items = SLUGS.map((s) => getProduct(s)!).filter(Boolean);
  const [slug, setSlug] = useState(items[0].slug);
  const product = items.find((p) => p.slug === slug)!;
  const [colorHex, setColorHex] = useState(product.colors[0].hex);
  const color = product.colors.find((c) => c.hex === colorHex) ?? product.colors[0];
  const zone = product.zones[0];
  const ink = isDark(color.hex) ? "#FFFFFF" : "#0B1220";
  // Le dessin n'existe que dans le navigateur (canvas)
  const art = useMemo(() => (typeof document === "undefined" ? null : makeSampleArt(getProduct(slug)!.zones[0], ink)), [slug, ink]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Produit affiché en 3D">
          {items.map((p) => (
            <button
              key={p.slug}
              role="tab"
              aria-selected={p.slug === slug}
              onClick={() => {
                setSlug(p.slug);
                setColorHex(p.colors[0].hex);
              }}
              className={clsx(
                "min-h-10 rounded-full border px-4 text-sm transition",
                p.slug === slug ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm font-medium">Coloris : {color.name}</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColorHex(c.hex)}
              aria-label={c.name}
              aria-pressed={c.hex === color.hex}
              className={clsx("h-10 w-10 rounded-full ring-1 ring-black/10 transition", c.hex === color.hex && "ring-2 ring-ink ring-offset-2")}
              style={{ background: c.hex }}
            />
          ))}
        </div>
        <p className="mt-6 flex items-start gap-2 text-sm text-ink-soft">
          <Move3d size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          Faites glisser pour tourner autour du produit, pincez ou utilisez la molette pour zoomer.
        </p>
        <Link
          href={`/personnaliser?produit=${product.slug}`}
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white transition hover:bg-ink/85"
        >
          <MousePointer2 size={16} aria-hidden="true" /> Essayer avec mon logo
        </Link>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#edf1f5_70%)] sm:aspect-[4/3]">
        <Viewer3D
          key={product.slug}
          kind={product.kind}
          color={color.hex}
          zone={zone}
          art={art}
          label={`${product.name} en 3D, coloris ${color.name}, avec un logo d'exemple`}
          className="absolute inset-0"
        />
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-night px-3 py-1 font-mono text-xs text-glow">3D · temps réel</span>
      </div>
    </div>
  );
}
