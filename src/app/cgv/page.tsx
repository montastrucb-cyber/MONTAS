import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente">
      <h2>1. Objet et champ d&apos;application</h2>
      <p>
        Les présentes conditions régissent les ventes de produits personnalisés conclues sur le site {site.name} entre
        [raison sociale] (le « Vendeur ») et ses clients. Le site s&apos;adresse principalement aux professionnels,
        associations et organismes. [Préciser si les consommateurs particuliers sont acceptés : les règles applicables
        diffèrent.]
      </p>
      <h2>2. Commandes et devis</h2>
      <p>
        La commande est passée en ligne après personnalisation, ou à partir d&apos;un devis accepté. Elle n&apos;est
        définitive qu&apos;après confirmation du paiement. Chaque devis a une durée de validité de [30] jours.
      </p>
      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en euros hors taxes (HT), puis toutes taxes comprises (TTC). Ils dépendent de la quantité
        (paliers dégressifs), de la technique et du nombre de zones de marquage, des frais de préparation et de la
        livraison. [Préciser les conditions de TVA pour les clients hors de France.]
      </p>
      <h2>4. Fichiers et validation de l&apos;aperçu</h2>
      <p>
        Le client fournit ses fichiers et garantit détenir les droits nécessaires à leur reproduction (logos, marques,
        images). L&apos;aperçu affiché à l&apos;écran est indicatif : les couleurs et proportions peuvent légèrement
        varier selon le produit et la technique de marquage. [Préciser les tolérances, le processus de BAT et les cas de
        refus de fichier.]
      </p>
      <h2>5. Paiement</h2>
      <p>Le paiement s&apos;effectue en ligne par carte bancaire via un prestataire sécurisé (Stripe). [Préciser les autres moyens et conditions de paiement pour les professionnels.]</p>
      <h2>6. Fabrication et livraison</h2>
      <p>
        Les produits sont fabriqués et marqués par des ateliers partenaires, puis expédiés directement au client. Les
        délais indiqués sont donnés à titre indicatif et courent à partir de la validation de l&apos;aperçu. [Préciser
        les conséquences d&apos;un retard et le transfert des risques.]
      </p>
      <h2>7. Droit de rétractation</h2>
      <p>
        Point à faire valider par un professionnel : pour les clients consommateurs, l&apos;article L221-28 du Code de la
        consommation prévoit que le droit de rétractation ne peut pas être exercé pour les biens confectionnés selon les
        spécifications du consommateur ou nettement personnalisés. Pour les clients professionnels, le droit de
        rétractation du Code de la consommation ne s&apos;applique en principe pas. [Rédaction définitive à établir avec
        votre conseil.]
      </p>
      <h2>8. Réclamations et défauts</h2>
      <p>
        Toute réclamation (produit défectueux, erreur de marquage, livraison incomplète) doit être signalée dans un délai
        de [X] jours après réception, avec photos. [Préciser les garanties applicables et les solutions : réimpression,
        avoir, remboursement.]
      </p>
      <h2>9. Données personnelles</h2>
      <p>Voir la <a href="/confidentialite" className="underline">politique de confidentialité</a>.</p>
      <h2>10. Droit applicable et litiges</h2>
      <p>Les présentes conditions sont soumises au droit français. [Clause de juridiction compétente et médiation à préciser.]</p>
    </LegalPage>
  );
}
