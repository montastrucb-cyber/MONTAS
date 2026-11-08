import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="px-2 pt-2 sm:px-4">
      <div className="on-dark relative overflow-hidden rounded-[2rem] bg-night text-white sm:rounded-[2.75rem]">
        <div aria-hidden="true" className="tech-grid absolute inset-0" />
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-80 w-[640px] -translate-x-1/2 rounded-full bg-lime/15 blur-[110px]" />
        <Container className="relative py-28 text-center sm:py-36">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-lime">Erreur 404</p>
          <p aria-hidden="true" className="text-glow mt-4 font-display text-[7rem] font-bold leading-none tracking-[-0.06em] sm:text-[10rem]">
            404
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Cette page s&apos;est perdue en livraison.</h1>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            Le lien est peut-être ancien ou mal saisi. Pas d&apos;inquiétude, le reste du site est bien là.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/" variant="light">
              Retour à l&apos;accueil
            </ButtonLink>
            <Link href="/produits" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white">
              Voir les produits <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}
