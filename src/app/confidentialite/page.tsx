import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>[Raison sociale], [adresse]. Contact pour toute question sur vos données : {site.email}.</p>
      <h2>Données collectées</h2>
      <ul>
        <li>Identité et coordonnées professionnelles (nom, organisation, email, téléphone, adresses).</li>
        <li>Données de commande et de devis (produits, quantités, montants, historique).</li>
        <li>Fichiers importés (logos, images) et paramètres de personnalisation.</li>
        <li>Données de paiement : traitées directement par Stripe, nous ne conservons pas les numéros de carte.</li>
      </ul>
      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Traitement des commandes et devis (exécution du contrat).</li>
        <li>Transmission aux ateliers partenaires pour la fabrication et la livraison (exécution du contrat).</li>
        <li>Facturation et comptabilité (obligation légale).</li>
        <li>[Prospection commerciale, le cas échéant : base légale à préciser.]</li>
      </ul>
      <h2>Destinataires</h2>
      <p>
        Nos ateliers partenaires (fabrication, marquage, expédition), notre prestataire de paiement (Stripe), notre
        hébergeur et notre service d&apos;envoi d&apos;emails. [Lister les sous-traitants et préciser les éventuels
        transferts hors UE et leurs garanties.]
      </p>
      <h2>Durées de conservation</h2>
      <p>[À définir : par exemple, données de compte jusqu&apos;à suppression, factures 10 ans, fichiers de personnalisation X mois/ans.]</p>
      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et
        de portabilité. Écrivez-nous à {site.email}. Vous pouvez aussi saisir la CNIL (www.cnil.fr).
      </p>
      <h2>Cookies</h2>
      <p>
        Ce site n&apos;utilise à ce jour aucun cookie publicitaire ni de mesure d&apos;audience. Il utilise uniquement le
        stockage local de votre navigateur pour retenir votre panier et vos projets de personnalisation. Si des outils de
        mesure d&apos;audience sont ajoutés, un bandeau de consentement sera mis en place si nécessaire.
      </p>
    </LegalPage>
  );
}
