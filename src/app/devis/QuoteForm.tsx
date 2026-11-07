"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { products } from "@/data/catalog";
import { site } from "@/config/site";
import { DemoNotice } from "@/components/ui";

const orgTypes = ["Entreprise", "Association", "Club sportif", "École / établissement", "Organisateur d'événement", "Autre"];

export function QuoteForm({ initialProduct, initialQty }: { initialProduct?: string; initialQty?: string }) {
  const [sent, setSent] = useState<Record<string, string> | null>(null);

  if (sent) {
    const body = Object.entries(sent)
      .map(([k, v]) => `${k} : ${v}`)
      .join("\n");
    return (
      <div className="rounded-3xl border border-line bg-surface p-8">
        <CheckCircle2 className="text-accent" />
        <h2 className="mt-4 text-xl font-semibold">Votre demande est prête</h2>
        <p className="mt-2 text-ink-soft">
          L&apos;envoi automatique n&apos;est pas encore branché. En attendant, vous pouvez envoyer cette demande par email.
        </p>
        <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-muted p-4 text-sm text-ink-soft">{body}</pre>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent("Demande de devis")}&body=${encodeURIComponent(body)}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
        >
          <Mail size={16} /> Envoyer par email
        </a>
        <button onClick={() => setSent(null)} className="ml-3 text-sm text-ink-soft underline">
          Modifier
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
        setSent(Object.fromEntries(Object.entries(data).filter(([, v]) => v)));
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom et prénom" name="Nom" required />
        <Field label="Organisation" name="Organisation" required />
        <Field label="Email professionnel" name="Email" type="email" required />
        <Field label="Téléphone (optionnel)" name="Téléphone" type="tel" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Vous êtes" name="Type" options={orgTypes} />
        <Select
          label="Produit principal"
          name="Produit"
          options={["Plusieurs produits / je ne sais pas encore", ...products.map((p) => p.name)]}
          defaultValue={products.find((p) => p.slug === initialProduct)?.name}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Quantité totale estimée" name="Quantité" type="number" defaultValue={initialQty} required />
        <Field label="Date de livraison souhaitée" name="Date souhaitée" type="date" />
      </div>
      <label className="block">
        <span className="text-sm font-medium">Votre projet</span>
        <textarea
          name="Projet"
          rows={5}
          required
          placeholder="Produits, couleurs, tailles, technique de marquage, budget…"
          className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" required className="mt-1 accent-[var(--accent)]" />
        <span>
          J&apos;accepte que mes informations soient utilisées pour traiter ma demande de devis, conformément à la{" "}
          <a href="/confidentialite" className="underline">politique de confidentialité</a>.
        </span>
      </label>
      <button className="w-full rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-white transition hover:bg-ink/85 sm:w-auto">
        Envoyer ma demande
      </button>
      <DemoNotice>Formulaire de démonstration : rien n&apos;est encore enregistré sur un serveur.</DemoNotice>
    </form>
  );
}

function Field({ label, name, type = "text", required, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: string[]; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-ink"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
