import Link from "next/link";
import { categories } from "@/data/catalog";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-semibold">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{site.tagline}</p>
          <p className="mt-4 text-sm text-ink-soft">{site.email}</p>
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
        <FooterCol title="Informations">
          <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
          <FooterLink href="/cgv">Conditions générales de vente</FooterLink>
          <FooterLink href="/confidentialite">Politique de confidentialité</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-faint sm:flex-row sm:justify-between sm:px-6">
          <p>© {site.name}. Prix affichés hors taxes, sauf mention contraire.</p>
          <p>Site en cours de construction · données de démonstration</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ink-soft transition-colors hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
