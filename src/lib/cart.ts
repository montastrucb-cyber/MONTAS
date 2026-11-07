"use client";

// Panier de démonstration stocké dans le navigateur (localStorage).
// Plus tard : panier côté serveur + paiement Stripe Checkout.

import { useSyncExternalStore } from "react";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  color: string;
  size?: string;
  techniqueId?: string;
  qty: number;
  /** Nombre de zones marquées */
  zones?: number;
  /** Aperçu (image basse définition) — ce n'est PAS un fichier de production */
  previewDataUrl?: string;
};

const KEY = "demo-cart-v1";
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* stockage plein ou bloqué : on garde en mémoire */
  }
  listeners.forEach((l) => l());
}

const EMPTY: CartLine[] = [];

export function useCart() {
  const lines = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
  return {
    lines,
    add: (line: Omit<CartLine, "id">) => write([...read(), { ...line, id: crypto.randomUUID() }]),
    remove: (id: string) => write(read().filter((l) => l.id !== id)),
    setQty: (id: string, qty: number) => write(read().map((l) => (l.id === id ? { ...l, qty } : l))),
    clear: () => write([]),
  };
}
