import { site } from "@/config/site";
import type { MarkingTechnique, Product } from "@/data/catalog";

// Estimation de livraison de démonstration (HT). À remplacer par les grilles
// réelles des fournisseurs.
const SHIPPING_ESTIMATE_HT = 14.9;
const FREE_SHIPPING_FROM_HT = 500;

export function tierFor(product: Product, qty: number) {
  const sorted = [...product.tiers].sort((a, b) => a.min - b.min);
  let current = sorted[0];
  for (const t of sorted) if (qty >= t.min) current = t;
  const next = sorted.find((t) => t.min > qty);
  return { current, next };
}

export type Quote = {
  qty: number;
  unitProduct: number;
  unitMarking: number;
  unitTotal: number;
  setupFee: number;
  shipping: number;
  totalHT: number;
  vat: number;
  totalTTC: number;
};

/**
 * Calcule le prix d'une ligne : produit (palier) + marquage par pièce et par zone
 * + frais de préparation par zone + livraison, puis TVA.
 */
export function computeQuote(
  product: Product,
  qty: number,
  technique: MarkingTechnique | undefined,
  zonesCount = 1,
): Quote {
  const q = Math.max(qty, 0);
  const { current } = tierFor(product, q);
  const zones = technique ? Math.max(zonesCount, 1) : 0;
  const unitProduct = current.unitPrice;
  const unitMarking = technique ? technique.unitCost * zones : 0;
  const unitTotal = unitProduct + unitMarking;
  const setupFee = technique ? technique.setupFee * zones : 0;
  const subtotal = unitTotal * q + setupFee;
  const shipping = q === 0 ? 0 : subtotal >= FREE_SHIPPING_FROM_HT ? 0 : SHIPPING_ESTIMATE_HT;
  const totalHT = round(subtotal + shipping);
  const vat = round(totalHT * site.vatRate);
  return {
    qty: q,
    unitProduct,
    unitMarking,
    unitTotal,
    setupFee,
    shipping,
    totalHT,
    vat,
    totalTTC: round(totalHT + vat),
  };
}

export const round = (n: number) => Math.round(n * 100) / 100;

const fmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const eur = (n: number) => fmt.format(n);

export function fromPrice(product: Product) {
  return Math.min(...product.tiers.map((t) => t.unitPrice));
}
