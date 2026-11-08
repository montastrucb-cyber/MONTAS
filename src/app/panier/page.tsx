"use client";

import Link from "next/link";
import { Lock, Trash2 } from "lucide-react";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { computeQuote, eur, round } from "@/lib/pricing";
import { site } from "@/config/site";
import { ProductThumb } from "@/components/ProductThumb";
import { ButtonLink, Container, DemoNotice } from "@/components/ui";

export default function PanierPage() {
  const { lines, remove, setQty } = useCart();

  const priced = lines.flatMap((l) => {
    const p = getProduct(l.slug);
    if (!p) return [];
    const tech = p.techniques.find((t) => t.id === l.techniqueId);
    return [{ line: l, product: p, quote: computeQuote(p, l.qty, tech, l.zones ?? 1) }];
  });
  const totalHT = round(priced.reduce((a, x) => a + x.quote.totalHT, 0));
  const vat = round(totalHT * site.vatRate);

  return (
    <Container className="pt-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Panier</h1>

      {priced.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-line bg-surface p-10 text-center">
          <p className="text-ink-soft">Votre panier est vide.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/produits">Voir les produits</ButtonLink>
            <ButtonLink href="/personnaliser" variant="secondary">Personnaliser un produit</ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {priced.map(({ line, product, quote }) => (
              <li key={line.id} className="flex gap-4 rounded-3xl border border-line bg-surface p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-28 sm:w-28">
                  {line.previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.previewDataUrl} alt="Aperçu de votre personnalisation" className="h-full w-full object-cover" />
                  ) : (
                    <ProductThumb product={product} sizes="112px" className="p-1" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/produits/${product.slug}`} className="font-medium hover:underline">{line.name}</Link>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {line.color}
                        {line.size && ` · ${line.size}`}
                      </p>
                      <p className="text-sm text-ink-faint">{product.techniques.find((t) => t.id === line.techniqueId)?.label}</p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">{eur(quote.totalHT)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      Qté
                      <input
                        type="number"
                        min={product.moq}
                        value={line.qty}
                        onChange={(e) => setQty(line.id, Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={!!line.size}
                        className="w-20 rounded-lg border border-line px-2 py-1 text-ink disabled:bg-muted"
                      />
                    </label>
                    <button onClick={() => remove(line.id)} className="inline-flex items-center gap-1 text-sm text-ink-faint hover:text-red-700">
                      <Trash2 size={14} /> Retirer
                    </button>
                  </div>
                  {line.qty < product.moq && <p className="mt-2 text-xs text-amber-700">Minimum {product.moq} pièces.</p>}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-24">
            <p className="font-medium">Récapitulatif</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total HT</span><span className="font-semibold tabular-nums">{eur(totalHT)}</span></div>
              <div className="flex justify-between text-ink-soft"><span>TVA 20 %</span><span className="tabular-nums">{eur(vat)}</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><span>Total TTC</span><span className="tabular-nums">{eur(round(totalHT + vat))}</span></div>
            </div>
            <button
              disabled
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-white opacity-40"
            >
              <Lock size={15} /> Payer avec Stripe
            </button>
            <div className="mt-4">
              <DemoNotice>Le paiement en ligne sera branché à l&apos;étape suivante (Stripe, mode test).</DemoNotice>
            </div>
            <Link href="/devis" className="mt-4 block text-center text-sm font-medium text-accent hover:underline">
              Transformer ce panier en demande de devis
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
