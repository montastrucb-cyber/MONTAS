import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  Layers,
  MousePointer2,
  Package,
  Repeat,
  ShieldCheck,
  Truck,
  Upload,
  Wallet,
} from "lucide-react";
import { categories, getProduct, products } from "@/data/catalog";
import { ProductThumb } from "@/components/ProductThumb";
import { ProductCard } from "@/components/ProductCard";
import { HeroDemo } from "@/components/HeroDemo";
import { Showcase3D } from "@/components/three/Showcase3D";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { ButtonLink, Container, Eyebrow, Glow, H2 } from "@/components/ui";
import { eur } from "@/lib/pricing";

const categoryVisual: Record<string, { slug: string; color: string }> = {
  "bureau-entreprise": { slug: "tasse-isotherme", color: "#1E2A44" },
  "kits-bienvenue": { slug: "kit-bienvenue-essentiel", color: "#D9C3A0" },
  "clubs-associations": { slug: "gourde-inox", color: "#1F2A44" },
  "textile-evenementiel": { slug: "t-shirt-coton-bio", color: "#A8BBA2" },
};

/** Accroche découpée en mots pour une apparition en cascade (le texte reste lu en entier). */
const headline = ["Vos", "goodies", "à", "vos", "couleurs,", "en gros,", "sans", "prise", "de", "tête."];

const steps = [
  { icon: Layers, title: "Choisissez", text: "Un produit ou un pack, la couleur, les tailles et la quantité." },
  { icon: Upload, title: "Personnalisez", text: "Importez votre logo, ajoutez du texte et placez-le dans la zone de marquage." },
  { icon: Wallet, title: "Validez", text: "Le prix s'ajuste à la quantité. Payez en ligne ou demandez un devis." },
  { icon: Truck, title: "Recevez", text: "Fabrication et marquage par nos ateliers partenaires, livraison suivie." },
];

