# Atelier Série : site B2B de goodies personnalisés

> « Atelier Série » est un **nom provisoire**. Vous le changez dans `src/config/site.ts`.

Cette version est l'**étape « design du site »**. Toutes les pages sont en place, avec des **données de démonstration** et un **configurateur qui fonctionne** dans le navigateur. Elle ne demande **aucun service payant**, aucune base de données et aucune clé API.

## Ce qui fonctionne déjà

| Page | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Accroche, catégories, 4 étapes, avantages du gros, section pro, appel au devis |
| Catalogue | `/produits` | Filtre par catégorie, packs et produits |
| Fiche produit | `/produits/t-shirt-coton-bio` | Couleurs, quantités par taille, paliers de prix, marquage, détail HT/TVA/TTC |
| Configurateur | `/personnaliser` | Import de logo (PNG, JPG, SVG, 10 Mo max), texte, glisser et redimensionner **dans la zone de marquage**, vues devant et dos, contrôle de la résolution (dpi), réinitialiser, sauvegarder |
| Panier | `/panier` | Stocké dans le navigateur. Paiement Stripe **pas encore branché** |
| Devis | `/devis` | Formulaire validé (navigateur + serveur), anti-spam, envoi par email si Resend est configuré |
| Juridique | `/mentions-legales`, `/cgv`, `/cgu`, `/confidentialite` (aussi `/rgpd`) | **Modèles à faire valider par un professionnel** |

Design : palette bleu nuit, ardoise et sarcelle ; base claire + sections sombres « tech » (grille lumineuse, effets de verre), polices Space Grotesk et DM Sans, animations avec **Motion** (ex-Framer Motion), qui respectent le réglage « réduire les animations » de l'appareil. Direction choisie avec le module **UI/UX Pro Max** (`.claude/skills/ui-ux-pro-max`).

## Aperçu 3D et personnalisation avancée

- **3D en temps réel** (Three.js / React Three Fiber, gratuit) pour : mug, tasse isotherme, gourde, carnet, stylo, tapis de souris, clé USB, batterie externe, tote bag, sac à dos et packs. Les produits sont modélisés dans le code (`src/components/three/Product3D.tsx`), sans fichier 3D à télécharger ; le marquage est appliqué sur la vraie surface (enroulé autour du mug, le long du stylo…).
- Le textile (t-shirt, sweat, casquette) reste en 2D : pour le passer en 3D, il faudra des modèles 3D professionnels (fichiers `.glb`), à acheter ou faire réaliser.
- Configurateur : rotation (crantée tous les 45°), aimantation au centre avec guides, premier plan / arrière-plan, dupliquer, ajuster à la zone, police, gras, italique, taille, espacement des lettres, couleur et contour du texte.

## Gammes

Bureau et entreprise · Kits de bienvenue salariés · Clubs et associations · Textile et événementiel (17 produits de démonstration dans `src/data/catalog.ts`).

## Checklist avant lancement (vérifiée)

| # | Point | Où / comment | État |
|---|---|---|---|
| 1 | Page RGPD | `/confidentialite` (`/rgpd` y redirige) | ✅ modèle à valider |
| 2 | Page CGU | `/cgu` | ✅ modèle à valider |
| 3 | API hors front-end | `src/app/api/devis/route.ts` ; clés lues côté serveur uniquement, voir `.env.example` | ✅ |
| 4 | HTTPS forcé | en-tête HSTS + CSP dans `next.config.ts` (Vercel redirige aussi HTTP → HTTPS) | ✅ |
| 5 | Bannière cookies | `src/components/CookieBanner.tsx` ; « Tout refuser » aussi visible que « Accepter », lien « Gérer les cookies » dans le pied de page | ✅ |
| 6 | Meta title | titre + description propres à chaque page | ✅ |
| 7 | Image réseaux | `src/app/opengraph-image.tsx` (1200×630) | ✅ |
| 8 | Favicon | `src/app/icon.svg` + `apple-icon.tsx` | ✅ |
| 9 | Sitemap + robots.txt | `/sitemap.xml`, `/robots.txt` ; **indexation bloquée tant que `NEXT_PUBLIC_SITE_URL` n'est pas réglée** | ✅ |
| 10 | Textes des images | chaque visuel produit a un texte alternatif, les décors sont ignorés par les lecteurs d'écran | ✅ |
| 11 | Images compressées | aucune photo lourde pour l'instant (visuels en SVG) ; `next/image` configuré en AVIF/WebP pour les futures photos | ✅ |
| 12 | Vitesse | Lighthouse mobile : Performance 93–96, CLS 0 | ✅ |
| 13 | Contraste | axe-core (WCAG 2.1 AA) : 0 défaut sur 13 pages | ✅ |
| 14 | Responsive | 375, 768, 1024 et 1440 px : aucun débordement horizontal | ✅ |
| 15 | Page 404 | `src/app/not-found.tsx` | ✅ |
| 16 | Liens cassés | 30 liens internes testés : 0 cassé | ✅ |
| 17 | Validation formulaires | messages sous chaque champ, contrôle refait par le serveur | ✅ |
| 18 | Anti-spam | champ piège, délai minimum de 3 s, limite de 5 envois / 10 min par adresse IP | ✅ |
| 19 | Analytics | Vercel Web Analytics (sans cookie), chargé **seulement après « Accepter »** ; à activer dans Vercel → Analytics | ✅ |
| 20 | Un seul CTA | action principale partout : « Personnaliser mon produit » ; les autres liens sont secondaires | ✅ |

