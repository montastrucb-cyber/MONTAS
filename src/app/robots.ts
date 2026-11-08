import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  // Tant que le site est en démonstration (adresse *.vercel.app ou locale), on
  // demande aux moteurs de recherche de ne pas l'indexer.
  const isDemo = !process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: isDemo
      ? [{ userAgent: "*", disallow: "/" }]
      : [{ userAgent: "*", allow: "/", disallow: ["/api/", "/panier"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
