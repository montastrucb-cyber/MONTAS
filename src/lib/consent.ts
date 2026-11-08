"use client";

// Consentement cookies / traceurs, stocké dans le navigateur.
// Rien n'est chargé (analytics) tant que le visiteur n'a pas accepté.

import { useSyncExternalStore } from "react";

export type Consent = { analytics: boolean; date: string };

const KEY = "consent-v1";
const OPEN_EVENT = "consent:open";
const listeners = new Set<() => void>();
let cache: Consent | null | undefined;

function read(): Consent | null {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    cache = null;
  }
  return cache ?? null;
}

export function setConsent(analytics: boolean) {
  cache = { analytics, date: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* stockage bloqué : le choix vaut pour la visite en cours */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** undefined = pas encore lu (rendu serveur), null = pas encore choisi */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function openConsentPanel() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export const CONSENT_OPEN_EVENT = OPEN_EVENT;
