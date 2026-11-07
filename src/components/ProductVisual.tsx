import type { View, VisualKind } from "@/data/catalog";

/** Indique si une couleur est foncée (pour adapter les détails du dessin). */
export function isDark(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

type Props = {
  kind: VisualKind;
  color: string;
  view?: View;
  className?: string;
  showZone?: { x: number; y: number; w: number; h: number } | null;
};

/**
 * Illustrations vectorielles maison des produits (repère 400 × 400).
 * À remplacer plus tard par de vraies photos ou des gabarits fournisseurs.
 */
export function ProductVisual({ kind, color, view = "front", className, showZone }: Props) {
  const dark = isDark(color);
  const line = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
  const shade = dark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.06)";
  const id = `g-${kind}-${color.replace("#", "")}-${view}`;

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.08 : 0.35} />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.25 : 0.08} />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="372" rx="130" ry="10" fill="rgba(0,0,0,0.07)" />
      <Shape kind={kind} view={view} color={color} line={line} shade={shade} grad={`url(#${id})`} />
      {showZone && (
        <rect
          data-zone="1"
          x={showZone.x}
          y={showZone.y}
          width={showZone.w}
          height={showZone.h}
          rx="4"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.6)" : "rgba(20,40,30,0.45)"}
          strokeDasharray="6 5"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

function Shape({
  kind,
  view,
  color,
  line,
  shade,
  grad,
}: {
  kind: VisualKind;
  view: View;
  color: string;
  line: string;
  shade: string;
  grad: string;
}) {
  const common = { stroke: line, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (kind) {
    case "tshirt": {
      const neck = view === "front" ? "Q230 96 200 96 Q170 96 140 60" : "Q230 76 200 76 Q170 76 140 60";
      const d = `M140 60 L98 74 L40 122 L74 176 L110 156 L110 346 Q200 356 290 346 L290 156 L326 176 L360 122 L302 74 L260 60 ${neck} Z`;
      return (
        <g>
          <path d={d} fill={color} {...common} />
          <path d={d} fill={grad} />
          <path d={view === "front" ? "M146 64 Q200 112 254 64" : "M146 62 Q200 90 254 62"} fill="none" stroke={line} strokeWidth="5" />
          <path d="M110 156 L110 190 M290 156 L290 190" stroke={shade} strokeWidth="2" />
        </g>
      );
    }
    case "sweat": {
      const d =
        "M142 72 L96 88 L54 160 L38 300 L78 308 L108 196 L108 350 Q200 360 292 350 L292 196 L322 308 L362 300 L346 160 L304 88 L258 72 Q230 100 200 100 Q170 100 142 72 Z";
      return (
        <g>
          <path d={d} fill={color} {...common} />
          <path d={d} fill={grad} />
          {view === "front" ? (
            <>
              <path d="M142 72 Q150 30 200 28 Q250 30 258 72 Q230 112 200 112 Q170 112 142 72 Z" fill={color} {...common} />
              <path d="M142 72 Q150 30 200 28 Q250 30 258 72 Q230 112 200 112 Q170 112 142 72 Z" fill={shade} />
              <path d="M188 112 L186 160 M212 112 L214 160" stroke={line} strokeWidth="2" />
              <path d="M140 262 L260 262 L276 330 L124 330 Z" fill="none" stroke={line} strokeWidth="2" />
            </>
          ) : (
            <path d="M142 72 Q150 40 200 36 Q250 40 258 72 Q250 120 200 128 Q150 120 142 72 Z" fill={color} {...common} />
          )}
          <path d="M108 336 L292 336" stroke={line} strokeWidth="6" />
        </g>
      );
    }
    case "tote":
      return (
        <g>
          <path d="M150 160 C150 50 250 50 250 160" fill="none" stroke={color} strokeWidth="14" />
          <path d="M150 160 C150 50 250 50 250 160" fill="none" stroke={line} strokeWidth="14" strokeOpacity="0.5" />
          <rect x="104" y="150" width="192" height="200" rx="6" fill={color} {...common} />
          <rect x="104" y="150" width="192" height="200" rx="6" fill={grad} />
          <path d="M104 162 L296 162" stroke={line} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      );
    case "mug":
      return (
        <g>
          <path d="M268 170 C330 160 334 270 268 262" fill="none" stroke={color} strokeWidth="22" />
          <path d="M268 170 C330 160 334 270 268 262" fill="none" stroke={line} strokeWidth="22" strokeOpacity="0.6" />
          <rect x="112" y="128" width="170" height="182" rx="18" fill={color} {...common} />
          <rect x="112" y="128" width="170" height="182" rx="18" fill={grad} />
          <ellipse cx="197" cy="132" rx="85" ry="10" fill={shade} />
        </g>
      );
    case "gourde":
      return (
        <g>
          <rect x="178" y="58" width="44" height="44" rx="8" fill="#2A2B2F" />
          <rect x="182" y="100" width="36" height="16" fill={color} {...common} />
          <path d="M182 116 Q160 128 160 156 L160 340 Q160 356 176 356 L224 356 Q240 356 240 340 L240 156 Q240 128 218 116 Z" fill={color} {...common} />
          <path d="M182 116 Q160 128 160 156 L160 340 Q160 356 176 356 L224 356 Q240 356 240 340 L240 156 Q240 128 218 116 Z" fill={grad} />
          <rect x="168" y="150" width="8" height="190" rx="4" fill="#fff" opacity="0.18" />
        </g>
      );
    case "casquette":
      return (
        <g>
          <path d="M96 236 Q96 110 200 108 Q304 110 304 236 Z" fill={color} {...common} />
          <path d="M96 236 Q96 110 200 108 Q304 110 304 236 Z" fill={grad} />
          <path d="M200 108 L200 236 M150 118 Q130 170 134 236 M250 118 Q270 170 266 236" stroke={line} strokeWidth="2" fill="none" />
          <path d="M80 236 Q200 214 320 236 Q330 268 200 276 Q70 268 80 236 Z" fill={color} {...common} />
          <path d="M80 236 Q200 214 320 236 Q330 268 200 276 Q70 268 80 236 Z" fill={shade} />
          <circle cx="200" cy="110" r="6" fill={color} {...common} />
        </g>
      );
    case "carnet":
      return (
        <g>
          <rect x="146" y="92" width="122" height="184" rx="6" fill="#EDEAE2" transform="translate(6 6)" />
          <rect x="136" y="88" width="128" height="186" rx="8" fill={color} {...common} />
          <rect x="136" y="88" width="128" height="186" rx="8" fill={grad} />
          <rect x="136" y="88" width="14" height="186" rx="4" fill={shade} />
          <rect x="246" y="88" width="6" height="186" fill={line} />
        </g>
      );
    case "pack":
      return (
        <g>
          <path d="M92 160 L308 160 L308 330 Q308 340 298 340 L102 340 Q92 340 92 330 Z" fill={color} {...common} />
          <path d="M92 160 L308 160 L308 330 Q308 340 298 340 L102 340 Q92 340 92 330 Z" fill={grad} />
          <rect x="80" y="118" width="240" height="48" rx="6" fill={color} {...common} />
          <rect x="80" y="118" width="240" height="48" rx="6" fill={shade} />
          <path d="M200 118 L200 166" stroke={line} strokeWidth="2" />
        </g>
      );
  }
}
