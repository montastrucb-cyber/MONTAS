import { ImageResponse } from "next/og";
import { site } from "@/config/site";

// Image affichée quand on partage le site sur LinkedIn, WhatsApp, Facebook, X…
export const alt = `${site.name} : goodies et textile personnalisés, en gros, pour les pros`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0B1220",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(94,234,212,0.35), transparent 45%), radial-gradient(circle at 0% 100%, rgba(165,180,252,0.18), transparent 45%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#111A2E",
              border: "2px solid rgba(94,234,212,0.6)",
              color: "#5EEAD4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            AS
          </div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, maxWidth: 950 }}>
            Vos goodies à vos couleurs, en gros.
          </div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
            Personnalisez avec votre logo · Prix dégressifs · Paiement ou devis
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Entreprises", "Associations", "Clubs", "Écoles"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 24,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
