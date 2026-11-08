import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panier",
  description: "Votre sélection de produits personnalisés, avec le détail des prix HT et TTC.",
  robots: { index: false, follow: true },
};

export default function PanierLayout({ children }: LayoutProps<"/panier">) {
  return children;
}
