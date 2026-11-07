import { AlertTriangle } from "lucide-react";
import { Container } from "./ui";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Container className="max-w-3xl pt-12 sm:pt-16">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Modèle à faire valider par un professionnel</strong> (avocat ou juriste). Les passages entre crochets [ ]
          sont à compléter. Ce texte n&apos;est pas un conseil juridique.
        </p>
      </div>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-ink-faint">Dernière mise à jour : [date]</p>
      <div className="prose-legal mt-6">{children}</div>
    </Container>
  );
}
