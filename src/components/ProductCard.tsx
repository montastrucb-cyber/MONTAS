import Link from "next/link";
import type { Product } from "@/data/catalog";
import { eur, fromPrice } from "@/lib/pricing";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-28px_rgba(13,115,82,0.55)]"
    >
      <div className="relative aspect-square bg-muted">
        <ProductVisual
          kind={product.kind}
          color={product.colors[0].hex}
          label={`${product.name}, coloris ${product.colors[0].name}`}
          className="h-full w-full p-6 transition duration-500 group-hover:scale-[1.03]"
        />
        {product.includes && (
          <span className="absolute left-4 top-4 rounded-full bg-night px-2.5 py-1 font-mono text-xs text-lime">Pack</span>
        )}
        <div className="absolute bottom-4 left-4 flex gap-1.5">
          {product.colors.slice(0, 5).map((c) => (
            <span key={c.hex} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} title={c.name} aria-hidden="true" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-medium tracking-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{product.short}</p>
        <div className="mt-auto flex items-end justify-between pt-5 text-sm">
          <p>
            <span className="text-ink-faint">dès </span>
            <span className="font-semibold">{eur(fromPrice(product))}</span>
            <span className="text-ink-faint"> HT / pièce</span>
          </p>
          <p className="text-ink-faint">min. {product.moq} pcs</p>
        </div>
      </div>
    </Link>
  );
}
