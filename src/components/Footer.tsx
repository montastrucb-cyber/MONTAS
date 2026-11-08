import Link from "next/link";
import { categories } from "@/data/catalog";
import { site } from "@/config/site";
import { ManageCookiesButton } from "./CookieBanner";

export function Footer() {
  return (
    <footer className="on-dark relative mt-24 overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{site.tagline}</p>
          <a href={`mailto:${site.email}`} className="mt-4 inline-block text-sm text-white/80 underline-offset-4 hover:underline">
            {site.email}
          </a>
        </div>
        <FooterCol title="Catalogue">
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/produits?categorie=${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Commander">
          <FooterLink href="/personnaliser">Personnaliser un produit</FooterLink>
          <FooterLink href="/devis">Demander un devis</FooterLink>
          <FooterLink href="/panier">Panier</FooterLink>
        </FooterCol>
        <FooterCol title="Informations légales">
          <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
          <FooterLink href="/cgv">Conditions générales de vente</FooterLink>
          <FooterLink href="/cgu">Conditions générales d&apos;utilisation</FooterLink>
          <FooterLink href="/confidentialite">Confidentialité et RGPD</FooterLink>
          <li>
            <ManageCookiesButton className="text-sm text-white/70 transition-colors hover:text-white" />
          </li>
        </FooterCol>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/60 sm:flex-row sm:justify-between sm:px-6">
          <p>© {site.name}. Prix affichés hors taxes, sauf mention contraire.</p>
          <p>Site en cours de construction · données de démonstration</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-glow">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/70 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
