import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Package, Ruler } from "lucide-react";
import { getCategory, getProduct, products } from "@/data/catalog";
import { Container } from "@/components/ui";
import { ProductConfigurator } from "@/components/ProductOptions";
import { eur } from "@/lib/pricing";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return {
    title: p ? `${p.name} personnalisé` : "Produit",
    description: p ? `${p.name} personnalisable avec votre logo, dès ${p.moq} pièces. ${p.short}` : undefined,
    alternates: { canonical: `/produits/${slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category)!;

  return (
    <Container className="pt-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-faint">
        <Link href="/produits" className="hover:text-ink">Produits</Link>
        <ChevronRight size={14} />
        <Link href={`/produits?categorie=${category.slug}`} className="hover:text-ink">{category.name}</Link>
      </nav>

      <ProductConfigurator product={product} />

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Info icon={Package} title="Quantité minimale" text={`${product.moq} pièces par commande.`} />
        <Info icon={Clock} title="Délai indicatif" text={`${product.leadTime[0]} à ${product.leadTime[1]} jours ouvrés après validation de l'aperçu.`} />
        <Info
          icon={Ruler}
          title="Zones de marquage"
          text={product.zones.map((z) => `${z.label} (${z.widthMm / 10} × ${z.heightMm / 10} cm)`).join(" · ")}
        />
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Description</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{product.description}</p>
          {product.includes && (
            <>
              <h3 className="mt-8 font-medium">Contenu du pack</h3>
              <ul className="mt-3 space-y-2">
                {product.includes.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {i}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Techniques de marquage</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Technique</th>
                  <th className="px-4 py-3 font-medium">Préparation</th>
                  <th className="px-4 py-3 font-medium">Par pièce</th>
                </tr>
              </thead>
              <tbody>
                {product.techniques.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="px-4 py-3">{t.label}</td>
                    <td className="px-4 py-3">{eur(t.setupFee)}</td>
                    <td className="px-4 py-3">+ {eur(t.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-faint">Montants HT, par zone marquée. Tarifs de démonstration.</p>
        </div>
      </section>
    </Container>
  );
}

function Info({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <Icon size={19} className="text-accent" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
