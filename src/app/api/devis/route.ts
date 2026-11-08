import { NextResponse } from "next/server";
import { HONEYPOT_FIELD, MIN_FILL_MS, TIMESTAMP_FIELD, quoteSchema } from "@/lib/quote-schema";

// API côté serveur pour les demandes de devis.
// Les clés secrètes (RESEND_API_KEY) ne sont lues qu'ici, jamais dans le navigateur.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Limite simple en mémoire (par instance du serveur). À remplacer par un stockage
// partagé (base de données ou Redis) quand le trafic augmentera.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Trop de demandes. Réessayez dans quelques minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  // Anti-spam : champ piège rempli ou formulaire envoyé trop vite → on fait
  // semblant d'accepter, sans rien traiter (les robots ne savent pas qu'ils sont bloqués).
  const startedAt = Number(body[TIMESTAMP_FIELD]);
  if (body[HONEYPOT_FIELD] || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json({ ok: false, fieldErrors }, { status: 422 });
  }

  const q = parsed.data;
  const text = [
    `Nom : ${q.name}`,
    `Organisation : ${q.organization} (${q.orgType})`,
    `Email : ${q.email}`,
    q.phone && `Téléphone : ${q.phone}`,
    q.product && `Produit : ${q.product}`,
    `Quantité : ${q.quantity}`,
    q.date && `Date souhaitée : ${q.date}`,
    "",
    q.message,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    // Pas encore de service d'email configuré : on le signale au navigateur,
    // qui propose alors l'envoi par la messagerie du visiteur.
    console.info("[devis] Demande valide reçue, service email non configuré.");
    return NextResponse.json({ ok: true, delivered: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, reply_to: q.email, subject: `Demande de devis — ${q.organization}`, text }),
  });

  if (!res.ok) {
    console.error("[devis] Échec d'envoi de l'email", res.status);
    return NextResponse.json({ ok: false, error: "L'envoi a échoué. Réessayez ou écrivez-nous directement." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
