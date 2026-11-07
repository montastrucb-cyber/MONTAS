import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="text-sm text-ink-faint">Erreur 404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cette page n&apos;existe pas.</h1>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">Accueil</ButtonLink>
        <ButtonLink href="/produits" variant="secondary">Produits</ButtonLink>
      </div>
    </Container>
  );
}
