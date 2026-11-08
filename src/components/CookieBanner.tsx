"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Analytics } from "@vercel/analytics/next";
import { Cookie } from "lucide-react";
import { CONSENT_OPEN_EVENT, setConsent, useConsent } from "@/lib/consent";

/**
 * Bandeau de consentement : « Tout refuser » aussi visible que « Accepter »
 * (recommandation CNIL). La mesure d'audience n'est chargée qu'après accord.
 */
export function CookieBanner() {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const visible = consent === null || reopened;

  function choose(analytics: boolean) {
    setConsent(analytics);
    setReopened(false);
  }

  return (
    <>
      {consent?.analytics && <Analytics />}
      <AnimatePresence>
        {visible && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_60px_-20px_rgba(10,12,16,0.35)] sm:bottom-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Cookie size={18} aria-hidden="true" />
              </span>
              <div>
                <p id="cookie-title" className="font-medium">Votre vie privée</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Nous aimerions mesurer l&apos;audience du site (pages vues, de façon anonyme) pour l&apos;améliorer. Le
                  panier et vos projets restent enregistrés sur votre appareil, ce qui est nécessaire au fonctionnement
                  du site.{" "}
                  <Link href="/confidentialite#cookies" className="font-medium text-accent underline">
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => choose(false)}
                className="min-h-11 rounded-full border border-ink/15 bg-surface px-4 text-sm font-medium transition hover:border-ink/40"
              >
                Tout refuser
              </button>
              <button
                onClick={() => choose(true)}
                className="min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85"
              >
                Accepter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className={className}
    >
      Gérer les cookies
    </button>
  );
}
