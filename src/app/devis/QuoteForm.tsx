"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Mail } from "lucide-react";
import clsx from "clsx";
import { products } from "@/data/catalog";
import { site } from "@/config/site";
import { HONEYPOT_FIELD, ORG_TYPES, TIMESTAMP_FIELD, quoteSchema } from "@/lib/quote-schema";

type Errors = Partial<Record<string, string>>;

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  organization: "Organisation",
  email: "Email",
  phone: "Téléphone",
  orgType: "Type",
  product: "Produit",
  quantity: "Quantité",
  date: "Date souhaitée",
  message: "Projet",
};

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    name: String(fd.get("name") ?? ""),
    organization: String(fd.get("organization") ?? ""),
    email: String(fd.get("email") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    orgType: String(fd.get("orgType") ?? ""),
    product: String(fd.get("product") ?? ""),
    quantity: String(fd.get("quantity") ?? ""),
    date: String(fd.get("date") ?? ""),
    message: String(fd.get("message") ?? ""),
    consent: fd.get("consent") === "on",
    [HONEYPOT_FIELD]: String(fd.get(HONEYPOT_FIELD) ?? ""),
  };
}

function validate(data: ReturnType<typeof collect>): Errors {
  const r = quoteSchema.safeParse(data);
  if (r.success) return {};
  const e: Errors = {};
  for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
  return e;
}

export function QuoteForm({ initialProduct, initialQty }: { initialProduct?: string; initialQty?: string }) {
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ delivered: boolean; summary: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function revalidate(field?: string) {
    if (!formRef.current) return;
    const e = validate(collect(formRef.current));
    setErrors(e);
    if (field) setTouched((t) => ({ ...t, [field]: true }));
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = collect(form);
    const e = validate(data);
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(FIELD_LABELS).concat("consent").map((k) => [k, true])));
    if (Object.keys(e).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, [TIMESTAMP_FIELD]: startedAt }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 422 && json.fieldErrors) {
        setErrors(json.fieldErrors);
        setStatus("idle");
        return;
      }
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Une erreur est survenue. Réessayez dans un instant.");
        setStatus("error");
        return;
      }
      const summary = Object.entries(FIELD_LABELS)
        .map(([k, label]) => [label, String(data[k as keyof typeof data] ?? "")] as const)
        .filter(([, v]) => v)
        .map(([l, v]) => `${l} : ${v}`)
        .join("\n");
      setDone({ delivered: !!json.delivered, summary });
    } catch {
      setServerError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setStatus("error");
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8" role="status">
        <CheckCircle2 className="text-accent" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">Merci, votre demande est bien prise en compte</h2>
        {done.delivered ? (
          <p className="mt-2 text-ink-soft">Nous revenons vers vous avec un devis détaillé.</p>
        ) : (
          <>
            <p className="mt-2 text-ink-soft">
              L&apos;envoi automatique par email n&apos;est pas encore activé sur ce site. Pour être sûr qu&apos;elle nous
              parvienne, envoyez-la aussi depuis votre messagerie :
            </p>
            <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-muted p-4 text-sm text-ink-soft">{done.summary}</pre>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("Demande de devis")}&body=${encodeURIComponent(done.summary)}`}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white"
            >
              <Mail size={16} aria-hidden="true" /> Envoyer par email
            </a>
          </>
        )}
      </div>
    );
  }

  const err = (k: string) => (touched[k] ? errors[k] : undefined);

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="relative space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      {/* Champ piège anti-robots : invisible pour les humains */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom et prénom" name="name" autoComplete="name" required error={err("name")} onBlur={revalidate} />
        <Field label="Organisation" name="organization" autoComplete="organization" required error={err("organization")} onBlur={revalidate} />
        <Field label="Email professionnel" name="email" type="email" autoComplete="email" required error={err("email")} onBlur={revalidate} />
        <Field label="Téléphone" hint="Optionnel" name="phone" type="tel" autoComplete="tel" error={err("phone")} onBlur={revalidate} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Vous êtes" name="orgType" options={[...ORG_TYPES]} error={err("orgType")} onBlur={revalidate} />
        <Select
          label="Produit principal"
          name="product"
          options={["Plusieurs produits / je ne sais pas encore", ...products.map((p) => p.name)]}
          defaultValue={products.find((p) => p.slug === initialProduct)?.name}
          onBlur={revalidate}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Quantité totale estimée" name="quantity" type="number" inputMode="numeric" min={1} defaultValue={initialQty} required error={err("quantity")} onBlur={revalidate} />
        <Field label="Date de livraison souhaitée" hint="Optionnel" name="date" type="date" error={err("date")} onBlur={revalidate} />
      </div>
      <FieldShell label="Votre projet" name="message" required error={err("message")} hint="Produits, couleurs, tailles, technique de marquage, budget…">
        <textarea
          id="f-message"
          name="message"
          rows={5}
          required
          maxLength={4000}
          aria-invalid={!!err("message")}
          aria-describedby={err("message") ? "e-message" : "h-message"}
          onBlur={() => revalidate("message")}
          className={inputClass(!!err("message"))}
        />
      </FieldShell>
      <div>
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={!!err("consent")}
            aria-describedby={err("consent") ? "e-consent" : undefined}
            onChange={() => revalidate("consent")}
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            J&apos;accepte que mes informations soient utilisées pour traiter ma demande de devis, conformément à la{" "}
            <a href="/confidentialite" className="font-medium text-accent underline">politique de confidentialité</a>. *
          </span>
        </label>
        {err("consent") && <FieldError id="e-consent">{err("consent")}</FieldError>}
      </div>

      {serverError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {serverError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-60"
        >
          {status === "sending" && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        <p className="text-xs text-ink-faint">* Champs obligatoires</p>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return clsx(
    "mt-2 w-full rounded-xl border bg-background px-4 py-3 text-base outline-none transition focus:border-ink sm:text-sm",
    invalid ? "border-red-600" : "border-line",
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-700">
      <AlertTriangle size={14} aria-hidden="true" /> {children}
    </p>
  );
}

function FieldShell({
  label,
  name,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="text-sm font-medium">
        {label}
        {required && " *"}
        {hint && <span className="ml-2 font-normal text-ink-faint">{hint}</span>}
      </label>
      {hint && !error && <span id={`h-${name}`} className="sr-only">{hint}</span>}
      {children}
      {error && <FieldError id={`e-${name}`}>{error}</FieldError>}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  error,
  hint,
  onBlur,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
  onBlur: (field: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onBlur">) {
  return (
    <FieldShell label={label} name={name} required={required} hint={hint} error={error}>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        aria-describedby={error ? `e-${name}` : undefined}
        onBlur={() => onBlur(name)}
        className={inputClass(!!error)}
        {...rest}
      />
    </FieldShell>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
  error,
  onBlur,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  error?: string;
  onBlur: (field: string) => void;
}) {
  return (
    <FieldShell label={label} name={name} error={error}>
      <select
        id={`f-${name}`}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        onBlur={() => onBlur(name)}
        className={inputClass(!!error)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </FieldShell>
  );
}
