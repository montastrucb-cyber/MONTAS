"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as KImage, Layer, Stage, Text as KText, Transformer } from "react-konva";
import type Konva from "konva";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  ImagePlus,
  RotateCcw,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { products, type MarkingZone, type Product, type View } from "@/data/catalog";
import { ProductVisual, isDark } from "@/components/ProductVisual";
import { QuoteBreakdown, TierTable } from "@/components/PriceSummary";
import { computeQuote } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import {
  ACCEPTED_TYPES,
  MAX_FILE_BYTES,
  imageQuality,
  loadProject,
  saveProject,
  sizeMm,
  type DesignElement,
} from "@/lib/design";

const BASE = 400; // repère du visuel
const FONTS = [
  { label: "Sans", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
  { label: "Mono", value: "'Courier New', monospace" },
];

function useHtmlImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
}

function readFile(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new window.Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export default function Designer({ initialSlug, initialColor }: { initialSlug?: string; initialColor?: string }) {
  const router = useRouter();
  const { add } = useCart();
  const customizable = products.filter((p) => p.customizable);
  const [product, setProduct] = useState<Product>(customizable.find((p) => p.slug === initialSlug) ?? customizable[0]);
  // Projet sauvegardé sur cet appareil (le composant ne tourne que dans le navigateur)
  const [initialSaved] = useState(() => loadProject(product.slug));
  const [color, setColor] = useState(
    product.colors.find((c) => c.hex === (initialColor ?? initialSaved?.colorHex)) ?? product.colors[0],
  );
  const [view, setView] = useState<View>("front");
  const [zoneId, setZoneId] = useState(product.zones[0].id);
  const [elements, setElements] = useState<DesignElement[]>(initialSaved?.elements ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [qty, setQty] = useState(product.moq);
  const [techniqueId, setTechniqueId] = useState(product.techniques[0].id);
  const [textDraft, setTextDraft] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState(400);
  const scale = size / BASE;

  const zonesForView = product.zones.filter((z) => z.view === view);
  const zone = product.zones.find((z) => z.id === zoneId) ?? zonesForView[0] ?? product.zones[0];
  const zoneById = useCallback((id: string) => product.zones.find((z) => z.id === id)!, [product]);
  const visible = elements.filter((e) => e.view === view);
  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const views = Array.from(new Set(product.zones.map((z) => z.view)));

  // Taille responsive du canevas
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Attacher le cadre de redimensionnement à l'élément sélectionné
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = selectedId ? stage.findOne(`#${selectedId}`) : null;
    tr.nodes(node && selected?.view === view ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, selected?.view, view, elements]);

  function changeProduct(slug: string) {
    const p = customizable.find((x) => x.slug === slug)!;
    const saved = loadProject(p.slug);
    setProduct(p);
    setElements(saved?.elements ?? []);
    setSelectedId(null);
    setColor(p.colors.find((c) => c.hex === saved?.colorHex) ?? p.colors[0]);
    setView("front");
    setZoneId(p.zones[0].id);
    setQty(p.moq);
    setTechniqueId(p.techniques[0].id);
    setError(null);
  }

  function changeView(v: View) {
    setView(v);
    setSelectedId(null);
    const z = product.zones.find((x) => x.view === v);
    if (z) setZoneId(z.id);
  }

  function update(id: string, patch: Partial<DesignElement>) {
    setElements((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  /** Garde l'élément entièrement dans sa zone de marquage */
  function clamp(el: Pick<DesignElement, "x" | "y" | "width" | "height">, z: MarkingZone) {
    const w = Math.min(el.width, z.box.w);
    const h = Math.min(el.height, z.box.h);
    return {
      x: Math.min(Math.max(el.x, z.box.x), z.box.x + z.box.w - w),
      y: Math.min(Math.max(el.y, z.box.y), z.box.y + z.box.h - h),
    };
  }

  async function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format non accepté. Utilisez un fichier PNG, JPG ou SVG. Pour un fichier AI, EPS ou PDF, demandez un devis.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Fichier trop lourd (10 Mo maximum).");
      return;
    }
    try {
      const src = await readFile(file);
      const img = await loadImage(src);
      const nw = img.naturalWidth || 1000;
      const nh = img.naturalHeight || 1000;
      const ratio = nw / nh;
      let w = zone.box.w * 0.7;
      let h = w / ratio;
      if (h > zone.box.h * 0.7) {
        h = zone.box.h * 0.7;
        w = h * ratio;
      }
      const el: DesignElement = {
        id: `el-${crypto.randomUUID().slice(0, 8)}`,
        type: "image",
        view,
        zoneId: zone.id,
        x: zone.box.x + (zone.box.w - w) / 2,
        y: zone.box.y + (zone.box.h - h) / 2,
        width: w,
        height: h,
        src,
        fileName: file.name,
        fileSize: file.size,
        mime: file.type,
        naturalWidth: nw,
        naturalHeight: nh,
      };
      setElements((els) => [...els, el]);
      setSelectedId(el.id);
    } catch {
      setError("Impossible de lire ce fichier. Est-il endommagé ?");
    }
  }

  function addText() {
    const text = textDraft.trim();
    if (!text) return;
    const fontSize = Math.min(28, zone.box.h * 0.3);
    const width = Math.min(text.length * fontSize * 0.6, zone.box.w);
    const el: DesignElement = {
      id: `el-${crypto.randomUUID().slice(0, 8)}`,
      type: "text",
      view,
      zoneId: zone.id,
      x: zone.box.x + (zone.box.w - width) / 2,
      y: zone.box.y + (zone.box.h - fontSize) / 2,
      width,
      height: fontSize,
      text,
      fontSize,
      fontFamily: FONTS[0].value,
      fill: isDark(color.hex) ? "#FFFFFF" : "#0D0F12",
    };
    setElements((els) => [...els, el]);
    setSelectedId(el.id);
    setTextDraft("");
  }

  function centerSelected() {
    if (!selected) return;
    const z = zoneById(selected.zoneId);
    update(selected.id, { x: z.box.x + (z.box.w - selected.width) / 2, y: z.box.y + (z.box.h - selected.height) / 2 });
  }

  function reset() {
    setElements([]);
    setSelectedId(null);
    setError(null);
  }

  function save() {
    const ok = saveProject({ productSlug: product.slug, colorHex: color.hex, elements });
    setFlash(ok ? "Projet sauvegardé sur cet appareil." : "Sauvegarde impossible : fichiers trop lourds pour le navigateur.");
    setTimeout(() => setFlash(null), 3500);
  }

  /** Aperçu basse définition (produit + design) — PAS un fichier de production */
  async function makePreview(): Promise<string | undefined> {
    const stage = stageRef.current;
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!stage || !svg) return;
    trRef.current?.nodes([]);
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-zone]").forEach((n) => n.remove());
    clone.setAttribute("width", "400");
    clone.setAttribute("height", "400");
    const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#F1F1EC";
    ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(await loadImage(svgUrl), 0, 0, 400, 400);
    ctx.drawImage(stage.toCanvas({ pixelRatio: BASE / size }), 0, 0, 400, 400);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  const usedZones = new Set(elements.map((e) => e.zoneId)).size;
  const technique = product.techniques.find((t) => t.id === techniqueId);
  const quote = useMemo(() => computeQuote(product, qty, technique, Math.max(usedZones, 1)), [product, qty, technique, usedZones]);
  const lowQuality = elements.some((e) => e.type === "image" && imageQuality(e, zoneById(e.zoneId)).level === "low");

  async function addToCart() {
    setSelectedId(null);
    const preview = await makePreview().catch(() => undefined);
    saveProject({ productSlug: product.slug, colorHex: color.hex, elements });
    add({ slug: product.slug, name: `${product.name} personnalisé`, color: color.name, techniqueId, qty, zones: Math.max(usedZones, 1), previewDataUrl: preview });
    router.push("/panier");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ——— Canevas ——— */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div ref={wrapRef} className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-line bg-muted">
          <div ref={svgWrapRef} className="pointer-events-none absolute inset-0">
            <ProductVisual kind={product.kind} color={color.hex} view={view} className="h-full w-full" showZone={zone.view === view ? zone.box : null} />
          </div>
          <Stage
            ref={stageRef}
            width={size}
            height={size}
            scaleX={scale}
            scaleY={scale}
            className="absolute inset-0"
            onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}
            onTouchStart={(e) => e.target === e.target.getStage() && setSelectedId(null)}
          >
            <Layer>
              {visible.map((el) => (
                <ElementNode
                  key={el.id}
                  el={el}
                  zone={zoneById(el.zoneId)}
                  scale={scale}
                  onSelect={() => {
                    setSelectedId(el.id);
                    setZoneId(el.zoneId);
                  }}
                  onChange={(patch) => update(el.id, patch)}
                  clamp={clamp}
                />
              ))}
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorSize={10}
                anchorCornerRadius={5}
                borderStroke="#127A5B"
                anchorStroke="#127A5B"
                boundBoxFunc={(oldBox, newBox) => {
                  if (!selected) return newBox;
                  const z = zoneById(selected.zoneId).box;
                  const minPx = 8;
                  const inside =
                    newBox.x >= z.x * scale - 0.5 &&
                    newBox.y >= z.y * scale - 0.5 &&
                    newBox.x + newBox.width <= (z.x + z.w) * scale + 0.5 &&
                    newBox.y + newBox.height <= (z.y + z.h) * scale + 0.5;
                  return inside && newBox.width > minPx && newBox.height > minPx ? newBox : oldBox;
                }}
              />
            </Layer>
          </Stage>
          {elements.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center text-sm text-ink-faint">
              Importez un logo ou ajoutez un texte pour commencer
            </div>
          )}
          {views.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full border border-line bg-surface p-1 text-sm shadow-sm">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => changeView(v)}
                  className={clsx("rounded-full px-4 py-1.5 transition", view === v ? "bg-ink text-white" : "text-ink-soft")}
                >
                  {v === "front" ? "Devant" : "Dos"}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-faint">
            Aperçu à l&apos;écran. Le fichier d&apos;impression HD sera produit à part, à partir de votre fichier original.
          </p>
          <div className="flex gap-2">
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink/30">
              <RotateCcw size={14} /> Réinitialiser
            </button>
            <button onClick={save} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-ink/30">
              <Save size={14} /> Sauvegarder
            </button>
          </div>
        </div>
        {flash && <p className="mt-2 text-sm text-accent">{flash}</p>}
      </div>

      {/* ——— Panneau ——— */}
      <div className="space-y-7">
        <Panel title="1. Produit">
          <select
            value={product.slug}
            onChange={(e) => changeProduct(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-ink"
          >
            {customizable.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c)}
                title={c.name}
                aria-label={c.name}
                className={clsx("h-9 w-9 rounded-full ring-1 ring-black/10 transition", color.hex === c.hex && "ring-2 ring-ink ring-offset-2")}
                style={{ background: c.hex }}
              />
            ))}
            <span className="self-center text-sm text-ink-soft">{color.name}</span>
          </div>
        </Panel>

        <Panel title="2. Zone de marquage">
          <div className="flex flex-wrap gap-2">
            {product.zones.map((z) => (
              <button
                key={z.id}
                onClick={() => {
                  setZoneId(z.id);
                  if (z.view !== view) changeView(z.view);
                  setZoneId(z.id);
                }}
                className={clsx(
                  "rounded-full border px-3.5 py-1.5 text-sm transition",
                  zone.id === z.id ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink/30",
                )}
              >
                {z.label} · {z.widthMm / 10}×{z.heightMm / 10} cm
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="3. Votre logo et vos textes">
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
            className="flex w-full flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-surface px-4 py-6 text-center transition hover:border-accent hover:bg-accent-soft/40"
          >
            <ImagePlus size={22} className="text-accent" />
            <span className="mt-2 text-sm font-medium">Importer un logo ou une image</span>
            <span className="mt-1 text-xs text-ink-faint">PNG, JPG ou SVG · 10 Mo max · SVG recommandé</span>
          </button>
          {error && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addText()}
              placeholder="Ajouter un texte (ex. nom du club)"
              maxLength={60}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
            <button
              onClick={addText}
              disabled={!textDraft.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-medium text-white disabled:opacity-30"
            >
              <Type size={15} /> Ajouter
            </button>
          </div>

          {elements.length > 0 && (
            <ul className="mt-4 space-y-2">
              {elements.map((el) => {
                const z = zoneById(el.zoneId);
                const mm = sizeMm(el, z);
                const q = el.type === "image" ? imageQuality(el, z) : null;
                return (
                  <li
                    key={el.id}
                    onClick={() => {
                      if (el.view !== view) changeView(el.view);
                      setSelectedId(el.id);
                      setZoneId(el.zoneId);
                    }}
                    className={clsx(
                      "cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition",
                      selectedId === el.id ? "border-ink bg-surface" : "border-line bg-surface/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{el.type === "image" ? el.fileName : `« ${el.text} »`}</span>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {z.label} · {(mm.w / 10).toFixed(1)} × {(mm.h / 10).toFixed(1)} cm
                      </span>
                    </div>
                    {q && q.label && (
                      <p
                        className={clsx(
                          "mt-1.5 flex items-center gap-1.5 text-xs",
                          q.level === "low" ? "text-amber-700" : "text-accent",
                        )}
                      >
                        {q.level === "low" ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                        {q.label}
                        {q.dpi && ` (${q.dpi} dpi)`}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {selected && (
            <div className="mt-4 rounded-2xl bg-muted p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Élément sélectionné</p>
              {selected.type === "text" && (
                <div className="mt-3 space-y-3">
                  <input
                    value={selected.text}
                    onChange={(e) => update(selected.id, { text: e.target.value })}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {FONTS.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => update(selected.id, { fontFamily: f.value })}
                        style={{ fontFamily: f.value }}
                        className={clsx(
                          "rounded-lg border px-3 py-1 text-sm",
                          selected.fontFamily === f.value ? "border-ink bg-surface" : "border-line",
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                    <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
                      Couleur
                      <input
                        type="color"
                        value={selected.fill}
                        onChange={(e) => update(selected.id, { fill: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                      />
                    </label>
                  </div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={centerSelected} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
                  <Crosshair size={14} /> Centrer
                </button>
                <button
                  onClick={() => {
                    setElements((els) => els.filter((e) => e.id !== selected.id));
                    setSelectedId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-red-700"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-faint">Déplacez et redimensionnez l&apos;élément directement sur l&apos;aperçu.</p>
            </div>
          )}
        </Panel>

        <Panel title="4. Quantité et prix">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={product.moq}
              value={qty}
              onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-32 rounded-xl border border-line bg-surface px-4 py-2.5 font-medium outline-none focus:border-ink"
            />
            <select
              value={techniqueId}
              onChange={(e) => setTechniqueId(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink"
            >
              {product.techniques.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <TierTable product={product} qty={qty} />
          </div>
          <div className="mt-4">
            <QuoteBreakdown quote={quote} belowMoq={qty < product.moq} moq={product.moq} />
          </div>
          {usedZones > 1 && <p className="mt-2 text-xs text-ink-soft">{usedZones} zones marquées : marquage et préparation comptés par zone.</p>}
          {lowQuality && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Un de vos fichiers est de faible résolution. Vous pouvez continuer : notre équipe vérifiera le fichier avant
              production et vous contactera si besoin.
            </p>
          )}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={addToCart}
              disabled={qty < product.moq || elements.length === 0}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-30"
            >
              Ajouter au panier
            </button>
            <Link
              href={`/devis?produit=${product.slug}&quantite=${qty}`}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-line bg-surface px-5 py-3.5 text-sm font-medium hover:border-ink/30"
            >
              Demander un devis
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

function ElementNode({
  el,
  zone,
  scale,
  onSelect,
  onChange,
  clamp,
}: {
  el: DesignElement;
  zone: MarkingZone;
  scale: number;
  onSelect: () => void;
  onChange: (p: Partial<DesignElement>) => void;
  clamp: (el: Pick<DesignElement, "x" | "y" | "width" | "height">, z: MarkingZone) => { x: number; y: number };
}) {
  const img = useHtmlImage(el.src);
  const textRef = useRef<Konva.Text>(null);

  // Mesure réelle du texte (largeur / hauteur) après rendu
  useEffect(() => {
    if (el.type !== "text" || !textRef.current) return;
    const w = textRef.current.width();
    const h = textRef.current.height();
    if (Math.abs(w - el.width) > 0.5 || Math.abs(h - el.height) > 0.5) {
      const fit = Math.min(1, zone.box.w / w, zone.box.h / h);
      if (fit < 1) onChange({ fontSize: (el.fontSize ?? 20) * fit * 0.98 });
      else onChange({ width: w, height: h, ...clamp({ ...el, width: w, height: h }, zone) });
    }
  });

  const common = {
    id: el.id,
    x: el.x,
    y: el.y,
    draggable: true,
    onMouseDown: onSelect,
    onTap: onSelect,
    onDragStart: onSelect,
    dragBoundFunc(pos: { x: number; y: number }) {
      // pos est en pixels écran : on convertit vers le repère 400
      const c = clamp({ x: pos.x / scale, y: pos.y / scale, width: el.width, height: el.height }, zone);
      return { x: c.x * scale, y: c.y * scale };
    },
    onDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd(e: Konva.KonvaEventObject<Event>) {
      const node = e.target;
      const sx = node.scaleX();
      node.scaleX(1);
      node.scaleY(1);
      if (el.type === "image") {
        const width = el.width * sx;
        const height = el.height * sx;
        onChange({ width, height, ...clamp({ x: node.x(), y: node.y(), width, height }, zone) });
      } else {
        onChange({ x: node.x(), y: node.y(), fontSize: (el.fontSize ?? 20) * sx });
      }
    },
  };

  if (el.type === "image") {
    return img ? <KImage {...common} image={img} width={el.width} height={el.height} /> : null;
  }
  return (
    <KText
      {...common}
      ref={textRef}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle="bold"
      fill={el.fill}
    />
  );
}
