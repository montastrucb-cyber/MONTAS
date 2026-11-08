import { z } from "zod";

// Règles de validation de la demande de devis.
// Partagées entre le navigateur (messages immédiats) et le serveur (contrôle
// définitif : on ne fait jamais confiance au navigateur).

export const ORG_TYPES = [
  "Entreprise",
  "Association",
  "Club sportif",
  "École / établissement",
  "Organisateur d'événement",
  "Autre",
] as const;

export const quoteSchema = z.object({
  name: z.string({ message: "Indiquez votre nom." }).trim().min(2, "Indiquez votre nom (2 caractères minimum).").max(80, "80 caractères maximum."),
  organization: z.string({ message: "Indiquez le nom de votre organisation." }).trim().min(2, "Indiquez le nom de votre organisation.").max(120, "120 caractères maximum."),
  email: z.string({ message: "Indiquez votre email." }).trim().email("Cette adresse email ne semble pas valide.").max(160),
  phone: z
    .string()
    .trim()
    .max(25)
    .refine((v) => v === "" || /^[+0-9 ().-]{6,25}$/.test(v), "Numéro de téléphone non valide.")
    .optional()
    .default(""),
  orgType: z.enum(ORG_TYPES, { message: "Choisissez un type d'organisation." }),
  product: z.string().trim().max(120).optional().default(""),
  quantity: z.coerce
    .number({ message: "Indiquez une quantité." })
    .int("Nombre entier uniquement.")
    .min(1, "Au moins 1 pièce.")
    .max(1_000_000, "Quantité trop élevée."),
  date: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Date non valide."),
  message: z.string({ message: "Décrivez votre projet." }).trim().min(20, "Décrivez votre projet en quelques phrases (20 caractères minimum).").max(4000, "4 000 caractères maximum."),
  consent: z.literal(true, { message: "Votre accord est nécessaire pour traiter la demande." }),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Champs anti-spam (non affichés au visiteur) */
export const HONEYPOT_FIELD = "website";
export const TIMESTAMP_FIELD = "startedAt";
export const MIN_FILL_MS = 3000;
