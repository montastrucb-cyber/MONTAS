import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, FileText, MessageSquare } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = { title: "Demander un devis" };

export default function DevisPage({ searchParams }: PageProps<"/devis">) {
  return (
    <Container className="grid gap-12 pt-12 sm:pt-16 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <Eyebrow>Devis</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Parlons de votre projet.</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Pour les grandes quantités, les commandes multi-produits ou les marquages particuliers, nous préparons un devis
          détaillé. Une fois validé, vous le payez en ligne et il devient une commande.
        </p>
        <ul className="mt-10 space-y-6">
          {[
            { icon: MessageSquare, t: "Décrivez votre besoin", d: "Produits, quantités, délai, et votre logo si vous l'avez." },
            { icon: FileText, t: "Recevez un devis PDF", d: "Détail HT ligne par ligne : produits, marquage, préparation, livraison." },
            { icon: Clock, t: "Validez et payez en ligne", d: "Le devis se transforme en commande, la production démarre." },
          ].map((s) => (
            <li key={s.t} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <s.icon size={18} />
              </span>
              <div>
                <p className="font-medium">{s.t}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Suspense fallback={<div className="h-[640px] animate-pulse rounded-3xl bg-muted" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/devis">["searchParams"] }) {
  const { produit, quantite } = await searchParams;
  return (
    <QuoteForm
      initialProduct={typeof produit === "string" ? produit : undefined}
      initialQty={typeof quantite === "string" ? quantite : undefined}
    />
  );
}
