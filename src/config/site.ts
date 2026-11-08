// Réglages généraux du site. Changez ici le nom, l'email, etc.
// (Nom provisoire : à remplacer par votre vraie marque.)
export const site = {
  name: "Atelier Série",
  tagline: "Goodies et textile personnalisés, en gros, pour les pros.",
  description:
    "Kits de bienvenue, goodies pour clubs et associations, textile événementiel : personnalisez en ligne avec votre logo, prix dégressifs selon la quantité, paiement ou devis.",
  email: "contact@exemple.fr", // À REMPLACER
  vatRate: 0.2, // TVA France 20 % — règles à valider avec votre comptable
};

/**
 * Adresse publique du site (pour le sitemap, les images réseaux sociaux…).
 * Réglez NEXT_PUBLIC_SITE_URL dans Vercel quand vous aurez votre domaine.
 * À défaut, on utilise l'adresse de production fournie par Vercel.
 */
export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const nav = [
  { href: "/produits", label: "Produits" },
  { href: "/produits?categorie=kits-bienvenue", label: "Kits de bienvenue" },
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#professionnels", label: "Professionnels" },
  { href: "/devis", label: "Devis" },
];