### Variables d'environnement

Copiez `.env.example` en `.env.local` (en local) ou ajoutez-les dans Vercel → Settings → Environment Variables. Rien n'est obligatoire pour faire tourner le site.

## Lancer le projet sur votre ordinateur

1. Installez **Node.js 22 ou plus récent** depuis https://nodejs.org (version « LTS »).
2. Ouvrez un terminal dans ce dossier, puis installez les dépendances :

```bash
npm install
```

3. Démarrez le site :

```bash
npm run dev
```

4. Ouvrez http://localhost:3000 dans votre navigateur.

## Le tester

- Allez sur **Personnaliser**, importez un logo, ajoutez un texte et déplacez-les. Ils ne peuvent pas sortir de la zone en pointillés.
- Importez une petite image (moins de 300 px de large) : un avertissement de **résolution insuffisante** s'affiche.
- Modifiez la quantité : le palier de prix et le total se mettent à jour.
- Cliquez sur **Ajouter au panier** : l'aperçu apparaît dans le panier.

## Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Nom du site, email, taux de TVA | `src/config/site.ts` |
| Produits, prix, paliers, zones de marquage | `src/data/catalog.ts` |
| Calcul du prix (marquage, préparation, livraison) | `src/lib/pricing.ts` |
| Couleurs et typographie | `src/app/globals.css` et `src/app/layout.tsx` |
| Page d'accueil | `src/app/page.tsx` |
| Configurateur | `src/components/designer/Designer.tsx` |

## Mettre en ligne gratuitement (pour montrer le site)

- **Vercel, offre Hobby** (gratuite) : créez un compte sur vercel.com, importez le dépôt GitHub et cliquez sur « Deploy ». ⚠️ Cette offre est **réservée à un usage non commercial**. Elle convient pour une démo, pas pour encaisser de vraies commandes : il faudra passer à l'offre Pro (~20 $/mois) au lancement.
- Si vous le souhaitez, le site pourra aussi être adapté à d'autres hébergeurs (Cloudflare, Netlify, un serveur dédié).

## Important : aperçu ≠ fichier d'impression

L'image affichée dans le configurateur est un **aperçu** basse définition. Pour chaque élément, le projet conserve le **fichier original** et ses **coordonnées** (convertibles en millimètres réels). Le fichier de production HD (PNG 300 dpi, PDF ou SVG) sera **généré côté serveur** à partir de ces données, lors d'une prochaine étape.

## Prochaines étapes (selon l'architecture validée)

1. Base de données Postgres + admin Payload CMS (produits, paliers, fournisseurs, rôles).
2. Comptes clients entreprise et sauvegarde des designs sur le serveur.
3. Paiement Stripe Checkout en mode test, commande validée **uniquement par le webhook**.
4. Stockage sécurisé des fichiers et génération des fichiers de production HD.
5. Adaptateurs fournisseurs (Printful API en brouillon, puis email/CSV), emails, suivi.
6. Devis PDF, réassort en 2 clics, tableau de bord des marges.
