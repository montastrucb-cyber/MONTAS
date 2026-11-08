// ⚠️ DONNÉES DE DÉMONSTRATION — prix, délais et quantités fictifs.
// Plus tard, ces données viendront de l'admin (Payload CMS + Postgres).

export type CategorySlug = "bureau-entreprise" | "kits-bienvenue" | "clubs-associations" | "textile-evenementiel";

export type Category = {
  slug: CategorySlug;
  name: string;
  short: string;
  audience: string;
};

export const categories: Category[] = [
  {
    slug: "bureau-entreprise",
    name: "Bureau et entreprise",
    short: "Objets du quotidien au bureau, accueil, séminaires et cadeaux clients à votre image.",
    audience: "Entreprises, cabinets, collectivités",
  },
  {
    slug: "kits-bienvenue",
    name: "Kits de bienvenue salariés",
    short: "Des coffrets prêts à offrir pour l'arrivée de vos nouvelles recrues.",
    audience: "Entreprises, RH, start-up",
  },
  {
    slug: "clubs-associations",
    name: "Clubs et associations",
    short: "Goodies et équipements à vos couleurs pour vos membres et bénévoles.",
    audience: "Clubs sportifs, associations, écoles",
  },
  {
    slug: "textile-evenementiel",
    name: "Textile et événementiel",
    short: "T-shirts, sweats, tote bags et accessoires pour vos événements.",
    audience: "Organisateurs, agences, salons",
  },
];

/** Type de modèle 3D du produit (voir src/components/three). */
export type VisualKind =
  | "tshirt"
  | "sweat"
  | "tote"
  | "mug"
  | "gourde"
  | "casquette"
  | "carnet"
  | "pack"
  | "stylo"
  | "tapis"
  | "usb"
  | "powerbank"
  | "lanyard"
  | "sac"
  | "tasse-iso";

export type View = "front" | "back";

export type MarkingZone = {
  id: string;
  view: View;
  label: string;
  /** Dimensions réelles imprimables, en millimètres */
  widthMm: number;
  heightMm: number;
  /** Position de la zone dans le visuel (repère 0–400 × 0–400) */
  box: { x: number; y: number; w: number; h: number };
};

export type MarkingTechnique = {
  id: string;
  label: string;
  /** Frais de préparation, payés une fois par commande (HT) */
  setupFee: number;
  /** Surcoût par pièce (HT) */
  unitCost: number;
};

export type PriceTier = { min: number; unitPrice: number };

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  kind: VisualKind;
  short: string;
  description: string;
  colors: { name: string; hex: string }[];
  sizes?: string[];
  /** Quantité minimale de commande */
  moq: number;
  /** Délai indicatif en jours ouvrés après validation du BAT */
  leadTime: [number, number];
  techniques: MarkingTechnique[];
  zones: MarkingZone[];
  /** Paliers dégressifs, prix unitaire HT (produit nu, marge incluse) */
  tiers: PriceTier[];
  customizable: boolean;
  /** Pour les packs : contenu */
  includes?: string[];
};