export default function Home() {
  const tshirt = getProduct("t-shirt-coton-bio")!;
  const featured = products.filter((p) => ["kit-bienvenue-essentiel", "t-shirt-coton-bio", "gourde-inox", "tote-bag"].includes(p.slug));
  const maxTier = Math.max(...tshirt.tiers.map((t) => t.unitPrice));

  return (
    <>
      {/* ——— Accroche (section sombre) ——— */}
      <section className="px-2 pt-2 sm:px-4">
        <div className="on-dark relative overflow-hidden rounded-[2rem] bg-night text-white sm:rounded-[2.75rem]">
          <div aria-hidden="true" className="tech-grid absolute inset-0" />
          <div aria-hidden="true" className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full bg-glow/15 blur-[120px]" />
          <div aria-hidden="true" className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-400/15 blur-[120px]" />

          <Container className="relative grid items-center gap-14 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="rise glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
                  <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-glow" />
                  Entreprises · Associations · Clubs · Écoles
              </p>
              <h1 className="mt-7 text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.045em] text-balance sm:text-[4.2rem]">
                {headline.map((w, i) => (
                  <span key={i}>
                    {i > 0 && " "}
                    <span className="word-in" style={{ "--i": i } as React.CSSProperties}>
                      {w === "en gros," ? (
                        <>
                          <Glow onDark>en gros</Glow>,
                        </>
                      ) : (
                        w
                      )}
                    </span>
                  </span>
                ))}
              </h1>
              <p className="rise rise-2 mt-6 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">
                  Importez votre logo, voyez le résultat en direct et le prix baisser avec la quantité. Payez en ligne ou
                  demandez un devis.
              </p>
              <div className="rise rise-3 mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <ButtonLink href="/personnaliser" variant="light" className="btn-shine w-full sm:w-auto">
                  <MousePointer2 size={16} aria-hidden="true" /> Personnaliser mon produit
                </ButtonLink>
                <Link
                  href="/produits"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
                >
                  Découvrir les produits <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <ul className="rise rise-4 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-glow" aria-hidden="true" /> Paiement sécurisé</li>
                  <li className="flex items-center gap-2"><FileText size={16} className="text-glow" aria-hidden="true" /> Prix HT affichés</li>
                  <li className="flex items-center gap-2"><MousePointer2 size={16} className="text-glow" aria-hidden="true" /> Aperçu en direct</li>
              </ul>
            </div>
            <div className="rise rise-2">
              <HeroDemo product={tshirt} />
            </div>
          </Container>
        </div>
      </section>

      {/* ——— Catégories ——— */}
      <section className="py-20 sm:py-24" aria-labelledby="titre-categories">
        <Container>
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Catalogue</Eyebrow>
              <H2 className="mt-3">
                <span id="titre-categories">Quatre univers, un même <Glow>circuit simple</Glow>.</span>
              </H2>
            </div>
            <Link href="/produits" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              Tout le catalogue <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => {
              const v = categoryVisual[c.slug];
              const p = getProduct(v.slug)!;
              return (
                <StaggerItem key={c.slug}>
                  <Link
                    href={`/produits?categorie=${c.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-28px_rgba(15,118,110,0.45)]"
                  >
                    <p className="font-mono text-xs text-ink-faint">{c.audience}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{c.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.short}</p>
                    <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#edf1f5_72%)]">
                      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(94,234,212,0.35),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100" />
                      <ProductThumb product={p} sizes="(min-width: 1024px) 25vw, 50vw" className="relative p-2 transition duration-500 group-hover:scale-[1.05]" />
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                      Voir les produits <ArrowRight size={15} aria-hidden="true" className="transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ——— Fonctionnement ——— */}
      <section id="fonctionnement" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="titre-etapes">
        <Container>
          <Reveal>
            <Eyebrow>Comment ça marche</Eyebrow>
            <H2 className="mt-3 max-w-2xl">
              <span id="titre-etapes">De votre logo à votre colis, en <Glow>quatre étapes</Glow>.</span>
            </H2>
          </Reveal>
          <Stagger className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
            <div aria-hidden="true" className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block" />
            {steps.map((s, i) => (
              <StaggerItem key={s.title} className="relative rounded-3xl border border-line bg-surface p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night text-glow shadow-[0_0_24px_-6px_rgba(94,234,212,0.7)]">
                    <s.icon size={20} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-ink-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ——— Aperçu 3D ——— */}
      <section className="py-20 sm:py-24" aria-labelledby="titre-3d">
        <Container>
          <Reveal>
            <Eyebrow>Aperçu 3D</Eyebrow>
            <H2 className="mt-3 max-w-2xl">
              <span id="titre-3d">Voyez votre logo <Glow>sous tous les angles</Glow> avant de commander.</span>
            </H2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Le marquage s&apos;enroule autour du mug, suit l&apos;axe du stylo, se pose sur la couverture du carnet. Vous
              savez exactement ce que recevront vos équipes et vos clients.
            </p>
          </Reveal>
          <div className="mt-10">
            <Showcase3D />
          </div>
        </Container>
      </section>

      {/* ——— Avantages du gros ——— */}
      <section className="py-20 sm:py-24" aria-labelledby="titre-gros">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Eyebrow>Commandes en gros</Eyebrow>
            <H2 className="mt-3">
              <span id="titre-gros">Plus vous commandez, plus le <Glow>prix unitaire baisse</Glow>.</span>
            </H2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Chaque produit a des paliers de prix clairs. Le calcul affiche tout : produit, marquage, frais de préparation,
              livraison et TVA. Vous savez ce que vous payez avant de commander.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Prix transparents", "Le détail HT ligne par ligne, puis le total TTC."],
                ["Aperçu avant production", "Vous validez le placement de votre logo avant fabrication."],
                ["Contrôle de vos fichiers", "On vous prévient si votre logo risque d'être flou à l'impression."],
                ["Un seul interlocuteur", "Même si plusieurs ateliers fabriquent votre commande."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="font-medium">{t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{d}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="on-dark relative overflow-hidden rounded-[2rem] bg-night p-6 text-white sm:p-8">
            <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-70" />
            <div className="relative flex items-center justify-between">
              <p className="font-medium">{tshirt.name}</p>
              <p className="font-mono text-xs text-white/70">Prix HT / pièce · exemple</p>
            </div>
            <Stagger className="relative mt-8 flex h-56 items-end gap-3 sm:gap-5" gap={0.12}>
              {tshirt.tiers.map((t) => (
                <StaggerItem key={t.min} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="font-display text-sm font-semibold tabular-nums">{eur(t.unitPrice)}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-accent to-glow shadow-[0_0_30px_-8px_rgba(94,234,212,0.6)]"
                    style={{ height: `${(t.unitPrice / maxTier) * 160}px` }}
                  />
                  <span className="font-mono text-xs text-white/70">{t.min}+</span>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="relative mt-6 text-xs text-white/70">Tarifs de démonstration, hors marquage et livraison.</p>
          </Reveal>
        </Container>
      </section>

      {/* ——— Sélection ——— */}
      <section className="py-20 sm:py-24" aria-labelledby="titre-selection">
        <Container>
          <Reveal>
            <Eyebrow>Sélection</Eyebrow>
            <H2 className="mt-3">
              <span id="titre-selection">Pour commencer.</span>
            </H2>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <StaggerItem key={p.slug}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ——— Professionnels ——— */}
      <section id="professionnels" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="titre-pros">
        <Container>
          <div className="relative grid gap-10 overflow-hidden rounded-[2.5rem] border border-line bg-surface p-6 sm:p-12 lg:grid-cols-[1fr_1.2fr]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span className="aurora-blob aurora-a" />
              <span className="aurora-blob aurora-b" />
            </div>
            <Reveal className="relative">
              <Eyebrow>Pour les professionnels</Eyebrow>
              <H2 className="mt-3">
                <span id="titre-pros">Un espace entreprise pensé pour <Glow>recommander</Glow> sans effort.</span>
              </H2>
              <p className="mt-5 leading-relaxed text-ink-soft">
                Vos logos, vos designs et vos commandes restent au même endroit. Quand le stock de t-shirts de votre club
                s&apos;épuise, vous relancez la même commande en deux clics.
              </p>
              <p className="mt-6 inline-flex rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
                Espace client : bientôt disponible
              </p>
            </Reveal>
            <Stagger className="relative grid gap-4 sm:grid-cols-2">
              {[
                { icon: Repeat, t: "Réassort en 2 clics", d: "Recommandez le même produit personnalisé, changez juste la quantité ou la taille." },
                { icon: Package, t: "Logos enregistrés", d: "Vos fichiers sont conservés pour vos prochaines commandes." },
                { icon: FileText, t: "Devis et factures", d: "Retrouvez vos devis PDF et vos factures, prêts pour la comptabilité." },
                { icon: Building2, t: "Compte entreprise", d: "Adresses de facturation et de livraison, suivi de toutes vos livraisons." },
              ].map((f) => (
                <StaggerItem key={f.t} className="rounded-2xl bg-muted p-5">
                  <f.icon size={20} className="text-accent" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.d}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* ——— Devis ——— */}
      <section className="px-2 py-12 sm:px-4" aria-labelledby="titre-devis">
        <Reveal className="on-dark relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-night px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div aria-hidden="true" className="tech-grid absolute inset-0" />
          <div aria-hidden="true" className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-glow/20 blur-[100px]" />
          <H2 className="relative mx-auto max-w-2xl">
            <span id="titre-devis">Une grosse commande ou un <Glow onDark>projet sur mesure</Glow> ?</span>
          </H2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/75">
            Plusieurs produits, de grandes quantités, un marquage particulier : décrivez votre besoin, nous revenons vers
            vous avec un devis détaillé.
          </p>
          <div className="relative mt-9 flex justify-center">
            <ButtonLink href="/devis" variant="light">
              Demander un devis <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
