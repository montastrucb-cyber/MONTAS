"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as KImage, Layer, Line, Stage, Text as KText, Transformer } from "react-konva";
import type Konva from "konva";
import clsx from "clsx";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  Box,
  CheckCircle2,
  Copy,
  Crosshair,
  ImagePlus,
  Italic,
  Maximize2,
  PenTool,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { products, type MarkingZone, type Product, type View } from "@/data/catalog";
import { ProductVisual, isDark } from "@/components/ProductVisual";
import { QtyStepper, QuoteBreakdown, TierTable } from "@/components/PriceSummary";
import { computeQuote } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { Viewer3D } from "@/components/three/Viewer3D";
import { supports3D } from "@/components/three/support";
import {
  ACCEPTED_TYPES,
  MAX_FILE_BYTES,
  clampToZone,
  rotatedHalfExtents,
  imageQuality,
  loadProject,
  saveProject,
  sizeMm,
  type DesignElement,
} from "@/lib/design";

const BASE = 400; // repère du visuel
const FONTS = [
  { label: "Sans", value: "Arial, Helvetica, sans-serif" },
  { label: "Arrondie", value: "'Trebuchet MS', Verdana, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
  { label: "Mono", value: "'Courier New', monospace" },
];
const TEXT_COLORS = ["#0B1220", "#FFFFFF", "#0F766E", "#1E2A44", "#B91C1C", "#D97706", "#C9A227"];

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
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [guides, setGuides] = useState<Guides | null>(null);
  const [art3d, setArt3d] = useState<HTMLCanvasElement | null>(null);

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
    if (!supports3D(p.kind)) setMode("2d");
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

  /** Agrandit l'élément au maximum dans sa zone (en gardant ses proportions) */
  function fitSelected() {
    if (!selected) return;
    const z = zoneById(selected.zoneId);
    const { hw, hh } = rotatedHalfExtents(selected.width, selected.height, selected.rotation);
    const k = Math.min((z.box.w * 0.98) / (hw * 2), (z.box.h * 0.98) / (hh * 2));
    const width = selected.width * k;
    const height = selected.height * k;
    const patch: Partial<DesignElement> = { x: z.box.x + (z.box.w - width) / 2, y: z.box.y + (z.box.h - height) / 2 };
    if (selected.type === "image") Object.assign(patch, { width, height });
    else patch.fontSize = (selected.fontSize ?? 20) * k;
    update(selected.id, patch);
  }

  function rotateSelected(deg: number) {
    if (!selected) return;
    const rotation = (((selected.rotation ?? 0) + deg + 540) % 360) - 180;
    const z = zoneById(selected.zoneId);
    update(selected.id, { rotation, ...clampToZone({ ...selected, rotation }, z) });
  }

  function duplicateSelected() {
    if (!selected) return;
    const z = zoneById(selected.zoneId);
    const copy = { ...selected, id: `el-${crypto.randomUUID().slice(0, 8)}` };
    Object.assign(copy, clampToZone({ ...copy, x: copy.x + 8, y: copy.y + 8 }, z));
    setElements((els) => [...els, copy]);
    setSelectedId(copy.id);
  }

  /** Premier plan / arrière-plan */
  function moveLayer(toFront: boolean) {
    if (!selected) return;
    setElements((els) => {
      const rest = els.filter((e) => e.id !== selected.id);
      return toFront ? [...rest, selected] : [selected, ...rest];
    });
  }

  // ——— Aperçu 3D ———
  const can3D = supports3D(product.kind);
  const zone3D = product.zones[0];

  function enter3D() {
    setSelectedId(null);
    if (zone3D.view !== view) changeView(zone3D.view);
    setMode("3d");
  }

  // Après chaque modification, on « photographie » la zone de marquage pour la 3D
  useEffect(() => {
    if (mode !== "3d") return;
    const raf = requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;
      trRef.current?.nodes([]);
      const b = zone3D.box;
      const pixelRatio = Math.min(4, 1024 / (b.w * scale));
      setArt3d(stage.toCanvas({ x: b.x * scale, y: b.y * scale, width: b.w * scale, height: b.h * scale, pixelRatio }));
    });
    return () => cancelAnimationFrame(raf);
  }, [mode, elements, scale, zone3D, view]);

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
          <div
            ref={svgWrapRef}
            role="img"
            aria-label={`Aperçu de personnalisation : ${product.name}, coloris ${color.name}, ${visible.length} élément(s) placé(s)`}
            className="pointer-events-none absolute inset-0"
          >
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
                  onGuides={setGuides}
                />
              ))}
              {guides?.v && zone.view === view && (
                <Line points={[zone.box.x + zone.box.w / 2, zone.box.y, zone.box.x + zone.box.w / 2, zone.box.y + zone.box.h]} stroke="#0EA5E9" strokeWidth={1 / scale} dash={[4, 3]} listening={false} />
              )}
              {guides?.h && zone.view === view && (
                <Line points={[zone.box.x, zone.box.y + zone.box.h / 2, zone.box.x + zone.box.w, zone.box.y + zone.box.h / 2]} stroke="#0EA5E9" strokeWidth={1 / scale} dash={[4, 3]} listening={false} />
              )}
              <Transformer
                ref={trRef}
                rotateEnabled
                rotationSnaps={[0, 45, 90, 135, 180, -45, -90, -135]}
                rotationSnapTolerance={6}
                rotateAnchorOffset={22}
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorSize={10}
                anchorCornerRadius={5}
                borderStroke="#0F766E"
                anchorStroke="#0F766E"
                boundBoxFunc={(oldBox, newBox) => {
                  if (!selected) return newBox;
                  const z = zoneById(selected.zoneId).box;
                  if (newBox.width < 8 || newBox.height < 8) return oldBox;
                  // Les 4 coins de la boîte (éventuellement tournée) doivent rester dans la zone
                  const c = Math.cos(newBox.rotation);
                  const s = Math.sin(newBox.rotation);
                  const corners = [
                    [0, 0],
                    [newBox.width, 0],
                    [0, newBox.height],
                    [newBox.width, newBox.height],
                  ].map(([dx, dy]) => [newBox.x + dx * c - dy * s, newBox.y + dx * s + dy * c]);
                  const inside = corners.every(
                    ([x, y]) => x >= z.x * scale - 1 && y >= z.y * scale - 1 && x <= (z.x + z.w) * scale + 1 && y <= (z.y + z.h) * scale + 1,
                  );
                  return inside ? newBox : oldBox;
                }}
              />
            </Layer>
          </Stage>
          {elements.length === 0 && mode === "2d" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center text-sm text-ink-faint">
              Importez un logo ou ajoutez un texte pour commencer
            </div>
          )}
          {mode === "3d" && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#edf1f5_70%)]">
              <Viewer3D
                kind={product.kind}
                color={color.hex}
                zone={zone3D}
                art={art3d}
                label={`Aperçu 3D : ${product.name}, coloris ${color.name}, avec votre marquage`}
                className="absolute inset-0"
              />
              <p className="pointer-events-none absolute inset-x-0 bottom-16 text-center text-xs text-ink-faint">
                Faites glisser pour tourner · molette ou pincement pour zoomer
              </p>
            </div>
          )}
          {can3D && (
            <div className="absolute right-3 top-3 flex rounded-full border border-line bg-surface p-1 text-sm shadow-sm" role="group" aria-label="Mode d'affichage">
              <button
                onClick={() => setMode("2d")}
                aria-pressed={mode === "2d"}
                className={clsx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 transition", mode === "2d" ? "bg-ink text-white" : "text-ink-soft")}
              >
                <PenTool size={14} aria-hidden="true" /> Édition 2D
              </button>
              <button
                onClick={enter3D}
                aria-pressed={mode === "3d"}
                className={clsx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 transition", mode === "3d" ? "bg-ink text-white" : "text-ink-soft")}
              >
                <Box size={14} aria-hidden="true" /> Aperçu 3D
              </button>
            </div>
          )}
          {views.length > 1 && mode === "2d" && (
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
            aria-label="Produit à personnaliser"
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
              aria-label="Texte à ajouter"
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
                <div className="mt-3 space-y-4">
                  <input
                    aria-label="Modifier le texte"
                    value={selected.text}
                    maxLength={60}
                    onChange={(e) => update(selected.id, { text: e.target.value })}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Police">
                    {FONTS.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => update(selected.id, { fontFamily: f.value })}
                        aria-pressed={selected.fontFamily === f.value}
                        style={{ fontFamily: f.value }}
                        className={clsx("min-h-9 rounded-lg border px-3 text-sm", selected.fontFamily === f.value ? "border-ink bg-surface" : "border-line")}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ToolButton label="Gras" active={selected.bold !== false} onClick={() => update(selected.id, { bold: selected.bold === false })}>
                      <Bold size={15} aria-hidden="true" />
                    </ToolButton>
                    <ToolButton label="Italique" active={!!selected.italic} onClick={() => update(selected.id, { italic: !selected.italic })}>
                      <Italic size={15} aria-hidden="true" />
                    </ToolButton>
                    <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
                    <span className="text-xs text-ink-soft">Couleur</span>
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => update(selected.id, { fill: c })}
                        aria-label={`Couleur ${c}`}
                        aria-pressed={selected.fill?.toUpperCase() === c}
                        className={clsx("h-7 w-7 rounded-full ring-1 ring-black/15", selected.fill?.toUpperCase() === c && "ring-2 ring-ink ring-offset-1")}
                        style={{ background: c }}
                      />
                    ))}
                    <label className="ml-1 inline-flex items-center" title="Autre couleur">
                      <span className="sr-only">Autre couleur de texte</span>
                      <input type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })} className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent" />
                    </label>
                  </div>
                  <Slider
                    label="Taille du texte"
                    value={Math.round(selected.fontSize ?? 20)}
                    min={6}
                    max={Math.round(zoneById(selected.zoneId).box.h)}
                    onChange={(v) => update(selected.id, { fontSize: v })}
                  />
                  <Slider label="Espacement des lettres" value={selected.letterSpacing ?? 0} min={-2} max={20} onChange={(v) => update(selected.id, { letterSpacing: v })} />
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!selected.stroke}
                      onChange={(e) => update(selected.id, { stroke: e.target.checked ? (isDark(selected.fill ?? "#000") ? "#FFFFFF" : "#0B1220") : undefined })}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    Contour
                    {selected.stroke && (
                      <input type="color" aria-label="Couleur du contour" value={selected.stroke} onChange={(e) => update(selected.id, { stroke: e.target.value })} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                    )}
                  </label>
                </div>
              )}

              <div className="mt-4">
                <Slider
                  label="Rotation"
                  unit="°"
                  value={Math.round(selected.rotation ?? 0)}
                  min={-180}
                  max={180}
                  onChange={(v) => {
                    const z = zoneById(selected.zoneId);
                    update(selected.id, { rotation: v, ...clampToZone({ ...selected, rotation: v }, z) });
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ToolButton label="Centrer" onClick={centerSelected} wide>
                  <Crosshair size={14} aria-hidden="true" /> Centrer
                </ToolButton>
                <ToolButton label="Agrandir au maximum dans la zone" onClick={fitSelected} wide>
                  <Maximize2 size={14} aria-hidden="true" /> Ajuster
                </ToolButton>
                <ToolButton label="Tourner de 90°" onClick={() => rotateSelected(90)} wide>
                  <RotateCw size={14} aria-hidden="true" /> 90°
                </ToolButton>
                <ToolButton label="Dupliquer" onClick={duplicateSelected} wide>
                  <Copy size={14} aria-hidden="true" /> Dupliquer
                </ToolButton>
                <ToolButton label="Mettre au premier plan" onClick={() => moveLayer(true)} wide>
                  <ArrowUpToLine size={14} aria-hidden="true" /> Devant
                </ToolButton>
                <ToolButton label="Mettre à l'arrière-plan" onClick={() => moveLayer(false)} wide>
                  <ArrowDownToLine size={14} aria-hidden="true" /> Derrière
                </ToolButton>
                <button
                  onClick={() => {
                    setElements((els) => els.filter((e) => e.id !== selected.id));
                    setSelectedId(null);
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm text-red-700"
                >
                  <Trash2 size={14} aria-hidden="true" /> Supprimer
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                Sur l&apos;aperçu : glissez pour déplacer, tirez les coins pour redimensionner, la poignée du haut pour tourner.
                L&apos;élément s&apos;aimante au centre de la zone.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="4. Quantité et prix">
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} min={product.moq} />
            <select
              aria-label="Technique de marquage"
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
            <TierTable product={product} qty={qty} onPick={setQty} />
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

function ToolButton({
  label,
  active,
  wide,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  wide?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={wide ? undefined : label}
      title={label}
      aria-pressed={active}
      className={clsx(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border text-sm transition",
        wide ? "px-3" : "w-9",
        active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/30",
      )}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-ink-soft">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[var(--accent)]"
      />
    </label>
  );
}

type Guides = { v: boolean; h: boolean };
const SNAP = 4; // tolérance d'aimantation (repère 400)

function ElementNode({
  el,
  zone,
  scale,
  onSelect,
  onChange,
  onGuides,
}: {
  el: DesignElement;
  zone: MarkingZone;
  scale: number;
  onSelect: () => void;
  onChange: (p: Partial<DesignElement>) => void;
  onGuides: (g: Guides | null) => void;
}) {
  const img = useHtmlImage(el.src);
  const textRef = useRef<Konva.Text>(null);

  // Mesure réelle du texte (largeur / hauteur) après rendu
  useEffect(() => {
    if (el.type !== "text" || !textRef.current) return;
    const w = textRef.current.width();
    const h = textRef.current.height();
    if (Math.abs(w - el.width) > 0.5 || Math.abs(h - el.height) > 0.5) {
      const { hw, hh } = rotatedHalfExtents(w, h, el.rotation);
      const fit = Math.min(1, zone.box.w / (hw * 2), zone.box.h / (hh * 2));
      if (fit < 1) onChange({ fontSize: (el.fontSize ?? 20) * fit * 0.98 });
      else {
        // On garde le centre en place quand la taille du texte change
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        onChange({ width: w, height: h, ...clampToZone({ x: cx - w / 2, y: cy - h / 2, width: w, height: h, rotation: el.rotation }, zone) });
      }
    }
  });

  const zcx = zone.box.x + zone.box.w / 2;
  const zcy = zone.box.y + zone.box.h / 2;

  // Le point d'ancrage Konva est le centre de l'élément (rotation autour du centre)
  const common = {
    id: el.id,
    x: el.x + el.width / 2,
    y: el.y + el.height / 2,
    offsetX: el.width / 2,
    offsetY: el.height / 2,
    rotation: el.rotation ?? 0,
    draggable: true,
    onMouseDown: onSelect,
    onTap: onSelect,
    onDragStart: onSelect,
    dragBoundFunc(pos: { x: number; y: number }) {
      // pos = centre, en pixels écran → repère 400
      let cx = pos.x / scale;
      let cy = pos.y / scale;
      const c = clampToZone({ x: cx - el.width / 2, y: cy - el.height / 2, width: el.width, height: el.height, rotation: el.rotation }, zone);
      cx = c.x + el.width / 2;
      cy = c.y + el.height / 2;
      // Aimantation au centre de la zone
      const v = Math.abs(cx - zcx) < SNAP;
      const h = Math.abs(cy - zcy) < SNAP;
      if (v) cx = zcx;
      if (h) cy = zcy;
      onGuides({ v, h });
      return { x: cx * scale, y: cy * scale };
    },
    onDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      onGuides(null);
      onChange({ x: e.target.x() - el.width / 2, y: e.target.y() - el.height / 2 });
    },
    onTransformEnd(e: Konva.KonvaEventObject<Event>) {
      const node = e.target;
      const sx = Math.abs(node.scaleX());
      const rotation = Math.round(node.rotation() * 10) / 10;
      node.scaleX(1);
      node.scaleY(1);
      const cx = node.x();
      const cy = node.y();
      if (el.type === "image") {
        const width = el.width * sx;
        const height = el.height * sx;
        onChange({ width, height, rotation, ...clampToZone({ x: cx - width / 2, y: cy - height / 2, width, height, rotation }, zone) });
      } else {
        onChange({ rotation, fontSize: (el.fontSize ?? 20) * sx });
      }
    },
  };

  if (el.type === "image") {
    return img ? <KImage {...common} image={img} width={el.width} height={el.height} /> : null;
  }
  const style = [el.italic ? "italic" : "", el.bold === false ? "normal" : "bold"].filter(Boolean).join(" ");
  return (
    <KText
      {...common}
      ref={textRef}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle={style}
      letterSpacing={el.letterSpacing ?? 0}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.stroke ? Math.max(0.6, (el.fontSize ?? 20) * 0.06) : 0}
      fillAfterStrokeEnabled
    />
  );
}
