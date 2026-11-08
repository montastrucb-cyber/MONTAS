import type { Product } from "@/data/catalog";
import { eur, tierFor, type Quote } from "@/lib/pricing";
import clsx from "clsx";

/** Cases de paliers de prix : un clic choisit la quantité du palier. */
export function TierTable({ product, qty, onPick }: { product: Product; qty: number; onPick?: (qty: number) => void }) {
  const { current, next } = tierFor(product, qty);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choisir un palier de quantité">
        {product.tiers.map((t) => {
          const active = t === current && qty >= product.moq;
          return (
            <button
              key={t.min}
              type="button"
              disabled={!onPick}
              aria-pressed={active}
              onClick={() => onPick?.(Math.max(t.min, product.moq))}
              className={clsx(
                "min-h-14 rounded-xl border px-3 py-2.5 text-center transition duration-200 disabled:cursor-default",
                active ? "border-accent bg-accent-soft ring-1 ring-accent" : "border-line bg-surface hover:border-accent/50 hover:bg-accent-soft/40",
              )}
            >
              <span className="block text-xs text-ink-soft">{t.min}+ pcs</span>
              <span className="block font-semibold">{eur(t.unitPrice)}</span>
            </button>
          );
        })}
      </div>
      {next && qty > 0 && (
        <p className="mt-2 text-xs text-accent">
          Encore {next.min - qty} pièce{next.min - qty > 1 ? "s" : ""} pour passer à {eur(next.unitPrice)} HT / pièce.
          {onPick && (
            <>
              {" "}
              <button type="button" onClick={() => onPick(next.min)} className="font-medium underline underline-offset-2">
                Passer à {next.min}
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** Champ quantité avec boutons − et +. */
export function QtyStepper({ value, onChange, min = 0, step = 5 }: { value: number; onChange: (n: number) => void; min?: number; step?: number }) {
  const set = (n: number) => onChange(Math.max(min, Math.min(100000, Math.round(n))));
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-surface">
      <button
        type="button"
        aria-label={`Retirer ${step} pièces`}
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="grid h-11 w-11 place-items-center rounded-l-xl text-lg hover:bg-muted disabled:opacity-30"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantité"
        min={min}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        onBlur={() => value < min && set(min)}
        className="h-11 w-20 border-x border-line bg-transparent text-center font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Ajouter ${step} pièces`}
        onClick={() => set(value + step)}
        className="grid h-11 w-11 place-items-center rounded-r-xl text-lg hover:bg-muted"
      >
        +
      </button>
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
