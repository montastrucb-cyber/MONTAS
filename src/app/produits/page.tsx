import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import clsx from "clsx";
import { categories, getCategory, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Produits personnalisables",
  description: "Catalogue de goodies, textile et kits de bienvenue personnalisables avec votre logo. Prix dégressifs affichés HT.",
  alternates: { canonical: "/produits" },
};

export default function ProduitsPage({ searchParams }: PageProps<"/produits">) {
  return (
    <Suspense fallback={<Container className="pt-16"><div className="h-96 animate-pulse rounded-3xl bg-muted" /></Container>}>
      <Catalogue searchParams={searchParams} />
    </Suspense>
  );
}

async function Catalogue({ searchParams }: { searchParams: PageProps<"/produits">["searchParams"] }) {
  const { categorie } = await searchParams;
  const active = typeof categorie === "string" ? getCategory(categorie) : undefined;
  const list = active ? products.filter((p) => p.category === active.slug) : products;
  const packs = list.filter((p) => p.includes);
  const items = list.filter((p) => !p.includes);

  return (
    <Container className="pt-12 sm:pt-16">
      <Eyebrow>Catalogue</Eyebrow>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{active ? active.name : "Tous les produits"}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        {active
          ? active.short
          : "Choisissez un produit à personnaliser ou un pack prêt à l'emploi. Prix dégressifs affichés hors taxes."}
      </p>

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href="/produits" active={!active}>
          Tout
        </Chip>
        {categories.map((c) => (
          <Chip key={c.slug} href={`/produits?categorie=${c.slug}`} active={active?.slug === c.slug}>
            {c.name}
          </Chip>
        ))}
      </div>

      {packs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Packs et kits</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-medium">Produits à l&apos;unité</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "shrink-0 rounded-full border px-4 py-2 text-sm transition",
        active ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
