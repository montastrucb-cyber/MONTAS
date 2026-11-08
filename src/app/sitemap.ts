import type { MetadataRoute } from "next";
import { categories, products } from "@/data/catalog";
import { siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/produits", priority: 0.9, freq: "weekly" },
    { path: "/personnaliser", priority: 0.9, freq: "monthly" },
    { path: "/devis", priority: 0.7, freq: "monthly" },
    { path: "/mentions-legales", priority: 0.2, freq: "yearly" },
    { path: "/cgv", priority: 0.2, freq: "yearly" },
    { path: "/cgu", priority: 0.2, freq: "yearly" },
    { path: "/confidentialite", priority: 0.2, freq: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: `${base}${p.path}`, changeFrequency: p.freq, priority: p.priority })),
    ...categories.map((c) => ({ url: `${base}/produits?categorie=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/produits/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
