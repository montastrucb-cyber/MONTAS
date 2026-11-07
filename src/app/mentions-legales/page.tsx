import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Le site {site.name} est édité par [raison sociale], [forme juridique] au capital de [montant] €, immatriculée au
        RCS de [ville] sous le numéro [SIREN], dont le siège social est situé [adresse].
      </p>
      <p>Numéro de TVA intracommunautaire : [numéro]. Directeur de la publication : [nom et prénom].</p>
      <p>Contact : {site.email}.</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par [nom de l&apos;hébergeur], [adresse], [téléphone ou site web].</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus du site (textes, visuels, logo, mise en page) sont la propriété de [raison sociale], sauf mention
        contraire. Les logos et visuels importés par les clients restent leur propriété ; le client garantit disposer des
        droits nécessaires à leur reproduction.
      </p>
      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans la <a href="/confidentialite" className="underline">politique de confidentialité</a>.
      </p>
    </LegalPage>
  );
}
