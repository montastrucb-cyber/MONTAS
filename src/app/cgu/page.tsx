import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: `Règles d'utilisation du site ${site.name} : accès, compte, contenus importés, responsabilités.`,
  alternates: { canonical: "/cgu" },
};

export default function Page() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <p>
        Les présentes conditions générales d&apos;utilisation (CGU) encadrent l&apos;accès et l&apos;usage du site{" "}
        {site.name}, édité par [raison sociale]. Les conditions de vente des produits figurent dans les{" "}
        <a href="/cgv">conditions générales de vente</a>.
      </p>
      <h2>1. Accès au site</h2>
      <p>
        Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à internet. L&apos;éditeur peut
        suspendre l&apos;accès pour maintenance ou pour des raisons de sécurité, sans que sa responsabilité soit engagée.
        [Préciser les éventuelles restrictions d&apos;accès.]
      </p>
      <h2>2. Compte client</h2>
      <p>
        La création d&apos;un compte peut être nécessaire pour commander, enregistrer des designs ou suivre ses commandes.
        L&apos;utilisateur garantit l&apos;exactitude des informations fournies et la confidentialité de ses identifiants.
        Toute action réalisée depuis son compte est réputée faite par lui. [Préciser les conditions de suspension ou de
        suppression d&apos;un compte.]
      </p>
      <h2>3. Contenus importés par l&apos;utilisateur</h2>
      <p>
        L&apos;utilisateur qui importe un logo, une image ou un texte déclare en détenir les droits (droit d&apos;auteur,
        droit des marques, droit à l&apos;image) ou disposer des autorisations nécessaires. Il est interdit
        d&apos;importer des contenus illicites, haineux, diffamatoires, contrefaisants ou portant atteinte aux droits de
        tiers. L&apos;éditeur peut refuser ou supprimer tout contenu non conforme. [Préciser la procédure de signalement.]
      </p>
      <h2>4. Utilisation conforme</h2>
      <ul>
        <li>Ne pas tenter d&apos;accéder sans autorisation aux systèmes du site ni d&apos;en perturber le fonctionnement.</li>
        <li>Ne pas utiliser de robots ou d&apos;outils automatisés pour extraire les contenus ou envoyer des formulaires.</li>
        <li>Ne pas utiliser le site à des fins frauduleuses.</li>
      </ul>
      <h2>5. Propriété intellectuelle</h2>
      <p>
        Les éléments du site (textes, visuels, code, marques, mise en page) sont protégés. Toute reproduction sans
        autorisation est interdite, sauf usage privé.
      </p>
      <h2>6. Responsabilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées mais ne peut garantir
        l&apos;absence d&apos;erreurs. Les aperçus du configurateur sont indicatifs. [Préciser les limites de
        responsabilité, à faire valider.]
      </p>
      <h2>7. Données personnelles et cookies</h2>
      <p>
        Voir la <a href="/confidentialite">politique de confidentialité et RGPD</a>.
      </p>
      <h2>8. Modification des CGU</h2>
      <p>Les CGU peuvent évoluer. La version applicable est celle en ligne au moment de l&apos;utilisation du site.</p>
      <h2>9. Droit applicable</h2>
      <p>Les présentes CGU sont soumises au droit français. [Juridiction compétente à préciser.]</p>
    </LegalPage>
  );
}
