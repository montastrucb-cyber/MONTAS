import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ManageCookiesButton } from "@/components/CookieBanner";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Confidentialité et RGPD",
  description: "Quelles données nous collectons, pourquoi, combien de temps, et comment exercer vos droits RGPD.",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité et RGPD">
      <p>
        Cette page explique comment {site.name} traite vos données personnelles, conformément au Règlement général sur la
        protection des données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        [Raison sociale], [adresse], SIREN [numéro]. Contact pour toute question sur vos données : {site.email}. [Le cas
        échéant : coordonnées du délégué à la protection des données (DPO).]
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>Identité et coordonnées professionnelles : nom, organisation, email, téléphone, adresses.</li>
        <li>Données de commande et de devis : produits, quantités, montants, historique.</li>
        <li>Fichiers importés (logos, images) et paramètres de personnalisation.</li>
        <li>Données de paiement : traitées directement par Stripe. Nous ne voyons ni ne conservons les numéros de carte.</li>
        <li>Mesure d&apos;audience (seulement si vous l&apos;acceptez) : pages vues, de façon agrégée et sans cookie.</li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>Traiter vos commandes et devis : exécution du contrat ou mesures précontractuelles.</li>
        <li>Transmettre vos commandes aux ateliers partenaires pour la fabrication et la livraison : exécution du contrat.</li>
        <li>Facturer et tenir la comptabilité : obligation légale.</li>
        <li>Protéger le site contre le spam et les abus : intérêt légitime.</li>
        <li>Mesurer l&apos;audience : votre consentement.</li>
        <li>[Prospection commerciale par email, le cas échéant : base légale à préciser.]</li>
      </ul>

      <h2>4. Destinataires et sous-traitants</h2>
      <p>Vos données sont accessibles uniquement aux personnes qui en ont besoin, et aux prestataires suivants :</p>
      <ul>
        <li>Ateliers partenaires (fabrication, marquage, expédition) : [liste à compléter].</li>
        <li>Stripe (paiement).</li>
        <li>Vercel (hébergement et mesure d&apos;audience).</li>
        <li>[Service d&apos;envoi d&apos;emails, base de données, stockage de fichiers : à compléter.]</li>
      </ul>
      <p>
        Certains prestataires peuvent traiter des données hors de l&apos;Union européenne. [Préciser les garanties :
        décision d&apos;adéquation, Data Privacy Framework, clauses contractuelles types.]
      </p>

      <h2>5. Durées de conservation</h2>
      <ul>
        <li>Demandes de devis sans suite : [3 ans] après le dernier contact.</li>
        <li>Données de compte : jusqu&apos;à la suppression du compte, puis [durée].</li>
        <li>Factures et pièces comptables : 10 ans (obligation légale).</li>
        <li>Fichiers de personnalisation : [durée] après la dernière commande, pour permettre le réassort.</li>
      </ul>

      <h2>6. Sécurité</h2>
      <p>
        Le site est servi uniquement en HTTPS. Les fichiers importés sont stockés dans un espace privé, et l&apos;accès à
        l&apos;administration est réservé aux personnes habilitées. [Compléter : sauvegardes, journalisation.]
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition
        et de portabilité de vos données, et du droit de retirer votre consentement à tout moment. Pour les exercer,
        écrivez à {site.email} en précisant votre demande. Nous répondons sous un mois. Vous pouvez aussi adresser une
        réclamation à la CNIL (www.cnil.fr).
      </p>

      <h2 id="cookies">8. Cookies et traceurs</h2>
      <p>
        <strong>Nécessaires au fonctionnement</strong> (pas de consentement requis) : le stockage local de votre
        navigateur retient votre panier, vos projets de personnalisation et votre choix concernant les cookies.
      </p>
      <p>
        <strong>Mesure d&apos;audience</strong> (avec votre accord uniquement) : Vercel Web Analytics. Cet outil ne dépose
        pas de cookie et produit des statistiques agrégées. Il n&apos;est chargé qu&apos;après que vous avez cliqué sur «
        Accepter ».
      </p>
      <p>Aucun cookie publicitaire n&apos;est utilisé. Vous pouvez modifier votre choix à tout moment :</p>
      <p>
        <ManageCookiesButton className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-ink/40" />
      </p>
    </LegalPage>
  );
}
