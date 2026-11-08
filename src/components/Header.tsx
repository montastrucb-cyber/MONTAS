"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { nav, site } from "@/config/site";
import { useCart } from "@/lib/cart";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-xl bg-night font-mono text-[12px] text-lime shadow-[0_0_20px_-4px_rgba(198,242,78,0.6)]">AS</span>
      <span className="font-display text-[17px]">{site.name}</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lines } = useCart();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        open ? "border-b border-line bg-background" : scrolled ? "glass-light border-x-0 border-t-0" : "border-b border-transparent bg-background"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/panier"
            className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
            aria-label={`Panier (${lines.length})`}
          >
            <ShoppingBag size={19} aria-hidden="true" />
            {lines.length > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {lines.length}
              </span>
            )}
          </Link>
          <Link
            href="/personnaliser"
            className="hidden min-h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85 sm:inline-flex"
          >
            Personnaliser
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Navigation mobile" className="border-t border-line px-4 pb-6 pt-2 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 text-[15px]">
              {n.label}
            </Link>
          ))}
          <Link
            href="/personnaliser"
            onClick={() => setOpen(false)}
            className="mt-5 flex justify-center rounded-full bg-ink px-4 py-3 text-sm font-medium text-white"
          >
            Personnaliser mon produit
          </Link>
        </nav>
      )}
    </header>
  );
}
