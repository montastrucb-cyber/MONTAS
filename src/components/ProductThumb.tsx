import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/data/catalog";

/**
 * Miniature 3D d'un produit : rendu du modèle 3D, généré par « npm run thumbnails »
 * et compressé en WebP (puis AVIF/WebP à la volée par next/image).
 */
export function ProductThumb({ product, className, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw", priority }: { product: Product; className?: string; sizes?: string; priority?: boolean }) {
  return (
    <Image
      src={`/thumbs/${product.slug}.webp`}
      alt={`${product.name}, coloris ${product.colors[0].name}, vue 3D`}
      width={720}
      height={720}
      sizes={sizes}
      priority={priority}
      className={clsx("h-full w-full object-contain", className)}
    />
  );
}
