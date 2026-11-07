import Link from "next/link";
import clsx from "clsx";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("mx-auto max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={clsx("text-xs font-medium uppercase tracking-[0.16em] text-accent", className)}>{children}</p>;
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={clsx("text-3xl font-semibold tracking-tight text-balance sm:text-4xl", className)}>{children}</h2>;
}

export function Serif({ children }: { children: React.ReactNode }) {
  return <span className="font-display font-normal italic tracking-normal">{children}</span>;
}

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className }: BtnProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.98]",
        variant === "primary" && "bg-ink text-white hover:bg-ink/85",
        variant === "secondary" && "border border-line bg-surface text-ink hover:border-ink/30",
        variant === "light" && "bg-lime text-ink hover:brightness-95",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</div>
  );
}
