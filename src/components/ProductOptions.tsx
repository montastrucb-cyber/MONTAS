"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Box, Check, Image as ImageIcon, MousePointer2 } from "lucide-react";
import type { Product, View } from "@/data/catalog";
import { computeQuote, eur, fromPrice } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { ProductVisual, isDark } from "./ProductVisual";
import { QtyStepper, QuoteBreakdown, TierTable } from "./PriceSummary";
import { Viewer3D } from "./three/Viewer3D";
import { supports3D } from "./three/support";
import { makeSampleArt } from "./three/sampleArt";

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0]);
  const [view, setView] = useState<View>("front");
  const can3D = supports3D(product.kind);
  const [show3D, setShow3D] = useState(false);
  const [techniqueId, setTechniqueId] = useState(product.techniques[0]?.id);
  const [zoneIds, setZoneIds] = useState<string[]>([product.zones[0].id]);
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    product.sizes ? { M: Math.ceil(product.moq / 2), L: Math.floor(product.moq / 2) } : ({} as Record<string, number>),
  );
  const [simpleQty, setSimpleQty] = useState(product.moq);

  const qty = product.sizes ? Object.values(sizes).reduce((a, b) => a + (b || 0), 0) : simpleQty;

  /** Change la quantité totale. Pour le textile, on garde la répartition des tailles. */
  function setTotal(n: number) {
    if (!product.sizes) return setSimpleQty(n);
    const entries = Object.entries(sizes).filter(([, v]) => v > 0);
    const current = entries.reduce((a, [, v]) => a + v, 0);
    if (current === 0) return setSizes({ M: n });
    const next: Record<string, number> = {};
    let used = 0;
    for (const [s, v] of entries) {
      next[s] = Math.floor((v / current) * n);
      used += next[s];
    }
    const biggest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    next[biggest] += n - used;
    setSizes(next);
  }
  const technique = product.techniques.find((t) => t.id === techniqueId);
  const quote = useMemo(() => computeQuote(product, qty, technique, zoneIds.length), [product, qty, technique, zoneIds.length]);
  const belowMoq = qty < product.moq;
  const views = Array.from(new Set(product.zones.map((z) => z.view)));
  const shownZones = product.zones.filter((z) => z.view === view && zoneIds.includes(z.id));

  const sizeLabel = product.sizes
    ? Object.entries(sizes)
        .filter(([, n]) => n > 0)
        .map(([s, n]) => `${s}×${n}`)
        .join(", ")
    : undefined;

  function toggleZone(id: string) {
    setZoneIds((z) => (z.includes(id) ? (z.length > 1 ? z.filter((x) => x !== id) : z) : [...z, id]));
  }

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
      {/* Visuel */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-muted">
          {shownZones.map((z) => (
            <span key={z.id} className="sr-only">Zone {z.label}</span>
          ))}
          <ProductVisual
            kind={product.kind}
            color={color.hex}
            view={view}
            className="h-full w-full p-8"
            showZone={shownZones[0]?.box}
            label={`${product.name}, coloris ${color.name}, vue ${view === "front" ? "de face" : "de dos"}`}
          />
          {show3D && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#edf1f5_70%)]">
              <Sample3D product={product} colorHex={color.hex} colorName={color.name} />
            </div>
          )}
          {can3D && (
            <div className="absolute right-3 top-3 flex rounded-full border border-line bg-surface p-1 text-sm shadow-sm" role="group" aria-label="Type d'aperçu">
              <button
                onClick={() => setShow3D(false)}
                aria-pressed={!show3D}
                className={clsx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 transition", !show3D ? "bg-ink text-white" : "text-ink-soft")}
              >
                <ImageIcon size={14} aria-hidden="true" /> Illustration
              </button>
              <button
                onClick={() => setShow3D(true)}
                aria-pressed={show3D}
                className={clsx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 transition", show3D ? "bg-ink text-white" : "text-ink-soft")}
              >
                <Box size={14} aria-hidden="true" /> 3D
              </button>
            </div>
          )}
          {views.length > 1 && !show3D && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full border border-line bg-surface p-1 text-sm">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx("rounded-full px-4 py-1.5 transition", view === v ? "bg-ink text-white" : "text-ink-soft")}
                >
                  {v === "front" ? "Devant" : "Dos"}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-ink-faint">
          {show3D ? "Aperçu 3D avec un logo d'exemple · faites glisser pour tourner" : "Illustration non contractuelle · pointillés : zone de marquage"}
        </p>
      </div>

      {/* Options */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
        <p className="mt-2 text-ink-soft">{product.short}</p>
        <p className="mt-4 text-lg">
          <span className="text-ink-faint">dès </span>
          <span className="font-semibold">{eur(fromPrice(product))}</span>
          <span className="text-ink-faint"> HT / pièce</span>
        </p>

        <Section title="Couleur" aside={color.name}>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c)}
                title={c.name}
                aria-label={c.name}
                className={clsx(
                  "grid h-10 w-10 place-items-center rounded-full ring-1 ring-black/10 transition",
                  color.hex === c.hex && "ring-2 ring-ink ring-offset-2",
                )}
                style={{ background: c.hex }}
              >
                {color.hex === c.hex && <Check size={15} className={isDark(c.hex) ? "text-white" : "text-ink"} />}
              </button>
            ))}
          </div>
        </Section>

        <Section title={product.sizes ? "Quantités par taille" : "Quantité"} aside={`${qty} pièces`}>
          {product.sizes ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {product.sizes.map((s) => (
                <label key={s} className="rounded-xl border border-line bg-surface px-2 py-2 text-center focus-within:border-ink">
                  <span className="block text-xs text-ink-soft">{s}</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-label={`Quantité en taille ${s}`}
                    value={sizes[s] ?? 0}
                    onChange={(e) => setSizes((x) => ({ ...x, [s]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full bg-transparent text-center font-medium outline-none"
                  />
                </label>
              ))}
            </div>
          ) : (
            <QtyStepper value={simpleQty} onChange={setSimpleQty} min={product.moq} />
          )}
          <div className="mt-4">
            <TierTable product={product} qty={qty} onPick={setTotal} />
            {product.sizes && <p className="mt-2 text-xs text-ink-faint">Un clic sur un palier ajuste le total en gardant votre répartition des tailles.</p>}
          </div>
        </Section>

        <Section title="Marquage">
          <div className="space-y-2">
            {product.techniques.map((t) => (
              <label
                key={t.id}
                className={clsx(
                  "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition",
                  techniqueId === t.id ? "border-ink bg-surface" : "border-line bg-surface/60",
                )}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="tech" checked={techniqueId === t.id} onChange={() => setTechniqueId(t.id)} className="accent-[var(--accent)]" />
                  {t.label}
                </span>
                <span className="text-ink-soft">+ {eur(t.unitCost)} / pce</span>
              </label>
            ))}
          </div>
          {product.zones.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => {
                    toggleZone(z.id);
                    setView(z.view);
                  }}
                  className={clsx(
                    "rounded-full border px-3.5 py-1.5 text-sm transition",
                    zoneIds.includes(z.id) ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft",
                  )}
                >
                  {z.label}
                </button>
              ))}
            </div>
          )}
        </Section>

        <div className="mt-8">
          <QuoteBreakdown quote={quote} belowMoq={belowMoq} moq={product.moq} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/personnaliser?produit=${product.slug}&couleur=${encodeURIComponent(color.hex)}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-white transition hover:bg-ink/85"
          >
            <MousePointer2 size={16} /> Personnaliser avec mon logo
          </Link>
          <button
            disabled={belowMoq}
            onClick={() => {
              add({ slug: product.slug, name: product.name, color: color.name, size: sizeLabel, techniqueId, qty, zones: zoneIds.length });
              router.push("/panier");
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-line bg-surface px-5 py-3.5 text-sm font-medium transition hover:border-ink/30 disabled:opacity-40"
          >
            Ajouter au panier
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-ink-soft">
          Besoin de plusieurs produits ou d&apos;un marquage spécial ?{" "}
          <Link href={`/devis?produit=${product.slug}`} className="font-medium text-accent hover:underline">
            Demandez un devis
          </Link>
        </p>
      </div>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-medium">{title}</p>
        {aside && <p className="text-sm text-ink-soft">{aside}</p>}
      </div>
      {children}
    </div>
  );
}

function Sample3D({ product, colorHex, colorName }: { product: Product; colorHex: string; colorName: string }) {
  const ink = isDark(colorHex) ? "#FFFFFF" : "#0B1220";
  const slug = product.slug;
  const art = useMemo(() => (typeof document === "undefined" ? null : makeSampleArt(product.zones[0], ink)), [slug, ink]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Viewer3D
      kind={product.kind}
      color={colorHex}
      zone={product.zones[0]}
      art={art}
      label={`${product.name} en 3D, coloris ${colorName}, avec un logo d'exemple`}
      className="absolute inset-0"
    />
  );
}
