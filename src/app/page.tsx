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
import { ProductVisual } from "@/components/ProductVisual";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink, Container, Eyebrow, H2, Serif } from "@/components/ui";
import { eur } from "@/lib/pricing";

const categoryVisual: Record<string, { slug: string; color: string }> = {
  "kits-bienvenue": { slug: "kit-bienvenue-essentiel", color: "#D9C3A0" },
  "clubs-associations": { slug: "gourde-inox", color: "#1F2A44" },
  "textile-evenementiel": { slug: "t-shirt-coton-bio", color: "#A8BBA2" },
};

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
      {/* ——— Accroche ——— */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-lime/40 blur-3xl" />
        <div className="pointer-events-none absolute left-[-15%] top-40 h-[420px] w-[420px] rounded-full bg-accent-soft blur-3xl" />
        <Container className="relative grid items-center gap-12 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Entreprises · Associations · Clubs · Écoles · Événements
            </p>
            <h1 className="rise rise-2 mt-6 text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] text-balance sm:text-6xl">
              Vos goodies à vos couleurs, <Serif>en gros</Serif>, sans prise de tête.
            </h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-ink-soft text-pretty">
              Choisissez un produit ou un pack, importez votre logo, voyez le résultat en direct et le prix s&apos;ajuster à la
              quantité. Payez en ligne ou demandez un devis.
            </p>
            <div className="rise rise-4 mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/produits">
                Découvrir les produits <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/personnaliser" variant="secondary">
                <MousePointer2 size={16} /> Personnaliser mon produit
              </ButtonLink>
            </div>
            <ul className="rise rise-4 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent" /> Paiement sécurisé</li>
              <li className="flex items-center gap-2"><FileText size={16} className="text-accent" /> Prix HT affichés</li>
              <li className="flex items-center gap-2"><MousePointer2 size={16} className="text-accent" /> Aperçu en direct</li>
            </ul>
          </div>

          {/* Visuel : produits + carte de prix */}
          <div className="rise rise-3 relative mx-auto aspect-square w-full max-w-[500px]">
            <div className="absolute inset-[6%] rounded-[2.5rem] border border-line bg-surface shadow-[0_40px_80px_-40px_rgba(13,15,18,0.35)]" />
            <div className="float absolute inset-[10%]">
              <ProductVisual kind="tshirt" color="#A8BBA2" className="h-full w-full" />
              <div className="absolute left-1/2 top-[34%] -translate-x-1/2 text-center">
                <p className="font-display text-3xl italic text-ink/80 sm:text-4xl">Votre</p>
                <p className="-mt-1 text-xl font-bold tracking-[0.2em] text-ink/80 sm:text-2xl">LOGO</p>
              </div>
            </div>
            <div className="absolute -left-2 bottom-[10%] w-[44%] rounded-3xl border border-line bg-surface p-3 shadow-xl sm:-left-6">
              <ProductVisual kind="mug" color="#1B1C1F" className="w-full" />
            </div>
            <div className="absolute -right-2 top-[6%] w-[52%] rounded-2xl border border-line bg-surface/95 p-4 shadow-xl backdrop-blur sm:-right-6">
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">Prix dégressif · exemple</p>
              <div className="mt-3 space-y-2">
                {tshirt.tiers.map((t) => (
                  <div key={t.min} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-ink-soft">{t.min}+ pcs</span>
                    <span className="h-1.5 flex-1 rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${(t.unitPrice / maxTier) * 100}%` }} />
                    </span>
                    <span className="w-14 text-right font-semibold">{eur(t.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ——— Catégories ——— */}
      <section className="py-20">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Catalogue</Eyebrow>
              <H2 className="mt-3">Trois univers, un même circuit simple.</H2>
            </div>
            <Link href="/produits" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              Tout le catalogue <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((c) => {
              const v = categoryVisual[c.slug];
              const p = getProduct(v.slug)!;
              return (
                <Link
                  key={c.slug}
                  href={`/produits?categorie=${c.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(13,15,18,0.35)]"
                >
                  <p className="text-xs text-ink-faint">{c.audience}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{c.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.short}</p>
                  <div className="mt-6 aspect-[4/3] rounded-2xl bg-muted">
                    <ProductVisual kind={p.kind} color={v.color} className="h-full w-full p-4 transition duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Voir les produits <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ——— Fonctionnement ——— */}
      <section className="py-20">
        <Container>
          <div className="rounded-[2.5rem] bg-ink px-6 py-14 text-white sm:px-12 sm:py-16">
            <Eyebrow className="text-lime">Comment ça marche</Eyebrow>
            <H2 className="mt-3 max-w-2xl">
              De votre logo à votre colis, en <Serif>quatre étapes</Serif>.
            </H2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-lime">
                      <s.icon size={20} />
                    </span>
                    <span className="text-sm text-white/40">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ——— Avantages du gros ——— */}
      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Commandes en gros</Eyebrow>
            <H2 className="mt-3">Plus vous commandez, plus le prix unitaire baisse.</H2>
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
          </div>
          <div className="rounded-[2rem] border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="font-medium">{tshirt.name}</p>
              <p className="text-xs text-ink-faint">Prix unitaire HT · exemple</p>
            </div>
            <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">
              {tshirt.tiers.map((t) => (
                <div key={t.min} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-semibold">{eur(t.unitPrice)}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-accent to-accent/70"
                    style={{ height: `${(t.unitPrice / maxTier) * 170}px` }}
                  />
                  <span className="text-xs text-ink-soft">{t.min}+ pcs</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-ink-faint">Tarifs de démonstration, hors marquage et livraison.</p>
          </div>
        </Container>
      </section>

      {/* ——— Sélection ——— */}
      <section className="py-20">
        <Container>
          <Eyebrow>Sélection</Eyebrow>
          <H2 className="mt-3">Pour commencer.</H2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* ——— Professionnels ——— */}
      <section id="professionnels" className="scroll-mt-20 py-20">
        <Container>
          <div className="grid gap-10 rounded-[2.5rem] border border-line bg-surface p-6 sm:p-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Eyebrow>Pour les professionnels</Eyebrow>
              <H2 className="mt-3">
                Un espace entreprise pensé pour <Serif>recommander</Serif> sans effort.
              </H2>
              <p className="mt-5 leading-relaxed text-ink-soft">
                Vos logos, vos designs et vos commandes restent au même endroit. Quand le stock de t-shirts de votre club
                s&apos;épuise, vous relancez la même commande en deux clics.
              </p>
              <p className="mt-6 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                Espace client : bientôt disponible
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Repeat, t: "Réassort en 2 clics", d: "Recommandez le même produit personnalisé, changez juste la quantité ou la taille." },
                { icon: Package, t: "Logos enregistrés", d: "Vos fichiers sont conservés pour vos prochaines commandes." },
                { icon: FileText, t: "Devis et factures", d: "Retrouvez vos devis PDF et vos factures, prêts pour la comptabilité." },
                { icon: Building2, t: "Compte entreprise", d: "Adresses de facturation et de livraison, suivi de toutes vos livraisons." },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl bg-muted p-5">
                  <f.icon size={20} className="text-accent" />
                  <p className="mt-4 font-medium">{f.t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ——— Devis ——— */}
      <section className="py-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-accent px-6 py-16 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/30 blur-3xl" />
            <H2 className="relative mx-auto max-w-2xl">Une grosse commande ou un projet sur mesure ?</H2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/80">
              Plusieurs produits, de grandes quantités, un marquage particulier : décrivez votre besoin, nous revenons vers
              vous avec un devis détaillé.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/devis" variant="light">
                Demander un devis <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/produits" className="border border-white/30 bg-transparent text-white hover:bg-white/10">
                Voir les produits
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
