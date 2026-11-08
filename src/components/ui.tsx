import Link from "next/link";
import clsx from "clsx";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("mx-auto max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={clsx("inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent", className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </p>
  );
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={clsx("text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-[2.6rem] sm:leading-[1.08]", className)}>{children}</h2>;
}

/** Mot mis en valeur en dégradé. `onDark` pour les sections sombres. */
export function Glow({ children, onDark }: { children: React.ReactNode; onDark?: boolean }) {
  return onDark ? (
    <span className="text-gradient">{children}</span>
  ) : (
    <span className="bg-gradient-to-r from-accent to-sky-700 bg-clip-text text-transparent">{children}</span>
  );
}

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light" | "ghost-dark";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className }: BtnProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition duration-200 active:scale-[0.98]",
        variant === "primary" && "bg-ink text-white hover:bg-ink/85",
        variant === "secondary" && "border border-ink/15 bg-surface text-ink hover:border-ink/40",
        variant === "light" && "btn-glow bg-glow text-ink hover:brightness-105",
        variant === "ghost-dark" && "text-white/80 hover:text-white",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</div>;
}
