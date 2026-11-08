"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { MousePointer2, Move3d } from "lucide-react";
import { categories, products, type CategorySlug } from "@/data/catalog";
import { isDark } from "@/lib/color";
import { eur, fromPrice } from "@/lib/pricing";
import { Viewer3D } from "./Viewer3D";
import { makeSampleArt } from "./sampleArt";

// Tous les produits de la boutique, hors kits et coffrets, rangés par gamme
const items = products.filter((p) => !p.includes);
const groups = categories
  .map((c) => ({ ...c, products: items.filter((p) => p.category === c.slug) }))
  .filter((g) => g.products.length > 0);

/** Vitrine 3D de la page d'accueil : on fait tourner chaque produit avec un logo d'exemple. */
export function Showcase3D() {
  const [cat, setCat] = useState<CategorySlug>(groups[0].slug);
  const group = groups.find((g) => g.slug === cat)!;
  const [slug, setSlug] = useState(group.products[0].slug);
  const product = items.find((p) => p.slug === slug) ?? group.products[0];
  const [colorHex, setColorHex] = useState(product.colors[0].hex);
  const color = product.colors.find((c) => c.hex === colorHex) ?? product.colors[0];
  const zone = product.zones[0];
  const ink = isDark(color.hex) ? "#FFFFFF" : "#0B1220";
  // Le dessin n'existe que dans le navigateur (canvas)
  const art = useMemo(
    () => (typeof document === "undefined" ? null : makeSampleArt(items.find((p) => p.slug === slug)!.zones[0], ink)),
    [slug, ink],
  );

  function pickCategory(c: CategorySlug) {
    const g = groups.find((x) => x.slug === c)!;
    setCat(c);
    setSlug(g.products[0].slug);
    setColorHex(g.products[0].colors[0].hex);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:items-start">
      <div>
        {/* Gammes */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gamme de produits">
          {groups.map((g) => (
            <button
              key={g.slug}
              role="tab"
              aria-selected={g.slug === cat}
              onClick={() => pickCategory(g.slug)}
              className={clsx(
                "min-h-10 rounded-full border px-4 text-sm font-medium transition",
                g.slug === cat ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
              )}
            >
              {g.name}
              <span className={clsx("ml-2 font-mono text-xs", g.slug === cat ? "text-glow" : "text-ink-faint")}>{g.products.length}</span>
            </button>
          ))}
        </div>

        {/* Produits de la gamme */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3" role="tablist" aria-label={`Produits : ${group.name}`}>
          {group.products.map((p) => (
              <button
                key={p.slug}
                role="tab"
                aria-selected={p.slug === product.slug}
                onClick={() => {
                  setSlug(p.slug);
                  setColorHex(p.colors[0].hex);
                }}
                className={clsx(
                  "flex h-full min-h-14 w-full flex-col items-start justify-center rounded-xl border px-3 py-2 text-left text-sm transition",
                  p.slug === product.slug ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-ink/30",
                )}
              >
                <span className="font-medium leading-tight">{p.name}</span>
                <span className="mt-0.5 text-xs text-ink-faint">dès {eur(fromPrice(p))} HT</span>
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
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/personnaliser?produit=${product.slug}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white transition hover:bg-ink/85"
          >
            <MousePointer2 size={16} aria-hidden="true" /> Essayer avec mon logo
          </Link>
          <Link href={`/produits/${product.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
            Voir la fiche produit
          </Link>
        </div>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#edf1f5_70%)] lg:sticky lg:top-24">
        <Viewer3D
          key={product.slug}
          kind={product.kind}
          color={color.hex}
          poster={`/thumbs/${product.slug}.webp`}
          zones={product.zones}
          arts={{ [zone.id]: art }}
          label={`${product.name} en 3D, coloris ${color.name}, avec un logo d'exemple`}
          className="absolute inset-0"
        />
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-night px-3 py-1 font-mono text-xs text-glow">3D · temps réel</span>
        <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink shadow-sm">
          {product.name}
        </span>
      </div>
    </div>
  );
}
