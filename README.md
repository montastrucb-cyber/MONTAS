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
| Devis | `/devis` | Formulaire, envoi par email en attendant le serveur |
| Juridique | `/mentions-legales`, `/cgv`, `/confidentialite` | **Modèles à faire valider par un professionnel** |

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
