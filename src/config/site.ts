// Réglages généraux du site. Changez ici le nom, l'email, etc.
// (Nom provisoire : à remplacer par votre vraie marque.)
export const site = {
  name: "Atelier Série",
  tagline: "Goodies et textile personnalisés, en gros, pour les pros.",
  email: "contact@exemple.fr", // À REMPLACER
  phone: "", // optionnel
  vatRate: 0.2, // TVA France 20 % — règles à valider avec votre comptable
  freeQuoteThreshold: 2500, // au-delà (HT), on propose plutôt un devis
};

export const nav = [
  { href: "/produits", label: "Produits" },
  { href: "/produits?categorie=kits-bienvenue", label: "Kits de bienvenue" },
  { href: "/personnaliser", label: "Personnaliser" },
  { href: "/#professionnels", label: "Professionnels" },
  { href: "/devis", label: "Devis" },
];
