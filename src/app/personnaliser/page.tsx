import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { DesignerLoader } from "@/components/designer/DesignerLoader";

export const metadata: Metadata = {
  title: "Personnaliser",
  description: "Importez votre logo, placez-le sur le produit et voyez le prix s'ajuster à la quantité.",
};

export default function PersonnaliserPage({ searchParams }: PageProps<"/personnaliser">) {
  return (
    <Container className="pt-10 sm:pt-14">
      <Eyebrow>Configurateur</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Personnalisez votre produit</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Importez votre logo, placez-le dans la zone de marquage, ajustez la quantité : le prix se met à jour en direct.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="aspect-[2/1] animate-pulse rounded-[2rem] bg-muted" />}>
          <Loader searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}

async function Loader({ searchParams }: { searchParams: PageProps<"/personnaliser">["searchParams"] }) {
  const { produit, couleur } = await searchParams;
  return (
    <DesignerLoader
      initialSlug={typeof produit === "string" ? produit : undefined}
      initialColor={typeof couleur === "string" ? couleur : undefined}
    />
  );
}
