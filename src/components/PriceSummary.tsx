import type { Product } from "@/data/catalog";
import { eur, tierFor, type Quote } from "@/lib/pricing";
import clsx from "clsx";

export function TierTable({ product, qty }: { product: Product; qty: number }) {
  const { current, next } = tierFor(product, qty);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {product.tiers.map((t) => (
          <div
            key={t.min}
            className={clsx(
              "rounded-xl border px-3 py-2.5 text-center transition",
              t === current && qty >= product.moq ? "border-accent bg-accent-soft" : "border-line bg-surface",
            )}
          >
            <p className="text-xs text-ink-soft">{t.min}+ pcs</p>
            <p className="font-semibold">{eur(t.unitPrice)}</p>
          </div>
        ))}
      </div>
      {next && qty > 0 && (
        <p className="mt-2 text-xs text-accent">
          Encore {next.min - qty} pièce{next.min - qty > 1 ? "s" : ""} pour passer à {eur(next.unitPrice)} HT / pièce.
        </p>
      )}
    </div>
  );
}

export function QuoteBreakdown({ quote, belowMoq, moq }: { quote: Quote; belowMoq: boolean; moq: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-sm">
      <Row label={`Produit · ${quote.qty} × ${eur(quote.unitProduct)}`} value={eur(quote.unitProduct * quote.qty)} />
      {quote.unitMarking > 0 && <Row label={`Marquage · ${quote.qty} × ${eur(quote.unitMarking)}`} value={eur(quote.unitMarking * quote.qty)} />}
      {quote.setupFee > 0 && <Row label="Frais de préparation" value={eur(quote.setupFee)} />}
      <Row label="Livraison (estimation)" value={quote.shipping === 0 ? "Offerte" : eur(quote.shipping)} />
      <div className="my-3 border-t border-line" />
      <Row label="Total HT" value={eur(quote.totalHT)} strong />
      <Row label="TVA 20 %" value={eur(quote.vat)} muted />
      <Row label="Total TTC" value={eur(quote.totalTTC)} muted />
      <p className="mt-3 text-xs text-ink-faint">
        Soit {quote.qty > 0 ? eur(quote.totalHT / quote.qty) : "—"} HT par pièce, tout compris.
      </p>
      {belowMoq && <p className="mt-2 text-xs font-medium text-amber-700">Quantité minimale : {moq} pièces.</p>}
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={clsx("flex justify-between py-1", strong && "text-base font-semibold", muted && "text-ink-soft")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