const textileColors = [
  { name: "Blanc", hex: "#F7F7F4" },
  { name: "Noir", hex: "#1B1C1F" },
  { name: "Marine", hex: "#1F2A44" },
  { name: "Sauge", hex: "#A8BBA2" },
  { name: "Sable", hex: "#E3D5BC" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const flocage: MarkingTechnique = { id: "serigraphie", label: "Sérigraphie 1 couleur", setupFee: 45, unitCost: 1.2 };
const dtf: MarkingTechnique = { id: "dtf", label: "Impression quadri (DTF)", setupFee: 25, unitCost: 2.4 };
const broderie: MarkingTechnique = { id: "broderie", label: "Broderie", setupFee: 60, unitCost: 3.1 };
const gravure: MarkingTechnique = { id: "gravure", label: "Gravure laser", setupFee: 35, unitCost: 1.5 };
const tampo: MarkingTechnique = { id: "tampographie", label: "Impression quadri", setupFee: 30, unitCost: 0.9 };

export const products: Product[] = [
  {
    slug: "t-shirt-coton-bio",
    name: "T-shirt coton bio",
    category: "textile-evenementiel",
    kind: "tshirt",
    short: "Coupe unisexe, 180 g/m², coton biologique.",
    description:
      "Le basique indispensable pour vos équipes et vos événements. Coupe unisexe droite, col rond renforcé, tissu épais qui tient bien l'impression.",
    colors: textileColors,
    sizes,
    moq: 25,
    leadTime: [7, 10],
    techniques: [dtf, flocage, broderie],
    zones: [
      { id: "poitrine", view: "front", label: "Poitrine", widthMm: 280, heightMm: 350, box: { x: 128, y: 115, w: 144, h: 180 } },
      { id: "coeur", view: "front", label: "Cœur", widthMm: 100, heightMm: 100, box: { x: 222, y: 120, w: 62, h: 62 } },
      { id: "dos", view: "back", label: "Dos complet", widthMm: 300, heightMm: 400, box: { x: 124, y: 105, w: 152, h: 202 } },
    ],
    tiers: [
      { min: 25, unitPrice: 12 },
      { min: 100, unitPrice: 8 },
      { min: 250, unitPrice: 6.6 },
      { min: 500, unitPrice: 5.5 },
    ],
    customizable: true,
  },
  {
    slug: "sweat-capuche",
    name: "Sweat à capuche",
    category: "textile-evenementiel",
    kind: "sweat",
    short: "Molleton 300 g/m², poche kangourou.",
    description:
      "Un sweat chaud et durable pour vos équipes, vos clubs et vos promotions d'école. Intérieur gratté, capuche doublée.",
    colors: textileColors.slice(1),
    sizes,
    moq: 20,
    leadTime: [10, 14],
    techniques: [broderie, dtf],
    zones: [
      { id: "poitrine", view: "front", label: "Poitrine", widthMm: 260, heightMm: 200, box: { x: 133, y: 135, w: 134, h: 104 } },
      { id: "coeur", view: "front", label: "Cœur", widthMm: 90, heightMm: 90, box: { x: 220, y: 135, w: 56, h: 56 } },
      { id: "dos", view: "back", label: "Dos", widthMm: 300, heightMm: 350, box: { x: 124, y: 120, w: 152, h: 178 } },
    ],
    tiers: [
      { min: 20, unitPrice: 29 },
      { min: 100, unitPrice: 22.5 },
      { min: 250, unitPrice: 19.9 },
      { min: 500, unitPrice: 17.5 },
    ],
    customizable: true,
  },
  {
    slug: "tote-bag",
    name: "Tote bag coton",
    category: "textile-evenementiel",
    kind: "tote",
    short: "Coton 220 g/m², anses longues.",
    description:
      "Le tote bag robuste qui accompagne vos salons, conférences et kits d'accueil. Anses longues pour le porter à l'épaule.",
    colors: [
      { name: "Naturel", hex: "#EFE6D2" },
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Marine", hex: "#1F2A44" },
    ],
    moq: 50,
    leadTime: [7, 10],
    techniques: [flocage, dtf],
    zones: [{ id: "face", view: "front", label: "Face avant", widthMm: 250, heightMm: 250, box: { x: 130, y: 170, w: 140, h: 140 } }],
    tiers: [
      { min: 50, unitPrice: 4.9 },
      { min: 100, unitPrice: 3.8 },
      { min: 500, unitPrice: 2.6 },
      { min: 1000, unitPrice: 2.1 },
    ],
    customizable: true,
  },
  {
    slug: "mug-ceramique",
    name: "Mug céramique",
    category: "bureau-entreprise",
    kind: "mug",
    short: "33 cl, compatible lave-vaisselle.",
    description: "Le mug du quotidien au bureau. Céramique blanche ou colorée, marquage quadri résistant au lave-vaisselle.",
    colors: [
      { name: "Blanc", hex: "#F7F7F4" },
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Sauge", hex: "#A8BBA2" },
    ],
    moq: 36,
    leadTime: [8, 12],
    techniques: [tampo],
    zones: [{ id: "face", view: "front", label: "Face", widthMm: 80, heightMm: 70, box: { x: 128, y: 160, w: 120, h: 105 } }],
    tiers: [
      { min: 36, unitPrice: 6.9 },
      { min: 100, unitPrice: 4.9 },
      { min: 500, unitPrice: 3.6 },
    ],
    customizable: true,
  },
  {
    slug: "gourde-inox",
    name: "Gourde isotherme inox",
    category: "clubs-associations",
    kind: "gourde",
    short: "50 cl, double paroi, chaud 12 h / froid 24 h.",
    description:
      "La gourde réutilisable pour vos membres, sportifs et bénévoles. Inox double paroi, bouchon étanche, gravure laser durable.",
    colors: [
      { name: "Inox", hex: "#C9CDD2" },
      { name: "Noir mat", hex: "#26272B" },
      { name: "Marine", hex: "#1F2A44" },
      { name: "Sauge", hex: "#A8BBA2" },
    ],
    moq: 25,
    leadTime: [8, 12],
    techniques: [gravure, tampo],
    zones: [{ id: "face", view: "front", label: "Face", widthMm: 50, heightMm: 90, box: { x: 172, y: 175, w: 56, h: 100 } }],
    tiers: [
      { min: 25, unitPrice: 14.9 },
      { min: 100, unitPrice: 11.5 },
      { min: 500, unitPrice: 9.2 },
    ],
    customizable: true,
  },
  {
    slug: "casquette-brodee",
    name: "Casquette brodée",
    category: "clubs-associations",
    kind: "casquette",
    short: "Coton sergé, 6 panneaux, réglable.",
    description: "La casquette de club par excellence. Broderie en relief sur le panneau avant, attache réglable à l'arrière.",
    colors: [
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Marine", hex: "#1F2A44" },
      { name: "Sable", hex: "#E3D5BC" },
      { name: "Blanc", hex: "#F7F7F4" },
    ],
    moq: 25,
    leadTime: [10, 14],
    techniques: [broderie],
    zones: [{ id: "face", view: "front", label: "Panneau avant", widthMm: 100, heightMm: 55, box: { x: 150, y: 150, w: 100, h: 55 } }],
    tiers: [
      { min: 25, unitPrice: 9.9 },
      { min: 100, unitPrice: 7.4 },
      { min: 500, unitPrice: 5.9 },
    ],
    customizable: true,
  },
  {
    slug: "carnet-a5",
    name: "Carnet A5",
    category: "bureau-entreprise",
    kind: "carnet",
    short: "Couverture rigide, 96 pages lignées, élastique.",
    description: "Un carnet élégant pour vos équipes et vos clients. Couverture rigide soft-touch, marquage à chaud ou quadri.",
    colors: [
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Marine", hex: "#1F2A44" },
      { name: "Sauge", hex: "#A8BBA2" },
      { name: "Terracotta", hex: "#C9785B" },
    ],
    moq: 50,
    leadTime: [8, 12],
    techniques: [tampo, gravure],
    zones: [{ id: "couverture", view: "front", label: "Couverture", widthMm: 100, heightMm: 140, box: { x: 150, y: 110, w: 100, h: 140 } }],
    tiers: [
      { min: 50, unitPrice: 6.5 },
      { min: 100, unitPrice: 5.2 },
      { min: 500, unitPrice: 3.9 },
    ],
    customizable: true,
  },
  {
    slug: "kit-bienvenue-essentiel",
    name: "Kit de bienvenue Essentiel",
    category: "kits-bienvenue",
    kind: "pack",
    short: "Mug, carnet, tote bag et gourde, dans une boîte à vos couleurs.",
    description:
      "Un coffret complet pour accueillir vos nouvelles recrues. Chaque article reçoit votre logo, et le tout est livré assemblé dans une boîte kraft.",
    colors: [
      { name: "Kraft", hex: "#D9C3A0" },
      { name: "Noir", hex: "#1B1C1F" },
    ],
    moq: 20,
    leadTime: [12, 18],
    techniques: [{ id: "multi", label: "Marquage logo sur chaque article", setupFee: 120, unitCost: 4.5 }],
    zones: [{ id: "boite", view: "front", label: "Couvercle de la boîte", widthMm: 150, heightMm: 100, box: { x: 125, y: 200, w: 150, h: 100 } }],
    tiers: [
      { min: 20, unitPrice: 39 },
      { min: 50, unitPrice: 34 },
      { min: 100, unitPrice: 29.5 },
      { min: 250, unitPrice: 26 },
    ],
    customizable: true,
    includes: ["Mug céramique 33 cl", "Carnet A5", "Tote bag coton", "Gourde inox 50 cl", "Boîte kraft personnalisée"],
  },
  {
    slug: "pack-club-supporter",
    name: "Pack Club Supporter",
    category: "clubs-associations",
    kind: "pack",
    short: "T-shirt, casquette et gourde aux couleurs de votre club.",
    description:
      "Tout ce qu'il faut pour équiper vos licenciés ou vos bénévoles le jour du match. Tailles au choix pour chaque membre au moment du devis.",
    colors: [
      { name: "Marine", hex: "#1F2A44" },
      { name: "Noir", hex: "#1B1C1F" },
    ],
    moq: 25,
    leadTime: [12, 18],
    techniques: [{ id: "multi", label: "Logo du club sur chaque article", setupFee: 100, unitCost: 4 }],
    zones: [{ id: "boite", view: "front", label: "Étiquette du pack", widthMm: 150, heightMm: 100, box: { x: 125, y: 200, w: 150, h: 100 } }],
    tiers: [
      { min: 25, unitPrice: 32 },
      { min: 100, unitPrice: 26.5 },
      { min: 250, unitPrice: 23 },
    ],
    customizable: true,
    includes: ["T-shirt coton bio", "Casquette brodée", "Gourde inox 50 cl"],
  },
  {
    slug: "stylo-metal",
    name: "Stylo métal gravé",
    category: "bureau-entreprise",
    kind: "stylo",
    short: "Corps aluminium, encre bleue, gravure laser du logo.",
    description:
      "Le stylo qu'on garde : corps en aluminium anodisé, mécanisme rotatif, recharge standard. Votre logo est gravé au laser, il ne s'efface pas.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Argent", hex: "#C9CDD2" },
      { name: "Sarcelle", hex: "#0F766E" },
    ],
    moq: 100,
    leadTime: [7, 10],
    techniques: [gravure, tampo],
    zones: [{ id: "corps", view: "front", label: "Corps du stylo", widthMm: 45, heightMm: 7, box: { x: 150, y: 191, w: 120, h: 18 } }],
    tiers: [
      { min: 100, unitPrice: 2.4 },
      { min: 250, unitPrice: 1.9 },
      { min: 500, unitPrice: 1.55 },
      { min: 1000, unitPrice: 1.25 },
    ],
    customizable: true,
  },
  {
    slug: "tasse-isotherme",
    name: "Tasse isotherme",
    category: "bureau-entreprise",
    kind: "tasse-iso",
    short: "35 cl, double paroi inox, couvercle anti-fuite.",
    description:
      "La tasse de bureau qui garde le café chaud pendant la réunion. Double paroi inox, couvercle coulissant, passe sous la plupart des machines.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Blanc", hex: "#F2F3F1" },
      { name: "Ardoise", hex: "#475569" },
      { name: "Sauge", hex: "#A8BBA2" },
    ],
    moq: 25,
    leadTime: [8, 12],
    techniques: [gravure, tampo],
    zones: [{ id: "face", view: "front", label: "Face", widthMm: 60, heightMm: 95, box: { x: 170, y: 175, w: 60, h: 100 } }],
    tiers: [
      { min: 25, unitPrice: 13.9 },
      { min: 100, unitPrice: 10.9 },
      { min: 500, unitPrice: 8.7 },
    ],
    customizable: true,
  },
  {
    slug: "tapis-souris",
    name: "Tapis de souris",
    category: "bureau-entreprise",
    kind: "tapis",
    short: "24 × 20 cm, surface textile, base antidérapante.",
    description:
      "Un grand visuel toujours sous les yeux de vos équipes. Impression couleur sur toute la surface, bords cousus, base caoutchouc antidérapante.",
    colors: [
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Gris clair", hex: "#E5E7EB" },
    ],
    moq: 50,
    leadTime: [7, 10],
    techniques: [{ id: "sublimation", label: "Impression intégrale (sublimation)", setupFee: 30, unitCost: 0.8 }],
    zones: [{ id: "surface", view: "front", label: "Surface", widthMm: 220, heightMm: 175, box: { x: 85, y: 125, w: 230, h: 180 } }],
    tiers: [
      { min: 50, unitPrice: 5.9 },
      { min: 100, unitPrice: 4.6 },
      { min: 500, unitPrice: 3.4 },
    ],
    customizable: true,
  },
  {
    slug: "cle-usb",
    name: "Clé USB 32 Go",
    category: "bureau-entreprise",
    kind: "usb",
    short: "USB-C et USB-A, coque aluminium, données préchargeables.",
    description:
      "Pratique pour vos présentations commerciales et vos kits presse. Double connecteur USB-C / USB-A, coque aluminium, chargement de vos fichiers possible sur devis.",
    colors: [
      { name: "Argent", hex: "#C9CDD2" },
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Noir", hex: "#1B1C1F" },
    ],
    moq: 50,
    leadTime: [10, 14],
    techniques: [gravure, tampo],
    zones: [{ id: "face", view: "front", label: "Face", widthMm: 15, heightMm: 30, box: { x: 172, y: 160, w: 56, h: 110 } }],
    tiers: [
      { min: 50, unitPrice: 9.9 },
      { min: 100, unitPrice: 8.2 },
      { min: 500, unitPrice: 6.9 },
    ],
    customizable: true,
  },
  {
    slug: "batterie-externe",
    name: "Batterie externe 10 000 mAh",
    category: "bureau-entreprise",
    kind: "powerbank",
    short: "Recharge rapide USB-C, format fin, certifiée CE.",
    description:
      "Le cadeau client utile en déplacement. Format fin, recharge rapide USB-C, indicateur de charge. Livrée dans une boîte individuelle.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Blanc", hex: "#F2F3F1" },
      { name: "Noir", hex: "#1B1C1F" },
    ],
    moq: 25,
    leadTime: [10, 14],
    techniques: [tampo, gravure],
    zones: [{ id: "face", view: "front", label: "Face", widthMm: 50, heightMm: 78, box: { x: 158, y: 140, w: 84, h: 130 } }],
    tiers: [
      { min: 25, unitPrice: 17.9 },
      { min: 100, unitPrice: 14.5 },
      { min: 500, unitPrice: 12.2 },
    ],
    customizable: true,
  },
  {
    slug: "tour-de-cou",
    name: "Tour de cou porte-badge",
    category: "bureau-entreprise",
    kind: "lanyard",
    short: "Sangle 20 mm, mousqueton, attache de sécurité.",
    description:
      "Pour vos salons, séminaires et badges d'accès. Sangle polyester imprimée sur toute la longueur, mousqueton métal et attache de sécurité au cou.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Sarcelle", hex: "#0F766E" },
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Blanc", hex: "#F2F3F1" },
    ],
    moq: 100,
    leadTime: [10, 14],
    techniques: [{ id: "sublimation", label: "Impression sur la sangle (sublimation)", setupFee: 40, unitCost: 0.5 }],
    zones: [{ id: "sangle", view: "front", label: "Sangle", widthMm: 20, heightMm: 115, box: { x: 137, y: 70, w: 26, h: 150 } }],
    tiers: [
      { min: 100, unitPrice: 1.9 },
      { min: 500, unitPrice: 1.2 },
      { min: 1000, unitPrice: 0.95 },
    ],
    customizable: true,
  },
  {
    slug: "sac-ordinateur",
    name: "Sac à dos ordinateur",
    category: "bureau-entreprise",
    kind: "sac",
    short: "Compartiment 15,6 pouces rembourré, tissu déperlant.",
    description:
      "Un sac sobre et solide pour vos équipes nomades. Compartiment ordinateur rembourré, poche avant organisée, dos respirant. Logo brodé ou imprimé.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Noir", hex: "#1B1C1F" },
      { name: "Ardoise", hex: "#475569" },
    ],
    moq: 20,
    leadTime: [12, 18],
    techniques: [broderie, dtf],
    zones: [{ id: "face", view: "front", label: "Face avant", widthMm: 120, heightMm: 85, box: { x: 150, y: 130, w: 100, h: 70 } }],
    tiers: [
      { min: 20, unitPrice: 34 },
      { min: 50, unitPrice: 29 },
      { min: 100, unitPrice: 25.5 },
      { min: 250, unitPrice: 22.9 },
    ],
    customizable: true,
  },
  {
    slug: "kit-teletravail",
    name: "Kit Télétravail",
    category: "kits-bienvenue",
    kind: "pack",
    short: "Tasse isotherme, carnet, stylo, tapis de souris et batterie externe.",
    description:
      "Tout le bureau à la maison, aux couleurs de votre entreprise. Chaque article est marqué de votre logo et l'ensemble est livré assemblé, prêt à envoyer à vos salariés.",
    colors: [
      { name: "Bleu nuit", hex: "#1E2A44" },
      { name: "Kraft", hex: "#D9C3A0" },
    ],
    moq: 20,
    leadTime: [12, 18],
    techniques: [{ id: "multi", label: "Marquage logo sur chaque article", setupFee: 150, unitCost: 5.5 }],
    zones: [{ id: "boite", view: "front", label: "Couvercle de la boîte", widthMm: 150, heightMm: 100, box: { x: 125, y: 200, w: 150, h: 100 } }],
    tiers: [
      { min: 20, unitPrice: 59 },
      { min: 50, unitPrice: 52 },
      { min: 100, unitPrice: 46 },
      { min: 250, unitPrice: 41 },
    ],
    customizable: true,
    includes: ["Tasse isotherme 35 cl", "Carnet A5", "Stylo métal gravé", "Tapis de souris", "Batterie externe 10 000 mAh", "Boîte personnalisée"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
